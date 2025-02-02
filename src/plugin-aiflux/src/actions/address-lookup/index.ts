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
import {
    AddressLookupParams,
    AddressLookupParamsSchema,
    AddressInfo,
    ContractInfo,
    AccountInfo,
    ABIItem,
    TokenData,
} from "./types";
import { addressLookupTemplate } from "./template";
import { addressLookupExamples } from "./examples";
import { isAddress, getAddress as getCoreAddress } from "cive/utils";
import { ContractCheckResult } from "../../utils/wallet/types";
import { getAddress as getEspaceAddress } from "viem";
import {
    formatBaseAddressInfo,
    formatContractDetails,
    formatContractVerification,
    formatViewFunctions,
    formatAccountBalance,
    formatTokenBalances,
} from "./formatters";

async function executeAddressLookup(
    _runtime: IAgentRuntime,
    config: ValidatedConfig,
    params: AddressLookupParams
): Promise<{ info: AddressInfo; successMessage: string }> {
    elizaLogger.info("Starting address lookup operation", {
        address: params.address,
        operation: "AddressLookup",
    });

    try {
        // Determine if it's a Core or eSpace address
        const isCoreAddress = isAddress(params.address);
        const wallet = isCoreAddress ? config.coreWallet : config.espaceWallet;
        const scanner = isCoreAddress ? config.coreConfluxScan : config.espaceConfluxScan;

        elizaLogger.info("Address type determined", {
            operation: "AddressLookup",
            isCoreAddress,
            hasWallet: !!wallet,
            hasScanner: !!scanner,
        });

        if (!wallet) {
            const error = `No ${isCoreAddress ? "Core" : "eSpace"} wallet configured`;
            elizaLogger.error("Wallet configuration missing", {
                operation: "AddressLookup",
                isCoreAddress,
                error,
            });
            throw new Error(error);
        }

        if (!scanner) {
            const error = `No ${isCoreAddress ? "Core" : "eSpace"} scanner configured`;
            elizaLogger.error("Scanner configuration missing", {
                operation: "AddressLookup",
                isCoreAddress,
                error,
            });
            throw new Error(error);
        }

        // Check if the address is a contract
        elizaLogger.info("Checking if address is contract", {
            operation: "AddressLookup",
            address: params.address,
        });

        const contractCheck = (await wallet.isContract(params.address)) as ContractCheckResult;

        let successMessage = formatBaseAddressInfo(
            params.address,
            isCoreAddress,
            contractCheck.isContract,
            config.target
        );

        if (contractCheck.isContract) {
            elizaLogger.info("Fetching contract details", {
                operation: "AddressLookup",
                address: params.address,
            });

            // Contract address
            let contractAbi: ABIItem[] | null = null;
            let isVerified = false;

            try {
                // Scanner now returns ABI directly or throws if contract is not verified
                const response = await scanner.getContractABI(params.address);
                // Parse the raw ABI response into an array if it's not already
                contractAbi = Array.isArray(response.raw)
                    ? response.raw
                    : typeof response.raw === "string"
                      ? JSON.parse(response.raw)
                      : null;
                isVerified = contractAbi !== null;
                if (isVerified) {
                    elizaLogger.info("Contract ABI fetched successfully", {
                        operation: "AddressLookup",
                        abiLength: contractAbi.length,
                    });
                }
            } catch (error) {
                elizaLogger.info("Contract is not verified", {
                    operation: "AddressLookup",
                    error: error instanceof Error ? error.message : String(error),
                });
                // Contract is not verified - this is an expected case
                contractAbi = null;
                isVerified = false;
            }

            successMessage += formatContractDetails(
                contractCheck as ContractCheckResult & { isContract: true }
            );
            successMessage += formatContractVerification(isVerified);

            if (contractAbi) {
                successMessage += formatViewFunctions(contractAbi);
            }

            const info: ContractInfo = {
                isContract: true,
                type:
                    contractCheck.type === "token" || contractCheck.type === "nft"
                        ? contractCheck.type
                        : "unknown",
                isVerified,
                abi: contractAbi,
            };

            return { info, successMessage };
        } else {
            elizaLogger.info("Fetching account tokens", {
                operation: "AddressLookup",
                address: params.address,
            });

            let tokens: TokenData[] = [];
            try {
                const response = await scanner.getAccountTokens(params.address);
                tokens = response.raw;
                elizaLogger.info("Account tokens fetched", {
                    operation: "AddressLookup",
                    tokenCount: tokens.length,
                });
            } catch (error) {
                elizaLogger.warn("Failed to fetch token balances", {
                    operation: "AddressLookup",
                    error: error instanceof Error ? error.message : String(error),
                    address: params.address,
                });
            }

            let balance: string;
            if (isCoreAddress) {
                const checksummedAddress = getCoreAddress(params.address);
                // @ts-ignore - Core address type mismatch
                balance = await wallet.getBalance(checksummedAddress);
            } else {
                // For eSpace addresses, we need to ensure they're checksummed
                const checksummedAddress = getEspaceAddress(params.address);
                // @ts-ignore - eSpace address type mismatch
                balance = await wallet.getBalance(checksummedAddress);
            }

            const info: AccountInfo = {
                isContract: false,
                balance,
                tokens,
            };

            successMessage += formatAccountBalance(balance);
            successMessage += formatTokenBalances(tokens, wallet.formatTokenAmount);

            return { info, successMessage };
        }
    } catch (error) {
        elizaLogger.error("Address lookup operation failed", {
            operation: "AddressLookup",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            address: params.address,
        });
        throw error;
    }
}

