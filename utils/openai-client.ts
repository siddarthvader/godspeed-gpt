import { OpenAI } from "langchain/llms";

export const openai = new OpenAI({
  temperature: 0.6,
  openAIApiKey: process.env.OPENAI_API_KEY!,
});
