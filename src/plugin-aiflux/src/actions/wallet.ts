import { Action, IAgentRuntime, Memory, elizaLogger, HandlerCallback, State } from "@elizaos/core";
import { ValidatedConfig } from "../utils";
import { getConfluxScanUrl } from "../utils/config/tokenList";

export function getWalletAction(config: ValidatedConfig): Action | null {
    if (!config.coreWallet && !config.espaceWallet) {
        return null;
    }

    return {
        name: "CHECK_WALLET",
        description: "Check wallet balances for both Core and eSpace networks",
        suppressInitialMessage: true,
        validate: async (runtime: IAgentRuntime, _message: Memory) => {
            elizaLogger.debug("Validating wallet action configuration");
            return !!(config.coreWallet || config.espaceWallet);
        },
        examples: [
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "show my wallet",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "💼 Let's unlock the treasures in your wallet! Just a moment while I fetch your balance from the mystical realms of Conflux...✨",
                        action: "CHECK_WALLET",
                        suppressResponse: true
                    },
                },
            ],
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "check wallet balance",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "🎭 Time to count your crypto coins! Diving into the Conflux ledger of legends...",
                        action: "CHECK_WALLET",
                        suppressResponse: true
                    },
                },
            ]
        ],
        similes: [
            "wallet",
            "balance",
            "check wallet",
            "update wallet",
            "show wallet",
            "my wallet",
            "the wallet"
        ],
        handler: async (
            runtime: IAgentRuntime,
            memory: Memory,
            state: State,
            _options: any,
            callback: HandlerCallback
        ): Promise<boolean> => {
            elizaLogger.debug("Wallet action handler called:", {
                userId: memory.userId,
                messageText: memory.content?.text
            });

            try {
                const sections = [];

                // Check Core wallet
                if (config.coreWallet) {
                    const address = config.coreWallet.getAddress();
                    const balance = await config.coreWallet.getBalance();
                    const tokens = config.coreConfluxScan ? await config.coreConfluxScan.getAccountTokens(address) : null;

                    elizaLogger.debug("Core wallet balance:", {
                        address,
                        balance: balance.toString()
                    });

                    let tokenList = "";
                    if (tokens && tokens.length > 0) {
                        const filteredTokens = tokens.filter(token => token.symbol !== 'CFX');
                        if (filteredTokens.length > 0) {
                            const maxLength = Math.max(...filteredTokens.map(token => token.symbol.length));
                            tokenList = "\n━━(Tokens)━━\n" + filteredTokens.map(token =>
                                `• ${token.symbol.padEnd(maxLength)} : ${config.coreWallet!.formatTokenAmount(token.amount, token.decimals)}`
                            ).join("\n");
                        }
                    }

                    sections.push(`━━━ 🌐 Conflux Core Network ━━━━
[${address}](${getConfluxScanUrl(address, config.target)})
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Balance: ${balance} CFX${tokenList}`);
                }

                // Check eSpace wallet
                if (config.espaceWallet) {
                    const address = config.espaceWallet.getAddress();
                    const balance = await config.espaceWallet.getBalance();
                    const tokens = config.espaceConfluxScan ? await config.espaceConfluxScan.getAccountTokens(address) : null;

                    elizaLogger.debug("eSpace wallet balance:", {
                        address,
                        balance: balance.toString()
                    });

                    let tokenList = "";
                    if (tokens && tokens.length > 0) {
                        const filteredTokens = tokens.filter(token => token.symbol !== 'CFX');
                        if (filteredTokens.length > 0) {
                            const maxLength = Math.max(...filteredTokens.map(token => token.symbol.length));
                            tokenList = "\n━━(Tokens)━━\n" + filteredTokens.map(token =>
                                `• ${token.symbol.padEnd(maxLength)} : ${config.espaceWallet!.formatTokenAmount(token.amount, token.decimals)}`
                            ).join("\n");
                        }
                    }

                    sections.push(`━━━━ 🌟 Conflux eSpace Network ━━━━
[${address}](${getConfluxScanUrl(address, config.target)})
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Balance: ${balance} CFX${tokenList}`);
                }

                if (sections.length === 0) {
                    callback({
                        text: "❌ No wallet information available. Please check your wallet configuration.",
                        action: "CHECK_WALLET",
                        blockResponse: true
                    }, []);
                    return false;
                }

                const response = `━━ 💼 Wallet Dashboard\n\n${sections.join('\n\n')}`;

                callback({
                    text: response,
                    action: "CHECK_WALLET",
                    blockResponse: true
                }, []);
                return true;
            } catch (error) {
                elizaLogger.error("Error in wallet action handler:", error);
                callback({
                    text: "❌ Sorry, I encountered an error while fetching your wallet information. Please try again.",
                    action: "CHECK_WALLET",
                    blockResponse: true
                }, []);
                return false;
            }
        }
    };
}