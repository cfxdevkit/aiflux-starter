import { elizaLogger } from "@elizaos/core";
import { Address } from "viem";
import { ConfluxScanESpace } from "../confluxscan";
import { GeckoTerminal } from "../geckoterminal";
import { FormattedPool } from "../geckoterminal/types";
import { TokenInfo, TokenList } from "./types";
import { ConfluxTarget } from "./types";
import { isAddress } from "viem";
// Add utility function to get the correct ConfluxScan URL
export function getConfluxScanUrl(address: string, target: ConfluxTarget = 'mainnet'): string {
    // Check if it's a hex address (eSpace)
    const isEspaceAddress = isAddress(address);

    if (target === 'mainnet') {
        return isEspaceAddress
            ? `https://evm.confluxscan.io/address/${address}`
            : `https://confluxscan.io/address/${address}`;
    } else {
        return isEspaceAddress
            ? `https://evmtestnet.confluxscan.io/address/${address}`
            : `https://testnet.confluxscan.io/address/${address}`;
    }
}

const MAINNET_DEFAULT_TOKENS: TokenList = {
    CFX: {
        address: "0x14b2D3bC65e74DAE1030EAFd8ac30c533c976A9b",
        decimals: "18",
        name: "Conflux",
        symbol: "CFX"
    },
    USDT: {
        address: "0xfe97E85d13ABD9c1c33384E796F10B73905637cE",
        decimals: "18",
        name: "Tether USD",
        symbol: "USDT"
    },
    USDC: {
        address: "0x6963EfED0aB40F6C3d7BdA44A05dcf1437C44372",
        decimals: "18",
        name: "USD Coin",
        symbol: "USDC"
    },
    // Add more mainnet tokens as needed
};

const TESTNET_DEFAULT_TOKENS: TokenList = {
    WCFX: {
        address: "0x2ed3dddae5b2f321af0806181fbfa6d049be47d8",
        decimals: "18",
        name: "Conflux",
        symbol: "CFX"
    },
    USDT: {
        address: "0x7d682e65efc5c13bf4e394b8f376c48e6bae0355",
        decimals: "18",
        name: "Faucet USDT",
        symbol: "USDT"
    },
    ETH: {
        address: "0xcd71270f82f319e0498ff98af8269c3f0d547c65",
        decimals: "18",
        name: "Faucet ETH",
        symbol: "ETH"
    },
    BTC: {
        address: "0x54593e02c39aeff52b166bd036797d2b1478de8d",
        decimals: "18",
        name: "Faucet BTC",
        symbol: "BTC"
    },
    USDC: {
        address: "0xfbef97434ffd0587e5a1c88efd5f7bdc405ba6fa",
        decimals: "18",
        name: "Faucet USDC",
        symbol: "USDC"
    },
    NUT: {
        address: "0x48ee76131e70762db59a37e6008cce082805ab00",
        decimals: "18",
        name: "Nucleon Governance Token (NUT)",
        symbol: "NUT"
    },
    PHX: {
        address: "0x2d11f1ba2e5f0c27e5782b4d3ac64adaf12d6bc3",
        decimals: "18",
        name: "PHX Governance Token (PHX)",
        symbol: "PHX"
    },
    PPI: {
        address: "0x49916ba65d0048c4bbb0a786a527d98d10a1cd2d",
        decimals: "18",
        name: "PPI Governance Token (PPI)",
        symbol: "PPI"
    },
    // Add more testnet tokens as needed
};

export class TokenListManager {
    private tokenList: TokenList = {};
    private pools: FormattedPool[] = [];

    constructor(
        private geckoTerminal?: GeckoTerminal,
        private confluxScanESpace?: ConfluxScanESpace,
        private espaceWalletAddress?: Address,
        private minReserveUSD: number = 2000
    ) {}

    async initialize(target: ConfluxTarget): Promise<void> {
        await this.loadFromGeckoTerminal();

        // If tokenList is empty after GeckoTerminal load, use default list
        if (Object.keys(this.tokenList).length === 0) {
            elizaLogger.debug("No tokens loaded from GeckoTerminal, using default token list");
            this.tokenList = target === "mainnet"
                ? MAINNET_DEFAULT_TOKENS
                : TESTNET_DEFAULT_TOKENS;

            elizaLogger.debug(`Loaded ${Object.keys(this.tokenList).length} default tokens for ${target}`);
        }

        if (this.espaceWalletAddress) {
            await this.loadFromWallet();
        }
    }

