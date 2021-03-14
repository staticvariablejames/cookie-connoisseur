import { mkdirSync, promises as fsPromises } from 'fs';
import { firefox } from 'playwright';
import { urls } from './url-list.js';

let baseURL = 'https://orteil.dashnet.org/cookieclicker/';

mkdirSync('cache/cookieclicker/', {recursive: true});

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
        currentURL = baseURL + url;
        path = 'cache/cookieclicker/' + url;
        await page.goto(currentURL);
    }
    await page.close();
    await browser.close();
});
