const { JSONLoader } = require("langchain/document_loaders/fs/json");
const { OpenAIEmbeddings } = require("langchain/embeddings");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { SupabaseVectorStore } = require("langchain/vectorstores/supabase");
const { MarkdownTextSplitter } = require("langchain/text_splitter");

import { loadEnvConfig } from "@next/env";
loadEnvConfig("");

import { dbConfig } from "../config";
const privateKey = process.env.SUPABASE_PRIVATE_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

const url = process.env.SUPABASE_URL;

// console.log(url);
if (!url) throw new Error(`Expected env var SUPABASE_URL`);

(async () => {
  //   const docs = new JSONLoader("gs.json");
  const loaderContent = new JSONLoader("scripts/gs.json", ["/pageContext"]);
  const laoderURL = new JSONLoader("scripts/gs.json", ["/metadata"]);
  // const loaderTitle = new JSONLoader("scripts/gs.json", ["/title"]);

  //   console.log(docs);
  //   return docs.map((doc) => {
  //     doc.metadata.url = doc.url;
  //     return doc;
  //   });

  const docs = await loaderContent.load();
  const url = await laoderURL.load();
  // const title = await loaderTitle.load();

  docs.map((doc, index) => {
    doc.metadata = url[index].metadata;

    return doc;
  });
  console.log(docs);
  //   fs.writeFileSync("scripts/chunk.json", JSON.stringify(docs));

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 500,
  });

  const chunkedDocs = await textSplitter.splitDocuments(docs);

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-ada-002",
  });

  SupabaseVectorStore.fromDocuments(chunkedDocs, embeddings, dbConfig);
})();
