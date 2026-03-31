import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { searchKnowledgeBase } from "./tools.ts";

interface RunAgentInput {
  sessionId?: string;
  message: string;
}

interface RunAgentOutput {
  output: string;
}

interface MessageChunk {
  text?: string;
}

const checkpointer = new MemorySaver();

const extractContentText = (content: unknown): string => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (typeof part === "object" && part !== null && "text" in part) {
          const text = (part as MessageChunk).text;
          return typeof text === "string" ? text : "";
        }

        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
};

export async function runAgent({
  sessionId = "default",
  message,
}: RunAgentInput): Promise<RunAgentOutput> {
  const model = new ChatOpenAI({
    model: "gpt-4.1-nano",
    temperature: 0,
  });

  const agent = createAgent({
    model,
    tools: [searchKnowledgeBase],
    checkpointer,
    systemPrompt:
      "You are a helpful AI assistant with access to a knowledge base. When users ask questions, search the knowledge base using the available tools to find relevant information. Be concise and accurate.",
  });

  console.log(`Running agent for: "${message}"`);

  const response = await agent.invoke(
    {
      messages: [{ role: "user", content: message }],
    },
    {
      configurable: {
        thread_id: sessionId,
      },
    }
  );

  const rawMessages = (response as { messages?: unknown }).messages;
  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  const lastMessage = messages[messages.length - 1] as { content?: unknown } | undefined;
  const output = extractContentText(lastMessage?.content);

  console.log(`Agent response preview: ${output.slice(0, 100)}...`);

  return { output };
}