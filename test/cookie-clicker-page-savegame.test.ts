/* Basic test for openCookieClickerPage.
 *
 * The "saveGame" option is tested in `ccpageoptions-savegame.test.ts`.
 */
import { test, expect } from '@playwright/test';

import { openCookieClickerPage } from '../src/cookie-clicker-page';

test.describe('Save games can be set', () => {
    test('by directly using a save string', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.click('#bigCookie');
        let save:string = await page.evaluate(() => Game.WriteSave(1));
        await page.close();

        page = await openCookieClickerPage(browser, {saveGame: save});
        expect(await page.evaluate(() => Game.cookies)).toEqual(1);
        await page.close();
    });

    test('by providing a JSON-like object', async ({ browser }) => {
        let page = await openCookieClickerPage(browser, {saveGame: {
            cookies: 1e15,
            cookiesEarned: 1e15,
            seed: "james",
            prefs: {
                crates: true,
            },
            buildings: {
                'Temple': {
                    amount: 1,
                    level: 1,
                    minigame: {
                        diamondSlot: 'order',
                    },
                },
            },
        }});

        await page.waitForFunction( () => Game.isMinigameReady(Game.Objects['Temple']) ); 

        expect(await page.evaluate( () => Game.cookies )).toBeGreaterThanOrEqual(1e15);
        expect(await page.evaluate( 'Boolean(Game.prefs.crates)' )).toBe(true);
        expect(await page.evaluate( () => Game.Objects['Temple'].amount )).toEqual(1);
        expect(await page.evaluate( () => Game.Objects['Temple'].level )).toEqual(1);
        expect(await page.evaluate( () => Game.Objects['Temple'].minigame.slot[0])).toEqual(10);

        await page.close();
    });
});
