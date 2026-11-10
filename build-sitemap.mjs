// Rebuilds sitemap.xml from every .html page in the project folder.
// lastmod comes from the date of the last Git commit that changed each page.
//
// Run:  node build-sitemap.mjs

import fs from "fs";
import { execSync } from "child_process";

const SITE = "https://dotravelling.com";

// Pages that must NOT be in the sitemap (add file names here)
const EXCLUDE = new Set(["404.html"]);

function lastmod(file) {
  try {
    const d = execSync(`git log -1 --format=%as -- "${file}"`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (d) return d;
  } catch {
    // not a Git repo, or Git is missing: fall through
  }
  // File not committed yet: use the date it was last saved
  return fs.statSync(file).mtime.toISOString().slice(0, 10);
}

const files = fs
  .readdirSync(".")
  .filter((f) => f.endsWith(".html"))
  .filter((f) => !EXCLUDE.has(f))
  .filter((f) => !/^google[a-z0-9]+\.html$/i.test(f)) // Search Console verification files
  .filter((f) => {
    const html = fs.readFileSync(f, "utf8");
    return !/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html); // skip noindex pages
  })
  .sort((a, b) => {
    if (a === "index.html") return -1; // home page first
    if (b === "index.html") return 1;
    return a.localeCompare(b);
  });

const urls = files.map((f) => {
  const loc = f === "index.html" ? `${SITE}/` : `${SITE}/${f}`;
  return `  <url><loc>${loc}</loc><lastmod>${lastmod(f)}</lastmod></url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

fs.writeFileSync("sitemap.xml", xml);

console.log(`sitemap.xml written with ${files.length} pages:`);
files.forEach((f) => console.log(`  ${f}`));
