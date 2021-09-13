import { Browser, BrowserContextOptions, Route } from 'playwright';
import { existsSync } from 'fs';
import { cacheURLs } from './url-list';
import { isForbiddenURL, localPathOfURL, normalizeURL, makeDownloadingListener } from './local-cc-instance';
import { BrowserUtilitiesOptions, initBrowserUtilities } from './init-browser-utilities';
import { parseConfigFile, CookieConnoisseurConfig } from './parse-config';
import { CCSave } from './ccsave';

/* See the documentation of openCookieClickerPage below for a description of these options.
 * For convenience,
 * functions in this file pass around the entire `options` object to each other.
 */
export type CCPageOptions = {
    heralds?: number | (() => number),
    grandmaNames?: string[] | (() => string[]),
    updatesResponse?: string | (() => string),
    cookieConsent?: boolean,
    saveGame?: string | object,
    mockedDate?: number,
};

/* The first three options may be requested multiple times,
 * and their values can change each time.
 * Therefore they may be functions.
 *
 * The following utility functions return the value of the option,
 * regardless of the type,
 * or their default value if they don't exist.
 *
 * For uniformity, there are helper functions for all options.
 */
function getHeralds(options: CCPageOptions) {
    if(typeof options.heralds == 'number') {
        return options.heralds;
    } else if (typeof options.heralds == 'function') {
        return options.heralds();
    } else {
        return 42;
    }
}

function getGrandmaNames(options: CCPageOptions) {
    if(Array.isArray(options.grandmaNames)) {
        return options.grandmaNames;
    } else if (typeof options.grandmaNames == 'function') {
        return options.grandmaNames();
    } else {
        return [
            "Custom grandma names",
            "See cookie-clicker-page.ts for details"
        ];
    }
}

function getUpdatesResponse(options: CCPageOptions) {
    if(typeof options.updatesResponse == 'string') {
        return options.updatesResponse;
    } else if (typeof options.updatesResponse == 'function') {
        return options.updatesResponse();
    } else {
        return '2.029|new stock market minigame!';
    }
}

function getCookieConsent(options: CCPageOptions) {
    if(typeof options.cookieConsent == 'boolean') {
        return options.cookieConsent;
    } else {
        return true;
    }
}

// We'll handle the conversion through CCSave right here.
function getSaveGame(options: CCPageOptions) {
    if(typeof options.saveGame == 'string') {
        return options.saveGame;
    } else if(typeof options.saveGame == 'object') {
        return CCSave.toStringSave(CCSave.fromObject(options.saveGame));
    } else {
        return '';
    }
}

function getMockedDate(options: CCPageOptions) {
    if(typeof options.mockedDate == 'number') {
        return options.mockedDate;
    } else {
        return 1.6e12; // 2020-09-13 12:26:40 UTC
    }
}
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

    let response = JSON.stringify({
        herald: getHeralds(options),
        grandma: getGrandmaNames(options).join('|'),
    });

    await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: response,
    }).catch(reason => {
        if(process.env.DEBUG)
            console.log(`Couldn't deliver Herald count and Grandma names: ${reason}`);
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

    await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: getUpdatesResponse(options),
    }).catch(reason => {
        if(process.env.DEBUG)
            console.log(`Couldn't deliver answer to updates query: ${reason}`);
    });
    return true;
}

/* Helper function.
 * If the route queries a URL that is cached by Cookie Connoisseur by default,
 * this function fulfills the request with the appropriate file and returns true.
 * If the file is not cached, it installs a self-deregistering listener
 * to download the file and simply `continue()`s the route instead.
 *
 * It returns false if the URL is not cached by Cookie Connoisseur.
 */
async function handleCacheFile(route: Route) {
    let url = normalizeURL(route.request().url());
    if(!(url in cacheURLs))
        return false;

    let path = localPathOfURL(url);
    if(existsSync(path)) {
        let options: Parameters<Route["fulfill"]>[0] = {};
        options = {path};
        if('contentType' in cacheURLs[url]) {
            options.contentType = cacheURLs[url].contentType;
        }
        await route.fulfill(options).catch(reason => {
            if(process.env.DEBUG)
                console.log(`Couldn't deliver cached page ${url}: ${reason}`);
        });
    } else {
        console.log(`Downloading file ${path}...`);
        route.request().frame().page().on('response', makeDownloadingListener(url));
        await route.continue();
    }
    return true;
}

