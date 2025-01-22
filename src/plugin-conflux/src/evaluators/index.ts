import {
    Evaluator,
    IAgentRuntime,
    Memory,
    State,
    elizaLogger,
} from "@elizaos/core";
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

        return {
            name: "conflux-geckoterminal",
            description:
                "Evaluator for GeckoTerminal data - updates when cache expires",
            similes: [],
            examples: [],
            validate: async (runtime: IAgentRuntime) => {
                try {
                    const cacheKey = `conflux:espace:geckoterminal`;
                    const cachedData = await runtime.cacheManager.get(cacheKey);
                    const needsUpdate = cachedData === null;

                    elizaLogger.debug("GeckoTerminal evaluator check result:", {
                        evaluator: "conflux-geckoterminal",
                        needsUpdate,
                        hasCachedData: !needsUpdate
                    });

                    return needsUpdate;
                } catch (error) {
                    elizaLogger.error(
                        "Error in geckoterminal evaluator validation:",
                        error
                    );
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "GeckoTerminal data needs to be updated due to expired/missing cache",
            }),
        };
    }

    getConfluxScanCoreEvaluator(): Evaluator | null {
        if (!this.confluxConfig.coreConfluxScan) {
            return null;
        }

        return {
            name: "conflux-scan-core",
            description:
                "Evaluator for ConfluxScan Core data - updates when cache expires",
            similes: [],
            examples: [],
            validate: async (runtime: IAgentRuntime) => {
                try {
                    // Check all possible cache keys
                    const cacheKeys = [
                        "conflux:core:confluxscan:active_accounts",
                        "conflux:core:confluxscan:cfx_holders",
                        "conflux:core:confluxscan:account_growth",
                        "conflux:core:confluxscan:contracts",
                        "conflux:core:confluxscan:supply",
                        "conflux:core:confluxscan:transactions",
                        "conflux:core:confluxscan:cfx_transfers",
                        "conflux:core:confluxscan:tps",
                        "conflux:core:confluxscan:top_miners",
                        "conflux:core:confluxscan:top_gas_used",
                        "conflux:core:confluxscan:top_cfx_senders",
                        "conflux:core:confluxscan:top_cfx_receivers",
                        "conflux:core:confluxscan:top_tx_senders",
                        "conflux:core:confluxscan:top_tx_receivers",
                    ];

                    let expiredKeys = [];
                    // Check if any of the caches are expired
                    for (const key of cacheKeys) {
                        const cachedData = await runtime.cacheManager.get(key);
                        if (cachedData === null) {
                            expiredKeys.push(key);
                        }
                    }

                    const needsUpdate = expiredKeys.length > 0;

                    elizaLogger.debug("ConfluxScan Core evaluator check result:", {
                        evaluator: "conflux-scan-core",
                        needsUpdate,
                        hasCachedData: !needsUpdate,
                        expiredKeysCount: expiredKeys.length,
                        expiredKeys
                    });

                    return needsUpdate;
                } catch (error) {
                    elizaLogger.error(
                        "Error in ConfluxScan Core evaluator validation:",
                        error
                    );
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "ConfluxScan Core data needs to be updated due to expired/missing cache",
            }),
        };
    }

    getConfluxScanEspaceEvaluator(): Evaluator | null {
        if (!this.confluxConfig.espaceConfluxScan) {
            return null;
        }

        return {
            name: "conflux-scan-espace",
            description:
                "Evaluator for ConfluxScan eSpace data - updates when cache expires",
            similes: [],
            examples: [],
            validate: async (runtime: IAgentRuntime) => {
                try {
                    // Check all possible cache keys
                    const cacheKeys = [
                        "conflux:espace:confluxscan:active_accounts",
                        "conflux:espace:confluxscan:cfx_holders",
                        "conflux:espace:confluxscan:account_growth",
                        "conflux:espace:confluxscan:contracts",
                        "conflux:espace:confluxscan:transactions",
                        "conflux:espace:confluxscan:cfx_transfers",
                        "conflux:espace:confluxscan:tps",
                        "conflux:espace:confluxscan:top_gas_used",
                        "conflux:espace:confluxscan:top_cfx_senders",
                        "conflux:espace:confluxscan:top_cfx_receivers",
                        "conflux:espace:confluxscan:top_tx_senders",
                        "conflux:espace:confluxscan:top_tx_receivers",
                        "conflux:espace:confluxscan:top_token_participants",
                        "conflux:espace:confluxscan:top_token_transfers",
                    ];

                    let expiredKeys = [];
                    // Check if any of the caches are expired
                    for (const key of cacheKeys) {
                        const cachedData = await runtime.cacheManager.get(key);
                        if (cachedData === null) {
                            expiredKeys.push(key);
                        }
                    }

                    const needsUpdate = expiredKeys.length > 0;

                    elizaLogger.debug("ConfluxScan eSpace evaluator check result:", {
                        evaluator: "conflux-scan-espace",
                        needsUpdate,
                        hasCachedData: !needsUpdate,
                        expiredKeysCount: expiredKeys.length,
                        expiredKeys
                    });

                    return needsUpdate;
                } catch (error) {
                    elizaLogger.error(
                        "Error in ConfluxScan eSpace evaluator validation:",
                        error
                    );
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "ConfluxScan eSpace data needs to be updated due to expired/missing cache",
            }),
        };
    }

    getMarketAnalysisEvaluator(): Evaluator | null {
        if (!this.confluxConfig.geckoTerminal) {
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
            "tvl history"
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
            validate: async (runtime: IAgentRuntime, message: Memory) => {
                try {
                    const messageText = message.content?.text?.toLowerCase();
                    if (!messageText) return false;

                    const matchedTrigger = triggers.find(trigger =>
                        messageText.includes(trigger)
                    );

                    if (matchedTrigger) {
                        const analysisType = matchedTrigger === "market analysis" ? "full" :
                            matchedTrigger === "top gainers" ? "gainers" :
                            matchedTrigger === "top losers" ? "losers" :
                            matchedTrigger === "trading volume" ? "volume" :
                            matchedTrigger === "newest pools" ? "age" :
                            matchedTrigger === "buy pressure" ? "buyPressure" :
                            matchedTrigger === "sell pressure" ? "sellPressure" :
                            matchedTrigger === "pool trades" ? "trades" :
                            matchedTrigger.includes("tvl") ? "tvl" : "full";

                        // Parse limit from message (e.g., "show top 10 gainers")
                        const limitMatch = messageText.match(/\b(\d+)\b/);
                        const limit = limitMatch ? parseInt(limitMatch[1]) : 5;

                        message.content = {
                            ...message.content,
                            analysisType,
                            limit: limit.toString()
                        };
                        return true;
                    }

                    return false;
                } catch (error) {
                    elizaLogger.error("Market analysis evaluator validation error:", error);
                    return false;
                }
            },
            handler: async (
                runtime: IAgentRuntime,
                memory: Memory,
                state: State
            ) => {
                try {
                    const analysisType = memory.content?.analysisType as string;
                    const limit = memory.content?.limit;
                    if (!analysisType) {
                        return {
                            score: 0,
                            reason: "No analysis type specified"
                        };
                    }

                    return {
                        score: 1,
                        reason: `Market analysis request for ${analysisType}`,
                        state: {
                            analysisType,
                            limit: limit ? parseInt(limit as string) : 5
                        }
                    };
                } catch (error) {
                    elizaLogger.error("Error in market analysis evaluator handler:", error);
                    return {
                        score: 0,
                        reason: "Error during evaluation"
                    };
                }
            },
        };
    }

    getDefiLlamaEvaluator(): Evaluator | null {
        if (!this.confluxConfig.defiLlama) {
            return null;
        }

        const DEFAULT_CHAIN = 'conflux';
        const CACHE_KEYS = {
            CHAIN_TVL: (chain: string) => `defillama:tvl:chain:${chain}`,
            PROTOCOLS_TVL: (chain: string) => `defillama:tvl:protocols:${chain}`
        } as const;

        return {
            name: "conflux-defillama",
            description: "Evaluator for DeFiLlama data - updates when cache expires",
            similes: [],
            examples: [],
            validate: async (runtime: IAgentRuntime) => {
                try {
                    const cacheKeys = [
                        CACHE_KEYS.CHAIN_TVL(DEFAULT_CHAIN),
                        CACHE_KEYS.PROTOCOLS_TVL(DEFAULT_CHAIN)
                    ];

                    let expiredKeys = [];
                    // Check if any of the caches are expired
                    const cacheResults = await Promise.all(
                        cacheKeys.map(async key => ({
                            key,
                            data: await runtime.cacheManager.get(key)
                        }))
                    );

                    expiredKeys = cacheResults
                        .filter(result => result.data === null)
                        .map(result => result.key);

                    const needsUpdate = expiredKeys.length > 0;

                    elizaLogger.debug("DeFiLlama evaluator cache check:", {
                        evaluator: "conflux-defillama",
                        needsUpdate,
                        hasCachedData: !needsUpdate,
                        expiredKeysCount: expiredKeys.length,
                        expiredKeys,
                        checkedKeys: cacheKeys
                    });

                    return needsUpdate;
                } catch (error) {
                    elizaLogger.error(
                        "Error in DeFiLlama evaluator validation:",
                        error
                    );
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "DeFiLlama data needs to be updated due to expired/missing cache",
            }),
        };
    }

    getTokensEvaluator(): Evaluator | null {
        if (!this.confluxConfig.geckoTerminal || !this.confluxConfig.tokenListManager) {
            return null;
        }

        return {
            name: "conflux-tokens",
            description: "Evaluator for token data - updates when cache expires",
            similes: [],
            examples: [],
            validate: async (runtime: IAgentRuntime) => {
                try {
                    const cacheKey = "conflux:espace:tokens";
                    const cachedData = await runtime.cacheManager.get(cacheKey);
                    const needsUpdate = cachedData === null;

                    elizaLogger.debug("Tokens evaluator cache check:", {
                        evaluator: "conflux-tokens",
                        needsUpdate,
                        hasCachedData: !needsUpdate,
                        cacheKey
                    });

                    return needsUpdate;
                } catch (error) {
                    elizaLogger.error(
                        "Error in tokens evaluator validation:",
                        error
                    );
                    return false;
                }
            },
            handler: async () => ({
                score: 1,
                reason: "Token data needs to be updated due to expired/missing cache",
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
