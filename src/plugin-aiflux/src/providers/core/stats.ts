import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { CACHE_KEYS, withCache, logOperation } from "../../utils/cache/config";

export function getCoreActiveAccountsProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Active Accounts provider not initialized - missing config", {
            provider: "core-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.ACTIVE_ACCOUNTS,
        });
        return null;
    }
    logOperation("info", "Active Accounts provider initialized", {
        provider: "core-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.ACTIVE_ACCOUNTS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.ACTIVE_ACCOUNTS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getActiveAccountStats()).formatted;
                    return `Active Accounts:\n${stat}`;
                },
                { provider: "core-stats", operation: "get-active-accounts" }
            );
        },
    };
}

export function getCoreCfxHoldersProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "CFX Holders provider not initialized - missing config", {
            provider: "core-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.CFX_HOLDERS,
        });
        return null;
    }
    logOperation("info", "CFX Holders provider initialized", {
        provider: "core-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.CFX_HOLDERS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.CFX_HOLDERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getCfxHolderStats()).formatted;
                    return `CFX Holders:\n${stat}`;
                },
                { provider: "core-stats", operation: "get-cfx-holders" }
            );
        },
    };
}

export function getCoreAccountGrowthProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Account Growth provider not initialized - missing config", {
            provider: "core-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.ACCOUNT_GROWTH,
        });
        return null;
    }
    logOperation("info", "Account Growth provider initialized", {
        provider: "core-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.ACCOUNT_GROWTH,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.ACCOUNT_GROWTH;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getAccountGrowthStats()).formatted;
                    return `Account Growth:\n${stat}`;
                },
                { provider: "core-stats", operation: "get-account-growth" }
            );
        },
    };
}

export function getCoreContractsProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Contracts provider not initialized - missing config", {
            provider: "core-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.CONTRACTS,
        });
        return null;
    }
    logOperation("info", "Contracts provider initialized", {
        provider: "core-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.CONTRACTS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.CONTRACTS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getContractStats()).formatted;
                    return `Contracts:\n${stat}`;
                },
                { provider: "core-stats", operation: "get-contracts" }
            );
        },
    };
}

export function getCoreSupplyProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Supply provider not initialized - missing config", {
            provider: "core-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.SUPPLY,
        });
        return null;
    }
    logOperation("info", "Supply provider initialized", {
        provider: "core-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.SUPPLY,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.SUPPLY;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getSupplyStats()).formatted;
                    return `Supply:\n${stat}`;
                },
                { provider: "core-stats", operation: "get-supply" }
            );
        },
    };
}

export function getCoreTransactionsProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Transactions provider not initialized - missing config", {
            provider: "core-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.TRANSACTIONS,
        });
        return null;
    }
    logOperation("info", "Transactions provider initialized", {
        provider: "core-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.TRANSACTIONS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.TRANSACTIONS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTransactionStats()).formatted;
                    return `Transactions:\n${stat}`;
                },
                { provider: "core-stats", operation: "get-transactions" }
            );
        },
    };
}

export function getCoreCfxTransfersProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "CFX Transfers provider not initialized - missing config", {
            provider: "core-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.CFX_TRANSFERS,
        });
        return null;
    }
    logOperation("info", "CFX Transfers provider initialized", {
        provider: "core-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.CFX_TRANSFERS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.CFX_TRANSFERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getCfxTransferStats()).formatted;
                    return `CFX Transfers:\n${stat}`;
                },
                { provider: "core-stats", operation: "get-cfx-transfers" }
            );
        },
    };
}

export function getCoreTpsProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "TPS provider not initialized - missing config", {
            provider: "core-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.TPS,
        });
        return null;
    }
    logOperation("info", "TPS provider initialized", {
        provider: "core-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.TPS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.TPS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTpsStats({ intervalType: "hour" }))
                        .formatted;
                    return `TPS:\n${stat}`;
                },
                { provider: "core-stats", operation: "get-tps" }
            );
        },
    };
}
