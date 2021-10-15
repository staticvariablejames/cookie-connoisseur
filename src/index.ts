export * from './cookie-clicker-page';
export * from './ccsave';

declare global {
    export const CConnoisseur: {
        mockedDate: number,
        clearNewsTickerText: () => void,
        setSliderValue: (e: Element, value: number) => number,
        gainLumps: (lumpsToGain: number) => void,
        warpTimeToFrame: (frame: number) => void,
        ascend: () => void,
        reincarnate: () => void,
        redrawMarketMinigame: () => void,
        startGrandmapocalypse: () => void,
        spawnReindeer: (spawnLead?: boolean) => Game.Shimmer,
    };
}
