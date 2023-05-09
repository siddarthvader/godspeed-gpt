import { loadEnvConfig } from "@next/env";
import { OpenAIStream } from "../../../../utils";

loadEnvConfig("");

export async function POST(req: Request): Promise<Response> {
  try {
    const { prompt } = (await req.json()) as {
      prompt: string;
    };

    const apiKey = process.env.OPEN_API_KEY!;

    console.log({ apiKey });

    const stream = await OpenAIStream(prompt, apiKey);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}