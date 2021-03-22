declare global {
    interface Window {
        CConnoisseur: {
            mockedDate: number,
            currentDate: number,
            dateNow: () => number,
        };
    }
}
export {}; // This keeps the compiler happy
