import { MarkdownTextSplitter } from "langchain/text_splitter";
import { dbConfig } from "../config";
import { loadEnvConfig } from "@next/env";
import * as fs from "fs";
const sidebars = require("./gs_doc-main/sidebars.js");
const { OpenAIEmbeddings } = require("langchain/embeddings");
const { SupabaseVectorStore } = require("langchain/vectorstores/supabase");

loadEnvConfig("");

const privateKey = process.env.SUPABASE_PRIVATE_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

const url = process.env.SUPABASE_URL;

if (!url) throw new Error(`Expected env var SUPABASE_URL`);

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 500;

const BASE_URL = "scripts/gs_doc-main/docs/";
const POSTFIX = ".md";
const DOC_URL = "https://docs.godspeed.systems/docs/";

const getPage = async (
  base_url: string,
  url: string,
  postfix: string,
  doc_url: string
) => {
  const html = fs.readFileSync(base_url + url + postfix, "utf8");

  console.log(html);
  const splitter = new MarkdownTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const output = await splitter.createDocuments(
    [html],
    [
      {
        source: doc_url + url,
      },
    ]
  );

  // console.log(output);
  return output;
};
const getSitemap = (list: any) => {
  // console.log(list);
  return list.reduce((sitemap: any, item: any, index: number) => {
    if (!item?.items?.length) {
      sitemap.push(item.id ?? item);
    } else {
      sitemap.push(getSitemap(item.items));
    }
    return sitemap;
  }, []);
};

(async () => {
  const sitemap: string[] = getSitemap(sidebars.tutorialSidebar).flat().flat();

  let docs = [];

  for (let i = 0; i < sitemap.length; i++) {
    const doc = await getPage(BASE_URL, sitemap[i], POSTFIX, DOC_URL);

    // console.log(doc.metadata);
    docs.push(doc);
  }

  console.log(docs.flat());

  // const embeddings = new OpenAIEmbeddings({
  //   model: "text-embedding-ada-002",
  // });

  // SupabaseVectorStore.fromDocuments(docs.flat(), embeddings, dbConfig);
})();
