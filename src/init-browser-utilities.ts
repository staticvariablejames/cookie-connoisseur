/* This script is run inside the browser,
 * before index.html is loaded.
 */

/// <reference path="../src/browser-utilities.d.ts" />

export function initBrowserUtilities() {
    let CConnoisseur = window.CConnoisseur = {
        mockedDate: 1600000000000, // 2020-09-13 12:26:40 UTC
        currentDate: Date.now(),
        dateNow: Date.now,
    };

    Date.now = () => CConnoisseur.dateNow() - CConnoisseur.currentDate + CConnoisseur.mockedDate;
}
