import { elizaLogger } from "@elizaos/core";
import {
    Account,
    Address,
    PublicClient,
    WalletClient,
    createPublicClient,
    createWalletClient,
    formatEther,
    http,
    parseEther,
    parseUnits,
    formatUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { confluxESpace, confluxESpaceTestnet } from "viem/chains";
import { ConfluxTarget } from "../config/types";
import ERC20ABI from "./abi/erc20";
import SwappiRouterABI from "./abi/SwappiRouter";
import { EspaceContractDetector } from "./contractDetection/espaceContractDetector";
import { ContractCheckResult } from "./types";

const DEX_ROUTER = {
    mainnet: "0x62b0873055bf896dd869e172119871ac24aea305",
    testnet: "0x873789aaf553fd0b4252d0d2b72c6331c47aff2e",
} as const;

export class EspaceWallet {
    private publicClient: PublicClient;
    private walletClient: WalletClient;
    private account: Account;
    private dexRouter: Address;
    private contractDetector: EspaceContractDetector;

    constructor(privateKey: `0x${string}`, target: ConfluxTarget, rpcUrl?: string) {
        if (!privateKey.startsWith("0x")) {
            throw new Error("Private key must start with 0x");
        }

        const chain = target === "testnet" ? confluxESpaceTestnet : confluxESpace;

        this.account = privateKeyToAccount(privateKey);

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

        this.dexRouter = DEX_ROUTER[target];
        this.contractDetector = new EspaceContractDetector(this.publicClient);
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

    async getBalance(address?: Address): Promise<string> {
        const targetAddress = address || this.account.address;
        elizaLogger.info(`Getting eSpace wallet balance for ${targetAddress}`);
        const balance = await this.publicClient.getBalance({
            address: targetAddress,
        });
        const formatted = formatEther(balance);
        const result = Number(formatted).toFixed(4);
        elizaLogger.info(`eSpace wallet balance: ${result} CFX`);
        return result;
    }

    async sendCfx({ to, amount }: { to: Address; amount: string }) {
        elizaLogger.info(`Sending ${amount} CFX to ${to} on eSpace`);
        const hash = await this.walletClient.sendTransaction({
            account: this.account,
            chain: this.walletClient.chain,
            to,
            value: parseEther(amount),
            kzg: undefined,
        });
        elizaLogger.info(`Transaction sent on eSpace: ${hash}`);
        return hash;
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
        elizaLogger.info(`Sending ${amount} tokens (${tokenAddress}) to ${to} on eSpace`);
        const value = parseUnits(amount, decimals);

        const hash = await this.walletClient.writeContract({
            account: this.account,
            chain: this.walletClient.chain,
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: "transfer",
            args: [to, value],
        });
        elizaLogger.info(`Token transfer sent on eSpace: ${hash}`);
        return hash;
    }

    async approveToken(tokenAddress: Address, amount: bigint): Promise<`0x${string}`> {
        elizaLogger.info(
            `Approving ${amount} tokens (${tokenAddress}) for ${this.account.address}`
        );

        const hash = await this.walletClient.writeContract({
            account: this.account,
            chain: this.walletClient.chain,
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: "approve",
            args: [this.dexRouter, amount],
        });
        elizaLogger.info(`Token approval sent: ${hash}`);
        await this.waitForTransaction(hash);
        elizaLogger.info(`Token approval confirmed: ${hash}`);
        return hash;
    }

    async swapExactTokensForTokens({
        amountIn,
        amountOutMin,
        path,
        deadline,
    }: {
        amountIn: bigint;
        amountOutMin: bigint;
        path: Address[];
        deadline: bigint;
    }): Promise<`0x${string}`> {
        elizaLogger.info(`Swapping ${amountIn} tokens through path: ${path.join(" -> ")}`);

        const hash = await this.walletClient.writeContract({
            account: this.account,
            chain: this.walletClient.chain,
            address: this.dexRouter,
            abi: SwappiRouterABI,
            functionName: "swapExactTokensForTokens",
            args: [amountIn, amountOutMin, path, this.account.address, deadline],
        });

        elizaLogger.info(`Swap transaction sent: ${hash}`);
        return hash;
    }

    async swapExactETHForTokens({
        amountOutMin,
        path,
        deadline,
        value,
    }: {
        amountOutMin: bigint;
        path: Address[];
        deadline: bigint;
        value: bigint;
    }): Promise<`0x${string}`> {
        elizaLogger.info(`Swapping ${value} CFX through path: ${path.join(" -> ")}`);

        const hash = await this.walletClient.writeContract({
            account: this.account,
            chain: this.walletClient.chain,
            address: this.dexRouter,
            abi: SwappiRouterABI,
            functionName: "swapExactETHForTokens",
            args: [amountOutMin, path, this.account.address, deadline],
            value,
        });

        elizaLogger.info(`Swap transaction sent: ${hash}`);
        return hash;
    }

    async swapExactTokensForETH({
        amountIn,
        amountOutMin,
        path,
        deadline,
    }: {
        amountIn: bigint;
        amountOutMin: bigint;
        path: Address[];
        deadline: bigint;
    }): Promise<`0x${string}`> {
        elizaLogger.info(`Swapping ${amountIn} tokens for CFX through path: ${path.join(" -> ")}`);

        const hash = await this.walletClient.writeContract({
            account: this.account,
            chain: this.walletClient.chain,
            address: this.dexRouter,
            abi: SwappiRouterABI,
            functionName: "swapExactTokensForETH",
            args: [amountIn, amountOutMin, path, this.account.address, deadline],
        });

        elizaLogger.info(`Swap transaction sent: ${hash}`);
        return hash;
    }

    async getAmountsOut(
        amountIn: bigint,
        path: Address[],
        slippage: number = 5
    ): Promise<{ amounts: readonly bigint[]; amountOutMin: bigint }> {
        elizaLogger.info(`Getting amounts out for ${amountIn} through path: ${path.join(" -> ")}`);

        const amounts = await this.publicClient.readContract({
            address: this.dexRouter,
            abi: SwappiRouterABI,
            functionName: "getAmountsOut",
            args: [amountIn, path],
        });

        const amountOutMin = amounts[1] - (amounts[1] * BigInt(slippage)) / BigInt(100);

        elizaLogger.info(`Amounts out: ${amounts.join(" -> ")}`);
        elizaLogger.info(`amountOutMin: ${amountOutMin}`);

        return { amounts, amountOutMin };
    }

    async checkAllowance(tokenAddress: Address): Promise<bigint> {
        elizaLogger.info("[eSpace Wallet] Checking token allowance", {
            token: tokenAddress,
            spender: this.dexRouter,
            owner: this.account.address,
        });

        const allowance = await this.publicClient.readContract({
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [this.account.address, this.dexRouter],
        });

        elizaLogger.info("[eSpace Wallet] Allowance result", {
            allowance: allowance.toString(),
        });
        return allowance;
    }

    async waitForTransaction(hash: `0x${string}`): Promise<void> {
        elizaLogger.info("[eSpace Wallet] Waiting for transaction", { hash });
        const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
        });
        elizaLogger.info("[eSpace Wallet] Transaction confirmed", {
            status: receipt.status,
            blockNumber: receipt.blockNumber,
        });
    }

    async getTokenBalance(tokenAddress: Address): Promise<string> {
        elizaLogger.info("[eSpace Wallet] Fetching token balance", {
            token: tokenAddress,
            account: this.account.address,
        });

        const balance = await this.publicClient.readContract({
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: "balanceOf",
            args: [this.account.address],
        });

        // Format the balance before returning
        const formatted = this.formatTokenAmount(balance.toString(), 18); // We could also fetch decimals from the contract

        elizaLogger.info("[eSpace Wallet] Token balance result", {
            rawBalance: balance.toString(),
            formattedBalance: formatted,
        });
        return formatted;
    }

    async isContract(address: string): Promise<ContractCheckResult> {
        return this.contractDetector.detectContract(address);
    }

    formatTokenAmount(amount: bigint | string, decimals: number): string {
        const amountBigInt = typeof amount === "string" ? BigInt(amount) : amount;
        const formatted = formatUnits(amountBigInt, decimals);
        return Number(formatted).toFixed(4);
    }
}
