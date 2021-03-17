import { promises as fsPromises } from 'fs';
import { dirname } from 'path';
import { localPathOfURL } from './cookie-clicker-cache.js';
import { firefox } from 'playwright';
import { urls } from './url-list.js';

setTimeout(async () => {
    let browser = await firefox.launch();
    let page = await browser.newPage();
    let path: string;
    let currentURL: string;
    page.on('response', async response => {
        console.log('Request for ' + response.url());
        if(Math.floor(response.status()/100) == 2 && response.url() == currentURL) { // Success
            console.log('Writing ' + path);
            await fsPromises.writeFile(path, await response.body());
        }
    })
    for(let {url} of urls) {
        currentURL = url;
        path = localPathOfURL(url);
        await fsPromises.mkdir(dirname(path), {recursive:true});
        await page.goto(url);
    }
    await page.close();
    await browser.close();
});
