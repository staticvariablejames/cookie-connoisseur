/* Basic test for the browser utilities installed by src/browser-utilities.
 */

import { test, expect } from '@playwright/test';
import { CCPageOptions, CCSave, openCookieClickerPage } from '../src/index';

test('The game always starts on 2020', async({ browser }) => {
    let page = await openCookieClickerPage(browser);
    let now = await page.evaluate( () => Date.now() );
    expect(now).toBeGreaterThan(1.6e12);
    expect(now).toBeLessThan(1.6e12 + 1e4);

    await page.evaluate( () => { window.CConnoisseur.mockedDate = 1.7e12 } );
    now = await page.evaluate( () => Date.now() );
    expect(now).toBeGreaterThan(1.7e12);
    expect(now).toBeLessThan(1.7e12 + 2e4);
    await page.close();
});

test('Overwritten Date class works properly', async({ browser }) => {
    let page = await openCookieClickerPage(browser);
    let now = await page.evaluate( () => (new Date()).getTime() );
    expect(now).toBeGreaterThan(1.6e12);
    expect(now).toBeLessThan(1.6e12 + 1e4);

    now = await page.evaluate( () => Date.parse(Date()) );
    expect(now).toBeGreaterThanOrEqual(1.6e12); // Date() returns the time only down to seconds
    expect(now).toBeLessThan(1.6e12 + 1e4);
    await page.close();
});

test.describe('Date mocking can set the season', () => {
    test('(no season by default)', async ({ browser }) => {
        let page = await openCookieClickerPage(browser); // No seasonal event on 2020-09-13 12:26:40
        let season = await page.evaluate(() => Game.baseSeason);
        expect(season).toEqual('');
        await page.close();
    });

    test('to Halloween', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {mockedDate: Date.UTC(2020, 9, 30, 12)});
        let season = await page.evaluate(() => Game.baseSeason);
        expect(season).toEqual('halloween');
        await page.close();
    });

    test('to Christmas', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {mockedDate: Date.UTC(2020, 11, 25, 12)});
        let season = await page.evaluate(() => Game.baseSeason);
        expect(season).toEqual('christmas');
        await page.close();
    });

    test('to Valentines', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {mockedDate: Date.UTC(2020, 1, 13, 12)});
        let season = await page.evaluate(() => Game.baseSeason);
        expect(season).toEqual('valentines');
        await page.close();
    });

    test('to April fools', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {mockedDate: Date.UTC(2020, 3, 1, 12)});
        let season = await page.evaluate(() => Game.baseSeason);
        expect(season).toEqual('fools');
        await page.close();
    });

    test('to Easter', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {mockedDate: Date.UTC(2020, 3, 11, 12)});
        let season = await page.evaluate(() => Game.baseSeason);
        expect(season).toEqual('easter');
        await page.close();
    });
});

test('News ticker gets cleared', async ({ browser }) => {
    let page = await openCookieClickerPage(browser);
    await page.evaluate(() => window.CConnoisseur.clearNewsTickerText());
    let tickerText = await page.evaluate(() => Game.tickerL.innerText + Game.tickerBelowL.innerText);
    expect(tickerText.trim()).toEqual('');
    await page.close();
});

test('Range inputs get slided', async ({ browser }) => {
    let page = await openCookieClickerPage(browser);
    await page.click('text=Options');
    await page.$eval('text=Volume50% >> input', e => CConnoisseur.setSliderValue(e, 15));
    expect(await page.evaluate(() => Game.volume)).toEqual(15);
    await page.close();
});

test.describe('Lumps are gained', () => {
    test('in an empty save', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.gainLumps(1));
        expect(await page.evaluate(() => Game.lumps)).toEqual(1);
        expect(await page.evaluate(() => Game.cookiesEarned)).toEqual(1e9);
        expect(await page.evaluate(() => Game.canLumps())).toBe(true);
        await page.close();
    });

    test('if I have some cookies', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            cookiesEarned: 1e8,
        }});
        await page.evaluate(() => CConnoisseur.gainLumps(2));
        expect(await page.evaluate(() => Game.lumps)).toEqual(2);
        expect(await page.evaluate(() => Game.cookiesEarned)).toEqual(1e9);
        await page.close();
    });

    test('if I have plenty of cookies', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            cookiesEarned: 1e10,
        }});
        await page.evaluate(() => CConnoisseur.gainLumps(4));
        expect(await page.evaluate(() => Game.lumps)).toEqual(4);
        expect(await page.evaluate(() => Game.cookiesEarned)).toEqual(1e10);
        await page.close();
    });

    test('if I already have lumps', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            cookiesEarned: 1e10,
            lumps: 5,
            lumpsTotal: 6,
        }});
        await page.evaluate(() => CConnoisseur.gainLumps(10));
        expect(await page.evaluate(() => Game.lumps)).toEqual(15);
        expect(await page.evaluate(() => Game.lumpsTotal)).toEqual(16);
        expect(await page.evaluate(() => Game.cookiesEarned)).toEqual(1e10);
        await page.close();
    });

    test('and immediately allow leveling buildings up', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            buildings: {
                'Cursor': {
                    amount: 1,
                },
            },
        }});

        await page.evaluate(() => {CConnoisseur.gainLumps(1); Game.Objects['Cursor'].levelUp();});
        expect(await page.evaluate(() => Game.Objects['Cursor'].level)).toEqual(1);

        await page.close();
    });
});

