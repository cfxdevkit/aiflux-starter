import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { CACHE_KEYS, withCache, logOperation } from "../../utils/cache/config";

export function getESpaceTopGasUsersProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "Top Gas Users provider not initialized - missing config", {
            provider: "espace-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.TOP_GAS_USED,
        });
        return null;
    }
    logOperation("info", "Top Gas Users provider initialized", {
        provider: "espace-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.TOP_GAS_USED,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.TOP_GAS_USED;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopGasUsed()).formatted;
                    return `Top Gas Users:\n${stat}`;
                },
                { provider: "espace-top", operation: "get-top-gas-users" }
            );
        },
    };
}

export function getESpaceTopCfxSendersProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "Top CFX Senders provider not initialized - missing config", {
            provider: "espace-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.TOP_CFX_SENDERS,
        });
        return null;
    }
    logOperation("info", "Top CFX Senders provider initialized", {
        provider: "espace-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.TOP_CFX_SENDERS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.TOP_CFX_SENDERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopCfxSenders()).formatted;
                    return `Top CFX Senders:\n${stat}`;
                },
                { provider: "espace-top", operation: "get-top-cfx-senders" }
            );
        },
    };
}

export function getESpaceTopCfxReceiversProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "Top CFX Receivers provider not initialized - missing config", {
            provider: "espace-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.TOP_CFX_RECEIVERS,
        });
        return null;
    }
    logOperation("info", "Top CFX Receivers provider initialized", {
        provider: "espace-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.TOP_CFX_RECEIVERS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.TOP_CFX_RECEIVERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopCfxReceivers()).formatted;
                    return `Top CFX Receivers:\n${stat}`;
                },
                { provider: "espace-top", operation: "get-top-cfx-receivers" }
            );
        },
    };
}

export function getESpaceTopTransactionSendersProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation("info", "Top Transaction Senders provider not initialized - missing config", {
            provider: "espace-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.ESPACE.TOP_TX_SENDERS,
        });
        return null;
    }
    logOperation("info", "Top Transaction Senders provider initialized", {
        provider: "espace-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.TOP_TX_SENDERS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.TOP_TX_SENDERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopTransactionSenders()).formatted;
                    return `Top Transaction Senders:\n${stat}`;
                },
                { provider: "espace-top", operation: "get-top-tx-senders" }
            );
        },
    };
}

export function getESpaceTopTransactionReceiversProvider(config: ValidatedConfig): Provider | null {
    if (!config.espaceConfluxScan) {
        logOperation(
            "debug",
            "Top Transaction Receivers provider not initialized - missing config",
            {
                provider: "espace-top",
                operation: "initialization",
                cacheKey: CACHE_KEYS.ESPACE.TOP_TX_RECEIVERS,
            }
        );
        return null;
    }
    logOperation("info", "Top Transaction Receivers provider initialized", {
        provider: "espace-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.ESPACE.TOP_TX_RECEIVERS,
    });

    const confluxScan = config.espaceConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.ESPACE.TOP_TX_RECEIVERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopTransactionReceivers()).formatted;
                    return `Top Transaction Receivers:\n${stat}`;
                },
                { provider: "espace-top", operation: "get-top-tx-receivers" }
            );
        },
    };
}
