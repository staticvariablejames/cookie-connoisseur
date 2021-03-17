/* This package manages a local copy of Cookie Clicker.
 * The files listed in url-list.ts
 * are downloaded by fetch-cookie-clicker-files.ts
 * and the playwright Page constructed by cookie-clicker-page.ts
 * uses those files instead of querying the Internet.
 *
 * This file contains utilities for managing this cache.
 */

export function localPathOfURL(url: string) {
    return '.cookie-connoisseur/' + url.replace(/https?:\/\//, '');
}
