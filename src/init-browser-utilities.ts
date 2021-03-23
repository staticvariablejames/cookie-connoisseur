/* This script is run inside the browser,
 * before index.html is loaded.
 */

/// <reference path="../src/browser-utilities.d.ts" />

export function initBrowserUtilities() {
    let mockedDate = 1600000000000; // 2020-09-13 12:26:40 UTC
    let currentDate = Date.now();
    let dateNow = Date.now;

    Date.now = () => dateNow() - currentDate + window.CConnoisseur.mockedDate;

    window.CConnoisseur = {mockedDate};
}
