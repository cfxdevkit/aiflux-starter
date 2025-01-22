import { elizaLogger } from "@elizaos/core";
import { formatCFX } from "cive/utils";
import { BaseFormatter, baseFormatUtils } from "./baseFormatter.js";

class CoreFormatter extends BaseFormatter {
    public formatUtils = {
        ...baseFormatUtils,
        cfx: (value: string | number): string => {
            try {
                const valueInCFX = formatCFX(BigInt(String(value)));
                return `${this.formatUtils.number(valueInCFX)} CFX`;
            } catch (error) {
                elizaLogger.error(
                    `Error formatting CFX value: ${value}`,
                    error
                );
                return "0 CFX";
            }
        },
        hashRate: (value: string | number): string => {
            const hashRateInGH = Number(value) / 1e9;
            return `${hashRateInGH.toFixed(3)} GH/s`;
        },
    };

    protected dataPath = {
        list: "data.list",
        total: "data.total",
    };

    // Implement specific formatters
    public formatters = {
        activeAccounts: this.createBasicStatsFormatter(
            (item) => item.count,
            "Active Accounts"
        ),
        cfxHolders: this.createBasicStatsFormatter(
            (item) => item.count,
            "CFX Holders"
        ),
        accountGrowth: this.createBasicStatsFormatter(
            (item) => item.count,
            "Account Growth"
        ),
        contracts: (data: any): string => {
            const list = this.getDataList(data);
            if (!list?.[0]) return "No data available";
            const item = list[0];
            return [
                `New Contracts (${this.formatUtils.timestamp(item.statTime)}): ${this.formatUtils.number(item.count)}`,
                `Total Contracts: ${this.formatUtils.number(item.total)}`,
            ].join("\n");
        },
        transactions: this.createBasicStatsFormatter(
            (item) => item.count,
            "Transactions"
        ),
        cfxTransfers: this.commonFormatters.cfxTransfers,
        tps: this.commonFormatters.tps,
        miners: (data: any): string => {
            const list = this.getDataList(data);
            if (!list) return "No data available";

            const totalHashRate =
                list.reduce(
                    (sum: number, curr: any) =>
                        sum + (Number(curr.hashRate) || 0),
                    0
                ) / 1e9;

            return list
                .map((item: any, index: number) => {
                    const hashRateInGH = Number(item.hashRate) / 1e9;
                    const percentage =
                        totalHashRate > 0
                            ? (hashRateInGH / totalHashRate) * 100
                            : 0;
                    return [
                        `Rank: ${index + 1}`,
                        `Address: ${item.address}`,
                        `Blocks Mined: ${this.formatUtils.number(item.blockCntr)}`,
                        `Hash Rate: ${this.formatUtils.hashRate(item.hashRate)} (${percentage.toFixed(2)}%)`,
                        `Block Rewards: ${this.formatUtils.cfx(item.rewardSum)}`,
                        `Transaction Fees: ${this.formatUtils.cfx(item.txFeeSum)}`,
                    ].join("\n");
                })
                .join("\n--------------\n");
        },
        gasUsed: this.createRankedListFormatter(
            (value) => this.formatUtils.gas(value),
            "gas"
        ),
        cfxSenders: this.createRankedListFormatter((value) =>
            this.formatUtils.cfx(value)
        ),
        cfxReceivers: this.createRankedListFormatter((value) =>
            this.formatUtils.cfx(value)
        ),
        transactionSenders: this.createRankedListFormatter((value) =>
            this.formatUtils.number(value)
        ),
        transactionReceivers: this.createRankedListFormatter((value) =>
            this.formatUtils.number(value)
        ),
        supply: (data: any): string => {
            if (!data?.data) return "No data available";
            const supply = data.data;
            return [
                `Total Circulating: ${this.formatUtils.cfx(supply.totalCirculating)}`,
                `Total Staking: ${this.formatUtils.cfx(supply.totalStaking)}`,
                `Total Collateral: ${this.formatUtils.cfx(supply.totalCollateral)}`,
                `Total eSpace Tokens: ${this.formatUtils.cfx(supply.totalEspaceTokens)}`,
                `Total Issued: ${this.formatUtils.cfx(supply.totalIssued)}`,
                `Null Address Balance: ${this.formatUtils.cfx(supply.nullAddressBalance)}`,
                `Two Year Unlock Balance: ${this.formatUtils.cfx(supply.twoYearUnlockBalance)}`,
                `Four Year Unlock Balance: ${this.formatUtils.cfx(supply.fourYearUnlockBalance)}`,
            ].join("\n");
        },
    };
}

// Export individual formatters
const formatter = new CoreFormatter();
export const {
    activeAccounts: formatActiveAccounts,
    cfxHolders: formatCfxHolders,
    accountGrowth: formatAccountGrowth,
    contracts: formatContracts,
    supply: formatSupply,
    transactions: formatTransactions,
    cfxTransfers: formatCfxTransfers,
    tps: formatTps,
    miners: formatMiners,
    gasUsed: formatGasUsed,
    cfxSenders: formatCfxSenders,
    cfxReceivers: formatCfxReceivers,
    transactionSenders: formatTransactionSenders,
    transactionReceivers: formatTransactionReceivers,
} = formatter.formatters;

// Token formatter
export const formatCoreTokens = (balance: any[]) => {
    return baseFormatUtils.formatTokens(balance, {
        tokenType: "CRC20",
        formatAmount: (amount) => formatCFX(amount),
    });
};
