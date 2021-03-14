import { Browser } from 'playwright';

export async function openCookieClickerPage(browser: Browser) {
    let page = await browser.newPage();
    await page.goto('https://orteil.dashnet.org/cookieclicker/');
    return page;
}
