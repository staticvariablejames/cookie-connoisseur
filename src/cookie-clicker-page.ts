import { Browser } from 'playwright';
import { existsSync } from 'fs';
import { urlSet } from './url-list.js';
import { localPathOfURL } from './cookie-clicker-cache.js';

/* Uses the given browser to navigate to https://orteil.dashnet.org/cookieclicker/index.html
 * in a new page.
 * Routes that query orteil.dashnet.org will be redirected to use the local cache instead.
 */
export async function openCookieClickerPage(browser: Browser) {
    let page = await browser.newPage();

    await page.route('**/*', route => {
        let url = route.request().url();
        /* For some reason, some URLs have a version attached at the end
         * (like 'main.js?v=2.089' instead of just 'main.js'),
         * even though accessing 'https://orteil.dashnet.org/cookieclicker/main.js'
         * yields the same page as 'main.js?v=2.089' and 'main.js?v=2.058'.
         * So we just strip that part out of the equation.
         */
        url = url.replace(/\?v=.*/, '').replace(/\?r=.*/, '');
        let path = localPathOfURL(url);
        console.log(`Request for ${route.request().url()} (path is ${path})...`);

        if(urlSet.has(url)) {
            if(existsSync(path)) {
                route.fulfill({path});
            } else {
                console.log(`File ${path} not cached`);
            }
        } else {
            console.log(`Unknown file ${path}, won't use cache...`);
        }
    });

    await page.goto('https://orteil.dashnet.org/cookieclicker/index.html');
    return page;
}
