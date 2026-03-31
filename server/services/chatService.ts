import { runAgent } from "../ai/agent.ts";

interface GetChatAnswerInput {
    message: string;
    sessionId?: string;
}

const EMPTY_ANSWER_FALLBACK =
    "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?";

export const getChatAnswer = async ({
    message,
    sessionId,
}: GetChatAnswerInput): Promise<string> => {
    const answer = await runAgent({ message, sessionId });
    const output = answer.output.trim();

    if (output === "") {
        return EMPTY_ANSWER_FALLBACK;
    }

    return output;
};