import { z } from "zod";
import { isAddress } from "viem";

export const EspaceSwapParamsSchema = z.object({
    type: z.literal("swap_espace", {
        required_error: "Type must be exactly 'swap_espace'",
        invalid_type_error: "Type must be exactly 'swap_espace'",
    }),
    fromToken: z.string(),
    toToken: z.string(),
    amount: z.string().regex(/^\d+(\.\d+)?$/, {
        message: "amount must be a valid number string",
    }),
});

export type EspaceSwapParams = z.infer<typeof EspaceSwapParamsSchema>;

// Token addresses on Conflux eSpace
export const TOKENS = {
    CFX: "0x14b2D3bC65e74DAE1030EAFd8ac30c533c976A9b", // WCFX
    WCFX: "0x14b2D3bC65e74DAE1030EAFd8ac30c533c976A9b",
    USDT: "0xfe97e85d13abd9c1c33384e796f10b73905637ce",
    ETH: "0xa47f43de2f9623acb395ca4905746496d2014d57",
    BTC: "0x1f545487c62e5acfea45dcadd9c627361d1616d8",
    USDC: "0x6963efed0ab40f6c3d7bda44a05dcf1437c44372",
} as const;

export const DECIMALS: { [key: string]: number } = {
    [TOKENS.CFX]: 18,
    [TOKENS.USDT]: 18,
    [TOKENS.ETH]: 18,
    [TOKENS.BTC]: 18,
    [TOKENS.USDC]: 18,
};

// Swappi Router contract address
export const SWAPPI_ROUTER = "0x62b0873055bf896dd869e172119871ac24aea305";
