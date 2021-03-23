/* Basic test for the browser utilities installed by src/init-browser-utilities.
 *
 * Note: bin/fetch-cookie-clicker-files.js must be run before running this test.
 */

/// <reference path="../src/browser-utilities.d.ts" />
import { firefox, Browser } from 'playwright';
import { openCookieClickerPage } from '../lib/cookie-clicker-page.js';

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

test('Overwritten Date class works properly', async() => {
    let page = await openCookieClickerPage(browser);
    let now = await page.evaluate( () => (new Date()).getTime() );
    expect(now).toBeGreaterThan(1.6e12);
    expect(now).toBeLessThan(1.6e12 + 1e4);

    now = await page.evaluate( () => Date.parse(Date()) );
    expect(now).toBeGreaterThanOrEqual(1.6e12); // Date() returns the time only down to seconds
    expect(now).toBeLessThan(1.6e12 + 1e4);
});
