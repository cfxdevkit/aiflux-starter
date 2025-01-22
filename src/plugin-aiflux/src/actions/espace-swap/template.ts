export const espaceSwapTemplate = `IMPORTANT: Parse ONLY the MOST RECENT message from <recent_messages>{{recentMessages}}</recent_messages>
Ignore all previous messages and transactions.

Required fields:
1. type: MUST be EXACTLY "swap_espace"
2. fromToken: The token being swapped FROM
   - Must be the FIRST token mentioned in the MOST RECENT message
   - preserve exactly as written
3. toToken: The token being swapped TO
   - Must be the SECOND token mentioned in the MOST RECENT message
   - preserve exactly as written
4. amount: MUST be a valid positive number string
   - Must be the number associated with fromToken in the MOST RECENT message

Validation rules:
- ONLY parse the LAST/MOST RECENT message
- IGNORE all previous messages and context
- Token order is critical: first token = fromToken, second token = toToken
- Return null if the MOST RECENT message doesn't match requirements

Examples of SINGLE messages:
"swap 0.01 CFX to PPI" =>
  type: "swap_espace"
  fromToken: "CFX"
  toToken: "PPI"
  amount: "0.01"

"exchange 5.5 USDT for ETH" =>
  type: "swap_espace"
  fromToken: "USDT"
  toToken: "ETH"
  amount: "5.5"`;
