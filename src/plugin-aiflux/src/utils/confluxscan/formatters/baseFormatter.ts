import { elizaLogger } from "@elizaos/core";
import { DataStructure, FORMATTER_CONSTANTS, StatItem } from "../types.js";

// Common utility functions for all formatters
export const baseFormatUtils = {
    number: (num: string | number): string => {
        if (!num) return "0";
        const numStr = Number(num).toString();
        if (numStr === "NaN") return "0";
        const [integerPart, decimalPart] = numStr.split(".");
        const formattedInteger = integerPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ","
        );
        return decimalPart
            ? `${formattedInteger}.${decimalPart}`
            : formattedInteger;
    },
    percentage: (num: string | number): string => {
        if (!num) return "0%";
        return `${Number(num).toFixed(2)}%`;
    },
    gas: function (value: string | number): string {
        return this.number(Number(value) / 1e9);
    },
    timestamp: (value: string | number): string => {
        const date = new Date(
            typeof value === "string" ? value : Number(value) * 1000
        );
        return date.toLocaleString();
    },
    formatTokens: (
        balance: any[],
        options: {
            tokenType: "CRC20" | "ERC20";
            formatAmount: (amount: bigint) => string;
        }
    ) => {
        elizaLogger.debug(`Formatting ${options.tokenType} tokens`);
        const tokens = balance
            .filter((token: any) => token.type === options.tokenType)
            .filter((token: any) => {
                if (token.decimals === 0) return true;
                const formattedAmount = Number(
                    options.formatAmount(BigInt(token.amount))
                );
                return formattedAmount >= 0.000001 || formattedAmount === 0;
            });

        elizaLogger.debug(`Found ${tokens.length} valid tokens to format`);
        return tokens
            .map((token: any, index: number) => {
                const formatted = Object.entries(token)
                    .filter(([key]) => key !== "iconUrl" && key !== "quoteUrl")
                    .map(([key, value]) => {
                        if (key === "amount") {
                            if (token.decimals === 0) {
                                return `${key}: ${value} ${token.symbol || ""}`;
                            }
                            const amount = BigInt(value as string);
                            return `${key}: ${baseFormatUtils.number(options.formatAmount(amount))} ${token.symbol || ""}`;
                        }
                        if (key === "priceInUSDT" && value) {
                            return `${key}: $${Number(value).toFixed(4)}`;
                        }
                        return `${key}: ${value}`;
                    })
                    .join("\n");
                return (
                    formatted +
                    (index < tokens.length - 1 ? "\n---------------\n" : "")
                );
            })
            .join("");
    },
};

// Base formatter class with common structure
export abstract class BaseFormatter {
    protected abstract formatUtils: typeof baseFormatUtils & {
        cfx: (value: string | number) => string;
    };
    protected abstract dataPath: { list: string; total: string };

    protected createBasicStatsFormatter(
        dataExtractor: (item: StatItem) => number,
        label: string
    ) {
        return (data: DataStructure): string => {
            const list = this.getDataList(data) as StatItem[];
            if (!list?.[0]) return "No data available";
            const item = list[0];
            return `${label} (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(dataExtractor(item))}`;
        };
    }

    protected createRankedListFormatter(
        valueFormatter: (value: string | number) => string,
        valueKey: string = "value",
        includeTotal: boolean = true
    ) {
        return (data: DataStructure): string => {
            const list = this.getDataList(data);
            if (!list) return "No data available";

            const formattedItems = list.map((item: any, index: number) =>
                [
                    `Rank: ${index + 1}`,
                    `Address: ${item.address}`,
                    `Value: ${valueFormatter(item[valueKey])}`,
                ].join("\n")
            );

            if (includeTotal && data[this.dataPath.total]) {
                return [
                    `Total: ${valueFormatter(data[this.dataPath.total])}`,
                    ...formattedItems,
                ].join(`\n${FORMATTER_CONSTANTS.SEPARATOR}\n`);
            }

            return formattedItems.join(`\n${FORMATTER_CONSTANTS.SEPARATOR}\n`);
        };
    }

    protected getDataList(data: DataStructure): any[] {
        const path = this.dataPath.list.split(".");
        return path.reduce((obj: any, key: string) => obj?.[key], data) || [];
    }

    // Common formatter implementations that can be shared
    protected commonFormatters = {
        tps: (data: any): string => {
            const list = this.getDataList(data);
            if (!list) return "No data available";
            return list
                .map(
                    (item: any) =>
                        `${this.formatUtils.timestamp(item.statTime)}: ${Number(item.tps).toFixed(2)} TPS`
                )
                .join("\n");
        },

        cfxTransfers: (data: any): string => {
            const list = this.getDataList(data);
            if (!list) return "No data available";
            return list
                .map((item: any) =>
                    [
                        `Time: ${this.formatUtils.timestamp(item.statTime)}`,
                        `Transfers: ${this.formatUtils.number(item.transferCount)}`,
                        `Users: ${this.formatUtils.number(item.userCount)}`,
                        `Amount: ${this.formatUtils.cfx(item.amount)}`,
                    ].join("\n")
                )
                .join("\n--------------\n");
        },
    };
}
