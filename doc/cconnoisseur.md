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
    this function mitigates it.

    This function can be used with
    [`page.$eval`](https://playwright.dev/docs/api/class-page#page-eval-on-selector);
    for example,
    ```typescript
    await page.$eval('text=Volume50% >> input', e => CConnoisseur.setSliderValue(e, 15));
    ```
    sets the volume slider to 15%.
    (The `text=Volume50%` is a trick to get Playwright to pick the entire `div`
    containing the slider, rather than just the `Volume` label.)
