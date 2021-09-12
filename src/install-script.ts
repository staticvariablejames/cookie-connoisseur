/* If this package were to be installed in /path/to/my/mod,
 * we would like to create /path/to/my/mod/.cookie-connoisseur.
 * However, simply setting 'npx cookie-connoisseur fetch' as the 'install' hook does not work,
 * because the executable would be run on /path/to/my/mod/node_modules/cookie-connoisseur,
 * and we'd end up with /path/to/my/mod/node_modules/cookie-connoisseur/.cookie-connoisseur.
 *
 * So we have to find an alternative.
 * Thankfully,
 * scripts that are executed by NPM during lifecycle events
 * set the environment variable npm_config_local_prefix
 * to /path/to/my/mod, so we use that instead.
 */

import { fetchFiles } from './cli-fetch';

let prefix = process.env.npm_config_local_prefix;
if(!prefix) {
    console.error("process.env.npm_config_local_prefix not defined;\n" +
                  "Please run 'npx cookie-connoisseur fetch' manually after installation.");
    process.exit(0);
}

fetchFiles(['--save-prefix', prefix]);
