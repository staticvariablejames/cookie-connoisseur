import * as fsPromises from 'fs/promises';
import { Browser, BrowserContext, Page, Route } from 'playwright';
import { liveURLs as builtinURLs, liveEntryURL as entryURL } from './url-list-live';
import { isForbiddenURL, localPathOfURL, normalizeURL, makeDownloadingListener } from './local-cc-instance';
import { BrowserUtilitiesOptions, initBrowserUtilities, CookieClickerLanguage } from './browser-utilities';
import { parseConfigFile, CookieConnoisseurConfig } from './parse-config';
import { CCSave, CCBuildingsData, AchievementsById } from './ccsave';

// Cookie Clicker Query for https://orteil.dashnet.org/data/cookieclickersteam.json
export type CCQSteam = {
    steamPlayers: number;
    lastUpdated: number;
};

// Cookie Clicker Query for https://orteil.dashnet.org/data/grandmas.json
export type CCQGrandmaNames = string[];

export const defaultCCQGrandmaNames: CCQGrandmaNames = [
    "Custom grandma names",
    "See cookie-clicker-page.ts for details"
];

// Cookie Clicker Query for https://orteil.dashnet.org/data/cookieclickerinfo.json
export type CCQInfo = {
    versions?: Array<{off?: number, text: string, v: string | number, style?: string, url: string}>;
    links?: Array<{off?: number, text: string, tooltip?: string, style?: string, class?: string, url?: string, remove?: string}>;
    extraCss?: Array<string>;
};

export const defaultCCQInfo: CCQInfo = {
    // This is the query response at the time of writing this (2026-03-14)
	"versions": [
		{"text":"Latest","v":"LIVE","url":"$DIR/cookieclicker"},
		{"text":"Try the beta!","v":"BETA","url":"$DIR/cookieclicker/beta"},
		{"text":"v.2.052 <small>(2023)</small>","v":2.052,"url":"$DIR/cookieclicker/v2052"},
		{"text":"v.1.0466 <small>(2014)</small>","v":1.0466,"url":"$DIR/cookieclicker/v10466"},
		{"text":"Classic <small>(2013)</small>","v":"CLASSIC","url":"$DIR/experiments/cookie"}
	],
	"links": [
		{"text":"<img src=\"img/topbarSteam.png\" style=\"margin-left:0px;\"> Steam","tooltip":"Play Cookie Clicker on Steam!<br>Featuring music by C418.","style":"padding-left:26px;","class":"promoLink","url":"https://store.steampowered.com/app/1454400/Cookie_Clicker/","remove":"topbarSteamCC+"},
		{"text":"<img src=\"img/topbarMobile.png\" style=\"margin-left:2px;\"> Android","tooltip":"Play Cookie Clicker on your phone!","style":"padding-left:20px;","class":"promoLink","url":"https://play.google.com/store/apps/details?id=org.dashnet.cookieclicker","remove":"topbarMobileCC+"},
		{"off":1,"text":"<img src=\"img/topbarXbox.png\" style=\"margin-left:0px;\"><img src=\"img/topbarPS.png\" style=\"margin-left:22px;\"><img src=\"img/topbarSwitch.png\" style=\"margin-left:44px;\"><span class=\"hideCompressed\" style=\"padding-left:8px;\">Consoles</span>","tooltip":"Play Cookie Clicker on Xbox, PlayStation and Nintendo Switch!","style":"padding-left:60px;","class":"promoLink","url":"https://cookieclicker.com/"},
		{"text":"Consoles","tooltip":"Play Cookie Clicker on Xbox, PlayStation and Nintendo Switch!","class":"promoLink","url":"https://cookieclicker.com/"},
		{"text":"<img src=\"img/fangamerClickerPic.png\" style=\"margin-left:2px;margin-top:2px;\"> Cookie Clicker clicker<div style=\"position:absolute;right:8px;bottom:3px;font-size:10px;\">by Fangamer</div>","style":"padding-left:40px;","tooltip":"Clicky merch by Fangamer!<br>There's shirts too!","class":"promoLink","url":"https://fanga.me/r/cookie-clicker-collection"}
	],
	"extraCss": ["#topBar .promoLink a{color:#06c;}"],
};

