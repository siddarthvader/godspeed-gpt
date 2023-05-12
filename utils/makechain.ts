import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

// const { PromptTemplate } = require("langchain/prompts");

export const makeChain = (vectorstore: SupabaseVectorStore) => {
  const model = new OpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo",
    maxTokens: 2000,
    openAIApiKey: process.env.OPENAI_API_KEY!,
    presencePenalty: 1,
  });
  const qa_template = `You are a helpful assistant! You will answer all questions using context.
  {context}

  Add code snippet in Code format in answer, whenever possible.  Dont remove comments from code snippet, and show whole code snippet.
  Question: {question}
  Helpful Answer:`;

  const question_generator_template = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
  Chat History:
  {chat_history}
  Follow Up Input: {question}
  Standalone question:`;

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(4),
    {
      returnSourceDocuments: true,
      questionGeneratorTemplate: question_generator_template,
      qaTemplate: qa_template,
    }
  );

  return chain;
};
