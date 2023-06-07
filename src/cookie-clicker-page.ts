import * as fsPromises from 'fs/promises';
import { Browser, BrowserContext, Page, Route } from 'playwright';
import { liveURLs as builtinURLs, liveEntryURL as entryURL } from './url-list-live';
import { isForbiddenURL, localPathOfURL, normalizeURL, makeDownloadingListener } from './local-cc-instance';
import { BrowserUtilitiesOptions, initBrowserUtilities, CookieClickerLanguage } from './browser-utilities';
import { parseConfigFile, CookieConnoisseurConfig } from './parse-config';
import { CCSave, CCBuildingsData } from './ccsave';

/* These options are documented in `doc/openCookieClickerPage.md`.
 *
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
    waitForMinigames?: boolean,
    language?: CookieClickerLanguage | null,
    routingFallback?: (route: Route) => Promise<void>,
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
        return '2.048|new building and a whole lot of other things!';
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
        return CCSave.toNativeSave(CCSave.fromObject(options.saveGame));
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

function getWaitForMinigames(options: CCPageOptions) {
    if(options.language === null) {
        return false;
    } else if(typeof options.waitForMinigames == 'boolean') {
        return options.waitForMinigames;
    } else {
        return true;
    }
}

function getLanguage(options: CCPageOptions): CookieClickerLanguage | null {
    if(typeof options.language == 'string') {
        return options.language;
    } else if(typeof options.language == 'object') {
        return null;
    } else {
        return 'EN';
    }
}

function getRoutingFallback(options: CCPageOptions): (route: Route) => Promise<void> {
    if(typeof options.routingFallback == 'function') {
        return options.routingFallback;
    } else {
        return route => route.continue();
    }
}

/* Helper function.
 * If the route queries for https://orteil.dashnet.org/patreon/grab.php,
 * this function fulfills the request with the format that the game expects
 * to configure the number of heralds and Patreon grandma names,
 * and returns true.
 * It returns false otherwise.
 */
async function handlePatreonGrabs(route: Route, options: CCPageOptions, config: CookieConnoisseurConfig) {
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
        if(config.verbose >= 2)
            console.log(`Couldn't deliver Herald count and Grandma names: ${reason}`);
    });

    return true;
}

/* Helper function.
 * If the route queries for https://orteil.dashnet.org/cookieclicker/server.php?q=checkupdate,
 * this function fulfills the request with options.updatesResponse and returns true.
 * It returns false otherwise.
 */
