# @elizaos/plugin-conflux

A plugin for interacting with the Conflux blockchain network within the ElizaOS ecosystem.

## Description

The Conflux plugin enables seamless interaction with both Conflux Core Space and eSpace networks. It provides functionality for token transfers, cross-space bridge operations, token swaps on eSpace, market analysis, and comprehensive network statistics.

## Installation

```bash
pnpm install @elizaos/plugin-conflux
```

## Configuration

The plugin requires at least one of these authentication methods:

```env
# Required
CONFLUX_TARGET=mainnet|testnet              # Network target for all operations

# Authentication (Option 1: Mnemonic for both networks)
CONFLUX_MNEMONIC=<mnemonic>                 # Mnemonic phrase for key derivation

# Authentication (Option 2: Individual Private Keys)
CONFLUX_CORE_PRIVATE_KEY=<private-key>      # Private key for Core network
CONFLUX_ESPACE_PRIVATE_KEY=<private-key>    # Private key for eSpace network

# Optional - Custom RPC URLs (defaults to chain RPCs)
CONFLUX_CORE_RPC_URL=<rpc-url>             # Custom RPC for Core network
CONFLUX_ESPACE_RPC_URL=<rpc-url>           # Custom RPC for eSpace network

# Optional - ConfluxScan API Keys
CONFLUX_CORE_CONFLUXSCAN_APIKEY=<api-key>   # API key for ConfluxScan Core
CONFLUX_ESPACE_CONFLUXSCAN_APIKEY=<api-key> # API key for ConfluxScan eSpace
```

## Usage

### Basic Integration

```typescript
import createConfluxPlugin from "@elizaos/plugin-conflux";

// Initialize the plugin with a secret resolver
const confluxPlugin = await createConfluxPlugin((secret) => getSecret(character, secret));

// The plugin can be added to your runtime configuration
const runtime = new AgentRuntime({
    // ... other runtime options ...
    plugins: [
        confluxPlugin,
        // ... other plugins ...
    ]
});
```

### Example Usage

```typescript
// Core Space Transfer
"Send 5 CFX to cfx:aaejuaaaaaaaaaaaaaaaaaaaaaaaaaaaa2eaeg85p5"
"Transfer 10 FC to cfx:aaejuaaaaaaaaaaaaaaaaaaaaaaaaaaaa2eaeg85p5"

// eSpace Transfer
"Send 2.5 CFX to 0x119DA8bbe74B1C5c987D0c64D10eC1dB301d4752"
"Transfer 100 USDT to 0x119DA8bbe74B1C5c987D0c64D10eC1dB301d4752"

// Cross-Space Bridge
"Bridge 10 CFX to 0x119DA8bbe74B1C5c987D0c64D10eC1dB301d4752"

// eSpace Token Swap
"Swap 1 CFX for USDT"
"Exchange 50 USDT for ETH"

// ConfiPump Operations
"Create a new token called GLITCHIZA with symbol GLITCHIZA and generate a description about it on eSpace"
"Buy 0.00069 CFX worth of GLITCHIZA(0x1234567890abcdef) on eSpace"
"Sell 0.00069 CFX worth of GLITCHIZA(0x1234567890abcdef) on eSpace"

// Address Lookup
"Look up address cfx:aaejuaaaaaaaaaaaaaaaaaaaaaaaaaaaa2eaeg85p5"
"Check balance of 0x119DA8bbe74B1C5c987D0c64D10eC1dB301d4752"

// Data & Analytics Queries
"What's the current price of CFX?"
"Show me the trading volume for USDT token"
"Get the list of the top miners"
"What's the pool with the most liquidity?"
"What's the total supply of CFX?"
```

### Available Providers

The plugin includes several data providers that can be queried using natural language:

1. **Common Providers**
   - Token information and management
   - GeckoTerminal price feeds and market data
   - DeFiLlama TVL and protocol analytics
   - Market analysis and trends

2. **Core Network Providers**
   - Wallet operations
   - Account statistics and growth
   - Transaction data and TPS
   - Top miners and gas users
   - CFX transfers and holders
   - Contract interactions

3. **eSpace Network Providers**
   - Wallet operations
   - Account statistics
   - Transaction data
   - Token analytics
   - Top senders and receivers
   - Gas usage statistics

## API Reference

### Actions

#### SEND_CFX
Transfers CFX tokens on either Core or eSpace network.

