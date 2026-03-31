import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import "./App.css";
import { chatWithAssistant, ingestDocument } from "./api/assistantApi";
import { AppHeader } from "./components/AppHeader";
import { ChatPanel } from "./components/ChatPanel";
import { UploadPanel } from "./components/UploadPanel";
import type { Message } from "./types/chat";
import { getErrorMessage } from "./utils/errors";
import { createSessionId, getOrCreateSessionId, persistSessionId } from "./utils/session";

function App() {
  const [sessionId, setSessionId] = useState<string>(() => getOrCreateSessionId());
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
      const chatResult = await chatWithAssistant(trimmed, sessionId);

      if (chatResult.sessionId !== sessionId) {
        setSessionId(chatResult.sessionId);
      }
      persistSessionId(chatResult.sessionId);

      setMessages((prev) => [...prev, { role: "ai", text: chatResult.answer }]);
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
      await ingestDocument(selectedFile);

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

  const startNewChat = (): void => {
    if (loading) return;

    const nextSessionId = createSessionId();
    persistSessionId(nextSessionId);

    setSessionId(nextSessionId);
    setMessages([]);
    setInput("");
  };

  return (
    <div className="appShell">
      <AppHeader sessionId={sessionId} onNewChat={startNewChat} disabled={loading} />

      <main className="appMain">
        <UploadPanel
          selectedFile={selectedFile}
          uploading={uploading}
          uploadStatus={uploadStatus}
          onFileChange={onFileChange}
          onUpload={() => {
            void uploadDocument();
          }}
        />

        <ChatPanel
          messages={messages}
          loading={loading}
          input={input}
          endOfMessagesRef={endOfMessagesRef}
          onInputChange={setInput}
          onSend={() => {
            void sendMessage();
          }}
          onComposerKeyDown={onComposerKeyDown}
        />
      </main>
    </div>
  );
}

export default App;