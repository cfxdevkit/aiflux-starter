import { elizaLogger } from "@elizaos/core";
import {
    Address,
    createPublicClient,
    createWalletClient,
    formatCFX,
    http,
    parseCFX,
    parseUnits,
    PublicClient,
    WalletClient
} from "cive";
import { Account, privateKeyToAccount } from "cive/accounts";
import { mainnet, testnet } from "cive/chains";
import { encodeFunctionData, formatUnits, hexAddressToBase32 } from "cive/utils";
import { ConfluxTarget } from "../config/types";
import CrossSpaceCallAbi from "./abi/crossSpaceCall";
import ERC20ABI from "./abi/erc20";
import { CoreContractDetector } from "./contractDetection/coreContractDetector";
import { ContractCheckResult } from "./types";

export class CoreWallet {
    private publicClient: PublicClient;
    private walletClient: WalletClient;
    private account: Account;
    private contractDetector: CoreContractDetector;

    constructor(
        privateKey: `0x${string}`,
        target: ConfluxTarget,
        rpcUrl?: string
    ) {
        if (!privateKey.startsWith("0x")) {
            throw new Error("Private key must start with 0x");
        }

        const chain = target === "testnet" ? testnet : mainnet;

        this.account = privateKeyToAccount(privateKey, { networkId: chain.id });

        const transport = rpcUrl ? http(rpcUrl) : http();

        //@ts-ignore
        this.publicClient = createPublicClient({
            chain,
            transport,
        });

        this.walletClient = createWalletClient({
            account: this.account,
            chain,
            transport,
        });
    }

    getPublicClient(): PublicClient {
        return this.publicClient;
    }

    getWalletClient(): WalletClient {
        return this.walletClient;
    }

    getAccount(): Account {
        return this.account;
    }

    getAddress(): Address {
        return this.account.address;
    }

    async getBalance(tokenAddress?: Address): Promise<string> {
        elizaLogger.debug(tokenAddress
            ? `Getting Core token balance for ${tokenAddress}`
            : "Getting Core wallet balance");

        try {
            if (!tokenAddress) {
                const balance = await this.publicClient.getBalance({
                    address: this.account.address,
                });
                const formatted = formatCFX(balance);
                const result = Number(formatted).toFixed(4);
                elizaLogger.debug(`Core wallet balance: ${result} CFX`);
                return result;
            }

            const [balance, decimals] = await Promise.all([
                this.publicClient.readContract({
                    address: tokenAddress,
                    abi: ERC20ABI,
                    functionName: 'balanceOf',
                    args: [this.account.address],
                }),
                this.publicClient.readContract({
                    address: tokenAddress,
                    abi: ERC20ABI,
                    functionName: 'decimals',
                }),
            ]);

            const formatted = formatUnits(balance, decimals);
            const result = Number(formatted).toFixed(4);
            elizaLogger.debug(`Core token balance: ${result}`);
            return result;
        } catch (error) {
            elizaLogger.error('Error getting balance:', error);
            throw error;
        }
    }

    async sendCfx({ to, amount }: { to: Address; amount: string }) {
        elizaLogger.debug(`Sending ${amount} CFX to ${to} on Core`);
        const hash = await this.walletClient.sendTransaction({
            account: this.account,
            chain: this.walletClient.chain,
            to,
            value: parseCFX(amount),
        });
        elizaLogger.debug(`Transaction sent on Core: ${hash}`);
        return hash;
    }

    async crossSpaceCall({
        to,
        amount,
    }: {
        to: `0x${string}`;
        amount: string;
    }) {
        elizaLogger.debug(
            `Initiating cross-space transfer of ${amount} CFX to ${to}`
        );
        const tx = await this.walletClient.sendTransaction({
            account: this.account,
            chain: this.walletClient.chain,
            to: hexAddressToBase32({
                hexAddress: "0x0888000000000000000000000000000000000006",
                networkId: await this.publicClient.getChainId(),
            }),
            value: parseCFX(amount),
            data: encodeFunctionData({
                abi: CrossSpaceCallAbi,
                functionName: "transferEVM",
                args: [to],
            }),
        });
        elizaLogger.debug(`Cross-space transfer initiated: ${tx}`);
        return tx;
    }

    async sendToken({
        to,
        amount,
        tokenAddress,
        decimals = 18,
    }: {
        to: Address;
        amount: string;
        tokenAddress: Address;
        decimals?: number;
    }) {
        elizaLogger.debug(
            `Sending ${amount} tokens (${tokenAddress}) to ${to} on Core`
        );
        const value = parseUnits(amount, decimals);

        const hash = await this.walletClient.writeContract({
            account: this.account,
            chain: this.walletClient.chain,
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: "transfer",
            args: [to, value],
        });
        elizaLogger.debug(`Token transfer sent on Core: ${hash}`);
        return hash;
    }

    async waitForTransaction(hash: `0x${string}`): Promise<void> {
        elizaLogger.debug("[Core Wallet] Waiting for transaction", { hash });
        const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
        });
        elizaLogger.debug("[Core Wallet] Transaction confirmed", {
            status: receipt.outcomeStatus,
            blockNumber: receipt.epochNumber,
        });
    }

    async getTokenBalance(tokenAddress: Address): Promise<string> {
        elizaLogger.debug("[Core Wallet] Fetching token balance", {
            token: tokenAddress,
            account: this.account.address,
        });

        const balance = await this.publicClient.readContract({
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: "balanceOf",
            args: [this.account.address],
        });

        const formatted = this.formatTokenAmount(balance.toString(), 18);

        elizaLogger.debug("[Core Wallet] Token balance result", {
            rawBalance: balance.toString(),
            formattedBalance: formatted
        });
        return formatted;
    }

    async isContract(address: string): Promise<ContractCheckResult> {
        return this.contractDetector.detectContract(address);
    }

    formatTokenAmount(amount: bigint | string, decimals: number): string {
        const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
        const formatted = formatUnits(amountBigInt, decimals);
        return Number(formatted).toFixed(4);
    }
}
