import { Evaluator, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../utils";

export class ConfluxEvaluators {
    confluxConfig: ValidatedConfig;
    constructor(private config: ValidatedConfig) {
        this.confluxConfig = config;
    }

    getGeckoTerminalEvaluator(): Evaluator | null {
        if (!this.confluxConfig.geckoTerminal) {
            return null;
        }

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
                    if (!messageText) return false;

                    return triggers.some((trigger) => messageText.includes(trigger));
                } catch (error) {
                    elizaLogger.error("Error in geckoterminal evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "GeckoTerminal data requested for DEX pool information",
            }),
        };
    }

    getConfluxScanCoreEvaluator(): Evaluator | null {
        if (!this.confluxConfig.coreConfluxScan) {
            return null;
        }

        const triggers = [
            "core network",
            "core chain",
            "core stats",
            "core metrics",
            "core accounts",
            "core holders",
            "core contracts",
            "core transactions",
            "core transfers",
            "core tps",
            "core miners",
            "core gas",
            "core activity",
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
                    if (!messageText) return false;

                    return triggers.some((trigger) => messageText.includes(trigger));
                } catch (error) {
                    elizaLogger.error("Error in ConfluxScan Core evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "ConfluxScan Core data requested for network metrics",
            }),
        };
    }

    getConfluxScanEspaceEvaluator(): Evaluator | null {
        if (!this.confluxConfig.espaceConfluxScan) {
            return null;
        }

        const triggers = [
            "espace network",
            "espace chain",
            "espace stats",
            "espace metrics",
            "espace accounts",
            "espace holders",
            "espace contracts",
            "espace transactions",
            "espace transfers",
            "espace tps",
            "espace gas",
            "espace activity",
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
                    if (!messageText) return false;

                    return triggers.some((trigger) => messageText.includes(trigger));
                } catch (error) {
                    elizaLogger.error("Error in ConfluxScan eSpace evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "ConfluxScan eSpace data requested for network metrics",
            }),
        };
    }

    getMarketAnalysisEvaluator(): Evaluator | null {
        if (!this.confluxConfig.geckoTerminal || !this.confluxConfig.tokenListManager) {
            return null;
        }

        const triggers = [
            "market analysis",
            "top gainers",
            "top losers",
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
                    if (!messageText) return false;

                    const matchedTrigger = triggers.find((trigger) =>
                        messageText.includes(trigger)
                    );

                    if (matchedTrigger) {
                        const analysisType =
                            matchedTrigger === "market analysis"
                                ? "full"
                                : matchedTrigger === "top gainers"
                                  ? "gainers"
                                  : matchedTrigger === "top losers"
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

                        // Parse limit from message (e.g., "show top 10 gainers")
                        const limitMatch = messageText.match(/\b(\d+)\b/);
                        const limit = limitMatch ? parseInt(limitMatch[1]) : 5;

                        message.content = {
                            ...message.content,
                            analysisType,
                            limit: limit.toString(),
                        };

                        return true;
                    }

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
                        return {
                            score: 0,
                            reason: "No analysis type specified",
                        };
                    }

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
            return null;
        }

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
                    if (!messageText) return false;

                    return triggers.some((trigger) => messageText.includes(trigger));
                } catch (error) {
                    elizaLogger.error("Error in DeFiLlama evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "DeFiLlama data requested for TVL and protocol metrics",
            }),
        };
    }

    getTokensEvaluator(): Evaluator | null {
        if (!this.confluxConfig.geckoTerminal || !this.confluxConfig.tokenListManager) {
            return null;
        }

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
                    if (!messageText) return false;

                    return triggers.some((trigger) => messageText.includes(trigger));
                } catch (error) {
                    elizaLogger.error("Error in tokens evaluator validation:", error);
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "Token data requested for token information",
            }),
        };
    }

    getAllEvaluators(): Evaluator[] {
        return [
            this.getGeckoTerminalEvaluator(),
            this.getConfluxScanCoreEvaluator(),
            this.getConfluxScanEspaceEvaluator(),
            this.getMarketAnalysisEvaluator(),
            this.getDefiLlamaEvaluator(),
            this.getTokensEvaluator(),
        ].filter((evaluator) => evaluator !== null) as Evaluator[];
    }
}
