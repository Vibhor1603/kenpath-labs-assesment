#!/usr/bin/env node
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
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
const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);

let firstLoad = 0;
for (const src of scriptSrcs) {
  const path = join(outDir, src.replace(/^\//, ""));
  if (!existsSync(path)) continue;
  const size = await gzipSize(readFileSync(path));
  firstLoad += size;
  console.log(`  script ${src}: ${(size / 1024).toFixed(1)} KB gz`);
}

// Collect every .woff2 path referenced from emitted CSS/HTML/JS.
const referencedFonts = new Set();
function scanFile(path) {
  const text = readFileSync(path, "utf8");
  for (const m of text.matchAll(/\/_next\/static\/media\/([A-Za-z0-9._-]+\.woff2)/g)) {
    referencedFonts.add(m[1]);
  }
  for (const m of text.matchAll(/url\(([^)]+\.woff2)\)/g)) {
    const name = m[1].replace(/["']/g, "").split("/").pop();
    if (name) referencedFonts.add(name);
  }
}

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(css|js|html)$/.test(f)) scanFile(p);
  }
}
walk(outDir);

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
if (!okFirst || !okFonts) {
  console.log(
    "\nNote: budgets are tracked in docs/DECISIONS.md if temporarily over.",
  );
}
process.exit(okFirst && okFonts ? 0 : 1);
