import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    page.on("pageerror", (err) => {
      const msg = err.message;
      // Hydration mismatches from boot-script data-* attrs; still under fix.
      if (msg.includes("Minified React error #418")) return;
      if (msg.includes("Minified React error #423")) return;
      if (msg.includes("Hydration")) return;
      throw new Error(`pageerror: ${msg}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore known Next/React noise and missing static assets in preview
        if (text.includes("Download the React DevTools")) return;
        if (text.includes("hydration")) return;
        if (text.includes("Failed to load resource")) return;
        if (text.includes("favicon")) return;
        throw new Error(`console.error: ${text}`);
      }
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

export { expect };
