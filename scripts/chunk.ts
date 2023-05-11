const { JSONLoader } = require("langchain/document_loaders/fs/json");

import * as fs from "fs";

(async () => {
  //   const docs = new JSONLoader("gs.json");
  const loaderContent = new JSONLoader("scripts/gs.json", ["/content"]);
  const laoderURL = new JSONLoader("scripts/gs.json", ["/url"]);

  //   console.log(docs);
  //   return docs.map((doc) => {
  //     doc.metadata.url = doc.url;
  //     return doc;
  //   });

  const docs = await loaderContent.load();
  const url = await laoderURL.load();

  docs.map((doc, index) => {
    doc.metadata.url = url[index].pageContent;
    return doc;
  });
  console.log(docs);
  fs.writeFileSync("scripts/chunk.json", JSON.stringify(docs));
})();
