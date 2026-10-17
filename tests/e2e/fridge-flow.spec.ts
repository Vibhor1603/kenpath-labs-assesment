import { fridge } from "../../src/content/fridge";
import { expect, test } from "./fixtures";

test("fridge flow: lesson, perfect test, reward", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "How does a fridge stay cold?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start discovery" }).click();
  await expect(page).toHaveURL(/view=lesson&d=fridge/);

  for (let step = 1; step <= 6; step++) {
    await expect(page).toHaveURL(new RegExp(`step=${step}`));
    if (step < 6) {
      await page.getByRole("button", { name: "Next" }).click();
    }
  }

  await page.getByRole("button", { name: /Take the test/i }).click();
  await expect(page).toHaveURL(/view=test&d=fridge/);

  for (let i = 0; i < 5; i++) {
    const question = page.getByRole("heading", { level: 2 });
    await expect(question).toBeVisible();
    const qText = (await question.textContent()) ?? "";
    const original = fridge.quiz.find((q) => q.q === qText);
    expect(original).toBeTruthy();
    const correct = original!.options[original!.answer];
    await page.getByRole("button", { name: new RegExp(correct.slice(0, 24)) }).click();
    await page.getByRole("button", { name: "Next" }).click();
  }

  await expect(page).toHaveURL(/view=reward/);
  await expect(page.getByText(/You understand the refrigerator/i)).toBeVisible({
    timeout: 10_000,
  });

  // Dismiss badge dialogs if present
  for (let i = 0; i < 3; i++) {
    const great = page.getByRole("button", { name: "Great" });
    if (await great.isVisible().catch(() => false)) {
      await great.click();
      await page.waitForTimeout(200);
    }
  }

  await page.goto("/");
  await expect(page.getByText(/1 thing you understand/i)).toBeVisible();
  const stored = await page.evaluate(() => {
    const raw = localStorage.getItem("kenpath-museum-v1");
    return raw ? JSON.parse(raw) : null;
  });
  expect(stored?.points).toBe(120);
  expect(stored?.collected?.fridge).toBeTruthy();
});
