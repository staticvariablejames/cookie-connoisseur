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

test('Heralds and grandma names have defaults', async ({browser}) => {
    let page = await openCookieClickerPage(browser);
    expect(await page.evaluate(() => Game.heralds)).toEqual(42);
    expect(await page.evaluate(() => Game.customGrandmaNames[0])).toEqual("Custom grandma names");
    await page.close();
});

test.describe('Heralds and grandma names can be set', () => {
    test('directly', async ({browser}) => {
        let page = await openCookieClickerPage(browser, {heralds: 72, grandmaNames: ["Test1", "Test3"]});
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

test.describe('Updates check is properly intercepted', () => {
    test('if there is nothing to show', async ({browser}) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.warpTimeToFrame(Game.fps * 60 * 60 - 1));
        await page.waitForFunction(() => Game.T > Game.fps * 60 * 60);
        expect(await page.evaluate(() => document.getElementById("alert")?.style.display)).toEqual("");
        await page.close();
    });

    test('displaying an alert', async ({browser}) => {
        let page = await openCookieClickerPage(browser, {updatesResponse: 'alert|Hello!'});
        await page.evaluate(() => CConnoisseur.warpTimeToFrame(Game.fps * 60 * 60 - 1));
        await page.waitForFunction(() => Game.T > Game.fps * 60 * 60);
        expect(await page.evaluate(() => document.getElementById("alert")?.innerHTML)).toEqual("Hello!");
        expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("block");
        await page.close();
    });

    test('informing new version', async ({browser}) => {
        let page = await openCookieClickerPage(browser, {updatesResponse: '2.71828|Logarithms!'});
        await page.evaluate(() => CConnoisseur.warpTimeToFrame(Game.fps * 60 * 60 - 1));
        await page.waitForFunction(() => Game.T > Game.fps * 60 * 60);
        expect(await page.evaluate(() => document.getElementById("alert")?.innerText)).toEqual(
            expect.stringContaining('New version available')
        );
        expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("block");
        await page.close();
    });
});

test('Updates check can be changed dynamically', async ({browser}) => {
    let updatesResponse = '2.027|Old version';
    let page = await openCookieClickerPage(browser, {updatesResponse: () => updatesResponse});
    await page.evaluate(() => CConnoisseur.warpTimeToFrame(Game.fps * 60 * 60 - 1));
    await page.waitForFunction(() => Game.T > Game.fps * 60 * 60 + 1);
    // Nothing changes because it is an old version
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("");

    updatesResponse = '3.141592|Circles!';
    await page.evaluate(() => CConnoisseur.warpTimeToFrame(2 * Game.fps * 60 * 60 - 1));
    await page.waitForFunction(() => Game.T > 2 * Game.fps * 60 * 60 + 1);
    // Now things change because it is a new version
    expect(await page.evaluate(() => document.getElementById("alert")?.innerText)).toEqual(
        expect.stringContaining('New version available')
    );
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("block");

    await page.close();
});

test.describe('Waiting for minigames', () => {
    test('by default', async ({browser}) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            buildings: {
                'Farm': {
                    amount: 1,
                    level: 1,
                },
                'Bank': {
                    amount: 1,
                    level: 1,
                },
                'Temple': {
                    amount: 0, // Cookie Clicker loads minigames even without the purchasing,
                    level: 1, // as long as the level is >= 1.
                },
                'Wizard tower': {
                    amount: 0,
                    level: 1,
                },
            },
        }});
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Farm']))).toBeTruthy();
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Bank']))).toBeTruthy();
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Temple']))).toBeTruthy();
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Wizard tower']))).toBeTruthy();
    });

    test('unless there are no minigames', async ({browser}) => {
        let page = await openCookieClickerPage(browser, {
            waitForMinigames: true,
            saveGame: {
                buildings: {
                    'Grandma': { // Buildings without minigame should still load normally
                        amount: 1,
                        level: 1,
                    },
                    'Portal': {
                        amount: 0,
                        level: 1,
                    },
                },
            }
        });
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Farm']))).toBeFalsy();
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Bank']))).toBeFalsy();
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Temple']))).toBeFalsy();
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Wizard tower']))).toBeFalsy();
    });
});

test.describe('Language selection', () => {
    test('defaults to English', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        let statsButton = await page.locator('#statsButton');
        let lang = await page.evaluate(() => window.localStorage.getItem('CookieClickerLang'));
        expect(await statsButton.innerText()).toEqual('Stats');
        expect(lang).toEqual('EN');
    });

    test('can be set to French', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {language: 'FR'});
        let statsButton = await page.locator('#statsButton');
        let lang = await page.evaluate(() => window.localStorage.getItem('CookieClickerLang'));
        expect(await statsButton.innerText()).toEqual('Statistiques');
        expect(lang).toEqual('FR');
    });
});
