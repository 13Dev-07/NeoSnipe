import { chromium, type Page, type Browser } from 'playwright';
import { afterAll, beforeAll, beforeEach } from '@jest/globals';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await chromium.launch();
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
});

afterAll(async () => {
  await browser.close();
});