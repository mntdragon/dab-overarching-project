import { browser } from "k6/browser";

// 1. test configuration - ability to interact with the page using a browser
// 1 virtual user for 10 seconds using chromium browser
export const options = {
  scenarios: {
    client: {
      vus: 1,
      duration: "10s",
      executor: "constant-vus",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

// 2. concrete test -> execute -> close browser
export default async () => {
  // open up a browser tab
  const page = await browser.newPage();
  // navigate to a page
  await page.goto("https://www.aalto.fi/en");

  // in a finally block of a try statement to ensure that the browser tab is closed even if an error occurs during the test
  try {
    // concrete test steps
  } finally {
    // always close the page at the end
    await page.close();
  }
};