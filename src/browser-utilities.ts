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
        // From https://github.com/microsoft/playwright/issues/4231#issuecomment-716049872
        if(!(e instanceof HTMLInputElement)) {
            throw new Error(`Element is not an HTMLInputElement`);
        }
        e.value = String(value);
        e.dispatchEvent(new Event('input'));
        e.dispatchEvent(new Event('change'));
        return value;
    }

    let gainLumps = (lumpsToGain: number) => {
        if(Game.cookiesEarned+Game.cookiesReset < 1000000000) {
            Game.Earn(1e9 - Game.cookiesEarned - Game.cookiesReset);
        }
        Game.gainLumps(lumpsToGain);
    }

    let warpTimeToFrame = (frame: number) => {
        let deltaFrames = frame - Game.T;
        if(deltaFrames <= 0) {
            // Nothing to skip
            return;
        }
        Game.T = frame;
        CConnoisseur.mockedDate += Math.round(1000 * deltaFrames / Game.fps);
        if(!window.localStorage.getItem('CookieClickerGame')) {
            Game.prefs.autosave = 0;
        }
    }

    let ascend = () => {
        if(Game.AscendTimer > 0 || Game.OnAscend) {
            // Already ascending, nothing to do
            return;
        }
        Game.Ascend(true);
        Game.AscendTimer=Game.AscendDuration;
        Game.UpdateAscendIntro();
    }

    let reincarnate = () => {
        if(Game.ReincarnateTimer > 0 || !Game.OnAscend) {
            return;
        }
        Game.Reincarnate(true);
        Game.ReincarnateTimer = Game.ReincarnateDuration;
        Game.UpdateReincarnateIntro();
    }

    let redrawMarketMinigame = () => {
        // TODO: remove the "as any" as soon as @types/cookieclicker is fixed
        if(!(Game.isMinigameReady(Game.Objects['Bank']) as any)) return;

        let M = Game.Objects['Bank'].minigame;
        M.toRedraw = 1;
        M.lastTickDrawn = M.ticks - 2;
        Game.drawT += 10 - (Game.drawT % 10); // Forces Game.drawT % 10 == 0
        M.draw!();
    }

    window.CConnoisseur = {
        mockedDate,
        clearNewsTickerText,
        setSliderValue,
        gainLumps,
        warpTimeToFrame,
        ascend,
        reincarnate,
        redrawMarketMinigame,
    };
}
