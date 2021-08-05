# Changelog

## Unreleased
- Change: `customURLs` in the configuration file that redirect to local files
    are now located under the `localFiles` attribute. (**breaking**)
- Added: This changelog!

## 0.1.1 - 2021-08-03
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