test.describe('Time can be warped', () => {
    test('by advancing both Game.T and Date.now', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        let fps = await page.evaluate(() => Game.fps);
        await page.evaluate(t => CConnoisseur.warpTimeToFrame(t), 30 * fps);
        expect(await page.evaluate(() => Game.T)).toBeGreaterThanOrEqual(30 * fps);
        expect(await page.evaluate(() => Date.now())).toBeGreaterThanOrEqual(1.6e12 + 30000);
        await page.close();
    });

    test('triggering the check hook', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => Game.registerHook('check', () => {(window as any).test = true}));
        await page.evaluate(() => CConnoisseur.warpTimeToFrame(30 * Game.fps - 1));
        await page.waitForFunction(() => Game.T > 30 * Game.fps);
        expect(await page.evaluate(() => (window as any).test)).toBe(true);
        await page.close();
    });

    test('without triggering save games', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.warpTimeToFrame(60 * Game.fps - 1));
        await page.waitForFunction(() => Game.T > 60 * Game.fps);
        expect(await page.evaluate(() => localStorage.getItem('CookieClickerGame'))).toBeNull();
        await page.close();
    });
});

test.describe('Ascend, reincarnate:', () => {
    test('Ascends under normal conditions', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.ascend());
        await expect(await page.locator('#heavenlyUpgrade363')).toBeVisible();
        expect(await page.evaluate(() => Game.OnAscend)).toBeTruthy();
        await page.close();
    });

    test('Ascending twice does nothing', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.ascend());
        await page.evaluate(() => CConnoisseur.ascend());
        await expect(await page.locator('#heavenlyUpgrade363')).toBeVisible();
        expect(await page.evaluate(() => Game.OnAscend)).toBeTruthy();
        await page.close();
    });

    test('Autoascending while manually ascending does nothing', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.click('text=Legacy');
        await page.click('text=Yes!');
        await page.evaluate(() => CConnoisseur.ascend());
        expect(await page.evaluate(() => Game.AscendTimer)).toBeGreaterThan(0);
        expect(await page.evaluate(() => Game.OnAscend)).toBeFalsy();
        await page.close();
    });

    test('Reincarnates under normal conditions', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.ascend());
        await page.evaluate(() => CConnoisseur.reincarnate());
        await expect(await page.locator('#bigCookie')).toBeVisible();
        expect(await page.evaluate(() => Game.OnAscend)).toBeFalsy();
        await page.close();
    });

    test('Reincarnating twice does nothing', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.ascend());
        await page.evaluate(() => CConnoisseur.reincarnate());
        await page.evaluate(() => CConnoisseur.reincarnate());
        await expect(await page.locator('#bigCookie')).toBeVisible();
        expect(await page.evaluate(() => Game.OnAscend)).toBeFalsy();
        await page.close();
    });

    test('Reincarnating before ascending does nothing', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => Game.Earn(1));
        await page.evaluate(() => CConnoisseur.reincarnate());
        await expect(await page.locator('#bigCookie')).toBeVisible();
        expect(await page.evaluate(() => Game.AscendTimer)).toBe(0);
        expect(await page.evaluate(() => Game.OnAscend)).toBeFalsy();
        expect(await page.evaluate(() => Game.cookies)).toBe(1);
        await page.close();
    });
});

test.describe('The market redraws', () => {
    let saveGame = CCSave.fromObject({
        buildings: {
            "Bank": {
                amount: 156,
                level: 1,
            },
        },
    });

    test('the good panels', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame});
        let bankGoodPanel = await page.$('#bankGood-3');

        await page.evaluate(() => {
            Game.Objects['Bank'].minigame.goods['Bank'].val = 21.72;
            Game.Objects['Bank'].minigame.goods['Bank'].vals[0] = 21.72;
            Game.Objects['Bank'].minigame.goods['Bank'].vals[1] = 22.72;
            Game.Objects['Bank'].minigame.goods['Bank'].d = -0.75;
            Game.Objects['Bank'].minigame.goods['Bank'].stock = 86;
            CConnoisseur.redrawMarketMinigame();
        });

        expect(await bankGoodPanel!.screenshot()).toMatchSnapshot('redrawnBankPanel.png');
        await page.close();
    });

    test('the office status', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame});
        let officeName = await page.locator('#bankOfficeName');
        let firstLoan = await page.locator('#bankLoan1');

        await page.evaluate(() => {
            Game.Objects['Bank'].minigame.goods['Bank'].val = 21.72;
            Game.Objects['Bank'].minigame.goods['Bank'].vals[0] = 21.72;
            Game.Objects['Bank'].minigame.goods['Bank'].vals[1] = 22.72;
            Game.Objects['Bank'].minigame.goods['Bank'].d = -0.75;
            Game.Objects['Bank'].minigame.goods['Bank'].stock = 86;

            Game.Objects['Bank'].minigame.officeLevel = 2;
            CConnoisseur.redrawMarketMinigame();
        });
        expect(await officeName.innerText()).toEqual('Loaning company');
        await expect(firstLoan).toBeVisible();
        await page.close();
    });

    test("without crashing if there's no stock market", async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.redrawMarketMinigame());
        await page.pause();
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Bank']))).toBeFalsy();

        await page.evaluate(() => Game.Objects['Bank'].getFree(156));
        await page.evaluate(() => CConnoisseur.redrawMarketMinigame());
        expect(await page.evaluate(() => Game.isMinigameReady(Game.Objects['Bank']))).toBeFalsy();
        await page.close();
    });
});
