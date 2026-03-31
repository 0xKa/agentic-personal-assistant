export interface Message {
    role: "user" | "ai";
    text: string;
}

export interface ChatResponse {
    answer?: string;
    error?: string;
}

export interface IngestResponse {
    ok?: boolean;
    error?: string;
}