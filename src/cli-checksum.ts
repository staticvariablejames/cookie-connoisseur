/* This file contains the implementation of the 'cookie-connoisseur checksum' subcommand.
 */
import { readFile, writeFile } from 'fs/promises';
import { localPathOfURL } from './local-cc-instance';
import { URLDirectory } from './url-list';
import { liveURLs as builtinURLs } from './url-list-live';
import { parseConfigFile } from './parse-config';
import { sha1sumFromBuffer } from './util';

const helpString =
    "usage: npx cookie-connoisseur checksum [options]\n" +
    "Verifies the files of the local copy of Cookie Clicker.\n" +
    "Options:\n" +
    "   --update-database <path>, --update-url-database <path>\n" +
    "               Updates the sha1sums in the given file according to the local Cookie Clicker copy.\n" +
    "   --help      Show this help\n" +
    "";

class ChecksumOptions {
    updateDatabase: boolean = false;
    databasePath: string = '';
};

/* Parses the command line, returning a FetchOptions.
 * If the command line e.g. asks for --help,
 * returns null instead.
 */
function parseCommandLineArgs(args: string[]) {
    let options = new ChecksumOptions();
    while(args.length > 0) {
        switch(args[0]) {
            case '--help':
                console.log(helpString);
                return null;
                break;
            case '--update-database':
            case '--update-url-database':
                if(args[1] === undefined) {
                    console.error(helpString);
                    process.exit(1);
                }
                options.updateDatabase = true;
                options.databasePath = args[1];
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

/* List of pairs [url, checksum].
 */
type ChecksumList = [string,string][];

/* Verifies the checksums of all files in the given URLDirectory.
 * Returns a list of mismatched checksums.
 * Files without sha1sums an missing files are _not_ included in the returned list.
 */
async function verifyChecksums(urls: URLDirectory): Promise<ChecksumList> {
    let mismatches: ChecksumList = [];
    for(let url in urls) {
        if(url.endsWith('/favicon.ico')) {
            // We ignore favicons
            continue;
        }

        let path = localPathOfURL(url);
        try {
            let file = await readFile(path);
            if(urls[url].sha1sum) {
                let sha1sum = sha1sumFromBuffer(file);
                if(sha1sum !== urls[url].sha1sum) {
                    console.log(`sha1sum(${path}) = ${sha1sum}` +
                                ` differs from expected ${urls[url].sha1sum}`);
                    mismatches.push([url, sha1sum]);
                }
            } else {
                console.log(`Missing sha1sum for ${path}`);
            }
        } catch (e) {
            if(e instanceof Error && 'code' in e && e['code'] === 'ENOENT') {
                console.log(`Missing file ${path}`);
            }
        }
    }
    return mismatches;
}

async function updateDatabase(databasePath: string, mismatchedChecksums: ChecksumList) {
    let database = (await readFile(databasePath)).toString(); // TODO: error checking
    for(let [url, sha1sum] of mismatchedChecksums) {
        let urlIndex = database.indexOf(url);
        let sha1sumIndex = database.indexOf('sha1sum', urlIndex+1);
        let leftQuoteIndex = database.indexOf("'", sha1sumIndex+1);
        let rightQuoteIndex = database.indexOf("'", leftQuoteIndex+1);
        if(
            urlIndex === -1 ||
            sha1sumIndex === -1 ||
            leftQuoteIndex === -1 ||
            rightQuoteIndex === -1
        ) {
            // url not found in the database
            continue;
        }

        database = database.substring(0, leftQuoteIndex+1) + sha1sum + database.substring(rightQuoteIndex, database.length);
    }

    await writeFile(databasePath, database);
}

/* args should essentially be process.argv.splice(3);
 * that is, only the command-line options concerning the fetch subcommand.
 */
export function checksumFiles(args: string[]) {
    let options = parseCommandLineArgs(args);
    if(options == null) return;

    setTimeout(async () => {
        let config = await parseConfigFile();
        let urls = {...builtinURLs, ...config.customURLs};
        let mismatchedChecksums = await verifyChecksums(urls);
        if(options!.updateDatabase) {
            await updateDatabase(options!.databasePath, mismatchedChecksums);
        }
    });
}
