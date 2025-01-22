export const cfxTransferTemplate = `Strictly parse the following from recent messages <recent_messages>{{recentMessages}}</recent_messages>:

Required fields:
1. type: MUST be EXACTLY "send_cfx"
2. toAddress: MUST be a valid address:
   - For Core network: must start with "cfx:" or "cfxtest:"
   - For eSpace network: must start with "0x"
3. amount: MUST be a valid number string
4. network: MUST be determined by toAddress format:
   - If toAddress starts with "cfx:" or "cfxtest:" -> set network to "core"
   - If toAddress starts with "0x" -> set network to "espace"
   DO NOT reuse previous addresses or networks.

Validation rules:
- Message must be about sending/transferring CFX specifically
- If any other token is mentioned, return null (handled by token transfer)
- If message contains "bridge" or "cross", return null (handled by bridge)
- Do not attempt to fix or interpret invalid values
- Return null or throw error if values don't match exactly
- NEVER reuse addresses from previous messages
- ALWAYS determine network based on current toAddress format

Example valid: send 10.5 CFX to cfx:... -> network: "core"
Example valid: transfer 5 to 0x... -> network: "espace" (assumes CFX when no token specified)
Example invalid: send 10 USDT to cfx:... (other token)
Example invalid: bridge 5 CFX to 0x... (bridge operation)`;
