# Changelog

## Unreleased
- Added: `CCSave.fromObject` automatically sets `building.highest` if absent.
- Added: `CConnoisseur.clearNewsTickerText`, which makes the text in the news ticker empty.
- Added: `CConnoisseur.setSliderValue`, which sets the value of a range input.
- Change: Rename `CCSave.fromStringSave` to `CCSave.fromNativeSave`
    and `CCSave.toStringSave` to `CCSave.toNativeSave`. (**breaking**)
- Fixed: `setupCookieClickerPage` and `CConnoisseur` were not being exported.

## 0.1.3 - 2021-09-13
- Added: Class `CCSave` can now handle Cookie Clicker versions up to 2.042
    (the current version of the Steam port).
- Added: if a file which should be downloaded by `npx cookie-connoisseur fetch` is missing
    (for example, right after adding a new file to `cookie-connoisseur.config.json`),
    it is downloaded on-the-fly.
- Added: `openCookieClickerPage` also accepts `BrowserContext`,
    and added a `setupCookieClickerPage` function accepting a `Page`.
- Change: the executable scripts are now aggregated under a single executable. (**breaking**)
- Change: Cookie Connoisseur now automatically downloads a copy of Cookie Clicker on installation,
    so running `npx cookie-conoisseur fetch` right after installation is not necessary anymore.
- Change: Options `heralds`, `grandmaNames` and `updatesResponse` for `openCookieClickerPage`
    are no longer queried dynamically from the options object.
    A function can be provided instead for this functionality.
    (**breaking**)

## 0.1.2 - 2021-08-31
- Added: Class `CCSave`, a JSON-like representation of a Cookie Clicker save.
- Added: Command line utility for parsing Cookie Clicker saves to a human-readable JSON format.
- Added: Field `saveGame` in `CCPageOptions` may be an object,
    which will be converted to `CCSave`.
- Added: Property `localDirectories` in the configuration file to reroute to entire directories.
- Change: `customURLs` in the configuration file that redirect to local files
    are now located under the `localFiles` attribute. (**breaking**)

## 0.1.1 - 2021-08-03
- Added: This changelog!
- Added: Made explicit that routes registered by Cookie Connoisseur may be overriden.
- Bugfix: Prevents routing errors from crashing Playwright.
    This should allow for parallel testing.

## 0.1.0 - 2021-07-29
- Added: Proper documentation in `README.md`.
- Added: Allow setting custom routes in the configuration file.

## 0.0.4 - 2021-03-25
- Added: `Date.now()` mocking.

## 0.0.3 - 2021-03-21
- Added: Autodismiss the cookie consent dialog.
- Added: Allow setting the save game prior to navigating to the Cookie Clicker page.

## 0.0.2 - 2021-03-19
- Added: script `launch-cookie-clicker-instance`,
    which launches an instance of Cookie Clicker using the cached pages.
- Added: Block Google/Facebook ads.
- Added: Intercept the query for heralds count and grandma names.
- Changed: Files are stored in `./.cookie-connoisseur/` instead of `./cache`.

## 0.0.1 - 2021-03-10
Initial release.
- Added: script `fetch-cookie-clicker-files`,
    which download a local copy of <https://orteil.dashnet.org/cookieclicker/>
    to `./cache/cookieclicker`.
