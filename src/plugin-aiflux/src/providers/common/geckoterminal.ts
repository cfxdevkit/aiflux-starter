import { IAgentRuntime, Memory, Provider, State, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";

export function getGeckoTerminalProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.geckoTerminal || !config.tokenListManager) {
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
            const cacheKey = `conflux:espace:geckoterminal`;

            try {
                // Check cache first
                const cachedPools = await cache.get(cacheKey);
                elizaLogger.debug("GeckoTerminal provider cache check:", {
                    provider: "geckoterminal",
                    hasCachedData: cachedPools !== null
                });

                if (cachedPools) {
                    return cachedPools as string;
                }

                // Get pools from the existing token list
                const pools = tokenListManager.getPools();
                if (!pools || pools.length === 0) {
                    elizaLogger.error("No pools found in token list manager");
                    return null;
                }

                // Format pools without triggering a reload
                const topPoolsText = tokenListManager.formatPoolsToText(pools);
                if (!topPoolsText) {
                    elizaLogger.error("Failed to format pools text");
                    return null;
                }

                // Cache pools info for 30 minutes
                await cache.set(cacheKey, topPoolsText, { expires: 1800 });

                return topPoolsText;
            } catch (error) {
                elizaLogger.error("Error in GeckoTerminal provider:", error);
                return null;
            }
        },
    };
}
