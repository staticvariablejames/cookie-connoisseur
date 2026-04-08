/* Basic test for openCookieClickerPage.
 *
 * The "saveGame" option is tested in `cookie-clicker-page-savegame.test.ts`.
 * The "forceDiscrepancy" option is tested in `discrepancy.test.ts`.
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
    expect(await page.evaluate(() => Game.heralds)).toEqual(17.29);
    expect(await page.evaluate(() => Game.customGrandmaNames[0])).toEqual("Custom grandma names");
    await page.close();
});

test('Heralds and grandma names can be set', async ({browser}) => {
    let page = await openCookieClickerPage(browser, {querySteamPlayers: 7200, queryGrandmaNames: ["Test1", "Test3"]});
    expect(await page.evaluate(() => Game.heralds)).toEqual(72);
    expect(await page.evaluate(() => Game.customGrandmaNames[0])).toEqual("Test1");
    expect(await page.evaluate(() => Game.customGrandmaNames[1])).toEqual("Test3");
    await page.close();
});

test.describe('Info query is properly set', () => {
    // TODO: also test the extraCss property
    test('to the default value', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        expect(await page.locator('id=topLink-4')).toBeVisible();
        expect(await page.evaluate(() => document.querySelector('#topbarOtherVersions .hoverable').childElementCount)).toBe(5);
    });

    test('to a custom empty value', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {queryInfo: {}});
        expect(await page.locator('id=topbarSteamCC')).toBeVisible();
        expect(await page.locator('id=topLink-0').count()).toBe(0);
        expect(await page.evaluate(() => document.querySelector('#topbarOtherVersions .hoverable').childElementCount)).toBe(4);
    });

    test('to a custom value with empty lists', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {queryInfo: {links: [], versions: []}});
        expect(await page.locator('id=topbarSteamCC')).toBeVisible();
        expect(await page.locator('id=topLink-0').count()).toBe(0);
        expect(await page.evaluate(() => document.querySelector('#topbarOtherVersions .hoverable').childElementCount)).toBe(0);
    });
});

test.describe('Version update check is properly intercepted', () => {
    test('if there is nothing to show', async ({browser}) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.warpTimeToFrame(Game.fps * 60 * 60 - 1));
        await page.waitForFunction(() => Game.T > Game.fps * 60 * 60);
        expect(await page.evaluate(() => document.getElementById("alert")?.style.display)).toEqual("");
        await page.close();
    });

    test('if there is a new version', async ({browser}) => {
        let page = await openCookieClickerPage(browser, {
            queryVersion: {
                "Cookie Clicker": {v: 2.71828, updateNotes: "Logarithms!"},
                "Cookie Clicker beta": {v: 2.71828, updateNotes: "Logarithms!"},
            },
        });

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
    let versionResponse = {
        "Cookie Clicker": {v: 2.027, updateNotes: "Old version"},
        "Cookie Clicker beta": {v: 2.027, updateNotes: "Old version"},
    };
    let page = await openCookieClickerPage(browser, {queryVersion: () => versionResponse});
    await page.evaluate(() => CConnoisseur.warpTimeToFrame(Game.fps * 60 * 60 - 1));
    await page.waitForFunction(() => Game.T > Game.fps * 60 * 60 + 1);
    // Nothing changes because it is an old version
    expect(await page.evaluate(() => document.getElementById("alert")?.style?.display)).toEqual("");

    versionResponse = {
        "Cookie Clicker": {v: 3.141592, updateNotes: "Circles!"},
        "Cookie Clicker beta": {v: 3.141592, updateNotes: "Circles!"},
    };
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

    test('can be explicitly null', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {language: null});
        await page.click('text=Deutsch');
        // This reloads the page, so wait till it says "Statistiken"
        await page.waitForSelector('text=Statistiken');
        await page.waitForFunction(() => {
            return typeof Game != 'undefined' && 'ready' in Game && Game.ready
        });
        let statsButton = await page.locator('#statsButton');
        let lang = await page.evaluate(() => window.localStorage.getItem('CookieClickerLang'));
        expect(await statsButton.innerText()).toEqual('Statistiken');
        expect(lang).toEqual('DE');
    });

    test('forces waitForMinigames to be ignored', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {
            language: null,
            saveGame: {
                buildings: {
                    'Bank': {
                        amount: 1,
                        level: 1,
                    },
                },
            },
        });
        await page.click('text=Polski');
        // This reloads the page, so wait till it says "Statystyki"
        await page.waitForSelector('text=Statystyki');
        await page.waitForFunction(() => {
            return typeof Game != 'undefined' && 'ready' in Game && Game.ready
        });
        let statsButton = await page.locator('#statsButton');
        let lang = await page.evaluate(() => window.localStorage.getItem('CookieClickerLang'));
        expect(await statsButton.innerText()).toEqual('Statystyki');
        expect(lang).toEqual('PL');
    });
});

test('Ads are blocked', async ({ browser }) => {
    let page = await openCookieClickerPage(browser);
    await page.waitForLoadState('networkidle'); // TODO: wait for img/bgBlue.jpg to load instead
    let shopHandle = await page.locator('id=sectionRight');
    expect(await shopHandle.screenshot()).toMatchSnapshot('rightSectionWithoutAds.png');
});
