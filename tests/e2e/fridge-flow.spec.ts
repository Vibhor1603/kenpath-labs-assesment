import { answerAll, correctAnswers, expect, readProgress, test } from "./fixtures";

test("fridge: lesson, perfect test, reward, badges, home", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "How does a fridge stay cold?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start discovery", exact: true }).click();
  await expect(page).toHaveURL(/view=lesson&d=fridge&step=1/);

  for (let step = 2; step <= 6; step++) {
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`step=${step}`));
  }

  await page.getByRole("button", { name: "Take the test" }).click();
  await expect(page).toHaveURL(/view=test&d=fridge/);
  await answerAll(page, correctAnswers("fridge", 1));

  await expect(page).toHaveURL(/view=reward&d=fridge/);
  await expect(page.getByText(/You understand the refrigerator/i)).toBeVisible();

  const earned: string[] = [];
  const nice = page.getByRole("button", { name: "Nice" });
  await expect(nice).toBeVisible({ timeout: 10_000 });
  while (await nice.isVisible()) {
    earned.push(
      (await page.getByRole("dialog").getByRole("heading").first().textContent()) ?? "",
    );
    await nice.click();
    await page.waitForTimeout(450);
  }
  expect(earned.join(" ")).toContain("First Discovery");
  expect(earned.join(" ")).toContain("Perfect Scholar");

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).not.toHaveURL(/view=/);
  await expect(page.getByText("1 of 3 understood")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Watch it again", exact: true }),
  ).toBeVisible();

  const stored = await readProgress(page);
  expect(stored?.points).toBe(120);
  expect(stored?.collected?.fridge).toBeTruthy();
  expect(stored?.badges.map((b: { id: string }) => b.id)).toEqual(
    expect.arrayContaining(["first-discovery", "perfect-scholar"]),
  );

  await page.reload();
  await expect(page.getByText("1 of 3 understood")).toBeVisible();
});
