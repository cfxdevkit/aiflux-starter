import { IAgentRuntime, Memory, Provider, State, elizaLogger } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { TVLSummary } from "../../utils/defillama";

const PROTOCOLS = ['swappi', 'abc-pool', 'shui', 'nucleon', 'moon-swap'];
const DEFAULT_CACHE_DURATION = 300; // 5 minutes
const DEFAULT_CHAIN = 'conflux';

// Cache key constants to ensure consistency between provider and evaluator
const CACHE_KEYS = {
    CHAIN_TVL: (chain: string) => `defillama:tvl:chain:${chain}`,
    PROTOCOLS_TVL: (chain: string) => `defillama:tvl:protocols:${chain}`
} as const;

export function getDefiLlamaProvider(config: ValidatedConfig): Provider | null {
    if (!config.defiLlama) {
        elizaLogger.error("DeFiLlama instance is required for DeFiLlama provider");
        return null;
    }

    const defiLlama = config.defiLlama;

    async function getCachedTVLData(runtime: IAgentRuntime): Promise<string | null> {
        const cache = runtime.cacheManager;
        const chainCacheKey = CACHE_KEYS.CHAIN_TVL(DEFAULT_CHAIN);
        const protocolsCacheKey = CACHE_KEYS.PROTOCOLS_TVL(DEFAULT_CHAIN);

        try {
            // Check both chain and protocols cache
            const [chainData, protocolsData] = await Promise.all([
                cache.get<TVLSummary>(chainCacheKey),
                cache.get<Array<{ name: string; data: TVLSummary }>>(protocolsCacheKey)
            ]);

            // Validate the cached data structure
            const isValidChainData = chainData && typeof chainData === 'object' && 'currentTVL' in chainData;
            const isValidProtocolsData = protocolsData && Array.isArray(protocolsData) && protocolsData.length > 0 &&
                protocolsData.every(p => p && typeof p === 'object' && 'name' in p && 'data' in p);

            const hasCachedData = isValidChainData && isValidProtocolsData;

            elizaLogger.debug("DeFiLlama provider cache check:", {
                provider: "defillama",
                hasCachedData,
                chainDataExists: isValidChainData,
                protocolDataExists: isValidProtocolsData
            });

            if (hasCachedData) {
                try {
                    // Format the cached data
                    const chainText = defiLlama.formatTVLToText(chainData, DEFAULT_CHAIN);
                    const protocolsText = protocolsData.map(protocol =>
                        defiLlama.formatTVLToText(protocol.data, protocol.name)
                    ).join("\n\n");
                    return `${chainText}\n\n${protocolsText}`;
                } catch (formatError) {
                    elizaLogger.error("Error formatting cached TVL data:", {
                        error: formatError instanceof Error ? formatError.message : String(formatError)
                    });
                    // If we can't format the cached data, invalidate it
                    await Promise.all([
                        cache.set(chainCacheKey, null),
                        cache.set(protocolsCacheKey, null)
                    ]);
                }
            }

            // Get chain TVL
            elizaLogger.debug("Fetching chain TVL data");
            let chainTVL: TVLSummary;
            try {
                chainTVL = await defiLlama.getChainTVL(DEFAULT_CHAIN);
                elizaLogger.debug("Chain TVL data fetched:", {
                    currentTVL: chainTVL.currentTVL,
                    monthlyChange: chainTVL.monthlyChange
                });
            } catch (chainError) {
                elizaLogger.error("Error fetching chain TVL:", {
                    error: chainError instanceof Error ? chainError.message : String(chainError)
                });
                return null;
            }

            const chainResponse = defiLlama.formatTVLToText(chainTVL, DEFAULT_CHAIN);

            // Get protocol TVLs in parallel
            elizaLogger.debug("Fetching protocol TVL data");
            const protocolResponses = await Promise.all(
                PROTOCOLS.map(async protocol => {
                    try {
                        const protocolTVL = await defiLlama.getProtocolTVL(protocol);
                        elizaLogger.debug(`Protocol TVL: ${protocol}`, {
                            currentTVL: protocolTVL.currentTVL,
                            monthlyChange: protocolTVL.monthlyChange
                        });
                        return {
                            name: protocol,
                            data: protocolTVL
                        };
                    } catch (error) {
                        elizaLogger.error(`Error fetching TVL for ${protocol}:`, {
                            error: error instanceof Error ? error.message : String(error)
                        });
                        return null;
                    }
                })
            );

            const validProtocolResponses = protocolResponses.filter(r => r !== null);
            if (validProtocolResponses.length === 0) {
                elizaLogger.error("No valid protocol responses received");
                return null;
            }

            const protocolsResponse = validProtocolResponses.map(protocol =>
                defiLlama.formatTVLToText(protocol.data, protocol.name)
            ).join("\n\n");

            // Cache the responses with consistent expiration
            await Promise.all([
                cache.set(chainCacheKey, chainTVL, { expires: DEFAULT_CACHE_DURATION }),
                cache.set(protocolsCacheKey, validProtocolResponses, { expires: DEFAULT_CACHE_DURATION })
            ]);

            elizaLogger.debug("DeFiLlama cache updated:", {
                provider: "defillama",
                protocolsCount: validProtocolResponses.length
            });

            return `${chainResponse}\n\n${protocolsResponse}`;
        } catch (error) {
            elizaLogger.error("Error in DeFiLlama provider:", {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            return getCachedTVLData(runtime);
        }
    };
}