import type { KeyboardEvent, RefObject } from "react";
import type { Message } from "../types/chat";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

interface ChatPanelProps {
    messages: Message[];
    loading: boolean;
    input: string;
    endOfMessagesRef: RefObject<HTMLDivElement | null>;
    onInputChange: (value: string) => void;
    onSend: () => void;
    onComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const ChatPanel = ({
    messages,
    loading,
    input,
    endOfMessagesRef,
    onInputChange,
    onSend,
    onComposerKeyDown,
}: ChatPanelProps) => {
    return (
        <section className="chatPanel">
            <MessageList messages={messages} loading={loading} endOfMessagesRef={endOfMessagesRef} />
            <Composer
                input={input}
                loading={loading}
                onInputChange={onInputChange}
                onSend={onSend}
                onKeyDown={onComposerKeyDown}
            />
        </section>
    );
};