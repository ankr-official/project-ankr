/* global process */
/**
 * vite build 후 실행 — 크롤러·SNS 미리보기용 정적 페이지 + sitemap 생성
 *
 * GitHub Pages는 `/event/row1208` 요청에 `event/row1208.html`을 200으로 서빙한다.
 * 각 파일은 dist/index.html(앱 셸)과 동일하되 title·description·OG·JSON-LD만 이벤트별로 교체하므로
 * 사용자에게는 기존과 똑같이 SPA가 뜨고, JS를 실행하지 않는 봇은 이벤트 메타를 읽는다.
 *
 * 사용: node scripts/generate-pages.js [distDir]
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(process.argv[2] || resolve(__dirname, "../dist"));
const BASE_URL = "https://ankr.kr";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

// 환경변수 우선, 없으면 .env 파일에서 읽기
let dbUrl = process.env.VITE_FIREBASE_DATABASE_URL;
if (!dbUrl) {
  try {
    const env = readFileSync(resolve(__dirname, "../.env"), "utf-8");
    dbUrl = env.match(/VITE_FIREBASE_DATABASE_URL=(.+)/)?.[1]?.trim();
  } catch {
    // .env 없음
  }
}
if (!dbUrl) {
  console.error("VITE_FIREBASE_DATABASE_URL is not set");
  process.exit(1);
}

const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

// <script> 안에 넣는 JSON — "</script>" 등으로 태그가 깨지지 않게 "<" 이스케이프
const safeJson = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return Object.values(val);
};

// schedule은 UTC 자정 ISO라 앞 10자리가 KST 날짜
const scheduleDate = (schedule) => (typeof schedule === "string" ? schedule.slice(0, 10) : "");

// UTC ISO → "YYYY-MM-DDTHH:mm:ss+09:00"
const toKSTIso = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return `${new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19)}+09:00`;
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: ${url} (${res.status})`);
  return res.json();
}

/** 템플릿 치환 — 대상이 없으면 index.html 구조가 바뀐 것이므로 빌드 실패 */
const replaceOnce = (html, pattern, replacement, label) => {
  if (!pattern.test(html)) throw new Error(`template tag not found: ${label}`);
  return html.replace(pattern, replacement);
};

const metaPattern = (attr, key) => new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/>`);

function renderPage(template, { title, description, url, image, jsonLd, rootHtml }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(url);
  let html = template;

  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`, "title");
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${u}" />`, "canonical");
  html = replaceOnce(html, metaPattern("name", "description"), `<meta name="description" content="${d}" />`, "description");
  html = replaceOnce(html, metaPattern("property", "og:url"), `<meta property="og:url" content="${u}" />`, "og:url");
  html = replaceOnce(html, metaPattern("property", "og:title"), `<meta property="og:title" content="${t}" />`, "og:title");
  html = replaceOnce(html, metaPattern("property", "og:description"), `<meta property="og:description" content="${d}" />`, "og:description");
  html = replaceOnce(html, metaPattern("name", "twitter:title"), `<meta name="twitter:title" content="${t}" />`, "twitter:title");
  html = replaceOnce(html, metaPattern("name", "twitter:description"), `<meta name="twitter:description" content="${d}" />`, "twitter:description");

  if (image) {
    const i = escapeHtml(image);
    html = replaceOnce(html, metaPattern("property", "og:image"), `<meta property="og:image" content="${i}" />`, "og:image");
    html = replaceOnce(html, metaPattern("name", "twitter:image"), `<meta name="twitter:image" content="${i}" />`, "twitter:image");
    // 1200x630은 기본 og-image.png 기준 — 포스터 이미지엔 맞지 않으므로 제거
    html = html.replace(/\s*<meta property="og:image:(width|height)" content="\d+" \/>/g, "");
  }

  if (jsonLd) {
    html = replaceOnce(html, /<\/head>/, `    <script type="application/ld+json">${safeJson(jsonLd)}</script>\n    </head>`, "</head>");
  }

  if (rootHtml) {
    // JS를 실행하지 않는 크롤러용 본문. 시각적으로만 숨김 — React 마운트 시 교체됨
    html = replaceOnce(
      html,
      /<div id="root"><\/div>/,
      `<div id="root"><div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">${rootHtml}</div></div>`,
      "#root",
    );
  }

  return html;
}

