import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { CACHE_KEYS, withCache, logOperation } from "../../utils/cache/config";

export function getCoreTopMinersProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Top Miners provider not initialized - missing config", {
            provider: "core-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.TOP_MINERS,
        });
        return null;
    }
    logOperation("info", "Top Miners provider initialized", {
        provider: "core-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.TOP_MINERS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.TOP_MINERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopMiners()).formatted;
                    return `Top Miners:\n${stat}`;
                },
                { provider: "core-top", operation: "get-top-miners" }
            );
        },
    };
}

export function getCoreTopGasUsedProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Top Gas Used provider not initialized - missing config", {
            provider: "core-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.TOP_GAS_USED,
        });
        return null;
    }
    logOperation("info", "Top Gas Used provider initialized", {
        provider: "core-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.TOP_GAS_USED,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.TOP_GAS_USED;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopGasUsed()).formatted;
                    return `Top Gas Users:\n${stat}`;
                },
                { provider: "core-top", operation: "get-top-gas-used" }
            );
        },
    };
}

export function getCoreTopCfxSendersProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Top CFX Senders provider not initialized - missing config", {
            provider: "core-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.TOP_CFX_SENDERS,
        });
        return null;
    }
    logOperation("info", "Top CFX Senders provider initialized", {
        provider: "core-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.TOP_CFX_SENDERS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.TOP_CFX_SENDERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopCfxSenders()).formatted;
                    return `Top CFX Senders:\n${stat}`;
                },
                { provider: "core-top", operation: "get-top-cfx-senders" }
            );
        },
    };
}

export function getCoreTopCfxReceiversProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Top CFX Receivers provider not initialized - missing config", {
            provider: "core-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.TOP_CFX_RECEIVERS,
        });
        return null;
    }
    logOperation("info", "Top CFX Receivers provider initialized", {
        provider: "core-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.TOP_CFX_RECEIVERS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.TOP_CFX_RECEIVERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopCfxReceivers()).formatted;
                    return `Top CFX Receivers:\n${stat}`;
                },
                { provider: "core-top", operation: "get-top-cfx-receivers" }
            );
        },
    };
}

export function getCoreTopTransactionSendersProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation("info", "Top Transaction Senders provider not initialized - missing config", {
            provider: "core-top",
            operation: "initialization",
            cacheKey: CACHE_KEYS.CORE.TOP_TX_SENDERS,
        });
        return null;
    }
    logOperation("info", "Top Transaction Senders provider initialized", {
        provider: "core-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.TOP_TX_SENDERS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.TOP_TX_SENDERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopTransactionSenders()).formatted;
                    return `Top Transaction Senders:\n${stat}`;
                },
                { provider: "core-top", operation: "get-top-tx-senders" }
            );
        },
    };
}

export function getCoreTopTransactionReceiversProvider(config: ValidatedConfig): Provider | null {
    if (!config.coreConfluxScan) {
        logOperation(
            "info",
            "Top Transaction Receivers provider not initialized - missing config",
            {
                provider: "core-top",
                operation: "initialization",
                cacheKey: CACHE_KEYS.CORE.TOP_TX_RECEIVERS,
            }
        );
        return null;
    }
    logOperation("info", "Top Transaction Receivers provider initialized", {
        provider: "core-top",
        operation: "initialization",
        cacheKey: CACHE_KEYS.CORE.TOP_TX_RECEIVERS,
    });

    const confluxScan = config.coreConfluxScan;

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const cacheKey = CACHE_KEYS.CORE.TOP_TX_RECEIVERS;
            return withCache(
                runtime,
                cacheKey,
                async () => {
                    const stat = (await confluxScan.getTopTransactionReceivers()).formatted;
                    return `Top Transaction Receivers:\n${stat}`;
                },
                { provider: "core-top", operation: "get-top-tx-receivers" }
            );
        },
    };
}
