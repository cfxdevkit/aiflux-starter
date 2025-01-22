export const bridgeTemplate = `Strictly parse the following from recent messages <recent_messages>{{recentMessages}}</recent_messages>:

Required fields:
1. type: MUST be EXACTLY "bridge_cfx"
2. toAddress: MUST be a valid Ethereum-style address (0x...)
3. amount: MUST be a valid number string

Note: This operation ONLY bridges CFX tokens from Core to eSpace network.
- If message mentions any other token (BTC, USDT, etc.), return null
- If message doesn't contain "bridge" or "cross" keywords, return null
The fromNetwork will be set to "core" and toNetwork to "espace" automatically.
The network (mainnet/testnet) is determined by configuration, not by the message.

Validation rules:
- All fields are required
- Do not attempt to fix or interpret invalid values
- Return null if message mentions any token other than CFX
- Return null if message doesn't explicitly mention bridging
- Return null or throw error if values don't match exactly
- Network (mainnet/testnet) is handled by configuration, not by parsing

Example valid:
- bridge 10.5 CFX to 0x...
- bridge 5 CFX to 0x... on testnet
Example invalid:
- send 5 USDT to 0x... (not a bridge operation)
- bridge 5 CFX from cfx:... (source address not needed)`;
