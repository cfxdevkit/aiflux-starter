import type {
    Plugin,
    Provider,
    Evaluator,
    Action,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";

// Simple example provider
const exampleProvider: Provider = {
    get: async (_runtime: IAgentRuntime, _message: Memory): Promise<string | null> => {
        return "Example provider data";
    },
};

// Simple example evaluator
const exampleEvaluator: Evaluator = {
    name: "example-evaluator",
    description: "A simple example evaluator",
    similes: ["check", "evaluate"],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        return message.content?.text?.toLowerCase().includes("check") ?? false;
    },
    handler: async (_runtime: IAgentRuntime, message: Memory, _state: State) => {
        return {
            score: message.content?.text?.toLowerCase().includes("check") ? 1 : 0,
            reason: "Simple check evaluation",
        };
    },
    examples: [
        {
            context: "Example request",
            messages: [
                {
                    user: "user1",
                    content: {
                        text: "update data",
                    },
                },
            ],
            outcome: "Request evaluation.",
        },
    ],
};

// Simple example action
const exampleAction: Action = {
    name: "EXAMPLE_ACTION",
    description: "A simple example action",
    similes: ["do", "perform"],
    suppressInitialMessage: true,
    validate: async () => true,
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        callback: (response: { text: string }, attachments: unknown[]) => void
    ) => {
        callback({ text: "Example action executed!" }, []);
        return true;
    },
    examples: [],
};

async function createAIfluxPlugin(
    getSetting: (key: string) => string | undefined
): Promise<Plugin | null> {
    const config = getSetting("VARIABLE_FROM_ENV_OR_CHARACTER_CONFIG");

    if (!config) {
        return null;
    }

    return {
        name: "conflux",
        description:
            "Plugin for interacting with the Conflux network, supporting both Core Space and eSpace.",
        providers: [exampleProvider],
        evaluators: [exampleEvaluator],
        actions: [exampleAction],
        services: [],
    };
}

export default createAIfluxPlugin;
