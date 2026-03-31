import type { Request, Response } from "express";
import { getChatAnswer } from "../services/chatService.ts";
import type { ChatRequestBody, ChatResponse, ErrorResponse } from "../types/api.ts";
import { toErrorMessage } from "../utils/errors.ts";
import { createSessionId, isValidSessionId } from "../utils/session.ts";

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

        const normalizedIncomingSessionId =
            typeof sessionId === "string" ? sessionId.trim() : "";

        if (
            normalizedIncomingSessionId !== "" &&
            !isValidSessionId(normalizedIncomingSessionId)
        ) {
            res.status(400).json({ error: "Invalid sessionId format" });
            return;
        }

        const resolvedSessionId =
            normalizedIncomingSessionId !== ""
                ? normalizedIncomingSessionId
                : createSessionId();

        const answer = await getChatAnswer({
            message: message.trim(),
            sessionId: resolvedSessionId,
        });

        res.json({
            answer,
            sessionId: resolvedSessionId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: toErrorMessage(error, "Chat request failed") });
    }
};