#!/usr/bin/env node
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";

const gzipSize = async (buf) => {
  const chunks = [];
  const gzip = createGzip({ level: 9 });
  await pipeline(Readable.from(buf), gzip, async function* (source) {
    for await (const chunk of source) chunks.push(chunk);
  });
  return Buffer.concat(chunks).length;
};

const outDir = "out";
if (!existsSync(outDir)) {
  console.error("out/ missing. Run npm run build first.");
  process.exit(1);
}

const html = readFileSync(join(outDir, "index.html"), "utf8");
// noModule scripts are legacy polyfills that modern browsers never fetch.
const scriptSrcs = [...html.matchAll(/<script([^>]+)>/g)]
  .filter((m) => !/nomodule/i.test(m[1]))
  .map((m) => m[1].match(/src="([^"]+)"/)?.[1])
  .filter(Boolean);

let firstLoad = 0;
for (const src of scriptSrcs) {
  const path = join(outDir, src.replace(/^\//, ""));
  if (!existsSync(path)) continue;
  const size = await gzipSize(readFileSync(path));
  firstLoad += size;
  console.log(`  script ${src}: ${(size / 1024).toFixed(1)} KB gz`);
}

// Only preloaded faces are fetched on first paint; the other unicode-range
// subsets download only when a page actually uses those characters.
const referencedFonts = new Set(
  [
    ...html.matchAll(
      /<link[^>]+rel="preload"[^>]+href="[^"]*\/media\/([A-Za-z0-9._-]+\.woff2)"/g,
    ),
  ].map((m) => m[1]),
);

let fonts = 0;
const mediaDir = join(outDir, "_next/static/media");
if (existsSync(mediaDir)) {
  for (const name of referencedFonts) {
    const path = join(mediaDir, name);
    if (!existsSync(path)) continue;
    const size = statSync(path).size;
    fonts += size;
    console.log(`  font ${name}: ${(size / 1024).toFixed(1)} KB`);
  }
}

const okFirst = firstLoad <= 200 * 1024;
const okFonts = fonts <= 90 * 1024;
console.log(`\nFirst-load JS: ${(firstLoad / 1024).toFixed(1)} KB gz (budget 200)`);
console.log(`Fonts: ${(fonts / 1024).toFixed(1)} KB (budget 90)`);
console.log(okFirst && okFonts ? "PASS" : "FAIL");
process.exit(okFirst && okFonts ? 0 : 1);
