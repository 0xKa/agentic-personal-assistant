interface AppHeaderProps {
    sessionId: string;
    onNewChat: () => void;
    disabled?: boolean;
}

const shortenSessionId = (sessionId: string): string => {
    return sessionId.length <= 12 ? sessionId : `${sessionId.slice(0, 12)}...`;
};

export const AppHeader = ({ sessionId, onNewChat, disabled = false }: AppHeaderProps) => {
    return (
        <header className="appHeader">
            <div className="appHeaderInner">
                <div className="appHeaderText">
                    <div className="appTitle">Agentic Personal Assistant</div>
                    <div className="appSubtitle">Upload PDFs, then chat with your knowledge base.</div>
                </div>

                <div className="headerActions">
                    <div className="headerSessionMeta">Session {shortenSessionId(sessionId)}</div>
                    <button type="button" className="headerButton" onClick={onNewChat} disabled={disabled}>
                        New Chat
                    </button>
                </div>
            </div>
        </header>
    );
};