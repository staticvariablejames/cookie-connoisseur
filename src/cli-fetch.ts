/* This file contains the implementation of the 'cookie-connoisseur fetch' subcommand.
 */
import { access as fsAccess } from 'fs/promises';
import { localPathOfURL, makeDownloadingListener } from './local-cc-instance';
import { firefox } from 'playwright';
import { URLDirectory } from './url-list';
import { liveURLs as builtinURLs } from './url-list-live';
import { CookieConnoisseurConfig, parseConfigFile } from './parse-config';

const helpString =
    "usage: npx cookie-connoisseur fetch [options]\n" +
    "Downloads a local copy of Cookie Clicker.\n" +
    "Options:\n" +
    "   --help      Show this help\n" +
    "   --save-prefix <path>\n" +
    "               Creates the .cookie-connoisseur directory under the given path\n"
    "               Default: './'\n" +
    "   --skip-existing\n" +
    "               Do not redownload files that already exist inside .cookie-cliker.\n" +
    "";

class FetchOptions {
    dir: string = './';
    skipExisting: boolean = false;
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
            case '--save-prefix':
                if(args[1] === undefined) {
                    console.error(helpString);
                    process.exit(1);
                }
                options.dir = args[1];
                args.shift();
                break;
            case '--skip-existing':
                options.skipExisting = true;
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

async function fileExists(path: string) {
    try {
        await fsAccess(path);
        return true;
    } catch {
        return false;
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

        if(options.skipExisting) {
            if(await fileExists(localPathOfURL(url))) {
                if(config.verbose >= 1) {
                    console.log(`Skipping ${url}`);
                }
                continue;
            } else {
                if(config.verbose >= 1) {
                    console.log(`Downloading ${url}...`);
                }
            }
        }

        // Step 1: register the downloader
        let outerCallback = () => {};
        await page.on('response',
            makeDownloadingListener(url, {
                prefix: options!.dir,
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
