/* Basic test for the browser utilities installed by src/init-browser-utilities.
 *
 * Note: bin/fetch-cookie-clicker-files.js must be run before running this test.
 */

/// <reference path="../src/browser-utilities.d.ts" />
import { CCPageOptions, openCookieClickerPage } from '../lib/cookie-clicker-page.js';
import { Browser } from 'playwright';

export const browserUtilitiesTest = (getBrowser: () => Browser) => {

let newPage = (options: CCPageOptions = {}) => openCookieClickerPage(getBrowser(), options);

test('The game always starts on 2020', async() => {
    let page = await newPage();
    let now = await page.evaluate( () => Date.now() );
    expect(now).toBeGreaterThan(1.6e12);
    expect(now).toBeLessThan(1.6e12 + 1e4);

    await page.evaluate( () => { window.CConnoisseur.mockedDate = 1.7e12 } );
    now = await page.evaluate( () => Date.now() );
    expect(now).toBeGreaterThan(1.7e12);
    expect(now).toBeLessThan(1.7e12 + 2e4);
    await page.close();
});

test('Overwritten Date class works properly', async() => {
    let page = await newPage();
    let now = await page.evaluate( () => (new Date()).getTime() );
    expect(now).toBeGreaterThan(1.6e12);
    expect(now).toBeLessThan(1.6e12 + 1e4);

    now = await page.evaluate( () => Date.parse(Date()) );
    expect(now).toBeGreaterThanOrEqual(1.6e12); // Date() returns the time only down to seconds
    expect(now).toBeLessThan(1.6e12 + 1e4);
    await page.close();
});

test('Seasons can be chosen via date mocking', async() => {
    let page = await newPage(); // No seasonal event on 2020-09-13 12:26:40
    let season = await page.evaluate('Game.baseSeason');
    expect(season).toEqual('');
    await page.close();

    page = await newPage({mockedDate: Date.UTC(2020, 9, 30, 12)});
    season = await page.evaluate('Game.baseSeason');
    expect(season).toEqual('halloween');
    await page.close();

    page = await newPage({mockedDate: Date.UTC(2020, 11, 25, 12)});
    season = await page.evaluate('Game.baseSeason');
    expect(season).toEqual('christmas');
    await page.close();

    page = await newPage({mockedDate: Date.UTC(2020, 1, 13, 12)});
    season = await page.evaluate('Game.baseSeason');
    expect(season).toEqual('valentines');
    await page.close();

    page = await newPage({mockedDate: Date.UTC(2020, 3, 1, 12)});
    season = await page.evaluate('Game.baseSeason');
    expect(season).toEqual('fools');
    await page.close();

    page = await newPage({mockedDate: Date.UTC(2020, 3, 11, 12)});
    season = await page.evaluate('Game.baseSeason');
    expect(season).toEqual('easter');
    await page.close();
});

}
