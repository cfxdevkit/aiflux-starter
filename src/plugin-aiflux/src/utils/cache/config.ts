import { elizaLogger, IAgentRuntime, ICacheManager } from "@elizaos/core";

// Cache for debouncing updates
const updateDebounceCache: Record<string, number> = {};
const DEBOUNCE_INTERVAL = 10000; // 10 seconds

/**
 * Check if an update for a given key should be debounced
 */
function shouldDebounceUpdate(key: string): boolean {
    const now = Date.now();
    const lastUpdate = updateDebounceCache[key] || 0;

    if (now - lastUpdate < DEBOUNCE_INTERVAL) {
        return true;
    }

    updateDebounceCache[key] = now;
    return false;
}

/**
 * Cache duration configuration in seconds
 */
export const CACHE_DURATIONS = {
    VOLATILE: 3000, // 5 mins for frequently changing data (e.g., TPS)
    MODERATE: 9000, // 15 mins for moderately changing data (e.g., transactions)
    STABLE: 18000, // 30 mins for relatively stable data (e.g., token lists)
    STATIC: 36000, // 1 hour for rarely changing data (e.g., contract info)
} as const;

/**
 * Centralized cache key registry to prevent collisions
 */
export const CACHE_KEYS = {
    CORE: {
        ACTIVE_ACCOUNTS: "conflux:core:confluxscan:active_accounts",
        CFX_HOLDERS: "conflux:core:confluxscan:cfx_holders",
        ACCOUNT_GROWTH: "conflux:core:confluxscan:account_growth",
        CONTRACTS: "conflux:core:confluxscan:contracts",
        SUPPLY: "conflux:core:confluxscan:supply",
        TRANSACTIONS: "conflux:core:confluxscan:transactions",
        CFX_TRANSFERS: "conflux:core:confluxscan:cfx_transfers",
        TPS: "conflux:core:confluxscan:tps",
        TOP_MINERS: "conflux:core:confluxscan:top_miners",
        TOP_GAS_USED: "conflux:core:confluxscan:top_gas_used",
        TOP_CFX_SENDERS: "conflux:core:confluxscan:top_cfx_senders",
        TOP_CFX_RECEIVERS: "conflux:core:confluxscan:top_cfx_receivers",
        TOP_TX_SENDERS: "conflux:core:confluxscan:top_tx_senders",
        TOP_TX_RECEIVERS: "conflux:core:confluxscan:top_tx_receivers",
    },
    ESPACE: {
        ACTIVE_ACCOUNTS: "conflux:espace:confluxscan:active_accounts",
        CFX_HOLDERS: "conflux:espace:confluxscan:cfx_holders",
        ACCOUNT_GROWTH: "conflux:espace:confluxscan:account_growth",
        CONTRACTS: "conflux:espace:confluxscan:contracts",
        TRANSACTIONS: "conflux:espace:confluxscan:transactions",
        CFX_TRANSFERS: "conflux:espace:confluxscan:cfx_transfers",
        TPS: "conflux:espace:confluxscan:tps",
        TOP_GAS_USED: "conflux:espace:confluxscan:top_gas_used",
        TOP_CFX_SENDERS: "conflux:espace:confluxscan:top_cfx_senders",
        TOP_CFX_RECEIVERS: "conflux:espace:confluxscan:top_cfx_receivers",
        TOP_TX_SENDERS: "conflux:espace:confluxscan:top_tx_senders",
        TOP_TX_RECEIVERS: "conflux:espace:confluxscan:top_tx_receivers",
    },
    DEFI: {
        CHAIN_TVL: (chain: string) => `defillama:tvl:chain:${chain}`,
        PROTOCOLS_TVL: (chain: string) => `defillama:tvl:protocols:${chain}`,
        TOKENS: "conflux:espace:tokens",
        GECKO_TERMINAL: "conflux:espace:geckoterminal",
    },
    MARKET_ANALYSIS: {
        GAINERS: (limit: number) => `market:analysis:gainers:${limit}`,
        LOSERS: (limit: number) => `market:analysis:losers:${limit}`,
        VOLUME: (limit: number) => `market:analysis:volume:${limit}`,
        TRADES: (limit: number) => `market:analysis:trades:${limit}`,
        AGE: (limit: number) => `market:analysis:age:${limit}`,
        BUY_PRESSURE: (limit: number) => `market:analysis:buy_pressure:${limit}`,
        SELL_PRESSURE: (limit: number) => `market:analysis:sell_pressure:${limit}`,
        TVL: "market:analysis:tvl",
    },
} as const;

