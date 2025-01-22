import { Provider, IAgentRuntime, Memory, State, elizaLogger } from "@elizaos/core";
import { TokenListManager } from "../../utils/config/tokenList";
import { POOL_ANALYSIS_INSTRUCTIONS } from "../../analysis/instructions";
import { DeFiLlama } from "../../utils/defillama";

const DEFAULT_CHAIN = 'conflux';
const CACHE_KEYS = {
    CHAIN_TVL: (chain: string) => `defillama:tvl:chain:${chain}`,
    PROTOCOLS_TVL: (chain: string) => `defillama:tvl:protocols:${chain}`
} as const;

interface MarketAnalysisConfig {
    tokenListManager?: TokenListManager;
    cacheDuration?: number;
    chain?: string;
    defiLlama?: DeFiLlama;
}

type AnalysisType =
    | 'gainers'
    | 'losers'
    | 'volume'
    | 'trades'
    | 'age'
    | 'buyPressure'
    | 'sellPressure'
    | 'full'
    | 'tvl';

async function getTVLAnalysis(chain: string, runtime: IAgentRuntime, defiLlama: DeFiLlama): Promise<string> {
    const chainCacheKey = CACHE_KEYS.CHAIN_TVL(chain);
    const protocolsCacheKey = CACHE_KEYS.PROTOCOLS_TVL(chain);

    try {
        // Check both chain and protocols cache
        const [chainData, protocolsData] = await Promise.all([
            runtime.cacheManager.get<string>(chainCacheKey),
            runtime.cacheManager.get<string>(protocolsCacheKey)
        ]);

        const hasCachedData = chainData !== null && protocolsData !== null;

        if (hasCachedData) {
            elizaLogger.debug("Using cached DeFiLlama TVL data");
            return `${chainData}\n\n${protocolsData}`;
        }

        // Get chain TVL
        elizaLogger.debug("Fetching chain and protocol TVL data");
        const chainTVL = await defiLlama.getChainTVL(chain);
        const chainResponse = defiLlama.formatTVLToText(chainTVL, chain);

        // Cache for 5 minutes by default
        await runtime.cacheManager.set(chainCacheKey, chainResponse, { expires: 300 });
        return chainResponse;
    } catch (error) {
        elizaLogger.error("Error fetching TVL data:", error);
        return "TVL data unavailable";
    }
}

export function getMarketAnalysisProvider(config: MarketAnalysisConfig): Provider | null {
    if (!config.tokenListManager) {
        elizaLogger.error("TokenListManager is required for market analysis provider");
        return null;
    }

    const cacheDuration = config.cacheDuration || 300;
    const tlm = config.tokenListManager;
    const chain = config.chain || DEFAULT_CHAIN;
    const defiLlama = config.defiLlama || new DeFiLlama();

    const getAnalysisData = async (runtime: IAgentRuntime, request: { type: AnalysisType; limit?: number }): Promise<string> => {
        const limit = request.limit || 5;

        switch (request.type) {
            case 'tvl':
                return getTVLAnalysis(chain, runtime, defiLlama);
            case 'full':
                const [marketAnalysis, tvlAnalysis] = await Promise.all([
                    tlm.getMarketAnalysis(),
                    getTVLAnalysis(chain, runtime, defiLlama)
                ]);
                return `${marketAnalysis}\n\n${tvlAnalysis}`;
            case 'gainers':
                return tlm.getTopGainers(limit);
            case 'losers':
                return tlm.getTopLosers(limit);
            case 'volume':
                return tlm.getTopVolume(limit);
            case 'trades':
                return tlm.getTopTrades(limit);
            case 'age':
                return tlm.getPoolsByAge(true, limit);
            case 'buyPressure':
                return tlm.getMostBuyPressure(limit);
            case 'sellPressure':
                return tlm.getMostSellPressure(limit);
            default:
                return "Invalid analysis type requested";
        }
    };

    return {
        get: async (
            runtime: IAgentRuntime,
            message: Memory,
            state?: State
        ): Promise<string | null> => {
            const analysisType = message.content?.analysisType as AnalysisType;
            const rawLimit = message.content?.limit;
            const limit = typeof rawLimit === 'string' ? parseInt(rawLimit, 10) : undefined;

            if (!analysisType) {
                return "No analysis type specified";
            }

            try {
                return `${await getAnalysisData(runtime, { type: analysisType, limit })}\n\n${POOL_ANALYSIS_INSTRUCTIONS}`;

            } catch (error) {
                elizaLogger.error("Error in market analysis provider:", error);
                return null;
            }
        }
    };
}