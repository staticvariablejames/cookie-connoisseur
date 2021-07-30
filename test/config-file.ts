/* Simple test for the configuration file.
 */

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
    let test = await page.evaluate(() => (window.CConnoisseur as any).testWorks);
    expect(test).toBe(true);
    await page.close();
});

};