export function createAddressLookupAction(config: ValidatedConfig): Action {
    elizaLogger.info("Creating address lookup action", {
        operation: "AddressLookup",
        hasCoreScan: !!config.coreConfluxScan,
        hasESpaceScan: !!config.espaceConfluxScan,
    });

    return {
        name: "ADDRESS_LOOKUP",
        description: "Lookup information about an address on Conflux networks",
        similes: [
            "LOOKUP_ADDRESS",
            "SEARCH_ADDRESS",
            "ADDRESS_INFO",
            "CONTRACT_INFO",
            "TOKEN_INFO",
            "CHECK_ADDRESS",
            "WHAT_IS_ADDRESS",
        ],
        suppressInitialMessage: true,
        validate: async (runtime: IAgentRuntime, message: Memory) => {
            elizaLogger.info("Validating address lookup configuration", {
                operation: "AddressLookup",
                hasCoreScan: !!config.coreConfluxScan,
                hasESpaceScan: !!config.espaceConfluxScan,
            });

            // Check if message contains an address pattern
            const hasAddressPattern = !!message.content?.text?.match(
                /(?:0x[a-fA-F0-9]{40}|cfx(?:test)?:[a-z0-9]+)/
            );

            return !!(config.coreConfluxScan || config.espaceConfluxScan) && hasAddressPattern;
        },
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State,
            _options: { [key: string]: unknown },
            callback: HandlerCallback
        ) => {
            elizaLogger.info("Starting address lookup handler", {
                operation: "AddressLookup",
                messageId: message.id,
            });

            try {
                state = state
                    ? await runtime.updateRecentMessageState(state)
                    : await runtime.composeState(message);

                const context = composeContext({
                    state,
                    template: addressLookupTemplate,
                });

                try {
                    const actionDetails = (await generateObject({
                        runtime,
                        context,
                        modelClass: ModelClass.SMALL,
                        schema: AddressLookupParamsSchema,
                    })) as { object: AddressLookupParams };

                    const params: AddressLookupParams = actionDetails.object;

                    elizaLogger.info("[AddressLookup] Generated action details", params);

                    const result = await executeAddressLookup(runtime, config, params);
                    callback(
                        {
                            text: result.successMessage,
                            suppressResponse: true,
                        },
                        []
                    );
                    return true;
                } catch (error) {
                    if (error.name === "AI_TypeValidationError") {
                        elizaLogger.warn("Invalid address format provided", {
                            operation: "AddressLookup",
                            error: error.message,
                            messageId: message.id,
                        });
                        callback(
                            {
                                text: `⚠️ I need a valid address to look up.

Please provide:
- A valid Ethereum address (starting with 0x)
- Or a valid Conflux address (starting with cfx:)

For example: "lookup address 0x1234..." or "search for cfx:aap..."`,
                                suppressResponse: true,
                            },
                            []
                        );
                        return false;
                    }
                    throw error;
                }
            } catch (error) {
                elizaLogger.error("Address lookup handler failed", {
                    operation: "AddressLookup",
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    messageId: message.id,
                });
                callback(
                    {
                        text: `❌ Address lookup failed: ${error.message}

Please provide a valid address:
- Must start with 0x (Ethereum style) or cfx: (Conflux style)
- Must be a valid address format

Example: "lookup address 0x1234..." or "search for cfx:aap..."`,
                        suppressResponse: true,
                    },
                    []
                );
                return false;
            }
        },
        examples: addressLookupExamples,
    };
}
