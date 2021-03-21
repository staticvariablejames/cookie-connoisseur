/* This script is run inside the browser,
 * before index.html is loaded.
 */

export function initBrowserUtilities() {
    let CConnoisseur: any = (window as any).CConnoisseur = {};
    CConnoisseur.mockedDate = 1600000000000; // 2020-09-13 12:26:40 UTC
    CConnoisseur.currentDate = Date.now();
    CConnoisseur.dateNow = Date.now;

    Date.now = () => CConnoisseur.dateNow() - CConnoisseur.currentDate + CConnoisseur.mockedDate;
}