async function handleUpdatesQuery(route: Route, options: CCPageOptions, config: CookieConnoisseurConfig) {
    let url = route.request().url();
    if(!url.includes('https://orteil.dashnet.org/cookieclicker/server.php?q=checkupdate'))
        return false;

    await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: getUpdatesResponse(options),
    }).catch(reason => {
        if(config.verbose >= 2)
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
async function handleCacheFile(route: Route, config: CookieConnoisseurConfig) {
    let url = normalizeURL(route.request().url());
    if(!(url in builtinURLs))
        return false;

    let path = localPathOfURL(url);
    try {
        /* This operation may reject the promise if the file wasn't downloaded yet.
         * Node.js actually recommends doing this way,
         * instead of using exists or existsSync:
         * <https://nodejs.org/api/fs.html#fsexistspath-callback>
         */
        let file = await fsPromises.readFile(path);
        let options: Parameters<Route["fulfill"]>[0] = {};
        options = {body: file};
        if('contentType' in builtinURLs[url]) {
            options.contentType = builtinURLs[url].contentType;
        }
        await route.fulfill(options).catch(reason => {
            if(config.verbose >= 2)
                console.log(`Couldn't deliver cached page ${url}: ${reason}`);
        });
    }
    catch (e) {
        if(!(e instanceof Error && 'code' in e && e['code'] === 'ENOENT')) {
            // Some filesystem error which is not a simple "file not found"
            throw e;
        }
        if(config.verbose >= 1) {
            console.log(`Downloading file ${path}...`);
        }
        route.request().frame().page().on('response', makeDownloadingListener(
            url,
            {
                verbose: config.verbose,
                sha1sum: builtinURLs[url].sha1sum,
            },
        ));
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
    try {
        let file = await fsPromises.readFile(path);
        await route.fulfill({body: file}).catch(reason => {
            if(config.verbose >= 2)
                console.log(`Couldn't deliver custom URL ${url}: ${reason}`);
        });
    } catch (e) {
        if(!(e instanceof Error && 'code' in e && e['code'] === 'ENOENT')) {
            throw e;
        }
        if(config.verbose >= 1) {
            console.log(`Downloading file ${path}...`);
        }
        route.request().frame().page().on('response', makeDownloadingListener(
            url,
            {
                verbose: config.verbose,
                sha1sum: config.customURLs[url].sha1sum,
            },
        ));
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

    let path = config.localFiles[url].path;
    try {
        let file = await fsPromises.readFile(path);
        await route.fulfill({body: file}).catch(reason => {
            if(config.verbose >= 2)
                console.log(`Couldn't deliver local page ${url}: ${reason}`);
        });
    } catch (e) {
        if(!(e instanceof Error && 'code' in e && e['code'] === 'ENOENT')) {
            throw e;
        }
        if(config.verbose >= 1) {
            console.log(`File ${path} not found`);
        }
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
            try {
                let file = await fsPromises.readFile(filePath);
                await route.fulfill({body: file}).catch(reason => {
                    if(config.verbose >= 2)
                        console.log(`Couldn't deliver local page ${url}: ${reason}`);
                });
            } catch (e) {
                if(!(e instanceof Error && 'code' in e && e['code'] === 'ENOENT')) {
                    throw e;
                }
                if(config.verbose >= 1) {
                    console.log(`File ${filePath} not found in directory ${directoryPath}`);
                }
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

/* Creates a new page using the given browser or browserContext,
 * and navigates to https://orteil.dashnet.org/cookieclicker/index.html.
 * See `doc/openCookieClickerPage.md` for a complete documentation of the arguments.
 */
export async function openCookieClickerPage(browser: Browser, options?: CCPageOptions): Promise<Page>;
export async function openCookieClickerPage(context: BrowserContext, options?: CCPageOptions): Promise<Page>;
export async function openCookieClickerPage(pageMaker: Browser | BrowserContext, options: CCPageOptions = {}) {
    return await setupCookieClickerPage(await pageMaker.newPage(), options);
}

/* Similar to openCookieClickerPage,
 * but operates on the given page instead of creating a new one.
 * Returns the page itself.
 */
export async function setupCookieClickerPage(page: Page, options: CCPageOptions = {}) {
    let config = await parseConfigFile();
    if(getCookieConsent(options)) {
        page.context().addCookies([{
            name: 'cookieconsent_dismissed',
            value: 'yes',
            url: 'https://orteil.dashnet.org/cookieclicker/',
        }]);
    }

    let utilOptions: BrowserUtilitiesOptions = {
        mockedDate: getMockedDate(options),
        saveGame: getSaveGame(options),
        language: getLanguage(options),
    };
    await page.addInitScript(initBrowserUtilities, utilOptions);

    await page.route('**/*', async route => {
        console.log(`Requesting ${route.request().url()}`);
        if(await handlePatreonGrabs(route, options, config))
            return;
        if(await handleUpdatesQuery(route, options, config))
            return;
        if(await handleCacheFile(route, config))
            return;
        if(await handleCustomURL(route, config))
            return;
        if(await handleLocalFile(route, config))
            return;
        if(await handleLocalDirectory(route, config))
            return;
        if(await handleForbiddenURLs(route))
            return;
        await getRoutingFallback(options)(route);
    });

    await page.goto(entryURL);
    await page.waitForFunction(() => typeof Game != 'undefined');
    if(options.language !== null) {
        await page.waitForFunction(() => 'ready' in Game && Game.ready);
    }

    if(getWaitForMinigames(options)) {
        let save = new CCSave();
        if(utilOptions.saveGame) save = CCSave.fromNativeSave(utilOptions.saveGame);
        let buildingName: keyof CCBuildingsData;
        for(buildingName in save.buildings) {
            if('minigame' in save.buildings[buildingName] && save.buildings[buildingName].level > 0) {
                await page.waitForFunction(building => Game.isMinigameReady(Game.Objects[building]), buildingName);
            }
        }
    }
    return page;
}
