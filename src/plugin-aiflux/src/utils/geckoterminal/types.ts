interface BaseAttributes {
    id: string;
    type: string;
}

export interface Token extends BaseAttributes {
    attributes: {
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        price_usd: string | null;
        total_supply: string | null;
    };
}

export interface Pool extends BaseAttributes {
    attributes: {
        address: string;
        name: string;
        pool_created_at: string;
        reserve_in_usd: string;
        base_token_price_usd: string;
        quote_token_price_usd: string;
        base_token_price_native: string;
        quote_token_price_native: string;
        volume_usd: {
            h24: string;
            h6: string;
            m5: string;
        };
        price_change_percentage: {
            h24: string;
            h6: string;
            m5: string;
        };
        transactions: {
            h24: {
                buys: number;
                sells: number;
            };
            h6: {
                buys: number;
                sells: number;
            };
            m5: {
                buys: number;
                sells: number;
            };
        };
    };
    relationships: {
        base_token: {
            data: BaseAttributes;
        };
        quote_token: {
            data: BaseAttributes;
        };
        dex: {
            data: BaseAttributes;
        };
    };
}

export interface PoolsResponse {
    data: Pool[];
    links: {
        first: string;
        last: string;
        next: string | null;
        prev: string | null;
    };
    meta: {
        total_pages: number;
        total_records: number;
    };
}

export interface TokenInfo {
    data: Token;
    included?: Token[];
}

export interface FormattedPool {
    name: string;
    price: string;
    volume24h: string;
    trades24h: {
        total: number;
        buys: number;
        sells: number;
    };
    priceChange24h: string;
    poolAddress: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    createdAt: string;
    reserveUSD: string;
    baseTokenPriceUSD: string;
    quoteTokenPriceUSD: string;
    baseTokenPriceNative: string;
}
