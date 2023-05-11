import { GodspeedDoc, GodspeedJSON } from "../types";
import { loadEnvConfig } from "@next/env";
import * as fs from "fs";

import { Configuration, OpenAIApi } from "openai";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig("");

const generateEmbedding = async (docs: GodspeedDoc[]) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  console.log(process.env.SUPABASE_URL);
  console.log(process.env.SUPABASE_PRIVATE_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PRIVATE_KEY!
  );

  //   console.log(docs);

  for (let i = 0; i < docs.length; i++) {
    const section = docs[i];

    for (let j = 0; j < section.chunks.length; j++) {
      const chunk = section.chunks[j];

      const {
        doc_title,
        doc_url,
        doc_date,
        content,
        content_length,
        content_tokens,
      } = chunk;

      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: content,
      });

      const [{ embedding }] = embeddingResponse.data.data;

      //   console.log({ embedding });

      const { data, error } = await supabase
        .from("godspeed_chunks")
        .insert({
          doc_title,
          doc_url,
          doc_date,
          content,
          content_length,
          content_tokens,
          embedding,
        })
        .select("*");

      if (error) {
        console.log("error", error);
      } else {
        console.log("saved", i, j);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
};

(async () => {
  const json: GodspeedJSON = JSON.parse(
    fs.readFileSync("scripts/gs.json", "utf8")
  );

  await generateEmbedding(json.docs);
})();
