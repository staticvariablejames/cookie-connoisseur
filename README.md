Cookie Connoisseur
==================

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
- Block ads.

See the section [API](#api) below for a full list of features.


Installation
============

    npm install --save-dev cookie-connoisseur

This istalls the library and the binaries.
It comes with TypeScript typings.

Before using Cookie Connoisseur,
you must run

    npx fetch-cookie-clicker-files

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
     */
    let page = await openCookieClickerPage(browser, {mockedDate: Date.UTC(2012, 11, 21)});

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

You can find an example of how Cookie Connoisseur is used for testing
in the [test directory of Choose Your Own Lump](
    https://github.com/staticvariablejames/ChooseYourOwnLump/tree/master/test
).


Executables
===========

Cookie Connoiseur comes with two executable scripts.

    npx fetch-cookie-clicker-files

This script downloads the files needed to run a Cookie Clicker instance
(`index.html`, `main.js`, minigame scripts, assets, Google fonts)
and stores it to the directory `.cookie-connoisseur`,
in the project's root.

This script also downloads the custom URLs listed in the [configuration file](#configuration-file);
see below for details.

Note that some unused assets available in <https://orteil.dashnet.org/cookieclicker/>
are not downloaded by this script.

    npx launch-cookie-clicker-instance

This is a simple script that launches a Cookie Clicker instance using Firefox.
It exists mainly to provide a simple test that `npx fetch-cookie-clicker-files` worked.
If any file needed by Cookie Clicker is not downloaded,
it is written in the terminal.


API
===

The main function is

```javascript
async function openCookieClickerPage(browser, options = {}): 
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

-   `heralds` <number>: Heralds and Patreon-submitted grandma names are obtained by querying
        <https://orteil.dashnet.org/patreon/grab.php>. Cookie Connoisseur intercepts this query;
        `options.heralds` is the number used in the response.
        Defaults to 42.

-   `grandmaNames` <string[]>: list of names that some grandmas get if "Custom grandmas" is "ON".
        Names must not contain the pipe `|` character.
        Defaults to `["Custom grandma names", "See cookie-clicker-page.ts for details"]`.

-   `updatesResponse` <string>: Every 30 minutes Cookie Clicker checks for updates;
        this is the string fed to Game.CheckUpdatesResponse.
        The default value is '2.029|new stock market minigame!'.

-   `cookieConsent` <boolean>: Unless set to 'false',
        the page includes the browser cookie `cookieconsent_dismissed=yes`,
        which dismisses the cookie consent dialog.

-   `saveGame` <string>: String to be used as the stored save game.
        Defaults to empty.

-   `mockedDate` <number>: Initial value of CConnoisseur.mockedDate; see below.
        Defaults to 16e11.

The first three options
(`heralds`, `grandmaNames` and `updatesResponse`)
are updated by the game every 30 minutes,
querying an appropriate page.
These options can be changed dynamically:
If you create an options object and pass it to `openCookieClickerPage`,
changing these options in the object will update the response issued by Cookie Connoisseur
in the next query.

Routing is done via [page.route](https://playwright.dev/docs/api/class-page#page-route).
Since Playwright 1.13,
if you register conflicting routes,
[the later routes take precedence](https://github.com/microsoft/playwright/issues/7394).
So you may override any route established by Cookie Connoisseur
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
        {"url": "https://staticvariablejames.github.io/SpicedCookies/Spice.js"},
        {"url": "https://staticvariablejames.github.io/ChooseYourOwnLump/ChooseYourOwnLump.js",
         "path": "ChooseYourOwnLump.js"},
        {"url": "https://staticvariablejames.github.io/ChooseYourOwnLump/dist/main.js",
         "path": "dist/main.js"}
    ]
}
```

Currently,
the file has a single attribute,
`customURLs`,
which is a list of custom redirects to be used by Cookie Connoisseur.

The attribute `url` must be present.
If `path` is also present,
then requests for the given URL will be fulfilled with the local file given in the path.
For example,
the files exposed by ChooseYourOwnLump are `ChooseYourOwnLump.js` and `dist/main.js`
(both paths relative to the project root),
so whenever the page accesses e.g.
<https://staticvariablejames.github.io/ChooseYourOwnLump/dist/main.js>,
the local file `dist/main.js` is used instead.

If `path` is **not** present,
then the file will be downloaded by `npx fetch-cookie-clicker-files`
and the local copy will be used Cookie Connoisseur to fulfill requests for that file.
In essense,
those files are managed in the same way as vanilla Cookie Clicker files.

You must re-run `npx fetch-cookie-clicker-files`
every time an URL without the `path` attribute changes.


Known Issues
============

Favicons are not downloaded.
`fetch-cookie-clicker-files` simply uses Playwright to download files,
and favicon requests
are [explicitly filtered out](https://github.com/microsoft/playwright/issues/7493).
I did not implement a fallback yet.
