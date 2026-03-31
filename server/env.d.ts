declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY: string;
    PINECONE_API_KEY: string;
    PINECONE_INDEX: string;
    LANGSMITH_TRACING?: string;
    LANGSMITH_ENDPOINT?: string;
    LANGSMITH_API_KEY?: string;
    LANGSMITH_PROJECT?: string;
  }
}