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
} from "./types";
import { addressLookupTemplate } from "./template";
import { addressLookupExamples } from "./examples";
import { isAddress } from "cive/utils";
import { ContractCheckResult } from "../../utils/wallet/types";
import { Address as CoreAddress } from "cive";
import { Address as EspaceAddress } from "viem";
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
    elizaLogger.debug("Starting address lookup operation", {
        address: params.address,
        operation: "AddressLookup"
    });

    try {
        // Determine if it's a Core or eSpace address
        const isCoreAddress = isAddress(params.address);
        const wallet = isCoreAddress ? config.coreWallet : config.espaceWallet;
        const scanner = isCoreAddress ? config.coreConfluxScan : config.espaceConfluxScan;

        elizaLogger.debug("Address type determined", {
            operation: "AddressLookup",
            isCoreAddress,
            hasWallet: !!wallet,
            hasScanner: !!scanner
        });

        if (!wallet) {
            const error = `No ${isCoreAddress ? "Core" : "eSpace"} wallet configured`;
            elizaLogger.error("Wallet configuration missing", {
                operation: "AddressLookup",
                isCoreAddress,
                error
            });
            throw new Error(error);
        }

        if (!scanner) {
            const error = `No ${isCoreAddress ? "Core" : "eSpace"} scanner configured`;
            elizaLogger.error("Scanner configuration missing", {
                operation: "AddressLookup",
                isCoreAddress,
                error
            });
            throw new Error(error);
        }

        // Check if the address is a contract
        elizaLogger.debug("Checking if address is contract", {
            operation: "AddressLookup",
            address: params.address
        });

        const contractCheck = (await wallet.isContract(params.address)) as ContractCheckResult;

        let successMessage = formatBaseAddressInfo(
            params.address,
            isCoreAddress,
            contractCheck.isContract,
            config.target
        );

        if (contractCheck.isContract) {
            elizaLogger.debug("Fetching contract details", {
                operation: "AddressLookup",
                address: params.address
            });

            // Contract address
            let contractAbi;
            try {
                const abiResponse = (await scanner.getContractABI(params.address)) as any;
                elizaLogger.debug("ABI fetch response received", {
                    operation: "AddressLookup",
                    hasResult: !!abiResponse?.result || !!abiResponse?.data,
                    status: abiResponse?.status,
                    code: abiResponse?.code
                });

                // Parse ABI from response - handle both Core and eSpace formats
                let abiString = null;
                if (abiResponse?.status === "1" && abiResponse?.result) {
                    // Core network format
                    abiString = abiResponse.result;
                } else if (abiResponse?.code === 0 && abiResponse?.data) {
                    // eSpace network format
                    abiString = abiResponse.data;
                }

                if (abiString) {
                    try {
                        contractAbi = JSON.parse(abiString);
                        elizaLogger.debug("ABI successfully parsed", {
                            operation: "AddressLookup",
                            isArray: Array.isArray(contractAbi),
                            length: Array.isArray(contractAbi) ? contractAbi.length : 0
                        });
                    } catch (parseError) {
                        elizaLogger.warn("Failed to parse ABI JSON", {
                            operation: "AddressLookup",
                            error: parseError instanceof Error ? parseError.message : String(parseError)
                        });
                        contractAbi = null;
                    }
                }

                if (contractAbi && !Array.isArray(contractAbi)) {
                    elizaLogger.warn("Invalid ABI format detected", {
                        operation: "AddressLookup",
                        abiType: typeof contractAbi
                    });
                    contractAbi = null;
                }
            } catch (error) {
                elizaLogger.warn("Failed to fetch contract ABI", {
                    operation: "AddressLookup",
                    error: error instanceof Error ? error.message : String(error),
                    address: params.address
                });
                contractAbi = null;
            }

            successMessage += formatContractDetails(contractCheck as ContractCheckResult & { isContract: true });
            successMessage += formatContractVerification(!!contractAbi);

            if (contractAbi && Array.isArray(contractAbi)) {
                successMessage += formatViewFunctions(contractAbi);
            }

            const info: ContractInfo = {
                isContract: true,
                type:
                    contractCheck.type === "token" ||
                    contractCheck.type === "nft"
                        ? contractCheck.type
                        : "unknown",
                isVerified: !!contractAbi,
                abi: contractAbi,
            };

            return { info, successMessage };
        } else {
            elizaLogger.debug("Fetching account tokens", {
                operation: "AddressLookup",
                address: params.address
            });

            let tokens = [];
            try {
                tokens = await scanner.getAccountTokens(params.address);
                elizaLogger.debug("Account tokens fetched", {
                    operation: "AddressLookup",
                    tokenCount: tokens.length
                });
            } catch (error) {
                elizaLogger.warn("Failed to fetch token balances", {
                    operation: "AddressLookup",
                    error: error instanceof Error ? error.message : String(error),
                    address: params.address
                });
            }

            let balance: string;
            if(isCoreAddress) {
                // @ts-ignore
                balance = await wallet.getBalance(params.address as CoreAddress);
            } else {
                // @ts-ignore
                balance = await wallet.getBalance(params.address as EspaceAddress);
            }

            // Get the balance using the appropriate address type
            // const balance = await wallet.getBalance(params.address as any);
            const info: AccountInfo = {
                isContract: false,
                balance,
                tokens
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
            address: params.address
        });
        throw error;
    }
}

