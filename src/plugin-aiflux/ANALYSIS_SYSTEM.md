# Conflux Analysis System

This document outlines the analysis system architecture and implementation details for the Conflux Plugin.

## System Overview

```mermaid
graph TB
    subgraph Data Collection
        DC[Data Collectors] --> |Raw Data| CM[Cache Manager]

        subgraph Sources
            TLM[Token List Manager]
            DL[DeFiLlama]
            GT[GeckoTerminal]
        end

        Sources --> DC
    end

    subgraph Market Analysis
        CM --> MAP[Market Analysis Provider]

        MAP --> TVL[TVL Analysis]
        MAP --> TOP[Top Performers]
        MAP --> VOL[Volume Analysis]
        MAP --> PRES[Pressure Analysis]

        subgraph Analysis Types
            TOP --> GAIN[Top Gainers]
            TOP --> LOSE[Top Losers]
            VOL --> TVOL[Trading Volume]
            VOL --> TRAD[Trade Count]
            PRES --> BUY[Buy Pressure]
            PRES --> SELL[Sell Pressure]
            AGE[Pool Age Analysis]
        end
    end

    subgraph Cache System
        CM --> |Cached Results| CACHE[Cache Store]
        CACHE --> |TTL: 5min| MAP
    end
```

## Component Architecture

### 1. Market Analysis Provider

```typescript
interface MarketAnalysisConfig {
    tokenListManager?: TokenListManager;
    cacheDuration?: number;
    chain?: string;
}

type AnalysisType =
    | 'gainers'    // Top price gainers
    | 'losers'     // Top price losers
    | 'volume'     // Highest trading volume
    | 'trades'     // Most trades
    | 'age'        // Pool age analysis
    | 'buyPressure'  // Highest buy pressure
    | 'sellPressure' // Highest sell pressure
    | 'full'        // Complete analysis
    | 'tvl'         // Total Value Locked analysis
```

## Implementation Details

### 1. Market Analysis Provider

```typescript
class MarketAnalysisProvider {
    private tokenListManager: TokenListManager;
    private cacheDuration: number = 300; // 5 minutes default
    private chain: string = 'conflux';

    async getAnalysisData(request: {
        type: AnalysisType;
        limit?: number
    }): Promise<string> {
        const limit = request.limit || 5;

        switch (request.type) {
            case 'tvl':
                return getTVLAnalysis(chain);
            case 'full':
                return getCombinedAnalysis();
            case 'gainers':
                return getTopGainers(limit);
            case 'losers':
                return getTopLosers(limit);
            case 'volume':
                return getTopVolume(limit);
            case 'trades':
                return getTopTrades(limit);
            case 'age':
                return getPoolsByAge(limit);
            case 'buyPressure':
                return getMostBuyPressure(limit);
            case 'sellPressure':
                return getMostSellPressure(limit);
        }
    }
}
```

### 2. Cache Management

```typescript
interface CacheConfig {
    key: string;           // Cache key format: market:analysis:{type}:{limit}
    duration: number;      // Default: 300 seconds (5 minutes)
    analysisType: string;
    limit: number;
}

class CacheManager {
    async get(key: string): Promise<string | null>;
    async set(key: string, data: string, options: { expires: number }): Promise<void>;
}
```

### 3. TVL Analysis

```typescript
interface TVLAnalysis {
    chain: string;
    current: number;
    change24h: number;
    change7d: number;
    protocols: {
        name: string;
        tvl: number;
        change24h: number;
    }[];
}

class DeFiLlama {
    async getChainTVL(chain: string): Promise<TVLData>;
    formatTVLToText(data: TVLData, chain: string): string;
}
```

## Data Flow

```mermaid
sequenceDiagram
    participant Client
    participant MAP as Market Analysis Provider
    participant TLM as Token List Manager
    participant DL as DeFiLlama
    participant Cache

    Client->>MAP: Request Analysis
    MAP->>Cache: Check Cache

    alt Cache Hit
        Cache-->>MAP: Return Cached Data
        MAP-->>Client: Return Analysis
    else Cache Miss
        MAP->>TLM: Get Market Data
        MAP->>DL: Get TVL Data
        TLM-->>MAP: Market Analysis
        DL-->>MAP: TVL Analysis
        MAP->>MAP: Process Data
        MAP->>Cache: Store Results
        MAP-->>Client: Return Analysis
    end
```

## Best Practices

1. **Cache Management**
   - Use 5-minute cache duration for market data
   - Implement cache invalidation on significant changes
   - Use hierarchical cache keys for different analysis types

2. **Analysis Types**
   - Provide focused analysis for specific metrics
   - Support combined analysis for comprehensive view
   - Include relevant instructions with analysis results

3. **Error Handling**
   - Graceful degradation when services are unavailable
   - Detailed error logging
   - Fallback to cached data when possible

4. **Performance**
   - Parallel data fetching where possible
   - Efficient cache utilization
   - Optimized data processing

## Future Improvements

1. **Enhanced Analytics**
   - Historical trend analysis
   - Price correlation analysis
   - Liquidity depth analysis
   - Volume profile analysis

2. **Additional Data Sources**
   - Cross-DEX analysis
   - Order book analysis
   - Social sentiment integration
   - On-chain metrics integration

3. **Analysis Features**
   - Custom timeframe analysis
   - Comparative analysis
   - Risk metrics
   - Market impact analysis

4. **Caching Improvements**
   - Progressive cache updates
   - Smart cache invalidation
   - Multi-level caching
   - Cache warming strategies