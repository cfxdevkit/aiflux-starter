import { elizaLogger } from "@elizaos/core";
import { isAddress } from "cive/utils";
import { ConfluxTarget } from "../../config/types";

// API Response types
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
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

export interface StatsParams {
    minTimestamp?: number;
    maxTimestamp?: number;
    sort?: "DESC" | "ASC";
    skip?: number;
    limit?: number;
    intervalType?: "min" | "hour" | "day";
}

export type StatsPeriod = "24h" | "3d" | "7d";

export interface SupplyResponse {
    totalSupply: string;
    circulatingSupply: string;
}

export class CoreScanner {
    protected baseUrl: string;
    protected apiKey?: string;

    constructor(target: ConfluxTarget = "mainnet", apiKey?: string, host?: string) {
        const defaultMainnetHost = "https://api.confluxscan.io";
        const defaultTestnetHost = "https://api-testnet.confluxscan.io";
        const defaultHost = target === "mainnet" ? defaultMainnetHost : defaultTestnetHost;
        this.baseUrl = host || defaultHost;
        this.apiKey = apiKey;
    }

    protected async fetchApi<T>(
        endpoint: string,
        params: Record<string, string | number | boolean> = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = new URL(endpoint, this.baseUrl);
            const fetchParams = { ...params };
            if (this.apiKey) {
                fetchParams.apiKey = this.apiKey;
            }
            Object.entries(fetchParams).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });

            const headers: Record<string, string> = {
                Accept: "application/json",
            };

            elizaLogger.debug(`Fetching from Core API: ${url.toString()}`);
            const response = await fetch(url.toString(), { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (!data || typeof data !== "object") {
                throw new Error("Invalid response format");
            }

            if ("code" in data && data.code !== 0) {
                throw new Error(`API error: ${data.message || "Unknown error"}`);
            }

            if (!("data" in data)) {
                throw new Error("Response missing data field");
            }

            return data as ApiResponse<T>;
        } catch (error) {
            elizaLogger.error(`Error fetching ${endpoint}:`, {
                error: error instanceof Error ? error.message : String(error),
                params,
            });
            throw error;
        }
    }

    protected validateAddress(address: string): boolean {
        const isValid = isAddress(address);
        if (!isValid) {
            elizaLogger.error(`Invalid Core address: ${address}`);
        }
        return isValid;
    }

    protected getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

    protected get24HoursAgo = () => {
        const now = Date.now();
        return Math.floor(now / 1000) - 24 * 60 * 60;
    };

    protected async getBasicStats<T>(endpoint: string, params: StatsParams = {}) {
        elizaLogger.debug(`Fetching basic stats for endpoint: ${endpoint}`, params);

        const fetchParams = {
            minTimestamp: params.minTimestamp || this.get24HoursAgo(),
            maxTimestamp: params.maxTimestamp || this.getCurrentTimestamp(),
            sort: params.sort || "DESC",
            skip: params.skip || 0,
            limit: params.limit || 10,
            ...params,
        };

        const response = await this.fetchApi<T>(endpoint, fetchParams);
        if (!response.data) {
            throw new Error(`No data returned for ${endpoint}`);
        }
        return response.data;
    }

    protected async getTopStats<T>(endpoint: string, spanType: StatsPeriod = "24h") {
        elizaLogger.debug(`Fetching top stats for endpoint: ${endpoint}, spanType: ${spanType}`);

        const response = await this.fetchApi<T>(endpoint, { spanType });
        if (!response.data) {
            throw new Error(`No data returned for ${endpoint}`);
        }
        return response.data;
    }

    // Contract methods
    async getContractABI(address: string): Promise<ContractABIResponse> {
        elizaLogger.debug(`Getting contract ABI for ${address}`);
        if (!this.validateAddress(address)) {
            throw new Error(`Invalid address: ${address}`);
        }
        const response = await this.fetchApi<ContractABIResponse>("/contract/getabi", {
            address,
        });
        if (!response.data) {
            throw new Error(`Contract ${address} not verified or ABI not available`);
        }
        return response.data;
    }

    async getContractSourceCode(address: string): Promise<ContractSourceResponse> {
        elizaLogger.debug(`Getting contract source code for ${address}`);
        if (!this.validateAddress(address)) {
            throw new Error(`Invalid address: ${address}`);
        }
        const response = await this.fetchApi<ContractSourceResponse>("/contract/getsourcecode", {
            address,
        });
        if (!response.data) {
            throw new Error(`Contract ${address} not verified or source code not available`);
        }
        return response.data;
    }

    // Token methods
    async getAccountTokens(
        address: string,
        tokenType: "CRC20" | "CRC721" | "CRC1155" = "CRC20",
        skip = 0,
        limit = 10
    ): Promise<TokenData[]> {
        elizaLogger.debug(`Getting ${tokenType} tokens for address ${address}`);
        if (!this.validateAddress(address)) {
            throw new Error(`Invalid address: ${address}`);
        }
        const response = await this.fetchApi<TokenListResponse>("/account/tokens", {
            account: address,
            tokenType,
            skip,
            limit,
        });
        return response.data.list;
    }

    async getTokenInfos(
        params: { contracts?: string | string[]; skip?: number; limit?: number } = {}
    ) {
        elizaLogger.debug("Getting token infos");
        const { contracts, ...paginationParams } = params;
        const contractList = Array.isArray(contracts) ? contracts.join(",") : contracts;

        const response = await this.fetchApi<TokenListResponse>("/token/tokeninfos", {
            ...(contractList && { contracts: contractList }),
            ...paginationParams,
        });
        return response.data.list;
    }

    // Statistics methods
    async getActiveAccountStats(params: StatsParams = {}) {
        return this.getBasicStats("/statistics/account/active", params);
    }

    async getCfxHolderStats(params: StatsParams = {}) {
        return this.getBasicStats("/statistics/account/cfx/holder", params);
    }

    async getAccountGrowthStats(params: StatsParams = {}) {
        return this.getBasicStats("/statistics/account/growth", params);
    }

    async getContractStats(params: StatsParams = {}) {
        return this.getBasicStats("/statistics/contract", params);
    }

    async getTransactionStats(params: StatsParams = {}) {
        return this.getBasicStats("/statistics/transaction", params);
    }

    async getCfxTransferStats(params: StatsParams = {}) {
        return this.getBasicStats("/statistics/cfx/transfer", params);
    }

    async getTpsStats(params: StatsParams & { intervalType: "min" | "hour" | "day" }) {
        return this.getBasicStats("/statistics/tps", params);
    }

    // Top statistics methods
    async getTopGasUsed(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/gas/used", spanType);
    }

    async getTopTransactionSenders(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/transaction/sender", spanType);
    }

    async getTopTransactionReceivers(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/transaction/receiver", spanType);
    }

    async getTopCfxSenders(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/cfx/sender", spanType);
    }

    async getTopCfxReceivers(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/cfx/receiver", spanType);
    }

    async getTopTokenTransfers(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/token/transfer", spanType);
    }

    async getTopTokenSenders(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/token/sender", spanType);
    }

    async getTopTokenReceivers(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/token/receiver", spanType);
    }

    async getTopTokenParticipants(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/token/participant", spanType);
    }

    async getTopMiners(spanType: StatsPeriod = "24h") {
        return this.getTopStats("/statistics/top/miner", spanType);
    }

    // Token statistics methods
    async getTokenHolderStats(contract: string, params: StatsParams = {}) {
        elizaLogger.debug(`Getting token holder stats for contract ${contract}`);
        const response = await this.fetchApi("/statistics/token/holder", {
            contract,
            ...params,
        });
        return response.data;
    }

    async getTokenUniqueSenderStats(contract: string, params: StatsParams = {}) {
        elizaLogger.debug(`Getting token unique sender stats for contract ${contract}`);
        const response = await this.fetchApi("/statistics/token/unique/sender", {
            contract,
            ...params,
        });
        return response.data;
    }

    async getTokenUniqueReceiverStats(contract: string, params: StatsParams = {}) {
        elizaLogger.debug(`Getting token unique receiver stats for contract ${contract}`);
        const response = await this.fetchApi("/statistics/token/unique/receiver", {
            contract,
            ...params,
        });
        return response.data;
    }

    async getTokenUniqueParticipantStats(contract: string, params: StatsParams = {}) {
        elizaLogger.debug(`Getting token unique participant stats for contract ${contract}`);
        const response = await this.fetchApi("/statistics/token/unique/participant", {
            contract,
            ...params,
        });
        return response.data;
    }

    // Block statistics methods
    async getBlockBaseFeeStats() {
        return this.getBasicStats("/statistics/block/base-fee");
    }

    async getBlockAvgPriorityFeeStats() {
        return this.getBasicStats("/statistics/block/avg-priority-fee");
    }

    async getBlockGasUsedStats() {
        return this.getBasicStats("/statistics/block/gas-used");
    }

    async getBlockTxsByTypeStats() {
        return this.getBasicStats("/statistics/block/txs-by-type");
    }

    // Supply statistics
    async getSupplyStats() {
        return this.getBasicStats<SupplyResponse>("/statistics/supply");
    }
}
