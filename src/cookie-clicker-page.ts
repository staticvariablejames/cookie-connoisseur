import { Browser, Route } from 'playwright';
import { existsSync } from 'fs';
import { cacheURLs } from './url-list.js';
import { isForbiddenURL, localPathOfURL } from './cookie-clicker-cache.js';

/* See the documentation of openCookieClickerPage below for a description of these options.
 * For convenience,
 * functions in this file pass around the entire `options` object to each other.
 */
export type CCPageOptions = {
    heralds?: number,
    grandmaNames?: string[],
    updatesResponse?: string,
    cookieConsent?: boolean,
};

/* Helper function.
 * If the route queries for https://orteil.dashnet.org/patreon/grab.php,
 * this function fulfills the request with the format that the game expects
 * to configure the number of heralds and Patreon grandma names,
 * and returns true.
 * It returns false otherwise.
 */
function handlePatreonGrabs(route: Route, options: CCPageOptions) {
    if(!route.request().url().includes('https://orteil.dashnet.org/patreon/grab.php'))
        return false;

    let heralds = options.heralds ?? 42;
    let grandmaNamesList = options.grandmaNames ?? [
        "Custom grandma names",
        "See cookie-clicker-page.ts for details"
    ];
    let grandmaNames = grandmaNamesList.join('|');

    let response = JSON.stringify({
        herald: heralds,
        grandma: grandmaNames,
    });

    route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: response,
    });

    return true;
}

/* Helper function.
 * If the route queries for https://orteil.dashnet.org/cookieclicker/server.php?q=checkupdate,
 * this function fulfills the request with options.updatesResponse and returns true.
 * It returns false otherwise.
 */
function handleUpdatesQuery(route: Route, options: CCPageOptions) {
    let url = route.request().url();
    if(!url.includes('https://orteil.dashnet.org/cookieclicker/server.php?q=checkupdate'))
        return false;

    let serverResponse = options.updatesResponse ?? '2.029|new stock market minigame!';
    route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: serverResponse,
    });
    return true;
}

/* Uses the given browser to navigate to https://orteil.dashnet.org/cookieclicker/index.html
 * in a new page.
 * Routes that query orteil.dashnet.org will be redirected to use the local cache instead.
 *
 * The second argument is an object with the optional arguments.
 * Some options can be changed dynamically; to do so,
 * create a local object of type CCPageOptions and pass it to openCookieClickerPage.
 * That object will be queried whenever that option is relevant.
 *
 * Possible attributes of options:
 *  heralds <number>: Heralds and Patreon-submitted grandma names are obtained by querying
 *      https://orteil.dashnet.org/patreon/grab.php. Cookie Connoisseur intercepts this query;
 *      options.heralds is the number used in the response.
 *      This option can be changed dynamically.
 *  grandmaNames <string[]>: list of names that some grandmas get if "Custom grandmas" is "ON".
 *      Names must not contain the pipe (|) character.
 *      This option can be changed dynamically.
 *  updatesResponse <string>: Every 30 minutes Cookie Clicker checks for updates;
 *      this is the string fed to Game.CheckUpdatesResponse.
 *      The default value is '2.029|new stock market minigame!'.
 *      This option can be changed dynamically.
 *  cookieConsent <boolean>: Unless set to 'false',
 *      the page includes the browser cookie `cookieconsent_dismissed=yes`,
 *      which dismisses the cookie consent dialog.
 */
export async function openCookieClickerPage(browser: Browser, options: CCPageOptions = {}) {
    let context = await browser.newContext();

    if(options.cookieConsent !== false) {
        context.addCookies([{
            name: 'cookieconsent_dismissed',
            value: 'yes',
            url: 'https://orteil.dashnet.org/cookieclicker/',
        }]);
    }
    let page = await context.newPage();

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

        if(handlePatreonGrabs(route, options))
            return;
        if(handleUpdatesQuery(route, options))
            return;

        // Ignore ads/
        if(isForbiddenURL(url)) {
            route.abort('blockedbyclient');
        } else if(url in cacheURLs) {
            if(existsSync(path)) {
                let options: any = {path};
                if('contentType' in cacheURLs[url]) {
                    options.contentType = cacheURLs[url].contentType;
                }
                route.fulfill(options);
            } else {
                console.log(`File ${path} not cached`);
                route.continue();
            }
        } else {
            route.continue();
        }
    });

    await page.goto('https://orteil.dashnet.org/cookieclicker/index.html');
    await page.waitForFunction( "Game != undefined && 'ready' in Game && Game.ready" );
    return page;
}
