import { dbConfig, supabase_client } from "../../../../config/index";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadEnvConfig } from "@next/env";
import { makeChain } from "../../../../utils/makechain";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { SupabaseHybridSearch } from "langchain/retrievers/supabase";

loadEnvConfig("");

export async function POST(req: Request): Promise<Response> {
  const { query, history } = (await req.json()) as {
    query: string;
    history: [];
  };

  // console.log(history);

  if (!query) {
    return new Response("Query not found", { status: 500 });
  }

  const sanitizedQuestion = query.trim().replaceAll("\n", " ");

  try {
    const embeddings = new OpenAIEmbeddings();
    /* create vectorstore*/
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      embeddings,

      dbConfig
    );

    const retriever = new SupabaseHybridSearch(embeddings, {
      client: supabase_client,
      similarityK: 2,
      keywordK: 2,
      tableName: "documents",
      similarityQueryName: "match_documents",
      keywordQueryName: "kw_match_documents",
    });

    //create chain
    const chain = makeChain(vectorStore, retriever);

    //Ask a question using chat history
    // Sending only last 10 answers as history.
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history:
        history.length > 3
          ? history.slice(history.length - 3, history.length) || []
          : history || [],
    });
    //Ask a question using chat history

    // console.log("response", response);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: any) {
    console.log("error", error);
    return new Response("Error" + error, { status: 500 });
  }
}
