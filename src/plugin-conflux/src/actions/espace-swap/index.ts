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
import { ValidatedConfig } from "../../utils";
import { espaceSwapExamples } from "./examples";
import { espaceSwapTemplate } from "./template";
import { EspaceSwapParams, EspaceSwapParamsSchema } from "./types";
import { parseUnits } from "viem";

export async function executeSwap(
    config: ValidatedConfig,
    params: EspaceSwapParams,
    callback: HandlerCallback
): Promise<{ tx: `0x${string}`; successMessage: string }> {
    const amount = params.amount;
    elizaLogger.debug("Starting swap operation", {
        operation: "EspaceSwap",
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: amount
    });

    try {
        elizaLogger.debug("Checking configuration", {
            operation: "EspaceSwap",
            hasEspaceWallet: !!config.espaceWallet,
            hasTokenListManager: !!config.tokenListManager
        });

        if (!config.espaceWallet) {
            const error = "No eSpace wallet configured";
            elizaLogger.error("Wallet configuration missing", {
                operation: "EspaceSwap",
                error
            });
            throw new Error(error);
        }
        if (!config.tokenListManager) {
            const error = "No token list manager configured";
            elizaLogger.error("Token list manager missing", {
                operation: "EspaceSwap",
                error
            });
            throw new Error(error);
        }

        const wallet = config.espaceWallet;
        const now = BigInt(Math.floor(Date.now() / 1000));
        const deadline = now + BigInt(1800); // 30 minutes

        callback(
            {
                text: `🔄 Preparing to swap ${amount} ${params.fromToken} for ${params.toToken}...`,
                action: "SWAP_ESPACE",
            },
            []
        );

        elizaLogger.debug("Resolving token information", {
            operation: "EspaceSwap",
            fromToken: params.fromToken,
            toToken: params.toToken,
            fromTokenRaw: params.fromToken,
            toTokenRaw: params.toToken
        });

        // Get token info from token list manager
        const fromToken = params.fromToken === "CFX"
            ? config.tokenListManager.getTokenBySymbol("WCFX")
            : config.tokenListManager.getTokenBySymbol(params.fromToken);
        const toToken = params.toToken === "CFX"
            ? config.tokenListManager.getTokenBySymbol("WCFX")
            : config.tokenListManager.getTokenBySymbol(params.toToken);

        if (!fromToken || !toToken) {
            const error = `Token not found: ${!fromToken ? params.fromToken : params.toToken}`;
            elizaLogger.error("Token resolution failed", {
                operation: "EspaceSwap",
                error,
                fromTokenFound: !!fromToken,
                toTokenFound: !!toToken,
                fromTokenSymbol: params.fromToken,
                toTokenSymbol: params.toToken,
                fromTokenAttempted: params.fromToken === "CFX" ? "WCFX" : params.fromToken,
                toTokenAttempted: params.toToken === "CFX" ? "WCFX" : params.toToken
            });
            throw new Error(error);
        }

        elizaLogger.debug("Token information resolved", {
            operation: "EspaceSwap",
            fromTokenAddress: fromToken.address,
            toTokenAddress: toToken.address,
            fromTokenDecimals: fromToken.decimals,
            toTokenDecimals: toToken.decimals
        });

        let tx: `0x${string}`;
        const wcfxToken = config.tokenListManager.getTokenBySymbol("WCFX")!;
        const path = (params.fromToken === "CFX" || params.toToken === "CFX")
            ? ([fromToken.address, toToken.address] as `0x${string}`[])
            : ([fromToken.address, wcfxToken.address, toToken.address] as `0x${string}`[]);

        elizaLogger.debug("Swap path determined", {
            operation: "EspaceSwap",
            path,
            requiresWCFXBridge: path.length === 3,
            fromToken: params.fromToken,
            toToken: params.toToken,
            wcfxAddress: wcfxToken.address,
            pathType: params.fromToken === "CFX" || params.toToken === "CFX" ? "direct" : "via_wcfx"
        });

        // Parse amount with correct decimals
        const amountIn = parseUnits(amount, parseInt(fromToken.decimals));
        const slippage = 5;

        elizaLogger.debug("Calculating expected output", {
            operation: "EspaceSwap",
            amountIn: amountIn.toString(),
            slippage
        });

        // Get expected output amount
        const { amounts, amountOutMin } = await wallet.getAmountsOut(amountIn, path, slippage);

        elizaLogger.debug("Swap amounts calculated", {
            operation: "EspaceSwap",
            expectedOutput: amounts[1].toString(),
            minimumOutput: amountOutMin.toString(),
            slippage: `${slippage}%`
        });

        elizaLogger.debug("Fetching initial balances", {
            operation: "EspaceSwap"
        });

        // Get initial balances
        const [initialFromBalance, initialToBalance] = await Promise.all([
            params.fromToken === "CFX"
                ? wallet.getBalance()
                : wallet.getTokenBalance(fromToken.address as `0x${string}`),
            params.toToken === "CFX"
                ? wallet.getBalance()
                : wallet.getTokenBalance(toToken.address as `0x${string}`)
        ]);

        elizaLogger.debug("Initial balances fetched", {
            operation: "EspaceSwap",
            balances: {
                [params.fromToken]: initialFromBalance,
                [params.toToken]: initialToBalance
            }
        });

        // Check allowance if needed
        if (params.fromToken !== "CFX") {
            elizaLogger.debug("Checking token allowance", {
                operation: "EspaceSwap",
                token: params.fromToken
            });

            const allowance = await wallet.checkAllowance(fromToken.address as `0x${string}`);

            elizaLogger.debug("Token allowance status", {
                operation: "EspaceSwap",
                currentAllowance: allowance.toString(),
                requiredAmount: amountIn.toString(),
                needsApproval: allowance < amountIn
            });

            if (allowance < amountIn) {
                callback(
                    {
                        text: `🔓 Requesting approval to spend ${amount} ${params.fromToken}...`,
                        action: "SWAP_ESPACE",
                    },
                    []
                );

                elizaLogger.debug("Requesting token approval", {
                    operation: "EspaceSwap",
                    token: params.fromToken,
                    amount: amountIn.toString()
                });

                const approvalTx = await wallet.approveToken(
                    fromToken.address as `0x${string}`,
                    amountIn
                );

                elizaLogger.debug("Token approval confirmed", {
                    operation: "EspaceSwap",
                    transactionHash: approvalTx
                });

                callback(
                    {
                        text: `✅ Token approval confirmed! Proceeding with swap...`,
                        action: "SWAP_ESPACE",
                    },
                    []
                );
            }
        }

        callback(
            {
                text: `💫 Executing swap transaction...`,
                action: "SWAP_ESPACE",
            },
            []
        );

        elizaLogger.debug("Executing swap transaction", {
            operation: "EspaceSwap",
            swapType: params.fromToken === "CFX" ? "ETHForTokens" :
                      params.toToken === "CFX" ? "TokensForETH" :
                      "TokensForTokens",
            amountIn: amountIn.toString(),
            amountOutMin: amountOutMin.toString(),
            deadline: deadline.toString()
        });

        // Execute swap based on token types
        if (params.fromToken === "CFX") {
            tx = await wallet.swapExactETHForTokens({
                amountOutMin,
                path,
                deadline,
                value: amountIn,
            });
        } else if (params.toToken === "CFX") {
            tx = await wallet.swapExactTokensForETH({
                amountIn,
                amountOutMin,
                path,
                deadline,
            });
        } else {
            tx = await wallet.swapExactTokensForTokens({
                amountIn,
                amountOutMin,
                path,
                deadline,
            });
        }

        elizaLogger.debug("Swap transaction submitted", {
            operation: "EspaceSwap",
            transactionHash: tx,
            swapType: params.fromToken === "CFX" ? "ETHForTokens" :
                      params.toToken === "CFX" ? "TokensForETH" :
                      "TokensForTokens"
        });

        callback(
            {
                text: `⏳ Waiting for swap transaction to be confirmed...\nTransaction: ${tx}`,
                action: "SWAP_ESPACE",
            },
            []
        );

        elizaLogger.debug("Waiting for transaction confirmation", {
            operation: "EspaceSwap",
            transactionHash: tx
        });

        await wallet.waitForTransaction(tx);

        elizaLogger.debug("Transaction confirmed, fetching final balances", {
            operation: "EspaceSwap",
            transactionHash: tx
        });

        // Get final balances after swap
        const [finalFromBalance, finalToBalance] = await Promise.all([
            params.fromToken === "CFX"
                ? wallet.getBalance()
                : wallet.getTokenBalance(fromToken.address as `0x${string}`),
            params.toToken === "CFX"
                ? wallet.getBalance()
                : wallet.getTokenBalance(toToken.address as `0x${string}`)
        ]);

        elizaLogger.debug("Swap operation completed successfully", {
            operation: "EspaceSwap",
            transactionHash: tx,
            balanceChanges: {
                [params.fromToken]: {
                    before: initialFromBalance,
                    after: finalFromBalance,
                    difference: (Number(finalFromBalance) - Number(initialFromBalance)).toFixed(4)
                },
                [params.toToken]: {
                    before: initialToBalance,
                    after: finalToBalance,
                    difference: (Number(finalToBalance) - Number(initialToBalance)).toFixed(4)
                }
            }
        });

        const successMessage = `✅ Successfully swapped ${amount} ${params.fromToken} for ${params.toToken} on eSpace network

Before swap:
${params.fromToken}: ${initialFromBalance}
${params.toToken}: ${initialToBalance}

After swap:
${params.fromToken}: ${finalFromBalance} (${(Number(finalFromBalance) - Number(initialFromBalance)).toFixed(4)})
${params.toToken}: ${finalToBalance} (${(Number(finalToBalance) - Number(initialToBalance)).toFixed(4)})

Transaction: ${tx}`;

        return { tx, successMessage };
    } catch (error) {
        elizaLogger.error("Swap operation failed", {
            operation: "EspaceSwap",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            params: {
                fromToken: params.fromToken,
                toToken: params.toToken,
                amount: amount
            }
        });
        throw error;
    }
}