/* Helper function.
 * Similar to handleCacheFile, but for customURLs instead.
 */
async function handleCustomURL(route: Route, config: CookieConnoisseurConfig) {
    let url = normalizeURL(route.request().url());
    if(!(url in config.customURLs))
        return false;

    let path = localPathOfURL(url);
    if(existsSync(path)) {
        await route.fulfill({path}).catch(reason => {
            if(process.env.DEBUG)
                console.log(`Couldn't deliver custom URL ${url}: ${reason}`);
        });
    } else {
        console.log(`Downloading file ${path}...`);
        route.request().frame().page().on('response', makeDownloadingListener(url));
        await route.continue();
    }

    return true;
}

/* Helper function.
 * Similar to handleCacheFile, but for local files instead,
 * except it does not try to download the file if it is not cached.
 */
async function handleLocalFile(route: Route, config: CookieConnoisseurConfig) {
    let url = normalizeURL(route.request().url());
    if(!(url in config.localFiles))
        return false;

    let options = {path: config.localFiles[url].path};

    if(existsSync(options.path)) {
        await route.fulfill(options).catch(reason => {
            if(process.env.DEBUG)
                console.log(`Couldn't deliver local page ${url}: ${reason}`);
        });
    } else {
        console.log(`File ${options.path} not found`);
        await route.continue();
    }

    return true;
}

/* Helper function.
 * Similar to handleLocalFile, but for local directory reroutes instead.
 */
async function handleLocalDirectory(route: Route, config: CookieConnoisseurConfig) {
    let url = normalizeURL(route.request().url());
    for(let urlPrefix in config.localDirectories) {
        if(url.startsWith(urlPrefix)) { // Found matching prefix!
            let directoryPath = config.localDirectories[urlPrefix].path;
            let filePath = directoryPath + "/" + url.substr(urlPrefix.length);
            if(existsSync(filePath)) {
                await route.fulfill({path: filePath}).catch(reason => {
                    if(process.env.DEBUG)
                        console.log(`Couldn't deliver local page ${url}: ${reason}`);
                });
            } else {
                console.log(`File ${filePath} not found in directory ${directoryPath}`);
                await route.continue();
            }
            return true;
        }
    }
    return false; // No matching prefix found
}

/* Helper function.
 * If the requested URL is a forbidden URL, the route is aborted and the function returns true.
 * It returns false otherwise.
 */
async function handleForbiddenURLs(route: Route) {
    let url = route.request().url(); // No need for normalization
    if(!isForbiddenURL(url))
        return false;

    await route.abort('blockedbyclient');
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
 *  saveGame <string>: String to be used as the stored save game.
 *  mockedDate <number>: Initial value of CConnoisseur.mockedDate; see browser-utilities.d.ts.
 */
export async function openCookieClickerPage(browser: Browser, options: CCPageOptions = {}) {
    let config = await parseConfigFile();
    let storageState: Exclude<BrowserContextOptions['storageState'], string> = {};

    if(getCookieConsent(options)) {
        storageState.cookies = [{
            name: 'cookieconsent_dismissed',
            value: 'yes',
            url: 'https://orteil.dashnet.org/cookieclicker/',
        }];
    }

    storageState.origins = [{
        origin: 'https://orteil.dashnet.org/cookieclicker/',
        localStorage: [
            {name: 'CookieClickerGame', value: getSaveGame(options)}
        ]
    }];

    let context = await browser.newContext({storageState});

    let utilOptions: BrowserUtilitiesOptions = {
        mockedDate: getMockedDate(options),
    };
    await context.addInitScript(initBrowserUtilities, utilOptions);

    let page = await context.newPage();
    await page.on('close', async () => await context.close() );

    await page.route('**/*', async route => {
        if(await handlePatreonGrabs(route, options))
            return;
        if(await handleUpdatesQuery(route, options))
            return;
        if(await handleCacheFile(route))
            return;
        if(await handleCustomURL(route, config))
            return;
        if(await handleLocalFile(route, config))
            return;
        if(await handleLocalDirectory(route, config))
            return;
        if(await handleForbiddenURLs(route))
            return;

        await route.continue();
    });

    await page.goto('https://orteil.dashnet.org/cookieclicker/index.html');
    await page.waitForFunction(() => Game != undefined && 'ready' in Game && Game.ready);
    return page;
}
