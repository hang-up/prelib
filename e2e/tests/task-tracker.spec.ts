import { expect, test } from "@playwright/test";

test("seeded login and core task management happy path", async ({ page }) => {
  const taskTitle = `Playwright task ${Date.now()}`;
  const taskDescription = "Created by the Playwright happy-path coverage.";

  await page.goto("/tasks");
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Username").fill("alice");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/tasks/);
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

  await page.getByLabel("Title").fill(taskTitle);
  await page.getByLabel("Description").fill(taskDescription);
  await page.getByRole("button", { name: "Create task" }).click();

  const createdTask = page.locator("li.task-item", { hasText: taskTitle });
  await expect(createdTask).toBeVisible();
  await expect(createdTask).toContainText("Owner:");
  await expect(createdTask).toContainText("alice");
  await expect(createdTask).toContainText("Todo");

  await createdTask.getByLabel("Quick status").selectOption("done");
  await expect(createdTask).toContainText("Done");
});
