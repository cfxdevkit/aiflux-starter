import { Provider, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";

/**
 * Configuration interface for the provider
 * This is an example using token provider configuration
 */
interface ProviderConfig {
    // Example: Service for fetching token prices/info
    dataService?: any;
    // Example: Service for managing data
    dataManager?: any;
    // Cache duration in seconds
    cacheDuration?: number;
}

/**
 * Template for creating a provider
 * This example shows a token provider implementation
 *
 * @param config - Configuration object for the provider
 * @returns Provider object or null if required services are not configured
 *
 * Usage example:
 * const provider = getProvider({
 *   dataService: myDataService,
 *   dataManager: myDataManager,
 *   cacheDuration: 1200
 * });
 */
export function getProvider(config: ProviderConfig): Provider | null {
    // Validate required configuration
    if (!config.dataService || !config.dataManager) {
        return null;
    }

    // Default cache duration: 20 minutes
    const cacheDuration = config.cacheDuration || 1200;

    return {
        /**
         * Retrieves data from the provider
         * Example shows token information retrieval
         *
         * @param runtime - Agent runtime environment
         * @param message - Memory object containing the message context
         * @param state - Current state of the conversation
         * @returns Formatted data as string or null if operation fails
         */
        get: async (
            runtime: IAgentRuntime,
            message: Memory,
            state?: State
        ): Promise<string | null> => {
            const cache = runtime.cacheManager;
            const cacheKey = "namespace:provider:data";

            try {
                // 1. Check cache first
                const cachedData = (await cache.get(cacheKey)) as string;
                if (cachedData) {
                    return cachedData;
                }

                // 2. Fetch fresh data if cache miss
                // Add your data fetching logic here
                const formattedData = config.dataManager.formatToText();

                // 3. Cache the results
                await cache.set(cacheKey, formattedData, {
                    expires: cacheDuration,
                });

                return formattedData;
            } catch (error) {
                // Error handling
                elizaLogger.error("Error in provider:", error);
                return null;
            }
        },

        /**
         * Optional: Add additional methods as needed
         * For example: update, delete, or specific operations
         */
    };
}