function eventPage(template, id, event) {
  const name = event.event_name || "이벤트";
  const date = scheduleDate(event.schedule);
  const genres = toArray(event.genre).join(", ");
  const title = `${name} | ANKR.KR`;
  const description = [date, event.location, genres].filter(Boolean).join(" · ");
  const url = `${BASE_URL}/event/${id}`;
  // 기존 EventSeoHelmet과 동일: Twitter 이미지는 large, Worker 이미지는 no-op
  const image = event.img_url ? event.img_url.replace(/(name=)[^&]*/, "$1large") : DEFAULT_OG_IMAGE;

  const startDate = (event.time_start && toKSTIso(event.time_start)) || date;
  const endDate = event.time_end ? toKSTIso(event.time_end) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    startDate,
    ...(endDate && { endDate }),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    // confirm된 이벤트만 생성되므로 Scheduled. 상세 주소 데이터는 없어 국가만 명시
    // performer·offers는 데이터가 없어 생략 (가짜 값은 구조화 데이터 가이드라인 위반)
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location || "미정",
      address: { "@type": "PostalAddress", addressCountry: "KR" },
    },
    image,
    url,
    description,
    organizer: { "@type": "Organization", name: "ANKR.KR", url: BASE_URL },
  };

  const rootHtml = [
    `<h1>${escapeHtml(name)}</h1>`,
    `<p>${escapeHtml(description)}</p>`,
    event.etc ? `<p>${escapeHtml(event.etc)}</p>` : "",
    event.event_url ? `<a href="${escapeHtml(event.event_url)}" rel="nofollow noopener">이벤트 SNS 링크</a>` : "",
  ].join("");

  return renderPage(template, { title, description, url, image, jsonLd, rootHtml });
}

const STATIC_PAGES = [
  { path: "privacy", title: "개인정보 처리방침 | ANKR.KR", description: "ANKR.KR 개인정보 처리방침" },
  { path: "terms", title: "이용약관 | ANKR.KR", description: "ANKR.KR 이용약관" },
];

function buildSitemap(urls) {
  return [
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
        .join("\n"),
    ),
    "</urlset>",
    "",
  ].join("\n");
}

async function main() {
  const template = readFileSync(resolve(DIST, "index.html"), "utf-8");

  const years = await fetchJson(`${dbUrl}/data_v3/meta/years.json`);
  if (!Array.isArray(years)) throw new Error("meta/years is not an array");

  const sitemapUrls = [{ loc: BASE_URL, changefreq: "daily", priority: "1.0" }];
  mkdirSync(resolve(DIST, "event"), { recursive: true });

  let count = 0;
  for (const year of years) {
    const events = await fetchJson(`${dbUrl}/data_v3/${year}.json`);
    if (!events) continue;
    for (const [id, event] of Object.entries(events)) {
      if (!event?.confirm || !/^row\d+$/.test(id)) continue;
      writeFileSync(resolve(DIST, "event", `${id}.html`), eventPage(template, id, event), "utf-8");
      sitemapUrls.push({
        loc: `${BASE_URL}/event/${id}`,
        lastmod: scheduleDate(event.schedule) || undefined,
        changefreq: "monthly",
        priority: "0.7",
      });
      count++;
    }
  }

  for (const page of STATIC_PAGES) {
    const url = `${BASE_URL}/${page.path}`;
    writeFileSync(resolve(DIST, `${page.path}.html`), renderPage(template, { ...page, url }), "utf-8");
    sitemapUrls.push({ loc: url, changefreq: "yearly", priority: "0.3" });
  }

  writeFileSync(resolve(DIST, "sitemap.xml"), buildSitemap(sitemapUrls), "utf-8");
  console.log(`✅ event pages: ${count}, static pages: ${STATIC_PAGES.length}, sitemap URLs: ${sitemapUrls.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
