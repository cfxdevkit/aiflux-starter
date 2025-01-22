import { z } from "zod";
import { isAddress as isEspaceAddress } from "viem";
import { isAddress as isCoreAddress } from "cive/utils";

export type NetworkType = "core" | "espace";

export const TokenTransferParamsSchema = z.object({
    type: z.literal("send_token", {
        required_error: "Type must be exactly 'send_token'",
        invalid_type_error: "Type must be exactly 'send_token'",
    }),
    network: z.enum(["core", "espace"], {
        required_error: "Network must be either 'core' or 'espace'",
    }),
    toAddress: z
        .string()
        .refine(
            (address) => isEspaceAddress(address) || isCoreAddress(address),
            {
                message:
                    "toAddress must be a valid Conflux Core or eSpace address",
            }
        ),
    amount: z.string().regex(/^\d+(\.\d+)?$/, {
        message: "amount must be a valid number string",
    }),
    token: z.string({
        required_error: "Token symbol or contract address is required",
    }),
});

export type TokenTransferParams = z.infer<typeof TokenTransferParamsSchema>;
