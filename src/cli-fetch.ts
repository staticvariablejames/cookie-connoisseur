/* This file contains the implementation of the 'cookie-connoisseur fetch' subcommand.
 */
import { readFile } from 'fs/promises';
import { localPathOfURL, makeDownloadingListener } from './local-cc-instance';
import { firefox } from 'playwright';
import { URLDirectory } from './url-list';
import { liveURLs as builtinURLs } from './url-list-live';
import { CookieConnoisseurConfig, parseConfigFile } from './parse-config';
import { sha1sumFromBuffer } from './util';

const helpString =
    "usage: npx cookie-connoisseur fetch [options]\n" +
    "Downloads a local copy of Cookie Clicker.\n" +
    "Options:\n" +
    "   --help      Show this help\n" +
    "   --skip-good-sha1sum\n" +
    "               Do not redownload files whose sha1sum match the expected sha1sum\n" +
    "   --skip-missing-sha1sum\n" +
    "               Do not redownload files without an expected sha1sum\n" +
    "   --skip-disabled-sha1sum\n" +
    "               Do not redownload files whose expected sha1sum was set to null\n" +
    "               (i.e. files whose sha1sum checking was explicitly disabled)\n" +
    "   --skip-existing\n" +
    "               Do not redownload files that already exist inside .cookie-cliker\n" +
    "               Equivalent to --skip-good-sha1sum --skip-missing-sha1sum --skip-disabled-sha1sum\n" +
    "";

class FetchOptions {
    skipGoodSha1sum: boolean = false;
    skipMissingSha1sum: boolean = false;
    skipDisabledSha1sum: boolean = false;
};

/* Parses the command line, returning a FetchOptions.
 * If the command line e.g. asks for --help,
 * returns null instead.
 */
function parseCommandLineArgs(args: string[]) {
    let options = new FetchOptions();
    while(args.length > 0) {
        switch(args[0]) {
            case '--help':
                console.log(helpString);
                return null;
                break;
            case '--skip-existing':
                options.skipGoodSha1sum = true;
                options.skipMissingSha1sum = true;
                options.skipDisabledSha1sum = true;
                break;
            case '--skip-good-sha1sum':
                options.skipGoodSha1sum = true;
                break;
            case '--skip-missing-sha1sum':
                options.skipMissingSha1sum = true;
                break;
            case '--skip-disabled-sha1sum':
                options.skipMissingSha1sum = true;
                break;
            default:
                console.error(helpString);
                process.exit(1);
                break;
        }
        args.shift();
    }

    return options;
}

/* Returns the sha1sum from the given file,
 * or null if the file cannot be accessed.
 */
export async function sha1sumFromFile(path: string) {
    try {
        let file = await readFile(path);
        return sha1sumFromBuffer(file);
    } catch (e) {
        return null;
    }
}

/* This is the function that actually does the fetching.
 */
async function downloadFiles(urls: URLDirectory, options: FetchOptions, config: CookieConnoisseurConfig) {
    let browser = await firefox.launch();
    let page = await browser.newPage();

    for(let url in urls) {
        if(url.endsWith('/favicon.ico')) {
            /* Playwright does not emit events if the URL ends in '/favicon.ico'.
             * I'm not sure why;
             * Googling suggests it is because browsers use a favicon cache.
             * TODO: implement alternative favicon downloader.
             */
            continue;
        }

        let actualSha1sum = await sha1sumFromFile(localPathOfURL(url));
        let expectedSha1sum = urls[url].sha1sum;
        if(actualSha1sum != null) { // File exists
            if(options.skipGoodSha1sum && actualSha1sum == expectedSha1sum) {
                if(config.verbose >= 2) {
                    console.log(`Skipping ${url} because its sha1sum ${actualSha1sum} matches expected`);
                }
                continue;
            }
            if(options.skipMissingSha1sum && expectedSha1sum === undefined) {
                if(config.verbose >= 2) {
                    console.log(`Skipping ${url} because the file exists and its expected sha1sum is missing`);
                }
                continue;
            }
            if(options.skipDisabledSha1sum && expectedSha1sum === null) {
                if(config.verbose >= 2) {
                    console.log(`Skipping ${url} because the file exists and sha1sum checking was disabled for it`);
                }
                continue;
            }
        }
        console.log(`Downloading ${url}...`);

        // Step 1: register the downloader
        let outerCallback = () => {};
        await page.on('response',
            makeDownloadingListener(url, {
                verbose: config.verbose,
                sha1sum: urls[url].sha1sum,
                callback: async () => {outerCallback();},
            })
        );

        // Step 2: create promise that resolves when the download is done
        let downloadWaiter = new Promise<void>(resolve => {
            outerCallback = resolve;
        });

        // Step 3: navigate to the page and wait
        await Promise.all([
            page.goto(url),
            downloadWaiter,
        ]);
    }

    await page.close();
    await browser.close();
}

/* args should essentially be process.argv.splice(3);
 * that is, only the command-line options concerning the fetch subcommand.
 */
export function fetchFiles(args: string[]) {
    let options = parseCommandLineArgs(args);
    if(options == null) return;

    setTimeout(async () => {
        let config = await parseConfigFile();
        let urls = {...builtinURLs, ...config.customURLs};
        await downloadFiles(urls, options!, config);
    });
}
