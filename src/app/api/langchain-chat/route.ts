import { dbConfig } from "../../../../config";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadEnvConfig } from "@next/env";
import { makeChain } from "../../../../utils/makechain";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

loadEnvConfig("");

const SYSTEM_MESSAGE = `You are a helpful AI assistant for GodSpeed! You will answer all questions using context. Dont use outside context knowledge, dont make up an answer or code.
Use only the evidence and state only the Facts.
Be as Detailed as possible.  If you are not sure, say "I don't know" or "I'm not sure". DO NOT mention context in your answer.

CONTEXT IS A LIST OF CONTAINERS.
EACH CONTAINER STARTS WITH "CONTINAR:" word
CONTAINER HAS A TITLE AND CONTENT and sometimes it has a CODE SNIPPET.
CODE SNIPPET starts with "CODE---" and ends with "---CODE"
Search in TITLE first and then in CONTENT. Title is more important than Content.

ALWAYS SHOW THE COMPLETE CODE SNIPPET IN PROPER FORMAT FROM THE CONTEXT.
DONT GENERATE NEW CODE FROM YOUR KNOWLEDGE. ALWAYS SHOW DETAILED INSTRUCTIONS. `;

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
      system_message: SYSTEM_MESSAGE,
    });
    //Ask a question using chat history

    // console.log("response", response);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: any) {
    console.log("error", error);
    return new Response("Error" + error, { status: 500 });
  }
}
