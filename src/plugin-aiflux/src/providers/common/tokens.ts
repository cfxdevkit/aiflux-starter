import { IAgentRuntime, Memory, Provider, State, elizaLogger } from "@elizaos/core";
import { TokenListManager } from "../../utils/config/tokenList";
import { TokenInfo, TokenList } from "../../utils/config/types";
import { ValidatedConfig } from "../../utils/config/configValidator";

const CACHE_DURATION = 1800; // 30 minutes

export function getTokensProvider(config: ValidatedConfig): Provider | null {
    if (!config.geckoTerminal || !config.tokenListManager) {
        elizaLogger.error("Missing required configuration for tokens provider");
        return null;
    }

    const tokenListManager = config.tokenListManager;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cache = runtime.cacheManager;
            const cacheKey = "conflux:espace:tokens";

            try {
                const cachedData = await cache.get(cacheKey);
                elizaLogger.debug("Tokens provider cache check:", {
                    provider: "tokens",
                    hasCachedData: cachedData !== null
                });

                if (cachedData) {
                    return cachedData as string;
                }

                // Get the current token list without triggering a reload
                const tokenList = tokenListManager.getTokenList();
                if (!tokenList || Object.keys(tokenList).length === 0) {
                    elizaLogger.error("Token list is empty or undefined");
                    return null;
                }

                // Format tokens without triggering any API calls
                const formattedTokens = tokenListManager.formatTokensToText(Object.values(tokenList), config.target);
                if (!formattedTokens) {
                    elizaLogger.error("Failed to format token list");
                    return null;
                }

                await cache.set(cacheKey, formattedTokens, { expires: CACHE_DURATION });
                elizaLogger.debug("Token data cached successfully", {
                    provider: "tokens",
                    cacheKey,
                    cacheDuration: CACHE_DURATION,
                    tokenCount: Object.keys(tokenList).length
                });

                return formattedTokens;
            } catch (error) {
                elizaLogger.error("Error in tokens provider:", error);
                return null;
            }
        }
    };
}
