declare global {
    interface Window {
        CConnoisseur: {
            mockedDate: number,
        };
    }
}
export {}; // Declares this file as a module, so that we can augment the global scope
