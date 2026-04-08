/* Tests the .forceDiscrepancy option for openCookieClickerPage.
 */

import { test, expect } from '@playwright/test';
import { openCookieClickerPage } from '../src/index';

test.describe('Discrepancy can be forced', () => {
    for(let forceDiscrepancy of [0, 1, 3, 617])
    for(let lumpCurrentType of ['normal', 'golden', 'meaty', 'caramelized'])
    for(let hasDragonsCurve of [false, true])
    for(let offlineDays of [1, 3]) {
        let testName = `to ${forceDiscrepancy} with ${lumpCurrentType} lump after ${offlineDays} days`;
        if(hasDragonsCurve) testName += " (with Dragon's Curve active)";
        test(testName, async ({browser}) => {
            let page = await openCookieClickerPage(browser, {
                forceDiscrepancy,
                saveGame: {
                    lumpCurrentType,
                    lumps: 5,
                    achievements: 'all',
                    dragonLevel: 20,
                    dragonAura: hasDragonsCurve ? 17 : 0,
                },
                mockedDate: 1.6e12 + 86400*1000 * offlineDays + 1,
            });
            let curveFactor = 1 + 0.05 * Number(hasDragonsCurve);
            let overripeAge = 23 * 3600*1000/curveFactor + 3600*1000;
            let expectedLumpT = 1.6e12 + overripeAge * offlineDays + forceDiscrepancy;
            let actualLumpT = await page.evaluate(() => Game.lumpT);
            expect(actualLumpT).toEqual(expectedLumpT);
            await page.close();
        });
    }
});
