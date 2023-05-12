import { dbConfig } from "../../../../config";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadEnvConfig } from "@next/env";
import { makeChain } from "../../../../utils/makechain";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

loadEnvConfig("");

export async function POST(req: Request): Promise<Response> {
  const { query, history } = (await req.json()) as {
    query: string;
    history: [];
  };

  //   console.log(history);

  if (!query) {
    return new Response("Query not found", { status: 500 });
  }

  const sanitizedQuestion = query.trim().replaceAll("\n", " ");

  try {
    /* create vectorstore*/
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      dbConfig
    );

    //create chain
    const chain = makeChain(vectorStore);

    //Ask a question using chat history
    // Sending only last 10 answers as history.
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history.slice(0, 10) || [],
    });
    //Ask a question using chat history

    // console.log("response", response);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: any) {
    console.log("error", error);
    return new Response("Error" + error, { status: 500 });
  }
}
