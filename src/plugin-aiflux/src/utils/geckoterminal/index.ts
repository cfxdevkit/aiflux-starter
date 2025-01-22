import { elizaLogger } from "@elizaos/core";
import { FormattedPool, PoolsResponse, TokenInfo } from "./types";

export class GeckoTerminal {
    private readonly BASE_URL = "https://api.geckoterminal.com/api/v2";
    private readonly NETWORK = "cfx";
    private readonly DEFAULT_DEX = "swappi";

    private async fetchData<T>(path: string): Promise<T> {
        elizaLogger.debug(`Fetching data from: ${this.BASE_URL}${path}`);
        const response = await fetch(`${this.BASE_URL}${path}`);
        if (!response.ok) {
            elizaLogger.error(
                `API request failed with status: ${response.status}`
            );
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        elizaLogger.debug("Data fetched successfully");
        return await response.json();
    }

    /**
     * Get top pools sorted by 24h volume
     * @param page Page number (default: 1)
     * @param dex DEX name (default: swappi)
     */
    public async getTopPools(
        page = 1,
        dex = this.DEFAULT_DEX
    ): Promise<PoolsResponse> {
        return this.fetchData<PoolsResponse>(
            `/networks/${this.NETWORK}/dexes/${dex}/pools?page=${page}`
        );
    }

    /**
     * Get trending pools based on recent activity and volume
     * @param timeframe Timeframe for trending calculation: '5m' | '1h' | '6h' | '24h' (default: '24h')
     * @param page Page number (default: 1)
     */
    public async getTrendingPools(
        timeframe: "5m" | "1h" | "6h" | "24h" = "24h",
        page = 1
    ): Promise<PoolsResponse> {
        return this.fetchData<PoolsResponse>(
            `/networks/${this.NETWORK}/pools/trending?timeframe=${timeframe}&page=${page}`
        );
    }

    /**
     * Get detailed information about a specific token
     * @param tokenAddress The address of the token
     */
    public async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
        return this.fetchData<TokenInfo>(
            `/networks/${this.NETWORK}/tokens/${tokenAddress}`
        );
    }

    /**
     * Get pools for a specific token
     * @param tokenAddress The address of the token
     * @param page Page number (default: 1)
     */
    public async getTokenPools(
        tokenAddress: string,
        page = 1
    ): Promise<PoolsResponse> {
        return this.fetchData<PoolsResponse>(
            `/networks/${this.NETWORK}/tokens/${tokenAddress}/pools?page=${page}`
        );
    }

    /**
     * Search for pools
     * @param query Search query (token name, symbol, or address)
     * @param page Page number (default: 1)
     */
    public async searchPools(query: string, page = 1): Promise<PoolsResponse> {
        return this.fetchData<PoolsResponse>(
            `/networks/${this.NETWORK}/pools/search?query=${encodeURIComponent(query)}&page=${page}`
        );
    }

    public formatPool(pool: any): FormattedPool {
        elizaLogger.debug(`Formatting pool data for: ${pool.attributes.name}`);
        const formattedPool = {
            name: pool.attributes.name,
            price: `$${Number(pool.attributes.base_token_price_usd).toFixed(6)}`,
            volume24h: `$${Number(pool.attributes.volume_usd.h24).toLocaleString()}`,
            trades24h: {
                total:
                    pool.attributes.transactions.h24.buys +
                    pool.attributes.transactions.h24.sells,
                buys: pool.attributes.transactions.h24.buys,
                sells: pool.attributes.transactions.h24.sells,
            },
            priceChange24h: `${pool.attributes.price_change_percentage.h24}%`,
            poolAddress: pool.attributes.address,
            baseTokenAddress:
                pool.relationships.base_token.data.id.split("_").pop() || "",
            quoteTokenAddress:
                pool.relationships.quote_token.data.id.split("_").pop() || "",
            createdAt: pool.attributes.pool_created_at,
            reserveUSD: pool.attributes.reserve_in_usd,
            baseTokenPriceUSD: pool.attributes.base_token_price_usd,
            quoteTokenPriceUSD: pool.attributes.quote_token_price_usd,
            baseTokenPriceNative:
                pool.attributes.base_token_price_native_currency,
        };
        elizaLogger.debug(`Pool formatted successfully: ${formattedPool.name}`);
        return formattedPool;
    }

    /**
     * Get formatted top pools
     * @param pages Number of pages to fetch (default: 1)
     * @param startPage Starting page number (default: 1)
     * @param dex DEX name (default: swappi)
     */
    public async getFormattedTopPools(
        pages = 1,
        startPage = 1,
        dex = this.DEFAULT_DEX
    ): Promise<FormattedPool[]> {
        const allPools: FormattedPool[] = [];

        for (let page = startPage; page < startPage + pages; page++) {
            const pools = await this.getTopPools(page, dex);
            allPools.push(...pools.data.map((pool) => this.formatPool(pool)));
        }

        return allPools;
    }

    /**
     * Get detailed information about multiple tokens (up to 30 at a time)
     * @param tokenAddresses Array of token addresses
     */
    public async getMultiTokenInfo(
        tokenAddresses: string[]
    ): Promise<{ data: { attributes: any }[] }> {
        elizaLogger.debug(`Fetching info for ${tokenAddresses.length} tokens`);
        if (tokenAddresses.length > 30) {
            elizaLogger.error("Token address limit exceeded");
            throw new Error(
                "Maximum of 30 token addresses allowed per request"
            );
        }
        return this.fetchData<{ data: { attributes: any }[] }>(
            `/networks/${this.NETWORK}/tokens/multi/${tokenAddresses.join(",")}`
        );
    }

    /**
     * Get detailed information about multiple pools
     * @param poolAddresses Array of pool addresses
     */
    public async getMultiPoolInfo(
        poolAddresses: string[]
    ): Promise<{ data: any[] }> {
        elizaLogger.debug(`Fetching info for ${poolAddresses.length} pools`);
        return this.fetchData<{ data: any[] }>(
            `/networks/${this.NETWORK}/pools/multi/${poolAddresses.join(",")}`
        );
    }

    /**
     * Get formatted information for multiple pools
     * @param poolAddresses Array of pool addresses
     */
    public async getFormattedMultiPoolInfo(
        poolAddresses: string[]
    ): Promise<FormattedPool[]> {
        elizaLogger.debug(
            `Getting formatted info for ${poolAddresses.length} pools`
        );
        elizaLogger.debug(`Pool addresses: ${poolAddresses.join(", ")}`);

        try {
            const poolsInfo = await this.getMultiPoolInfo(poolAddresses);
            elizaLogger.debug(
                `Retrieved raw data for ${poolsInfo.data.length} pools`
            );

            const formattedPools = poolsInfo.data.map((pool) => {
                try {
                    return this.formatPool(pool);
                } catch (error) {
                    elizaLogger.error(`Failed to format pool data: ${error}`);
                    throw error;
                }
            });

            elizaLogger.debug(
                `Successfully formatted ${formattedPools.length} pools`
            );
            return formattedPools;
        } catch (error) {
            elizaLogger.error(`Failed to get multi-pool info: ${error}`);
            throw error;
        }
    }
}
