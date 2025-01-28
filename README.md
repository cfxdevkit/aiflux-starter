# AIFlux Starter Kit

A powerful starter kit for building AI-powered blockchain applications on the Conflux network. This project serves as a foundation that you can customize and expand according to your needs.

## Overview

AIFlux Starter Kit is designed to help developers quickly bootstrap AI-enhanced blockchain applications. It provides a robust foundation with:

- Dual-network support (Conflux Core & eSpace)
- Built-in market analysis system
- Token management capabilities
- Extensible architecture for custom features

## 🚀 Quick Start

### Prerequisites

- Node.js v22 or higher
- pnpm package manager
- Docker (optional, for containerized deployment)

### Basic Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd aiflux-starter
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Configure your environment variables:

```env
# Required Configuration
DISCORD_APPLICATION_ID="your-discord-app-id"
DISCORD_API_TOKEN="your-discord-token"
OPENROUTER_API_KEY="your-openrouter-key"
TWITTER_USERNAME="your-twitter-username"
TWITTER_PASSWORD="your-twitter-password"
TWITTER_EMAIL="your-twitter-email"

# Conflux Network Configuration
CONFLUX_TARGET=mainnet|testnet
CONFLUX_MNEMONIC=your-mnemonic                # Option 1: Use mnemonic
# OR
CONFLUX_CORE_PRIVATE_KEY=your-private-key     # Option 2a: Core network key
CONFLUX_ESPACE_PRIVATE_KEY=your-private-key   # Option 2b: eSpace network key
```

4. Install dependencies and start:

```bash
pnpm install
pnpm build
pnpm start
```

## 🔧 Core Features

### 1. Dual Network Support

- Seamless interaction with both Conflux Core and eSpace networks
- Automatic wallet management for both networks
- Cross-space bridge operations

### 2. Market Analysis System

- Real-time market data analysis
- TVL (Total Value Locked) tracking
- Price and volume analytics
- Trading pressure analysis
- Pool age and performance metrics

### 3. Token Management

- Token list management
- Token transfers
- Token swaps on eSpace
- Market analysis integration

### 4. Extensible Architecture

The starter kit is designed to be extended. Key extension points include:

- Custom character development
- New network integrations
- Additional analysis metrics
- Custom actions and evaluators

## 📚 Documentation

Detailed documentation is available in the following locations:

- [Technical Documentation](src/plugin-aiflux/TECHNICAL.md)
- [Analysis System](src/plugin-aiflux/ANALYSIS_SYSTEM.md)

## 🛠 Customization Guide

### Adding Custom Characters

1. Create a character file:

```typescript
// src/character.ts
export const character = {
    name: "Your Character",
    description: "Character description",
    clients: [Clients.TWITTER, Clients.DISCORD],
    // Add more configuration
};
```

2. Or use JSON configuration:

```bash
pnpm start --characters="path/to/your/character.json"
```

### Implementing Custom Features

1. Create new providers in `src/plugin-aiflux/src/providers/`
2. Add custom actions in `src/plugin-aiflux/src/actions/`
3. Extend evaluators in `src/plugin-aiflux/src/evaluators/`

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Resources

- [Conflux Network Documentation](https://developer.confluxnetwork.org/)
- [ElizaOS Documentation](https://docs.eliza.os/)