// Cookie Clicker Query for https://orteil.dashnet.org/data/version.json
export type CCQVersion = {
	"Cookie Clicker": {"v": number, "updateNotes": string };
	"Cookie Clicker beta": {"v": number, "updateNotes": string };
};

export const defaultCCQVersion = {
    // This is the query response at the time of writing this (2026-03-14)
    "Cookie Clicker": {
        "v": 2.052,
        "updateNotes": "new building!"
    },
    "Cookie Clicker beta": {
        "v": 2.052,
        "updateNotes": "new building!"
    },
};

/* These options are documented in `doc/openCookieClickerPage.md`.
 *
 * For convenience,
 * functions in this file pass around the entire `options` object to each other.
 */
export type CCPageOptions = {
    querySteamPlayers?: number | CCQSteam,
    queryGrandmaNames?: CCQGrandmaNames,
    queryInfo?: CCQInfo,
    queryVersion?: CCQVersion | (() => CCQVersion), // Queried once every half-hour
    cookieConsent?: boolean,
    saveGame?: string | object,
    mockedDate?: number | null,
    forceDiscrepancy?: number | null,
    waitForMinigames?: boolean,
    language?: CookieClickerLanguage | null,
    routingFallback?: (route: Route) => Promise<void>,
};

/* The following utility functions return the value of the option,
 * or their default value if it does not exist.
 *
 * The only exception is getQueryVersion;
 * if options.queryVersion is a function,
 * it is called instead.
 *
 * For uniformity, there are helper functions for all options.
 */
function getQuerySteamPlayers(options: CCPageOptions): CCQSteam {
    // The default value depends on options.mockedDate, so assembling it is a bit convoluted
    let returnValue: CCQSteam | number;
    if(options.querySteamPlayers !== undefined) {
        returnValue = options.querySteamPlayers;
    } else {
        returnValue = 1729;
    }

    if(typeof returnValue == 'number') {
        return {steamPlayers: returnValue, lastUpdated: getMockedDate(options) ?? Date.now()};
    } else {
        return returnValue;
    }
}

function getQueryGrandmaNames(options: CCPageOptions): CCQGrandmaNames {
    if(Array.isArray(options.queryGrandmaNames)) {
        return options.queryGrandmaNames;
    } else  {
        return defaultCCQGrandmaNames;
    }
}

function getQueryInfo(options: CCPageOptions): CCQInfo {
    if (typeof options.queryInfo == 'object') {
        return options.queryInfo;
    } else {
        return defaultCCQInfo;
    }
}

