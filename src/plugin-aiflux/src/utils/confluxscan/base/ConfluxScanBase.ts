import { elizaLogger } from "@elizaos/core";
import {
    ConfigClassType,
    TimestampCache,
    StatsParams,
    StatsPeriod,
    TokenData,
    TokenResponse,
    getTokenList,
} from "../types";
import { ConfluxTarget } from "../../config/types";
import { handleError } from "../utils/errorHandler";

export abstract class ConfluxScanBase {
    protected config: InstanceType<ConfigClassType>;
    protected accountsApi: any;
    protected statisticsApi: any;

    private memoizedTimestamps: TimestampCache = {
        twentyFourHoursAgo: 0,
        current: 0,
        lastUpdate: 0,
    };

    protected abstract formatters: {
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
    };

    constructor(
        target: ConfluxTarget = "mainnet",
        defaultMainnetHost: string,
        defaultTestnetHost: string,
        ConfigClass: ConfigClassType,
        accountsApiFactory: (config: any) => any,
        statisticsApiFactory: (config: any) => any,
        apiKey?: string,
        host?: string
    ) {
        elizaLogger.debug(`Initializing ConfluxScan client for ${target}`);
        const defaultHost =
            target === "mainnet" ? defaultMainnetHost : defaultTestnetHost;

        this.config = new ConfigClass({
            basePath: host || defaultHost,
            ...(apiKey && { apiKey }),
        });
        this.accountsApi = accountsApiFactory(this.config);
        this.statisticsApi = statisticsApiFactory(this.config);
    }

    protected get24HoursAgo = () => {
        const now = Date.now();
        if (now - this.memoizedTimestamps.lastUpdate > 60000) {
            elizaLogger.debug("Updating memoized timestamps");
            this.memoizedTimestamps = {
                twentyFourHoursAgo: Math.floor(now / 1000) - 24 * 60 * 60,
                current: Math.floor(now / 1000),
                lastUpdate: now,
            };
        }
        return this.memoizedTimestamps.twentyFourHoursAgo;
    };

    protected getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

    protected async getBasicStats(method: string, params: StatsParams = {}) {
        elizaLogger.debug(`Fetching basic stats for method: ${method}`);
        try {
            const requestFunction = await (this.statisticsApi as any)[method](
                this.get24HoursAgo(),
                this.getCurrentTimestamp(),
                "DESC",
                0,
                10,
                ...Object.values(params)
            );
            const response = await requestFunction();
            return response.data;
        } catch (error) {
            elizaLogger.error(`Failed to get ${method}:`, error);
            throw error;
        }
    }

    protected async getTopStats(method: string, period: StatsPeriod = "24h") {
        elizaLogger.debug(
            `Fetching top stats for method: ${method}, period: ${period}`
        );
        try {
            const requestFunction = await (this.statisticsApi as any)[method](
                period
            );
            const response = await requestFunction();
            return response.data;
        } catch (error) {
            return handleError(error, `getting ${method}`);
        }
    }

    async getAccountTokens(address: string): Promise<TokenData[]> {
        elizaLogger.debug(`Fetching tokens for address: ${address}`);
        if (!this.validateAddress(address)) {
            elizaLogger.error(`Invalid address format: ${address}`);
            throw new Error("Invalid address format");
        }
        try {
            const requestFunction =
                await this.accountsApi.accountTokensGet(address);
            const response = (await requestFunction()) as TokenResponse;
            return getTokenList(response);
        } catch (error) {
            return handleError(error, "fetching account tokens");
        }
    }

    async filterAccountTokens(
        address: string,
        filter: string
    ): Promise<TokenData[]> {
        elizaLogger.debug(
            `Filtering tokens for address: ${address}, filter: ${filter}`
        );
        if (!filter) {
            elizaLogger.error("Empty filter string provided");
            throw new Error("Filter string cannot be empty");
        }

        try {
            const tokens = await this.getAccountTokens(address);
            const lowerFilter = filter.toLowerCase();

            if (this.validateAddress(filter)) {
                elizaLogger.debug("Filtering by contract address");
                return tokens.filter(
                    (token) => token.contract?.toLowerCase() === lowerFilter
                );
            }

            elizaLogger.debug("Filtering by symbol");
            return tokens.filter((token) =>
                token.symbol?.toLowerCase().includes(lowerFilter)
            );
        } catch (error) {
            return handleError(error, "filtering account tokens");
        }
    }

