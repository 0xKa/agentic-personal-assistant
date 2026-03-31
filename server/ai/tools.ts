import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeEmbeddings, PineconeStore } from "@langchain/pinecone";
import { tool } from "langchain";
import { z } from "zod";
import { requireEnv } from "../config/env.ts";

let vectorStore: PineconeStore | null = null;

const getVectorStore = async (): Promise<PineconeStore> => {
  if (vectorStore) {
    return vectorStore;
  }

  const apiKey = requireEnv("PINECONE_API_KEY");
  const indexName = requireEnv("PINECONE_INDEX");

  const pineconeClient = new PineconeClient({ apiKey });
  const index = pineconeClient.Index(indexName);

  const embeddings = new PineconeEmbeddings({
    model: "llama-text-embed-v2",
  });

  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });

  return vectorStore;
};

export const searchKnowledgeBase = tool(
  async ({ query }: { query: string }): Promise<string> => {
    console.log(`Searching Pinecone for: "${query}"`);

    const store = await getVectorStore();
    const results = await store.similaritySearch(query, 10);

    results.forEach((result, index) => {
      console.log(`Result ${index + 1}:`, result.pageContent.slice(0, 200));
    });

    if (results.length === 0) {
      return "No relevant information found in the knowledge base.";
    }

    return results.map((doc) => doc.pageContent).join("\n\n---\n\n");
  },
  {
    name: "search_knowledge_base",
    description:
      "Searches the internal knowledge base for technical info and documentation. Use this when you need to find information from uploaded PDF documents.",
    schema: z.object({
      query: z.string().describe("The search query to look up in the knowledge base"),
    }),
  }
);