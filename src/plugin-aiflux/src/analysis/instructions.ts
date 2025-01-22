export const POOL_ANALYSIS_INSTRUCTIONS = `
When analyzing DEX pool data, follow these guidelines:

1. Price Changes (getTopGainers/getTopLosers):
   - Positive percentages indicate price increases
   - Negative percentages indicate price decreases
   - Compare current price with price change to understand momentum

2. Pool Age (getPoolsByAge):
   - Newer pools may indicate emerging projects or tokens
   - Older pools with high reserves typically indicate established pairs
   - Check reserve size to gauge liquidity depth

3. Volume Analysis (getTopVolume):
   - Higher volume indicates more trading activity
   - Compare volume to reserve size for liquidity utilization
   - Sudden volume spikes may indicate significant events

4. Trade Analysis (getTopTrades):
   - Total trades show overall market interest
   - Buy/Sell ratio indicates market sentiment
   - High trade count with low volume suggests small trades

5. Buy/Sell Pressure (getMostBuyPressure/getMostSellPressure):
   - >60% buys suggests strong buying pressure
   - >60% sells suggests strong selling pressure
   - Consider total trade count for significance

6. Market Analysis (getMarketAnalysis):
   - Combines multiple metrics for overall market view
   - Use to identify trending pairs and market sentiment
   - Compare metrics to identify potential opportunities

Key Indicators:
- High volume + high buy pressure = potential uptrend
- High volume + high sell pressure = potential downtrend
- New pool + high volume = emerging interest
- High trades + low volume = retail activity
- Low trades + high volume = whale activity

Response Formatting:
1. Start with the most relevant metric for the query
2. Provide context for the numbers
3. Include related metrics when relevant
4. Highlight any unusual patterns
5. Use bullet points for multiple insights
`;