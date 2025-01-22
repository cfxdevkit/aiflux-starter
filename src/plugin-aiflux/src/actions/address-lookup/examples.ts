import { type ActionExample } from "@elizaos/core";

export const addressLookupExamples: ActionExample[][] = [
    // Happy path - Contract address (ERC20)
    [
        {
            user: "{{user1}}",
            content: {
                text: "Show me info about 0x1234567890123456789012345678901234567890",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "🔍 Detective mode activated! Let me investigate this address in the Conflux blockchain archives...",
                action: "ADDRESS_LOOKUP",
                suppressResponse: true
            },
        },
    ],
    // Happy path - NFT Contract
    [
        {
            user: "{{user1}}",
            content: {
                text: "What contract is at 0x2345678901234567890123456789012345678901",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "🕵️ Time to decode this contract's secrets! Diving into the blockchain...",
                action: "ADDRESS_LOOKUP",
                suppressResponse: true
            },
        },
    ],
    // Happy path - Proxy Contract
    [
        {
            user: "{{user1}}",
            content: {
                text: "Lookup contract at 0x3456789012345678901234567890123456789012",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "🎭 Ah, a mysterious address! Let me unmask its true identity...",
                action: "ADDRESS_LOOKUP",
                suppressResponse: true
            },
        },
    ],
    // Happy path - Account address with tokens
    [
        {
            user: "{{user1}}",
            content: {
                text: "Tell me about address cfx:aap1234567890123456789012345678901234567890",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "📊 Opening the blockchain ledger to check this address's story...",
                action: "ADDRESS_LOOKUP",
                suppressResponse: true
            },
        },
    ],
    // Happy path - Account with NFTs
    [
        {
            user: "{{user1}}",
            content: {
                text: "Check holdings at cfx:aak9876543210987654321098765432109876543210",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "🎨 Time to explore this digital art gallery! Scanning for NFTs and tokens...",
                action: "ADDRESS_LOOKUP",
                suppressResponse: true
            },
        },
    ],
    // Error - Unverified contract
    [
        {
            user: "{{user1}}",
            content: {
                text: "Show contract info for 0x4567890123456789012345678901234567890123",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "🔬 Contract analysis mode engaged! Let me examine this closely...",
                action: "ADDRESS_LOOKUP",
                suppressResponse: true
            },
        },
    ],
    // Error - Invalid address format
    [
        {
            user: "{{user1}}",
            content: {
                text: "Check details of invalid-address",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "🧐 Let me validate this address format first...",
                action: "ADDRESS_LOOKUP",
                suppressResponse: true
            },
        },
    ],
    // Error - Empty account
    [
        {
            user: "{{user1}}",
            content: {
                text: "Look up cfx:aam0000000000000000000000000000000000000000",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "🔭 Exploring the depths of Conflux for this address...",
                action: "ADDRESS_LOOKUP",
                suppressResponse: true
            },
        },
    ],
];
