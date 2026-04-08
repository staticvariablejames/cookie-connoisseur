Opening a Cookie Clicker Page
=============================

```typescript
function openCookieClickerPage(browser: Browser, options: CCPageOptions = {}): Promise<Page>
function openCookieClickerPage(context: BrowserContext, options: CCPageOptions = {}): Promise<Page>
function setupCookieClickerPage(page: Page, options: CCPageOptions = {}): Promise<Page>
```

Given either a [browser](https://playwright.dev/docs/api/class-browser/)
or a [browser context](https://playwright.dev/docs/api/class-browsercontext/)
and an options abject,
the first function returns a [Page](https://playwright.dev/docs/api/class-page)
that already navigated to <https://orteil.dashnet.org/cookieclicker/index.html>
and waited for `Game.ready` to be true.
The page [reroutes](https://playwright.dev/docs/api/class-route)
requests to <https://orteil.dashnet.org/cookieclicker/> to the local copy of Cookie Clicker.

The other function,
`setupCookieClickerPage`,
manipulates the given page
(installing its routes, adding cookies,
navigating to <https://orteil.dashnet.org/cookieclicker/> etc.)
according to the options and returns it.
The functions behave exactly the same otherwise.

A few URLs are dropped;
most notably <https://pagead2.googlesyndication.com>.

Available options:

-   `querySteamPlayers: number | CCQSteam`
    Number of players currently playing Cookie Clicker on Steam.
    Defaults to 1729.

    During initialization,
    Cookie Clicker queries <https://orteil.dashnet.org/data/cookieclickersteam.json>
    to update the number of players.
    This `json` file has the format `{steamPlayers: number, lastUpdated: number}`,
    which is exported as the type `CCQSteam`.
    Note that `lastUpdated` is a Unix timestamp (number of seconds since January 1st, 1970),
    rather than the number of milliseconds since January 1st, 1970
    (which is the date timestamp format outputted by `Date.now()` and used througouht Cookie Clicker).
    It is unused in the game.
    If `querySteamPlayers` is a number,
    `lastUpdated` is set to `Math.floor(mockedDate/1000)`
    (or `Math.floor(Date.now()/1000)` if date mocking is disabled).

-   `queryGrandmaNames: string[] | (() => string[])`
    list of names that some grandmas get if "Custom grandmas" is "ON".
    Defaults to `["Custom grandma names", "See cookie-clicker-page.ts for details"]`.

    Cookie Clicker obtains this list during initialization
    by querying <https://orteil.dashnet.org/data/grandmas.json>.

-   `queryInfo: CCQInfo | (() => CCQInfo)`
    "Generic" additional info,
    obtained during initialization
    by querying <https://orteil.dashnet.org/data/cookieclickerinfo.json>.

    It is an object with the following three members (all of them optional):

    -   `versions?: Array<{off?: number, text: string, v: string | number, style?: string, url: string}>`
        Populates the drop-down menu
        that shows up when hovering the "Other versions" link in the top right corner of the screen.

        `text` is the button text, and `url` is the link.
        If `url` contains the string `'$DIR'`, it is replaced with `window.location.origin`.

        If `v` is the string `LIVE`, `BETA`, or `CLASSIC`,
        _and_ the language is set to something other than English,
        then `text` is replaced with `Live`, `Beta`, or `Classic`, respectively.
        This member has no use otherwise.

        `style` is additional CSS styling for the button.

        If `off` is defined, that entry is skipped.

    -   `links: Array<{off?: number, text: string, tooltip: string, style?: string, class?: string, url?: string, remove?: string}>`
        List of links appended to the top bar,
        to the right of the heralds.

        `text` is interpreted as HTML and appended to the top bar.
        If `url` exists,
        `text` is wrapped in a `<a>` element.
        If `url` contains the string `'$DIR'`, it is replaced with `window.location.origin`.

        If `tooltip` exists, it is interpreted as HTML and shown when hovering over that link.

        `style` is additional CSS styling for the `<div>` element.

        The `<div>` element always has the CSS class `topLink`, and additionally all classes listed in the member `class`.

        `remove` is a list of element IDs separated by spaces (e.g. `"id1 id2+"`).
        Each element (obtained via `document.getElementById`) is simply removed from the DOM.
        If the ID ends in '+',
        the parent element is removed instead.

        If `off` is defined, that entry is skipped.

    -   `extraCss?: Array<string>`
        Additional CSS for the page.
        The game simply adds a new CSS `<style>` tag to the page whose content is `extraCss.join('\n')`.

    The default value is exported as the constant `defaultCCQInfo`,
    and corresponds to the query response at the time of writing (2026-03-14).

-   `queryVersion: CCQVersion | (() => CCQVersion)`
    Cookie Clicker periodically queries <https://orteil.dashnet.org/data/version.json>
    to check whether a new version is available.
    The default value is
    ```json
    {
        "Cookie Clicker": {
            "v": 2.052,
            "updateNotes": "new building!"
        },
        "Cookie Clicker beta": {
            "v": 2.052,
            "updateNotes": "new building!"
        },
    }
    ```

    Cookie Clicker checks for a new version once every 30 minutes.
    If you provide a function (instead of a static value),
    that function will be called whenever the check is performed,
    so you may use that to dynamically change this option.

-   `cookieConsent: boolean`
    Unless set to 'false',
    the page includes the browser cookie `cookieconsent_dismissed=yes`,
    which dismisses the cookie consent dialog.

-   `saveGame: string|object`
    The starting save game.
    If it is a string, the value is stored as-is into `window.localStorage`
    prior to loading the game.
    If it is an object, it is first converted to a string using
    [`CCSave.fromObject` and `CCSave.toNativeSave`](CCSave.md#API).
    Defaults to empty.

-   `mockedDate: number | null`
    Initial value of `Date.now()`.
    Defaults to 1.6e12.

    There are several points in Cookie Clicker's code that rely on `Date.now()` advancing normally,
    so it is not viable to simply set `Date.now() = () => 1.6e12`.
    Cookie Connoisseur overwrites the global `Date` object with an implementation
    that fundamentally just subtracts `Date.now()` with an appropriate value
    to make it seem that the date has shifted to `mockedDate`.
    The default value is 1.6e12, which corresponds to 2020-09-13 12:26:40 UTC.

    Explicitly setting `mockedDate` to null disables date mocking
    and prevents the global `Date` from being overwritten.

    This value is stored as `CConoisseur.mockedDate`, see [here](./BrowserUtilities.md) for details.

-   `forceDiscrepancy: number | null`
    Forces the [Lump Timestamp Computation Discrepancy](./discrepancy.md) bug to happen,
    with the given discrepancy.
    Set to `null` to disable this feature.
    Defaults to `null`.

    Only available if `mockedDate` is not null,
    and if the save file has all achievements and does not own Century egg.
    (The last two interfere in the timings, so Cookie Connoisseur simply disallows them.)

-   `waitForMinigames: boolean`
    Whether to wait or not to wait for minigames to load before returning the page.
    Defaults to true.

    Minigames load whenever the corresponding building's level is at least 1
    (even if the building wasn't purchased yet).
    Cookie Connoisseur only waits for minigames to load if the level of the corresponding building
    is at least one.
    Note that setting this to `false` is _not_ an effective way of guaranteeing that
    the minigame will not be loaded;
    you have to set the corresponding building level to zero,
    and level it up inside your script.

    As a safeguard,
    if the `language` option is explicitly set to `null`,
    this option is treated as `false` regardless of its value.

-   `language: string | null`
    Chooses which localization file to use.
    Defaults to `'EN'`.

    The value of this option must be one of the available languages
    (`'CS'`, `'DA'`, `'DE'`, `'EN'`, `'ES'`, `'FR'`, `'IT'`, `'JA'`, `'KO'`,
    `'NL'`, `'NO'`, `'PL'`, `'PT-BR'`, `'RU'`, `'SV'`, `'ZH-CN'`),
    or `null`.

    If explicitly set to `null`,
    no language option is chosen,
    and the returned `Page` will be in the language selection menu.
    In this case,
    the `waitForMinigames` option is ignored.

-   `routingFallback?: (route: Route) => Promise<void>`
    Fallback for handling routes which are not accounted for by Cookie Connoisseur.
    Defaults to essentially `route => route.continue();`,
    which simply forwards the route to the Internet.

    Cookie Connoisseur will intercept several requests,
    for example by using a file downloaded by `npx cookie-connoisseur fetch`
    instead of letting the browser get it from the Internet.
    However,
    if Cookie Connoisseur does not know how to handle some request
    (say, some mod queries a page which is not declared in the
    [config file](../README.md#configuration-file)),
    it will call this function instead.

    For example,
    the actual default value for `routingFallback` is
    ```typescript
    (route: Route) => {
        if(config.verbose >= 1) {
            console.log(`No route configured for ${route.request().url()}, using the Internet...`);
        }
        return route.continue();
    }
    ```

    Routing is done via [page.route](https://playwright.dev/docs/api/class-page#page-route).
    If you register conflicting routes,
    [the later routes take precedence](https://github.com/microsoft/playwright/issues/7394),
    so you may override any route established by Cookie Connoisseur
    by just registering a new route.
