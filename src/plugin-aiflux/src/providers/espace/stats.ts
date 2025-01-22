import { IAgentRuntime, Memory, Provider, State, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";

export function getEspaceActiveAccountsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Active Accounts provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Active Accounts provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Active Accounts provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:active_accounts`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Active Accounts:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Active Accounts data");
                const stat = await confluxScan.getFormattedActiveAccountStats();
                const statText = `Active Accounts:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Active Accounts data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Active Accounts provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceCfxHoldersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] CFX Holders provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] CFX Holders provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] CFX Holders provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:cfx_holders`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for CFX Holders:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh CFX Holders data");
                const stat = await confluxScan.getFormattedCfxHolderStats();
                const statText = `CFX Holders:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached CFX Holders data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace CFX Holders provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceAccountGrowthProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Account Growth provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Account Growth provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Account Growth provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:account_growth`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Account Growth:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Account Growth data");
                const stat = await confluxScan.getFormattedAccountGrowthStats();
                const statText = `Account Growth:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Account Growth data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Account Growth provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceContractsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Contracts provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Contracts provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Contracts provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:contracts`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Contracts:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Contracts data");
                const stat = await confluxScan.getFormattedContractStats();
                const statText = `Contracts:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Contracts data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Contracts provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceTransactionsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] Transactions provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] Transactions provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] Transactions provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:transactions`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for Transactions:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh Transactions data");
                const stat = await confluxScan.getFormattedTransactionStats();
                const statText = `Transactions:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached Transactions data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace Transactions provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceCfxTransfersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] CFX Transfers provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] CFX Transfers provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] CFX Transfers provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:cfx_transfers`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for CFX Transfers:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh CFX Transfers data");
                const stat = await confluxScan.getFormattedCfxTransferStats();
                const statText = `CFX Transfers:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached CFX Transfers data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace CFX Transfers provider:", error);
                return null;
            }
        },
    };
}

export function getEspaceTpsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.espaceConfluxScan) {
        elizaLogger.debug("[eSpaceProvider] TPS provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[eSpaceProvider] TPS provider initialized");

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[eSpaceProvider] TPS provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:espace:confluxscan:tps`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[eSpaceProvider] Cache check for TPS:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[eSpaceProvider] Fetching fresh TPS data");
                const stat = await confluxScan.getFormattedTpsStats();
                const statText = `TPS:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[eSpaceProvider] Successfully cached TPS data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in eSpace TPS provider:", error);
                return null;
            }
        },
    };
}
