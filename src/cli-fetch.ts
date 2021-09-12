/* This file contains the implementation of the 'cookie-connoisseur fetch' subcommand.
 */
import { existsSync } from 'fs';
import { localPathOfURL, makeDownloadingListener } from './local-cc-instance';
import { chromium } from 'playwright';
import { cacheURLs } from './url-list';
import { parseConfigFile } from './parse-config';

const helpString =
    "usage: npx cookie-connoisseur fetch [options]\n" +
    "Downloads a local copy of Cookie Clicker.\n" +
    "Options:\n" +
    "   --force     Downloads all files,\n" +
    "               even if they already exist in the target directory\n" +
    "   --help      Show this help\n" +
    "   --save-prefix <path>\n" +
    "               Creates the .cookie-connoisseur directory under the given path\n"
    "               Default: './'\n" +
    "";

class FetchOptions {
    force: boolean = false;
    dir: string = './';
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
            case '--force':
                options.force = true;
                break;
            case '--save-prefix':
                if(args[1] === undefined) {
                    console.error(helpString);
                    process.exit(1);
                }
                options.dir = args[1];
                args.shift();
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

/* Constructs the set of URLs that have to be downloaded.
 * If 'force' is true, all URLs will be downloaded;
 * otherwise, only the URLs whose local path does not exist.
 */
async function urlsToDownload(options: FetchOptions) {
    let config = await parseConfigFile();
    let urlList: string[] = [];
    for(let url in cacheURLs) {
        if(!url.endsWith('/favicon.ico')) {
            /* Playwright does not emit events if the URL ends in '/favicon.ico'.
             * I'm not sure why;
             * Googling suggests it is because browsers use a favicon cache.
             * TODO: implement alternative favicon downloader.
             */
            urlList.push(url);
        }
    }
    for(let url in config.customURLs) {
        if(!url.endsWith('/favicon.ico')) {
            urlList.push(url);
        }
    }

    if(options.force) return urlList;

    return urlList.filter(url => {
        let path = options.dir + localPathOfURL(url);
        return !existsSync(path);
    });
}

/* args should essentially be process.argv.splice(3);
 * that is, only the command-line options concerning the fetch subcommand.
 */
export function fetchFiles(args: string[]) {
    let options = parseCommandLineArgs(args);
    if(options == null) return;

    setTimeout(async () => {
        let browser = await chromium.launch();
        let page = await browser.newPage();
        let urlList = await urlsToDownload(options!);

        for(let url of urlList) {
            console.log(`Downloading ${url}...`);

            // Step 1: register the downloader
            let outerCallback = () => {};
            await page.on('response',
                makeDownloadingListener(url, {
                    prefix: options!.dir,
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
    });
}
