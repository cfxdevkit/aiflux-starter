import { type ActionExample } from "@elizaos/core";

export const espaceSwapExamples: ActionExample[][] = [
    // Happy path - Small swap
    [
        {
            user: "{{user1}}",
            content: {
                text: "Swap on eSpace: 10 CFX for USDT",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully swapped 10 CFX for 12.5 USDT on eSpace network\nRate: 1 CFX = 1.25 USDT\nSlippage: 0.5%\nTransaction: 0x...",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Happy path - Large swap with price impact
    [
        {
            user: "{{user1}}",
            content: {
                text: "Exchange on eSpace DEX: 1000 USDT to ETH",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully swapped 1000 USDT for 0.48 ETH on eSpace network\nRate: 1 ETH = 2083.33 USDT\nPrice Impact: 2.5%\nWarning: Large trade affected market price\nTransaction: 0x...",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Happy path - Stable swap
    [
        {
            user: "{{user1}}",
            content: {
                text: "Swap on eSpace DEX: 100 USDT to USDC",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully swapped 100 USDT for 99.95 USDC on eSpace network\nRate: 1 USDT = 0.9995 USDC\nFee: 0.05%\nTransaction: 0x...",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Happy path - Multi-hop swap
    [
        {
            user: "{{user1}}",
            content: {
                text: "Exchange on eSpace: 50 BTC to USDC",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully swapped 50 BTC for 2,250,000 USDC on eSpace network\nRoute: BTC → ETH → USDC\nRate: 1 BTC = 45,000 USDC\nTotal Fee: 0.6%\nTransaction: 0x...",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Error - Invalid amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Swap on eSpace DEX: -5 CFX for USDT",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Swap failed: amount must be a valid positive number",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Error - Unsupported token
    [
        {
            user: "{{user1}}",
            content: {
                text: "Exchange on eSpace: 10 INVALID_TOKEN for USDT",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Swap failed: Token 'INVALID_TOKEN' not supported. Available tokens: CFX, USDT, ETH, BTC, USDC",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Error - Insufficient liquidity
    [
        {
            user: "{{user1}}",
            content: {
                text: "Swap on eSpace: 10000 ETH to USDT",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Swap failed: Insufficient liquidity for this trade. Maximum available: 5000 ETH",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Error - High price impact
    [
        {
            user: "{{user1}}",
            content: {
                text: "Exchange on eSpace DEX: 5000 CFX to USDT",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Swap failed: Price impact too high (15%). Maximum allowed: 10%",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Error - Insufficient balance
    [
        {
            user: "{{user1}}",
            content: {
                text: "Swap on eSpace: 1000000 USDT to ETH",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Swap failed: Insufficient USDT balance. Available: 10000 USDT, Requested: 1000000 USDT",
                action: "SWAP_ESPACE",
            },
        },
    ],
    // Error - Paused pool
    [
        {
            user: "{{user1}}",
            content: {
                text: "Swap on eSpace: 100 CFX to BTC",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Swap failed: Trading pair CFX/BTC is temporarily paused",
                action: "SWAP_ESPACE",
            },
        },
    ],
];
