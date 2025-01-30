import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { CACHE_KEYS, withCache, logOperation } from "../../utils/cache/config";

export function getGeckoTerminalProvider(config: ValidatedConfig): Provider | null {
    if (!config.geckoTerminal || !config.tokenListManager) {
        logOperation("info", "GeckoTerminal provider not initialized - missing config", {
            provider: "geckoterminal",
            operation: "initialization",
            cacheKey: CACHE_KEYS.DEFI.GECKO_TERMINAL,
        });
        return null;
    }

    const tokenListManager = config.tokenListManager;

    logOperation("info", "GeckoTerminal provider initialized", {
        provider: "geckoterminal",
        operation: "initialization",
        cacheKey: CACHE_KEYS.DEFI.GECKO_TERMINAL,
    });

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.DEFI.GECKO_TERMINAL;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const pools = tokenListManager.getPools();
                    if (!pools || pools.length === 0) {
                        return null;
                    }
                    return tokenListManager.formatPoolsToText(pools);
                },
                { provider: "geckoterminal", operation: "get-top-pools" }
            );
        },
    };
}
