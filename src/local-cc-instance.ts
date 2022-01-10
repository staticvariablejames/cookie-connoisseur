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
import { sha1sumFromBuffer } from './util';

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
 *  - sha1sum: the checksum that this file will be compared against.
 *  - verbose: verbosity level.
 *      If at least 1, will warn about a mismatched sha1sum.
 *      If at least 2, will warn if sha1sum is not provided.
 *      Defaults to 1.
 *  - callback: Function that is called after the file path is written.
 *      Defaults to async () => {}.
 */
type DownloadingListenerOptions = {
    prefix?: string,
    sha1sum?: string,
    verbose?: number,
    callback?: () => Promise<void>,
};
export function makeDownloadingListener(url: string, options: DownloadingListenerOptions = {}) {
    if(!('prefix' in options)) {
        options.prefix = './';
    }
    if(!('callback' in options)) {
        options.callback = async () => {};
    }
    if(!('verbose' in options)) {
        options.verbose = 1;
    }
    url = normalizeURL(url);
    let path = options.prefix + '/' + localPathOfURL(url);
    let handler = async (response: Response) => {
        if(response.ok() && normalizeURL(response.url()) == url) { // Success
            let responseBody;
            try {
                /* Playwright might close before the handler runs,
                 * so we must surround this with try-catch
                 */
                responseBody = await response.body();
            } catch (e) {
                if(options.verbose! >= 2) {
                    console.log(`Couldn't get response body for ${url}: ${e}`);
                }
                return; // Nothing we can do here
            }
            await fsPromises.mkdir(dirname(path), {recursive: true});
            await fsPromises.writeFile(path, responseBody);
            await response.frame().page().removeListener('response', handler);
            if(options.verbose! >= 2 && !('sha1sum' in options)) {
                console.log(`Missing expected sha1sum for ${url}`);
            }
            if(options.verbose! >= 1 && 'sha1sum' in options) {
                let sha1sum = sha1sumFromBuffer(responseBody);
                if(sha1sum !== options.sha1sum) {
                    console.log(`sha1sum(${path}) = ${sha1sum}` +
                                ` differs from expected ${options.sha1sum}`);
                }
            }
            await options.callback!();
        }
    };
    return handler;
}
