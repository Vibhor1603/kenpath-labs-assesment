import { test as base, expect, type Page } from "@playwright/test";
import { getDiscovery } from "../../src/content/index";
import type { DiscoveryId } from "../../src/content/types";
import { buildQuizAttempt } from "../../src/lib/shuffle";

export const test = base.extend({
  page: async ({ page }, use) => {
    page.on("pageerror", (err) => {
      throw new Error(`pageerror: ${err.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (text.includes("Download the React DevTools")) return;
      throw new Error(`console.error: ${text}`);
    });
    // Clear storage once before the first document loads, not on every navigation.
    await page.addInitScript(() => {
      try {
        const flag = "__kenpath_e2e_cleared__";
        if (!sessionStorage.getItem(flag)) {
          localStorage.clear();
          sessionStorage.clear();
          sessionStorage.setItem(flag, "1");
        }
      } catch {
        // ignore
      }
    });
    await use(page);
  },
});

export function correctAnswers(id: DiscoveryId, attempt: number): string[] {
  return buildQuizAttempt(getDiscovery(id)!, attempt).map((q) => q.options[q.answer]);
}

export function wrongAnswers(id: DiscoveryId, attempt: number): string[] {
  return buildQuizAttempt(getDiscovery(id)!, attempt).map(
    (q) => q.options[(q.answer + 1) % q.options.length],
  );
}

export async function answerAll(page: Page, picks: string[]) {
  for (let i = 0; i < picks.length; i++) {
    await page.getByRole("button", { name: picks[i], exact: true }).click();
    const last = i === picks.length - 1;
    await page
      .getByRole("button", { name: last ? "See result" : "Next", exact: true })
      .click();
  }
}

export async function readProgress(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("kenpath-museum-v2");
    return raw ? JSON.parse(raw) : null;
  });
}

export { expect };
