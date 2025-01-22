import { type ActionExample } from "@elizaos/core";

export const tokenTransferExamples: ActionExample[][] = [
    // Happy path - Core network ERC20
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token PPI: 10 PPI to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully sent 10 PPI to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957 on Core network\nTransaction: 0x...",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Happy path - Core network with decimals
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token USDT: 100.123456789 USDT to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully sent 100.123456789 USDT to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957 on Core network\nNote: Amount rounded to 6 decimals: 100.123456 USDT\nTransaction: 0x...",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Happy path - eSpace network with contract address
    [
        {
            user: "{{user1}}",
            content: {
                text: "Send token by contract: 5.5 tokens@0x1234567890123456789012345678901234567890 to 0x149F3fE7A7dFe1A465557f1d26065f3974162EcB",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully sent 5.5 tokens to 0x149F3fE7A7dFe1A465557f1d26065f3974162EcB on eSpace network\nTransaction: 0x...",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Happy path - Token requiring approval
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token WETH: 2 WETH to 0x149F3fE7A7dFe1A465557f1d26065f3974162EcB",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "🔄 Approval needed for WETH transfer...\n✅ Approval transaction successful: 0x...\n✅ Successfully sent 2 WETH to 0x149F3fE7A7dFe1A465557f1d26065f3974162EcB\nTransaction: 0x...",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Happy path - Token with custom name
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token pi: 10 pi to 0x149F3fE7A7dFe1A465557f1d26065f3974162EcB",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully sent 10 pi to 0x149F3fE7A7dFe1A465557f1d26065f3974162EcB on eSpace network\nTransaction: 0x...",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Error - Invalid amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token PPI: -5 PPI to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: amount must be a valid number string",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Error - Token not found
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token INVALID_TOKEN: 5 INVALID_TOKEN to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: Token 'INVALID_TOKEN' not found in your wallet",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Error - Ambiguous token symbol
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token US: 5 US to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Token symbol 'US' matches multiple tokens. Please use the contract address instead.\nExample: send 5 tokens@0x1234... to cfx:...",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Error - Insufficient token balance
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token USDT: 1000000 USDT to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: Insufficient USDT balance. Available: 100 USDT, Requested: 1000000 USDT",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Error - Approval failed
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token DAI: 50 DAI to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: Token approval rejected or failed. Please try again and approve the transaction",
                action: "SEND_TOKEN",
            },
        },
    ],
    // Error - Paused token
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer token PAUSED: 10 PAUSED to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: Token contract is currently paused. Transfers are temporarily disabled",
                action: "SEND_TOKEN",
            },
        },
    ],
];
