import { OpenAI } from "langchain/llms";

export const openai = new OpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "gpt-3.5-turbo",
});
