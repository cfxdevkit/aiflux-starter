import * as ConfluxScan from "@conflux-lib/openapi-sdk-core";
import { elizaLogger } from "@elizaos/core";
import { isAddress } from "cive/utils";
import { ConfluxScanBase } from "../base/ConfluxScanBase";
import {
    formatAccountGrowth,
    formatActiveAccounts,
    formatCfxHolders,
    formatCfxReceivers,
    formatCfxSenders,
    formatCfxTransfers,
    formatContracts,
    formatCoreTokens,
    formatGasUsed,
    formatMiners,
    formatSupply,
    formatTps,
    formatTransactionReceivers,
    formatTransactions,
    formatTransactionSenders,
} from "../formatters/coreFormatter";
import { StatsPeriod } from "../types";
import { ConfluxTarget } from "../../config/types";
import { handleError } from "../utils/errorHandler";

export class ConfluxScanCore extends ConfluxScanBase {
    protected formatters = {
        activeAccounts: formatActiveAccounts,
        cfxHolders: formatCfxHolders,
        accountGrowth: formatAccountGrowth,
        contracts: formatContracts,
        transactions: formatTransactions,
        cfxTransfers: formatCfxTransfers,
        tps: formatTps,
        gasUsed: formatGasUsed,
        cfxSenders: formatCfxSenders,
        cfxReceivers: formatCfxReceivers,
        transactionSenders: formatTransactionSenders,
        transactionReceivers: formatTransactionReceivers,
    };

    private contractsApi: ReturnType<typeof ConfluxScan.ContractsApiFp>;

    constructor(
        apiKey?: string,
        host?: string,
        target: ConfluxTarget = "mainnet"
    ) {
        super(
            target,
            "https://api.confluxscan.io",
            "https://api-testnet.confluxscan.io",
            ConfluxScan.Configuration,
            ConfluxScan.AccountsApiFp,
            ConfluxScan.StatisticsApiFp,
            apiKey,
            host
        );
        this.contractsApi = ConfluxScan.ContractsApiFp(this.config);
    }

    protected validateAddress(address: string): boolean {
        const isValid = isAddress(address);
        if (!isValid) {
            elizaLogger.error(`Invalid Core address: ${address}`);
        }
        return isValid;
    }

    async getFormattedAccountTokens(address: string) {
        elizaLogger.debug(`Fetching Core tokens for address: ${address}`);
        const balance = await this.getAccountTokens(address);
        return formatCoreTokens(balance);
    }

    // Core-specific methods
    async getSupplyStats() {
        try {
            elizaLogger.debug("Fetching Core supply stats");
            const requestFunction =
                await this.statisticsApi.statisticsSupplyGet();
            const response = await requestFunction();
            return response.data;
        } catch (error) {
            return handleError(error, "getting supply stats");
        }
    }

    async getFormattedSupplyStats() {
        const stats = await this.getSupplyStats();
        return formatSupply(stats);
    }

    async getTopMiners(period: StatsPeriod = "24h") {
        elizaLogger.debug(`Fetching top miners for period: ${period}`);
        return this.getTopStats("statisticsTopMinerGet", period);
    }

    async getFormattedTopMiners(period: StatsPeriod = "24h") {
        const stats = await this.getTopMiners(period);
        return formatMiners(stats);
    }

    // Formatted versions of base class methods
    async getFormattedActiveAccountStats() {
        const stats = await this.getActiveAccountStats();
        return formatActiveAccounts(stats);
    }

    async getFormattedCfxHolderStats() {
        const stats = await this.getCfxHolderStats();
        return formatCfxHolders(stats);
    }

    async getFormattedAccountGrowthStats() {
        const stats = await this.getAccountGrowthStats();
        return formatAccountGrowth(stats);
    }

    async getFormattedContractStats() {
        const stats = await this.getContractStats();
        return formatContracts(stats);
    }

    async getFormattedTransactionStats() {
        const stats = await this.getTransactionStats();
        return formatTransactions(stats);
    }

    async getFormattedCfxTransferStats() {
        const stats = await this.getCfxTransferStats();
        return formatCfxTransfers(stats);
    }

    async getFormattedTpsStats(intervalType: "min" | "hour" | "day" = "hour") {
        const stats = await this.getTpsStats(intervalType);
        return formatTps(stats);
    }

    async getFormattedTopGasUsed(period: "24h" | "1w" | "1m" = "24h") {
        const stats = await this.getTopGasUsed(period);
        return formatGasUsed(stats);
    }

    async getFormattedTopCfxSenders(period: "24h" | "1w" | "1m" = "24h") {
        const stats = await this.getTopCfxSenders(period);
        return formatCfxSenders(stats);
    }

    async getFormattedTopCfxReceivers(period: "24h" | "1w" | "1m" = "24h") {
        const stats = await this.getTopCfxReceivers(period);
        return formatCfxReceivers(stats);
    }

    async getFormattedTopTransactionSenders(
        period: "24h" | "1w" | "1m" = "24h"
    ) {
        const stats = await this.getTopTransactionSenders(period);
        return formatTransactionSenders(stats);
    }

    async getFormattedTopTransactionReceivers(
        period: "24h" | "1w" | "1m" = "24h"
    ) {
        const stats = await this.getTopTransactionReceivers(period);
        return formatTransactionReceivers(stats);
    }

    async getContractABI(address: string) {
        elizaLogger.debug(`Getting contract ABI for address: ${address}`);
        try {
            const requestFunction =
                await this.contractsApi.contractGetabiGet(address);
            const response = await requestFunction();
            return response.data;
        } catch (error) {
            return handleError(error, "getting contract ABI");
        }
    }
}
