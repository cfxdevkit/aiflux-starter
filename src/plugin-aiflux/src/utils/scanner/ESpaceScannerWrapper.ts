import { elizaLogger } from "@elizaos/core";
import { formatEther, formatUnits } from "viem";
import { ESpaceScanner } from "./espace";
import {
    TokenData,
    ESpaceStatsParams,
    StatsPeriod,
    ESpaceStatsResponse,
    ESpaceTopStatsResponse,
} from "./types";

interface FormattedResponse<T> {
    formatted: string;
    raw: T;
}

export class ESpaceScannerWrapper {
    private scanner: ESpaceScanner;
    private formatUtils = {
        number: (num: string | number): string => {
            if (!num) return "0";
            const numStr = Number(num).toString();
            if (numStr === "NaN") return "0";
            const [integerPart, decimalPart] = numStr.split(".");
            const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return decimalPart
                ? `${formattedInteger}.${decimalPart.slice(0, 4)}`
                : formattedInteger;
        },
        percentage: (num: string | number): string => {
            if (!num) return "0%";
            return `${Number(num).toFixed(2)}%`;
        },
        gas: function (
            this: typeof ESpaceScannerWrapper.prototype.formatUtils,
            value: string | number
        ): string {
            return this.number(Number(value) / 1e9);
        },
        timestamp: (value: string | number): string => {
            const date = new Date(typeof value === "string" ? value : Number(value) * 1000);
            return date.toLocaleString();
        },
        cfx: function (
            this: typeof ESpaceScannerWrapper.prototype.formatUtils,
            value: string | number | undefined
        ): string {
            try {
                if (value === undefined || value === null) return "0 CFX";
                // Handle scientific notation by converting to a regular number string first
                const normalizedValue =
                    typeof value === "number"
                        ? value.toLocaleString("fullwide", { useGrouping: false })
                        : value;
                const bigValue = BigInt(String(normalizedValue));
                const valueInCFX = formatEther(bigValue);
                return `${this.number(valueInCFX)} CFX`;
            } catch (error) {
                elizaLogger.error(`Error formatting CFX value: ${value}`, error);
                return "0 CFX";
            }
        },
        tokenAmount: function (
            this: typeof ESpaceScannerWrapper.prototype.formatUtils,
            amount: string | number,
            decimals: number = 18,
            isCFX: boolean = false
        ): string {
            if (!amount) return isCFX ? "0 CFX" : "0";
            try {
                let formatted: string;
                if (isCFX) {
                    // Handle scientific notation by converting to BigInt first
                    const bigAmount =
                        typeof amount === "string"
                            ? BigInt(amount)
                            : BigInt(Math.floor(Number(amount)));
                    formatted = formatEther(bigAmount);
                    return `${this.number(formatted)} CFX`;
                }
                formatted = formatUnits(BigInt(amount), decimals);
                return this.number(formatted);
            } catch (error) {
                elizaLogger.error(`Error formatting token amount: ${amount}`, error);
                return isCFX ? "0 CFX" : "0";
            }
        },
    };

    constructor(target: "mainnet" | "testnet" = "mainnet", apiKey?: string, host?: string) {
        this.scanner = new ESpaceScanner(target, apiKey, host);
    }

    // Contract methods
    async getContractABI(address: string): Promise<FormattedResponse<unknown>> {
        const data = await this.scanner.getContractABI(address);
        return {
            formatted: `Contract ABI for ${address}:\n${JSON.stringify(data, null, 2)}`,
            raw: data,
        };
    }

    async getContractSourceCode(address: string): Promise<FormattedResponse<unknown>> {
        const data = await this.scanner.getContractSourceCode(address);
        return {
            formatted: `Contract Source Code for ${address}:\n${JSON.stringify(data, null, 2)}`,
            raw: data,
        };
    }

    // Token methods
    async getAccountTokens(
        address: string,
        tokenType: "ERC20" | "ERC721" | "ERC1155" = "ERC20",
        skip = 0,
        limit = 10
    ): Promise<FormattedResponse<TokenData[]>> {
        const tokens = await this.scanner.getAccountTokens(address, tokenType, skip, limit);
        return {
            formatted: tokens
                .map((token: TokenData) => {
                    const lines = [
                        `Token: ${token.name || "Unknown"} (${token.symbol || "Unknown"})`,
                        `Type: ${token.type}`,
                        `Amount: ${this.formatUtils.tokenAmount(token.amount, token.decimals)} ${token.symbol}`,
                        `Contract: ${token.contract}`,
                        token.priceInUSDT
                            ? `Price: $${Number(token.priceInUSDT).toFixed(4)}`
                            : undefined,
                    ].filter(Boolean);
                    return lines.join("\n");
                })
                .join("\n\n"),
            raw: tokens,
        };
    }

