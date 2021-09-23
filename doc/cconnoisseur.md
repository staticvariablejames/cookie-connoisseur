Utilities Installed in the Browser
==================================

In the page returned by [`openCookieClickerPage`](./openCookieClickerPage.md),
Cookie Connoisseur injects the `CConnoisseur` object in the global scope.

This object currently has only one attribute:
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
