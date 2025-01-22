import { type ActionExample } from "@elizaos/core";

export const cfxTransferExamples: ActionExample[][] = [
    // Happy path - Core network small amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer native CFX: 5 CFX to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully sent 5 CFX to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957 on Core network\nTransaction: 0x...",
                action: "SEND_CFX",
            },
        },
    ],
    // Happy path - Core network large amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer native CFX: 1000 CFX to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully sent 1000 CFX to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957 on Core network\nNote: Large transfer completed with higher gas price\nTransaction: 0x...",
                action: "SEND_CFX",
            },
        },
    ],
    // Happy path - eSpace network
    [
        {
            user: "{{user1}}",
            content: {
                text: "Send native CFX: 2.5 CFX to 0x1234567890123456789012345678901234567890",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully sent 2.5 CFX to 0x1234567890123456789012345678901234567890 on eSpace network\nTransaction: 0x...",
                action: "SEND_CFX",
            },
        },
    ],
    // Happy path - testnet
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer native CFX: 5 CFX to cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully sent 5 CFX to cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957 on Core testnet\nTransaction: 0x...",
                action: "SEND_CFX",
            },
        },
    ],
    // Error - Invalid amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer native CFX: -5 CFX to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: amount must be a valid number string",
                action: "SEND_CFX",
            },
        },
    ],
    // Error - Invalid address
    [
        {
            user: "{{user1}}",
            content: {
                text: "Send native CFX: 5 CFX to invalid-address",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: address must be a valid Conflux Core or eSpace address",
                action: "SEND_CFX",
            },
        },
    ],
    // Error - Insufficient balance
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer native CFX: 1000000 CFX to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: Insufficient balance. Available: 100 CFX, Requested: 1000000 CFX",
                action: "SEND_CFX",
            },
        },
    ],
    // Error - Below dust amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer native CFX: 0.000000001 CFX to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: Amount too small. Minimum transfer amount is 0.000001 CFX",
                action: "SEND_CFX",
            },
        },
    ],
    // Error - Network congestion
    [
        {
            user: "{{user1}}",
            content: {
                text: "Transfer native CFX: 100 CFX to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Transfer failed: Network congestion detected. Please try again with higher gas price",
                action: "SEND_CFX",
            },
        },
    ],
];
