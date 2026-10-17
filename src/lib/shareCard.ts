import type { Discovery } from "@/content/types";

export const SHARE_SITE = "kenpath-labs.vercel.app";

export function learntLine(discovery: Discovery): string {
  const topic = discovery.shortName.toLowerCase();
  return `I learnt about the ${topic} today`;
}

/**
 * Draws a square share card (1080) as a PNG blob. No extra libraries.
 */
export async function renderShareCardPng(opts: {
  displayName: string;
  discovery: Discovery;
  score: number;
  dark?: boolean;
}): Promise<Blob> {
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  const bg = opts.dark ? "#121212" : "#F3F0EA";
  const surface = opts.dark ? "#1C1C1C" : "#FFFDF8";
  const ink = opts.dark ? "#F2F2F2" : "#17181C";
  const soft = opts.dark ? "#A3A3A3" : "#575C66";
  const brass = "#B5832F";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Card panel
  roundRect(ctx, 64, 64, size - 128, size - 128, 48);
  ctx.fillStyle = surface;
  ctx.fill();

  // Brand
  ctx.fillStyle = brass;
  ctx.font = "600 36px system-ui, sans-serif";
  ctx.fillText("Ken", 110, 150);
  ctx.fillStyle = soft;
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("Become smarter every day", 110, 190);

  // Avatar circle
  const initial = (opts.displayName.trim()[0] || "K").toUpperCase();
  ctx.beginPath();
  ctx.arc(160, 300, 52, 0, Math.PI * 2);
  ctx.fillStyle = brass;
  ctx.fill();
  ctx.fillStyle = "#FFFDF8";
  ctx.font = "700 40px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial, 160, 302);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = ink;
  ctx.font = "600 40px system-ui, sans-serif";
  ctx.fillText(opts.displayName, 240, 290);
  ctx.fillStyle = soft;
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText("Ken learner", 240, 330);

  // Achievement line
  const line = learntLine(opts.discovery);
  ctx.fillStyle = ink;
  ctx.font = "600 52px system-ui, sans-serif";
  wrapText(ctx, line, 110, 460, size - 220, 64);

  // Topic chip
  ctx.fillStyle = soft;
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText(opts.discovery.catalogNo, 110, 640);
  ctx.fillStyle = ink;
  ctx.font = "600 36px system-ui, sans-serif";
  ctx.fillText(opts.discovery.title, 110, 690);

  // Score fires
  const safe = Math.max(0, Math.min(5, opts.score));
  ctx.font = "48px system-ui, sans-serif";
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = i < safe ? 1 : 0.25;
    ctx.fillText("🔥", 110 + i * 70, 800);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = soft;
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText(`${safe} of 5 on the test`, 110, 860);

  // Subtle site brand
  ctx.fillStyle = soft;
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText(SHARE_SITE, 110, 960);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG failed"))),
      "image/png",
      0.92,
    );
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}
