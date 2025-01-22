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
import { BridgeParams, BridgeParamsSchema } from "./types";
import { Address as EspaceAddress } from "viem";
import { bridgeTemplate } from "./template";
import { bridgeExamples } from "./examples";

async function executeBridgeOperation(
    _runtime: IAgentRuntime,
    config: ValidatedConfig,
    params: BridgeParams,
    callback: HandlerCallback
): Promise<{ tx: `0x${string}`; successMessage: string }> {
    elizaLogger.debug("Starting bridge operation", {
        operation: "BridgeCFX",
        amount: params.amount,
        toAddress: params.toAddress,
        fromNetwork: params.fromNetwork,
        toNetwork: params.toNetwork
    });

    try {
        callback(
            {
                text: `🔄 Preparing to bridge ${params.amount} CFX from Core to eSpace...`,
                action: "BRIDGE_CFX",
            },
            []
        );

        elizaLogger.debug("Fetching initial balances", {
            operation: "BridgeCFX",
            coreWalletAvailable: !!config.coreWallet,
            espaceWalletAvailable: !!config.espaceWallet
        });

        // Get initial balances
        const [initialCoreBalance, initialEspaceBalance] = await Promise.all([
            config.coreWallet.getBalance(),
            config.espaceWallet?.getBalance() || "0",
        ]);

        elizaLogger.debug("Initial balances fetched", {
            operation: "BridgeCFX",
            initialCoreBalance,
            initialEspaceBalance
        });

        callback(
            {
                text: `💫 Executing bridge transaction...`,
                action: "BRIDGE_CFX",
            },
            []
        );

        elizaLogger.debug("Initiating cross-space transaction", {
            operation: "BridgeCFX",
            toAddress: params.toAddress,
            amount: params.amount
        });

        const tx = await config.coreWallet.crossSpaceCall({
            to: params.toAddress as EspaceAddress,
            amount: params.amount,
        });

        elizaLogger.debug("Bridge transaction submitted", {
            operation: "BridgeCFX",
            transactionHash: tx
        });

        callback(
            {
                text: `⏳ Waiting for bridge transaction to be confirmed...\nTransaction: ${tx}`,
                action: "BRIDGE_CFX",
            },
            []
        );

        elizaLogger.debug("Waiting for transaction confirmation", {
            operation: "BridgeCFX",
            transactionHash: tx
        });

        // Wait for transaction confirmation on Core
        await config.coreWallet.waitForTransaction(tx);

        elizaLogger.debug("Transaction confirmed, fetching final balances", {
            operation: "BridgeCFX",
            transactionHash: tx
        });

        // Get final balances
        const [finalCoreBalance, finalEspaceBalance] = await Promise.all([
            config.coreWallet.getBalance(),
            config.espaceWallet?.getBalance() || "0",
        ]);

        elizaLogger.debug("Bridge operation completed successfully", {
            operation: "BridgeCFX",
            transactionHash: tx,
            balanceChanges: {
                core: {
                    before: initialCoreBalance,
                    after: finalCoreBalance
                },
                espace: {
                    before: initialEspaceBalance,
                    after: finalEspaceBalance
                }
            }
        });

        const successMessage = `✅ Successfully bridged ${params.amount} CFX to ${params.toAddress} on eSpace network

Balance changes:
Core Space:
  Before: ${initialCoreBalance} CFX
  After: ${finalCoreBalance} CFX

eSpace:
  Before: ${initialEspaceBalance} CFX
  After: ${finalEspaceBalance} CFX

Transaction: ${tx}`;

        return { tx, successMessage };
    } catch (error) {
        elizaLogger.error("Bridge operation failed", {
            operation: "BridgeCFX",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            params
        });
        throw error;
    }
}

export function createBridgeAction(config: ValidatedConfig): Action {
    elizaLogger.debug("Creating bridge action", {
        operation: "BridgeCFX",
        hasCoreWallet: !!config.coreWallet,
        hasEspaceWallet: !!config.espaceWallet
    });

    return {
        name: "BRIDGE_CFX",
        description: "Bridge CFX tokens from Core to eSpace network",
        similes: ["BRIDGE", "BRIDGE_CFX", "CROSS_SPACE"],
        suppressInitialMessage: false,
        validate: async (runtime: IAgentRuntime, _message: Memory) => {
            elizaLogger.debug("Validating bridge configuration", {
                operation: "BridgeCFX",
                hasCoreWallet: !!config.coreWallet
            });
            return !!config.coreWallet;
        },
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State,
            _options: any,
            callback: HandlerCallback
        ) => {
            elizaLogger.debug("Starting bridge handler", {
                operation: "BridgeCFX",
                messageId: message.id
            });

            try {
                state = state
                    ? await runtime.updateRecentMessageState(state)
                    : await runtime.composeState(message);

                const context = composeContext({
                    state,
                    template: bridgeTemplate,
                });

                try {
                    elizaLogger.debug("Generating bridge parameters", {
                        operation: "BridgeCFX",
                        messageId: message.id
                    });

                    const actionDetails = (await generateObject({
                        runtime,
                        context,
                        modelClass: ModelClass.SMALL,
                        schema: BridgeParamsSchema,
                    })) as { object: BridgeParams };

                    const params: BridgeParams = {
                        ...actionDetails.object,
                        fromNetwork: "core",
                        toNetwork: "espace",
                    };

                    elizaLogger.debug("Bridge parameters generated", {
                        operation: "BridgeCFX",
                        params,
                        messageId: message.id
                    });

                    const result = await executeBridgeOperation(
                        runtime,
                        config,
                        params,
                        callback
                    );
                    callback({ text: result.successMessage }, []);
                    return true;
                } catch (error) {
                    if (error.name === "AI_TypeValidationError") {
                        elizaLogger.warn("Invalid bridge parameters provided", {
                            operation: "BridgeCFX",
                            error: error.message,
                            messageId: message.id
                        });
                        callback(
                            {
                                text: `⚠️ I need to confirm some details:

Please verify the following:
- Amount to bridge (must be a valid number)
- Destination address (must be a valid Ethereum address starting with 0x)

For example: "bridge 5 CFX to 0x1234..."

What would you like to bridge?`,
                            },
                            []
                        );
                        return false;
                    }
                    throw error;
                }
            } catch (error) {
                elizaLogger.error("Bridge handler failed", {
                    operation: "BridgeCFX",
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    messageId: message.id
                });
                callback(
                    {
                        text: `❌ Bridge operation failed: ${error.message}

Please provide valid values:
- type: must be "bridge_cfx"
- toAddress: must be a valid address (0x...)
- amount: must be a valid number

Example: "bridge_cfx amount 10.5 to 0x123..."`,
                    },
                    []
                );
                return false;
            }
        },
        examples: bridgeExamples,
    };
}
