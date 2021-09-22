/* This script is run inside the browser,
 * before index.html is loaded.
 */

declare global {
    interface Window {
        /* The global CConnoisseur is declared in src/index.ts
         * This ensures that CConnoisseur is exported in lib/index.d.ts
         * without having to explicitly import this file in src/index.ts.
         */
        CConnoisseur: typeof CConnoisseur,
    }
}

export type BrowserUtilitiesOptions = {
    mockedDate: number;
    saveGame: string;
}

export function initBrowserUtilities(options: BrowserUtilitiesOptions) {
    if(options.saveGame != '') {
        window.localStorage.setItem('CookieClickerGame', options.saveGame);
    }

    let mockedDate = options.mockedDate;
    let currentDate = Date.now();
    let realDate = Date;

    let newDate = Object.assign(
        function(this: Date, ...args : any[]) {
            if(args.length == 0) {
                if(this) {
                    return new realDate(newDate.now());
                }
                else
                    return (new realDate(newDate.now())).toString();
            } else {
                // @ts-ignore
                return new realDate(...args);
            }
        },
        {
            now: () => realDate.now() - currentDate + window.CConnoisseur.mockedDate,
            parse: realDate.parse,
            UTC: realDate.UTC,
        }
    );
    // @ts-ignore (I couldn't figure out how to convince Typescript that this works)
    Date = newDate;

    let clearNewsTickerText = () => {
        Game.tickerL.innerHTML = '';
        Game.tickerBelowL.innerHTML = '';
    }

    let setSliderValue = (e: Element, value: number) => {
        if(!(e instanceof HTMLInputElement)) {
            throw new Error(`Element is not an HTMLInputElement`);
        }
        e.value = String(value);
        e.dispatchEvent(new Event('input'));
        e.dispatchEvent(new Event('change'));
        return value;
    }

    window.CConnoisseur = {
        mockedDate,
        clearNewsTickerText,
        setSliderValue,
    };
}
