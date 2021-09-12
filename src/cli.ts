/* This file handles the command-line interface for Cookie Connoisseur.
 */
const package_json = require('../package.json');
import { fetchFiles } from './cli-fetch';
import { firefox } from 'playwright';
import { openCookieClickerPage } from './cookie-clicker-page';
import { CCSave } from './ccsave';
import { prettyPrintCCSave } from './pretty-print-ccsave';

process.stdin.setEncoding('utf8');

let helpString =
    "usage: npx cookie-connoisseur <command>\n" +
    "where <command> is one of\n" +
    "   fetch - Downloads a local copy of Cookie Clicker\n" +
    "           and of the files specified in cookie-connoisseur.config.json\n" +
    "   launch - Launches a Cookie Clicker instance\n" +
    "   native-to-json - Parses stdin, which must be a save file\n" +
    "           in Cookie Clicker's native save format, to a JSON format\n" +
    "   json-to-native - Converts the JSON in stdin back to a save file\n" +
    "";

let args = process.argv.slice(2);

function writeJsonSaveFormat(args: string[]) {
    if(args.length != 0) {
        console.error('usage: npx cookie-connoisseur native-to-json');
        process.exit(1);
    }

    process.stdin.on('readable', () => {
        let str = process.stdin.read();
        if(!str) return;

        let save = CCSave.fromStringSave(str);
        console.log(prettyPrintCCSave(save));
    });
}

function writeNativeSaveFormat(args: string[]) {
    if(args.length != 0) {
        console.error('usage: npx cookie-connoisseur json-to-native');
        process.exit(1);
    }

    process.stdin.on('readable', () => {
        let str = process.stdin.read();
        if(!str) return;
        str = str.trim();

        let save = CCSave.fromObject(JSON.parse(str), console.error);

        console.log(CCSave.toStringSave(save));
    });
};

function launchCookieClickerInstance(args: string[]) {
    if(args.length != 0) {
        console.error('usage: npx cookie-connoisseur launch');
        process.exit(1);
    }

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

switch(args[0]) {
    case 'fetch':
        fetchFiles(args.splice(1));
        break;
    case 'launch':
        launchCookieClickerInstance(args.splice(1));
        break;
    case 'native-to-json':
        writeJsonSaveFormat(args.splice(1));
        break;
    case 'json-to-native':
        writeNativeSaveFormat(args.splice(1));
        break;
    case '--help':
        console.log(helpString);
        break;
    case '--version':
        console.log(package_json.version);
        break;
    default:
        console.error(helpString);
        process.exit(1);
        break;
}
