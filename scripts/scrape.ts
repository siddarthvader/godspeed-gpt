import axios from "axios";
import * as cheerio from "cheerio";
import { encode } from "gpt-3-encoder";
import { xml2json } from "./util.js";
import { GodspeedDoc, GodspeedJSON, SiteMap } from "../types/index.jsx";
import * as fs from "fs";

const BASE_URL = "https://docs.godspeed.systems/sitemap.xml";

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

(async () => {
  const sitemap: SiteMap[] = await getSitemap();

  let docs: GodspeedDoc[] = [];

  for (let i = 0; i < sitemap.length; i++) {
    const doc = await getPage(sitemap[i].url);
    docs.push(doc);
  }

  console.log(docs);

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