    public async loadFromGeckoTerminal(): Promise<void> {
        if (!this.geckoTerminal) return;

        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));
        const BATCH_SIZE = 30;

        try {
            const allPools = await this.geckoTerminal.getFormattedTopPools(10);

            const uniqueTokenAddresses = Array.from(
                new Set(
                    allPools.flatMap((pool) => [
                        pool.baseTokenAddress,
                        pool.quoteTokenAddress,
                    ])
                )
            );

            elizaLogger.debug(
                `Found ${uniqueTokenAddresses.length} unique tokens to fetch`
            );

            for (let i = 0; i < uniqueTokenAddresses.length; i += BATCH_SIZE) {
                const batch = uniqueTokenAddresses.slice(i, i + BATCH_SIZE);

                try {
                    const tokenInfos =
                        await this.geckoTerminal.getMultiTokenInfo(batch);

                    for (const tokenData of tokenInfos.data) {
                        const token = tokenData.attributes;
                        this.tokenList[token.symbol] = {
                            address: token.address,
                            decimals: token.decimals.toString() || "18",
                            name: token.name,
                            symbol: token.symbol,
                        };
                    }

                    if (i + BATCH_SIZE < uniqueTokenAddresses.length) {
                        await delay(50);
                    }
                } catch (error) {
                    if ((error as any).status === 429) {
                        elizaLogger.warn(
                            "Rate limit hit, waiting for 5 seconds before retrying..."
                        );
                        await delay(5000);
                        try {
                            const tokenInfos =
                                await this.geckoTerminal.getMultiTokenInfo(
                                    batch
                                );

                            for (const tokenData of tokenInfos.data) {
                                const token = tokenData.attributes;
                                this.tokenList[token.symbol] = {
                                    address: token.address,
                                    decimals: token.decimals.toString() || "18",
                                    name: token.name,
                                    symbol: token.symbol,
                                };
                            }
                        } catch (retryError) {
                            elizaLogger.error(
                                `Error fetching token info batch after retry:`,
                                retryError
                            );
                            elizaLogger.error("Failed addresses:", batch);
                        }
                    } else {
                        elizaLogger.error(
                            `Error fetching token info batch:`,
                            error
                        );
                        elizaLogger.error("Failed addresses:", batch);
                    }
                }
            }

            this.pools = allPools.filter(
                (pool) => Number(pool.reserveUSD) >= this.minReserveUSD
            );

            elizaLogger.debug(
                `Successfully loaded ${Object.keys(this.tokenList).length} tokens`
            );
            elizaLogger.debug(
                `Filtered to ${this.pools.length} pools with minimum reserve of $${this.minReserveUSD}`
            );
        } catch (error) {
            elizaLogger.error(
                "Error loading tokens from GeckoTerminal:",
                error
            );
        }
    }

    public async loadFromWallet(address?: Address): Promise<TokenInfo[]> {
        if (!this.confluxScanESpace) return [];

        const walletAddress = address || this.espaceWalletAddress;
        if (!walletAddress) return [];

        try {
            const walletTokens =
                await this.confluxScanESpace.getAccountTokens(walletAddress);
            const addedTokens: TokenInfo[] = [];

            for (const token of walletTokens) {
                if (token.type === "ERC20") {
                    const tokenInfo: TokenInfo = {
                        address: token.contract,
                        decimals: token.decimals.toString(),
                        name: token.name,
                        symbol: token.symbol,
                    };

                    this.tokenList[token.symbol] = tokenInfo;
                    addedTokens.push(tokenInfo);
                }
            }

            return addedTokens;
        } catch (error) {
            elizaLogger.error("Error loading tokens from wallet:", error);
            return [];
        }
    }

    getPools(): FormattedPool[] {
        return this.pools;
    }

    search(query: string): TokenInfo[] {
        const normalizedQuery = query.toLowerCase();
        return Object.values(this.tokenList).filter(
            (token) =>
                token.symbol.toLowerCase().includes(normalizedQuery) ||
                token.name.toLowerCase().includes(normalizedQuery) ||
                token.address.toLowerCase().includes(normalizedQuery)
        );
    }

    getTokenList(): TokenList {
        return this.tokenList;
    }

    getTokenBySymbol(symbol: string): TokenInfo | undefined {
        return this.tokenList[symbol.toUpperCase()];
    }

    getTokenByAddress(address: string): TokenInfo | undefined {
        return Object.values(this.tokenList).find(
            (token) => token.address.toLowerCase() === address.toLowerCase()
        );
    }

    formatPoolsToText(
        pools: FormattedPool[] = this.pools,
        target: ConfluxTarget = 'mainnet'
    ): string {
        return pools
            .map(
                (pool) =>
                    `Pool: ${pool.name}\n` +
                    `Price: ${pool.price}\n` +
                    `24h Volume: ${pool.volume24h}\n` +
                    `24h Trades: ${pool.trades24h.total} (${pool.trades24h.buys} buys, ${pool.trades24h.sells} sells)\n` +
                    `24h Price Change: ${pool.priceChange24h}\n` +
                    `Pool Address: ${pool.poolAddress} (${getConfluxScanUrl(pool.poolAddress, target)})\n` +
                    `Base Token Address: ${pool.baseTokenAddress} (${getConfluxScanUrl(pool.baseTokenAddress, target)})\n` +
                    `Quote Token Address: ${pool.quoteTokenAddress} (${getConfluxScanUrl(pool.quoteTokenAddress, target)})\n` +
                    `Created At: ${pool.createdAt}\n` +
                    `Reserve USD: $${Number(pool.reserveUSD).toLocaleString()}\n` +
                    `Base Token Price: $${Number(pool.baseTokenPriceUSD).toFixed(6)}\n` +
                    `Quote Token Price: $${Number(pool.quoteTokenPriceUSD).toFixed(6)}\n` +
                    `Base Token Price (Native): ${Number(pool.baseTokenPriceNative).toFixed(6)}\n` +
                    `-----------------`
            )
            .join("\n\n");
    }

    formatTokensToText(
        tokens: TokenInfo[] = Object.values(this.tokenList),
        target: ConfluxTarget = 'mainnet'
    ): string {
        return tokens
            .map(
                (token) =>
                    `Token: ${token.name} (${token.symbol})\n` +
                    `Address: ${token.address} (${getConfluxScanUrl(token.address, target)})\n` +
                    `Decimals: ${token.decimals}\n` +
                    `-----------------`
            )
            .join("\n\n");
    }

    getTopGainers(limit: number = 5): string {
        const sortedPools = [...this.pools].sort((a, b) =>
            parseFloat(b.priceChange24h) - parseFloat(a.priceChange24h)
        );
        return `Top ${limit} Price Gainers (24h):\n\n` +
            sortedPools.slice(0, limit)
                .map(pool => `${pool.name}: ${pool.priceChange24h}% | Current Price: ${pool.price}`)
                .join('\n');
    }

    getTopLosers(limit: number = 5): string {
        const sortedPools = [...this.pools].sort((a, b) =>
            parseFloat(a.priceChange24h) - parseFloat(b.priceChange24h)
        );
        return `Top ${limit} Price Losers (24h):\n\n` +
            sortedPools.slice(0, limit)
                .map(pool => `${pool.name}: ${pool.priceChange24h}% | Current Price: ${pool.price}`)
                .join('\n');
    }

    getPoolsByAge(newest: boolean = true, limit: number = 5): string {
        const sortedPools = [...this.pools].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return newest ? dateB - dateA : dateA - dateB;
        });

        return `${newest ? 'Newest' : 'Oldest'} ${limit} Pools:\n\n` +
            sortedPools.slice(0, limit)
                .map(pool => `${pool.name}: Created ${new Date(pool.createdAt).toLocaleDateString()} | Reserve: $${Number(pool.reserveUSD).toLocaleString()}`)
                .join('\n');
    }

    getTopVolume(limit: number = 5): string {
        const sortedPools = [...this.pools].sort((a, b) =>
            parseFloat(b.volume24h) - parseFloat(a.volume24h)
        );
        return `Top ${limit} Pools by 24h Volume:\n\n` +
            sortedPools.slice(0, limit)
                .map(pool => `${pool.name}: $${pool.volume24h} | Price: ${pool.price}`)
                .join('\n');
    }

    getTopTrades(limit: number = 5): string {
        const sortedPools = [...this.pools].sort((a, b) =>
            b.trades24h.total - a.trades24h.total
        );
        return `Top ${limit} Pools by 24h Trades:\n\n` +
            sortedPools.slice(0, limit)
                .map(pool => `${pool.name}: ${pool.trades24h.total} trades (${pool.trades24h.buys} buys, ${pool.trades24h.sells} sells)`)
                .join('\n');
    }

    getMostBuyPressure(limit: number = 5): string {
        const sortedPools = [...this.pools].sort((a, b) =>
            (b.trades24h.buys / b.trades24h.total) - (a.trades24h.buys / a.trades24h.total)
        );
        return `Top ${limit} Pools by Buy Pressure:\n\n` +
            sortedPools.slice(0, limit)
                .map(pool => {
                    const buyPercentage = ((pool.trades24h.buys / pool.trades24h.total) * 100).toFixed(1);
                    return `${pool.name}: ${buyPercentage}% buys | ${pool.trades24h.buys} buys of ${pool.trades24h.total} total trades`;
                })
                .join('\n');
    }

    getMostSellPressure(limit: number = 5): string {
        const sortedPools = [...this.pools].sort((a, b) =>
            (b.trades24h.sells / b.trades24h.total) - (a.trades24h.sells / a.trades24h.total)
        );
        return `Top ${limit} Pools by Sell Pressure:\n\n` +
            sortedPools.slice(0, limit)
                .map(pool => {
                    const sellPercentage = ((pool.trades24h.sells / pool.trades24h.total) * 100).toFixed(1);
                    return `${pool.name}: ${sellPercentage}% sells | ${pool.trades24h.sells} sells of ${pool.trades24h.total} total trades`;
                })
                .join('\n');
    }

    getMarketAnalysis(): string {
        return `Market Analysis Summary:\n\n` +
            `${this.getTopGainers(3)}\n\n` +
            `${this.getTopLosers(3)}\n\n` +
            `${this.getTopVolume(3)}\n\n` +
            `${this.getTopTrades(3)}\n\n` +
            `${this.getPoolsByAge(true, 3)}`;
    }
}
