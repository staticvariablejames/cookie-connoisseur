/* This file handles the command-line interface for Cookie Connoisseur.
 */
import { fetchFiles } from './fetch-cookie-clicker-files';
import { launchCookieClickerInstance } from './launch-cookie-clicker-instance';
import { writeNativeSaveFormat } from './json-to-ccsave';
import { writeJsonSaveFormat } from './ccsave-to-json';

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

if(args.length !== 1) {
    console.error(helpString);
    process.exit(1);
}

switch(args[0]) {
    case 'fetch':
        fetchFiles();
        break;
    case 'launch':
        launchCookieClickerInstance();
        break;
    case 'native-to-json':
        writeJsonSaveFormat();
        break;
    case 'json-to-native':
        writeNativeSaveFormat();
        break;
    case '--help':
        console.log(helpString);
        break;
    default:
        console.error(helpString);
        process.exit(1);
        break;
}
