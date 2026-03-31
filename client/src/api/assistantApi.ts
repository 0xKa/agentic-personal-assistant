import type { ChatRequestBody, ChatResponse, ChatResult, IngestResponse } from "../types/chat";

const API_BASE_URL = "http://localhost:3001";

const parseJson = async <T>(response: Response): Promise<T> => {
    return response.json().catch(() => ({} as T));
};

export const chatWithAssistant = async (
    message: string,
    sessionId: string
): Promise<ChatResult> => {
    const payload: ChatRequestBody = { message, sessionId };

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await parseJson<ChatResponse>(response);

    if (!response.ok) {
        throw new Error(data.error || "Chat request failed");
    }

    if (!data.answer || data.answer.trim() === "") {
        throw new Error("Chat response was empty");
    }

    const normalizedSessionId =
        typeof data.sessionId === "string" && data.sessionId.trim() !== ""
            ? data.sessionId
            : sessionId;

    return {
        answer: data.answer,
        sessionId: normalizedSessionId,
    };
};

export const ingestDocument = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/ingest`, {
        method: "POST",
        body: formData,
    });

    const data = await parseJson<IngestResponse>(response);

    if (!response.ok) {
        throw new Error(data.error || "Upload failed");
    }
};