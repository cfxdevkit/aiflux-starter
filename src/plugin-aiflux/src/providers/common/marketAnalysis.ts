import { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { TokenListManager } from "../../utils/config/tokenList";
import { POOL_ANALYSIS_INSTRUCTIONS } from "../../analysis/instructions";
import { DeFiLlama, TVLSummary } from "../../utils/defillama";
import { CACHE_KEYS, withCache, logOperation } from "../../utils/cache/config";

const DEFAULT_CHAIN = "conflux";

interface MarketAnalysisConfig {
    tokenListManager?: TokenListManager;
    chain?: string;
    defiLlama?: DeFiLlama;
}

type AnalysisType =
    | "gainers"
    | "losers"
    | "volume"
    | "trades"
    | "age"
    | "buyPressure"
    | "sellPressure"
    | "full"
    | "tvl";

async function getTVLAnalysis(
    chain: string,
    runtime: IAgentRuntime,
    defiLlama: DeFiLlama
): Promise<string> {
    const chainCacheKey = CACHE_KEYS.DEFI.CHAIN_TVL(chain);
    const protocolsCacheKey = CACHE_KEYS.DEFI.PROTOCOLS_TVL(chain);

    try {
        const chainData = await withCache(
            runtime,
            chainCacheKey,
            async () => {
                const chainTVL = await defiLlama.getChainTVL(chain);
                return defiLlama.formatTVLToText(chainTVL, chain);
            },
            { provider: "market-analysis", operation: "get-chain-tvl" }
        );

        const protocolsData = await withCache(
            runtime,
            protocolsCacheKey,
            async () => {
                const protocolPromises = ["swappi", "abc-pool", "shui", "nucleon", "moon-swap"].map(
                    async (protocol) => {
                        try {
                            const data = await defiLlama.getProtocolTVL(protocol);
                            return { name: protocol, data };
                        } catch (error) {
                            logOperation("error", `Error fetching protocol TVL for ${protocol}`, {
                                provider: "market-analysis",
                                operation: "data_fetch",
                                cacheKey: protocolsCacheKey,
                                error: error instanceof Error ? error.message : String(error),
                            });
                            return null;
                        }
                    }
                );

                const protocolResults = await Promise.all(protocolPromises);
                const validProtocolResponses = protocolResults.filter(
                    (r): r is { name: string; data: TVLSummary } => r !== null
                );

                return validProtocolResponses
                    .map((protocol) => defiLlama.formatTVLToText(protocol.data, protocol.name))
                    .join("\n\n");
            },
            { provider: "market-analysis", operation: "get-protocols-tvl" }
        );

        if (chainData && protocolsData) {
            return `${chainData}\n\n${protocolsData}`;
        }

        return "TVL data unavailable";
    } catch (error) {
        logOperation("error", "Error fetching TVL data", {
            provider: "market-analysis",
            operation: "data_fetch",
            cacheKey: chainCacheKey,
            error: error instanceof Error ? error.message : String(error),
        });
        return "TVL data unavailable";
    }
}

export function getMarketAnalysisProvider(config: MarketAnalysisConfig): Provider | null {
    if (!config.tokenListManager || !config.defiLlama) {
        logOperation("info", "Market Analysis provider not initialized - missing config", {
            provider: "market-analysis",
            operation: "initialization",
            cacheKey: CACHE_KEYS.MARKET_ANALYSIS.TVL,
        });
        return null;
    }

    const tlm = config.tokenListManager;
    const defiLlama = config.defiLlama;
    const chain = config.chain || DEFAULT_CHAIN;

    logOperation("info", "Market Analysis provider initialized", {
        provider: "market-analysis",
        operation: "initialization",
        cacheKey: CACHE_KEYS.MARKET_ANALYSIS.TVL,
    });

    const getAnalysisData = async (
        runtime: IAgentRuntime,
        request: { type: AnalysisType; limit?: number }
    ): Promise<string> => {
        const limit = request.limit || 5;

        if (request.type !== "full") {
            let cacheKey: string;
            if (request.type === "tvl") {
                cacheKey = CACHE_KEYS.MARKET_ANALYSIS.TVL;
            } else {
                const keyFn =
                    CACHE_KEYS.MARKET_ANALYSIS[
                        request.type.toUpperCase() as keyof typeof CACHE_KEYS.MARKET_ANALYSIS
                    ];
                if (typeof keyFn === "function") {
                    cacheKey = keyFn(limit);
                } else {
                    return "Invalid analysis type requested";
                }
            }

            return withCache(
                runtime,
                cacheKey,
                async () => {
                    switch (request.type) {
                        case "tvl":
                            return getTVLAnalysis(chain, runtime, defiLlama);
                        case "gainers":
                            return tlm.getTopGainers(limit);
                        case "losers":
                            return tlm.getTopLosers(limit);
                        case "volume":
                            return tlm.getTopVolume(limit);
                        case "trades":
                            return tlm.getTopTrades(limit);
                        case "age":
                            return tlm.getPoolsByAge(true, limit);
                        case "buyPressure":
                            return tlm.getMostBuyPressure(limit);
                        case "sellPressure":
                            return tlm.getMostSellPressure(limit);
                        default:
                            return "Invalid analysis type requested";
                    }
                },
                { provider: "market-analysis", operation: `get-${request.type}-analysis` }
            );
        }

        // For full analysis, combine market analysis with TVL
        return `${tlm.getMarketAnalysis()}\n\n${await getTVLAnalysis(chain, runtime, defiLlama)}`;
    };

    return {
        get: async (
            runtime: IAgentRuntime,
            message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const analysisType = message.content?.analysisType as AnalysisType;
            const rawLimit = message.content?.limit;
            const limit = typeof rawLimit === "string" ? parseInt(rawLimit, 10) : undefined;

            if (!analysisType) {
                return "No analysis type specified";
            }

            try {
                return `${await getAnalysisData(runtime, { type: analysisType, limit })}\n\n${POOL_ANALYSIS_INSTRUCTIONS}`;
            } catch (error) {
                logOperation("error", "Error in market analysis provider", {
                    provider: "market-analysis",
                    operation: "data_fetch",
                    cacheKey: "N/A",
                    error: error instanceof Error ? error.message : String(error),
                });
                return null;
            }
        },
    };
}
