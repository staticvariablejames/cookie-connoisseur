/* Simple test for the configuration file.
 */
/// <reference path="../src/browser-utilities.d.ts" />
import { test, expect } from '@playwright/test';

import { CCPageOptions, openCookieClickerPage } from '../lib/cookie-clicker-page.js';
import { parseConfigFile } from '../lib/parse-config.js';

const testURL = 'https://example.com/test.js'
const testSubdomainURL = 'https://example.org/subdomain/';

test('Configuration file is properly read', async () => {
    expect(await parseConfigFile()).toEqual({
        customURLs: {},
        localFiles: {
            [testURL]: {path: "test/test-file.js"},
        },
        localDirectories: {
             "https://example.org/subdomain/": {path: "./"},
        },
    });
});

test('Configuration file affects the page', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    await page.evaluate(url => Game.LoadMod(url), testURL);
    await page.waitForFunction(() => 'testWorks' in window.CConnoisseur);
    expect(await page.evaluate(() => (window.CConnoisseur as any).testWorks)).toBe(true);
    await page.close();
});

test('Configuration file reroutes can be overriden', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    await page.route(testURL, route => {
        route.fulfill({
            contentType: 'application/javascript',
            body: "window.CConnoisseur.overridingWorks = true;"
        });
    });

    await page.evaluate(url => Game.LoadMod(url), testURL);
    await page.waitForFunction(() => 'overridingWorks' in window.CConnoisseur);
    expect(await page.evaluate(() => (window.CConnoisseur as any).overridingWorks)).toBe(true);
    expect(await page.evaluate(() => 'testWorks' in window.CConnoisseur)).toBe(false);
    await page.close();
});

test('Entire domains can be mapped to paths', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    await page.evaluate(url => Game.LoadMod(url), testSubdomainURL + 'test/test-file.js');
    await page.waitForFunction(() => 'testWorks' in window.CConnoisseur);
    expect(await page.evaluate(() => (window.CConnoisseur as any).testWorks)).toBe(true);
    await page.close();
});
