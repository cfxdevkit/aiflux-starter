import { IAgentRuntime, Memory, Provider, State, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";

export function getEspaceTopGasUsedProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Top Gas Used provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Top Gas Used provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Top Gas Used provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:top_gas_used`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Top Gas Used:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Top Gas Used data");
                const stat = await confluxScan.getFormattedTopGasUsed();
                const statText = `Top Gas Users:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Top Gas Used data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Top Gas Used provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceTopCfxSendersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Top CFX Senders provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Top CFX Senders provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Top CFX Senders provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:top_cfx_senders`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Top CFX Senders:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Top CFX Senders data");
                const stat = await confluxScan.getFormattedTopCfxSenders();
                const statText = `Top CFX Senders:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Top CFX Senders data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Top CFX Senders provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceTopCfxReceiversProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Top CFX Receivers provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Top CFX Receivers provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Top CFX Receivers provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:top_cfx_receivers`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Top CFX Receivers:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Top CFX Receivers data");
                const stat = await confluxScan.getFormattedTopCfxReceivers();
                const statText = `Top CFX Receivers:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Top CFX Receivers data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Top CFX Receivers provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceTopTransactionSendersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Top Transaction Senders provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Top Transaction Senders provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Top Transaction Senders provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:top_tx_senders`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Top Transaction Senders:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Top Transaction Senders data");
                const stat = await confluxScan.getFormattedTopTransactionSenders();
                const statText = `Top Transaction Senders:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Top Transaction Senders data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Top Transaction Senders provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceTopTransactionReceiversProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Top Transaction Receivers provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Top Transaction Receivers provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Top Transaction Receivers provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:top_tx_receivers`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Top Transaction Receivers:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Top Transaction Receivers data");
                const stat = await confluxScan.getFormattedTopTransactionReceivers();
                const statText = `Top Transaction Receivers:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Top Transaction Receivers data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Top Transaction Receivers provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceTopTokenParticipantsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Top Token Participants provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Top Token Participants provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Top Token Participants provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:top_token_participants`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Top Token Participants:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Top Token Participants data");
                const stat = await confluxScan.getFormattedTopTokenParticipants();
                const statText = `Top Token Participants:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Top Token Participants data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Top Token Participants provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceTopTokenTransfersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Top Token Transfers provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Top Token Transfers provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Top Token Transfers provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:top_token_transfers`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Top Token Transfers:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Top Token Transfers data");
                const stat = await confluxScan.getFormattedTopTokenTransfers();
                const statText = `Top Token Transfers:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Top Token Transfers data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Top Token Transfers provider:", error);
                return null;
            }
        },
    };
}
