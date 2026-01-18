import { browser } from "k6/browser";

//  The test runs for 30 seconds with five virtual users — the address client:4321 is used, 
// as the test is run from within the Docker network.
export const options = {
  scenarios: {
    client: {
      vus: 5,
      duration: "30s",
      executor: "constant-vus",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

// opens up a browser tab, navigates to the page, 
// clicks the button four times, and checks that the items are added to the list
export default async () => {
  const page = await browser.newPage();
  await page.goto("http://client:4321/");

  try {
    for (let i = 1; i < 5; i++) {
      await page.locator('//button[text()="Add item"]').click();
      await page.locator(`//li[text()="Item ${i}"]`).isVisible();
    }
  } finally {
    await page.close();
  }
};