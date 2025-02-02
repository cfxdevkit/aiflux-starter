import { Evaluator, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../utils";

export class ConfluxEvaluators {
    constructor(private confluxConfig: ValidatedConfig) {
        elizaLogger.info("ConfluxEvaluators initialized with config");
    }

    getGeckoTerminalEvaluator(): Evaluator | null {
        if (!this.confluxConfig.geckoTerminal) {
            elizaLogger.info("GeckoTerminal evaluator disabled - configuration not present");
            return null;
        }
        elizaLogger.info("Creating GeckoTerminal evaluator");

        const triggers = [
            "dex pools",
            "pool info",
            "trading pairs",
            "liquidity pools",
            "pool stats",
            "pool metrics",
        ];

        return {
            name: "conflux-geckoterminal",
            description: "Evaluator for GeckoTerminal data - handles DEX pool related queries",
            similes: triggers,
            examples: [],
            validate: async (_runtime: IAgentRuntime, message: Memory) => {
                try {
                    const messageText = message.content?.text?.toLowerCase();
                    if (!messageText) {
                        elizaLogger.info("GeckoTerminal evaluator: No message text found");
                        return false;
                    }

                    const matchedTrigger = triggers.find((trigger) =>
                        messageText.includes(trigger)
                    );
                    if (matchedTrigger) {
                        elizaLogger.info(
                            `GeckoTerminal evaluator matched trigger: ${matchedTrigger}`
                        );
                        return true;
                    }
                    elizaLogger.info("GeckoTerminal evaluator: No triggers matched");
                    return false;
                } catch (error) {
                    elizaLogger.error("Error in geckoterminal evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => {
                elizaLogger.info("GeckoTerminal evaluator handler executed");
                return {
                    score: 1,
                    reason: "GeckoTerminal data requested for DEX pool information",
                };
            },
        };
    }

    getConfluxScanCoreEvaluator(): Evaluator | null {
        if (!this.confluxConfig.coreConfluxScan) {
            elizaLogger.info("ConfluxScan Core evaluator disabled - configuration not present");
            return null;
        }
        elizaLogger.info("Creating ConfluxScan Core evaluator");

        const triggers = [
            "network",
            "chain",
            "stats",
            "metrics",
            "accounts",
            "holders",
            "contracts",
            "transactions",
            "transfers",
            "tps",
            "miners",
            "gas",
            "activity",
        ];

        return {
            name: "conflux-scan-core",
            description:
                "Evaluator for ConfluxScan Core data - handles Core network related queries",
            similes: triggers,
            examples: [],
            validate: async (_runtime: IAgentRuntime, message: Memory) => {
                try {
                    const messageText = message.content?.text?.toLowerCase();
                    if (!messageText) {
                        elizaLogger.info("ConfluxScan Core evaluator: No message text found");
                        return false;
                    }

                    const matchedTrigger = triggers.find((trigger) =>
                        messageText.includes(trigger)
                    );
                    if (matchedTrigger) {
                        elizaLogger.info(
                            `ConfluxScan Core evaluator matched trigger: ${matchedTrigger}`
                        );
                        return true;
                    }
                    elizaLogger.info("ConfluxScan Core evaluator: No triggers matched");
                    return false;
                } catch (error) {
                    elizaLogger.error("Error in ConfluxScan Core evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => {
                elizaLogger.info("ConfluxScan Core evaluator handler executed");
                return {
                    score: 1,
                    reason: "ConfluxScan Core data requested for network metrics",
                };
            },
        };
    }

    getConfluxScanEspaceEvaluator(): Evaluator | null {
        if (!this.confluxConfig.espaceConfluxScan) {
            elizaLogger.info("ConfluxScan eSpace evaluator disabled - configuration not present");
            return null;
        }
        elizaLogger.info("Creating ConfluxScan eSpace evaluator");

        const triggers = [
            "network",
            "chain",
            "stats",
            "metrics",
            "accounts",
            "holders",
            "contracts",
            "transactions",
            "transfers",
            "tps",
            "gas",
            "activity",
        ];

        return {
            name: "conflux-scan-espace",
            description:
                "Evaluator for ConfluxScan eSpace data - handles eSpace network related queries",
            similes: triggers,
            examples: [],
            validate: async (_runtime: IAgentRuntime, message: Memory) => {
                try {
                    const messageText = message.content?.text?.toLowerCase();
                    if (!messageText) {
                        elizaLogger.info("ConfluxScan eSpace evaluator: No message text found");
                        return false;
                    }

                    const matchedTrigger = triggers.find((trigger) =>
                        messageText.includes(trigger)
                    );
                    if (matchedTrigger) {
                        elizaLogger.info(
                            `ConfluxScan eSpace evaluator matched trigger: ${matchedTrigger}`
                        );
                        return true;
                    }
                    elizaLogger.info("ConfluxScan eSpace evaluator: No triggers matched");
                    return false;
                } catch (error) {
                    elizaLogger.error("Error in ConfluxScan eSpace evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => {
                elizaLogger.info("ConfluxScan eSpace evaluator handler executed");
                return {
                    score: 1,
                    reason: "ConfluxScan eSpace data requested for network metrics",
                };
            },
        };
    }

    getMarketAnalysisEvaluator(): Evaluator | null {
        if (!this.confluxConfig.geckoTerminal || !this.confluxConfig.tokenListManager) {
            elizaLogger.info(
                "Market Analysis evaluator disabled - required configurations not present"
            );
            return null;
        }
        elizaLogger.info("Creating Market Analysis evaluator");

        const triggers = [
            "market analysis",
            "gainer",
            "loser",
            "trading volume",
            "newest pools",
            "buy pressure",
            "sell pressure",
            "pool trades",
            "tvl analysis",
            "tvl trend",
            "tvl history",
        ];

        return {
            name: "conflux-market-analysis",
            description: "Evaluates market analysis requests for DEX pools",
            similes: triggers,
            examples: [
                {
                    context: "Market analysis request",
                    messages: [
                        {
                            user: "user1",
                            content: {
                                text: "show me top gainers",
                            },
                        },
                    ],
                    outcome: "Top gainers analysis.",
                },
            ],
            validate: async (_runtime: IAgentRuntime, message: Memory) => {
                try {
                    const messageText = message.content?.text?.toLowerCase();
                    if (!messageText) {
                        elizaLogger.info("Market Analysis evaluator: No message text found");
                        return false;
                    }

                    const matchedTrigger = triggers.find((trigger) =>
                        messageText.includes(trigger)
                    );
                    if (matchedTrigger) {
                        const analysisType =
                            matchedTrigger === "market analysis"
                                ? "full"
                                : matchedTrigger === "gainer"
                                  ? "gainers"
                                  : matchedTrigger === "loser"
                                    ? "losers"
                                    : matchedTrigger === "trading volume"
                                      ? "volume"
                                      : matchedTrigger === "newest pools"
                                        ? "age"
                                        : matchedTrigger === "buy pressure"
                                          ? "buyPressure"
                                          : matchedTrigger === "sell pressure"
                                            ? "sellPressure"
                                            : matchedTrigger === "pool trades"
                                              ? "trades"
                                              : matchedTrigger.includes("tvl")
                                                ? "tvl"
                                                : "full";

                        const limitMatch = messageText.match(/\b(\d+)\b/);
                        const limit = limitMatch ? parseInt(limitMatch[1]) : 5;

                        elizaLogger.info(
                            `Market Analysis evaluator matched trigger: ${matchedTrigger}, type: ${analysisType}, limit: ${limit}`
                        );

                        message.content = {
                            ...message.content,
                            analysisType,
                            limit: limit.toString(),
                        };
                        return true;
                    }
                    elizaLogger.info("Market Analysis evaluator: No triggers matched");
                    return false;
                } catch (error) {
                    elizaLogger.error("Market analysis evaluator validation error:", error);
                    return false;
                }
            },
            handler: async (_runtime: IAgentRuntime, memory: Memory, _state: State) => {
                try {
                    const analysisType = memory.content?.analysisType as string;
                    const limit = memory.content?.limit;
                    if (!analysisType) {
                        elizaLogger.warn("Market Analysis handler: No analysis type specified");
                        return {
                            score: 0,
                            reason: "No analysis type specified",
                        };
                    }

                    elizaLogger.info(
                        `Market Analysis handler executing with type: ${analysisType}, limit: ${limit}`
                    );
                    return {
                        score: 1,
                        reason: `Market analysis request for ${analysisType}`,
                        state: {
                            analysisType,
                            limit: limit ? parseInt(limit as string) : 5,
                        },
                    };
                } catch (error) {
                    elizaLogger.error("Error in market analysis evaluator handler:", error);
                    return {
                        score: 0,
                        reason: "Error during evaluation",
                    };
                }
            },
        };
    }

    getDefiLlamaEvaluator(): Evaluator | null {
        if (!this.confluxConfig.defiLlama) {
            elizaLogger.info("DeFiLlama evaluator disabled - configuration not present");
            return null;
        }
        elizaLogger.info("Creating DeFiLlama evaluator");

        const triggers = [
            "defi tvl",
            "protocol tvl",
            "chain tvl",
            "total value locked",
            "protocol rankings",
            "defi rankings",
            "defi protocols",
            "protocol stats",
        ];

        return {
            name: "conflux-defillama",
            description: "Evaluator for DeFiLlama data - handles TVL and protocol metrics",
            similes: triggers,
            examples: [],
            validate: async (_runtime: IAgentRuntime, message: Memory) => {
                try {
                    const messageText = message.content?.text?.toLowerCase();
                    if (!messageText) {
                        elizaLogger.info("DeFiLlama evaluator: No message text found");
                        return false;
                    }

                    const matchedTrigger = triggers.find((trigger) =>
                        messageText.includes(trigger)
                    );
                    if (matchedTrigger) {
                        elizaLogger.info(`DeFiLlama evaluator matched trigger: ${matchedTrigger}`);
                        return true;
                    }
                    elizaLogger.info("DeFiLlama evaluator: No triggers matched");
                    return false;
                } catch (error) {
                    elizaLogger.error("Error in DeFiLlama evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => {
                elizaLogger.info("DeFiLlama evaluator handler executed");
                return {
                    score: 1,
                    reason: "DeFiLlama data requested for TVL and protocol metrics",
                };
            },
        };
    }

    getTokensEvaluator(): Evaluator | null {
        if (!this.confluxConfig.geckoTerminal || !this.confluxConfig.tokenListManager) {
            elizaLogger.info("Tokens evaluator disabled - required configurations not present");
            return null;
        }
        elizaLogger.info("Creating Tokens evaluator");

        const triggers = [
            "token list",
            "token info",
            "token details",
            "token metrics",
            "token stats",
            "token data",
            "supported tokens",
            "available tokens",
        ];

        return {
            name: "conflux-tokens",
            description: "Evaluator for token data - handles token-related queries",
            similes: triggers,
            examples: [],
            validate: async (_runtime: IAgentRuntime, message: Memory) => {
                try {
                    const messageText = message.content?.text?.toLowerCase();
                    if (!messageText) {
                        elizaLogger.info("Tokens evaluator: No message text found");
                        return false;
                    }

                    const matchedTrigger = triggers.find((trigger) =>
                        messageText.includes(trigger)
                    );
                    if (matchedTrigger) {
                        elizaLogger.info(`Tokens evaluator matched trigger: ${matchedTrigger}`);
                        return true;
                    }
                    elizaLogger.info("Tokens evaluator: No triggers matched");
                    return false;
                } catch (error) {
                    elizaLogger.error("Error in tokens evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => {
                elizaLogger.info("Tokens evaluator handler executed");
                return {
                    score: 1,
                    reason: "Token data requested for token information",
                };
            },
        };
    }

    getAllEvaluators(): Evaluator[] {
        elizaLogger.info("Getting all enabled evaluators");
        const evaluators = [
            this.getGeckoTerminalEvaluator(),
            this.getConfluxScanCoreEvaluator(),
            this.getConfluxScanEspaceEvaluator(),
            this.getMarketAnalysisEvaluator(),
            this.getDefiLlamaEvaluator(),
            this.getTokensEvaluator(),
        ].filter((evaluator) => evaluator !== null) as Evaluator[];
        elizaLogger.info(`Found ${evaluators.length} enabled evaluators`);
        return evaluators;
    }
}
