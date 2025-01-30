import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { CACHE_KEYS, withCache, logOperation } from "../../utils/cache/config";

export function getTokensProvider(config: ValidatedConfig): Provider | null {
    if (!config.geckoTerminal || !config.tokenListManager) {
        logOperation("info", "Tokens provider not initialized - missing config", {
            provider: "tokens",
            operation: "initialization",
            cacheKey: CACHE_KEYS.DEFI.TOKENS,
        });
        return null;
    }

    const tokenListManager = config.tokenListManager;

    logOperation("info", "Tokens provider initialized", {
        provider: "tokens",
        operation: "initialization",
        cacheKey: CACHE_KEYS.DEFI.TOKENS,
    });

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.DEFI.TOKENS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const tokenList = tokenListManager.getTokenList();
                    if (!tokenList || Object.keys(tokenList).length === 0) {
                        return null;
                    }
                    return tokenListManager.formatTokensToText(
                        Object.values(tokenList),
                        config.target
                    );
                },
                { provider: "tokens", operation: "get-tokens" }
            );
        },
    };
}
