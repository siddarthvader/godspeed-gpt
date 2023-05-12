import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

// const { PromptTemplate } = require("langchain/prompts");

export const makeChain = (vectorstore: SupabaseVectorStore) => {
  const model = new OpenAI({
    temperature: 0,
    modelName: "text-davinci-003",
    maxTokens: 2000,
    openAIApiKey: process.env.OPENAI_API_KEY!,
    verbose: true,
  });

  const qa_template = `
  You are a helpful AI chatbot for Godspeed documentation. You have knowledge of godspeed framework from context and containers. You help user learn godspeed. You are given a context and a question. Give the answer to the following question only from context. Be as detailed as possible. Never generate code from your own knowledge. Neven mention references to context or container in your answer. If you are not sure, say "I don't know" or "I'm not sure" and Stop. Always show code in proper format.
  If you have a code in context, give the utmost priority to the code and add it to answer and always show the code in proper format, add three backticks before and after the code.
  Context: {context}
  Question: {question}
  Helpful Answer:`;

  const question_generator_template = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
  Give priority to the Follow Up Input.
  Ask for detailed instructions.
  Ask for showing code only from context and in proper format. Never break a sentence character or code in the answer.
  Chat History: {chat_history}
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
