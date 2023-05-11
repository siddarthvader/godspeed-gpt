import { supabaseAdmin } from "../../../../utils";
import { loadEnvConfig } from "@next/env";

loadEnvConfig("");

export async function POST(req: Request): Promise<Response> {
  try {
    const { query } = (await req.json()) as {
      query: string;
    };

    console.log(query);

    const apiKey = process.env.OPEN_API_KEY!;

    const res = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: query,
      }),
    });

    const json = await res.json();

    // console.log(json);
    const embedding = json.data[0].embedding;

    // console.log({ embedding });

    const { data: chunks, error } = await supabaseAdmin.rpc("godspeed_search", {
      match_count: 10,
      query_embedding: embedding,
      similarity_threshold: 0.8,
    });

    if (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }

    return new Response(JSON.stringify(chunks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}
