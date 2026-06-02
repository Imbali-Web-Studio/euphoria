require("dotenv").config();
const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function getPlainText(property) {
  if (!property) return "";
  if (property.type === "title") {
    return (property.title || []).map((item) => item.plain_text).join("").trim();
  }
  if (property.type === "rich_text") {
    return (property.rich_text || []).map((item) => item.plain_text).join("").trim();
  }
  return "";
}

async function fetchSpecials() {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    throw new Error("Missing NOTION_TOKEN or NOTION_DATABASE_ID in .env");
  }

  const filter = {
    property: "Active",
    checkbox: { equals: true },
  };

  let response;
  if (notion.dataSources && typeof notion.dataSources.query === "function") {
    try {
      response = await notion.dataSources.query({
        data_source_id: process.env.NOTION_DATABASE_ID,
        filter,
      });
    } catch (error) {
      const db = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID,
      });
      const firstDataSourceId = db.data_sources && db.data_sources[0] && db.data_sources[0].id;

      if (!firstDataSourceId) {
        throw error;
      }

      response = await notion.dataSources.query({
        data_source_id: firstDataSourceId,
        filter,
      });
    }
  } else {
    response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter,
    });
  }

  const specials = response.results.map((page) => ({
    name: getPlainText(page.properties.Name),
    description: getPlainText(page.properties.Description),
    price: getPlainText(page.properties.Price),
  }));

  const outputPath = path.join(__dirname, "js", "specials.js");
  const output = `window.DAILY_SPECIALS = ${JSON.stringify(specials, null, 2)};\n`;
  fs.writeFileSync(outputPath, output, "utf8");

  console.log(`Specials updated: ${specials.length} items written to ${outputPath}`);
}

fetchSpecials().catch((error) => {
  console.error("Failed to fetch specials from Notion:");
  console.error(error);
  process.exitCode = 1;
});