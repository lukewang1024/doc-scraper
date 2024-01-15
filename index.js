const { chromium } = require('playwright');

const urlsToCapture = [
  // Add urls to capture here
];
const viewportWidth = 790;
const viewportHeight = 1920;

function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

async function captureDocxPage(page, url) {
  await page.goto(url);
  await page.evaluate(() => {
    const selectorsToRemove = [
      '.navigation-bar-wrapper',
      '.catalogue-container',
      '.docx-comment__first-comment-btn',
      '.group-btns',
      '.ssrWaterMark',
    ];
    selectorsToRemove.forEach(selector => {
      document.querySelector(selector).remove();
    });
  });
  const urlObj = new URL(url);
  const token = urlObj.pathname.split('/').at(-1);
  let pageIndex = 0;
  let scrollTop = 0;
  while (true) {
    console.log(`Taking screenshot of ${token} page ${pageIndex}`);
    await page.screenshot({
      fullPage: true,
      path: `output/${token}-${pageIndex}.png`,
    });
    await page.mouse.wheel(0, viewportHeight);
    await sleep(1000);
    const newScrollTop = await page.evaluate(() => document.querySelector('.bear-web-x-container').scrollTop);
    if (scrollTop === newScrollTop) {
      console.log('Page bottom reached.');
      break;
    }
    pageIndex++;
    scrollTop = newScrollTop;
  }
}

(async () => {
  const browser = await chromium.launch({
    // headless: false,
  });
  const context = await browser.newContext({
    viewport: {
      width: viewportWidth,
      height: viewportHeight,
    },
  });
  const page = await context.newPage();
  for (const url of urlsToCapture) {
    await captureDocxPage(page, url);
  }
  // await sleep(60 * 1000);
  await context.close();
  await browser.close();
})();
