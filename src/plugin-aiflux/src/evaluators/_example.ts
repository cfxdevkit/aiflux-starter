import {
    Evaluator,
    IAgentRuntime,
    Memory,
    State,
    elizaLogger,
} from "@elizaos/core";

/**
 * Configuration interface for the evaluator
 * Extend this interface based on your specific needs
 */
interface EvaluatorConfig {
    // Example: Service or feature flag to enable/disable evaluator
    featureEnabled?: boolean;
    // Example: Additional configuration parameters
    options?: {
        threshold?: number;
        triggers?: string[];
    };
}

/**
 * Template for creating an evaluator
 * This example shows a basic evaluator implementation
 *
 * @param config - Configuration object for the evaluator
 * @returns Evaluator object or null if required configuration is missing
 *
 * Usage example:
 * const evaluator = getEvaluator({
 *   featureEnabled: true,
 *   options: {
 *     threshold: 0.8,
 *     triggers: ['update', 'check']
 *   }
 * });
 */
export function getEvaluator(config: EvaluatorConfig): Evaluator | null {
    // Validate required configuration
    if (!config.featureEnabled) {
        return null;
    }

    const triggers = config.options?.triggers || ["update", "check"];
    const threshold = config.options?.threshold || 0.8;

    return {
        name: "template-evaluator",
        description: "Template for evaluating specific user requests",
        similes: triggers,
        examples: [
            {
                context: "Example request",
                messages: [
                    {
                        user: "user1",
                        content: {
                            text: "update data",
                        },
                    },
                ],
                outcome: "Request evaluation.",
            },
        ],

        /**
         * Validates if the evaluator should process the message
         */
        validate: async (runtime: IAgentRuntime, message: Memory) => {
            try {
                const messageText = message.content?.text?.toLowerCase();
                if (!messageText) return false;

                // Example: Check if any trigger words are present
                const shouldProcess = triggers.some((trigger) =>
                    messageText.includes(trigger)
                );

                if (shouldProcess) {
                    // Example: Cache invalidation or other pre-processing
                    const cacheKey = `template:evaluator:${message.userId}`;
                    await runtime.cacheManager.delete(cacheKey);
                }

                return shouldProcess;
            } catch (error) {
                elizaLogger.error("Template evaluator validation error:", error);
                return false;
            }
        },

        /**
         * Handles the evaluation scoring
         */
        handler: async (
            runtime: IAgentRuntime,
            memory: Memory,
            state: State
        ) => {
            elizaLogger.log("Evaluating data in template evaluator...");

            try {
                if (!memory.content?.text) {
                    return {
                        score: 0,
                        reason: "No content to evaluate",
                    };
                }

                // Example scoring logic
                const messageText = memory.content.text.toLowerCase();
                const matchedTriggers = triggers.filter((trigger) =>
                    messageText.includes(trigger)
                );

                const score =
                    matchedTriggers.length / triggers.length >= threshold
                        ? 1
                        : 0;

                return {
                    score,
                    reason:
                        score > 0
                            ? "Matching triggers found in message"
                            : "No matching triggers found",
                };
            } catch (error) {
                elizaLogger.error(
                    "Error in template evaluator handler:",
                    error
                );
                return {
                    score: 0,
                    reason: "Error during evaluation",
                };
            }
        },
    };
}
