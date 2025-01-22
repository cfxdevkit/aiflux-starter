import { IAgentRuntime, Memory, Provider, State, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";

export function getCoreActiveAccountsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Active Accounts provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Active Accounts provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Active Accounts provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:active_accounts`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Active Accounts:", {
                    provider: "core-stats",
                    statType: "active-accounts",
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Active Accounts data");
                const stat = await confluxScan.getFormattedActiveAccountStats();
                const statText = `Active Accounts:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Active Accounts data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Active Accounts provider:", error);
                return null;
            }
        },
    };
}

export function getCoreCfxHoldersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] CFX Holders provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] CFX Holders provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] CFX Holders provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:cfx_holders`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for CFX Holders:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh CFX Holders data");
                const stat = await confluxScan.getFormattedCfxHolderStats();
                const statText = `CFX Holders:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached CFX Holders data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core CFX Holders provider:", error);
                return null;
            }
        },
    };
}

export function getCoreAccountGrowthProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Account Growth provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Account Growth provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Account Growth provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:account_growth`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Account Growth:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Account Growth data");
                const stat = await confluxScan.getFormattedAccountGrowthStats();
                const statText = `Account Growth:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Account Growth data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Account Growth provider:", error);
                return null;
            }
        },
    };
}

export function getCoreContractsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Contracts provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Contracts provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Contracts provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:contracts`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Contracts:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Contracts data");
                const stat = await confluxScan.getFormattedContractStats();
                const statText = `Contracts:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Contracts data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Contracts provider:", error);
                return null;
            }
        },
    };
}

export function getCoreSupplyProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Supply provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Supply provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Supply provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:supply`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Supply:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Supply data");
                const stat = await confluxScan.getFormattedSupplyStats();
                const statText = `Supply:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Supply data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Supply provider:", error);
                return null;
            }
        },
    };
}

export function getCoreTransactionsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] Transactions provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] Transactions provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] Transactions provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:transactions`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for Transactions:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh Transactions data");
                const stat = await confluxScan.getFormattedTransactionStats();
                const statText = `Transactions:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached Transactions data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core Transactions provider:", error);
                return null;
            }
        },
    };
}

export function getCoreCfxTransfersProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] CFX Transfers provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] CFX Transfers provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] CFX Transfers provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:cfx_transfers`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for CFX Transfers:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh CFX Transfers data");
                const stat = await confluxScan.getFormattedCfxTransferStats();
                const statText = `CFX Transfers:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached CFX Transfers data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core CFX Transfers provider:", error);
                return null;
            }
        },
    };
}

export function getCoreTpsProvider(
    config: ValidatedConfig
): Provider | null {
    if (!config.coreConfluxScan) {
        elizaLogger.debug("[CoreProvider] TPS provider not initialized - missing config");
        return null;
    }
    elizaLogger.debug("[CoreProvider] TPS provider initialized");

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            elizaLogger.debug("[CoreProvider] TPS provider get method called");
            const cache = runtime.cacheManager;
            const cacheKey = `conflux:core:confluxscan:tps`;

            try {
                const cachedStat = await cache.get(cacheKey);
                elizaLogger.debug("[CoreProvider] Cache check for TPS:", {
                    hasCachedData: cachedStat !== null
                });

                if (cachedStat) {
                    return cachedStat as string;
                }

                elizaLogger.debug("[CoreProvider] Fetching fresh TPS data");
                const stat = await confluxScan.getFormattedTpsStats();
                const statText = `TPS:\n${stat}`;

                await cache.set(cacheKey, statText, { expires: 21600 });
                elizaLogger.debug("[CoreProvider] Successfully cached TPS data");
                return statText;
            } catch (error) {
                elizaLogger.error("Error in Core TPS provider:", error);
                return null;
            }
        },
    };
}
