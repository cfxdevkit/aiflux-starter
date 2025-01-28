import { ESpaceScannerWrapper } from "../src/utils/scanner/ESpaceScannerWrapper.js";

async function demonstrateESpaceScannerWrapperUsage() {
    // Initialize scanners for different networks
    const mainnetScanner = new ESpaceScannerWrapper("mainnet");
    const testnetScanner = new ESpaceScannerWrapper("testnet");
    const scannerWithApiKey = new ESpaceScannerWrapper("mainnet", "YOUR_API_KEY");

    try {
        console.log("=== Contract Methods ===");
        // Example contract address - replace with a real one
        const contractAddress = "0x1f545487c62e5acfea45dcadd9c627361d1616d8";

        const contractABI = await mainnetScanner.getContractABI(contractAddress);
        console.log(contractABI.formatted);

        const contractSource = await mainnetScanner.getContractSourceCode(contractAddress);
        console.log(contractSource.formatted);

        console.log("\n=== Token Methods ===");
        // Example wallet address - replace with a real one
        const walletAddress = "0x001dcf9598c7528a5ab6e83dce67ade7b9ab5fb9";

        const erc20Tokens = await mainnetScanner.getAccountTokens(walletAddress, "ERC20");
        console.log(erc20Tokens.formatted);

        const erc721Tokens = await mainnetScanner.getAccountTokens(walletAddress, "ERC721");
        console.log(erc721Tokens.formatted);

        console.log("\n=== Basic Statistics Methods ===");
        const statsParams = {
            minTimestamp: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60, // 7 days ago
            maxTimestamp: Math.floor(Date.now() / 1000),
            limit: 5,
        };

        const activeAccounts = await mainnetScanner.getActiveAccountStats(statsParams);
        console.log("Active Accounts:", activeAccounts.formatted);

        const cfxHolders = await mainnetScanner.getCfxHolderStats(statsParams);
        console.log("CFX Holders:", cfxHolders.formatted);

        const accountGrowth = await mainnetScanner.getAccountGrowthStats(statsParams);
        console.log("Account Growth:", accountGrowth.formatted);

        const contractStats = await mainnetScanner.getContractStats(statsParams);
        console.log("Contract Stats:", contractStats.formatted);

        const transactionStats = await mainnetScanner.getTransactionStats(statsParams);
        console.log("Transaction Stats:", transactionStats.formatted);

        const cfxTransferStats = await mainnetScanner.getCfxTransferStats(statsParams);
        console.log("CFX Transfer Stats:", cfxTransferStats.formatted);

        const tpsStats = await mainnetScanner.getTpsStats({ ...statsParams, intervalType: "hour" });
        console.log("TPS Stats:", tpsStats.formatted);

        console.log("\n=== Top Statistics Methods ===");
        const topGasUsed = await mainnetScanner.getTopGasUsed("24h");
        console.log("Top Gas Used:", topGasUsed.formatted);

        const topTxSenders = await mainnetScanner.getTopTransactionSenders("24h");
        console.log("Top Transaction Senders:", topTxSenders.formatted);

        const topTxReceivers = await mainnetScanner.getTopTransactionReceivers("24h");
        console.log("Top Transaction Receivers:", topTxReceivers.formatted);

        const topCfxSenders = await mainnetScanner.getTopCfxSenders("24h");
        console.log("Top CFX Senders:", topCfxSenders.formatted);

        const topCfxReceivers = await mainnetScanner.getTopCfxReceivers("24h");
        console.log("Top CFX Receivers:", topCfxReceivers.formatted);

        const topTokenTransfers = await mainnetScanner.getTopTokenTransfers("24h");
        console.log("Top Token Transfers:", topTokenTransfers.formatted);

        const topTokenSenders = await mainnetScanner.getTopTokenSenders("24h");
        console.log("Top Token Senders:", topTokenSenders.formatted);

        const topTokenReceivers = await mainnetScanner.getTopTokenReceivers("24h");
        console.log("Top Token Receivers:", topTokenReceivers.formatted);

        const topTokenParticipants = await mainnetScanner.getTopTokenParticipants("24h");
        console.log("Top Token Participants:", topTokenParticipants.formatted);

        console.log("\n=== Token Statistics Methods ===");
        const tokenHolderStats = await mainnetScanner.getTokenHolderStats(contractAddress);
        console.log("Token Holder Stats:", tokenHolderStats.formatted);

        const tokenUniqueSenderStats =
            await mainnetScanner.getTokenUniqueSenderStats(contractAddress);
        console.log("Token Unique Sender Stats:", tokenUniqueSenderStats.formatted);

        const tokenUniqueReceiverStats =
            await mainnetScanner.getTokenUniqueReceiverStats(contractAddress);
        console.log("Token Unique Receiver Stats:", tokenUniqueReceiverStats.formatted);

        const tokenUniqueParticipantStats =
            await mainnetScanner.getTokenUniqueParticipantStats(contractAddress);
        console.log("Token Unique Participant Stats:", tokenUniqueParticipantStats.formatted);

        console.log("\n=== Block Statistics Methods ===");
        const blockBaseFeeStats = await mainnetScanner.getBlockBaseFeeStats(statsParams);
        console.log("Block Base Fee Stats:", blockBaseFeeStats.formatted);

        const blockAvgPriorityFeeStats =
            await mainnetScanner.getBlockAvgPriorityFeeStats(statsParams);
        console.log("Block Avg Priority Fee Stats:", blockAvgPriorityFeeStats.formatted);

        const blockGasUsedStats = await mainnetScanner.getBlockGasUsedStats(statsParams);
        console.log("Block Gas Used Stats:", blockGasUsedStats.formatted);

        const blockTxsByTypeStats = await mainnetScanner.getBlockTxsByTypeStats(statsParams);
        console.log("Block Txs By Type Stats:", blockTxsByTypeStats.formatted);

        // Example with testnet
        console.log("\n=== Testnet Example ===");
        const testnetBlockStats = await testnetScanner.getBlockBaseFeeStats(statsParams);
        console.log("Testnet Block Base Fee Stats:", testnetBlockStats.formatted);

        // Example with API key
        console.log("\n=== API Key Example ===");
        const apiKeyBlockStats = await scannerWithApiKey.getBlockBaseFeeStats(statsParams);
        console.log("Block Base Fee Stats with API Key:", apiKeyBlockStats.formatted);
    } catch (error) {
        console.error("Error during demonstration:", error);
    }
}

// Run the demonstration
demonstrateESpaceScannerWrapperUsage().catch(console.error);

// Example of error handling and address validation
async function demonstrateErrorHandling() {
    const scanner = new ESpaceScannerWrapper("mainnet");

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
demonstrateErrorHandling().catch(console.error);
