/* This file contains the type definitions for the URL listings.
 * The actual list is in url-list-live.ts.
 *
 * See src/local-cc-instance.ts for more details.
 */

/* The keys of the URLDirectory are the URLs of assets, .js files, .html files etc.
 * that should be downloaded and served locally by Cookie Connoisseur.
 * The values are the properties of each resource.
 */
export type URLDirectory = { // Better name needed
    [url: string]: {
        contentType?: string, // MIME type; deduced from extension if absent
        sha1sum?: string,
    }
};

/* This is a list of the URL prefixes that should be dropped
 * (like ad servers).
 */
export type DropURLList = string[];

/* The entry point (e.g. https://orteil.dashnet.org/cookieclicker/index.html).
 */
export type EntryURL = string;
