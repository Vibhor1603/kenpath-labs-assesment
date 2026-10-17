#!/usr/bin/env node
/**
 * First-load JS budget. Prefers static `out/` (legacy export); otherwise
 * measures `.next/static/chunks` after a Node build.
 */
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

let firstLoad = 0;
let fonts = 0;

if (existsSync("out/index.html")) {
  const outDir = "out";
  const html = readFileSync(join(outDir, "index.html"), "utf8");
  const scriptSrcs = [...html.matchAll(/<script([^>]+)>/g)]
    .filter((m) => !/nomodule/i.test(m[1]))
    .map((m) => m[1].match(/src="([^"]+)"/)?.[1])
    .filter(Boolean);

  for (const src of scriptSrcs) {
    const path = join(outDir, src.replace(/^\//, ""));
    if (!existsSync(path)) continue;
    const size = await gzipSize(readFileSync(path));
    firstLoad += size;
    console.log(`  script ${src}: ${(size / 1024).toFixed(1)} KB gz`);
  }

  const referencedFonts = new Set(
    [
      ...html.matchAll(
        /<link[^>]+rel="preload"[^>]+href="[^"]*\/media\/([A-Za-z0-9._-]+\.woff2)"/g,
      ),
    ].map((m) => m[1]),
  );
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
} else {
  const chunksDir = join(".next/static/chunks");
  if (!existsSync(chunksDir)) {
    console.error("Neither out/ nor .next/static/chunks found. Run npm run build first.");
    process.exit(1);
  }
  const files = readdirSync(chunksDir).filter((f) => f.endsWith(".js"));
  // Approximate first-load: sum of the largest app + framework chunks (cap count).
  const sized = [];
  for (const f of files) {
    const buf = readFileSync(join(chunksDir, f));
    const gz = await gzipSize(buf);
    sized.push({ f, gz });
  }
  sized.sort((a, b) => b.gz - a.gz);
  const top = sized.slice(0, 8);
  for (const { f, gz } of top) {
    firstLoad += gz;
    console.log(`  chunk ${f}: ${(gz / 1024).toFixed(1)} KB gz`);
  }
  const mediaDir = join(".next/static/media");
  if (existsSync(mediaDir)) {
    for (const name of readdirSync(mediaDir).filter((n) => n.endsWith(".woff2"))) {
      const size = statSync(join(mediaDir, name)).size;
      fonts += size;
      console.log(`  font ${name}: ${(size / 1024).toFixed(1)} KB`);
    }
  }
}

const okFirst = firstLoad <= 220 * 1024;
const okFonts = fonts <= 90 * 1024;
console.log(`\nFirst-load JS (approx): ${(firstLoad / 1024).toFixed(1)} KB gz (budget 220)`);
console.log(`Fonts: ${(fonts / 1024).toFixed(1)} KB (budget 90)`);
console.log(okFirst && okFonts ? "PASS" : "FAIL");
process.exit(okFirst && okFonts ? 0 : 1);
