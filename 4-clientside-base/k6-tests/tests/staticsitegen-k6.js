export default async () => {
  const page = await browser.newPage();
  await page.goto("http://localhost:8000/public/ssg.html");

  try {
    await page.locator(`//li[text()="Item 999"]`).isVisible();
  } finally {
    await page.close();
  }
};