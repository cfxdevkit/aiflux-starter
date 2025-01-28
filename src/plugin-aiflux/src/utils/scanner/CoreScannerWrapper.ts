import { elizaLogger } from "@elizaos/core";
import { formatCFX, formatUnits } from "cive/utils";
import { CoreScanner } from "./core";
import { TokenData, StatsParams, StatsPeriod, SupplyResponse } from "./types";

interface FormattedResponse<T> {
    formatted: string;
    raw: T;
}

interface ListResponse<T> {
    list: T[];
    valueTotal?: string | number;
    gasTotal?: string | number;
}

interface StatItem {
    statTime: string | number;
    count: string | number;
}

interface ContractStatItem extends StatItem {
    total: string | number;
}

interface TransferStatItem {
    statTime: string | number;
    transferCount: string | number;
    userCount: string | number;
    amount: string | number;
}

interface TpsStatItem {
    statTime: string | number;
    tps: string | number;
}

interface TopGasItem {
    address: string;
    gas: string | number;
}

interface TopValueItem {
    address: string;
    value: string | number;
}

interface MinerItem {
    address: string;
    blockCntr: string | number;
    hashRate: string | number;
    rewardSum: string | number;
    txFeeSum: string | number;
}

export class CoreScannerWrapper {
    private scanner!: CoreScanner;
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
        gas: function (value: string | number): string {
            return this.number(Number(value) / 1e9);
        },
        timestamp: (value: string | number): string => {
            const date = new Date(typeof value === "string" ? value : Number(value) * 1000);
            return date.toLocaleString();
        },
        cfx: function (value: string | number | undefined): string {
            try {
                if (value === undefined || value === null) return "0 CFX";
                // Handle scientific notation by converting to a regular number string first
                const normalizedValue =
                    typeof value === "number"
                        ? value.toLocaleString("fullwide", { useGrouping: false })
                        : value;
                const bigValue = BigInt(String(normalizedValue));
                const valueInCFX = formatCFX(bigValue);
                return `${this.number(valueInCFX)} CFX`;
            } catch (error) {
                elizaLogger.error(`Error formatting CFX value: ${value}`, error);
                return "0 CFX";
            }
        },
        hashRate: (value: string | number): string => {
            const hashRateInGH = Number(value) / 1e9;
            return `${hashRateInGH.toFixed(3)} GH/s`;
        },
        tokenAmount: function (
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
                    formatted = formatCFX(bigAmount);
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
        this.scanner = new CoreScanner(target, apiKey, host);
        // Bind the format utils methods to ensure correct this context
        this.formatUtils.gas = this.formatUtils.gas.bind(this.formatUtils);
        this.formatUtils.cfx = this.formatUtils.cfx.bind(this.formatUtils);
        this.formatUtils.tokenAmount = this.formatUtils.tokenAmount.bind(this.formatUtils);
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
        tokenType: "CRC20" | "CRC721" | "CRC1155" = "CRC20",
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
        params: StatsParams = {}
    ): Promise<FormattedResponse<ListResponse<StatItem>>> {
        const data = (await this.scanner.getActiveAccountStats(params)) as ListResponse<StatItem>;
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
        params: StatsParams = {}
    ): Promise<FormattedResponse<ListResponse<StatItem>>> {
        const data = (await this.scanner.getCfxHolderStats(params)) as ListResponse<StatItem>;
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
        params: StatsParams = {}
    ): Promise<FormattedResponse<ListResponse<StatItem>>> {
        const data = (await this.scanner.getAccountGrowthStats(params)) as ListResponse<StatItem>;
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
        params: StatsParams = {}
    ): Promise<FormattedResponse<ListResponse<ContractStatItem>>> {
        const data = (await this.scanner.getContractStats(
            params
        )) as ListResponse<ContractStatItem>;
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
        params: StatsParams = {}
    ): Promise<FormattedResponse<ListResponse<StatItem>>> {
        const data = (await this.scanner.getTransactionStats(params)) as ListResponse<StatItem>;
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
        params: StatsParams = {}
    ): Promise<FormattedResponse<ListResponse<TransferStatItem>>> {
        const data = (await this.scanner.getCfxTransferStats(
            params
        )) as ListResponse<TransferStatItem>;
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
        params: StatsParams & { intervalType: "min" | "hour" | "day" }
    ): Promise<FormattedResponse<ListResponse<TpsStatItem>>> {
        const data = (await this.scanner.getTpsStats(params)) as ListResponse<TpsStatItem>;
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
    ): Promise<FormattedResponse<ListResponse<TopGasItem>>> {
        const data = (await this.scanner.getTopGasUsed(spanType)) as ListResponse<TopGasItem>;
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
    ): Promise<FormattedResponse<ListResponse<TopValueItem>>> {
        const data = (await this.scanner.getTopTransactionSenders(
            spanType
        )) as ListResponse<TopValueItem>;
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted:
                `Total Transactions: ${this.formatUtils.number(data.valueTotal)}\n\n` +
                data.list
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
    ): Promise<FormattedResponse<ListResponse<TopValueItem>>> {
        const data = (await this.scanner.getTopTransactionReceivers(
            spanType
        )) as ListResponse<TopValueItem>;
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted:
                `Total Transactions: ${this.formatUtils.number(data.valueTotal)}\n\n` +
                data.list
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
    ): Promise<FormattedResponse<ListResponse<TopValueItem>>> {
        const data = (await this.scanner.getTopCfxSenders(spanType)) as ListResponse<TopValueItem>;
        if (!data?.list?.length) return { formatted: "No data available", raw: data };
        return {
            formatted:
                `Total CFX Sent: ${this.formatUtils.cfx(data.valueTotal)}\n\n` +
                data.list
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
    ): Promise<FormattedResponse<ListResponse<TopValueItem>>> {
        const data = (await this.scanner.getTopCfxReceivers(
            spanType
        )) as ListResponse<TopValueItem>;
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        return {
            formatted:
                `Total CFX Received: ${this.formatUtils.cfx(data.valueTotal)}\n\n` +
                data.list
                    .map(
                        (item, index) =>
                            `#${index + 1} ${item.address}\n` +
                            `Amount: ${this.formatUtils.cfx(item.value)}`
                    )
                    .join("\n\n"),
            raw: data,
        };
    }

    async getTopMiners(
        spanType: StatsPeriod = "24h"
    ): Promise<FormattedResponse<ListResponse<MinerItem>>> {
        const data = (await this.scanner.getTopMiners(spanType)) as ListResponse<MinerItem>;
        if (!data?.list?.length) return { formatted: "No data available", raw: data };

        const totalHashRate = data.list.reduce(
            (sum, curr) => sum + (Number(curr.hashRate) || 0),
            0
        );

        return {
            formatted: data.list
                .map((item, index) => {
                    const hashRateInGH = Number(item.hashRate) / 1e9;
                    const percentage =
                        totalHashRate > 0 ? (hashRateInGH / (totalHashRate / 1e9)) * 100 : 0;

                    return (
                        `#${index + 1} ${item.address}\n` +
                        `Blocks Mined: ${this.formatUtils.number(item.blockCntr)}\n` +
                        `Hash Rate: ${this.formatUtils.hashRate(item.hashRate)} (${this.formatUtils.percentage(percentage)})\n` +
                        `Block Rewards: ${this.formatUtils.cfx(item.rewardSum)}\n` +
                        `Transaction Fees: ${this.formatUtils.cfx(item.txFeeSum)}`
                    );
                })
                .join("\n\n"),
            raw: data,
        };
    }

    // Supply statistics
    async getSupplyStats(): Promise<FormattedResponse<SupplyResponse>> {
        const data = await this.scanner.getSupplyStats();
        return {
            formatted: `Total Supply: ${this.formatUtils.tokenAmount(data.totalCirculating, 18, true)}
Total Circulating: ${this.formatUtils.tokenAmount(data.totalCirculating, 18, true)}
Total Staking: ${this.formatUtils.tokenAmount(data.totalStaking, 18, true)}
Total Collateral: ${this.formatUtils.tokenAmount(data.totalCollateral, 18, true)}
Total eSpace Tokens: ${this.formatUtils.tokenAmount(data.totalEspaceTokens, 18, true)}
Total Issued: ${this.formatUtils.tokenAmount(data.totalIssued, 18, true)}
Null Address Balance: ${this.formatUtils.tokenAmount(data.nullAddressBalance, 18, true)}
Two Year Unlock Balance: ${this.formatUtils.tokenAmount(data.twoYearUnlockBalance, 18, true)}
Four Year Unlock Balance: ${this.formatUtils.tokenAmount(data.fourYearUnlockBalance, 18, true)}`,
            raw: data,
        };
    }

    private tokenAmount(amount: string | number | undefined, isCFX = false): string {
        if (!amount) return isCFX ? "0 CFX" : "0";

        try {
            // Convert scientific notation to regular number
            const normalizedAmount = typeof amount === "string" ? amount : amount.toString();
            const bigIntAmount = BigInt(normalizedAmount);

            if (isCFX) {
                const formatted = formatCFX(bigIntAmount, "drip");
                return `${this.formatUtils.number(formatted)} CFX`;
            }

            const formatted = formatUnits(bigIntAmount, 18);
            return this.formatUtils.number(formatted);
        } catch (error) {
            elizaLogger.error("Error formatting token amount:", { amount, error });
            return isCFX ? "0 CFX" : "0";
        }
    }
}
