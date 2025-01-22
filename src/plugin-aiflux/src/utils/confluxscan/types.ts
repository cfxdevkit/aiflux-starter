// API Response types
export interface ApiResponse<T> {
    data: T;
    result?: T;
}

// Configuration types
export interface ConfigClassType {
    new (config: any): any;
}

// Statistics types
export interface StatItem {
    statTime: number | string;
    count: number;
    total?: number;
}

// Formatter types
export interface BaseFormatters {
    activeAccounts: (data: any) => string;
    cfxHolders: (data: any) => string;
    accountGrowth: (data: any) => string;
    contracts: (data: any) => string;
    transactions: (data: any) => string;
    cfxTransfers: (data: any) => string;
    tps: (data: any) => string;
    gasUsed: (data: any) => string;
    cfxSenders: (data: any) => string;
    cfxReceivers: (data: any) => string;
    transactionSenders: (data: any) => string;
    transactionReceivers: (data: any) => string;
}

// Constants
export const FORMATTER_CONSTANTS = {
    SEPARATOR: "--------------",
    DEFAULT_DECIMAL_PLACES: 2,
    GAS_DIVISOR: 1e9,
    MILLISECONDS_PER_SECOND: 1000,
} as const;

// Add these interfaces to types.ts
export interface TokenData {
    type: string;
    contract: string;
    name: string;
    symbol: string;
    decimals: number;
    amount: string;
    priceInUSDT?: string;
}

export interface TokenResponseData {
    list: TokenData[];
}

export interface TokenResponse {
    data: {
        data?: TokenResponseData;
        result?: TokenResponseData;
    };
}

// Add helper function to get token list consistently
export const getTokenList = (response: TokenResponse): TokenData[] => {
    return response.data.data?.list || response.data.result?.list || [];
};

export interface TimestampCache {
    twentyFourHoursAgo: number;
    current: number;
    lastUpdate: number;
}

export interface StatsParams {
    [key: string]: string | number;
}

// Add DataStructure interface
export interface DataStructure {
    [key: string]: any;
    data?: {
        list?: any[];
        total?: number;
    };
    result?: {
        list?: any[];
        total?: number;
    };
}

export type StatsPeriod = "24h" | "1w" | "1m";
