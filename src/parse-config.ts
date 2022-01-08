/* Utilities for parsing the configuration file.
 */

import { promises as fsPromises, existsSync } from 'fs';

export type CookieConnoisseurConfig = {
    customURLs: {
        [url: string]: {};
    },
    localFiles: {
        [url: string]: {
            path: string;
        };
    },
    localDirectories: {
        [urlPrefix: string]: {
            path: string;
        };
    },
    verbose: number,
}

export const configPath = 'cookie-connoisseur.config.json';

export async function parseConfigFile(): Promise<CookieConnoisseurConfig> {
    let config: CookieConnoisseurConfig = {
        customURLs: {},
        localFiles: {},
        localDirectories: {},
        verbose: 1,
    };

    if(!existsSync(configPath)) {
        return config;
    }

    let content = JSON.parse(await fsPromises.readFile(configPath, {encoding: 'utf8'}));
    if(!content || typeof content != "object")
        return config;

    if('customURLs' in content && Array.isArray(content['customURLs'])) {
        for(let obj of content.customURLs) {
            if('url' in obj && typeof obj.url == 'string') {
                config.customURLs[obj.url] = {};
            }
        }
    }

    if('localFiles' in content && Array.isArray(content['localFiles'])) {
        for(let obj of content.localFiles) {
            if('url' in obj && typeof obj.url == 'string') {
                if('path' in obj && typeof obj.path == 'string')
                    config.localFiles[obj.url] = {path: obj.path};
            }
        }
    }

    if('localDirectories' in content && Array.isArray(content['localDirectories'])) {
        for(let obj of content.localDirectories) {
            if('url' in obj && typeof obj.url == 'string') {
                if('path' in obj && typeof obj.path == 'string')
                    config.localDirectories[obj.url] = {path: obj.path};
            }
        }
    }

    if('verbose' in content) {
        config.verbose = Number(content.verbose);
    }

    return config;
}