export function createAddressLookupAction(config: ValidatedConfig): Action {
    elizaLogger.debug("Creating address lookup action", {
        operation: "AddressLookup",
        hasCoreScan: !!config.coreConfluxScan,
        hasESpaceScan: !!config.espaceConfluxScan
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
            "WHAT_IS_ADDRESS"
        ],
        suppressInitialMessage: true,
        validate: async (runtime: IAgentRuntime, message: Memory) => {
            elizaLogger.debug("Validating address lookup configuration", {
                operation: "AddressLookup",
                hasCoreScan: !!config.coreConfluxScan,
                hasESpaceScan: !!config.espaceConfluxScan
            });

            // Check if message contains an address pattern
            const hasAddressPattern = !!message.content?.text?.match(/(?:0x[a-fA-F0-9]{40}|cfx(?:test)?:[a-z0-9]+)/);

            return !!(config.coreConfluxScan || config.espaceConfluxScan) && hasAddressPattern;
        },
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State,
            _options: any,
            callback: HandlerCallback
        ) => {
            elizaLogger.debug("Starting address lookup handler", {
                operation: "AddressLookup",
                messageId: message.id
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

                    elizaLogger.debug(
                        "[AddressLookup] Generated action details",
                        params
                    );

                    const result = await executeAddressLookup(
                        runtime,
                        config,
                        params
                    );
                    callback({
                        text: result.successMessage,
                        suppressResponse: true
                    }, []);
                    return true;
                } catch (error) {
                    if (error.name === "AI_TypeValidationError") {
                        elizaLogger.warn("Invalid address format provided", {
                            operation: "AddressLookup",
                            error: error.message,
                            messageId: message.id
                        });
                        callback(
                            {
                                text: `⚠️ I need a valid address to look up.

Please provide:
- A valid Ethereum address (starting with 0x)
- Or a valid Conflux address (starting with cfx:)

For example: "lookup address 0x1234..." or "search for cfx:aap..."`,
                                suppressResponse: true
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
                    messageId: message.id
                });
                callback(
                    {
                        text: `❌ Address lookup failed: ${error.message}

Please provide a valid address:
- Must start with 0x (Ethereum style) or cfx: (Conflux style)
- Must be a valid address format

Example: "lookup address 0x1234..." or "search for cfx:aap..."`,
                        suppressResponse: true
                    },
                    []
                );
                return false;
            }
        },
        examples: addressLookupExamples,
    };
}
