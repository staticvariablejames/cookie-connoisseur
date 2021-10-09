Utilities Installed in the Browser
==================================

In the page returned by [`openCookieClickerPage`](./openCookieClickerPage.md),
Cookie Connoisseur injects the `CConnoisseur` object in the global scope.

Importing any object from the `cookie-connoisseur` package
also adds a global declaration of this object;
this allows, for example,
for `tsc` to type-check code like
```typescript
    await page.evaluate(() => CConnoisseur.clearNewsTickerText());
```

Note that this object is _not_ defined in the Node.js environment,
only in the browser environment.

`CConnoisseur` attributes:

-   `mockedDate: number`
    The Cookie Connoisseur implementation of a `Date.now()` mock.
    There are several game mechanics that rely on `Date.now()` advancing normally,
    so it is not viable to simply set `Date.now() = () => 1.6e12`.
    The compromise is setting a base starting date
    and let `Date.now()` increment normally beyond that.
    `CConnoisseur.mockedDate` is precisely this base starting date.
    The default value is 1.6e12, which corresponds to 2020-09-13 12:26:40 UTC.

    This value can be changed via `page.evaluate`;
    for example,
    ```typescript
    await page.evaluate( () => { window.CConnoisseur.mockedDate = 1.7e12 } );
    ```
    is equivalent to advancing the system clock by one hour.

-   `clearNewsTickerText: () => void`
    This function simply modifies the DOM to make the news ticker text empty.
    This is mostly useful for [snapshot testing](https://playwright.dev/docs/test-snapshots);
    since the news ticker is random,
    clearing the news ticker before taking a snapshot prevents it from becoming flaky.

-   `setSliderValue: (e: Element, value: number) => number`
    Changes the given HTML element to the given value,
    dispatches the appropriate events,
    and simply returns the value.

    Currently,
    [Playwright cannot change range inputs](https://github.com/microsoft/playwright/issues/4231#issuecomment-716049872),
    like changing the volume slider;
    this function mitigates this issue.

    This function can be used with
    [`page.$eval`](https://playwright.dev/docs/api/class-page#page-eval-on-selector);
    for example,
    ```typescript
    await page.$eval('text=Volume50% >> input', e => CConnoisseur.setSliderValue(e, 15));
    ```
    sets the volume slider to 15%.
    (The `text=Volume50%` is a trick to get Playwright to pick the entire `div`
    containing the slider, rather than just the `Volume` label.)

-   `gainLumps: (lumpsToGain: number) => void`
    Awards the given number of lumps.

    In Cookie Clicker,
    sugar lumps can only be gained (and used)
    if the player has more than a billion cookies baked all time.
    If the player has less than this,
    this function first `Game.Earn`s the minimum amount needed before calling `Game.gainLumps`,
    so that all lump-related abilities
    (like leveling up buildings)
    can be used right after `CConnoisseur.gainLumps`.

-   `warpTimeToFrame: (frame: number) => void`
    Sets the variable `Game.T` to `frame`,
    advances `Game.mockedDate` by the corresponding amount,
    and sets `Game.prefs.autosave` to `0` if there are no save games.
    It silently does nothing if `Game.T >= frame`.

    `Game.T` is essentially a frame counter.
    It is set to zero on initialization, game loading, ascension and wipe save,
    and incremented by one every frame (`1000/Game.fps` ms).
    It is one of the things Cookie Clicker used by Cookie Clicker to keep track of time
    (the other one being `Date.now()`).
    For example, the `check` hook is run whenever `Game.T` is a multiple of `5 * Game.fps`,
    resulting in one check every 5 seconds.

    Note that this function does _not_ add cookies, tick minigames etc.,
    just `Game.T` and `Date.now()` are forwarded in time.

    Caution regarding save games:
    if Cookie Clicker fails to load a save game at the very beginning,
    it will try to load the save game again 500ms later.
    Therefore, if the test started without save games,
    no game should be saved between the game loading and this 500ms window passing,
    lest `Game.T` will be reset to `0` again.
    This is why `warpTimeToFrame` sets `Game.prefs.autosave` to `0` if there are no save games;
    the game saves once per minute,
    so by calling e.g. `Game.warpTimeToFrame(60 * Game.fps - 1)` in the beginning of a test
    a save game could be written within the 500ms window
    if `Game.prefs.autosave` wasn't set to `0`.

-   `ascend: () => void`
    Ascends, skipping the ascension animation and stopping at the legacy upgrade tree.
    It does nothing if it is already on the ascension screen.

-   `reincarnate: () => void`
    Reincarnates, skipping the reincarnation animation.
    It does nothing if it is already out the ascension screen.

-   `redrawMarketMinigame: () => void`
    Forces the stock market to redraw all of its good panels and data like office level.

    In order to force a full redraw,
    this function increases `Game.drawT` a few times.

    Nothing happens if the minigame hasn't loaded.
