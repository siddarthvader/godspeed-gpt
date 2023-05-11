import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

// const { PromptTemplate } = require("langchain/prompts");

export const makeChain = (vectorstore: SupabaseVectorStore) => {
  const model = new OpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo",
    maxTokens: 1024,
  });

  const qaTemplate = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

  const questionGeneratorTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
  and always provide Code snippet in the answer and append code snippet with ''' before and after the code snippet.
  Chat History:
  {chat_history}
  Follow Up Input: {question}
  Standalone question:`;

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(10),
    {
      returnSourceDocuments: true,
      questionGeneratorTemplate,
      qaTemplate,
    }
  );

  return chain;
};
