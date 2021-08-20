import { CCSave } from './parse-save-format';

process.stdin.setEncoding('utf8');

const goodsSet = new Set([
    'CRL', 'CHC', 'BTR', 'SUG',
    'NUT', 'SLT', 'VNL', 'EGG',
    'CNM', 'CRM', 'JAM', 'WCH',
    'HNY', 'CKI', 'RCP', 'SBD',
]);


/* "Pretty-prints" the save to a string.
 * Additionally,
 * it makes sure that the rows in the Garden minigame stays on a single line,
 * and also that each good in the Stock Market minigame stay on a single line.
 */
function formatSaveForPrinting(save: CCSave) {
    let needsGardenDestringification = false;
    let needsMarketDestringification = false;

    let replacer = (key:string, value: any) => {
        if(key == 'plot') {
            needsGardenDestringification = true;
            return value.map((x:any) => JSON.stringify(x));
        }
        if(goodsSet.has(key)) {
            needsMarketDestringification = true;
            return JSON.stringify(value);
        }
        return value;
    }

    let str = JSON.stringify(save, replacer, 4);

    if(needsGardenDestringification) {
        let beginPos = str.indexOf('"plot"') + '"plot"'.length + 1;
        // Using '"plot"' guarantees we'll avoid e.g. the bakery's name.
        let endPos = str.indexOf('}', beginPos);
        let prefix = str.substring(0, beginPos);
        let middle = str.substring(beginPos, endPos);
        let suffix = str.substring(endPos);
        middle = middle.replace(/"/g, '').replace(/\\/g, '"');
        str = prefix + middle + suffix;
    }

    if(needsMarketDestringification) {
        let beginPos = str.indexOf('"goods"') + '"goods"'.length + 1;
        let endPos = str.indexOf('"Temple"', beginPos);
        let prefix = str.substring(0, beginPos);
        let middle = str.substring(beginPos, endPos);
        let suffix = str.substring(endPos);
        middle = middle.replace(/"{/g, '{').replace(/}"/g, '}').replace(/\\\"/g, '"');
        str = prefix + middle + suffix;
    }

    return str;;
}

process.stdin.on('readable', () => {
    let str = process.stdin.read();
    if(!str) return;

    let save = CCSave.fromStringSave(str);

    let otherMods = save.modSaveData;
    save.modSaveData = {};
    for(let key of Object.keys(otherMods).sort()) {
        save.modSaveData[key] = otherMods[key];
    }

    console.log(formatSaveForPrinting(save));
});
