/* This file contains the implementation of the 'cookie-connoisseur launch' subcommand.
 */
import { chromium, firefox, webkit, BrowserType } from 'playwright';
import { openCookieClickerPage, CCPageOptions } from './cookie-clicker-page';

const helpString =
    "usage: npx cookie-connoisseur launch[options]\n" +
    "Launches a Cookie Clicker instance.\n" +
    "Options:\n" +
    "   --help      Show this help\n" +
    "   --browser [chromium | firefox | webkit]\n" +
    "               Chooses the browser. Default: firefox\n" +
    "   --ccsave <save string>\n" +
    "               Uses the given string as the saved game.\n" +
    "   --no-date-mock, --no-mock-date\n" +
    "               Disable date mocking.\n" +
    "";

class LaunchOptions {
    browser: BrowserType = firefox;
    doMockDate: boolean = true;
    saveGame: string | null = null;
};

function parseCommandLineArgs(args: string[]) {
    let options = new LaunchOptions();
    while(args.length > 0) {
        switch(args[0]) {
            case '--help':
                console.log(helpString);
                return null;
                break;
            case '--browser':
                switch(args[1]) {
                    case 'chromium': options.browser = chromium; break;
                    case 'firefox':  options.browser = firefox;  break;
                    case 'webkit':   options.browser = webkit;   break;
                    default:
                        console.error('Must specify one of chromium, firefox, webkit');
                        process.exit(1);
                }
                args.shift();
                break;
            case '--ccsave':
                if(args[1] === undefined) {
                    console.error(helpString);
                    process.exit(1);
                }
                options.saveGame = args[1];
                args.shift();
                break;
            case '--no-mock-date':
            case '--no-date-mock':
                options.doMockDate = false;
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

export function launchCookieClickerInstance(args: string[]) {
    let options = parseCommandLineArgs(args);
    if(options == null) return;

    let pageOptions: CCPageOptions = {};
    if(!options.doMockDate) {
        pageOptions.mockedDate = null;
    }
    if(options.saveGame) {
        pageOptions.saveGame = options.saveGame;
    }

    pageOptions.routingFallback = route => {
        console.log(`Internet request fallback for ${route.request().url()}`);
        return route.continue();
    };

    setTimeout(async () => {
        let browser = await options!.browser.launch( {headless: false} );
        let page = await openCookieClickerPage(browser, pageOptions);
        await new Promise(resolve => {
            page.on('close', () => {
                resolve(true);
            });
        });
        await browser.close();
    });
}
