/* This package manages a local copy of Cookie Clicker.
 * The files listed in url-list.ts
 * are downloaded by fetch-cookie-clicker-files.ts
 * and the playwright Page constructed by cookie-clicker-page.ts
 * uses those files instead of querying the Internet.
 *
 * This file contains utilities for managing this cache.
 */
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
