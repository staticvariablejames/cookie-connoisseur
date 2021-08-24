/* Basic test for openCookieClickerPage.
 *
 * Note: bin/fetch-cookie-clicker-files.js must be run before running this test.
 */
import { test, expect } from '@playwright/test';

import { CCPageOptions, openCookieClickerPage } from '../src/cookie-clicker-page';

test('Page loads and game works', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    expect(await page.evaluate(() => Game.cookies)).toEqual(0);
    await page.click('#bigCookie');
    expect(await page.evaluate(() => Game.cookies)).toEqual(1);
    await page.close();
});

test('Heralds and grandma names work', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    expect(await page.evaluate(() => Game.heralds)).toEqual(42);
    expect(await page.evaluate(() => Game.customGrandmaNames[0])).toEqual("Custom grandma names");
    await page.close();

    page = await openCookieClickerPage(browser, {heralds: 72, grandmaNames: ["Test1", "Test3"]});
    expect(await page.evaluate(() => Game.heralds)).toEqual(72);
    expect(await page.evaluate(() => Game.customGrandmaNames[0])).toEqual("Test1");
    expect(await page.evaluate(() => Game.customGrandmaNames[1])).toEqual("Test3");
    await page.close();
});

test('Updates check is properly intercepted', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    await page.evaluate(() => Game.T = Game.fps * 30 * 60 - 1);
    await page.waitForFunction(() => Game.T > Game.fps * 30 * 60 + 1);
    expect(await page.evaluate(() => document.getElementById("alert")?.style.display)).toEqual("");
    await page.close();

    page = await openCookieClickerPage(browser, {updatesResponse: 'alert|Hello!'});
    await page.evaluate(() => Game.T = Game.fps * 30 * 60 - 1);
    await page.waitForFunction(() => Game.T > Game.fps * 30 * 60 + 1);
    expect(await page.evaluate(() => document.getElementById("alert")?.innerHTML)).toEqual("Hello!");
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("block");
    await page.close();

    page = await openCookieClickerPage(browser, {updatesResponse: '2.71828|Logarithms!'});
    await page.evaluate(() => Game.T = Game.fps * 30 * 60 - 1);
    await page.waitForFunction(() => Game.T > Game.fps * 30 * 60 + 1);
    expect(await page.evaluate(() => document.getElementById("alert")?.innerText)).toEqual(
        expect.stringContaining('New version available')
    );
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("block");
    await page.close();

    // Chceck changing the options object works
    let options: CCPageOptions = {};
    page = await openCookieClickerPage(browser, options);
    await page.evaluate(() => Game.T = Game.fps * 30 * 60 - 1);
    await page.waitForFunction(() => Game.T > Game.fps * 30 * 60 + 1);
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("");
    options.updatesResponse = '2.71828|Logarithms!';
    await page.evaluate(() => Game.T = 2 * Game.fps * 30 * 60 - 1);
    await page.waitForFunction(() => Game.T > 2 * Game.fps * 30 * 60 + 1);
    expect(await page.evaluate(() => document.getElementById("alert")?.innerText)).toEqual(
        expect.stringContaining('New version available')
    );
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("block");
    await page.close();
});

test('Save games can be set', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    await page.click('#bigCookie');
    let save:string = await page.evaluate(() => Game.WriteSave(1));
    await page.close();

    page = await openCookieClickerPage(browser, {saveGame: save});
    expect(await page.evaluate(() => Game.cookies)).toEqual(1);
    await page.close();
});
