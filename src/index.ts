export * from './cookie-clicker-page';
export * from './ccsave';

declare global {
    export const CConnoisseur: {
        mockedDate: number,
        clearNewsTickerText: () => void,
        setSliderValue: (e: Element, value: number) => number,
    };
}
