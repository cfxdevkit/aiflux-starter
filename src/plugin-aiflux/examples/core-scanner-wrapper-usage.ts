import { CoreScannerWrapper } from "../src/utils/scanner/CoreScannerWrapper.js";

async function demonstrateCoreScannerWrapperUsage() {
    // Initialize scanners for different networks
    const mainnetScanner = new CoreScannerWrapper("mainnet");
    const testnetScanner = new CoreScannerWrapper("testnet");
    const scannerWithApiKey = new CoreScannerWrapper("mainnet", "YOUR_API_KEY");

    try {
        console.log("=== Contract Methods ===");
        // Example contract address - replace with a real one
        const contractAddress = "cfx:acdrf821t59y12b4guyzckyuw2xf1gfpj2ba0x4sj6";

        const contractABI = await mainnetScanner.getContractABI(contractAddress);
        console.log(contractABI.formatted);

        const contractSource = await mainnetScanner.getContractSourceCode(contractAddress);
        console.log(contractSource.formatted);

        console.log("\n=== Token Methods ===");
        // Example wallet address - replace with a real one
        const walletAddress = "cfx:aas3468p9kuzkj272nmtyut75v6vcb7j6ezjstbdpf";

        const crc20Tokens = await mainnetScanner.getAccountTokens(walletAddress, "CRC20");
        console.log(crc20Tokens.formatted);

        const crc721Tokens = await mainnetScanner.getAccountTokens(walletAddress, "CRC721");
        console.log(crc721Tokens.formatted);

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

        const topMiners = await mainnetScanner.getTopMiners("24h");
        console.log("Top Miners:", topMiners.formatted);

        console.log("\n=== Supply Statistics ===");
        const supplyStats = await mainnetScanner.getSupplyStats();
        console.log("Supply Stats:", supplyStats.formatted);

        // Example with testnet
        console.log("\n=== Testnet Example ===");
        const testnetSupplyStats = await testnetScanner.getSupplyStats();
        console.log("Testnet Supply Stats:", testnetSupplyStats.formatted);

        // Example with API key
        console.log("\n=== API Key Example ===");
        const apiKeySupplyStats = await scannerWithApiKey.getSupplyStats();
        console.log("Supply Stats with API Key:", apiKeySupplyStats.formatted);
    } catch (error) {
        console.error("Error during demonstration:", error);
    }
}

// Run the demonstration
demonstrateCoreScannerWrapperUsage().catch(console.error);

// Example of error handling and address validation
async function demonstrateErrorHandling() {
    const scanner = new CoreScannerWrapper("mainnet");

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
