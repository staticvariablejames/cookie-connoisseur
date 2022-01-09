/* This package manages a local copy of Cookie Clicker.
 * The files listed in url-list-live.ts are downloaded by cli-fetch.ts.
 * The playwright Page constructed by cookie-clicker-page.ts uses those files
 * instead of querying the Internet.
 *
 * This file contains utilities for managing this cache.
 */
import { Response } from 'playwright';
import { promises as fsPromises } from 'fs';
import { dirname } from 'path';
import { liveURLsToDrop as urlsToDrop } from './url-list-live';

export function localPathOfURL(url: string) {
    return '.cookie-connoisseur/' + url.replace(/https?:\/\//, '');
}

// Returns true if the given url has any string in urlsToDrop as substring.
export function isForbiddenURL(url: string) {
    for(let forbiddenURL of urlsToDrop) {
        if(url.includes(forbiddenURL))
            return true;
    }
    return false;
}

/* For some reason, some URLs have a version attached at the end
 * (like 'main.js?v=2.089' instead of just 'main.js'),
 * even though accessing 'https://orteil.dashnet.org/cookieclicker/main.js'
 * yields the same page as 'main.js?v=2.089' and 'main.js?v=2.058'.
 * This function strips that version number if present.
 */
export function normalizeURL(url: string) {
    return url.replace(/\?v=.*/, '').replace(/\?r=.*/, '');
}

/* Constructs an event listener for the page.on('response') event.
 * If the page gets a successful response for the specified URL,
 * it saves the response body to localPathofURL
 * and remove itself from the page listener list.
 *
 * Options:
 *  - prefix: where the '.cookie-connoisseur' directory is located.
 *      Defaults to './'.
 *  - callback: Function that is called after the file path is written.
 *      Defaults to () => {}.
 */
export function makeDownloadingListener(url: string, options = {
    prefix: './',
    callback: async () => {},
})
{
    url = normalizeURL(url);
    let path = options.prefix + '/' + localPathOfURL(url);
    let handler = async (response: Response) => {
        if(response.ok() && normalizeURL(response.url()) == url) { // Success
            await fsPromises.mkdir(dirname(path), {recursive: true});
            await fsPromises.writeFile(path, await response.body());
            await response.frame().page().removeListener('response', handler);
            await options.callback();
        }
    };
    return handler;
}
