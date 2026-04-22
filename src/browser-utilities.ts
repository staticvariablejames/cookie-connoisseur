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

// Available languages
export type CookieClickerLanguage =
    'CS' |
    'DA' |
    'DE' |
    'EN' |
    'ES' |
    'FR' |
    'IT' |
    'JA' |
    'KO' |
    'NL' |
    'NO' |
    'PL' |
    'PT-BR' |
    'RU' |
    'SV' |
    'ZH-CN';
// This list also shows up in `doc/openCookieClickerPage.md`.

export type BrowserUtilitiesOptions = {
    mockedDate: number | null;
    forceDiscrepancy: number | null;
    language: CookieClickerLanguage | null;
    saveGame: string;
}

export function initBrowserUtilities(options: BrowserUtilitiesOptions) {
    if(options.saveGame != '' && !window.localStorage.getItem('CookieClickerGame')) {
        window.localStorage.setItem('CookieClickerGame', options.saveGame);
    }
    if(options.language && !window.localStorage.getItem('CookieClickerLang')) {
        window.localStorage.setItem('CookieClickerLang', options.language);
    }

    let forceDateNowSpacing: (delays: number[]) => number =
        () => {throw new Error('Date mocking must be enabled')};
    let setupDiscrepancy: (discrepancy: number) => number =
        () => {throw new Error('Date mocking must be enabled')};

    let realInitialTimestamp = Date.now();
    let realDate: typeof Date = Date;
    let mockedDate = options.mockedDate; // assigned to window.CConnoisseur.mockedDate at the end of this function
    if(mockedDate != null) { // We need to install date mocking tools.
        /* Internal utility function.
         * Returns what the would the mocked value of Date.now() be,
         * if we did not have to worry about forceDiscrepancy or forceDateNowSpacing.
         */
        function simpleMockedDateNow() {
            return realDate.now() - realInitialTimestamp + window.CConnoisseur.mockedDate!;
        }

        function mockedDateConstructor(): string;
        function mockedDateConstructor(this: Date): Date;
        function mockedDateConstructor(this: Date, value: string | number | Date): Date;
        function mockedDateConstructor(this: Date, year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number): Date;
        function mockedDateConstructor(this: Date, yearOrValue?: string | number | Date, month?: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number): Date | string {
            /* We will override the global Date object later,
             * and with it the function Date.now(),
             * so we may call Date.now() here to get the mocked timestamps.
             *
             * We explicitly do _not_ use simpleMockedDateNow
             * to allow `Date()` and `new Date()` to also be affected by forceDiscrepancy.
             */
            if(!new.target) { // mockedDateConstructor was called _without_ new
                return new realDate(Date.now()).toString();
            } else if (yearOrValue === undefined) {
                return new realDate(Date.now());
            } else if(typeof yearOrValue != 'number') {
                return new realDate(yearOrValue!);
            } else if(month === undefined) {
                // Cannot explicitly pass 'undefined' as argument to realDate, so we check everything
                return new realDate(yearOrValue);
            } else if(day === undefined) {
                return new realDate(yearOrValue, month);
            } else if(hour === undefined) {
                return new realDate(yearOrValue, month, day);
            } else if(minute === undefined) {
                return new realDate(yearOrValue, month, day, hour);
            } else if(second === undefined) {
                return new realDate(yearOrValue, month, day, hour, minute);
            } else if(ms === undefined) {
                return new realDate(yearOrValue, month, day, hour, minute, second);
            } else {
                return new realDate(yearOrValue, month, day, hour, minute, second, ms);
            }
        }

        // Makeshift state machine for our Date.now() replacement
        type DateNowMockingState = 'initializing' | 'forcingSpacing' | 'monotonicGuarantee';
        let state: DateNowMockingState = 'initializing';

        let baseForcedSpacingTimestamp = 0;
        let highestForcedSpacingTimestamp = 0;
        let forcedSpacingDelays: number[] = [];

        forceDateNowSpacing = (delays: number[]) => {
            if(forcedSpacingDelays.length != 0)
                throw new Error('Cannot force Date.now spacing twice at the same time');
            baseForcedSpacingTimestamp = simpleMockedDateNow();
            highestForcedSpacingTimestamp = baseForcedSpacingTimestamp + delays[delays.length-1];
            forcedSpacingDelays = delays.slice(); // makes a copy
            state = 'forcingSpacing';
            return baseForcedSpacingTimestamp;
        }

        setupDiscrepancy = (discrepancy: number) => {
            // We trust that player's save does not get achievements nor has Century egg.
            let delays = [
                0, 0,           // Before game.LoadLumps
                0,              // First assignment (irrelevant)
                0,              // First poisoned line
                discrepancy,
                discrepancy,
                discrepancy,    // Earliest possible time we reach the second poisoned line
                discrepancy,
                discrepancy,    // Latest possible time we reach the second poisoned line
            ];
            // @ts-ignore TODO @types/cookieclicker is missing Minigame.reset
            if(Game?.Objects['Farm']?.minigame?.reset) {
                // Garden's reset function calls Date.now() three times
                delays.unshift(0, 0, 0);
            }
            // @ts-ignore
            if(Game?.Objects['Temple']?.minigame?.reset) {
                // Garden's reset function calls Date.now() once
                delays.unshift(0);
            }
            return forceDateNowSpacing(delays);
        }

        let numberOfCallsSinceInitialization = 0;
        function mockedDateNow() { // We will replace Date.now with this function
            numberOfCallsSinceInitialization++;
            switch(state) {
            case 'initializing':
                if(numberOfCallsSinceInitialization == 13) {
                    /* This is the last call to Date.now() before entering Game.loadSave.
                     * If we need to forceDiscrepancy,
                     * we can simply call setupDiscrepancy to change the state
                     * and appropriately configure the next few Date.now() calls.
                     *
                     * We still need to return a timestamp for this invocation of Date.now(),
                     * so we simply use the baseForcedSpacingTimestamp returned by setupDiscrepancy.
                     */
                    if(options.forceDiscrepancy != null) {
                        return setupDiscrepancy(options.forceDiscrepancy);
                    }
                }
                return simpleMockedDateNow();

            case 'forcingSpacing':
                if(forcedSpacingDelays.length == 0) {
                    // Should never happen
                    state = 'monotonicGuarantee';
                    return Math.max(highestForcedSpacingTimestamp, simpleMockedDateNow());
                }
                let nextDelay = forcedSpacingDelays.shift();
                if(forcedSpacingDelays.length == 0) state = 'monotonicGuarantee';
                return baseForcedSpacingTimestamp + nextDelay!;

            case 'monotonicGuarantee':
                return Math.max(highestForcedSpacingTimestamp, simpleMockedDateNow());
            }
        }

        // Overwrite the global Date object
        Date = Object.assign(
            /* I could not figure out how to convince the TypeScript compiler
             * that mockedDateConstructor indeed implements { new(): Date }.
             * So we do a little bit of coercing.
             * (In my defense, the Playwright devs also shut the compiler up
             * in 'packages/injected/src/clock.ts',
             * on their own implementation of date mocking (<https://playwright.dev/docs/clock>).)
             */
            mockedDateConstructor as typeof mockedDateConstructor & { new(): Date },
            {
                now: mockedDateNow,
                parse: realDate.parse,
                UTC: realDate.UTC,
            }
        );
    }

    let clearNewsTickerText = () => {
        Game.tickerL.innerHTML = '';
        Game.tickerBelowL.innerHTML = '';
    }

    let warpTimeToFrame = (frame: number) => {
        if(CConnoisseur.mockedDate == null) {
            throw 'CConnoisseur.warpTimeToFrame: cannot warp because date mocking is disabled';
        }
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

    let startGrandmapocalypse = () => {
        if(Game.elderWrath > 0) return;

        if(Game.Objects['Grandma'].amount < 1) Game.Objects['Grandma'].getFree(1);

        if(!Game.Has('One mind')) {
            Game.Upgrades['One mind'].earn();
        }
        if(Game.Has('Elder Pledge')) {
            Game.Upgrades['Elder Covenant'].earn();
            // Fall-through!
        }
        if(Game.Has('Elder Covenant')) {
            Game.Upgrades['Revoke Elder Covenant'].earn();

            /* One Mind forces Game.elderWrath to be 1 upon purchase,
             * but Pledge/Covenant don't (they wait for Game.UpdateGrandmapocalypse()).
             * So we have to do it manually.
             */
            Game.elderWrath = 1;
        }
    }

    let spawnReindeer = (spawnLead?: boolean) => {
        let reindeer = new Game.shimmer('reindeer');
        if(typeof spawnLead != 'boolean' || spawnLead) {
            reindeer.spawnLead = 1;
        }
        return reindeer;
    }

    let spawnWrinkler = (id?: number) => {
        if(Game.elderWrath <= 0) return -1;

        let wrinkler;
        if(id) {
            wrinkler = Game.SpawnWrinkler(Game.wrinklers[id]);
        } else {
            wrinkler = Game.SpawnWrinkler();
        }
        if(typeof wrinkler == 'boolean') {
            return -1;
        }
        wrinkler.close = 0;
        wrinkler.phase = 2;
        return wrinkler.id;
    }

    let popWrinkler = (id: number) => {
        if(!(id in Game.wrinklers)) return false;
        let wrinkler = Game.wrinklers[id];
        if(wrinkler.phase == 0) return false;

        wrinkler.hp = -1;
        Game.UpdateWrinklers();
        return true;
    }

    let clickBigCookie = () => {
        Game.lastClick = Date.now() - 20; // Will be reset to Date.now() by Game.ClickCookie()
        if(Game.T < 3) Game.T = 3;
        // TODO: remove the "as any" when @types/cookieclicker fixes the type of Game.ClickCookie
        (Game as any).ClickCookie();
    }

    let closeNotes = () => {
        Game.CloseNotes();
        Game.Notify = () => {};
    }

    window.CConnoisseur = {
        mockedDate,
        realDate,
        forceDateNowSpacing,
        setupDiscrepancy,
        clearNewsTickerText,
        warpTimeToFrame,
        ascend,
        reincarnate,
        redrawMarketMinigame,
        startGrandmapocalypse,
        spawnReindeer,
        spawnWrinkler,
        popWrinkler,
        clickBigCookie,
        closeNotes,
    };
}
