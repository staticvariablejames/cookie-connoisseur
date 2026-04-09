/* Tests the .forceDiscrepancy option for openCookieClickerPage,
 * and the CConnoisseur methods setupDiscrepancy and forceDateNowSpacing.
 */

import { test, expect } from '@playwright/test';
import { CCSave } from '../src/ccsave';
import { openCookieClickerPage } from '../src/index';

test.describe('CConnoisseur.forceDateNowSpacing works', () => {
    [ {testName: 'with a single zero',
       delays: [0]},
      {testName: 'with multiple zeros',
       delays: [0, 0, 0]},
      {testName: 'with a single non-zero delay',
       delays: [15]},
      {testName: 'with increasing delays',
       delays: [0, 2, 8, 25]},
      {testName: 'with a long delay at the end',
       delays: [0, 5, 617]},
    ].forEach(({testName, delays}) => {
        test(testName, async ({browser}) => {
            let page = await openCookieClickerPage(browser);
            let {actualDelays, firstNonForcedDelay} = await page.evaluate(delays => {
                let baseTimestamp = CConnoisseur.forceDateNowSpacing(delays);
                let actualDelays = [];
                for(let i = 0; i < delays.length; i++) {
                    actualDelays.push(Date.now() - baseTimestamp);
                }
                return {actualDelays, firstNonForcedDelay: Date.now() - baseTimestamp};
            }, delays);
            expect(actualDelays).toEqual(delays);
            expect(firstNonForcedDelay).toBeGreaterThanOrEqual(delays[delays.length-1]);
        });
    });
});

test.describe('Discrepancy can be forced', () => {
    for(let discrepancy of [0, 1, 3, 617])
    for(let lumpCurrentType of ['normal', 'golden', 'meaty', 'caramelized'])
    for(let hasDragonsCurve of [false, true])
    for(let offlineDays of [1, 3]) {
        let saveGame = CCSave.toNativeSave(CCSave.fromObject({
            lumpCurrentType,
            lumps: 5,
            achievements: 'all',
            dragonLevel: 20,
            dragonAura: hasDragonsCurve ? 17 : 0,
        }));
        let curveFactor = 1 + 0.05 * Number(hasDragonsCurve);
        let overripeAge = 23 * 3600*1000/curveFactor + 3600*1000;
        let expectedLumpT = 1.6e12 + overripeAge * offlineDays + discrepancy;


        let paramsDescription = '(' +
            'target discrepancy: ' + discrepancy + ', ' +
            'lump type: ' + lumpCurrentType + ', ' +
            'offline days: ' + offlineDays + ', ' +
            'dragon aura: ' + (hasDragonsCurve ? "Dragon's Curve" : 'none') +
        ')';

        test('via CCPageOptions.forceDiscrepancy ' + paramsDescription, async ({browser}) => {
            let page = await openCookieClickerPage(browser, {
                forceDiscrepancy: discrepancy,
                saveGame,
                mockedDate: 1.6e12 + 86400*1000 * offlineDays + 1,
            });
            let actualLumpT = await page.evaluate(() => Game.lumpT);
            expect(actualLumpT).toEqual(expectedLumpT);
            await page.close();
        });

        test('via CConnoisseur.setupDiscrepancy ' + paramsDescription, async ({browser}) => {
            let page = await openCookieClickerPage(browser, {
                mockedDate: 1.6e12 + 86400*1000 * offlineDays + 1,
            });
            await page.evaluate(({saveGame, discrepancy}) => {
                CConnoisseur.setupDiscrepancy(discrepancy);
                Game.LoadSave(saveGame);
            }, {saveGame, discrepancy});
            let actualLumpT = await page.evaluate(() => Game.lumpT);
            expect(actualLumpT).toEqual(expectedLumpT);
            await page.close();
        });
    }
});
