import type { KeyboardEvent } from "react";

interface ComposerProps {
    input: string;
    loading: boolean;
    onInputChange: (value: string) => void;
    onSend: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const Composer = ({ input, loading, onInputChange, onSend, onKeyDown }: ComposerProps) => {
    return (
        <div className="composer">
            <div className="composerInner">
                <textarea
                    className="composerInput"
                    value={input}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Message your assistant..."
                    rows={1}
                />
                <button className="sendButton" onClick={onSend} disabled={loading || !input.trim()}>
                    Send
                </button>
            </div>
            <div className="composerHint">Enter to send · Shift+Enter for a new line</div>
        </div>
    );
};