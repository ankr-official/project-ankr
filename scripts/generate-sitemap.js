import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 환경변수 우선, 없으면 .env 파일에서 읽기
let dbUrl = process.env.VITE_FIREBASE_DATABASE_URL;
if (!dbUrl) {
  try {
    const env = readFileSync(resolve(__dirname, "../.env"), "utf-8");
    dbUrl = env.match(/VITE_FIREBASE_DATABASE_URL=(.+)/)?.[1]?.trim();
  } catch {}
}
if (!dbUrl) {
  console.error("VITE_FIREBASE_DATABASE_URL is not set");
  process.exit(1);
}

const BASE_URL = "https://ankr.kr";
const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (s) => {
  const d = new Date(s);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: ${url} (${res.status})`);
  return res.json();
}

async function main() {
  console.log("Generating sitemap...");

  const years = await fetchJson(`${dbUrl}/data_v3/meta/years.json`);
  if (!Array.isArray(years)) throw new Error("meta/years is not an array");

  const urls = [
    { loc: BASE_URL, changefreq: "daily", priority: "1.0" },
  ];

  await Promise.all(
    years.map(async (year) => {
      const events = await fetchJson(`${dbUrl}/data_v3/${year}.json`);
      if (!events) return;
      for (const [id, event] of Object.entries(events)) {
        if (!event.confirm) continue;
        urls.push({
          loc: `${BASE_URL}/event/${id}`,
          lastmod: toDateStr(event.schedule),
          changefreq: "monthly",
          priority: "0.7",
        });
      }
    })
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(({ loc, lastmod, changefreq, priority }) =>
      [
        "  <url>",
        `    <loc>${loc}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n")
    ),
    "</urlset>",
  ].join("\n");

  const outPath = resolve(__dirname, "../public/sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`sitemap.xml generated: ${urls.length} URLs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