function getQueryVersion(options: CCPageOptions): CCQVersion {
    if(typeof options.queryVersion == 'function') {
        return options.queryVersion();
    } else if (typeof options.queryVersion == 'object') {
        return options.queryVersion;
    } else {
        return defaultCCQVersion;
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
    if(options.mockedDate === null) {
        return null;
    } else if(typeof options.mockedDate == 'number') {
        return options.mockedDate;
    } else {
        return 1.6e12; // 2020-09-13 12:26:40 UTC
    }
}

function getForceDiscrepancy(options: CCPageOptions) {
    if(typeof options.forceDiscrepancy != 'number') {
        return null;
    }

    // Need to force the discrepancy. Some sanity checks:
    if(getMockedDate(options) == null) {
        throw new Error('.mockedDate must not be null to use .forceDiscrepancy');
    }
    if(options.saveGame == undefined) {
        throw new Error('.forceDiscrepancy is only allowed when specifying .saveGame');
    }
    let saveGame = typeof options.saveGame == 'string' ?
        CCSave.fromNativeSave(options.saveGame) :
        CCSave.fromObject(options.saveGame);
    if(saveGame.lumpsTotal == -1) {
        throw new Error('.forceDiscrepancy needs lumps to be unlocked (.lumpsTotal != -1)');
    }
    if(saveGame.achievements.length < AchievementsById.length - 4) {
        // The -4 is to account for the beta dungeon achievements
        throw new Error('.forceDiscrepancy requires the .saveGame to have all achievements');
    }
    if(saveGame.ownedUpgrades.includes('Century egg')) {
        throw new Error('.forceDiscrepancy requires the .saveGame to not own Century egg');
    }

    return options.forceDiscrepancy;
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

function getRoutingFallback(options: CCPageOptions, config: CookieConnoisseurConfig): (route: Route) => Promise<void> {
    if(typeof options.routingFallback == 'function') {
        return options.routingFallback;
    } else {
        return (route: Route) => {
            if(config.verbose >= 1) {
                console.log(`No route configured for ${route.request().url()}, using the Internet...`);
            }
            return route.continue();
        };
    }
}

/* Helper function.
 * If the route queries one of the following four URLs:
 *  - https://orteil.dashnet.org/data/cookieclickersteam.json
 *  - https://orteil.dashnet.org/data/grandmas.json
 *  - https://orteil.dashnet.org/data/cookieclickerinfo.json
 *  - https://orteil.dashnet.org/data/version.json
 * it fulfills the request with the format with the game expects and returns true.
 * It returns false otherwise.
 */
async function handleJSONRequest(route: Route, options: CCPageOptions, config: CookieConnoisseurConfig) {
    let url = route.request().url();
    let response: string;
    /* The queries all have the argument '?nocache=n' appended,
     * where nnnnnn is always `Math.floor(Date.now()/1000/60/30)`
     * (i.e. number of half-hours since epoch).
     * This argument has no effect in the game's code and I could not observe an effect in the query,
     * so we silently ignore it.
     */
    if(url.startsWith('https://orteil.dashnet.org/data/cookieclickersteam.json')) {
        response = JSON.stringify(getQuerySteamPlayers(options));
    } else if(url.startsWith('https://orteil.dashnet.org/data/grandmas.json')) {
        response = JSON.stringify(getQueryGrandmaNames(options));
    } else if(url.startsWith('https://orteil.dashnet.org/data/cookieclickerinfo.json')) {
        response = JSON.stringify(getQueryInfo(options));
    } else if(url.startsWith('https://orteil.dashnet.org/data/version.json')) {
        response = JSON.stringify(getQueryVersion(options));
    } else {
        return false;
    }

    await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: response,
    }).catch(reason => {
        if(config.verbose >= 1)
            console.log(`Couldn't deliver JSON request for ${url}: ${reason}`);
    });

    return true;
}

/* Helper function to helper function;
 * it does an additional layer of normalization beyond what normalizeURL does.
 *
 * Cookie Clicker changed to use a CDN in 2.052;
 * resources are loaded like `Game.resPath+'img/goldCookie.png'`,
 * where `Game.resPath` is the base URL for the resources.
 * However,
 * the code that computes `Game.resPath` only works in <https://orteil.dashnet.org/cookieclicker/>,
 * failing in <https://orteil.dashnet.org/cookieclicker/index.html>
 * (note the "index.html" at the end).
 * Hence we have to navigate to <https://orteil.dashnet.org/cookieclicker/>,
 * but load the file <https://orteil.dashnet.org/cookieclicker/index.html> instead.
 * This function replaces the former URL with the latter,
 * allowing Cookie Connoisseur to fetch the proper file.
 *
 * This function exists primarily to document this issue.
 */
function index_html_workaround(url: string) {
    if(url === entryURL)
        return entryURL + 'index.html';
    return url;
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
    let url = index_html_workaround(normalizeURL(route.request().url()));
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
            if(config.verbose >= 1)
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
            if(config.verbose >= 1)
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
                    if(config.verbose >= 1)
                        console.log(`Couldn't deliver local page ${url}: ${reason}`);
                });
            } catch (e) {
                if(!(e instanceof Error && 'code' in e && e['code'] === 'ENOENT')) {
                    throw e;
                }
                if(config.verbose >= 0) {
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

/* Hides the two "sponsored links" blocks that show up above and below the shop.
 */
async function hideSponsoredLinks(page: Page) {
    await page.evaluate(() => {
        document.getElementById('support')!.style.display = 'none';
        document.getElementById('smallSupport')!.style.display = 'none';
    });
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
        forceDiscrepancy: getForceDiscrepancy(options),
        saveGame: getSaveGame(options),
        language: getLanguage(options),
    };
    await page.addInitScript(initBrowserUtilities, utilOptions);

    await page.route('**/*', async route => {
        if(config.verbose >= 2) {
            console.log(`Requesting ${route.request().url()}`);
        }
        if(await handleJSONRequest(route, options, config))
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
        await getRoutingFallback(options, config)(route);
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

    await hideSponsoredLinks(page);

    return page;
}
