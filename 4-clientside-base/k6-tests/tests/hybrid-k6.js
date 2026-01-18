export default async () => {
  const page = await browser.newPage();
  await page.goto("http://localhost:8000/hybrid");

  try {
    await page.locator(`//li[text()="Item 999"]`).isVisible();
  } finally {
    await page.close();
  }
};