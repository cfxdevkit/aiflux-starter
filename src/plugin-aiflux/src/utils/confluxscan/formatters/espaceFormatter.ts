import { elizaLogger } from "@elizaos/core";
import { formatEther } from "viem";
import { BaseFormatter, baseFormatUtils } from "./baseFormatter.js";

class ESpaceFormatter extends BaseFormatter {
    public formatUtils = {
        ...baseFormatUtils,
        cfx: (value: string | number): string => {
            try {
                // Convert scientific notation to regular string
                const normalizedValue =
                    typeof value === "number"
                        ? value.toLocaleString("fullwide", {
                              useGrouping: false,
                          })
                        : Number(value).toLocaleString("fullwide", {
                              useGrouping: false,
                          });

                const valueInCFX = formatEther(BigInt(normalizedValue));
                elizaLogger.debug(
                    `Formatted CFX value: ${valueInCFX} from ${value}`
                );
                return `${this.formatUtils.number(valueInCFX)} CFX`;
            } catch (error) {
                elizaLogger.error(
                    `Error formatting CFX value: ${value}`,
                    error
                );
                return "0 CFX";
            }
        },
    };

    protected dataPath = {
        list: "result.list",
        total: "result.valueTotal",
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
        gasUsed: (data: any): string => {
            const list = this.getDataList(data);
            if (!list) {
                elizaLogger.debug("No gas usage data available");
                return "No data available";
            }

            // Try both possible paths for gasTotal
            const totalGas =
                data?.result?.gasTotal ||
                data?.data?.gasTotal ||
                list.reduce(
                    (sum: number, item: any) => sum + Number(item.gas || 0),
                    0
                );

            elizaLogger.debug(`Total gas used: ${totalGas}`);

            return [
                `Total Gas Used: ${this.formatUtils.gas(totalGas)}`,
                ...list.map((item: any, index: number) =>
                    [
                        `Rank: ${index + 1}`,
                        `Address: ${item.address}`,
                        `Gas Used: ${this.formatUtils.gas(item.gas)}`,
                    ].join("\n")
                ),
            ].join("\n--------------\n");
        },
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
        tokenParticipants: this.createRankedListFormatter(
            (value) => this.formatUtils.number(value),
            "transferCntr",
            false
        ),
        tokenTransfers: this.createRankedListFormatter(
            (value) => this.formatUtils.number(value),
            "transferCntr",
            false
        ),
    };
}

// Export individual formatters
const formatter = new ESpaceFormatter();
export const {
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
    tokenParticipants: formatTokenParticipants,
    tokenTransfers: formatTokenTransfers,
} = formatter.formatters;

// Token formatter
export const formatESpaceTokens = (balance: any[]) => {
    return baseFormatUtils.formatTokens(balance, {
        tokenType: "ERC20",
        formatAmount: (amount) => formatEther(amount),
    });
};
