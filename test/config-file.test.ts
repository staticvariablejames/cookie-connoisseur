/* Simple test for the configuration file.
 */
import { test, expect } from '@playwright/test';

import { CCPageOptions, openCookieClickerPage } from '../src/index';
import { parseConfigFile } from '../src/parse-config';

const testURL = 'https://example.com/test.js'
const testSubdomainURL = 'https://example.org/subdomain/';

test('Configuration file is properly read', async () => {
    expect(await parseConfigFile()).toEqual({
        customURLs: {
            'https://example.org/fileWithSha1Sum.js': {sha1sum: 'test'},
            'https://example.org/fileWithoutSha1Sum.js': {},
        },
        localFiles: {
            [testURL]: {path: "test/test-file.js"},
        },
        localDirectories: {
             "https://example.org/subdomain/": {path: "./"},
        },
        verbose: 1,
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
