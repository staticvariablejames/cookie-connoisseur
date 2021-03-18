/* Basic test for openCookieClickerPage.
 *
 * Note: bin/fetch-cookie-clicker-files.js must be run before running this test.
 */

import { firefox, Browser } from 'playwright';
import { openCookieClickerPage } from '../lib/cookie-clicker-page.js';

let browser: Browser;

beforeAll(async () => {
  browser = await firefox.launch();
});
afterAll(async () => {
  await browser.close();
});

test('Page loads and game works', async () => {
    let page = await openCookieClickerPage(browser);
    expect(await page.evaluate('Game.cookies')).toEqual(0);
    await page.click('#bigCookie');
    expect(await page.evaluate('Game.cookies')).toEqual(1);
});
