import { type ActionExample } from "@elizaos/core";

export const bridgeExamples: ActionExample[][] = [
    // Happy path - mainnet small amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bridge my CFX to eSpace: 5 CFX to 0x1234567890123456789012345678901234567890",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully bridged 5 CFX to 0x1234567890123456789012345678901234567890 on eSpace network\nTransaction: 0x...",
                action: "BRIDGE_CFX",
            },
        },
    ],
    // Happy path - mainnet large amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Cross-space transfer 1000 CFX to 0x1234567890123456789012345678901234567890",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully bridged 1000 CFX to 0x1234567890123456789012345678901234567890 on eSpace network\nNote: Large transfers may take longer to confirm\nTransaction: 0x...",
                action: "BRIDGE_CFX",
            },
        },
    ],
    // Happy path - testnet
    [
        {
            user: "{{user1}}",
            content: {
                text: "Cross-space transfer 5 CFX to 0x1234567890123456789012345678901234567890 on testnet",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "✅ Successfully bridged 5 CFX to 0x1234567890123456789012345678901234567890 on eSpace testnet\nTransaction: 0x...",
                action: "BRIDGE_CFX",
            },
        },
    ],
    // Error - Insufficient balance
    [
        {
            user: "{{user1}}",
            content: {
                text: "Cross-space bridge 1000000 CFX to 0x1234567890123456789012345678901234567890",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Bridge operation failed: Insufficient balance. Available: 100 CFX, Requested: 1000000 CFX",
                action: "BRIDGE_CFX",
            },
        },
    ],
    // Error - Invalid amount
    [
        {
            user: "{{user1}}",
            content: {
                text: "Cross-space bridge -5 CFX to espace",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Bridge operation failed: amount must be a valid number string",
                action: "BRIDGE_CFX",
            },
        },
    ],
    // Error - Invalid address
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bridge 5 CFX from core to invalid-address",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Bridge operation failed: toAddress must be a valid Ethereum-style address",
                action: "BRIDGE_CFX",
            },
        },
    ],
    // Error - Below minimum
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bridge 0.0001 CFX to 0x1234567890123456789012345678901234567890",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Bridge operation failed: Amount must be at least 0.1 CFX",
                action: "BRIDGE_CFX",
            },
        },
    ],
    // Error - Network congestion
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bridge 100 CFX to 0x1234567890123456789012345678901234567890",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "❌ Bridge operation failed: Network congestion detected. Please try again later or use a higher gas limit",
                action: "BRIDGE_CFX",
            },
        },
    ],
];
