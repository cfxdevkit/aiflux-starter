import { DirectClient } from "@elizaos/client-direct";
import {
    AgentRuntime,
    elizaLogger,
    settings,
    stringToUuid,
    type Character,
    Plugin,
} from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { createNodePlugin } from "@elizaos/plugin-node";
import createAIfluxPlugin from "@elizaos/plugin-aiflux";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDbCache } from "./cache/index.ts";
import { character } from "./character.ts";
import { startChat } from "./chat/index.ts";
import { initializeClients } from "./clients/index.ts";
import { getTokenForProvider, loadCharacters, parseArguments } from "./config/index.ts";
import { initializeDatabase } from "./database/index.ts";
import type { PostgresDatabaseAdapter } from "@elizaos/adapter-postgres";
import type { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import type { CacheManager, DbCacheAdapter } from "@elizaos/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
    const waitTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    return new Promise((resolve) => setTimeout(resolve, waitTime));
};

let nodePlugin: Plugin | undefined;

export async function createAgent(
    character: Character,
    db: PostgresDatabaseAdapter | SqliteDatabaseAdapter,
    cache: CacheManager<DbCacheAdapter>,
    token: string
) {
    elizaLogger.success(
        elizaLogger.successesTitle,
        "Creating runtime for character",
        character.name
    );

    nodePlugin ??= createNodePlugin();

    const confluxPlugin = await createAIfluxPlugin((key: string) => {
        return character.settings?.secrets?.[key] || process.env[key];
    });

    return new AgentRuntime({
        databaseAdapter: db,
        token,
        modelProvider: character.modelProvider,
        evaluators: [],
        character,
        plugins: [bootstrapPlugin, nodePlugin, confluxPlugin].filter(Boolean),
        providers: [],
        actions: [],
        services: [],
        managers: [],
        cacheManager: cache,
    });
}

async function startAgent(character: Character, directClient: DirectClient) {
    try {
        character.id ??= stringToUuid(character.name);
        character.username ??= character.name;

        const token = getTokenForProvider(character.modelProvider, character);
        const dataDir = path.join(__dirname, "../data");

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const db = initializeDatabase(dataDir);
        await db.init();

        const cache = initializeDbCache(character, db);
        const runtime = await createAgent(character, db, cache, token);

        await runtime.initialize();
        runtime.clients = await initializeClients(character, runtime);
        directClient.registerAgent(runtime);

        elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

        return runtime;
    } catch (error) {
        elizaLogger.error(`Error starting agent for character ${character.name}:`, error);
        console.error(error);
        throw error;
    }
}

const checkPortAvailable = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "EADDRINUSE") {
                resolve(false);
            }
        });

        server.once("listening", () => {
            server.close();
            resolve(true);
        });

        server.listen(port);
    });
};

const startAgents = async () => {
    const directClient = new DirectClient();
    let serverPort = parseInt(settings.SERVER_PORT || "3000");
    const args = parseArguments();

    const charactersArg = args.characters || args.character;
    let characters = [character];

    console.log("charactersArg", charactersArg);
    if (charactersArg) {
        characters = await loadCharacters(charactersArg);
    }
    console.log("characters", characters);
    try {
        for (const character of characters) {
            await startAgent(character, directClient as DirectClient);
        }
    } catch (error) {
        elizaLogger.error("Error starting agents:", error);
    }

    while (!(await checkPortAvailable(serverPort))) {
        elizaLogger.warn(`Port ${serverPort} is in use, trying ${serverPort + 1}`);
        serverPort++;
    }

    // upload some agent functionality into directClient
    directClient.startAgent = async (character: Character) => {
        // wrap it so we don't have to inject directClient later
        return startAgent(character, directClient);
    };

    directClient.start(serverPort);

    if (serverPort !== parseInt(settings.SERVER_PORT || "3000")) {
        elizaLogger.log(`Server started on alternate port ${serverPort}`);
    }

    const isDaemonProcess = process.env.DAEMON_PROCESS === "true";
    if (!isDaemonProcess) {
        elizaLogger.log("Chat started. Type 'exit' to quit.");
        const chat = startChat(characters);
        chat();
    }
};

startAgents().catch((error) => {
    elizaLogger.error("Unhandled error in startAgents:", error);
    process.exit(1);
});
