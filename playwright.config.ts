import { PlaywrightTestConfig } from '@playwright/test';

/* Several tests (like the ones testing CCSave.fromObject and friends)
 * are independent of the browser,
 * so we don't duplicate their execution across several different browsers.
 *
 * The tests that matches the non-browser tests are run in the project "Utilities".
 * However we still define `browserName` for those tests
 * because Cookie Clicker is used to manufacture edge cases for some of them.
 */
let nonBrowserTests = ['test/ccsave.test.ts', 'test/util.test.ts'];

const config: PlaywrightTestConfig = {
    projects: [
        {
            name: 'Chromium',
            use: {
                browserName: 'chromium',
            },
            testIgnore: nonBrowserTests,
        },
        {
            name: 'Firefox',
            use: {
                browserName: 'firefox',
            },
            testIgnore: nonBrowserTests,
        },
        // TODO: Add WebKit
        {
            name: 'Utilities',
            use: {
                browserName: 'chromium',
            },
            testMatch: nonBrowserTests,
        },
    ],
};

export default config;
