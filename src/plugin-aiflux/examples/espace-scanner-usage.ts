import { ESpaceScanner } from "../src/utils/scanner/espace.js";

async function demonstrateESpaceScannerUsage() {
    // Initialize scanners for different networks
    const mainnetScanner = new ESpaceScanner("mainnet");
    const testnetScanner = new ESpaceScanner("testnet");
    const scannerWithApiKey = new ESpaceScanner("mainnet", "YOUR_API_KEY");

    try {
        console.log("=== Contract Methods ===");
        // Example contract address - replace with a real one
        const contractAddress = "0x1f545487c62e5acfea45dcadd9c627361d1616d8";

        const contractABI = await mainnetScanner.getContractABI(contractAddress);
        console.log("Contract ABI:", contractABI);

        const contractSource = await mainnetScanner.getContractSourceCode(contractAddress);
        console.log("Contract Source:", contractSource);

        console.log("\n=== Token Methods ===");
        // Example wallet address - replace with a real one
        const walletAddress = "0x8bf657baf28a9ec375a415a3621c61434350f2c6";

        const erc20Tokens = await mainnetScanner.getAccountTokens(walletAddress, "ERC20");
        console.log("ERC20 Tokens:", erc20Tokens);

        const erc721Tokens = await mainnetScanner.getAccountTokens(walletAddress, "ERC721");
        console.log("ERC721 Tokens:", erc721Tokens);

        const tokenInfos = await mainnetScanner.getTokenInfos([contractAddress]);
        console.log("Token Infos:", tokenInfos);

        console.log("\n=== Basic Statistics Methods ===");
        const statsParams = {
            minTimestamp: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60, // 7 days ago
            maxTimestamp: Math.floor(Date.now() / 1000),
            limit: 5,
        };
        console.log("statsParams", statsParams);
        const activeAccounts = await mainnetScanner.getActiveAccountStats(statsParams);
        console.log("Active Accounts:", activeAccounts);

        const cfxHolders = await mainnetScanner.getCfxHolderStats(statsParams);
        console.log("CFX Holders:", cfxHolders);

        const accountGrowth = await mainnetScanner.getAccountGrowthStats(statsParams);
        console.log("Account Growth:", accountGrowth);

        const contractStats = await mainnetScanner.getContractStats(statsParams);
        console.log("Contract Stats:", contractStats);

        const transactionStats = await mainnetScanner.getTransactionStats(statsParams);
        console.log("Transaction Stats:", transactionStats);

        const cfxTransferStats = await mainnetScanner.getCfxTransferStats(statsParams);
        console.log("CFX Transfer Stats:", cfxTransferStats);

        const tpsStats = await mainnetScanner.getTpsStats({ ...statsParams, intervalType: "hour" });
        console.log("TPS Stats:", tpsStats);

        console.log("\n=== Top Statistics Methods ===");
        const topGasUsed = await mainnetScanner.getTopGasUsed("24h");
        console.log("Top Gas Used:", topGasUsed);

        const topTxSenders = await mainnetScanner.getTopTransactionSenders("24h");
        console.log("Top Transaction Senders:", topTxSenders);

        const topTxReceivers = await mainnetScanner.getTopTransactionReceivers("24h");
        console.log("Top Transaction Receivers:", topTxReceivers);

        const topCfxSenders = await mainnetScanner.getTopCfxSenders("24h");
        console.log("Top CFX Senders:", topCfxSenders);

        const topCfxReceivers = await mainnetScanner.getTopCfxReceivers("24h");
        console.log("Top CFX Receivers:", topCfxReceivers);

        const topTokenTransfers = await mainnetScanner.getTopTokenTransfers("24h");
        console.log("Top Token Transfers:", topTokenTransfers);

        const topTokenSenders = await mainnetScanner.getTopTokenSenders("24h");
        console.log("Top Token Senders:", topTokenSenders);

        const topTokenReceivers = await mainnetScanner.getTopTokenReceivers("24h");
        console.log("Top Token Receivers:", topTokenReceivers);

        const topTokenParticipants = await mainnetScanner.getTopTokenParticipants("24h");
        console.log("Top Token Participants:", topTokenParticipants);

        console.log("\n=== Token Statistics Methods ===");
        const tokenHolderStats = await mainnetScanner.getTokenHolderStats(contractAddress);
        console.log("Token Holder Stats:", tokenHolderStats);

        const tokenUniqueSenderStats =
            await mainnetScanner.getTokenUniqueSenderStats(contractAddress);
        console.log("Token Unique Sender Stats:", tokenUniqueSenderStats);

        const tokenUniqueReceiverStats =
            await mainnetScanner.getTokenUniqueReceiverStats(contractAddress);
        console.log("Token Unique Receiver Stats:", tokenUniqueReceiverStats);

        const tokenUniqueParticipantStats =
            await mainnetScanner.getTokenUniqueParticipantStats(contractAddress);
        console.log("Token Unique Participant Stats:", tokenUniqueParticipantStats);

        console.log("\n=== Block Statistics Methods ===");
        const blockBaseFeeStats = await mainnetScanner.getBlockBaseFeeStats(statsParams);
        console.log("Block Base Fee Stats:", blockBaseFeeStats);

        const blockAvgPriorityFeeStats =
            await mainnetScanner.getBlockAvgPriorityFeeStats(statsParams);
        console.log("Block Avg Priority Fee Stats:", blockAvgPriorityFeeStats);

        const blockGasUsedStats = await mainnetScanner.getBlockGasUsedStats(statsParams);
        console.log("Block Gas Used Stats:", blockGasUsedStats);

        const blockTxsByTypeStats = await mainnetScanner.getBlockTxsByTypeStats(statsParams);
        console.log("Block Txs By Type Stats:", blockTxsByTypeStats);

        // Example with testnet
        console.log("\n=== Testnet Example ===");
        const testnetBlockStats = await testnetScanner.getBlockBaseFeeStats(statsParams);
        console.log("Testnet Block Base Fee Stats:", testnetBlockStats);

        // Example with API key
        console.log("\n=== API Key Example ===");
        const apiKeyBlockStats = await scannerWithApiKey.getBlockBaseFeeStats(statsParams);
        console.log("Block Base Fee Stats with API Key:", apiKeyBlockStats);
    } catch (error) {
        console.error("Error during demonstration:", error);
    }
}

// Run the demonstration
demonstrateESpaceScannerUsage().catch(console.error);

// Example of error handling and address validation
async function _demonstrateErrorHandling() {
    const scanner = new ESpaceScanner("mainnet");

    try {
        // Invalid address example
        await scanner.getContractABI("0xinvalid");
    } catch (error) {
        console.error("Expected error for invalid address:", error);
    }

    try {
        // Non-existent contract
        await scanner.getContractABI("0x0000000000000000000000000000000000000000");
    } catch (error) {
        console.error("Expected error for non-existent contract:", error);
    }
}

// Run error handling examples
// demonstrateErrorHandling().catch(console.error);
