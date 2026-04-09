export * from './cookie-clicker-page';
export * from './ccsave';

declare global {
    export const CConnoisseur: {
        mockedDate: number | null,
        realDate: typeof Date,
        forceDateNowSpacing: (delays: number[]) => number,
        setupDiscrepancy: (discrepancy: number) => number,
        clearNewsTickerText: () => void,
        warpTimeToFrame: (frame: number) => void,
        ascend: () => void,
        reincarnate: () => void,
        redrawMarketMinigame: () => void,
        startGrandmapocalypse: () => void,
        spawnReindeer: (spawnLead?: boolean) => Game.shimmer,
        spawnWrinkler: (id?: number) => number,
        popWrinkler: (id: number) => boolean,
        clickBigCookie: () => void,
        closeNotes: () => void,
    };
}
