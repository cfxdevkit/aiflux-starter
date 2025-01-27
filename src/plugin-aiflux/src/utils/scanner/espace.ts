import { elizaLogger } from "@elizaos/core";
import { isAddress } from "viem";
import { ConfluxTarget } from "../../config/types";

// API Response types
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

interface StatItem {
    statTime: string;
    [key: string]: string | number;
}

interface StatsResponse {
    total: number;
    list: StatItem[];
}

interface StatsParams extends Record<string, string | number | boolean> {
    minTimestamp?: number;
    maxTimestamp?: number;
    sort?: "DESC" | "ASC";
    skip?: number;
    limit?: number;
    intervalType?: "min" | "hour" | "day";
}

export type StatsPeriod = "24h" | "3d" | "7d";

interface TopStatsResponse {
    gasTotal?: string;
    list: Array<{
        address: string;
        gas?: string;
        [key: string]: string | undefined;
    }>;
}

export class ESpaceScanner {
    protected baseUrl: string;
    protected apiKey?: string;

    constructor(target: ConfluxTarget = "mainnet", apiKey?: string, host?: string) {
        const defaultMainnetHost = "https://evmapi.confluxscan.io";
        const defaultTestnetHost = "https://evmapi-testnet.confluxscan.io";
        const defaultHost = target === "mainnet" ? defaultMainnetHost : defaultTestnetHost;
        this.baseUrl = host || defaultHost;
        this.apiKey = apiKey;
    }

    protected async fetchApi<T>(
        endpoint: string,
        params: Record<string, string | number | boolean> = {}
    ): Promise<{ status: string; message: string; result: T }> {
        try {
            let url: URL;
            if (endpoint === "/api") {
                // Module/action pattern
                url = new URL(endpoint, this.baseUrl);
            } else {
                // Direct path pattern
                url = new URL(endpoint, this.baseUrl);
            }

            const fetchParams = { ...params };
            if (this.apiKey) {
                fetchParams.apiKey = this.apiKey;
            }
            Object.entries(fetchParams).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });

            elizaLogger.debug(`Fetching ${url.toString()}`);
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === "0") {
                throw new Error(`API error: ${data.message || "Unknown error"}`);
            }
            return data;
        } catch (error) {
            elizaLogger.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    protected validateAddress(address: string): boolean {
        const isValid = isAddress(address);
        if (!isValid) {
            elizaLogger.error(`Invalid eSpace address: ${address}`);
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
        if (!response.result) {
            throw new Error(`No result returned for ${endpoint}`);
        }
        return response.result;
    }

    protected async getTopStats<T>(endpoint: string, spanType: StatsPeriod = "24h") {
        elizaLogger.debug(`Fetching top stats for endpoint: ${endpoint}, spanType: ${spanType}`);

        const response = await this.fetchApi<T>(endpoint, { spanType });
        if (!response.result) {
            throw new Error(`No result returned for ${endpoint}`);
        }
        return response.result;
    }

    // Contract methods
    async getContractABI(address: string): Promise<ContractABIResponse> {
        elizaLogger.debug(`Getting contract ABI for ${address}`);
        if (!this.validateAddress(address)) {
            throw new Error(`Invalid address: ${address}`);
        }
        const response = await this.fetchApi<string>("/api", {
            module: "contract",
            action: "getabi",
            address,
        });
        if (!response.result) {
            throw new Error(`Contract ${address} not verified or ABI not available`);
        }
        return JSON.parse(response.result);
    }

    async getContractSourceCode(address: string): Promise<ContractSourceResponse> {
        elizaLogger.debug(`Getting contract source code for ${address}`);
        if (!this.validateAddress(address)) {
            throw new Error(`Invalid address: ${address}`);
        }
        const response = await this.fetchApi<ContractSourceResponse[]>("/api", {
            module: "contract",
            action: "getsourcecode",
            address,
        });
        if (!response.result?.[0]) {
            throw new Error(`Contract ${address} not verified or source code not available`);
        }
        return response.result[0];
    }

    // Token methods
    async getAccountTokens(
        address: string,
        tokenType: "ERC20" | "ERC721" | "ERC1155" = "ERC20",
        skip = 0,
        limit = 10
    ): Promise<TokenData[]> {
        elizaLogger.debug(`Getting ${tokenType} tokens for ${address}`);
        if (!this.validateAddress(address)) {
            throw new Error(`Invalid address: ${address}`);
        }
        const response = await this.fetchApi<{ list: TokenData[] }>("/account/tokens", {
            account: address,
            tokenType,
            skip: String(skip),
            limit: String(limit),
        });
        return response.result.list;
    }

    async getTokenInfos(contracts: string[]): Promise<TokenData[]> {
        elizaLogger.debug("Getting token infos");
        const response = await this.fetchApi<TokenListResponse>(
            `/token/tokeninfos?contracts=${contracts.join(",")}`
        );
        return response.result.list;
    }

    // Statistics methods
    async getActiveAccountStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting active account stats");
        const response = await this.fetchApi<StatsResponse>("/statistics/account/active", params);
        return response.result;
    }

    async getCfxHolderStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting CFX holder stats");
        const response = await this.fetchApi<StatsResponse>(
            "/statistics/account/cfx/holder",
            params
        );
        return response.result;
    }

    async getAccountGrowthStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting account growth stats");
        const response = await this.fetchApi<StatsResponse>("/statistics/account/growth", params);
        return response.result;
    }

    async getContractStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting contract stats");
        const response = await this.fetchApi<StatsResponse>("/statistics/contract", params);
        return response.result;
    }

    async getTransactionStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting transaction stats");
        const response = await this.fetchApi<StatsResponse>("/statistics/transaction", params);
        return response.result;
    }

    async getCfxTransferStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting CFX transfer stats");
        const response = await this.fetchApi<StatsResponse>("/statistics/cfx/transfer", params);
        return response.result;
    }

    async getTpsStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting TPS stats");
        const response = await this.fetchApi<StatsResponse>("/statistics/tps", params);
        return response.result;
    }

    // Top statistics methods
    async getTopGasUsed(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top gas used stats");
        const response = await this.fetchApi<TopStatsResponse>("/statistics/top/gas/used", {
            spanType,
        });
        return response.result;
    }

    async getTopTransactionSenders(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top transaction senders");
        const response = await this.fetchApi<TopStatsResponse>(
            "/statistics/top/transaction/sender",
            { spanType }
        );
        return response.result;
    }

    async getTopTransactionReceivers(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top transaction receivers");
        const response = await this.fetchApi<TopStatsResponse>(
            "/statistics/top/transaction/receiver",
            { spanType }
        );
        return response.result;
    }

    async getTopCfxSenders(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top CFX senders");
        const response = await this.fetchApi<TopStatsResponse>("/statistics/top/cfx/sender", {
            spanType,
        });
        return response.result;
    }

    async getTopCfxReceivers(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top CFX receivers");
        const response = await this.fetchApi<TopStatsResponse>("/statistics/top/cfx/receiver", {
            spanType,
        });
        return response.result;
    }

    async getTopTokenTransfers(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top token transfers");
        const response = await this.fetchApi<TopStatsResponse>("/statistics/top/token/transfer", {
            spanType,
        });
        return response.result;
    }

    async getTopTokenSenders(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top token senders");
        const response = await this.fetchApi<TopStatsResponse>("/statistics/top/token/sender", {
            spanType,
        });
        return response.result;
    }

    async getTopTokenReceivers(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top token receivers");
        const response = await this.fetchApi<TopStatsResponse>("/statistics/top/token/receiver", {
            spanType,
        });
        return response.result;
    }

    async getTopTokenParticipants(spanType: StatsPeriod) {
        elizaLogger.debug("Getting top token participants");
        const response = await this.fetchApi<TopStatsResponse>(
            "/statistics/top/token/participant",
            { spanType }
        );
        return response.result;
    }

    // Token statistics methods
    async getTokenHolderStats(contract: string, params: StatsParams = {}) {
        elizaLogger.debug(`Getting token holder stats for contract ${contract}`);
        const response = await this.fetchApi<StatsResponse>("/statistics/token/holder", {
            contract,
            ...params,
        });
        return response.result;
    }

    async getTokenUniqueSenderStats(contract: string, params: StatsParams = {}) {
        elizaLogger.debug(`Getting token unique sender stats for contract ${contract}`);
        const response = await this.fetchApi<StatsResponse>("/statistics/token/unique/sender", {
            contract,
            ...params,
        });
        return response.result;
    }

    async getTokenUniqueReceiverStats(contract: string, params: StatsParams = {}) {
        elizaLogger.debug(`Getting token unique receiver stats for contract ${contract}`);
        const response = await this.fetchApi<StatsResponse>("/statistics/token/unique/receiver", {
            contract,
            ...params,
        });
        return response.result;
    }

    async getTokenUniqueParticipantStats(contract: string, params: StatsParams = {}) {
        elizaLogger.debug(`Getting token unique participant stats for contract ${contract}`);
        const response = await this.fetchApi<StatsResponse>(
            "/statistics/token/unique/participant",
            {
                contract,
                ...params,
            }
        );
        return response.result;
    }

    // Block statistics methods
    async getBlockBaseFeeStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting block base fee stats");
        const response = await this.fetchApi<StatsResponse>("/statistics/block/base-fee", params);
        return response.result;
    }

    async getBlockAvgPriorityFeeStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting block average priority fee stats");
        const response = await this.fetchApi<StatsResponse>(
            "/statistics/block/avg-priority-fee",
            params
        );
        return response.result;
    }

    async getBlockGasUsedStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting block gas used stats");
        const response = await this.fetchApi<StatsResponse>("/statistics/block/gas-used", params);
        return response.result;
    }

    async getBlockTxsByTypeStats(params: StatsParams = {}) {
        elizaLogger.debug("Getting block transactions by type stats");
        const response = await this.fetchApi<StatsResponse>(
            "/statistics/block/txs-by-type",
            params
        );
        return response.result;
    }
}
