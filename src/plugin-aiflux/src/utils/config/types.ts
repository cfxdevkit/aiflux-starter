export interface TokenInfo {
    address: string;
    decimals: string;
    name: string;
    symbol: string;
}

export interface TokenList {
    [symbol: string]: TokenInfo;
}

export type ConfluxTarget = "mainnet" | "testnet";
