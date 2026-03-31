export interface ChatRequestBody {
    message?: string;
    sessionId?: string;
}

export interface ChatResponse {
    answer: string;
}

export interface IngestResponse {
    ok: true;
}

export interface ErrorResponse {
    error: string;
}