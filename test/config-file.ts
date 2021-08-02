/* Simple test for the configuration file.
 */
/// <reference path="../src/browser-utilities.d.ts" />

import { CCPageOptions, openCookieClickerPage } from '../lib/cookie-clicker-page.js';
import { parseConfigFile } from '../lib/parse-config.js';
import { Browser } from 'playwright';

export const configFileTest = (getBrowser: () => Browser) => {

let newPage = (options: CCPageOptions = {}) => openCookieClickerPage(getBrowser(), options);

test('Configuration file is properly read', async () => {
    expect(await parseConfigFile()).toEqual({
        customURLs: {
            'https://example.com/test.js': {path: "test/test-file.js"},
        }
    });
});

test('Configuration file affects the page', async () => {
    let page = await newPage();
    await page.evaluate(() => Game.LoadMod("https://example.com/test.js"));
    await page.waitForFunction(() => 'testWorks' in window.CConnoisseur);
    expect(await page.evaluate(() => (window.CConnoisseur as any).testWorks)).toBe(true);
    await page.close();
});

test('Configuration file reroutes can be overriden', async () => {
    let page = await newPage();
    await page.route("https://example.com/test.js", route => {
        route.fulfill({
            contentType: 'application/javascript',
            body: "window.CConnoisseur.overridingWorks = true;"
        });
    });

    await page.evaluate(() => Game.LoadMod("https://example.com/test.js"));
    await page.waitForFunction(() => 'overridingWorks' in window.CConnoisseur);
    expect(await page.evaluate(() => (window.CConnoisseur as any).overridingWorks)).toBe(true);
    expect(await page.evaluate(() => 'testWorks' in window.CConnoisseur)).toBe(false);
    await page.close();
});

};
