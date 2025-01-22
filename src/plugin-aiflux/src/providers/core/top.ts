import { IAgentRuntime, Memory, Provider, State, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";

export function getCoreTopMinersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Top Miners provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Top Miners provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Top Miners provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:top_miners`;

            try {
                const cachedStat = (await cache.get(cacheKey)) as string;
                elizaLogger.debug("[CoreProvider] Cache check for Top Miners:", {
                    hasCachedData: cachedStat !== null
                });
                if (cachedStat) {
                    return cachedStat;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Top Miners data");
                const stat = await confluxScan.getFormattedTopMiners();
                const statText = `Top Miners:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Top Miners data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Top Miners provider:", error);
                return null;
            }
        },
    };
}

export function getCoreTopGasUsedProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Top Gas Used provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Top Gas Used provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Top Gas Used provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:top_gas_used`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Top Gas Used:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Top Gas Used data");
                const stat = await confluxScan.getFormattedTopGasUsed();
                const statText = `Top Gas Users:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Top Gas Used data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Top Gas Used provider:", error);
                return null;
            }
        },
    };
}

export function getCoreTopCfxSendersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Top CFX Senders provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Top CFX Senders provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Top CFX Senders provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:top_cfx_senders`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Top CFX Senders:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Top CFX Senders data");
                const stat = await confluxScan.getFormattedTopCfxSenders();
                const statText = `Top CFX Senders:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Top CFX Senders data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Top CFX Senders provider:", error);
                return null;
            }
        },
    };
}

export function getCoreTopCfxReceiversProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Top CFX Receivers provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Top CFX Receivers provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Top CFX Receivers provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:top_cfx_receivers`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Top CFX Receivers:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Top CFX Receivers data");
                const stat = await confluxScan.getFormattedTopCfxReceivers();
                const statText = `Top CFX Receivers:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Top CFX Receivers data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Top CFX Receivers provider:", error);
                return null;
            }
        },
    };
}

export function getCoreTopTransactionSendersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Top Transaction Senders provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Top Transaction Senders provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Top Transaction Senders provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:top_tx_senders`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Top Transaction Senders:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Top Transaction Senders data");
                const stat = await confluxScan.getFormattedTopTransactionSenders();
                const statText = `Top Transaction Senders:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Top Transaction Senders data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Top Transaction Senders provider:", error);
                return null;
            }
        },
    };
}

export function getCoreTopTransactionReceiversProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Top Transaction Receivers provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Top Transaction Receivers provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Top Transaction Receivers provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:top_tx_receivers`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Top Transaction Receivers:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Top Transaction Receivers data");
                const stat = await confluxScan.getFormattedTopTransactionReceivers();
                const statText = `Top Transaction Receivers:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Top Transaction Receivers data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Top Transaction Receivers provider:", error);
                return null;
            }
        },
    };
}
