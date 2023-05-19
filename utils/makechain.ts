import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { SupabaseHybridSearch } from "langchain/retrievers/supabase";
import { LLMChain, loadQAChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

// const { PromptTemplate } = require("langchain/prompts");

// const CONDENSE_PROMPT =
//   PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

// Chat History:
// {chat_history}
// Follow Up Input: {question}
// Standalone question:`);

// const QA_PROMPT =
//   PromptTemplate.fromTemplate(`You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
// If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
// If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

// {context}

// Question: {question}
// Helpful answer in markdown:`);

export const makeChain = (
  vectorstore: SupabaseVectorStore,
  retriever: SupabaseHybridSearch
) => {
  console.log("retriever");
  const model = new OpenAI({
    temperature: 1.0,
    // modelName: "gpt-3.5-turbo",
    maxTokens: 2000,
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });

  const qa_template = `
  You are a AI Assistant for Godspeed framework.
  Assume that User does not have information about Godspeed Framework.
  Answer the question based on the context below only, dont use outside context knowledge. 
  Keep the answer detailed and well explained with code. 
  Always show answer in strictly markdown format.
  Use the code provided in Context to generate examples.
  User is a software engineer who is trying to learn Godspeed Framework.
  
  Respond "I dont know" or "Not enough information in context" if not sure about the answer, do not hellucinate.
  

  Context: {context}

  Generate an answer to the following question. 
  Question: {question}


  Helpful Answer:`;

  const question_generator_template = `
  Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question and add context to it.
  Give priority to the Follow Up Input.
  Ask for detailed instructions.
  Ask for showing code only from context and in markdown format. Never break a sentence character or code in the answer.
  Chat History: {chat_history}
  Follow Up Input: {question}
  Standalone question:`;

  const chain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
    returnSourceDocuments: true,
    questionGeneratorTemplate: question_generator_template,
    qaTemplate: qa_template,
    verbose: true,
  });

  return chain;
};
