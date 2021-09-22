/* Basic test for openCookieClickerPage.
 *
 * The "saveGame" option is tested in `cookie-clicker-page-savegame.test.ts`.
 */
import { test, expect } from '@playwright/test';

import { CCPageOptions, openCookieClickerPage } from '../src/index';

test('Page loads and game works', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    expect(await page.evaluate(() => Game.cookies)).toEqual(0);
    await page.click('#bigCookie');
    expect(await page.evaluate(() => Game.cookies)).toEqual(1);
    await page.close();
});

test.describe('Heralds and grandma names can be set', () => {
    test('directly', async ({browser}) => {
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

    test('with functions', async ({browser}) => {
        let page = await openCookieClickerPage(browser, {
            heralds: () => 72,
            grandmaNames: () => ["Test1", "Test3"]
        });
        expect(await page.evaluate(() => Game.heralds)).toEqual(72);
        expect(await page.evaluate(() => Game.customGrandmaNames[0])).toEqual("Test1");
        expect(await page.evaluate(() => Game.customGrandmaNames[1])).toEqual("Test3");
        await page.close();
    });
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
});

test('Updates check can be changed dynamically', async ({browser}) => {
    let updatesResponse = '2.027|Old version';
    let page = await openCookieClickerPage(browser, {updatesResponse: () => updatesResponse});
    await page.evaluate(() => Game.T = Game.fps * 30 * 60 - 1);
    await page.waitForFunction(() => Game.T > Game.fps * 30 * 60 + 1);
    // Nothing changes because it is an old version
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("");
    updatesResponse = '3.141592|Circles!';
    await page.evaluate(() => Game.T = 2 * Game.fps * 30 * 60 - 1);
    await page.waitForFunction(() => Game.T > 2 * Game.fps * 30 * 60 + 1);
    // Now things change because it is a new version
    expect(await page.evaluate(() => document.getElementById("alert")?.innerText)).toEqual(
        expect.stringContaining('New version available')
    );
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("block");
    await page.close();
});