**Aliases:** SEND, TRANSFER, SEND_CFX

**Parameters:**
```typescript
{
    toAddress: string,     // Core (cfx:) or eSpace (0x) address
    amount: string         // Amount to transfer
}
```

#### SEND_TOKEN
Transfers tokens on either Core or eSpace network.

**Aliases:** SEND_TOKEN, TRANSFER_TOKEN

**Parameters:**
```typescript
{
    tokenSymbol: string,   // Token symbol (e.g., "FC", "USDT")
    toAddress: string,     // Core (cfx:) or eSpace (0x) address
    amount: string         // Amount to transfer
}
```

#### BRIDGE_CFX
Bridges CFX from Core to eSpace network.

**Aliases:** BRIDGE, BRIDGE_CFX, CROSS_SPACE

**Parameters:**
```typescript
{
    toAddress: string,     // eSpace destination address (0x)
    amount: string         // Amount to bridge
}
```

#### SWAP_ESPACE
Swaps tokens on eSpace network using Swappi.

**Aliases:** SWAP, EXCHANGE, TRADE

**Parameters:**
```typescript
{
    fromToken: string,     // Source token symbol
    toToken: string,       // Destination token symbol
    amount: string         // Amount to swap
}
```

## Common Issues & Troubleshooting

1. **Plugin Activation**
   - Ensure CONFLUX_TARGET is set to 'mainnet' or 'testnet'
   - At least one authentication method must be configured

2. **Network Features**
   - Core features require Core wallet configuration
   - eSpace features require eSpace wallet configuration
   - Bridge operations require Core wallet configuration
   - Swaps only available on eSpace network

3. **Transaction Failures**
   - Verify sufficient balance for transactions and gas
   - Check correct address format (cfx: for Core, 0x for eSpace)
   - Ensure RPC endpoint connectivity

## Security Best Practices

1. **Private Key Management**
   - Store private keys/mnemonic securely using environment variables
   - Never expose private keys in code or logs
   - Use separate accounts for development and production

2. **Network Configuration**
   - Use API keys for better rate limits
   - Consider using custom RPC endpoints for production
   - Keep consistent network targets across components

## License

This plugin is part of the Eliza project. See the main project repository for license information.

## Development Guide

### Setting Up Development Environment

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Build the plugin:
```bash
pnpm run build
```

4. Run tests:
```bash
pnpm run test
```

### Development Notes

1. **Network Selection**
   - Use testnet for development
   - Test both Core and eSpace features independently
   - Validate cross-space operations last

2. **Testing**
   - Unit tests for utility functions
   - Integration tests for network operations
   - End-to-end tests for complex flows

## Future Enhancements

1. **Token Management**
   - Token list customization
   - Token metadata enrichment
   - Token allowance management
   - Batch token transfers

2. **Bridge Operations**
   - Bridge transaction status tracking
   - Bridge fee estimation
   - Cross-space batch operations
   - Bridge history and analytics

3. **Swap Improvements**
   - Multiple DEX support
   - Price impact calculations
   - Slippage customization
   - Route optimization

4. **Network Statistics**
   - Enhanced metrics collection
   - Historical data analysis
   - Network health monitoring
   - Performance analytics

5. **Developer Experience**
   - CLI tools for common operations
   - Better error messages
   - Debugging utilities
   - Documentation improvements

6. **Security & Performance**
   - Transaction simulation
   - Gas optimization
   - Rate limiting improvements
   - Cache optimization

## Credits

This plugin integrates with and builds upon several key technologies:

- [Conflux Network](https://confluxnetwork.org/): Hybrid consensus blockchain
- [cive](https://github.com/Conflux-Chain/cive): Core Space TypeScript SDK
- [viem](https://viem.sh/): eSpace TypeScript SDK
- [Swappi](https://swappi.io/): eSpace DEX
- [ConfluxScan](https://confluxscan.io/): ConfluxScan API

Special thanks to:
- The Conflux Foundation for developing the network
- The Conflux Developer community
- The Swappi team for DEX infrastructure
- The cive and viem maintainers
- The Eliza community for their contributions and feedback

For more information about Conflux capabilities:
- [Conflux Documentation](https://developer.confluxnetwork.org/)
- [Conflux Portal](https://portal.confluxnetwork.org/)
- [ConfluxScan](https://confluxscan.io/)
- [Cross-Space Bridge](https://bridge.confluxnetwork.org/)
