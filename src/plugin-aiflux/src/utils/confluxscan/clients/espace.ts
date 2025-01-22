import * as ConfluxScanEvm from "@conflux-lib/openapi-sdk-evm";
import { elizaLogger } from "@elizaos/core";
import { isAddress } from "viem";
import { ConfluxScanBase } from "../base/ConfluxScanBase";
import { handleError } from "../utils/errorHandler";
import {
    formatAccountGrowth,
    formatActiveAccounts,
    formatCfxHolders,
    formatCfxReceivers,
    formatCfxSenders,
    formatCfxTransfers,
    formatContracts,
    formatESpaceTokens,
    formatGasUsed,
    formatTokenParticipants,
    formatTokenTransfers,
    formatTps,
    formatTransactionReceivers,
    formatTransactions,
    formatTransactionSenders,
} from "../formatters/espaceFormatter";
import { StatsPeriod } from "../types";
import { ConfluxTarget } from "../../config/types";

export class ConfluxScanESpace extends ConfluxScanBase {
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

    private contractsApi: ReturnType<typeof ConfluxScanEvm.ContractsApiFp>;

    constructor(
        apiKey?: string,
        host?: string,
        target: ConfluxTarget = "mainnet"
    ) {
        super(
            target,
            "https://evmapi.confluxscan.io",
            "https://evmapi-testnet.confluxscan.io",
            ConfluxScanEvm.Configuration,
            ConfluxScanEvm.AccountsDeprecatedApiFp,
            ConfluxScanEvm.StatisticsApiFp,
            apiKey,
            host
        );
        this.contractsApi = ConfluxScanEvm.ContractsApiFp(this.config);
    }

    protected validateAddress(address: string): boolean {
        const isValid = isAddress(address);
        if (!isValid) {
            elizaLogger.error(`Invalid eSpace address: ${address}`);
        }
        return isValid;
    }

    async getFormattedAccountTokens(address: string) {
        elizaLogger.debug(`Fetching eSpace tokens for address: ${address}`);
        const balance = await this.getAccountTokens(address);
        return formatESpaceTokens(balance);
    }

    // eSpace-specific methods
    async getTopTokenParticipants(period: StatsPeriod = "24h") {
        elizaLogger.debug(
            `Fetching top token participants for period: ${period}`
        );
        return this.getTopStats("statisticsTopTokenParticipantGet", period);
    }

    async getFormattedTopTokenParticipants(period: StatsPeriod = "24h") {
        const stats = await this.getTopTokenParticipants(period);
        return formatTokenParticipants(stats);
    }

    async getTopTokenTransfers(period: StatsPeriod = "24h") {
        elizaLogger.debug(`Fetching top token transfers for period: ${period}`);
        return this.getTopStats("statisticsTopTokenTransferGet", period);
    }

    async getFormattedTopTokenTransfers(period: StatsPeriod = "24h") {
        const stats = await this.getTopTokenTransfers(period);
        return formatTokenTransfers(stats);
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
                await this.contractsApi.apimodulecontractactiongetabiGet(
                    address
                );
            const response = await requestFunction();
            return response.data;
        } catch (error) {
            return handleError(error, "getting contract ABI");
        }
    }
}
