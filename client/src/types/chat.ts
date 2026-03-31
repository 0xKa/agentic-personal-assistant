export interface Message {
    role: "user" | "ai";
    text: string;
}

export interface ChatRequestBody {
    message: string;
    sessionId: string;
}

export interface ChatResponse {
    answer?: string;
    sessionId?: string;
    error?: string;
}

export interface ChatResult {
    answer: string;
    sessionId: string;
}

export interface IngestResponse {
    ok?: boolean;
    error?: string;
}