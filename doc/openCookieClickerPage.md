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

-   `heralds: number | (() => number)`
    Heralds and Patreon-submitted grandma names are obtained by querying
    <https://orteil.dashnet.org/patreon/grab.php>. Cookie Connoisseur intercepts this query;
    `options.heralds` is the number used in the response.
    Defaults to 42.

-   `grandmaNames: string[] (() => string[])`
    list of names that some grandmas get if "Custom grandmas" is "ON".
    Names must not contain the pipe `|` character.
    Defaults to `["Custom grandma names", "See cookie-clicker-page.ts for details"]`.

-   `updatesResponse: string | (() => string)`
    Every 30 minutes Cookie Clicker checks for updates;
    this is the string fed to Game.CheckUpdatesResponse.
    The default value is '2.029|new stock market minigame!'.

-   `cookieConsent: boolean`
    Unless set to 'false',
    the page includes the browser cookie `cookieconsent_dismissed=yes`,
    which dismisses the cookie consent dialog.

-   `saveGame: string|object`
    The starting save game.
    If it is a string, the value is stored as-is into `window.localStorage`
    prior to loading the game.
    If it is an object, it is first converted to a string using
    [`CCSave.fromObject` and `CCSave.toNativeSave`](doc/CCSave.md#API).
    Defaults to empty.

-   `mockedDate: number`
    Initial value of CConnoisseur.mockedDate; see [here](./BrowserUtilities.md) for details.
    Defaults to 1.6e12.

-   `waitForMinigames: boolean`
    Whether to wait or not to wait for minigames to load before returing the page.
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
    (`'CS'`, `'DE', `'EN'`, `'ES'`, `'FR'`, `'IT'`, `'JA'`, `'KO'`,
    `'NL'`, `'PL'`, `'PT-BR'`, `'RU'`, `'ZH-CN'),
    or `null`.

    If explicitly set to `null`,
    no language option is chosen,
    and the returned `Page` will be in the language selection menu.
    In this case,
    the `waitForMinigames` option is ignored.

The first three options
(`heralds`, `grandmaNames` and `updatesResponse`)
are updated by the game every 60 minutes,
querying an appropriate page.
If you provide a function for these options,
the function will be called every time it is needed,
so you can use that to change those options dynamically.

Routing is done via [page.route](https://playwright.dev/docs/api/class-page#page-route).
If you register conflicting routes,
[the later routes take precedence](https://github.com/microsoft/playwright/issues/7394),
so you may override any route established by Cookie Connoisseur
by just registering a new route.
