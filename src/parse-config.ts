/* Utilities for parsing the configuration file.
 */

import { promises as fsPromises, existsSync } from 'fs';

export type CookieConnoisseurConfig = {
    customURLs: {
        [url: string]: {
            path?: string,
        }
    },
}

export const configPath = 'cookie-connoisseur.config.json';

export async function parseConfigFile(): Promise<CookieConnoisseurConfig> {
    if(!existsSync(configPath)) {
        return {customURLs: {}};
    }

    let config: CookieConnoisseurConfig = {customURLs: {}};
    let content = JSON.parse(await fsPromises.readFile(configPath, {encoding: 'utf8'}));
    if(!('customURLs' in content)) return config;

    for(let obj of content.customURLs) {
        if('url' in obj && typeof obj.url == 'string') {
            config.customURLs[obj.url] = {};
            if('path' in obj && typeof obj.path == 'string')
                config.customURLs[obj.url].path = obj.path;
        }
    }

    return config;
}
