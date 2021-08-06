/* This script is run inside the browser,
 * before index.html is loaded.
 */

/// <reference path="../src/browser-utilities.d.ts" />

export type BrowserUtilitiesOptions = {
    mockedDate?: number;
}

export function initBrowserUtilities(options: BrowserUtilitiesOptions = {}) {
    let mockedDate = options.mockedDate ?? 1.6e12; // 2020-09-13 12:26:40 UTC
    let currentDate = Date.now();
    let realDate = Date;

    let newDate = Object.assign(
        function(this: Date, ...args : any[]) {
            if(args.length == 0) {
                if(this) {
                    return new realDate(newDate.now());
                }
                else
                    return (new realDate(newDate.now())).toString();
            } else {
                // @ts-ignore
                return new realDate(...args);
            }
        },
        {
            now: () => realDate.now() - currentDate + window.CConnoisseur.mockedDate,
            parse: realDate.parse,
            UTC: realDate.UTC,
        }
    );
    // @ts-ignore (I couldn't figure out how to convince Typescript that this works)
    Date = newDate;

    window.CConnoisseur = {mockedDate};
}
