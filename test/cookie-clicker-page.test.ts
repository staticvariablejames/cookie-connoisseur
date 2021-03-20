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

test('Heralds and grandma names work', async () => {
    let page = await openCookieClickerPage(browser);
    expect(await page.evaluate('Game.heralds')).toEqual(42);
    expect(await page.evaluate('Game.customGrandmaNames[0]')).toEqual("Custom grandma names");
    await page.close();

    page = await openCookieClickerPage(browser, {heralds: 72, grandmaNames: ["Test1", "Test3"]});
    expect(await page.evaluate('Game.heralds')).toEqual(72);
    expect(await page.evaluate('Game.customGrandmaNames[0]')).toEqual("Test1");
    expect(await page.evaluate('Game.customGrandmaNames[1]')).toEqual("Test3");
    await page.close();
});
