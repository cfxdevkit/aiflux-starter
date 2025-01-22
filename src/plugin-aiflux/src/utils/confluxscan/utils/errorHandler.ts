import { elizaLogger } from "@elizaos/core";

export const handleError = (error: unknown, context: string) => {
    if (error instanceof Error) {
        elizaLogger.error(`Error ${context}: ${error.message}`);
        elizaLogger.debug(`Stack trace: ${error.stack}`);
    } else {
        elizaLogger.error(`Error ${context}:`, error);
    }
    throw error;
};
