import { test, expect } from '@playwright/test';
import { CCPageOptions, openCookieClickerPage } from '../src/index';

test('The encoding is set to UTF-8', async({ browser }) => {
    /* <https://orteil.dashnet.org/cookieclicker/index.html> does not define its encoding.
     * As a result,
     * some non-ASCII text is rendered garbled on Playwright.
     * For example, <q> elements use fancy quotation marks “like this”,
     * so missing the encoding render tooltips â€œlike thisâ€
     *
     * To not modify the HTML page,
     * we supply the encoding by specifying the contentType in url-list.ts.
     */
    let page = await openCookieClickerPage(browser, {saveGame: {
        buildings: {
            'Cursor': {
                amount: 1,
            },
        },
    }});

    await page.hover('#upgrade0');
    await page.evaluate(() => CConnoisseur.clearNewsTickerText());
    let tooltipHandle = await page.$('#tooltip')
    /* The fancy quotation marks are defined using the :before and :after CSS pseudo-elements,
     * so they don't appear in e.g. tooltip.textContent.
     * So we simply take a screenshot.
     */
    expect(await tooltipHandle!.screenshot()).toMatchSnapshot('upgrade-tooltip.png');
    
    await page.close();
});
