Cookie Connoisseur
==================

**[Changelog](CHANGELOG.md)
| [API](#api)
| [Configuration file](#configuration-file)
| [CCSave](doc/CCSave.md)**

Cookie Connoisseur is a Node.js library to automate the testing of Cookie Clicker mods.

First,
a [script](#executables) downloads a local copy of <https://orteil.dashnet.org/cookieclicker/>.
Then,
the function [`openCookieClickerPage`](#api)
constructs a [Playwright Page](https://playwright.dev/docs/api/class-page)
which runs an instance of Cookie Clicker using the local copy.

The library can
- Set up a save game,
    so that you can test that your mod properly loads its save game
- Mock the date,
    so that you can choose to run the tests e.g. during Christmas
- Download copies of third-party mods,
    to aid integration with other mods
- Parse Cookie Clicker's native save format into a JSON format and back
- Block ads.

See the section [API](#api) below for a full list of features.


Installation
============

    npm install --save-dev --save-exact cookie-connoisseur

This istalls the library and the binaries.
It comes with TypeScript typings.
(As the API is still unstable, `--save-exact` is recommended to minimize breakage.)

Before using Cookie Connoisseur,
you must run

    npx cookie-connoisseur fetch

to download a copy of Cookie Clicker.
The files will be stored to `.cookie-connoisseur`.


Example Script
==============

```javascript
import { chromium } from 'playwright'; // Choose a browser
import { openCookieClickerPage } from 'cookie-connoisseur';

setTimeout(async () => {
    /* Launch the browser.
     * This explicitly launches a headed browser,
     * but for automated testing you will want to launch a headless instance.
     */
    let browser = await chromium.launch({headless: false});

    /* Opens a Cookie Clicker page in a brand new context using the given browser.
     * The second argument is a list of options for configuring the page.
     * For example, the line below sets the date to December 21st, 2012,
     * so you should see the Christmas theme, regardless of the real date!
     * We also choose the save game so that we start with a 6x6 garden.
     */
    let page = await openCookieClickerPage(browser, {
        mockedDate: Date.UTC(2012, 11, 21),
        saveGame: {
            buildings: {
                'Farm': {
                    amount: 1,
                    level: 9,
                },
            },
        },
    });

    /* You can run any Playwright command in the page.
     */
    await page.setViewportSize({ width: 1920, height: 900 });

    /* The lines below load the mod Choose Your Own Lump (CYOL) and waits for it to load.
     * By default, Cookie Connoisseur only downloads files from vanilla Cookie Clicker,
     * so the following command would have to access the internet.
     * It is possible to configure it to also download other files;
     * see the configuration file below.
     */
    await page.evaluate("Game.LoadMod('https://staticvariablejames.github.io/ChooseYourOwnLump/ChooseYourOwnLump.js')");
    await page.waitForFunction("typeof CYOL == 'object' && CYOL.isLoaded"); // This line is CYOL-specific

    /* Finally, we halt the script, so that the page can be inspected and interacted with,
     * and then we close the browser (which also closes the page).
     * Running page.pause() should not be used for automated testing,
     * but browser.close() should always be executed.
     *
     * Protip: https://playwright.dev/docs/inspector#recording-scripts
     */
    await page.pause();
    await browser.close();
});
```

You can find examples of how Cookie Connoisseur is used for testing
in the [test directory of Choose Your Own Lump](
    https://github.com/staticvariablejames/ChooseYourOwnLump/tree/master/test
).


Executables
===========

Cookie Connoiseur has a command-line interface with a few commands.

    npx cookie-connoisseur fetch

This downloads the files needed to run a Cookie Clicker instance
(`index.html`, `main.js`, minigame scripts, assets, Google fonts)
and stores it to the directory `.cookie-connoisseur`,
in the project's root.

It also downloads the custom URLs listed in the [configuration file](#configuration-file);
see below for details.

Note that some unused assets available in <https://orteil.dashnet.org/cookieclicker/>
are not downloaded by this script.

    npx cookie-connoisseur launch

This is a simple script that launches a Cookie Clicker instance using Firefox.
It exists mainly to provide a simple test that `npx fetch-cookie-clicker-files` worked.
If any file needed by Cookie Clicker is not downloaded,
it is written in the terminal.

    npx cookie-connoisseur ccsave-to-json
    npx cookie-connoisseur json-to-ccsave

These commands read Cookie Clicker's native save format from stdin
and write a corresponding JSON to stdout,
and vice-versa, respectively.
They are documented in more details [here](doc/CCSave.md#executables).


API
===

The main function is

```typescript
function openCookieClickerPage(browser: Browser, options: CCPageOptions = {}): Promise<Page>
```

Given a [browser](https://playwright.dev/docs/api/class-browser/)
and an options abject,
this function returns a [Page](https://playwright.dev/docs/api/class-page)
that already navigated to <https://orteil.dashnet.org/cookieclicker/index.html>
and waited for `Game.ready` to be true.
The page [reroutes](https://playwright.dev/docs/api/class-route)
requests to <https://orteil.dashnet.org/cookieclicker/> to the local copy of Cookie Clicker.

A few URLs are dropped;
most notably <https://pagead2.googlesyndication.com>.

Available options:

-   `heralds: number` - Heralds and Patreon-submitted grandma names are obtained by querying
        <https://orteil.dashnet.org/patreon/grab.php>. Cookie Connoisseur intercepts this query;
        `options.heralds` is the number used in the response.
        Defaults to 42.

-   `grandmaNames: string[]` - list of names that some grandmas get if "Custom grandmas" is "ON".
        Names must not contain the pipe `|` character.
        Defaults to `["Custom grandma names", "See cookie-clicker-page.ts for details"]`.

-   `updatesResponse: string` - Every 30 minutes Cookie Clicker checks for updates;
        this is the string fed to Game.CheckUpdatesResponse.
        The default value is '2.029|new stock market minigame!'.

-   `cookieConsent: boolean` - Unless set to 'false',
        the page includes the browser cookie `cookieconsent_dismissed=yes`,
        which dismisses the cookie consent dialog.

-   `saveGame: string|object` - The starting save game.
        If it is a string, the value is stored as-is into `window.localStorage`
        prior to loading the game.
        If it is an object, it is first converted to a string using
        [`CCSave.fromObject` and `CCSave.toStringSave`](doc/CCSave.md#API)
        Defaults to empty.

-   `mockedDate: number` - Initial value of CConnoisseur.mockedDate; see below.
        Defaults to 1.6e12.

The first three options
(`heralds`, `grandmaNames` and `updatesResponse`)
are updated by the game every 30 minutes,
querying an appropriate page.
These options can be changed dynamically:
If you create an options object and pass it to `openCookieClickerPage`,
changing these options in the object will update the response issued by Cookie Connoisseur
in the next query.

Routing is done via [page.route](https://playwright.dev/docs/api/class-page#page-route).
If you register conflicting routes,
[the later routes take precedence](https://github.com/microsoft/playwright/issues/7394),
so you may override any route established by Cookie Connoisseur
by just registering a new route.

Additionally,
Cookie Connoisseur injects in the page's global scope the object `CCoinnosseur`,
which currently has only one attribute:
-   `mockedDate` <number>: The Cookie Connoisseur implementation of a `Date.now()` mock.
        There are several game mechanics that rely on `Date.now()` advancing normally,
        so it is not viable to simply set `Date.now() = () => 1.6e12`.
        The compromise is setting a base starting date
        and let `Date.now()` increment normally beyond that.
        `CConnoisseur.mockedDate` is precisely this base starting date.
        The default value is 1.6e12, which corresponds to 2020-09-13 12:26:40 UTC.

These values can be changed via `page.evaluate`;
for example,
```javascript
await page.evaluate("window.CConnoisseur.mockedDate += 3600*1000");
```
is equivalent to advancing the system clock by one hour.


Configuration File
==================

The configuration file is `cookie-connoisseur.config.json`,
located in the root folder.
The following example is from [Choose Your Own Lump](
https://github.com/staticvariablejames/ChooseYourOwnLump/blob/master/cookie-connoisseur.config.json
).

```json
{
    "customURLs": [
        {"url": "https://klattmose.github.io/CookieClicker/CCSE.js"},
        {"url": "https://staticvariablejames.github.io/SpicedCookies/Spice.js"}
    ],
    "localFiles": [
        {"url": "https://staticvariablejames.github.io/ChooseYourOwnLump/ChooseYourOwnLump.js",
         "path": "ChooseYourOwnLump.js"},
        {"url": "https://staticvariablejames.github.io/ChooseYourOwnLump/dist/main.js",
         "path": "dist/main.js"}
    ]
}
```

Available options:

-   `customURLs`: `{url: string}[]`
        List of URLs that are handled in the same way as Cookie Clicker files.
        These files are downloaded by `npx fetch-cookie-clicker-files`
        and the local copy is used used by Cookie Connoisseur whenever that URL is requested.

-   `localFiles`: `{url: string, path: string}[]`
        List of URLs that are redirected to local files.
        Whenever a URL from this list is requested,
        the local file located in `path` is provided instead.

-   `localDirectories`: `{url: string, path: string}[]`
        List of URL prefixes that are redirected to local directories.
        Whenever a URL starting with `url` is requested,
        that prefix is replaced with `path`, and the resulting path is provided instead.

You must re-run `npx fetch-cookie-clicker-files`
whenever the `customURLs` list is changed.


Known Issues
============

Favicons are not downloaded.
`npx cookie-connoisseur fetch` simply uses Playwright to download files,
and favicon requests
are [explicitly filtered out](https://github.com/microsoft/playwright/issues/7493).
I did not implement a fallback yet.
