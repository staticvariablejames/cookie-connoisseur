import { promises as fsPromises } from 'fs';
import { dirname } from 'path';
import { localPathOfURL } from './cookie-clicker-cache.js';
import { chromium, Page, Response } from 'playwright';
import { cacheURLs } from './url-list.js';
import { parseConfigFile } from './parse-config.js';

async function fetchUrl(page: Page, url: string) {
    if(url.endsWith('/favicon.ico')) {
        /* Playwright does not emit events if the URL ends in '/favicon.ico'.
         * I'm not sure why;
         * Googling suggests it is because browsers use a favicon cache.
         * TODO: implement alternative favicon downloader.
         */
        return;
    }

    console.log('Downloading ' + url);
    let currentURL = url;
    let path = localPathOfURL(url);
    await fsPromises.mkdir(dirname(path), {recursive:true});

    await new Promise(async resolve => {
        let handler = async (response: Response) => {
            if(response.ok() && response.url() == currentURL) { // Success
                await fsPromises.writeFile(path, await response.body());
                await page.removeListener('response', handler);
                resolve(true);
            }
        };
        await page.on('response', handler);
        await page.goto(url);
    });
};

setTimeout(async () => {
    let config = await parseConfigFile();
    let browser = await chromium.launch();
    let page = await browser.newPage();

    for(let url in cacheURLs) {
        await fetchUrl(page, url);
    }
    for(let url in config.customURLs) {
        if(!config.customURLs[url].path)
            await fetchUrl(page, url);
    }

    await page.close();
    await browser.close();
});
