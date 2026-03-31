import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface ChatResponse {
  answer?: string;
  error?: string;
}

interface IngestResponse {
  ok?: boolean;
  error?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  return fallback;
};

function App() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (): Promise<void> => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data: ChatResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Chat request failed");
      }

      if (!data.answer || data.answer.trim() === "") {
        throw new Error("Chat response was empty");
      }

      setMessages((prev) => [...prev, { role: "ai", text: data.answer as string }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: getErrorMessage(error, "Chat request failed") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (): Promise<void> => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:3001/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data: IngestResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadStatus("Uploaded and ingested successfully.");
      setSelectedFile(null);
    } catch (error) {
      setUploadStatus(getErrorMessage(error, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="appHeaderInner">
          <div className="appTitle">Agentic Personal Assistant</div>
          <div className="appSubtitle">Upload PDFs, then chat with your knowledge base.</div>
        </div>
      </header>

      <main className="appMain">
        <section className="uploadPanel">
          <div className="uploadRow">
            <label className="uploadButton" htmlFor="pdf-upload">
              Choose PDF
            </label>
            <input
              id="pdf-upload"
              className="uploadInput"
              type="file"
              accept="application/pdf,.pdf"
              onChange={onFileChange}
            />
            <button
              className="primaryButton"
              onClick={() => {
                void uploadDocument();
              }}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <div className="uploadMeta">
              {selectedFile ? selectedFile.name : "No file selected"}
            </div>
          </div>
          {uploadStatus && <div className="uploadStatus">{uploadStatus}</div>}
        </section>

        <section className="chatPanel">
          <div className="messages">
            {messages.length === 0 && (
              <div className="emptyState">
                Upload a PDF to ingest it, then ask a question below.
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={message.role === "user" ? "messageRow isUser" : "messageRow isAi"}
              >
                <div className="messageBubble">
                  {message.role === "ai" ? (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  ) : (
                    message.text
                  )}
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

          <div className="composer">
            <div className="composerInner">
              <textarea
                className="composerInput"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Message your assistant..."
                rows={1}
              />
              <button
                className="sendButton"
                onClick={() => {
                  void sendMessage();
                }}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>
            <div className="composerHint">Enter to send · Shift+Enter for a new line</div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;