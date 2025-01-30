import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { CACHE_KEYS, withCache, logOperation } from "../../utils/cache/config";

export function getEspaceActiveAccountsProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "Active Accounts provider not initialized - missing config", {
            provider: "espace-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.ACTIVE_ACCOUNTS,
        });
        return null;
    }
    logOperation("info", "Active Accounts provider initialized", {
        provider: "espace-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.ACTIVE_ACCOUNTS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.ACTIVE_ACCOUNTS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getActiveAccountStats()).formatted;
                    return `Active Accounts:\n${stat}`;
                },
                { provider: "espace-stats", operation: "get-active-accounts" }
            );
        },
    };
}

export function getEspaceCfxHoldersProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "CFX Holders provider not initialized - missing config", {
            provider: "espace-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.CFX_HOLDERS,
        });
        return null;
    }
    logOperation("info", "CFX Holders provider initialized", {
        provider: "espace-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.CFX_HOLDERS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.CFX_HOLDERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getCfxHolderStats()).formatted;
                    return `CFX Holders:\n${stat}`;
                },
                { provider: "espace-stats", operation: "get-cfx-holders" }
            );
        },
    };
}

export function getEspaceAccountGrowthProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "Account Growth provider not initialized - missing config", {
            provider: "espace-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.ACCOUNT_GROWTH,
        });
        return null;
    }
    logOperation("info", "Account Growth provider initialized", {
        provider: "espace-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.ACCOUNT_GROWTH,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.ACCOUNT_GROWTH;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getAccountGrowthStats()).formatted;
                    return `Account Growth:\n${stat}`;
                },
                { provider: "espace-stats", operation: "get-account-growth" }
            );
        },
    };
}

export function getEspaceContractsProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "Contracts provider not initialized - missing config", {
            provider: "espace-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.CONTRACTS,
        });
        return null;
    }
    logOperation("info", "Contracts provider initialized", {
        provider: "espace-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.CONTRACTS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.CONTRACTS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getContractStats()).formatted;
                    return `Contracts:\n${stat}`;
                },
                { provider: "espace-stats", operation: "get-contracts" }
            );
        },
    };
}

export function getEspaceTransactionsProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "Transactions provider not initialized - missing config", {
            provider: "espace-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.TRANSACTIONS,
        });
        return null;
    }
    logOperation("info", "Transactions provider initialized", {
        provider: "espace-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.TRANSACTIONS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.TRANSACTIONS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTransactionStats()).formatted;
                    return `Transactions:\n${stat}`;
                },
                { provider: "espace-stats", operation: "get-transactions" }
            );
        },
    };
}

export function getEspaceCfxTransfersProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "CFX Transfers provider not initialized - missing config", {
            provider: "espace-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.CFX_TRANSFERS,
        });
        return null;
    }
    logOperation("info", "CFX Transfers provider initialized", {
        provider: "espace-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.CFX_TRANSFERS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.CFX_TRANSFERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getCfxTransferStats()).formatted;
                    return `CFX Transfers:\n${stat}`;
                },
                { provider: "espace-stats", operation: "get-cfx-transfers" }
            );
        },
    };
}

export function getEspaceTpsProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "TPS provider not initialized - missing config", {
            provider: "espace-stats",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.TPS,
        });
        return null;
    }
    logOperation("info", "TPS provider initialized", {
        provider: "espace-stats",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.TPS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.TPS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTpsStats({ intervalType: "hour" }))
                        .formatted;
                    return `TPS:\n${stat}`;
                },
                { provider: "espace-stats", operation: "get-tps" }
            );
        },
    };
}
