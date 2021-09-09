import { firefox } from 'playwright';
import { openCookieClickerPage } from './cookie-clicker-page';

export function launchCookieClickerInstance() {
    setTimeout(async () => {
        let browser = await firefox.launch( {headless: false} );
        let page = await openCookieClickerPage(browser);
        await new Promise(resolve => {
            page.on('close', () => {
                resolve(true);
            });
        });
        await browser.close();
    });
}
