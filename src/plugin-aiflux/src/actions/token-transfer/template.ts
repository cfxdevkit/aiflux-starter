export const tokenTransferTemplate = `Strictly parse the following from recent messages <recent_messages>{{recentMessages}}</recent_messages>:

Required fields:
1. type: MUST be EXACTLY "send_token" (not "bridge_cfx" or "send_cfx")
2. toAddress: MUST be a valid address in one of these formats:
   - For Core network: MUST start with "cfx:" or "cfxtest:" followed by base32 string
   - For eSpace network: MUST start with "0x" followed by 40 hex characters
3. amount: MUST be a valid positive number string (e.g., "10", "5.5")
4. token: MUST be EXACTLY the token symbol or contract address as written in the message
   - Preserve case and characters exactly (e.g., "pi", "PPI", "USDT")
   - Do not transform symbols (e.g., "pi" must stay "pi", not "π")
   - For contract addresses, format as "tokens@0x..."
5. network: MUST be determined by toAddress format:
   - If toAddress starts with "cfx:" or "cfxtest:" -> set network to "core"
   - If toAddress starts with "0x" -> set network to "espace"
   DO NOT reuse previous addresses or networks.

Validation rules:
- Message MUST explicitly mention a token (e.g., "send 10 PPI", not just "send 10")
- If no token is mentioned, return null (might be a CFX transfer instead)
- If message mentions "bridge" or "cross", return null (might be a bridge operation)
- Do not transform or interpret any values
- Do not convert numbers to other formats
- Do not convert token symbols to other characters
- NEVER reuse addresses from previous messages
- ALWAYS determine network based on current toAddress format
- Return null if message doesn't match these exact requirements

Examples of valid messages and their parsed values:
1. "send 10 pi to 0x149F3fE7A7dFe1A465557f1d26065f3974162EcB"
   type: "send_token"
   amount: "10"
   token: "pi"
   toAddress: "0x149F3fE7A7dFe1A465557f1d26065f3974162EcB"
   network: "espace"  // determined by 0x address format

2. "send 5.5 USDT to cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957"
   type: "send_token"
   amount: "5.5"
   token: "USDT"
   toAddress: "cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957"
   network: "core"  // determined by cfx: address format

Examples of invalid messages (should return null):
- "bridge 1 BTC to 0x..." (contains "bridge" keyword)
- "send 10 to 0x..." (no token specified)
- "send 10 CFX to 0x..." (CFX is handled by different action)
- "cross 5 USDT to 0x..." (contains "cross" keyword)
- "send 5 USDT" (no destination address specified)`;
