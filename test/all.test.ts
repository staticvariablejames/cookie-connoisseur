import { Browser, chromium } from 'playwright';
import { browserUtilitiesTest } from './browser-utilities';
import { cookieClickerPageTest } from './cookie-clicker-page';

let browser: Browser;

beforeAll(async () => {
    browser = await chromium.launch();
});
afterAll(async () => {
    await browser.close();
});

describe('Browser Utilities Test', () => browserUtilitiesTest(() => browser));
describe('Cookie Clicker Page Test', () => cookieClickerPageTest(() => browser));
