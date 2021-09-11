/* This package manages a local copy of Cookie Clicker.
 * The files listed in url-list.ts
 * are downloaded by fetch-cookie-clicker-files.ts
 * and the playwright Page constructed by cookie-clicker-page.ts
 * uses those files instead of querying the Internet.
 *
 * This file contains utilities for managing this cache.
 */
import { Response } from 'playwright';
import { promises as fsPromises } from 'fs';
import { urlsToDrop } from './url-list';

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
 */
export function makeDownloadingListener(url: string) {
    url = normalizeURL(url);
    let path = localPathOfURL(url);
    let handler = async (response: Response) => {
        if(response.ok() && normalizeURL(response.url()) == url) { // Success
            await fsPromises.writeFile(path, await response.body());
            await response.frame().page().removeListener('response', handler);
        }
    };
    return handler;
}
