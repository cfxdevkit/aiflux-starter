import {
    Action,
    composeContext,
    elizaLogger,
    generateObject,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";
import { Address as CoreAddress } from "cive";
import { isAddress as isCoreAddress } from "cive/utils";
import { Address as EspaceAddress } from "viem";
import { ValidatedConfig } from "../../utils";
import { tokenTransferExamples } from "./examples";
import { tokenTransferTemplate } from "./template";
import { TokenTransferParams, TokenTransferParamsSchema } from "./types";

async function executeTokenTransfer(
    _runtime: IAgentRuntime,
    config: ValidatedConfig,
    params: TokenTransferParams,
    callback: HandlerCallback
): Promise<{ tx: `0x${string}`; successMessage: string }> {
    elizaLogger.debug("Starting token transfer operation", {
        operation: "TokenTransfer",
        token: params.token,
        amount: params.amount,
        toAddress: params.toAddress,
        network: params.network
    });

    const tokenSymbol = params.token.toUpperCase();
    const amount = params.amount;
    const toAddress = params.toAddress;
    const network = params.network.toLowerCase();


    try {
        // Validate token exists in wallet
        const scanner = network === "core" ? config.coreConfluxScan : config.espaceConfluxScan;

        elizaLogger.debug("Checking configuration", {
            operation: "TokenTransfer",
            network,
            hasScanner: !!scanner
        });

        if (!scanner) {
            const error = `No scanner configured for ${network} network`;
            elizaLogger.error("Scanner configuration missing", {
                operation: "TokenTransfer",
                network,
                error
            });
            throw new Error(error);
        }

        callback(
            {
                text: `🔄 Preparing to transfer ${amount} ${tokenSymbol} on ${network === "core" ? "Core" : "eSpace"} network...`,
                action: "SEND_TOKEN",
            },
            []
        );

        const fromAddress = network === "core"
            ? config.coreWallet?.getAddress()
            : config.espaceWallet?.getAddress();

        elizaLogger.debug("Checking wallet configuration", {
            operation: "TokenTransfer",
            network,
            hasFromAddress: !!fromAddress
        });

        if (!fromAddress) {
            const error = `No wallet configured for ${network} network`;
            elizaLogger.error("Wallet configuration missing", {
                operation: "TokenTransfer",
                network,
                error
            });
            throw new Error(error);
        }

        // Parse and validate amount
        const numAmount = parseFloat(params.amount);
        elizaLogger.debug("Validating transfer amount", {
            operation: "TokenTransfer",
            rawAmount: amount,
            parsedAmount: numAmount
        });

        if (isNaN(numAmount) || numAmount <= 0) {
            const error = `Amount must be a valid positive number, got: ${amount}`;
            elizaLogger.error("Invalid amount", {
                operation: "TokenTransfer",
                amount,
                error
            });
            throw new Error(error);
        }

        try {
            elizaLogger.debug("Fetching token information", {
                operation: "TokenTransfer",
                token: tokenSymbol,
                fromAddress
            });

            const tokens = await scanner.filterAccountTokens(fromAddress, tokenSymbol);

            elizaLogger.debug("Token search results", {
                operation: "TokenTransfer",
                tokenCount: tokens.length,
                searchedSymbol: tokenSymbol
            });

            if (tokens.length === 0) {
                const error = `Token '${tokenSymbol}' not found in your wallet`;
                elizaLogger.error("Token not found", {
                    operation: "TokenTransfer",
                    token: tokenSymbol,
                    error
                });
                throw new Error(error);
            }

            if (tokens.length > 1) {
                const error = `Token symbol '${tokenSymbol}' matches multiple tokens. Please use the contract address instead.\nExample: send 5 tokens@${tokens[0].contract} to ${toAddress}`;
                elizaLogger.error("Ambiguous token symbol", {
                    operation: "TokenTransfer",
                    token: tokenSymbol,
                    matchingTokens: tokens.map(t => t.contract),
                    error
                });
                throw new Error(error);
            }

            const token = tokens[0];
            let tx: `0x${string}`;

            elizaLogger.debug("Fetching initial balance", {
                operation: "TokenTransfer",
                token: token.symbol,
                contract: token.contract
            });

            // Get initial balance
            const initialBalance = network === "core"
                ? await config.coreWallet!.getTokenBalance(token.contract as CoreAddress)
                : await config.espaceWallet!.getTokenBalance(token.contract as EspaceAddress);

            elizaLogger.debug("Initial balance fetched", {
                operation: "TokenTransfer",
                token: token.symbol,
                balance: initialBalance.toString()
            });

            callback(
                {
                    text: `💫 Executing token transfer transaction...`,
                    action: "SEND_TOKEN",
                },
                []
            );

            elizaLogger.debug("Initiating transfer transaction", {
                operation: "TokenTransfer",
                token: token.symbol,
                amount: params.amount,
                toAddress: params.toAddress,
                contract: token.contract,
                decimals: token.decimals
            });

            if (network === "core") {
                tx = await config.coreWallet!.sendToken({
                    to: params.toAddress as CoreAddress,
                    amount: params.amount,
                    tokenAddress: token.contract as CoreAddress,
                    decimals: token.decimals,
                });
            } else {
                tx = await config.espaceWallet!.sendToken({
                    to: params.toAddress as EspaceAddress,
                    amount: params.amount,
                    tokenAddress: token.contract as EspaceAddress,
                    decimals: token.decimals,
                });
            }

            elizaLogger.debug("Transfer transaction submitted", {
                operation: "TokenTransfer",
                transactionHash: tx,
                token: token.symbol
            });

            callback(
                {
                    text: `⏳ Waiting for transfer transaction to be confirmed...\nTransaction: ${tx}`,
                    action: "SEND_TOKEN",
                },
                []
            );

            elizaLogger.debug("Waiting for transaction confirmation", {
                operation: "TokenTransfer",
                transactionHash: tx
            });

            // Wait for transaction confirmation
            network === "core"
                ? await config.coreWallet!.waitForTransaction(tx)
                : await config.espaceWallet!.waitForTransaction(tx);

            elizaLogger.debug("Transaction confirmed, fetching final balance", {
                operation: "TokenTransfer",
                transactionHash: tx
            });

            // Get final balance
            const finalBalance = network === "core"
                ? await config.coreWallet!.getTokenBalance(token.contract as CoreAddress)
                : await config.espaceWallet!.getTokenBalance(token.contract as EspaceAddress);

            elizaLogger.debug("Transfer operation completed successfully", {
                operation: "TokenTransfer",
                token: token.symbol,
                transactionHash: tx,
                balanceChanges: {
                    before: initialBalance,
                    after: finalBalance,
                    difference: (Number(finalBalance) - Number(initialBalance)).toFixed(4)
                }
            });

            const successMessage = `✅ Successfully sent ${amount} ${tokenSymbol} to ${toAddress} on ${network === "core" ? "Core" : "eSpace"} network

Balance changes:
Before: ${initialBalance} ${token.symbol}
After: ${finalBalance} ${token.symbol}
Difference: ${(Number(finalBalance) - Number(initialBalance)).toFixed(4)} ${token.symbol}

Transaction: ${tx}`;
            return { tx, successMessage };
        } catch (error) {
            elizaLogger.error("Token validation or transfer failed", {
                operation: "TokenTransfer",
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                token: tokenSymbol,
                network
            });
            throw error;
        }
    } catch (error) {
        elizaLogger.error("Transfer operation failed", {
            operation: "TokenTransfer",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            params: {
                token: tokenSymbol,
                network
            }
        });
        throw error;
    }
}

export function createTokenTransferAction(config: ValidatedConfig): Action {
    elizaLogger.debug("Creating token transfer action", {
        operation: "TokenTransfer",
        hasCoreWallet: !!config.coreWallet,
        hasEspaceWallet: !!config.espaceWallet,
        hasCoreScan: !!config.coreConfluxScan,
        hasEspaceScan: !!config.espaceConfluxScan
    });

    return {
        name: "SEND_TOKEN",
        description: "Transfer tokens on Core or eSpace network",
        similes: ["SEND", "TRANSFER", "SEND_TOKEN", "SENDTOKEN"],
        suppressInitialMessage: false,
        validate: async (_runtime: IAgentRuntime, _message: Memory) => {
            elizaLogger.debug("Validating transfer configuration", {
                operation: "TokenTransfer",
                hasCoreWallet: !!config.coreWallet,
                hasEspaceWallet: !!config.espaceWallet,
                hasCoreScan: !!config.coreConfluxScan,
                hasEspaceScan: !!config.espaceConfluxScan
            });

            const hasWallet = !!(config.coreWallet || config.espaceWallet);
            const hasScanner = !!(config.coreConfluxScan || config.espaceConfluxScan);

            if (!hasWallet) {
                elizaLogger.error("No wallets configured for transfer", {
                    operation: "TokenTransfer"
                });
            }
            if (!hasScanner) {
                elizaLogger.error("No scanners configured for transfer", {
                    operation: "TokenTransfer"
                });
            }

            return hasWallet && hasScanner;
        },
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State,
            _options: any,
            callback: HandlerCallback
        ) => {
            elizaLogger.debug("Starting transfer handler", {
                operation: "TokenTransfer",
                messageId: message.id
            });

            try {
                state = state
                    ? await runtime.updateRecentMessageState(state)
                    : await runtime.composeState(message);

                const context = composeContext({
                    state,
                    template: tokenTransferTemplate,
                });

                try {
                    elizaLogger.debug("Generating transfer parameters", {
                        operation: "TokenTransfer",
                        messageId: message.id
                    });

                    const actionDetails = (await generateObject({
                        runtime,
                        context,
                        modelClass: ModelClass.SMALL,
                        schema: TokenTransferParamsSchema,
                    })) as { object: TokenTransferParams };

                    // Determine network from address format
                    const network = isCoreAddress(actionDetails.object.toAddress)
                        ? "core"
                        : "espace";

                    elizaLogger.debug("Network determined from address", {
                        operation: "TokenTransfer",
                        network,
                        address: actionDetails.object.toAddress
                    });

                    // Validate that we have the required wallet and scanner
                    const wallet = network === "core" ? config.coreWallet : config.espaceWallet;
                    const scanner = network === "core" ? config.coreConfluxScan : config.espaceConfluxScan;

                    if (!wallet || !scanner) {
                        const error = `No ${!wallet ? "wallet" : "scanner"} configured for ${network} network`;
                        elizaLogger.error("Required configuration missing", {
                            operation: "TokenTransfer",
                            network,
                            missingComponent: !wallet ? "wallet" : "scanner",
                            error
                        });
                        callback({ text: `❌ Transfer failed: ${error}` }, []);
                        return false;
                    }

                    const params: TokenTransferParams = {
                        ...actionDetails.object,
                        network,
                    };

                    elizaLogger.debug("Transfer parameters generated", {
                        operation: "TokenTransfer",
                        params,
                        messageId: message.id
                    });

                    try {
                        const result = await executeTokenTransfer(runtime, config, params, callback);
                        callback({ text: result.successMessage, action: "SEND_TOKEN" }, []);
                        return true;
                    } catch (error) {
                        elizaLogger.error("Transfer execution failed", {
                            operation: "TokenTransfer",
                            error: error instanceof Error ? error.message : String(error),
                            params
                        });
                        callback({ text: `❌ Transfer failed: ${error.message}` }, []);
                        return false;
                    }
                } catch (error) {
                    if (error.name === "AI_TypeValidationError") {
                        elizaLogger.warn("Invalid transfer parameters provided", {
                            operation: "TokenTransfer",
                            error: error.message,
                            messageId: message.id
                        });
                        callback(
                            {
                                text: `⚠️ I need to confirm some details:

Please verify the following:
- Token symbol or contract address
- Amount to send (must be a valid number)
- Destination address (must be a valid Conflux Core or eSpace address)

For example:
- "send 10 PPI to cfx:..." for Core network
- "send 5.5 USDT to 0x..." for eSpace network
- "send 100 tokens@0x1234... to cfx:..." using contract address

What would you like to transfer?`,
                                action: "SEND_TOKEN",
                            },
                            []
                        );
                        return false;
                    }
                    throw error;
                }
            } catch (error) {
                elizaLogger.error("Transfer handler failed", {
                    operation: "TokenTransfer",
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    messageId: message.id
                });
                callback({ text: error.message, action: "SEND_TOKEN" }, []);
                return false;
            }
        },
        examples: tokenTransferExamples,
    };
}
