import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
const BASE_URL = "https://docs.godspeed.systems";

(async () => {
  // URL of the page with the sidebar
  const url =
    "https://docs.godspeed.systems/docs/microservices/datasources/redis";

  axios
    .get(url)
    .then((response) => {
      // HTML content of the page
      const pageHTML = response.data;

      // Load HTML content with Cheerio
      const $ = cheerio.load(pageHTML);

      // Select all link elements within the sidebar
      const links = $(".sidebar_njMd a.menu__link");

      // Extract link URLs and text
      const linkData = links
        .map((index, element) => ({
          url: BASE_URL + $(element).attr("href"),
        }))
        .get();

      // Save link data as JSON
      const jsonContent = JSON.stringify(linkData, null, 2);
      fs.writeFileSync("scripts/sidebar_links.json", jsonContent);

      console.log("Links extracted and saved as sidebar_links.json");
    })
    .catch((error) => {
      console.error("Error fetching the page:", error);
    });
})();
