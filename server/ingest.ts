import { Pinecone } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeEmbeddings, PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { requireEnv } from "./env.ts";

export const ingestData = async (filePath: string): Promise<void> => {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitDocuments(docs);

  const pineconeClient = new Pinecone({ apiKey: requireEnv("PINECONE_API_KEY") });
  const index = pineconeClient.Index(requireEnv("PINECONE_INDEX"));

  const embeddings = new PineconeEmbeddings({ model: "llama-text-embed-v2" });
  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });

  const batchSize = 96;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    await store.addDocuments(batch);
  }

  console.log("Ingestion complete");
};