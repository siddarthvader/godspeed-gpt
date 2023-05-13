import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

// const { PromptTemplate } = require("langchain/prompts");

export const makeChain = (vectorstore: SupabaseVectorStore) => {
  const model = new OpenAI({
    temperature: 0.7,
    modelName: "text-davinci-003",
    maxTokens: 2000,
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });

  const qa_template = `
  You are a AI Assistant for Godspeed framework.
  Assume that User does not have information about Godspeed Framework.
  Answer the question based on the context below only, dont use outside context knowledge. 
  Keep the answer detailed and well explained with code. 
  Always show answer in markdown format.
  Always show code which is available in context. 
  Never show code which is outside the context.
  Never make up an answer or code. 
  User is a software engineer who is trying to learn Godspeed Framework.
  
  Respond "I dont know" or "Not enough information in context" if not sure about the answer.
  

  Context: {context}

  Generate an answer to the following question. 
  Question: {question}


  Helpful Answer:`;

  const question_generator_template = `
  Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
  Give priority to the Follow Up Input.
  Ask for detailed instructions.
  Ask for showing code only from context and in markdown format. Never break a sentence character or code in the answer.
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
