import { Browser, BrowserContextOptions, Route } from 'playwright';
import { existsSync } from 'fs';
import { cacheURLs } from './url-list.js';
import { isForbiddenURL, localPathOfURL } from './cookie-clicker-cache.js';
import { BrowserUtilitiesOptions, initBrowserUtilities } from './init-browser-utilities.js';
import { parseConfigFile } from './parse-config.js';

/* See the documentation of openCookieClickerPage below for a description of these options.
 * For convenience,
 * functions in this file pass around the entire `options` object to each other.
 */
export type CCPageOptions = {
    heralds?: number,
    grandmaNames?: string[],
    updatesResponse?: string,
    cookieConsent?: boolean,
    saveGame?: string,
    mockedDate?: number,
};

/* Helper function.
 * If the route queries for https://orteil.dashnet.org/patreon/grab.php,
 * this function fulfills the request with the format that the game expects
 * to configure the number of heralds and Patreon grandma names,
 * and returns true.
 * It returns false otherwise.
 */
async function handlePatreonGrabs(route: Route, options: CCPageOptions) {
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

    await route.fulfill({
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
async function handleUpdatesQuery(route: Route, options: CCPageOptions) {
    let url = route.request().url();
    if(!url.includes('https://orteil.dashnet.org/cookieclicker/server.php?q=checkupdate'))
        return false;

    let serverResponse = options.updatesResponse ?? '2.029|new stock market minigame!';
    await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: serverResponse,
    });
    return true;
}

/* Helper function.
 * Fulfills the given route using cached files.
 * `url` is the URL which will be queried for in the file system,
 * rather than route.request().url().
 */
async function handleCacheFile(route: Route, url: string) {
    let path = localPathOfURL(url);
    if(existsSync(path)) {
        let options: Parameters<Route["fulfill"]>[0] = {};
        options = {path};
        if('contentType' in cacheURLs[url]) {
            options.contentType = cacheURLs[url].contentType;
        }
        await route.fulfill(options);
    } else {
        console.log(`File ${path} not cached`);
        await route.continue();
    }
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
 *  saveGame <string>: String to be used as the stored save game.
 *  mockedDate <number>: Initial value of CConnoisseur.mockedDate; see browser-utilities.d.ts.
 */
export async function openCookieClickerPage(browser: Browser, options: CCPageOptions = {}) {
    let config = await parseConfigFile();
    let storageState: Exclude<BrowserContextOptions['storageState'], string> = {};

    if(options.cookieConsent !== false) {
        storageState.cookies = [{
            name: 'cookieconsent_dismissed',
            value: 'yes',
            url: 'https://orteil.dashnet.org/cookieclicker/',
        }];
    }

    if(options.saveGame) {
        storageState.origins = [{
            origin: 'https://orteil.dashnet.org/cookieclicker/',
            localStorage: [
                {name: 'CookieClickerGame', value: options.saveGame}
            ]
        }];
    }

    let context = await browser.newContext({storageState});

    let utilOptions: BrowserUtilitiesOptions = {};
    if(options.mockedDate) utilOptions.mockedDate = options.mockedDate;
    await context.addInitScript(initBrowserUtilities, utilOptions);

    let page = await context.newPage();
    await page.on('close', async () => await context.close() );

    await page.route('**/*', async route => {
        let url = route.request().url();
        /* For some reason, some URLs have a version attached at the end
         * (like 'main.js?v=2.089' instead of just 'main.js'),
         * even though accessing 'https://orteil.dashnet.org/cookieclicker/main.js'
         * yields the same page as 'main.js?v=2.089' and 'main.js?v=2.058'.
         * So we just strip that part out of the equation.
         */
        url = url.replace(/\?v=.*/, '').replace(/\?r=.*/, '');

        if(await handlePatreonGrabs(route, options))
            return;
        if(await handleUpdatesQuery(route, options))
            return;

        // Ignore ads
        if(isForbiddenURL(url)) {
            await route.abort('blockedbyclient');
        } else if(url in cacheURLs) {
            await handleCacheFile(route, url);
        } else if(url in config.customUrls) {
            if(config.customUrls[url].path) {
                await route.fulfill({path: config.customUrls[url].path});
            } else {
                await handleCacheFile(route, url);
            }
        } else {
            await route.continue();
        }
    });

    await page.goto('https://orteil.dashnet.org/cookieclicker/index.html');
    await page.waitForFunction( "Game != undefined && 'ready' in Game && Game.ready" );
    return page;
}