/**
 * Get cache with retry mechanism
 */
export async function getCacheWithRetry(
    cache: ICacheManager,
    key: string,
    retries = 3
): Promise<string | null> {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const data = await cache.get(key);
            return data as string | null;
        } catch (error) {
            elizaLogger.warn(`Cache retry attempt ${attempt + 1} failed for key ${key}:`, {
                error: error instanceof Error ? error.message : String(error),
            });
            attempt++;
            if (attempt === retries) {
                return null;
            }
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
    }
    return null;
}

/**
 * Set cache with debounce check
 */
export async function setCacheWithDebounce(
    cache: ICacheManager,
    key: string,
    fetchFn: () => Promise<string>,
    _duration: number = CACHE_DURATIONS.VOLATILE
): Promise<string | null> {
    if (shouldDebounceUpdate(key)) {
        elizaLogger.debug("Cache update debounced", { key });
        return null;
    }

    const data = await fetchFn();
    await cache.set(key, data);
    return data;
}

/**
 * Standard logging interface
 */
export interface LogContext {
    provider: string;
    operation: "initialization" | "cache_check" | "cache_update" | "data_fetch";
    cacheKey: string;
    duration?: number;
    dataSize?: number;
    error?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Standardized logging function
 */
export function logOperation(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    context: LogContext
) {
    elizaLogger[level](message, {
        timestamp: new Date().toISOString(),
        ...context,
    });
}

/**
 * Wrapper function that handles all cache operations in a unified way
 * @param runtime The agent runtime containing the cache manager
 * @param cacheKey The key to store/retrieve the cache data
 * @param fetchFn The function to fetch fresh data when cache is not available
 * @param logContext Additional context for logging (e.g., provider name, operation type)
 * @param cacheDuration Optional cache duration in seconds, defaults to VOLATILE
 */
export async function withCache(
    runtime: IAgentRuntime,
    cacheKey: string,
    fetchFn: () => Promise<string>,
    logContext: { provider: string; operation: string },
    cacheDuration: number = CACHE_DURATIONS.VOLATILE
): Promise<string | null> {
    try {
        const startTime = Date.now();
        const cachedData = await getCacheWithRetry(runtime.cacheManager, cacheKey);

        logOperation("info", "Cache check", {
            provider: logContext.provider,
            operation: "cache_check",
            cacheKey,
            dataSize: cachedData?.length || 0,
        });

        if (cachedData) {
            return cachedData;
        }

        logOperation("info", "Fetching fresh data", {
            provider: logContext.provider,
            operation: "data_fetch",
            cacheKey,
        });

        const freshData = await setCacheWithDebounce(
            runtime.cacheManager,
            cacheKey,
            fetchFn,
            cacheDuration
        );
        if (!freshData) {
            return null;
        }

        const elapsedTime = Date.now() - startTime;
        logOperation("info", "Successfully cached fresh data", {
            provider: logContext.provider,
            operation: "cache_update",
            cacheKey,
            duration: elapsedTime,
            dataSize: freshData.length,
        });

        return freshData;
    } catch (error) {
        logOperation("error", `Error in ${logContext.operation}`, {
            provider: logContext.provider,
            operation: "data_fetch",
            cacheKey,
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}