    // Common methods for statistics
    async getActiveAccountStats() {
        return this.getBasicStats("statisticsAccountActiveGet");
    }

    async getCfxHolderStats() {
        return this.getBasicStats("statisticsAccountCfxHolderGet");
    }

    async getAccountGrowthStats() {
        return this.getBasicStats("statisticsAccountGrowthGet");
    }

    async getContractStats() {
        return this.getBasicStats("statisticsContractGet");
    }

    async getTransactionStats() {
        return this.getBasicStats("statisticsTransactionGet");
    }

    async getCfxTransferStats() {
        return this.getBasicStats("statisticsCfxTransferGet");
    }

    async getTpsStats(intervalType: "min" | "hour" | "day" = "hour") {
        try {
            const requestFunction = await this.statisticsApi.statisticsTpsGet(
                intervalType,
                this.get24HoursAgo(),
                this.getCurrentTimestamp(),
                "DESC",
                0,
                10
            );
            const response = await requestFunction();
            return response.data;
        } catch (error) {
            elizaLogger.error("Error getting TPS stats:", error);
            throw error;
        }
    }

    // Common top statistics methods - Raw data
    async getTopGasUsed(period: StatsPeriod = "24h") {
        return this.getTopStats("statisticsTopGasUsedGet", period);
    }

    async getTopCfxSenders(period: StatsPeriod = "24h") {
        return this.getTopStats("statisticsTopCfxSenderGet", period);
    }

    async getTopCfxReceivers(period: StatsPeriod = "24h") {
        return this.getTopStats("statisticsTopCfxReceiverGet", period);
    }

    async getTopTransactionSenders(period: StatsPeriod = "24h") {
        return this.getTopStats("statisticsTopTransactionSenderGet", period);
    }

    async getTopTransactionReceivers(period: StatsPeriod = "24h") {
        return this.getTopStats("statisticsTopTransactionReceiverGet", period);
    }

    // Implement all common formatted methods
    async getFormattedActiveAccountStats() {
        const stats = await this.getActiveAccountStats();
        return this.formatters.activeAccounts(stats);
    }

    async getFormattedCfxHolderStats() {
        const stats = await this.getCfxHolderStats();
        return this.formatters.cfxHolders(stats);
    }

    async getFormattedAccountGrowthStats() {
        const stats = await this.getAccountGrowthStats();
        return this.formatters.accountGrowth(stats);
    }

    async getFormattedContractStats() {
        const stats = await this.getContractStats();
        return this.formatters.contracts(stats);
    }

    async getFormattedTransactionStats() {
        const stats = await this.getTransactionStats();
        return this.formatters.transactions(stats);
    }

    async getFormattedCfxTransferStats() {
        const stats = await this.getCfxTransferStats();
        return this.formatters.cfxTransfers(stats);
    }

    async getFormattedTpsStats(intervalType: "min" | "hour" | "day" = "hour") {
        const stats = await this.getTpsStats(intervalType);
        return this.formatters.tps(stats);
    }

    async getFormattedTopGasUsed(period: StatsPeriod = "24h") {
        const stats = await this.getTopGasUsed(period);
        return this.formatters.gasUsed(stats);
    }

    async getFormattedTopCfxSenders(period: StatsPeriod = "24h") {
        const stats = await this.getTopCfxSenders(period);
        return this.formatters.cfxSenders(stats);
    }

    async getFormattedTopCfxReceivers(period: StatsPeriod = "24h") {
        const stats = await this.getTopCfxReceivers(period);
        return this.formatters.cfxReceivers(stats);
    }

    async getFormattedTopTransactionSenders(period: StatsPeriod = "24h") {
        const stats = await this.getTopTransactionSenders(period);
        return this.formatters.transactionSenders(stats);
    }

    async getFormattedTopTransactionReceivers(period: StatsPeriod = "24h") {
        const stats = await this.getTopTransactionReceivers(period);
        return this.formatters.transactionReceivers(stats);
    }

    // Abstract methods that must be implemented by derived classes
    protected abstract validateAddress(address: string): boolean;
    abstract getFormattedAccountTokens(
        address: string,
        options: any
    ): Promise<string>;
}
