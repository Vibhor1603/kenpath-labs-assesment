/**
 * Lite-safe celebration: a few CSS particles + short Web Audio pops.
 * Skips when calm / lite / reduced-motion. No large assets, no continuous rAF.
 */

const POP_COUNT_FULL = 18;
const POP_COUNT_LITE = 8;

export function shouldCelebrate(opts: {
  calm: boolean;
  lite: boolean;
}): boolean {
  if (opts.calm || opts.lite) return false;
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** One-shot pop tones via Web Audio (no sound file download). */
export function playPopBursts(count = 5): void {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = 520 + i * 90 + (i % 2) * 40;
      gain.gain.setValueAtTime(0.0001, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.14);
    }
    window.setTimeout(() => void ctx.close(), 800);
  } catch {
    // Audio may be blocked until a gesture; celebration still shows visually.
  }
}

/** Spawns a short-lived particle layer on `host`, then removes it. */
export function burstConfetti(host: HTMLElement, lite: boolean): void {
  const n = lite ? POP_COUNT_LITE : POP_COUNT_FULL;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.className = "ken-confetti";
  const colors = ["#C8963F", "#2C6680", "#386B43", "#A23A4D", "#E9A15B", "#F2D27A"];
  for (let i = 0; i < n; i++) {
    const bit = document.createElement("span");
    const x = 20 + ((i * 37) % 60);
    const delay = (i % 6) * 40;
    const dur = 700 + (i % 4) * 120;
    const rot = (i % 2 ? 1 : -1) * (120 + i * 17);
    bit.className = "ken-confetti-bit";
    bit.style.setProperty("--cx", `${x}%`);
    bit.style.setProperty("--delay", `${delay}ms`);
    bit.style.setProperty("--dur", `${dur}ms`);
    bit.style.setProperty("--rot", `${rot}deg`);
    bit.style.background = colors[i % colors.length];
    if (i % 3 === 0) bit.style.borderRadius = "50%";
    layer.appendChild(bit);
  }
  host.appendChild(layer);
  window.setTimeout(() => layer.remove(), 1600);
}
