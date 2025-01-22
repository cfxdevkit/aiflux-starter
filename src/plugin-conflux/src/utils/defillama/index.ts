import { elizaLogger } from "@elizaos/core";

interface TVLDataPoint {
    date: string;
    tvl: number;
}

interface TVLSummary {
    currentTVL: number;
    monthlyChange: number;
    maxTVL: number;
    minTVL: number;
    avgTVL: number;
    last12Months: TVLDataPoint[];
}

export class DeFiLlama {
    private readonly BASE_URL = "https://api.llama.fi";

    private async fetchData<T>(path: string): Promise<T> {
        elizaLogger.debug(`Fetching DeFiLlama data from: ${path}`);
        const response = await fetch(`${this.BASE_URL}${path}`);
        if (!response.ok) {
            elizaLogger.error(`DeFiLlama API request failed with status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    public async getChainTVL(chain: string): Promise<TVLSummary> {
        try {
            const historicalData = await this.fetchData<any>(`/v2/historicalChainTvl/${chain}`);

            if (!historicalData || !Array.isArray(historicalData)) {
                elizaLogger.error("Invalid response format:", { historicalData });
                throw new Error(`Invalid response from DeFiLlama API for chain ${chain}`);
            }

            // Get last 12 months of data
            const yearAgo = new Date();
            yearAgo.setMonth(yearAgo.getMonth() - 12);

            const last12Months = historicalData
                .filter(d => {
                    const date = new Date(d.date * 1000);
                    return date >= yearAgo;
                })
                .map(d => ({
                    date: new Date(d.date * 1000).toISOString().split('T')[0],
                    tvl: Number(d.tvl || 0)
                }))
                .filter(d => !isNaN(d.tvl));

            if (last12Months.length === 0) {
                elizaLogger.error("No valid TVL data found");
                throw new Error(`No valid TVL data found for chain ${chain}`);
            }

            // Calculate key metrics
            const currentTVL = last12Months[last12Months.length - 1].tvl;
            const monthAgoIndex = last12Months.length - 31;
            const monthAgoTVL = monthAgoIndex >= 0 ? last12Months[monthAgoIndex].tvl : last12Months[0].tvl;
            const monthlyChange = ((currentTVL - monthAgoTVL) / monthAgoTVL) * 100;

            const tvlValues = last12Months.map(d => d.tvl);
            const maxTVL = Math.max(...tvlValues);
            const minTVL = Math.min(...tvlValues);
            const avgTVL = tvlValues.reduce((sum, val) => sum + val, 0) / tvlValues.length;

            elizaLogger.debug(`Chain TVL Summary for ${chain}:`, {
                currentTVL: `$${currentTVL.toLocaleString()}`,
                monthlyChange: `${monthlyChange.toFixed(2)}%`,
                dataPoints: last12Months.length
            });

            return {
                currentTVL,
                monthlyChange,
                maxTVL,
                minTVL,
                avgTVL,
                last12Months
            };
        } catch (error) {
            elizaLogger.error("Error fetching chain TVL:", {
                chain,
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }

    public async getProtocolTVL(protocol: string): Promise<TVLSummary> {
        try {
            const protocolData = await this.fetchData<any>(`/protocol/${protocol}`);

            if (!protocolData || !protocolData.tvl || !Array.isArray(protocolData.tvl)) {
                elizaLogger.error("Invalid protocol response format:", { protocolData });
                throw new Error(`Invalid response from DeFiLlama API for protocol ${protocol}`);
            }

            // Get last 12 months of data
            const yearAgo = new Date();
            yearAgo.setMonth(yearAgo.getMonth() - 12);

            const last12Months = protocolData.tvl
                .filter((d: any) => {
                    const date = new Date(d.date * 1000);
                    return date >= yearAgo;
                })
                .map((d: any) => ({
                    date: new Date(d.date * 1000).toISOString().split('T')[0],
                    tvl: Number(d.totalLiquidityUSD || 0)
                }))
                .filter(d => !isNaN(d.tvl));

            if (last12Months.length === 0) {
                elizaLogger.error("No valid protocol TVL data found");
                throw new Error(`No valid TVL data found for protocol ${protocol}`);
            }

            const currentTVL = last12Months[last12Months.length - 1].tvl;
            const monthAgoIndex = last12Months.length - 31;
            const monthAgoTVL = monthAgoIndex >= 0 ? last12Months[monthAgoIndex].tvl : last12Months[0].tvl;
            const monthlyChange = ((currentTVL - monthAgoTVL) / monthAgoTVL) * 100;

            const tvlValues = last12Months.map(d => d.tvl);
            const maxTVL = Math.max(...tvlValues);
            const minTVL = Math.min(...tvlValues);
            const avgTVL = tvlValues.reduce((sum, val) => sum + val, 0) / tvlValues.length;

            elizaLogger.debug(`Protocol TVL Summary for ${protocol}:`, {
                currentTVL: `$${currentTVL.toLocaleString()}`,
                monthlyChange: `${monthlyChange.toFixed(2)}%`,
                dataPoints: last12Months.length
            });

            return {
                currentTVL,
                monthlyChange,
                maxTVL,
                minTVL,
                avgTVL,
                last12Months
            };
        } catch (error) {
            elizaLogger.error("Error fetching protocol TVL:", {
                protocol,
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }

    public formatTVLToText(tvlData: TVLSummary, name: string): string {
        return `TVL Analysis for ${name.toUpperCase()}:\n\n` +
               `Current TVL: $${tvlData.currentTVL.toLocaleString()}\n` +
               `30-Day Change: ${tvlData.monthlyChange.toFixed(2)}%\n\n` +
               `12-Month Statistics:\n` +
               `- Highest TVL: $${tvlData.maxTVL.toLocaleString()}\n` +
               `- Lowest TVL: $${tvlData.minTVL.toLocaleString()}\n` +
               `- Average TVL: $${tvlData.avgTVL.toLocaleString()}\n`;
    }
}

export type { TVLDataPoint, TVLSummary };
