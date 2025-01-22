import { z } from "zod";
import { isAddress } from "viem";

export const BridgeParamsSchema = z.object({
    type: z.literal("bridge_cfx", {
        required_error: "Type must be exactly 'bridge_cfx'",
        invalid_type_error: "Type must be exactly 'bridge_cfx'",
    }),
    fromNetwork: z.literal("core", {
        required_error: "Bridge operation is only supported from Core network",
        invalid_type_error:
            "Bridge operation is only supported from Core network",
    }),
    toNetwork: z.literal("espace", {
        required_error: "Bridge operation can only be to eSpace network",
        invalid_type_error: "Bridge operation can only be to eSpace network",
    }),
    toAddress: z.string().refine(isAddress, {
        message: "toAddress must be a valid Ethereum address",
    }),
    amount: z.string().regex(/^\d+(\.\d+)?$/, {
        message: "amount must be a valid number string",
    }),
});

export type BridgeParams = z.infer<typeof BridgeParamsSchema>;
