import { z } from "zod";
import { TokenData as ScannerTokenData } from "../../utils/scanner/types";

// ABI Response Types
export interface ABIParameter {
    internalType: string;
    name: string;
    type: string;
    indexed?: boolean;
}

export interface ABIEvent {
    anonymous: boolean;
    inputs: ABIParameter[];
    name: string;
    type: "event";
}

export interface ABIFunction {
    inputs: ABIParameter[];
    name: string;
    outputs?: ABIParameter[];
    stateMutability: "pure" | "view" | "nonpayable" | "payable";
    type: "function" | "constructor" | "receive" | "fallback";
}

export type ABIItem = ABIEvent | ABIFunction;

// Re-export TokenData from scanner
export type TokenData = ScannerTokenData;

// Address Lookup Types
export const AddressLookupParamsSchema = z.object({
    address: z
        .string()
        .refine(
            (val) => val.startsWith("0x") || val.startsWith("cfx:"),
            "Address must start with 0x or cfx:"
        ),
});

export type AddressLookupParams = z.infer<typeof AddressLookupParamsSchema>;

export interface ContractInfo {
    isContract: true;
    type: "token" | "nft" | "unknown";
    isVerified: boolean;
    abi: ABIItem[] | null;
}

export interface AccountInfo {
    isContract: false;
    balance: string;
    tokens: TokenData[];
}

export type AddressInfo = ContractInfo | AccountInfo;
