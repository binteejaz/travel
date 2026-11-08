// Rebuilds the "Latest stories" cards in index.html from your journal pages.
//
// A page counts as a journal article only if its <head> has this tag:
//   <meta name="journal:date" content="2026-11-05">
// Optional tags: journal:category, journal:image, journal:image-alt, journal:title
//
// Run:  node build-latest.mjs

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const INDEX = "index.html";
const COUNT = 4; // how many cards to show
const START = "<!-- LATEST-STORIES:START -->";
const END = "<!-- LATEST-STORIES:END -->";

const decode = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");

const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Reads <meta name="..." content="..."> (or property="...") from a page
function meta(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const n = tag.match(/\b(?:name|property)\s*=\s*"([^"]*)"/i);
    if (n && n[1].toLowerCase() === name.toLowerCase()) {
      const c = tag.match(/\bcontent\s*=\s*"([^"]*)"/i);
      return c ? decode(c[1].trim()) : null;
    }
  }
  return null;
}

// Page title without a suffix like " — DoTravelling Journal" or " | DoTravelling"
function pageTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  const t = decode(m[1].replace(/\s+/g, " ").trim());
  return t.split(/\s+[—–|]\s+/)[0];
}

// Shortens text to about 150 characters, at a word boundary
function short(text, max = 150) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max).replace(/\s+\S*$/, "");
  return cut.replace(/[.,;:!\s]+$/, "") + "…";
}

// 1. Find every journal page
const pages = [];

for (const file of fs.readdirSync(ROOT)) {
  if (!file.endsWith(".html") || file === INDEX) continue;

  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const date = meta(html, "journal:date");
  if (!date) continue; // not a journal article

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.warn(`SKIPPED ${file}: journal:date must look like 2026-11-05`);
    continue;
  }

  const title = meta(html, "journal:title") || pageTitle(html);
  const image = meta(html, "journal:image");

  if (!title) {
    console.warn(`SKIPPED ${file}: no <title> found`);
    continue;
  }
  if (!image) {
    console.warn(`SKIPPED ${file}: add <meta name="journal:image" content="images/...webp">`);
    continue;
  }
  if (!fs.existsSync(path.join(ROOT, image))) {
    console.warn(`WARNING ${file}: image file not found: ${image}`);
  }

  pages.push({
    file,
    date,
    title,
    image,
    alt: meta(html, "journal:image-alt") || "",
    category: meta(html, "journal:category") || "Journal",
    desc: meta(html, "description") || "",
  });
}

if (pages.length === 0) {
  console.error("No journal pages found. index.html was NOT changed.");
  process.exit(1);
}

// 2. Newest first, then keep the latest few
pages.sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file));
const latest = pages.slice(0, COUNT);

// 3. Build the cards
const card = (p) => `                <article class="latest-card">
                    <a href="${esc(p.file)}">
                        <div class="latest-thumb">
                            <img src="${esc(p.image)}" alt="${esc(p.alt)}" width="800" height="600"
                                loading="lazy" decoding="async">
                        </div>
                        <div class="latest-body">
                            <div class="eyebrow">${esc(p.category)}</div>
                            <h3>${esc(p.title)}</h3>
                            <p>${esc(short(p.desc))}</p>
                            <span class="latest-more">Read article →</span>
                        </div>
                    </a>
                </article>`;

// 4. Put them between the markers in index.html
const indexPath = path.join(ROOT, INDEX);
const index = fs.readFileSync(indexPath, "utf8");
const s = index.indexOf(START);
const e = index.indexOf(END);

if (s === -1 || e === -1 || e < s) {
  console.error(`Markers not found in ${INDEX}. Add ${START} and ${END} inside the latest-grid div.`);
  process.exit(1);
}

let block = `${START}\n${latest.map(card).join("\n\n")}\n                ${END}`;
if (index.includes("\r\n")) block = block.replace(/\n/g, "\r\n"); // keep Windows line endings

const updated = index.slice(0, s) + block + index.slice(e + END.length);

console.log(`Journal pages found: ${pages.length}. Showing the latest ${latest.length}:`);
latest.forEach((p) => console.log(`  ${p.date}  ${p.file}  ->  ${p.title}`));

if (updated === index) {
  console.log("index.html is already up to date.");
} else {
  fs.writeFileSync(indexPath, updated);
  console.log("index.html updated.");
}
