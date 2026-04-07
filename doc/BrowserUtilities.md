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

-   `mockedDate: number | null`

    The value set as `mockedDate` when [opening a Cookie Clicker page](openCookieClickerPage.md).
    If date mocking was disabled,
    this value is set to null.

    If non-null,
    this value can be changed via `page.evaluate`;
    for example,
    ```javascript
    await page.evaluate( () => { window.CConnoisseur.mockedDate += 3600*1000 } );
    ```
    is equivalent to advancing the system clock by one hour.

    Note that changing this attribute from null to non-null will _not_ enable date mocking,
    and likewise changing the attribute from non-null to null will _not_ disable date mocking.

-   `realDate: typeof Date`
    The global object `window.Date`,
    before being overwritten for date mocking.
    (`CConnoisseur.realDate` will store `window.Date` even if date mocking is disabled.)

-   `clearNewsTickerText: () => void`
    This function simply modifies the DOM to make the news ticker text empty.
    This is mostly useful for [snapshot testing](https://playwright.dev/docs/test-snapshots);
    since the news ticker is random,
    clearing the news ticker before taking a snapshot prevents it from becoming flaky.

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

    Cannot be used if `mockedDate` was set to `null`.

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

-   `startGrandmapocalypse: () => void`
    Perform the necessary tasks to start the Grandmapocalypse.

    If needed,
    it will purchase a grandma, One Mind, and revoke the Elder Covenant.
    Nothing happens if the Grandmapocalypse already started.

-   `spawnReindeer: (spawnLead?: boolean) => Game.Shimmer`
    Spawns a reindeer,
    even if it is not Christmas.
    By default,
    the spawned reindeer is a spawn lead,
    which is accounted for the `Game.reindeerClicked` tally when popped.
    Explicitly pass `false` as the argument to disable this.

-   `spawnWrinkler: (id?: number) => number`
    Spawns a wrinkler.
    If `id` is provided,
    this is the wrinkler id that will be used
    (the index in `Game.wrinklers`);
    otherwise, a random one is chosen among the available ones.

    The spawned wrinkler will be set to be already sucking cookies,
    so popping it counts towards `Game.wrinklersPopped`.

    On success, it returns the wrinkler id.
    On failure
    (outside the grandmapocalypse,
    all wrinkler spots already taken,
    or invalid id),
    returns -1.

-   `popWrinkler: (id: number) => boolean`
    Pops the wrinkler with the given id,
    returning true in case of success and false otherwise
    (invalid id, or the given wrinkler is already dead).

    This function automatically calls `Game.UpdateWrinklers()`,
    to make sure the wrinkler dies and the wrinkler death events are processed.

-   `clickBigCookie: () => void`
    Clicks the Big Cookie.

    Cookie Clicker has some mechanisms to prevent the big cookie from being clicked too often,
    so clicking twice in a script means only the first click is registered.
    Calling this method bypasses those restrictions.

-   `closeNotes: () => void`
    Close all notes (created with `Game.Notify`)
    and replaces `Game.Notify` with an empty function.

    This is intended for snapshot testing.
    It prevents notifications
    (from getting achievements, for example)
    from randomly modifying the screenshot.
