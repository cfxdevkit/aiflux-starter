import {
    Action,
    composeContext,
    generateObject,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { z } from "zod";

/**
 * Configuration interface for the action
 * Extend this interface based on your specific needs
 */
interface ActionConfig {
    // Example: Required services or configurations
    requiredService?: any;
    // Example: Optional configurations
    options?: {
        timeout?: number;
        retries?: number;
    };
}

/**
 * Example params schema using Zod
 * Replace with your actual schema
 */
const ActionParamsSchema = z.object({
    type: z.enum(["type1", "type2"], {
        required_error:
            "Type is required and must be exactly 'type1' or 'type2'",
        invalid_type_error: "Type must be a string, exactly 'type1' or 'type2'",
    }),
    amount: z
        .number({
            required_error: "Amount is required and must be a number",
            invalid_type_error: "Amount must be a valid number",
        })
        .nonnegative("Amount must be non-negative"),
});

/**
 * Example params type derived from Zod schema
 */
type ActionParams = z.infer<typeof ActionParamsSchema>;

/**
 * Example execution function
 * Implement your actual execution logic here
 */
async function executeAction(
    runtime: IAgentRuntime,
    config: ActionConfig,
    params: ActionParams
): Promise<{ status: string; data?: any; error?: string }> {
    elizaLogger.debug("[Template] Starting action execution", { params });

    try {
        // First validate that the type is one of the allowed types
        if (!["type1", "type2"].includes(params.type)) {
            throw new Error(
                "Invalid action type. Must be either 'type1' or 'type2'"
            );
        }

        // Validate amount is non-negative
        if (params.amount < 0) {
            throw new Error("Amount must be a non-negative number");
        }

        switch (params.type) {
            case "type1": {
                return { status: "Success", data: "Type1 result" };
            }
            case "type2": {
                return { status: "Success", data: "Type2 result" };
            }
            default: {
                // This should never be reached due to the enum type, but TypeScript wants it
                throw new Error("Invalid action type");
            }
        }
    } catch (error) {
        elizaLogger.error("[Template] Action execution failed", { error });
        return {
            status: "Failed",
            error: error.message,
        };
    }
}

/**
 * Creates a template action
 *
 * @param config - Configuration object for the action
 * @returns Action object
 *
 * Usage example:
 * const action = createAction({
 *   requiredService: myService,
 *   options: { timeout: 5000 }
 * });
 */
export function createAction(config: ActionConfig): Action {
    return {
        name: "TEMPLATE_ACTION",
        description: "Template for creating actions",
        similes: ["TEMPLATE", "EXECUTE_TEMPLATE", "RUN_TEMPLATE"],
        suppressInitialMessage: true,
        validate: async (runtime: IAgentRuntime, _message: Memory) => {
            elizaLogger.debug("[Template] Validating runtime configuration");
            elizaLogger.debug("[Template]", !!config.requiredService);
            return !!config.requiredService;
        },
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State,
            _options: any,
            callback: HandlerCallback
        ) => {
            elizaLogger.debug("[Template] Starting action handler");

            try {
                if (!state) {
                    elizaLogger.debug(
                        "[Template] No state provided, composing new state"
                    );
                    state = await runtime.composeState(message);
                } else {
                    elizaLogger.debug("[Template] Updating existing state");
                    state = await runtime.updateRecentMessageState(state);
                }

                // Pre-validate input and guide user if needed
                const rawType = message.content.text.match(/type(\w+)/)?.[1];
                const rawAmount =
                    message.content.text.match(/amount\s+(\S+)/)?.[1];

                const validationErrors = [];

                // Validate type
                if (!rawType) {
                    validationErrors.push("type (must be 'type1' or 'type2')");
                } else if (!["1", "2"].includes(rawType)) {
                    callback(
                        {
                            text: `❌ Invalid type "${rawType}". Please specify either "type1" or "type2".

Example: "execute type1 amount 5"`,
                        },
                        []
                    );
                    return false;
                }

                // Validate amount
                if (!rawAmount) {
                    validationErrors.push(
                        "amount (must be a non-negative number)"
                    );
                } else if (isNaN(Number(rawAmount)) || Number(rawAmount) < 0) {
                    callback(
                        {
                            text: `❌ Invalid amount "${rawAmount}". Please provide a non-negative number.

Example: "execute ${rawType ? `type${rawType}` : "type1"} amount 5"`,
                        },
                        []
                    );
                    return false;
                }

                // If any required fields are missing, ask for them
                if (validationErrors.length > 0) {
                    callback(
                        {
                            text: `⚠️ Missing required fields: ${validationErrors.join(", ")}.

Please provide all required fields:
- type: must be exactly "type1" or "type2"
- amount: must be a non-negative number

Example: "execute type1 amount 5"`,
                        },
                        []
                    );
                    return false;
                }

                const context = composeContext({
                    state,
                    template: `Strictly parse the following from recent messages <recent_messages>{{recentMessages}}</recent_messages>:

Required fields:
1. type: MUST be EXACTLY one of: "type1" or "type2" (no interpretation allowed)
2. amount: MUST be a valid non-negative number

Validation rules:
- If type is not EXACTLY "type1" or "type2", throw an error
- If amount is not a valid number or is negative, throw an error
- Do not attempt to fix, interpret, or transform invalid values
- Return null or throw error if values don't match exactly

Example valid: "type1" with amount 5
Example invalid: "type45" (must error, do not try to convert to valid type)`,
                });

                const actionDetails = (await generateObject({
                    runtime,
                    context,
                    modelClass: ModelClass.SMALL,
                    schema: ActionParamsSchema,
                })) as { object: ActionParams };

                elizaLogger.debug(
                    "[Template] Generated action details",
                    actionDetails.object
                );

                // Final validation of parsed values
                if (
                    !actionDetails.object.type ||
                    !["type1", "type2"].includes(actionDetails.object.type)
                ) {
                    throw new Error(
                        "Invalid action type. Must be exactly 'type1' or 'type2'"
                    );
                }

                if (
                    typeof actionDetails.object.amount !== "number" ||
                    actionDetails.object.amount < 0
                ) {
                    throw new Error("Amount must be a non-negative number");
                }

                const result = await executeAction(
                    runtime,
                    config,
                    actionDetails.object
                );

                let responseText =
                    result.status === "Success"
                        ? `✅ Action completed successfully: ${result.data}: ${actionDetails.object.type} ${actionDetails.object.amount}`
                        : `❌ Action failed: ${result.error}`;

                callback({ text: responseText }, []);
                state = await runtime.composeState(message);
                return true;
            } catch (error) {
                elizaLogger.error("[Template] Handler error:", error);
                callback(
                    {
                        text: `❌ Action failed: ${error.message}

Please provide valid values:
- type: must be exactly "type1" or "type2"
- amount: must be a non-negative number

Example: "execute type1 amount 5"`,
                    },
                    []
                );
                return false;
            }
        },
        examples: [
            // Happy path examples
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Execute template type1 with amount 5",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "✅ Action completed successfully: Type1 result: type1 5",
                        action: "TEMPLATE_ACTION",
                    },
                },
            ],
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Run template type2 with amount 10.5",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "✅ Action completed successfully: Type2 result: type2 10.5",
                        action: "TEMPLATE_ACTION",
                    },
                },
            ],

            // Edge cases
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Execute template type1 with amount 0",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "✅ Action completed successfully: Type1 result: type1 0",
                        action: "TEMPLATE_ACTION",
                    },
                },
            ],
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Run template type2 with maximum amount 999999999",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "✅ Action completed successfully: Type2 result: type2 999999999",
                        action: "TEMPLATE_ACTION",
                    },
                },
            ],

            // Error cases
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Execute template with invalid type3",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "❌ Action failed: Invalid action type",
                        action: "TEMPLATE_ACTION",
                    },
                },
            ],
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Run template type1 with invalid amount abc",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "❌ Action failed: Expected number, received string at 'amount'",
                        action: "TEMPLATE_ACTION",
                    },
                },
            ],
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Execute template without specifying type or amount",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "❌ Action failed: Required fields missing: type, amount",
                        action: "TEMPLATE_ACTION",
                    },
                },
            ],
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Run template type1 with negative amount -5",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "❌ Action failed: Amount must be a non-negative number",
                        action: "TEMPLATE_ACTION",
                    },
                },
            ],
        ],
    };
}
