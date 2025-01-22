import { ContractCheckResult } from "../../utils/wallet/types";
import { AddressInfo, ContractInfo, AccountInfo } from "./types";
import { getConfluxScanUrl } from "../../utils/config/tokenList";
import { ConfluxTarget } from "../../utils/config/types";

export function formatBaseAddressInfo(
    address: string,
    isCoreAddress: boolean,
    isContract: boolean,
    target: ConfluxTarget
): string {
    return `━━━━ ${isCoreAddress ? '🌐 Core Space' : '🌟 eSpace'} Address ━━━━
[${address}](${getConfluxScanUrl(address, target)})
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${isContract ? "Contract" : "EOA"}`;
}

export function formatContractDetails(contractCheck: ContractCheckResult & { isContract: true }): string {
    const sections: string[] = [`━━(Contract Details)━━`];

    if (contractCheck.type) {
        sections.push(`⚠️ Contract type is automatically inferred and may not be 100% accurate.`);
    }

    const details = [];
    if (contractCheck.category) {
        details.push(`• Type: ${contractCheck.type}\n• Category: ${contractCheck.category}`);
    }

    if (contractCheck.features.length) {
        details.push(`• Features: ${contractCheck.features.join(", ")}`);
    }

    if (contractCheck.bytecodeSize) {
        details.push(`• Bytecode Size: ${contractCheck.bytecodeSize} bytes`);
    }

    if (contractCheck.metadata?.isProxy) {
        details.push(`• Proxy: Yes\n• Implementation: ${contractCheck.metadata.implementation}`);
    }

    if (contractCheck.metadata?.owner) {
        details.push(`• Owner: ${contractCheck.metadata.owner}`);
    }

    if (contractCheck.metadata?.paused !== undefined) {
        details.push(`• Paused: ${contractCheck.metadata.paused}`);
    }

    if (contractCheck.metadata?.totalSupply) {
        details.push(`• Total Supply: ${contractCheck.metadata.totalSupply}`);
    }

    if (contractCheck.metadata?.maxSupply) {
        details.push(`• Max Supply: ${contractCheck.metadata.maxSupply}`);
    }

    if (details.length > 0) {
        sections.push(details.join("\n"));
    }

    if (contractCheck.message) {
        sections.push(`Note: ${contractCheck.message}`);
    }

    return `\n\n${sections.join("\n")}`;
}

export function formatContractVerification(isVerified: boolean): string {
    return `\n\n━━(Verification Status)━━\n${isVerified ? "✅ Contract is verified" : "❌ Contract is not verified"}`;
}

export function formatViewFunctions(contractAbi: any[]): string {
    const mainFunctions = contractAbi
        .filter(
            (item) =>
                item &&
                typeof item === "object" &&
                item.type === "function" &&
                item.stateMutability === "view"
        )
        .map(
            (func) =>
                `• ${func.name}(${(func.inputs || []).map((input: any) => input.type).join(", ")})`
        )
        .slice(0, 10);

    if (mainFunctions.length) {
        return `\n\n━━(View Functions)━━\n${mainFunctions.join("\n")}`;
    }
    return "";
}

export function formatAccountBalance(balance: string): string {
    return `\n\n━━(Balance)━━\n• ${balance} CFX`;
}

export function formatTokenBalances(tokens: any[], formatTokenAmount: (amount: string, decimals: number) => string): string {
    if (tokens.length === 0) return "";

    const filteredTokens = tokens.filter(token => token.symbol !== 'CFX');
    if (filteredTokens.length === 0) return "";

    const maxLength = Math.max(...filteredTokens.map(token => token.symbol.length));
    const sections = [`\n\n━━(Tokens)━━`];

    for (const token of filteredTokens) {
        const formattedAmount = formatTokenAmount(token.amount, token.decimals);
        sections.push(`• ${token.symbol.padEnd(maxLength)} : ${formattedAmount}`);
    }

    return sections.join("\n");
}