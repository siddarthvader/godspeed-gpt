import axios from "axios";
import * as cheerio from "cheerio";
import { encode } from "gpt-3-encoder";
import { xml2json } from "./util.js";
import {
  GodspeedChunk,
  GodspeedDoc,
  GodspeedJSON,
  SiteMap,
} from "../types/index.jsx";
import * as fs from "fs";

const BASE_URL = "https://docs.godspeed.systems/sitemap.xml";
const CHUNK_SIZE = 200;

const getSitemap = async () => {
  return await axios
    .get(BASE_URL)
    .then(function (response) {
      // console.log(response);
      const sitemapjson = xml2json(response);
      return sitemapjson.urlset.url.map((url) => {
        return {
          url: url.loc._text.replace(
            "https://your-docusaurus-test-site.com",
            "https://docs.godspeed.systems"
          ),
        };
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

const getPage = async (url: string): Promise<GodspeedDoc> => {
  const html = await axios.get(url);
  const $ = cheerio.load(html.data);

  const title = $("title").text();

  $("*").each(function () {
    if ($(this).is(":not(:empty)")) {
      $(this).before(" ");
      $(this).after(" ");
    }
  });

  // Extract the text content from the HTML while preserving the whitespace between different elements
  const text = $("article").text().replace(/\s+/g, " ").trim();

  return {
    title,
    url,
    date: new Date().toISOString(),
    content: text,
    tokens: encode(text).length,
    length: text.length,
    chunks: [],
  };
};

const chunkEssay = async (doc: GodspeedDoc) => {
  const { title, url, date, content, ...chunklessSection } = doc;

  let docTextChunks = [];

  if (encode(content).length > CHUNK_SIZE) {
    const split = content.split(". ");
    let chunkText = "";

    for (let i = 0; i < split.length; i++) {
      const sentence = split[i];
      const sentenceTokenLength = encode(sentence);
      const chunkTextTokenLength = encode(chunkText).length;

      if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_SIZE) {
        docTextChunks.push(chunkText);
        chunkText = "";
      }

      if (sentence[sentence.length - 1]?.match(/[a-z0-9]/i)) {
        chunkText += sentence + ". ";
      } else {
        chunkText += sentence + " ";
      }
    }

    docTextChunks.push(chunkText.trim());
  } else {
    docTextChunks.push(content.trim());
  }

  const docChunks = docTextChunks.map((text) => {
    const trimmedText = text.trim();

    const chunk: GodspeedChunk = {
      doc_title: title,
      doc_url: url,
      doc_date: date,
      content: trimmedText,
      content_length: trimmedText.length,
      content_tokens: encode(trimmedText).length,
      embedding: [],
    };

    return chunk;
  });

  if (docChunks.length > 1) {
    for (let i = 0; i < docChunks.length; i++) {
      const chunk = docChunks[i];
      const prevChunk = docChunks[i - 1];

      if (chunk.content_tokens < 100 && prevChunk) {
        prevChunk.content += " " + chunk.content;
        prevChunk.content_length += chunk.content_length;
        prevChunk.content_tokens += chunk.content_tokens;
        docChunks.splice(i, 1);
        i--;
      }
    }
  }

  const chunkedSection: GodspeedDoc = {
    ...doc,
    chunks: docChunks,
  };

  return chunkedSection;
};

(async () => {
  const sitemap: SiteMap[] = await getSitemap();

  console.log("sitemap", sitemap);
  let docs = [];

  for (let i = 0; i < sitemap.length; i++) {
    const doc = await getPage(sitemap[i].url);
    const chunkedDoc = await chunkEssay(doc);
    docs.push(chunkedDoc);
  }

  const json: GodspeedJSON = {
    current_date: new Date().toISOString(),
    author: "sid",
    url: "https://docs.godspeed.systems/sitemap.xml",
    tokens: docs.reduce((acc, doc) => acc + doc.tokens, 0),
    length: docs.reduce((acc, doc) => acc + doc.length, 0),
    docs,
  };

  fs.writeFileSync("scripts/gs.json", JSON.stringify(json));
})();
