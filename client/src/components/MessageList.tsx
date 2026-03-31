import type { RefObject } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "../types/chat";

interface MessageListProps {
    messages: Message[];
    loading: boolean;
    endOfMessagesRef: RefObject<HTMLDivElement | null>;
}

export const MessageList = ({ messages, loading, endOfMessagesRef }: MessageListProps) => {
    return (
        <div className="messages">
            {messages.length === 0 && (
                <div className="emptyState">Upload a PDF to ingest it, then ask a question below.</div>
            )}

            {messages.map((message, index) => (
                <div key={index} className={message.role === "user" ? "messageRow isUser" : "messageRow isAi"}>
                    <div className="messageBubble">
                        {message.role === "ai" ? <ReactMarkdown>{message.text}</ReactMarkdown> : message.text}
                    </div>
                </div>
            ))}

            {loading && (
                <div className="messageRow isAi">
                    <div className="messageBubble isTyping">Thinking...</div>
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};