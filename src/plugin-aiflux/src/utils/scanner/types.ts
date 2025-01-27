// API Response types
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface ESpaceApiResponse<T> {
    status: string;
    message: string;
    result: T;
}

// Contract types
export interface ContractABIData {
    abi: string;
}

export interface ContractSourceData {
    sourceCode: string;
    abi: string;
    contractName: string;
    compiler: string;
    optimizationUsed: boolean;
    runs: number;
    constructorArguments: string;
    evmVersion: string;
    library: string;
    licenseType: string;
    proxy: string;
    implementation: string;
    swarmSource: string;
}

export type ContractABIResponse = ContractABIData;
export type ContractSourceResponse = ContractSourceData;

// Token types
export interface TokenData {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    iconUrl?: string;
    price?: number;
    totalSupply?: string;
    transferCount?: number;
    holderCount?: number;
    type?: string;
    amount?: string;
    contract?: string;
    priceInUSDT?: string;
    quoteUrl?: string;
}

export interface TokenListResponse {
    list: TokenData[];
    total: number;
}

// Stats types
export interface StatsParams {
    minTimestamp?: number;
    maxTimestamp?: number;
    sort?: "DESC" | "ASC";
    skip?: number;
    limit?: number;
    intervalType?: "min" | "hour" | "day";
}

export interface ESpaceStatItem {
    statTime: string;
    [key: string]: string | number;
}

export interface ESpaceStatsResponse {
    total: number;
    list: ESpaceStatItem[];
}

export interface ESpaceStatsParams extends Record<string, string | number | boolean> {
    minTimestamp?: number;
    maxTimestamp?: number;
    sort?: "DESC" | "ASC";
    skip?: number;
    limit?: number;
    intervalType?: "min" | "hour" | "day";
}

export interface ESpaceTopStatsResponse {
    gasTotal?: string;
    list: Array<{
        address: string;
        gas?: string;
        [key: string]: string | undefined;
    }>;
}

export type StatsPeriod = "24h" | "3d" | "7d";

export interface SupplyResponse {
    totalSupply: string;
    circulatingSupply: string;
}
