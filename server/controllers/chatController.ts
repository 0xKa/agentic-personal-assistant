import type { Request, Response } from "express";
import { getChatAnswer } from "../services/chatService.ts";
import type { ChatRequestBody, ChatResponse, ErrorResponse } from "../types/api.ts";
import { toErrorMessage } from "../utils/errors.ts";

export const chatController = async (
    req: Request<unknown, unknown, ChatRequestBody>,
    res: Response<ChatResponse | ErrorResponse>
): Promise<void> => {
    try {
        const { message, sessionId } = req.body;

        if (typeof message !== "string" || message.trim() === "") {
            res.status(400).json({ error: "Message required" });
            return;
        }

        const answer = await getChatAnswer({ message, sessionId });
        res.json({ answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: toErrorMessage(error, "Chat request failed") });
    }
};