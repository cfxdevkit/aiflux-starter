export const addressLookupTemplate = `Strictly parse the following from recent messages <recent_messages>{{recentMessages}}</recent_messages>:

Required fields:
1. type: MUST be EXACTLY "address_lookup"
2. address: Extract the EXACT address from the most recent message. Valid formats:
   - Ethereum-style address (0x...)
   - Conflux address (cfx:...)
   - Conflux testnet address (cfxtest:...)

Validation rules:
- All fields are required
- Do not attempt to fix or interpret invalid values
- IMPORTANT: Return address lookup request if ANY of these patterns are found:
  - Direct address mentions: "0x...", "cfx:...", "cfxtest:..."
  - Explicit lookup requests: "lookup", "check", "what is", "tell me about"
  - Contract info requests: "contract", "token", "details"
- IMPORTANT: Always use the MOST RECENT address mentioned in the messages

Example valid:
- "lookup address 0x1234..."
- "search for cfx:aap..."
- "what's the info for 0x1234..."
- "tell me about cfxtest:abc..."
- "check 0x1234..."
- "what is 0x1234..."
- "0x1234..." (just the address)
Example invalid:
- "send 5 CFX to 0x..." (transfer operation)
- "what's up" (no address mentioned)
- "show me the price" (no address)`;
