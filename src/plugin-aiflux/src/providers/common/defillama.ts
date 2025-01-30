import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ValidatedConfig } from "../../utils";
import { CACHE_KEYS, withCache, logOperation } from "../../utils/cache/config";
import { TVLSummary } from "../../utils/defillama";

const PROTOCOLS = ["swappi", "abc-pool", "shui", "nucleon", "moon-swap"];

export function getDefiLlamaProvider(config: ValidatedConfig): Provider | null {
    if (!config.defiLlama) {
        logOperation("info", "DeFiLlama provider not initialized - missing config", {
            provider: "defillama",
            operation: "initialization",
            cacheKey: CACHE_KEYS.DEFI.CHAIN_TVL("conflux"),
        });
        return null;
    }

    const defiLlama = config.defiLlama;
    const DEFAULT_CHAIN = "conflux";

    logOperation("info", "DeFiLlama provider initialized", {
        provider: "defillama",
        operation: "initialization",
        cacheKey: CACHE_KEYS.DEFI.CHAIN_TVL(DEFAULT_CHAIN),
    });

    return {
        get: async (
            runtime: IAgentRuntime,
            _message: Memory,
            _state?: State
        ): Promise<string | null> => {
            const chainCacheKey = CACHE_KEYS.DEFI.CHAIN_TVL(DEFAULT_CHAIN);
            const protocolsCacheKey = CACHE_KEYS.DEFI.PROTOCOLS_TVL(DEFAULT_CHAIN);

            try {
                const chainData = await withCache(
                    runtime,
                    chainCacheKey,
                    async () => {
                        const chainTVL = await defiLlama.getChainTVL(DEFAULT_CHAIN);
                        return defiLlama.formatTVLToText(chainTVL, DEFAULT_CHAIN);
                    },
                    { provider: "defillama", operation: "get-chain-tvl" }
                );

                const protocolsData = await withCache(
                    runtime,
                    protocolsCacheKey,
                    async () => {
                        const protocolPromises = PROTOCOLS.map(async (protocol) => {
                            try {
                                const data = await defiLlama.getProtocolTVL(protocol);
                                return { name: protocol, data };
                            } catch (error) {
                                logOperation(
                                    "error",
                                    `Error fetching protocol TVL for ${protocol}`,
                                    {
                                        provider: "defillama",
                                        operation: "data_fetch",
                                        cacheKey: protocolsCacheKey,
                                        error:
                                            error instanceof Error ? error.message : String(error),
                                    }
                                );
                                return null;
                            }
                        });

                        const protocolResults = await Promise.all(protocolPromises);
                        const validProtocolResponses = protocolResults.filter(
                            (r): r is { name: string; data: TVLSummary } => r !== null
                        );

                        return validProtocolResponses
                            .map((protocol) =>
                                defiLlama.formatTVLToText(protocol.data, protocol.name)
                            )
                            .join("\n\n");
                    },
                    { provider: "defillama", operation: "get-protocols-tvl" }
                );

                if (chainData && protocolsData) {
                    return `${chainData}\n\n${protocolsData}`;
                }

                return null;
            } catch (error) {
                logOperation("error", "Error in DeFiLlama provider", {
                    provider: "defillama",
                    operation: "data_fetch",
                    cacheKey: chainCacheKey,
                    error: error instanceof Error ? error.message : String(error),
                });
                return null;
            }
        },
    };
}
