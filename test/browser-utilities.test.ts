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
        await page.waitForFunction(() => Game.isMinigameReady(Game.Objects['Bank']));
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
        await page.waitForFunction(() => Game.isMinigameReady(Game.Objects['Bank']));
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

test.describe('startGrandmapocalypse', () => {
    test('starts the grandmapocalypse', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.startGrandmapocalypse());
        expect(await page.evaluate(() => Game.elderWrath)).toEqual(1);
        await page.close();
    });

    test('changes nothing if the grandmapocalypse is already going', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            // Minimal Communal Brainsweep configuration
            "elderWrath": 2,
            "buildings": {
                "Grandma": {
                    "amount": 6,
                },
            },
            "ownedUpgrades": [
                "One mind",
                "Communal brainsweep",
            ],
            "unlockedUpgrades": [
                "Arcane sugar",
            ],
            "achievements": [
                "Elder",
            ],
        }});
        await page.evaluate(() => CConnoisseur.startGrandmapocalypse());
        expect(await page.evaluate(() => Game.elderWrath)).toEqual(2);
        await page.close();
    });

    test('restarts the grandmapocalypse if under Elder Pledge', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            "elderWrath": 0,
            "pledgeT": 54000,
            "buildings": {
                "Grandma": {
                    "amount": 6,
                },
            },
            "ownedUpgrades": [
                "One mind",
                "Communal brainsweep",
                "Elder Pact",
                "Elder Pledge",
            ],
            "unlockedUpgrades": [
                "Elder Covenant",
            ],
            "achievements": [
                "Elder",
            ],
        }});
        expect(await page.evaluate(() => Game.elderWrath)).toEqual(0);
        await page.evaluate(() => CConnoisseur.startGrandmapocalypse());

        /* there's a 0.1% chance that the Elder wrath increases each logic tick,
         * so we cannot compare elderWrath with 1.
         */
        expect(await page.evaluate(() => Game.elderWrath)).toBeGreaterThan(0);
        await page.close();
    });

    test('restarts the grandmapocalypse if under Elder Covenant', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            "elderWrath": 0,
            "buildings": {
                "Grandma": {
                    "amount": 6,
                },
            },
            "ownedUpgrades": [
                "One mind",
                "Communal brainsweep",
                "Elder Pact",
                "Elder Covenant"
            ],
            "unlockedUpgrades": [
                "Revoke Elder Covenant",
            ],
            "achievements": [
                "Elder",
            ],
        }});
        expect(await page.evaluate(() => Game.elderWrath)).toEqual(0);
        await page.evaluate(() => CConnoisseur.startGrandmapocalypse());
        expect(await page.evaluate(() => Game.elderWrath)).toBeGreaterThan(0);
        await page.close();
    });
});

test.describe('Reindeer can be force-spawned', () => {
    /* TODO: remove the "null as any" arguments to Game.shimmers.prototype.pop
     * once the typings are fixed in @types/cookieclicker
     */
    test('during Christmas', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {mockedDate: Date.UTC(2020, 11, 25)});
        expect(await page.evaluate(() => Game.season)).toEqual('christmas');
        await page.evaluate(() => CConnoisseur.spawnReindeer());
        expect(await page.evaluate(() => Game.shimmers.length)).toEqual(1);
        expect(await page.evaluate(() => Game.shimmers[0].type)).toEqual('reindeer');
        await page.close();
    });

    test('outside Christmas', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        expect(await page.evaluate(() => Game.season)).not.toEqual('christmas');
        await page.evaluate(() => CConnoisseur.spawnReindeer());
        expect(await page.evaluate(() => Game.shimmers.length)).toEqual(1);
        expect(await page.evaluate(() => Game.shimmers[0].type)).toEqual('reindeer');
        await page.close();
    });

    test('and immediately popped afterwards', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.spawnReindeer().pop(null as any));
        expect(await page.evaluate(() => Game.shimmers.length)).toEqual(0);
        expect(await page.evaluate(() => Game.cookies)).toEqual(25);
        await page.close();
    });

    test('being spawn leads by default', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);

        await page.evaluate(() => CConnoisseur.spawnReindeer().pop(null as any));
        expect(await page.evaluate(() => Game.reindeerClicked)).toEqual(1);

        await page.evaluate(() => CConnoisseur.spawnReindeer(false).pop(null as any));
        expect(await page.evaluate(() => Game.reindeerClicked)).toEqual(1);

        await page.evaluate(() => CConnoisseur.spawnReindeer(true).pop(null as any));
        expect(await page.evaluate(() => Game.reindeerClicked)).toEqual(2);
        await page.close();
    });
});