export function createEspaceSwapAction(config: ValidatedConfig): Action {
    elizaLogger.debug("Creating eSpace swap action", {
        operation: "EspaceSwap",
        hasEspaceWallet: !!config.espaceWallet,
        hasTokenListManager: !!config.tokenListManager
    });

    return {
        name: "SWAP_ESPACE",
        description: "Swap tokens on Conflux eSpace network",
        similes: ["SWAP", "EXCHANGE", "TRADE"],
        suppressInitialMessage: false,
        validate: async (_runtime: IAgentRuntime, _message: Memory) => {
            elizaLogger.debug("Validating swap configuration", {
                operation: "EspaceSwap",
                hasEspaceWallet: !!config.espaceWallet,
                hasTokenListManager: !!config.tokenListManager
            });
            return !!(config.espaceWallet && config.tokenListManager);
        },
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State,
            _options: any,
            callback: HandlerCallback
        ) => {
            elizaLogger.debug("Starting swap handler", {
                operation: "EspaceSwap",
                messageId: message.id
            });

            try {
                if (!config.tokenListManager) {
                    const error = "Token list manager not configured";
                    elizaLogger.error("Configuration error", {
                        operation: "EspaceSwap",
                        error
                    });
                    throw new Error(error);
                }

                state = state
                    ? await runtime.updateRecentMessageState(state)
                    : await runtime.composeState(message);

                const availableTokens = ["CFX", ...Object.keys(config.tokenListManager.getTokenList())];
                elizaLogger.debug("Available tokens for swap", {
                    operation: "EspaceSwap",
                    availableTokens
                });

                const context = composeContext({
                    state,
                    template: espaceSwapTemplate + `\n Valid fromToken/toToken values: ${availableTokens.join(", ")}`,
                });

                try {
                    elizaLogger.debug("Generating swap parameters", {
                        operation: "EspaceSwap",
                        messageId: message.id
                    });

                    const actionDetails = (await generateObject({
                        runtime,
                        context,
                        modelClass: ModelClass.SMALL,
                        schema: EspaceSwapParamsSchema,
                    })) as { object: EspaceSwapParams };

                    elizaLogger.debug("Validating token existence", {
                        operation: "EspaceSwap",
                        fromToken: actionDetails.object.fromToken,
                        toToken: actionDetails.object.toToken
                    });

                    // Validate tokens exist in token list
                    const fromToken = actionDetails.object.fromToken.toUpperCase() === "CFX"
                        ? config.tokenListManager.getTokenBySymbol("WCFX")
                        : config.tokenListManager.getTokenBySymbol(actionDetails.object.fromToken);
                    const toToken = actionDetails.object.toToken.toUpperCase() === "CFX"
                        ? config.tokenListManager.getTokenBySymbol("WCFX")
                        : config.tokenListManager.getTokenBySymbol(actionDetails.object.toToken);

                    if (!fromToken || !toToken) {
                        const tokenList = config.tokenListManager.getTokenList();
                        const supportedTokens = ["CFX", ...Object.keys(tokenList)].join(", ");

                        elizaLogger.warn("Invalid token selection", {
                            operation: "EspaceSwap",
                            invalidToken: !fromToken ? actionDetails.object.fromToken : actionDetails.object.toToken,
                            availableTokens: supportedTokens
                        });

                        callback(
                            {
                                text: `❌ Swap failed: Token '${!fromToken ? actionDetails.object.fromToken : actionDetails.object.toToken}' not found. Available tokens: ${supportedTokens}`,
                                action: "SWAP_ESPACE",
                            },
                            []
                        );
                        return false;
                    }

                    elizaLogger.debug("Swap parameters generated", {
                        operation: "EspaceSwap",
                        params: actionDetails.object,
                        messageId: message.id
                    });

                    try {
                        const result = await executeSwap(config, actionDetails.object, callback);
                        callback({ text: result.successMessage, action: "SWAP_ESPACE" }, []);
                        return true;
                    } catch (error) {
                        elizaLogger.error("Swap execution failed", {
                            operation: "EspaceSwap",
                            error: error instanceof Error ? error.message : String(error),
                            params: actionDetails.object
                        });
                        callback({ text: `❌ Swap failed: ${error.message}`, action: "SWAP_ESPACE" }, []);
                        return false;
                    }
                } catch (error) {
                    if (error.name === "AI_TypeValidationError") {
                        elizaLogger.warn("Invalid swap parameters provided", {
                            operation: "EspaceSwap",
                            error: error.message,
                            messageId: message.id
                        });

                        const tokenList = config.tokenListManager.getTokenList();
                        const supportedTokens = Object.keys(tokenList).join(", ");
                        callback(
                            {
                                text: `⚠️ I need to confirm some details:

Please verify the following:
- Amount to swap (must be a valid number)
- Token pair (must be supported tokens)

Supported tokens: ${supportedTokens}

Example: "swap 10 CFX for USDT" or "exchange 5.5 USDT to ETH"

What would you like to swap?`,
                                action: "SWAP_ESPACE",
                            },
                            []
                        );
                        return false;
                    }
                    throw error;
                }
            } catch (error) {
                elizaLogger.error("Swap handler failed", {
                    operation: "EspaceSwap",
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    messageId: message.id
                });
                callback(
                    {
                        text: `❌ Swap failed: ${error.message}`,
                        action: "SWAP_ESPACE",
                    },
                    []
                );
                return false;
            }
        },
        examples: espaceSwapExamples,
    };
}
