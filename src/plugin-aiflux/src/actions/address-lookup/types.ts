import { z } from "zod";
import { isAddress } from "viem";
import { isAddress as isCoreAddress } from "cive/utils";

export const AddressLookupParamsSchema = z.object({
    type: z.literal("address_lookup", {
        required_error: "Type must be exactly 'address_lookup'",
        invalid_type_error: "Type must be exactly 'address_lookup'",
    }),
    address: z
        .string()
        .refine((addr) => isAddress(addr) || isCoreAddress(addr), {
            message:
                "Address must be a valid Ethereum (0x) or Conflux (cfx) address",
        }),
});

export type AddressLookupParams = z.infer<typeof AddressLookupParamsSchema>;

export interface ContractInfo {
    isContract: true;
    type?: "token" | "nft" | "unknown";
    isVerified: boolean;
    abi?: any;
    name?: string;
    symbol?: string;
    decimals?: number;
}

export interface AccountInfo {
    isContract: false;
    balance: string;
    tokens?: Array<{
        address: string;
        symbol: string;
        balance: string;
    }>;
}

export type AddressInfo = ContractInfo | AccountInfo;
