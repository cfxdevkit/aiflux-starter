import {
    Action,
    composeContext,
    generateObject,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { CfxTransferParams, CfxTransferParamsSchema } from "./types";
import { isAddress as isCoreAddress } from "cive/utils";
import { Address as EspaceAddress } from "viem";
import { Address as CoreAddress } from "cive";
import { cfxTransferTemplate } from "./template";
import { cfxTransferExamples } from "./examples";

async function executeCfxTransfer(
    _runtime: IAgentRuntime,
    config: ValidatedConfig,
    params: CfxTransferParams,
    callback: HandlerCallback
): Promise<{ tx: `0x${string}`; successMessage: string }> {
    elizaLogger.debug("Starting CFX transfer operation", {
        operation: "CFXTransfer",
        amount: params.amount,
        toAddress: params.toAddress,
        network: params.network
    });

    try {
        let tx: `0x${string}`;

        // Check if we have the required wallet
        const wallet = params.network === "core" ? config.coreWallet : config.espaceWallet;

        elizaLogger.debug("Checking wallet configuration", {
            operation: "CFXTransfer",
            network: params.network,
            hasWallet: !!wallet
        });

        if (!wallet) {
            const error = `No wallet configured for ${params.network} network`;
            elizaLogger.error("Wallet configuration missing", {
                operation: "CFXTransfer",
                network: params.network,
                error
            });
            throw new Error(error);
        }

        callback(
            {
                text: `🔄 Preparing to transfer ${params.amount} CFX to ${params.toAddress} on ${params.network === "core" ? "Core" : "eSpace"} network...`,
                action: "SEND_CFX",
            },
            []
        );

        elizaLogger.debug("Fetching initial balance", {
            operation: "CFXTransfer",
            network: params.network
        });

        // Get initial balance
        const initialBalance = await wallet.getBalance();

        elizaLogger.debug("Initial balance fetched", {
            operation: "CFXTransfer",
            network: params.network,
            initialBalance
        });

        callback(
            {
                text: `💫 Executing transfer transaction...`,
                action: "SEND_CFX",
            },
            []
        );

        elizaLogger.debug("Initiating transfer transaction", {
            operation: "CFXTransfer",
            network: params.network,
            amount: params.amount,
            toAddress: params.toAddress
        });

        if (params.network === "core") {
            tx = await config.coreWallet.sendCfx({
                to: params.toAddress as CoreAddress,
                amount: params.amount,
            });
        } else {
            tx = await config.espaceWallet.sendCfx({
                to: params.toAddress as EspaceAddress,
                amount: params.amount,
            });
        }

        elizaLogger.debug("Transfer transaction submitted", {
            operation: "CFXTransfer",
            network: params.network,
            transactionHash: tx
        });

        callback(
            {
                text: `⏳ Waiting for transfer transaction to be confirmed...\nTransaction: ${tx}`,
                action: "SEND_CFX",
            },
            []
        );

        elizaLogger.debug("Waiting for transaction confirmation", {
            operation: "CFXTransfer",
            network: params.network,
            transactionHash: tx
        });

        // Wait for transaction confirmation
        await wallet.waitForTransaction(tx);

        elizaLogger.debug("Transaction confirmed, fetching final balance", {
            operation: "CFXTransfer",
            network: params.network,
            transactionHash: tx
        });

        // Get final balance
        const finalBalance = await wallet.getBalance();

        elizaLogger.debug("Transfer operation completed successfully", {
            operation: "CFXTransfer",
            network: params.network,
            transactionHash: tx,
            balanceChanges: {
                before: initialBalance,
                after: finalBalance,
                difference: Number(finalBalance) - Number(initialBalance)
            }
        });

        const successMessage = `✅ Successfully sent ${params.amount} CFX to ${params.toAddress} on ${params.network === "core" ? "Core" : "eSpace"} network

Balance changes:
Before: ${initialBalance} CFX
After: ${finalBalance} CFX

Transaction: ${tx}`;

        return { tx, successMessage };
    } catch (error) {
        elizaLogger.error("Transfer operation failed", {
            operation: "CFXTransfer",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            params
        });
        throw error;
    }
}

export function createCfxTransferAction(config: ValidatedConfig): Action {
    elizaLogger.debug("Creating CFX transfer action", {
        operation: "CFXTransfer",
        hasCoreWallet: !!config.coreWallet,
        hasEspaceWallet: !!config.espaceWallet
    });

    return {
        name: "SEND_CFX",
        description: "Transfer CFX tokens on Core or eSpace network",
        similes: ["SEND", "TRANSFER", "SEND_CFX"],
        suppressInitialMessage: false,
        validate: async (runtime: IAgentRuntime, message: Memory) => {
            elizaLogger.debug("Validating transfer configuration", {
                operation: "CFXTransfer",
                hasCoreWallet: !!config.coreWallet,
                hasEspaceWallet: !!config.espaceWallet
            });

            const hasWallet = !!(config.coreWallet || config.espaceWallet);
            if (!hasWallet) {
                elizaLogger.error("No wallets configured for transfer", {
                    operation: "CFXTransfer"
                });
            }
            return hasWallet;
        },
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State,
            _options: any,
            callback: HandlerCallback
        ) => {
            elizaLogger.debug("Starting transfer handler", {
                operation: "CFXTransfer",
                messageId: message.id
            });

            try {
                state = state
                    ? await runtime.updateRecentMessageState(state)
                    : await runtime.composeState(message);

                const context = composeContext({
                    state,
                    template: cfxTransferTemplate,
                });

                try {
                    elizaLogger.debug("Generating transfer parameters", {
                        operation: "CFXTransfer",
                        messageId: message.id
                    });

                    const actionDetails = (await generateObject({
                        runtime,
                        context,
                        modelClass: ModelClass.SMALL,
                        schema: CfxTransferParamsSchema,
                    })) as { object: CfxTransferParams };

                    // Determine network from address format
                    const network = isCoreAddress(actionDetails.object.toAddress)
                        ? "core"
                        : "espace";

                    elizaLogger.debug("Network determined from address", {
                        operation: "CFXTransfer",
                        network,
                        address: actionDetails.object.toAddress
                    });

                    // Validate that we have the required wallet
                    const wallet = network === "core" ? config.coreWallet : config.espaceWallet;
                    if (!wallet) {
                        const error = `No wallet configured for ${network} network`;
                        elizaLogger.error("Required wallet missing", {
                            operation: "CFXTransfer",
                            network,
                            error
                        });
                        callback(
                            {
                                text: `❌ Transfer failed: ${error}`,
                            },
                            []
                        );
                        return false;
                    }

                    const params: CfxTransferParams = {
                        ...actionDetails.object,
                        network,
                    };

                    elizaLogger.debug("Transfer parameters generated", {
                        operation: "CFXTransfer",
                        params,
                        messageId: message.id
                    });

                    const result = await executeCfxTransfer(
                        runtime,
                        config,
                        params,
                        callback
                    );
                    callback({ text: result.successMessage }, []);
                    return true;
                } catch (error) {
                    if (error.name === "AI_TypeValidationError") {
                        elizaLogger.warn("Invalid transfer parameters provided", {
                            operation: "CFXTransfer",
                            error: error.message,
                            messageId: message.id
                        });
                        callback(
                            {
                                text: `⚠️ I need to confirm some details:

Please verify the following:
- Amount to send (must be a valid number)
- Destination address (must be a valid Conflux Core or eSpace address)

For example:
- "send 5 CFX to cfx:..." for Core network
- "send 5 CFX to 0x..." for eSpace network

What would you like to transfer?`,
                            },
                            []
                        );
                        return false;
                    }
                    throw error;
                }
            } catch (error) {
                elizaLogger.error("Transfer handler failed", {
                    operation: "CFXTransfer",
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    messageId: message.id
                });
                callback(
                    {
                        text: `❌ Transfer failed: ${error.message}

Please provide valid values:
- Amount: must be a valid number
- Address: must be a valid Conflux address (cfx:... or 0x...)

Example: "send 10.5 CFX to cfx:..." or "send 5 to 0x..."`,
                    },
                    []
                );
                return false;
            }
        },
        examples: cfxTransferExamples,
    };
}
