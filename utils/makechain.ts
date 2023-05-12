import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

// const { PromptTemplate } = require("langchain/prompts");

export const makeChain = (vectorstore: SupabaseVectorStore) => {
  const model = new OpenAI({
    temperature: 0.9,
    modelName: "gpt-3.5-turbo",
    maxTokens: 2000,
    openAIApiKey: process.env.OPENAI_API_KEY!,
    verbose: true,
  });
  const qa_template = `You are a helpful AI assistant for GodSpeed! You will answer all questions using context. Dont use outside context knowledge, dont make up an answer or code.
  Use only the evidence and state only the Facts.
  Be as Detailed as possible.  If you are not sure, say "I don't know" or "I'm not sure". DO NOT mention context in your answer.
  
  Search in Title first and then in Content. Title is more important than Content.

  ALWAYS SHOW THE COMPLETE CODE SNIPPET IN PROPER FORMAT FROM THE CONTEXT.
  DONT GENERATE NEW CODE FROM YOUR KNOWLEDGE. ALWAYS SHOW DETAILED INSTRUCTIONS. 
  Context: {context}

  Question: {question}
  Helpful Answer:`;

  const question_generator_template = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
 
  Ask for showing CODE from context.
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
