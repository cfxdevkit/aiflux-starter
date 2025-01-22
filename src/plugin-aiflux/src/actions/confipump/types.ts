import { z } from "zod";
import { Content, elizaLogger } from "@elizaos/core";

export const TransferSchema = z.object({
    to: z.string(),
    amount: z.number(), // use number ignoring decimals issue
});

export interface TransferContent {
    to: string;
    amount: number;
}

export const isTransferContent = (object: any): object is TransferContent => {
    if (TransferSchema.safeParse(object).success) {
        return true;
    }
    elizaLogger.error("Invalid content: ", object);
    return false;
};

export const PumpCreateSchema = z.object({
    action: z.literal("CREATE_TOKEN"),
    params: z.object({
        symbol: z.string(),
        name: z.string(),
        description: z.string(),
    }),
});

export const PumpBuySchema = z.object({
    action: z.literal("BUY_TOKEN"),
    params: z.object({
        tokenAddress: z.string(),
        value: z.number(),
    }),
});

export const PumpSellSchema = z.object({
    action: z.literal("SELL_TOKEN"),
    params: z.object({
        tokenAddress: z.string(),
        value: z.number(),
    }),
});

export const PumpSchema = z.union([
    PumpCreateSchema,
    PumpBuySchema,
    PumpSellSchema,
]);

export type PumpContent = z.infer<typeof PumpSchema>;
export type PumpCreateContent = z.infer<typeof PumpCreateSchema>;
export type PumpBuyContent = z.infer<typeof PumpBuySchema>;
export type PumpSellContent = z.infer<typeof PumpSellSchema>;

export function isPumpContent(object: any): object is PumpContent {
    if (PumpSchema.safeParse(object).success) {
        return true;
    }
    elizaLogger.error("Invalid content: ", object);
    return false;
}

export function isPumpCreateContent(object: any): object is PumpCreateContent {
    return PumpCreateSchema.safeParse(object).success;
}

export function isPumpBuyContent(object: any): object is PumpBuyContent {
    return PumpBuySchema.safeParse(object).success;
}

export function isPumpSellContent(object: any): object is PumpSellContent {
    return PumpSellSchema.safeParse(object).success;
}

export const TopPoolsSchema = z.object({
    type: z.literal("POOLS_INFO"),
    action: z.literal("GET_POOLS"),
});

export type TopPoolsContent = z.infer<typeof TopPoolsSchema>;

export const isTopPoolsContent = (obj: any): obj is TopPoolsContent => {
    return TopPoolsSchema.safeParse(obj).success;
};

export const SwapSchema = z.object({
    action: z.literal("swap"),
    params: z.object({
        text: z.string(),
        amount: z.number(),
        fromToken: z.string(),
        toToken: z.string(),
    }),
});

export type SwapContent = z.infer<typeof SwapSchema>;

export function isSwapContent(object: unknown): object is SwapContent {
    elizaLogger.debug("Validating content:", object);
    const result = SwapSchema.safeParse(object);
    if (!result.success) {
        elizaLogger.error("Validation errors:", result.error);
        return false;
    }
    return true;
}

export const ERC20TransferSchema = z.object({
    text: z.string(),
    action: z.literal("SEND_TOKEN"),
    params: z.object({
        amount: z.number(),
        token: z.string(),
        to: z.string(),
    }),
});

export type ERC20TransferContent = z.infer<typeof ERC20TransferSchema>;

export function isERC20TransferContent(
    object: unknown
): object is ERC20TransferContent {
    elizaLogger.debug("Validating ERC20 transfer content:", object);
    const result = ERC20TransferSchema.safeParse(object);
    if (!result.success) {
        elizaLogger.error("ERC20 transfer validation errors:", result.error);
        return false;
    }
    return true;
}
