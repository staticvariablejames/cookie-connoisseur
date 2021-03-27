/* Utilities for parsing the configuration file.
 */

import { promises as fsPromises, existsSync } from 'fs';

export type CookieConnoisseurConfig = {
    customUrls: {
        [url: string]: {
            path?: string,
        }
    },
}

export const configPath = 'cookie-connoisseur.config.json';

export async function parseConfigFile(): Promise<CookieConnoisseurConfig> {
    if(!existsSync(configPath)) {
        return {customUrls: {}};
    }

    let config: CookieConnoisseurConfig = {customUrls: {}};
    let content = JSON.parse(await fsPromises.readFile(configPath, {encoding: 'utf8'}));
    if(!('customUrls' in content)) return config;

    for(let obj of content.customUrls) {
        if('url' in obj && typeof obj.url == 'string') {
            config.customUrls[obj.url] = {};
            if('path' in obj && typeof obj.path == 'string')
                config.customUrls[obj.url].path = obj.path;
        }
    }

    return config;
}
