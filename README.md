Cookie Connoisseur
==================

**[Changelog](CHANGELOG.md)
| [API](#api)
| [Configuration file](#configuration-file)
| [CCSave](doc/CCSave.md)**

Cookie Connoisseur is a Node.js library to automate the testing of Cookie Clicker mods.

Upon installation,
Cookie Connoisseur downloads a local copy of <https://orteil.dashnet.org/cookieclicker/>.
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

    npm --foreground-scripts install --save-dev --save-exact cookie-connoisseur

This istalls the library,
the `cookie-connoisseur` binary,
and downloads a copy of <https://orteil.dashnet.org/cookieclicker>.
(The files will be stored to `.cookie-connoisseur`.)

By default,
NPM [gobbles the output](https://docs.npmjs.com/cli/v7/using-npm/config#foreground-scripts)
from install scripts.
**If you forget the `--foregound-scripts` flag**,
`npm install` will look like it is frozen for a minute.
The download will still happen, though.

The library comes with TypeScript typings.

As the API is still unstable, `--save-exact` is recommended to minimize breakage.


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

Strictly speaking it is not necessary to run this command manually,
as it is run on `npx install`,
and `openCookieClickerPage` downloads any missing files on-the-fly.
However this means that the very first test to be run after changing the configuration file
will need extra time to download the missing files,
so it is useful to run it manually in this case
to make sure that network latency does not interfere with your tests.

Note that some unused assets available in <https://orteil.dashnet.org/cookieclicker/>
are not downloaded by this script.

    npx cookie-connoisseur launch

This is a simple script that launches a Cookie Clicker instance using Firefox.
It exists mainly to provide a simple test that the installation worked.

    npx cookie-connoisseur native-to-json
    npx cookie-connoisseur json-to-native

These commands read Cookie Clicker's native save format from stdin
and write a corresponding JSON to stdout,
and vice-versa, respectively.
They are documented in more details [here](doc/CCSave.md#executables).


API
===

**[openCookieClickerPage](doc/openCookieClickerPage.md)
| [CConnoisseur](doc/cconnoisseur.md)**

The main function is
```typescript
function openCookieClickerPage(browser: Browser, options: CCPageOptions = {}): Promise<Page>
```

It uses the given browser to open a page,
which already navigated to <https://orteil.dashnet.org/cookieclicker/index.html>
and waited for `Game.ready` to be true.
[More details here](doc/openCookieClickerPage.md),
including related functions and a breakdown of the options.

Additionally,
Cookie Connoisseur injects in the page's global scope the object `CConnoisseur`,
[whose documentation can be found here](doc/cconnoisseur.md).


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
    If they are missing, these files are downloaded to `.cookie-connoisseur`
    in the first time they are needed,
    and the local copy is used used afterwards whenever that URL is requested.
    Alternatively,
    you can download all these files at once by running `npx cookie-connoisseur fetch`.

-   `localFiles`: `{url: string, path: string}[]`
    List of URLs that are redirected to local files.
    Whenever a URL from this list is requested,
    the local file located in `path` is provided instead.

-   `localDirectories`: `{url: string, path: string}[]`
    List of URL prefixes that are redirected to local directories.
    Whenever a URL starting with `url` is requested,
    that prefix is replaced with `path`, and the resulting path is provided instead.

It is advised to re-run `npx cookie-connoisseur fetch`
whenever the `customURLs` list is changed.


Known Issues
============

The core functionality is still somewhat unstable,
so some tests might fail due to crashes inside Cookie Connoisseur.

Favicons are not downloaded.
`npx cookie-connoisseur fetch` simply uses Playwright to download files,
and favicon requests
are [explicitly filtered out](https://github.com/microsoft/playwright/issues/7493).
I did not implement a fallback yet.

Files which are downloaded to `.cookie-connoisseur`
are not automatically removed if they are not needed anymore.
