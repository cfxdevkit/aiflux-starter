import type { Plugin } from "@elizaos/core";
import { ConfluxActions } from "./actions";
import { ConfluxEvaluators } from "./evaluators";
import { ConfluxProviders } from "./providers";
import { validateConfig } from "./utils";
async function createConfluxPlugin(
    getSetting: (key: string) => string | undefined
): Promise<Plugin | null> {
    const config = await validateConfig(getSetting);

    if (!config) {
        return null;
    }

    const actions = new ConfluxActions(config);
    const providers = new ConfluxProviders(config);
    const evaluators = new ConfluxEvaluators(config);

    return {
        name: "conflux",
        description:
            "Plugin for interacting with the Conflux network, supporting both Core Space and eSpace.",
        providers: providers.getAllProviders(),
        evaluators: evaluators.getAllEvaluators(),
        actions: actions.getAllActions(),
        services: [],
    };
}

export default createConfluxPlugin;