test.describe('Making wrinklers forcefully', () => {
    test('pop works', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            elderWrath: 1,
            wrinklers: {
                number: 2, // Two wrinklers
                amount: 2, // One cookie inside each wrinkler
            },
            buildings: {
                Grandma: {
                    amount: 1,
                },
            },
            ownedUpgrades: [
                "One mind",
            ],
            unlockedUpgrades: [
                "Exotic nuts",
            ],
        }});

        expect(await page.evaluate(() => Game.wrinklers[0].phase)).toEqual(2);
        expect(await page.evaluate(() => Game.wrinklers[1].phase)).toEqual(2);

        expect(await page.evaluate(() => CConnoisseur.popWrinkler(0))).toBe(true);
        expect(await page.evaluate(() => Game.wrinklers[0].phase)).toEqual(0);
        expect(await page.evaluate(() => Game.wrinklersPopped)).toEqual(1);

        expect(await page.evaluate(() => CConnoisseur.popWrinkler(1))).toBe(true);
        expect(await page.evaluate(() => Game.wrinklers[1].phase)).toEqual(0);
        expect(await page.evaluate(() => Game.wrinklersPopped)).toEqual(2);

        expect(await page.evaluate(() => CConnoisseur.popWrinkler(2))).toBe(false);
        expect(await page.evaluate(() => Game.wrinklersPopped)).toEqual(2);
        await page.close();
    });

    test('pop fails if wrong wrinkler', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.startGrandmapocalypse());
        expect(await page.evaluate(() => CConnoisseur.popWrinkler(0))).toBe(false);
        expect(await page.evaluate(() => CConnoisseur.popWrinkler(-1))).toBe(false);
        expect(await page.evaluate(() => CConnoisseur.popWrinkler(13))).toBe(false);
        await page.close();
    });

    test('spawn works in the grandmapocalypse', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate(() => CConnoisseur.startGrandmapocalypse());
        let wrinklerId: number = await page.evaluate(() => CConnoisseur.spawnWrinkler());
        expect(wrinklerId).not.toBe(-1);

        expect(await page.evaluate(id => Game.wrinklers[id].phase, wrinklerId)).toEqual(2);
        expect(await page.evaluate(id => CConnoisseur.popWrinkler(id), wrinklerId)).toBe(true);
        expect(await page.evaluate(() => Game.wrinklersPopped)).toEqual(1);

        wrinklerId = await page.evaluate(() => CConnoisseur.spawnWrinkler(5));
        expect(wrinklerId).toBe(5);
        await page.close();
    });

    test('spawn fails outside the grandmapocalypse', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        let wrinklerId: number = await page.evaluate(() => CConnoisseur.spawnWrinkler());
        expect(wrinklerId).toBe(-1);
        await page.close();
    });

    test('spawn fails if too many wrinklers exist', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            elderWrath: 1,
            wrinklers: {
                number: 10,
                amount: 10,
            },
            buildings: {
                Grandma: {
                    amount: 1,
                },
            },
            ownedUpgrades: [
                "One mind",
            ],
            unlockedUpgrades: [
                "Exotic nuts",
            ],
        }});
        let wrinklerId: number = await page.evaluate(() => CConnoisseur.spawnWrinkler());
        expect(wrinklerId).toBe(-1);
        await page.close();
    });
});