    // Statistics methods
    async getActiveAccountStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getActiveAccountStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Active Accounts (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.count)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getCfxHolderStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getCfxHolderStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `CFX Holders (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.count)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getAccountGrowthStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getAccountGrowthStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `New Accounts (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.count)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getContractStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getContractStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Contracts (${this.formatUtils.timestamp(item.statTime)}):\n` +
                            `New: ${this.formatUtils.number(item.count)}\n` +
                            `Total: ${this.formatUtils.number(item.total || 0)}`
                    )
                    .join("\n\n") || "No data available",
            raw: data,
        };
    }

    async getTransactionStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getTransactionStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Transactions (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.count)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getCfxTransferStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getCfxTransferStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `CFX Transfers (${this.formatUtils.timestamp(item.statTime)}):\n` +
                            `Count: ${this.formatUtils.number(item.transferCount)}\n` +
                            `Users: ${this.formatUtils.number(item.userCount)}\n` +
                            `Amount: ${this.formatUtils.cfx(item.amount)}`
                    )
                    .join("\n\n") || "No data available",
            raw: data,
        };
    }

    async getTpsStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getTpsStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `TPS (${this.formatUtils.timestamp(item.statTime)}): ${Number(item.tps).toFixed(2)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    // Top statistics methods
    async getTopGasUsed(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopGasUsed(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted:
                `Total Gas Used: ${this.formatUtils.gas(data.gasTotal)}\n\n` +
                data.list
                    .map(
                        (item, index) =>
                            `#${index + 1} ${item.address}\n` +
                            `Gas Used: ${this.formatUtils.gas(item.gas)}`
                    )
                    .join("\n\n"),
            raw: data,
        };
    }

    async getTopTransactionSenders(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopTransactionSenders(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted: data.list
                .map(
                    (item, index) =>
                        `#${index + 1} ${item.address}\n` +
                        `Transactions: ${this.formatUtils.number(item.value)}`
                )
                .join("\n\n"),
            raw: data,
        };
    }

    async getTopTransactionReceivers(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopTransactionReceivers(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted: data.list
                .map(
                    (item, index) =>
                        `#${index + 1} ${item.address}\n` +
                        `Transactions: ${this.formatUtils.number(item.value)}`
                )
                .join("\n\n"),
            raw: data,
        };
    }

    async getTopCfxSenders(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopCfxSenders(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted: data.list
                .map(
                    (item, index) =>
                        `#${index + 1} ${item.address}\n` +
                        `Amount: ${this.formatUtils.cfx(item.value)}`
                )
                .join("\n\n"),
            raw: data,
        };
    }

    async getTopCfxReceivers(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopCfxReceivers(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted: data.list
                .map(
                    (item, index) =>
                        `#${index + 1} ${item.address}\n` +
                        `Amount: ${this.formatUtils.cfx(item.value)}`
                )
                .join("\n\n"),
            raw: data,
        };
    }

    async getTopTokenTransfers(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopTokenTransfers(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted: data.list
                .map(
                    (item, index) =>
                        `#${index + 1} ${item.address}\n` +
                        `Transfers: ${this.formatUtils.number(item.transferCntr)}`
                )
                .join("\n\n"),
            raw: data,
        };
    }

    async getTopTokenSenders(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopTokenSenders(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted: data.list
                .map(
                    (item, index) =>
                        `#${index + 1} ${item.address}\n` +
                        `Transfers: ${this.formatUtils.number(item.transferCntr)}`
                )
                .join("\n\n"),
            raw: data,
        };
    }

    async getTopTokenReceivers(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopTokenReceivers(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted: data.list
                .map(
                    (item, index) =>
                        `#${index + 1} ${item.address}\n` +
                        `Transfers: ${this.formatUtils.number(item.transferCntr)}`
                )
                .join("\n\n"),
            raw: data,
        };
    }

    async getTopTokenParticipants(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ESpaceTopStatsResponse>> {
        const data = await this.scanner.getTopTokenParticipants(spanType);
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted: data.list
                .map(
                    (item, index) =>
                        `#${index + 1} ${item.address}\n` +
                        `Transfers: ${this.formatUtils.number(item.transferCntr)}`
                )
                .join("\n\n"),
            raw: data,
        };
    }

    // Token statistics methods
    async getTokenHolderStats(
        contract: string,
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getTokenHolderStats(contract, params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Token Holders (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.holderCount)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getTokenUniqueSenderStats(
        contract: string,
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getTokenUniqueSenderStats(contract, params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Unique Senders (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.uniqueSenderCount)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getTokenUniqueReceiverStats(
        contract: string,
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getTokenUniqueReceiverStats(contract, params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Unique Receivers (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.uniqueReceiverCount)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getTokenUniqueParticipantStats(
        contract: string,
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getTokenUniqueParticipantStats(contract, params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Unique Participants (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.uniqueParticipantCount)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    // Block statistics methods
    async getBlockBaseFeeStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getBlockBaseFeeStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Base Fee (${this.formatUtils.timestamp(item.timestamp)}): ${this.formatUtils.gas(item.baseFee)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getBlockAvgPriorityFeeStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getBlockAvgPriorityFeeStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Average Priority Fee (${this.formatUtils.timestamp(item.timestamp)}): ${this.formatUtils.gas(item.avgPriorityFee)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getBlockGasUsedStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getBlockGasUsedStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Gas Used (${this.formatUtils.timestamp(item.timestamp)}): ${this.formatUtils.gas(item.gasUsed)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }

    async getBlockTxsByTypeStats(
        params: ESpaceStatsParams = {}
    ): Promise<FormattedResponse<ESpaceStatsResponse>> {
        const data = await this.scanner.getBlockTxsByTypeStats(params);
        return {
            formatted:
                data.list
                    ?.map(
                        (item) =>
                            `Transactions (${this.formatUtils.timestamp(item.timestamp)}): ${JSON.stringify(item.txsInType)}`
                    )
                    .join("\n") || "No data available",
            raw: data,
        };
    }
}
