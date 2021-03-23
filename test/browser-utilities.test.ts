/* Basic test for the browser utilities installed by src/init-browser-utilities.
 *
 * Note: bin/fetch-cookie-clicker-files.js must be run before running this test.
 */
/// <reference path="../src/browser-utilities.d.ts" />

import { firefox, Browser } from 'playwright';
import { CCPageOptions, openCookieClickerPage } from '../lib/cookie-clicker-page.js';

let browser: Browser;

beforeAll(async () => {
  browser = await firefox.launch();
});
afterAll(async () => {
  await browser.close();
});

test('The game always starts on 2020', async() => {
    let page = await openCookieClickerPage(browser);
    let now = await page.evaluate( () => Date.now() );
    expect(now).toBeGreaterThan(1.6e12);
    expect(now).toBeLessThan(1.6e12 + 1e4);

    await page.evaluate( () => { window.CConnoisseur.mockedDate = 1.7e12 } );
    now = await page.evaluate( () => Date.now() );
    expect(now).toBeGreaterThan(1.7e12);
    expect(now).toBeLessThan(1.7e12 + 2e4);
});
