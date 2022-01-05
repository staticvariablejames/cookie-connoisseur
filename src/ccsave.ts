/* Contains tools to translate the native Cookie Clicker save format to a JSON-friendly object
 * and back.
 *
 * The name of the attributes match their names in the `Game` namespace,
 * but several boolean attributes are in fact either 0 or 1 in the game code.
 *
 ******************************************************************************
 *
 *      Implementation notes
 *
 * To simplify implementation and testing,
 * classes in this file have no instance methods,
 * only static methods.
 *
 * Most classes implement the following three static methods:
 *  static toNativeSave(obj: Class, version: number): string;
 *  static fromNativeSave(str: string): Class;
 *  static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string): Class;
 *
 * toNativeSave and fromNativeSave parse and write, respectively,
 * the base64-decoded portion of the native save format corresponding to that class.
 *
 * Not all classes use the version number.
 * CCSave.toNativeSave extracts the version from the object itself.
 * The minimum and maximum supported versions are in CCSave.minVersion and CCSave.maxVersion.
 *
 * The rationale for explicitly supporting different game versions
 * (as opposed to e.g. only supporting the last version)
 * is to allow supporting newer versions without invalidating the existing test cases.
 * For example,
 * version 2.04 introduces four new settings in Game.prefs,
 * so simply updating a save file from 2.031 to 2.04 introduces several bytes,
 * changing the text representation of the save.
 *
 * Note that onError and subobjectName are mandatory parameters;
 * this helps make the code corret,
 * as there's no chance of accidentally forgetting to pass e.g. `onError` down
 * and have it be the default, throwing error handler.
 * Since CCSave.fromObject is the only one meant to be used outside Cookie Connoisseur,
 * it is the only one that provides a cleaner interface.
 */

import { invertMap, ErrorHandler, throwOnError, pseudoObjectAssign } from './util';

/* This type exists only for documentation.
 * Numbers of this type represent a number of milliseconds since January 1st, 1970,
 * like the output of Date.now() and Date.UTC().
 */
type TimePoint = number;

export class CCPreferences {
    particles: boolean = true; // e.g. cookies falling down
    numbers: boolean = true; // Numbers that pop up when clicking the big cookie
    autosave: boolean = true;
    autoupdate: boolean = true; // Unused
    milk: boolean = true; // Display milk or not
    fancy: boolean = true; // CSS shadow effects
    warn: boolean = false; // window.onbeforeunload
    cursors: boolean = true; // Display cursors around the big cookie
    focus: boolean = true; // If *false*, makes the game less resource-intensive when unfocused
    format: boolean = false; // Display numbers as e.g. 1 nonillion if true, 1.00e+30 if false.
    notifs: boolean = false; // Makes notifications disappear faster if true
    wobbly: boolean = true; // Makes the big cookie wobble when clicked, instead of just shrinking
    monospace: boolean = false; // Display the number of cookies in bank in a monospace font
    filters: boolean = false; // CSS filter effects
    cookiesound: boolean = true; // Use the new sounds when clicking the big cookie
    crates: boolean = false; // Display a crate around icons in the stats menu
    showBackupWarning: boolean = true; // Show a "Back up your save" message on startup
    extraButtons: boolean = true; // Buttons to mute the buildings
    askLumps: boolean = false; // Confirmation prompt before spending lumps
    customGrandmas: boolean = true; // Show Patreon grandma names
    timeout: boolean = false; // If true, may switch to offline mode under lag; see Game.Timeout()

    // Introduced in 2.04; except for notScary, only works in the Steam version
    cloudSave: boolean = true; // save to the Steam cloud
    bgMusic: boolean = true; // whether background music should play even while unfocused
    notScary: boolean = false; // Changes a few sprites to make the game a bit less scary
    fullscreen: boolean = false;

    // Introduced in 2.042
    screenreader: boolean = false; // Add some DOM attributes to help screenreaders

    static attributeCount(version: number) {
        if(version <= 2.031) return 21;
        if(version <= 2.040) return 25;
        return 26; // version 2.042
    }

    static toNativeSave(prefs: CCPreferences, version: number) {
        let str = '';
        for(let [_key, value] of Object.entries(prefs)) {
            str += value ? '1' : '0';
        }
        return str.substring(0, CCPreferences.attributeCount(version));
    }

    static fromNativeSave(str: string) {
        let prefs = new CCPreferences();
        let keys = Object.keys(prefs) as Array<keyof CCPreferences>;
        for(let i = 0; i < Math.min(keys.length, str.length); i++) {
            prefs[keys[i]] = Boolean(Number(str.charAt(i)));
        }
        return prefs;
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        return pseudoObjectAssign(new CCPreferences(), obj, onError, subobjectName);
    }
}

/* This type does not exist as a member of the Game namespace.
 * It is created and read by Game.SaveWrinklers and Game.LoadWrinklers
 * during Game.WriteSave and Game.LoadSave, respectively.
 *
 * Cookie Clicker does _not_ save each wrinkler individually, only the aggregate.
 *
 * Note also that the game also stores the variable Game.cookiesSucked,
 * which has the same value as amount+amountShinies,
 * but this value has no effect in the game other than being read/written to the save file.
 */
export class CCWrinklerData {
    amount: number = 0; // Sum of cookies inside all non-shiny wrinklers
    number: number = 0; // Number of non-shiny wrinklers
    shinies: number = 0; // Number of shiny wrinklers
    amountShinies: number = 0; // Sum of cookies inside all shiny wrinklers

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        return pseudoObjectAssign(new CCWrinklerData(), obj, onError, subobjectName);
    }
}

export const SugarLumpTypesById = [
    'normal',
    'bifurcated',
    'golden',
    'meaty',
    'caramelized',
];

export const SugarLumpTypesByName = invertMap(SugarLumpTypesById);

export class CCPlainBuilding { // Building without minigame data
    amount: number = 0; // Amount of that building that is currently owned
    bought: number = 0; // Number of times this building was bought this ascension
    // "Bought" is only used as an additional check to make buildings full-opacity
    totalCookies: number = 0; // Cookies produced by that building alone
    level: number = 0;
    muted: boolean = false; // Whether the building is hidden or not
    highest: number = 0; // Higest amount of this building owned in this ascension

    /* The portion of the save format which contains the building data
     * also contains the minigame data.
     * The callback will be called with that data.
     * Note that minigameData might be the empty string!
     */
    static fromNativeSave(str: string, callback?: (minigameData: string) => void) {
        // Callback is called with the minigame string
        let obj = new CCPlainBuilding();
        let data = str.split(',');
        obj.amount = Number(data[0]);
        obj.bought = Number(data[1]);
        obj.totalCookies = Number(data[2]);
        obj.level = Number(data[3]);
        if(callback) callback(data[4]);
        obj.muted = Boolean(Number(data[5]));
        obj.highest = Number(data[6] ?? obj.amount); // highest was introduced in 2.026
        return obj;
    }

    /* If the object's level is greater than zero,
     * the provided minigame data is written in the appropriate portion of the save.
     */
    static toNativeSave(obj: CCPlainBuilding, _version: number, minigameData: string = '') {
        return obj.amount + ',' +
            obj.bought + ',' +
            obj.totalCookies + ',' +
            obj.level + ',' +
            (obj.level > 0 ? minigameData : '') + ',' +
            Number(obj.muted) + ',' +
            obj.highest;
    }

    // no fromObject function; this is handled by the CCBuildingsData class.
};

export class CCGardenMinigame {
    nextStep: TimePoint = 1.6e12; // Point in time where the next garden tick will be processed
    soil: string = 'dirt';
    nextSoil: TimePoint = 1.6e12; // Point in time where a new soil may be selected
    freeze: boolean = false; // Whether the garden is frozen or not
    harvests: number = 0; // Number of mature plants harvested in this ascension
    harvestsTotal: number = 0; // Total number of mature plants harvested across ascensions
    onMinigame: boolean = true; // Whether the minigame is open or not
    convertTimes: number = 0; // Total number of times the garden was sacrificed for 10 sugar lumps
    nextFreeze: TimePoint = 0; // Unused; used to be the next time the garden could be frozen again

    unlockedPlants: string[] = ['bakerWheat']; // This info is spread in M.plants in-game

    /* In-game, M.plot is always a 6x6 array of pairs [idPlusOne, age]
     * where idPlusOne is the plant id + 1 (e.g. Baker's Wheat's id is 0,
     * it is represented by 1 in M.plot), and age is a number between 0 and 100
     * representing the age of the plant.
     * Here,
     * we use the plant name (as defined by the PlantsById array below) or 'empty'.
     *
     * Note that the game always keeps a 6x6 grid, even when the garden level is < 9,
     * and expands it outwards; so e.g. a level 1 garden with all plots full
     * will occupy the entries plot[2][2], plot[2][3], plot[3][2], plot[3][3].
     */
    plot: [string, number][][] = [
        [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0]],
        [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0]],
        [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0]],
        [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0]],
        [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0]],
        [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0]],
    ];

    static SoilsById = [
        'dirt',
        'fertilizer',
        'clay',
        'pebbles',
        'woodchips',
    ];

    static SoilsByName = invertMap(CCGardenMinigame.SoilsById);

    static PlantsById = [
        "bakerWheat",
        "thumbcorn",
        "cronerice",
        "gildmillet",
        "clover",
        "goldenClover",
        "shimmerlily",
        "elderwort",
        "bakeberry",
        "chocoroot",
        "whiteChocoroot",
        "whiteMildew",
        "brownMold",
        "meddleweed",
        "whiskerbloom",
        "chimerose",
        "nursetulip",
        "drowsyfern",
        "wardlichen",
        "keenmoss",
        "queenbeet",
        "queenbeetLump",
        "duketater",
        "crumbspore",
        "doughshroom",
        "glovemorel",
        "cheapcap",
        "foolBolete",
        "wrinklegill",
        "greenRot",
        "shriekbulb",
        "tidygrass",
        "everdaisy",
        "ichorpuff",
    ];

    static PlantsByKey = invertMap(CCGardenMinigame.PlantsById);

    static fromNativeSave(str: string) {
        if(str == '') return null;

        let m = new CCGardenMinigame();

        let data = str.split(' ');

        let basicStats = data[0].split(':');
        m.nextStep = Number(basicStats[0]);
        m.soil = CCGardenMinigame.SoilsById[Number(basicStats[1])];
        m.nextSoil = Number(basicStats[2]);
        m.freeze = Boolean(Number(basicStats[3]));
        m.harvests = Number(basicStats[4]);
        m.harvestsTotal = Number(basicStats[5]);
        m.onMinigame = Boolean(Number(basicStats[6]));
        m.convertTimes = Number(basicStats[7]);
        m.nextFreeze = Number(basicStats[8]);

        let plants = data[1];
        m.unlockedPlants = [];
        for(let i = 0; i < plants.length; i++) {
            if(plants.charAt(i) == '1')
                m.unlockedPlants.push(CCGardenMinigame.PlantsById[i]);
        }

        let plots = data[2].split(':');
        let i = 0;
        for(let x = 0; x < 6; x++) {
            m.plot[x] = [];
            for(let y = 0; y < 6; y++) {
                let id = Number(plots[i++]);
                let plant = id == 0 ? 'empty' : CCGardenMinigame.PlantsById[id-1];
                let age = Number(plots[i++]);
                m.plot[x][y] = [plant, age];
            }
        }
        return m;
    }

    static toNativeSave(m: CCGardenMinigame | null, _version: number) {
        if(m === null) return '';
        let str = '';
        str += m.nextStep + ':' +
            CCGardenMinigame.SoilsByName[m.soil] + ':' +
            m.nextSoil + ':' +
            Number(m.freeze) + ':' +
            m.harvests + ':' +
            m.harvestsTotal + ':' +
            Number(m.onMinigame) + ':' +
            m.convertTimes + ':' +
            m.nextFreeze + ':' +
            ' ';

        let unlocked = '0'.repeat(CCGardenMinigame.PlantsById.length).split('');
        for(let plant of m.unlockedPlants) {
            unlocked[CCGardenMinigame.PlantsByKey[plant]] = '1';
        }
        str += unlocked.join('');

        str += ' ';
        for(let x = 0; x < 6; x++) {
            for(let y = 0; y < 6; y++) {
                let [plant, age] = m.plot[x][y];
                str += plant == 'empty' ? 0 : CCGardenMinigame.PlantsByKey[plant] + 1;
                str += ':' + age + ':';
            }
        }

        return str;
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        if(obj === null) return null;
        let m = new CCGardenMinigame();
        pseudoObjectAssign(m, obj, onError, subobjectName);
        if(typeof obj != 'object') {
            // pseudoObjectAssign already complained about it
            return m;
        }

        if('unlockedPlants' in obj!) {
            let unlockedList = (obj as any).unlockedPlants;
            if(!Array.isArray(unlockedList)) {
                onError(`source${subobjectName}.unlockedPlants is not an array`);
            } else {
                // Produce a sorted list
                m.unlockedPlants = unlockedList.filter( (value, i) => {
                    if(typeof value != 'string') {
                        onError(`source${subobjectName}.unlockedPlants[${i}] is not a string`);
                        return false;
                    } else if(!(value in CCGardenMinigame.PlantsByKey)) {
                        onError(`source${subobjectName}.unlockedPlants[${i}] is not a plant`);
                        return false;
                    } else {
                        return true;
                    }
                }).sort(
                    (p, q) => CCGardenMinigame.PlantsByKey[p] - CCGardenMinigame.PlantsByKey[q]
                );
                if(m.unlockedPlants[0] != 'bakerWheat') {
                    m.unlockedPlants.unshift('bakerWheat');
                }
            }
        }

        if('plot' in obj!) {
            let plot = (obj as any).plot;
            if(!Array.isArray(plot)) {
                onError(`source${subobjectName}.plot is not an array`);
            } else {
                if(plot.length > m.plot.length) {
                    onError(`source${subobjectName}.plot contains too many elements`);
                }
                for(let i = 0; i < plot.length; i++) {
                    if(!Array.isArray(plot[i])) {
                        onError(`source${subobjectName}.plot[${i}] is not an array`);
                        continue;
                    }
                    if(plot[i].length > m.plot[i].length) {
                        onError(`source${subobjectName}.plot[${i}] contains too many elements`);
                    }
                    for(let j = 0; j < plot[i].length; j++) {
                        if(!Array.isArray(plot[i][j])) {
                            onError(`source${subobjectName}.plot[${i}][${j}] is not an array`);
                            continue;
                        }
                        if(plot[i][j].length > 2) {
                            onError(`source${subobjectName}.plot[${i}][${j}] contains too many elements`);
                        }
                        let [plant, age] = plot[i][j];
                        if(plant === undefined) plant = 'empty';
                        if(typeof plant != 'string') {
                            onError(`source${subobjectName}.plot[${i}][${j}][0] is not a string`);
                            plant = 'empty';
                        }
                        if(age === undefined) age = 0;
                        if(typeof age != 'number') {
                            onError(`source${subobjectName}.plot[${i}][${j}][1] is not a number`);
                            age = 0;
                        }
                        m.plot[i][j] = [plant, age];
                    }
                }
            }
        }

        return m;
    }
};

// Represents a single stock from the market minigame
export class CCMarketStock {
    val: number = 1; // Current value of the stock, within the nearest hundreth of a $
    mode: string = 'stable'; // One of the six stock market modes
    d: number = 0; // 100 * current stock delta
    dur: number = 0; // Number of stock market ticks that the stock will stay in its current mode
    stock: number = 0; // Amount of this stock we currently own
    hidden: boolean = false; // Visual toggle in each stock
    last: number = 0; // 1: stock was bought last tick; 2: stock was sold last tick; 0: neither

    static ModesById = ['stable','slow rise','slow fall','fast rise','fast fall','chaotic'];
    static ModesByName = invertMap(CCMarketStock.ModesById);

    static fromNativeSave(str: string) {
        let s = new CCMarketStock();
        if(!str) return s;
        let data = str.split(':');
        s.val = Number(data[0]) / 100;
        s.mode = CCMarketStock.ModesById[Number(data[1])];
        s.d = Number(data[2]) / 100;
        s.dur = Number(data[3]);
        s.stock = Number(data[4]);
        s.hidden = Boolean(Number(data[5]));
        s.last = Number(data[6]);
        return s;
    }

    static toNativeSave(s: CCMarketStock, _version: number) {
        return Math.round(100 * s.val) + ':' +
            CCMarketStock.ModesByName[s.mode] + ':' +
            Math.round(100 * s.d) + ':' +
            s.dur + ':' +
            s.stock + ':' +
            Number(s.hidden) + ':' +
            s.last;
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        return pseudoObjectAssign(new CCMarketStock(), obj, onError, subobjectName);
    }
}

export class CCMarketStockList {
    CRL: CCMarketStock = new CCMarketStock(); // Cereals
    CHC: CCMarketStock = new CCMarketStock(); // Chocolate
    BTR: CCMarketStock = new CCMarketStock(); // Butter
    SUG: CCMarketStock = new CCMarketStock(); // Sugar
    NUT: CCMarketStock = new CCMarketStock(); // Nuts
    SLT: CCMarketStock = new CCMarketStock(); // Salt
    VNL: CCMarketStock = new CCMarketStock(); // Vanilla
    EGG: CCMarketStock = new CCMarketStock(); // Eggs
    CNM: CCMarketStock = new CCMarketStock(); // Cinnamon
    CRM: CCMarketStock = new CCMarketStock(); // Cream
    JAM: CCMarketStock = new CCMarketStock(); // Jam
    WCH: CCMarketStock = new CCMarketStock(); // White chocolate
    HNY: CCMarketStock = new CCMarketStock(); // Honey
    CKI: CCMarketStock = new CCMarketStock(); // Cookies
    RCP: CCMarketStock = new CCMarketStock(); // Recipes
    SBD: CCMarketStock = new CCMarketStock(); // Subsidiaries

    static fromNativeSave(str: string) {
        let l = new CCMarketStockList();
        if(!str) return l;
        let data = str.split('!');
        l.CRL = CCMarketStock.fromNativeSave(data[0]);
        l.CHC = CCMarketStock.fromNativeSave(data[1]);
        l.BTR = CCMarketStock.fromNativeSave(data[2]);
        l.SUG = CCMarketStock.fromNativeSave(data[3]);
        l.NUT = CCMarketStock.fromNativeSave(data[4]);
        l.SLT = CCMarketStock.fromNativeSave(data[5]);
        l.VNL = CCMarketStock.fromNativeSave(data[6]);
        l.EGG = CCMarketStock.fromNativeSave(data[7]);
        l.CNM = CCMarketStock.fromNativeSave(data[8]);
        l.CRM = CCMarketStock.fromNativeSave(data[9]);
        l.JAM = CCMarketStock.fromNativeSave(data[10]);
        l.WCH = CCMarketStock.fromNativeSave(data[11]);
        l.HNY = CCMarketStock.fromNativeSave(data[12]);
        l.CKI = CCMarketStock.fromNativeSave(data[13]);
        l.RCP = CCMarketStock.fromNativeSave(data[14]);
        l.SBD = CCMarketStock.fromNativeSave(data[15]);
        return l;
    }

    static toNativeSave(l: CCMarketStockList, version: number) {
        let str = '';
        for(let [_key, value] of Object.entries(l)) {
            str += CCMarketStock.toNativeSave(value, version) + '!';
        }
        return str;
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        let l = new CCMarketStockList();
        if(typeof obj != 'object' || obj === null) {
            onError(`source${subobjectName} is not an object`);
            return l;
        }

        for(let [key, value] of Object.entries(obj)) {
            if(key in l) {
                pseudoObjectAssign((l as any)[key], value, onError, `${subobjectName}.${key}`);
            } else {
                onError(`target${subobjectName}.${key} does not exist`);
            }
        }

        return l;
    }
}

export class CCMarketMinigame {
    officeLevel: number = 0; // Office level; this is one less than the displayed level
    brokers: number = 0; // Number of brokers
    graphLines: boolean = true; // Show the graph as a line instead of a box plot
    profit: number = 0; // Profits during this ascension
    graphCols: boolean = false; // Graph colors; dark mode if true, light mode if false.
    onMinigame: boolean = true; // Whether the minigame is open or not

    goods = new CCMarketStockList(); // List of goods; not directly available like this in-game

    static fromNativeSave(str: string) {
        if(str === '') return null;

        let m = new CCMarketMinigame();
        let data = str.split(' ');

        let basicData = data[0].split(':');
        m.officeLevel = Number(basicData[0]);
        m.brokers = Number(basicData[1]);
        m.graphLines = Boolean(Number(basicData[2]));
        m.profit = Number(basicData[3]);
        m.graphCols = Boolean(Number(basicData[4]));

        m.goods = CCMarketStockList.fromNativeSave(data[1]);

        m.onMinigame = Boolean(Number(data[2]));
        return m;
    }

    static toNativeSave(m: CCMarketMinigame | null, version: number) {
        if(m === null) return '';

        return m.officeLevel + ':' +
            m.brokers + ':' +
            Number(m.graphLines) + ':' +
            m.profit + ':' +
            Number(m.graphCols) + ':' +
            ' ' +
            CCMarketStockList.toNativeSave(m.goods, version) + ' ' +
            Number(m.onMinigame);
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        if(obj === null) return null;
        let m = new CCMarketMinigame();
        pseudoObjectAssign(m, obj, onError, subobjectName);
        if(typeof obj != 'object') {
            // pseudoObjectAssign already complained about it
            return m;
        }

        if('goods' in obj!) {
            m.goods = CCMarketStockList.fromObject((obj as any).goods, onError, `${subobjectName}.goods`);
        }

        return m;
    }
};

export class CCPantheonMinigame {
    diamondSlot: string = ''; // '' represents no spirit slotted
    rubySlot: string = '';
    jadeSlot: string = '';
    swaps: number = 3;
    swapT: TimePoint = 1.6e12; // Essentially, last time that the `swaps` attribute changed.
    // `swaps` may decrease by slotting in spirits or clicking a shimmer with Holobore slotted,
    // and it increases after 1h, 4h or 16h if swaps == 2, 1, 0, respectively.
    onMinigame: boolean = true; // Whether the minigame is open or not

    static GodsById = [
        'asceticism', // Holobore, Spirit of Asceticism
        'decadence', // Vomitrax, Spirit of Decadence
        'ruin', // Godzamok, Spirit of Ruin
        'ages', // Cyclius, Spirit of Ages
        'seasons', // Selebrak, Spirit of Festivities
        'creation', // Dotjeiess, Spirit of Creation
        'labor', // Muridal, Spirit of Labor
        'industry', // Jeremy, Spirit of Industry
        'mother', // Mokalsium, Mother Spirit
        'scorn', // Skruuia, Spirit of Scorn
        'order' // Rigidel, Spirit of Order
    ];

    static GodsByName = invertMap(CCPantheonMinigame.GodsById);

    /* Converts a spirit id to a spirit name.
     * It is here as a separate function specifically to handle the id == -1 case.
     */
    static godNameFromId(id: number) {
        if(!Number.isInteger(id) || id == -1) {
            return '';
        } else {
            return CCPantheonMinigame.GodsById[id];
        }
    }

    /* Converts a spirit name to its in-game id.
     * It is here as a separate function specifically to handle the name == '' case.
     */
    static godIdFromName(name: string) {
        if(name == '') {
            return -1;
        } else {
            return CCPantheonMinigame.GodsByName[name];
        }
    }

    static fromNativeSave(str: string) {
        if(str === '') return null;

        let m = new CCPantheonMinigame();
        let data = str.split(' ');
        let gods = data[0].split('/');
        m.diamondSlot = CCPantheonMinigame.godNameFromId(Number(gods[0]));
        m.rubySlot = CCPantheonMinigame.godNameFromId(Number(gods[1]));
        m.jadeSlot = CCPantheonMinigame.godNameFromId(Number(gods[2]));
        m.swaps = Number(data[1]);
        m.swapT = Number(data[2]);
        m.onMinigame = Boolean(Number(data[3]));
        return m;
    }

    static toNativeSave(m: CCPantheonMinigame | null, _version: number) {
        if(m === null) return '';
        return CCPantheonMinigame.godIdFromName(m.diamondSlot) + '/' +
            CCPantheonMinigame.godIdFromName(m.rubySlot) + '/' +
            CCPantheonMinigame.godIdFromName(m.jadeSlot) + ' ' +
            m.swaps + ' ' + m.swapT +
            ' ' + Number(m.onMinigame);
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        if(obj === null) return null;
        return pseudoObjectAssign(new CCPantheonMinigame(), obj, onError, subobjectName);
    }
};

export class CCGrimoireMinigame {
    magic: number = 0; // Current amount of magic; max magic is computed in-game
    spellsCast: number = 0; // Number of spells cast in the current ascension
    spellsCastTotal: number = 0; // Total number of spells cast, across ascensions
    onMinigame: boolean = true; // Whether the minigame is open or not

    static fromNativeSave(str: string) {
        if(str === '') return null;

        let m = new CCGrimoireMinigame();
        if(!str) return m;
        let data = str.split(' ');
        m.magic = Number(data[0]);
        m.spellsCast = Number(data[1]);
        m.spellsCastTotal = Number(data[2]);
        m.onMinigame = Boolean(Number(data[3]));
        return m;
    }

    static toNativeSave(m: CCGrimoireMinigame | null, _version: number) {
        if(m === null) return '';

        return m.magic + ' ' +
            m.spellsCast + ' ' +
            m.spellsCastTotal + ' ' +
            Number(m.onMinigame);
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        if(obj === null) return null;
        return pseudoObjectAssign(new CCGrimoireMinigame(), obj, onError, subobjectName);
    }
}

export class CCMinigameBuilding<MinigameData> extends CCPlainBuilding {
    /* If the building level is zero or if the minigame hasn't loaded yet,
     * the game does not include the minigame data in the save file.
     * We represent this situation by letting minigame === null.
     */
    constructor(public minigame: MinigameData | null) {
        super();
    }
};

export function parseCCBuildingWithMinigame<MinigameData>(
    str: string,
    minigameParser: (str: string) => MinigameData | null
): CCMinigameBuilding<MinigameData>
{
    let minigame: MinigameData | null = null;
    let building = CCPlainBuilding.fromNativeSave(str, (dataStr) => {
        minigame = minigameParser(dataStr);
    });
    return {...building, minigame};
}

export class CCBuildingsData { // Aggregates all buildings
    'Cursor': CCPlainBuilding = new CCPlainBuilding();
    'Grandma': CCPlainBuilding = new CCPlainBuilding();
    'Farm' = new CCMinigameBuilding(new CCGardenMinigame());
    'Mine': CCPlainBuilding = new CCPlainBuilding();
    'Factory': CCPlainBuilding = new CCPlainBuilding();
    'Bank' = new CCMinigameBuilding(new CCMarketMinigame());
    'Temple' = new CCMinigameBuilding(new CCPantheonMinigame());
    'Wizard tower' = new CCMinigameBuilding(new CCGrimoireMinigame());
    'Shipment': CCPlainBuilding = new CCPlainBuilding();
    'Alchemy lab': CCPlainBuilding = new CCPlainBuilding();
    'Portal': CCPlainBuilding = new CCPlainBuilding();
    'Time machine': CCPlainBuilding = new CCPlainBuilding();
    'Antimatter condenser': CCPlainBuilding = new CCPlainBuilding();
    'Prism': CCPlainBuilding = new CCPlainBuilding();
    'Chancemaker': CCPlainBuilding = new CCPlainBuilding();
    'Fractal engine': CCPlainBuilding = new CCPlainBuilding();
    'Javascript console': CCPlainBuilding = new CCPlainBuilding();
    'Idleverse': CCPlainBuilding = new CCPlainBuilding();

    static fromNativeSave(str: string) {
        let buildings = new CCBuildingsData();
        let data = str.split(';');
        buildings['Cursor'] = CCPlainBuilding.fromNativeSave(data[0]);
        buildings['Grandma'] = CCPlainBuilding.fromNativeSave(data[1]);
        buildings['Farm'] = parseCCBuildingWithMinigame(data[2], CCGardenMinigame.fromNativeSave);
        buildings['Mine'] = CCPlainBuilding.fromNativeSave(data[3]);
        buildings['Factory'] = CCPlainBuilding.fromNativeSave(data[4]);
        buildings['Bank'] = parseCCBuildingWithMinigame(data[5], CCMarketMinigame.fromNativeSave);
        buildings['Temple'] = parseCCBuildingWithMinigame(data[6], CCPantheonMinigame.fromNativeSave);
        buildings['Wizard tower'] = parseCCBuildingWithMinigame(data[7], CCGrimoireMinigame.fromNativeSave);
        buildings['Shipment'] = CCPlainBuilding.fromNativeSave(data[8]);
        buildings['Alchemy lab'] = CCPlainBuilding.fromNativeSave(data[9]);
        buildings['Portal'] = CCPlainBuilding.fromNativeSave(data[10]);
        buildings['Time machine'] = CCPlainBuilding.fromNativeSave(data[11]);
        buildings['Antimatter condenser'] = CCPlainBuilding.fromNativeSave(data[12]);
        buildings['Prism'] = CCPlainBuilding.fromNativeSave(data[13]);
        buildings['Chancemaker'] = CCPlainBuilding.fromNativeSave(data[14]);
        buildings['Fractal engine'] = CCPlainBuilding.fromNativeSave(data[15]);
        buildings['Javascript console'] = CCPlainBuilding.fromNativeSave(data[16]);
        if(data[17] != '') // Idleverses were introduced in 2.03
            buildings['Idleverse'] = CCPlainBuilding.fromNativeSave(data[17]);
        return buildings;
    }

    static toNativeSave(buildings: CCBuildingsData, version: number) {
        let str = '';
        str += CCPlainBuilding.toNativeSave(buildings['Cursor'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Grandma'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Farm'], version,
                    CCGardenMinigame.toNativeSave(buildings['Farm'].minigame, version)
                )+ ';';
        str += CCPlainBuilding.toNativeSave(buildings['Mine'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Factory'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Bank'], version,
                    CCMarketMinigame.toNativeSave(buildings['Bank'].minigame, version)
                ) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Temple'], version,
                    CCPantheonMinigame.toNativeSave(buildings['Temple'].minigame, version)
                ) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Wizard tower'], version,
                    CCGrimoireMinigame.toNativeSave(buildings['Wizard tower'].minigame, version)
                ) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Shipment'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Alchemy lab'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Portal'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Time machine'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Antimatter condenser'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Prism'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Chancemaker'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Fractal engine'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Javascript console'], version) + ';';
        str += CCPlainBuilding.toNativeSave(buildings['Idleverse'], version) + ';';
        return str;
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        let buildingsData = new CCBuildingsData();
        if(typeof obj != 'object' || obj === null) {
            onError(`source${subobjectName} is not an object`);
            return buildingsData;
        }
        for(let buildingName of Object.keys(obj)) {
            if(!(buildingName in buildingsData)) {
                onError(`target${subobjectName}.${buildingName} does not exist (typo?)`);
                continue;
            }
            let sourceBuilding: Record<string, unknown> = (obj as any)[buildingName];
            let targetBuilding = buildingsData[buildingName as keyof CCBuildingsData];
            pseudoObjectAssign(
                targetBuilding,
                sourceBuilding,
                onError,
                `${subobjectName}["${buildingName}"]`
            );

            if(!('highest' in sourceBuilding)) {
                targetBuilding.highest = targetBuilding.amount;
            }

            /* Code to make dealing with minigames a bit more convenient.
             * The idea is to always have a default-constructed minigame object,
             * which can be modified later,
             * unless it was explicitly set to null.
             */
            type minigameT<T> = {
                fromObject: (obj: unknown, onError: ErrorHandler, subobjectName: string) => T | null;
                new(): T;
            }
            function handleMinigame(name: 'Farm', minigameClass: minigameT<CCGardenMinigame>): void;
            function handleMinigame(name: 'Bank', minigameClass: minigameT<CCMarketMinigame>): void;
            function handleMinigame(name: 'Temple', minigameClass: minigameT<CCPantheonMinigame>): void;
            function handleMinigame(name: 'Wizard tower', minigameClass: minigameT<CCGrimoireMinigame>): void;
            function handleMinigame(name: string, minigameClass: any) {
                if(buildingName === name) {
                    if('minigame' in sourceBuilding) {
                        // Propagate the minigame if explicitly set
                        (targetBuilding as any).minigame = minigameClass.fromObject(
                            sourceBuilding.minigame,
                            onError,
                            `${subobjectName}["${name}"].minigame`
                        );
                    } else if(sourceBuilding.level === 0) {
                        (targetBuilding as any).minigame = null;
                        // Do not default-construct if level is explicitly set to zero
                    } else if((buildingsData as any)[name].level > 0) {
                        // Default construct if level is explicitly set to something positive
                        (targetBuilding as any).minigame = new minigameClass();
                    }
                }
            }
            handleMinigame('Farm', CCGardenMinigame);
            handleMinigame('Bank', CCMarketMinigame);
            handleMinigame('Temple', CCPantheonMinigame);
            handleMinigame('Wizard tower', CCGrimoireMinigame);
        }

        return buildingsData;
    }
}

/* List of all upgrades in the game, sorted by id.
 * This lis follow their in-game names,
 * with the following exceptions:
 *  105 - Named "Sablés" here, "Sabl&eacute;s" in-game
 *  718 - Named "Milkhelp® lactose intolerance relief tablets" here,
 *      "Milkhelp&reg; lactose intolerance relief tablets" in-game
 */
export const UpgradesById = [
    "Reinforced index finger",
    "Carpal tunnel prevention cream",
    "Ambidextrous",
    "Thousand fingers",
    "Million fingers",
    "Billion fingers",
    "Trillion fingers",
    "Forwards from grandma",
    "Steel-plated rolling pins",
    "Lubricated dentures",
    "Cheap hoes",
    "Fertilizer",
    "Cookie trees",
    "Sturdier conveyor belts",
    "Child labor",
    "Sweatshop",
    "Sugar gas",
    "Megadrill",
    "Ultradrill",
    "Vanilla nebulae",
    "Wormholes",
    "Frequent flyer",
    "Antimony",
    "Essence of dough",
    "True chocolate",
    "Ancient tablet",
    "Insane oatling workers",
    "Soul bond",
    "Flux capacitors",
    "Time paradox resolver",
    "Quantum conundrum",
    "Kitten helpers",
    "Kitten workers",
    "Plain cookies",
    "Sugar cookies",
    "Oatmeal raisin cookies",
    "Peanut butter cookies",
    "Coconut cookies",
    "White chocolate cookies",
    "Macadamia nut cookies",
    "Double-chip cookies",
    "White chocolate macadamia nut cookies",
    "All-chocolate cookies",
    "Quadrillion fingers",
    "Prune juice",
    "Genetically-modified cookies",
    "Radium reactors",
    "Ultimadrill",
    "Warp drive",
    "Ambrosia",
    "Sanity dance",
    "Causality enforcer",
    "Lucky day",
    "Serendipity",
    "Kitten engineers",
    "Dark chocolate-coated cookies",
    "White chocolate-coated cookies",
    "Farmer grandmas",
    "Miner grandmas",
    "Worker grandmas",
    "Cosmic grandmas",
    "Transmuted grandmas",
    "Altered grandmas",
    "Grandmas' grandmas",
    "Bingo center/Research facility",
    "Specialized chocolate chips",
    "Designer cocoa beans",
    "Ritual rolling pins",
    "Underworld ovens",
    "One mind",
    "Exotic nuts",
    "Communal brainsweep",
    "Arcane sugar",
    "Elder Pact",
    "Elder Pledge",
    "Plastic mouse",
    "Iron mouse",
    "Titanium mouse",
    "Adamantium mouse",
    "Ultrascience",
    "Eclipse cookies",
    "Zebra cookies",
    "Quintillion fingers",
    "Gold hoard",
    "Elder Covenant",
    "Revoke Elder Covenant",
    "Get lucky",
    "Sacrificial rolling pins",
    "Snickerdoodles",
    "Stroopwafels",
    "Macaroons",
    "Neuromancy",
    "Empire biscuits",
    "British tea biscuits",
    "Chocolate british tea biscuits",
    "Round british tea biscuits",
    "Round chocolate british tea biscuits",
    "Round british tea biscuits with heart motif",
    "Round chocolate british tea biscuits with heart motif",
    "Sugar bosons",
    "String theory",
    "Large macaron collider",
    "Big bang bake",
    "Antigrandmas",
    "Madeleines",
    "Palmiers",
    "Palets",
    "Sablés",
    "Kitten overseers",
    "Sextillion fingers",
    "Double-thick glasses",
    "Gingerbread scarecrows",
    "Recombobulators",
    "H-bomb mining",
    "Chocolate monoliths",
    "Aqua crustulae",
    "Brane transplant",
    "Yestermorrow comparators",
    "Reverse cyclotrons",
    "Unobtainium mouse",
    "Caramoas",
    "Sagalongs",
    "Shortfoils",
    "Win mints",
    "Perfect idling",
    "Fig gluttons",
    "Loreols",
    "Jaffa cakes",
    "Grease's cups",
    "Heavenly chip secret",
    "Heavenly cookie stand",
    "Heavenly bakery",
    "Heavenly confectionery",
    "Heavenly key",
    "Skull cookies",
    "Ghost cookies",
    "Bat cookies",
    "Slime cookies",
    "Pumpkin cookies",
    "Eyeball cookies",
    "Spider cookies",
    "Persistent memory",
    "Wrinkler doormat",
    "Christmas tree biscuits",
    "Snowflake biscuits",
    "Snowman biscuits",
    "Holly biscuits",
    "Candy cane biscuits",
    "Bell biscuits",
    "Present biscuits",
    "Gingerbread men",
    "Gingerbread trees",
    "A festive hat",
    "Increased merriness",
    "Improved jolliness",
    "A lump of coal",
    "An itchy sweater",
    "Reindeer baking grounds",
    "Weighted sleighs",
    "Ho ho ho-flavored frosting",
    "Season savings",
    "Toy workshop",
    "Naughty list",
    "Santa's bottomless bag",
    "Santa's helpers",
    "Santa's legacy",
    "Santa's milk and cookies",
    "Reindeer season",
    "Santa's dominion",
    "Pure heart biscuits",
    "Ardent heart biscuits",
    "Sour heart biscuits",
    "Weeping heart biscuits",
    "Golden heart biscuits",
    "Eternal heart biscuits",
    "Gem polish",
    "9th color",
    "Chocolate light",
    "Grainbow",
    "Pure cosmic light",
    "Rainbow grandmas",
    "Season switcher",
    "Festive biscuit",
    "Ghostly biscuit",
    "Lovesick biscuit",
    "Fool's biscuit",
    "Eternal seasons",
    "Kitten managers",
    "Septillion fingers",
    "Octillion fingers",
    "Eludium mouse",
    "Wishalloy mouse",
    "Aging agents",
    "Pulsar sprinklers",
    "Deep-bake process",
    "Coreforge",
    "Generation ship",
    "Origin crucible",
    "Deity-sized portals",
    "Far future enactment",
    "Nanocosmics",
    "Glow-in-the-dark",
    "Rose macarons",
    "Lemon macarons",
    "Chocolate macarons",
    "Pistachio macarons",
    "Hazelnut macarons",
    "Violet macarons",
    "Magic shenanigans",
    "Bunny biscuit",
    "Chicken egg",
    "Duck egg",
    "Turkey egg",
    "Quail egg",
    "Robin egg",
    "Ostrich egg",
    "Cassowary egg",
    "Salmon roe",
    "Frogspawn",
    "Shark egg",
    "Turtle egg",
    "Ant larva",
    "Golden goose egg",
    "Faberge egg",
    "Wrinklerspawn",
    "Cookie egg",
    "Omelette",
    "Chocolate egg",
    "Century egg",
    "\"egg\"",
    "Caramel macarons",
    "Licorice macarons",
    "Taller tellers",
    "Scissor-resistant credit cards",
    "Acid-proof vaults",
    "Chocolate coins",
    "Exponential interest rates",
    "Financial zen",
    "Golden idols",
    "Sacrifices",
    "Delicious blessing",
    "Sun festival",
    "Enlarged pantheon",
    "Great Baker in the sky",
    "Pointier hats",
    "Beardlier beards",
    "Ancient grimoires",
    "Kitchen curses",
    "School of sorcery",
    "Dark formulas",
    "Banker grandmas",
    "Priestess grandmas",
    "Witch grandmas",
    "Tin of british tea biscuits",
    "Box of macarons",
    "Box of brand biscuits",
    "Pure black chocolate cookies",
    "Pure white chocolate cookies",
    "Ladyfingers",
    "Tuiles",
    "Chocolate-stuffed biscuits",
    "Checker cookies",
    "Butter cookies",
    "Cream cookies",
    "Permanent upgrade slot I",
    "Permanent upgrade slot II",
    "Permanent upgrade slot III",
    "Permanent upgrade slot IV",
    "Permanent upgrade slot V",
    "Starspawn",
    "Starsnow",
    "Starterror",
    "Starlove",
    "Startrade",
    "Angels",
    "Archangels",
    "Virtues",
    "Dominions",
    "Cherubim",
    "Seraphim",
    "God",
    "Twin Gates of Transcendence",
    "Heavenly luck",
    "Lasting fortune",
    "Decisive fate",
    "Divine discount",
    "Divine sales",
    "Divine bakeries",
    "Starter kit",
    "Starter kitchen",
    "Halo gloves",
    "Kitten angels",
    "Unholy bait",
    "Sacrilegious corruption",
    "Xtreme walkers",
    "Fudge fungus",
    "Planetsplitters",
    "Cyborg workforce",
    "Way of the wallet",
    "Creation myth",
    "Cookiemancy",
    "Dyson sphere",
    "Theory of atomic fluidity",
    "End of times back-up plan",
    "Great loop hypothesis",
    "The Pulse",
    "Lux sanctorum",
    "The Unbridling",
    "Wheat triffids",
    "Canola oil wells",
    "78-hour days",
    "The stuff rationale",
    "Theocracy",
    "Rabbit trick",
    "The final frontier",
    "Beige goo",
    "Maddening chants",
    "Cookietopian moments of maybe",
    "Some other super-tiny fundamental particle? Probably?",
    "Reverse shadows",
    "Kitten accountants",
    "Kitten specialists",
    "Kitten experts",
    "How to bake your dragon",
    "A crumbly egg",
    "Chimera",
    "Tin of butter cookies",
    "Golden switch",
    "Classic dairy selection",
    "Fanciful dairy selection",
    "Dragon cookie",
    "Golden switch [off]",
    "Golden switch [on]",
    "Milk selector",
    "Milk chocolate butter biscuit",
    "Dark chocolate butter biscuit",
    "White chocolate butter biscuit",
    "Ruby chocolate butter biscuit",
    "Gingersnaps",
    "Cinnamon cookies",
    "Vanity cookies",
    "Cigars",
    "Pinwheel cookies",
    "Fudge squares",
    "Digits",
    "Butter horseshoes",
    "Butter pucks",
    "Butter knots",
    "Butter slabs",
    "Butter swirls",
    "Shortbread biscuits",
    "Millionaires' shortbreads",
    "Caramel cookies",
    "Belphegor",
    "Mammon",
    "Abaddon",
    "Satan",
    "Asmodeus",
    "Beelzebub",
    "Lucifer",
    "Golden cookie alert sound",
    "Golden cookie sound selector",
    "Basic wallpaper assortment",
    "Legacy",
    "Elder spice",
    "Residual luck",
    "Fantasteel mouse",
    "Nevercrack mouse",
    "Five-finger discount",
    "Future almanacs",
    "Rain prayer",
    "Seismic magic",
    "Asteroid mining",
    "Quantum electronics",
    "Temporal overclocking",
    "Contracts from beyond",
    "Printing presses",
    "Paganism",
    "God particle",
    "Arcane knowledge",
    "Magical botany",
    "Fossil fuels",
    "Shipyards",
    "Primordial ores",
    "Gold fund",
    "Infernal crops",
    "Abysmal glimmer",
    "Relativistic parsec-skipping",
    "Primeval glow",
    "Extra physics funding",
    "Chemical proficiency",
    "Light magic",
    "Mystical energies",
    "Synergies Vol. I",
    "Synergies Vol. II",
    "Heavenly cookies",
    "Wrinkly cookies",
    "Distilled essence of redoubled luck",
    "Occult obstruction",
    "Glucose-charged air",
    "Lavender chocolate butter biscuit",
    "Lombardia cookies",
    "Bastenaken cookies",
    "Pecan sandies",
    "Moravian spice cookies",
    "Anzac biscuits",
    "Buttercakes",
    "Ice cream sandwiches",
    "Stevia Caelestis",
    "Diabetica Daemonicus",
    "Sucralosia Inutilis",
    "Lucky digit",
    "Lucky number",
    "Lucky payout",
    "Background selector",
    "Lucky grandmas",
    "Your lucky cookie",
    "\"All Bets Are Off\" magic coin",
    "Winning lottery ticket",
    "Four-leaf clover field",
    "A recipe book about books",
    "Leprechaun village",
    "Improbability drive",
    "Antisuperstistronics",
    "Gemmed talismans",
    "Kitten consultants",
    "Birthday cookie",
    "Armythril mouse",
    "Reverse dementia",
    "Humane pesticides",
    "Mole people",
    "Machine learning",
    "Edible money",
    "Sick rap prayers",
    "Deluxe tailored wands",
    "Autopilot",
    "The advent of chemistry",
    "The real world",
    "Second seconds",
    "Quantum comb",
    "Crystal mirrors",
    "Bunnypedes",
    "Kitten assistants to the regional manager",
    "Charm quarks",
    "Pink biscuits",
    "Whole-grain cookies",
    "Candy cookies",
    "Big chip cookies",
    "One chip cookies",
    "Sugar baking",
    "Sugar craving",
    "Sugar aging process",
    "Sugar frenzy",
    "Sprinkles cookies",
    "Peanut butter blossoms",
    "No-bake cookies",
    "Florentines",
    "Chocolate crinkles",
    "Maple cookies",
    "Turbo-charged soil",
    "Technobsidian mouse",
    "Plasmarble mouse",
    "Kitten marketeers",
    "Festivity loops",
    "Persian rice cookies",
    "Norwegian cookies",
    "Crispy rice cookies",
    "Ube cookies",
    "Butterscotch cookies",
    "Speculaas",
    "Elderwort biscuits",
    "Bakeberry cookies",
    "Duketater cookies",
    "Green yeast digestives",
    "Fern tea",
    "Ichor syrup",
    "Wheat slims",
    "Synthetic chocolate green honey butter biscuit",
    "Royal raspberry chocolate butter biscuit",
    "Ultra-concentrated high-energy chocolate butter biscuit",
    "Timeproof hair dyes",
    "Barnstars",
    "Mine canaries",
    "Brownie point system",
    "Grand supercycles",
    "Psalm-reading",
    "Immobile spellcasting",
    "Restaurants at the end of the universe",
    "On second thought",
    "Dimensional garbage gulper",
    "Additional clock hands",
    "Baking Nobel prize",
    "Reverse theory of light",
    "Revised probabilistics",
    "Kitten analysts",
    "Eye of the wrinkler",
    "Inspired checklist",
    "Pure pitch-black chocolate butter biscuit",
    "Chocolate oatmeal cookies",
    "Molasses cookies",
    "Biscotti",
    "Waffle cookies",
    "Almond cookies",
    "Hazelnut cookies",
    "Walnut cookies",
    "Label printer",
    "Good manners",
    "Lindworms",
    "Bore again",
    "\"Volunteer\" interns",
    "Rules of acquisition",
    "War of the gods",
    "Electricity",
    "Universal alphabet",
    "Public betterment",
    "Embedded microportals",
    "Nostalgia",
    "The definite molecule",
    "Light capture measures",
    "0-sided dice",
    "Heralds",
    "Metagrandmas",
    "Metabakeries",
    "Mandelbrown sugar",
    "Fractoids",
    "Nested universe theory",
    "Menger sponge cake",
    "One particularly good-humored cow",
    "Chocolate ouroboros",
    "Nested",
    "Space-filling fibers",
    "Endless book of prose",
    "The set of all sets",
    "Recursive mirrors",
    "Mice clicking mice",
    "Custard creams",
    "Bourbon biscuits",
    "Keepsakes",
    "Mini-cookies",
    "Sugar crystal cookies",
    "Box of maybe cookies",
    "Box of not cookies",
    "Box of pastries",
    "Profiteroles",
    "Jelly donut",
    "Glazed donut",
    "Chocolate cake",
    "Strawberry cake",
    "Apple pie",
    "Lemon meringue pie",
    "Butter croissant",
    "Cookie dough",
    "Burnt cookie",
    "A chocolate chip cookie but with the chips picked off for some reason",
    "Flavor text cookie",
    "High-definition cookie",
    "Toast",
    "Peanut butter & jelly",
    "Wookies",
    "Cheeseburger",
    "One lone chocolate chip",
    "Genius accounting",
    "Shimmering veil",
    "Shimmering veil [off]",
    "Shimmering veil [on]",
    "Whoopie pies",
    "Caramel wafer biscuits",
    "Chocolate chip mocha cookies",
    "Earl Grey cookies",
    "Corn syrup cookies",
    "Icebox cookies",
    "Graham crackers",
    "Hardtack",
    "Cornflake cookies",
    "Tofu cookies",
    "Gluten-free cookies",
    "Russian bread cookies",
    "Lebkuchen",
    "Aachener Printen",
    "Canistrelli",
    "Nice biscuits",
    "French pure butter cookies",
    "Petit beurre",
    "Nanaimo bars",
    "Berger cookies",
    "Chinsuko",
    "Panda koala biscuits",
    "Putri salju",
    "Milk cookies",
    "Cookie crumbs",
    "Chocolate chip cookie",
    "Cosmic beginner's luck",
    "Reinforced membrane",
    "Binary grandmas",
    "The JavaScript console for dummies",
    "64bit arrays",
    "Stack overflow",
    "Enterprise compiler",
    "Syntactic sugar",
    "A nice cup of coffee",
    "Just-in-time baking",
    "cookies++",
    "Software updates",
    "Game.Loop",
    "eval()",
    "Script grannies",
    "Tombola computing",
    "Kruidnoten",
    "Marie biscuits",
    "Meringue cookies",
    "Pizza",
    "Crackers",
    "Havabreaks",
    "Kitten executives",
    "Chai tea cookies",
    "Yogurt cookies",
    "Thumbprint cookies",
    "Pizzelle",
    "Zilla wafers",
    "Dim Dams",
    "Candy",
    "Fortune #001",
    "Fortune #002",
    "Fortune #003",
    "Fortune #004",
    "Fortune #005",
    "Fortune #006",
    "Fortune #007",
    "Fortune #008",
    "Fortune #009",
    "Fortune #010",
    "Fortune #011",
    "Fortune #012",
    "Fortune #013",
    "Fortune #014",
    "Fortune #015",
    "Fortune #016",
    "Fortune #017",
    "Fortune #100",
    "Fortune #101",
    "Fortune #102",
    "Fortune #103",
    "Fortune #104",
    "Fortune cookies",
    "A really good guide book",
    "Prism heart biscuits",
    "Kitten wages",
    "Pet the dragon",
    "Dragon scale",
    "Dragon claw",
    "Dragon fang",
    "Dragon teddy bear",
    "Granola cookies",
    "Ricotta cookies",
    "Roze koeken",
    "Peanut butter cup cookies",
    "Sesame cookies",
    "Taiyaki",
    "Vanillekipferl",
    "Cosmic chocolate butter biscuit",
    "Nonillion fingers",
    "Miraculite mouse",
    "Generation degeneration",
    "Global seed vault",
    "Air mining",
    "Behavioral reframing",
    "Altruistic loop",
    "A novel idea",
    "Spelling bees",
    "Toroid universe",
    "Hermetic reconciliation",
    "His advent",
    "Split seconds",
    "Flavor itself",
    "Light speed limit",
    "A touch of determinism",
    "This upgrade",
    "Your biggest fans",
    "Battenberg biscuits",
    "Rosette cookies",
    "Gangmakers",
    "Welsh cookies",
    "Raspberry cheesecake cookies",
    "Alternate grandmas",
    "Manifest destiny",
    "The multiverse in a nutshell",
    "All-conversion",
    "Multiverse agents",
    "Escape plan",
    "Game design",
    "Sandbox universes",
    "Multiverse wars",
    "Mobile ports",
    "Encapsulated realities",
    "Extrinsic clicking",
    "Universal idling",
    "Perforated mille-feuille cosmos",
    "Infraverses and superverses",
    "Fortune #018",
    "Butter biscuit (with butter)",
    "Visits",
    "Reverse-veganism",
    "Caramel alloys",
    "The infinity engine",
    "Diminishing tax returns",
    "Apparitions",
    "Wizard basements",
    "Prime directive",
    "Chromatic cycling",
    "Domestic rifts",
    "Patience abolished",
    "Delicious pull",
    "Occam's laser",
    "On a streak",
    "A box",
    "Hacker shades",
    "Break the fifth wall",
    "Cat ladies",
    "Milkhelp® lactose intolerance relief tablets",
    "Aura gloves",
    "Luminous gloves",
    "Bokkenpootjes",
    "Fat rascals",
    "Ischler cookies",
    "Matcha cookies",
    "Earl Grey macarons",
    "Pokey",
    "Cashew cookies",
    "Milk chocolate cookies",
];

export const UpgradesByName = invertMap(UpgradesById);

/* List of all achievements in the game, sorted by id.
 * This lis follow their in-game names,
 * with the following exceptions:
 *  230 - Named "Brought to you by the letter 🍪" here,
 *          "Brought to you by the letter <div style="display:inline-block;background:url(img/money.png);width:16px;height:16px;"></div>" in-game
 *  240 - Truncated to "There's really no hard limit to how long these achievement names can be"
 *  304 - Named "Déjà vu" here, "D&eacute;j&agrave; vu" in-game
 */
export const AchievementsById = [
    "Wake and bake",
    "Making some dough",
    "So baked right now",
    "Fledgling bakery",
    "Affluent bakery",
    "World-famous bakery",
    "Cosmic bakery",
    "Galactic bakery",
    "Universal bakery",
    "Timeless bakery",
    "Infinite bakery",
    "Immortal bakery",
    "Don't stop me now",
    "You can stop now",
    "Cookies all the way down",
    "Overdose",
    "Casual baking",
    "Hardcore baking",
    "Steady tasty stream",
    "Cookie monster",
    "Mass producer",
    "Cookie vortex",
    "Cookie pulsar",
    "Cookie quasar",
    "Oh hey, you're still here",
    "Let's never bake again",
    "Sacrifice",
    "Oblivion",
    "From scratch",
    "Neverclick",
    "Clicktastic",
    "Clickathlon",
    "Clickolympics",
    "Clickorama",
    "Click",
    "Double-click",
    "Mouse wheel",
    "Of Mice and Men",
    "The Digital",
    "Just wrong",
    "Grandma's cookies",
    "Sloppy kisses",
    "Retirement home",
    "Bought the farm",
    "Reap what you sow",
    "Farm ill",
    "Production chain",
    "Industrial revolution",
    "Global warming",
    "You know the drill",
    "Excavation site",
    "Hollow the planet",
    "Expedition",
    "Galactic highway",
    "Far far away",
    "Transmutation",
    "Transmogrification",
    "Gold member",
    "A whole new world",
    "Now you're thinking",
    "Dimensional shift",
    "Time warp",
    "Alternate timeline",
    "Rewriting history",
    "One with everything",
    "Mathematician",
    "Base 10",
    "Golden cookie",
    "Lucky cookie",
    "A stroke of luck",
    "Cheated cookies taste awful",
    "Uncanny clicker",
    "Builder",
    "Architect",
    "Enhancer",
    "Augmenter",
    "Cookie-dunker",
    "Fortune",
    "True Neverclick",
    "Elder nap",
    "Elder slumber",
    "Elder",
    "Elder calm",
    "Engineer",
    "Leprechaun",
    "Black cat's paw",
    "Nihilism",
    "Antibatter",
    "Quirky quarks",
    "It does matter!",
    "Upgrader",
    "Centennial",
    "Hardcore",
    "Speed baking I",
    "Speed baking II",
    "Speed baking III",
    "Getting even with the oven",
    "Now this is pod-smashing",
    "Chirped out",
    "Follow the white rabbit",
    "Clickasmic",
    "Friend of the ancients",
    "Ruler of the ancients",
    "Wholesome",
    "Just plain lucky",
    "Itchscratcher",
    "Wrinklesquisher",
    "Moistburster",
    "Spooky cookies",
    "Coming to town",
    "All hail Santa",
    "Let it snow",
    "Oh deer",
    "Sleigh of hand",
    "Reindeer sleigher",
    "Perfected agriculture",
    "Ultimate automation",
    "Can you dig it",
    "Type II civilization",
    "Gild wars",
    "Brain-split",
    "Time duke",
    "Molecular maestro",
    "Lone photon",
    "Dazzling glimmer",
    "Blinding flash",
    "Unending glow",
    "Lord of Constructs",
    "Lord of Progress",
    "Bicentennial",
    "Lovely cookies",
    "Centennial and a half",
    "Tiny cookie",
    "You win a cookie",
    "Click delegator",
    "Gushing grannies",
    "I hate manure",
    "Never dig down",
    "The incredible machine",
    "And beyond",
    "Magnum Opus",
    "With strange eons",
    "Spacetime jigamaroo",
    "Supermassive",
    "Praise the sun",
    "Clickageddon",
    "Clicknarok",
    "Extreme polydactyly",
    "Dr. T",
    "The old never bothered me anyway",
    "Homegrown",
    "Technocracy",
    "The center of the Earth",
    "We come in peace",
    "The secrets of the universe",
    "Realm of the Mad God",
    "Forever and ever",
    "Walk the planck",
    "Rise and shine",
    "God complex",
    "Third-party",
    "Dematerialize",
    "Nil zero zilch",
    "Transcendence",
    "Obliterate",
    "Negative void",
    "The hunt is on",
    "Egging on",
    "Mass Easteria",
    "Hide & seek champion",
    "What's in a name",
    "Pretty penny",
    "Fit the bill",
    "A loan in the dark",
    "Need for greed",
    "It's the economy, stupid",
    "Your time to shrine",
    "Shady sect",
    "New-age cult",
    "Organized religion",
    "Fanaticism",
    "Bewitched",
    "The sorcerer's apprentice",
    "Charms and enchantments",
    "Curses and maledictions",
    "Magic kingdom",
    "Vested interest",
    "New world order",
    "Hocus pocus",
    "Finger clickin' good",
    "Panic at the bingo",
    "Rake in the dough",
    "Quarry on",
    "Yes I love technology",
    "Paid in full",
    "Church of Cookiology",
    "Too many rabbits, not enough hats",
    "The most precious cargo",
    "The Aureate",
    "Ever more hideous",
    "Be kind, rewind",
    "Infinitesimal",
    "A still more glorious dawn",
    "Rebirth",
    "Here you go",
    "Resurrection",
    "Reincarnation",
    "Endless cycle",
    "The agemaster",
    "To oldly go",
    "Gardener extraordinaire",
    "Tectonic ambassador",
    "Rise of the machines",
    "Acquire currency",
    "Zealotry",
    "The wizarding world",
    "Parsec-masher",
    "The work of a lifetime",
    "A place lost in time",
    "Heat death",
    "Microcosm",
    "Bright future",
    "Here be dragon",
    "How?",
    "The land of milk and cookies",
    "He who controls the cookies controls the universe",
    "Tonight on Hoarders",
    "Are you gonna eat all that?",
    "We're gonna need a bigger bakery",
    "In the mouth of madness",
    "Brought to you by the letter 🍪",
    "A world filled with cookies",
    "When this baby hits 36 quadrillion cookies per hour",
    "Fast and delicious",
    "Cookiehertz : a really, really tasty hertz",
    "Woops, you solved world hunger",
    "Turbopuns",
    "Faster menner",
    "And yet you're still hungry",
    "The Abakening",
    "There's really no hard limit to how long these achievement names can be",
    "Fast",
    "Bicentennial and a half",
    "Tabloid addiction",
    "Clickastrophe",
    "Clickataclysm",
    "Thumbs, phalanges, metacarpals",
    "Polymath",
    "The elder scrolls",
    "To crumbs, you say?",
    "Seedy business",
    "Freak fracking",
    "Modern times",
    "The nerve of war",
    "Wololo",
    "And now for my next trick, I'll need a volunteer from the audience",
    "It's not delivery",
    "Gold, Jerry! Gold!",
    "Forbidden zone",
    "cookie clicker forever and forever a hundred years cookie clicker, all day long forever, forever a hundred times, over and over cookie clicker adventures dot com",
    "Scientists baffled everywhere",
    "Harmony of the spheres",
    "Last Chance to See",
    "Early bird",
    "Fading luck",
    "Eldeer",
    "Dude, sweet",
    "Sugar rush",
    "Year's worth of cavities",
    "Hand-picked",
    "Sugar sugar",
    "All-natural cane sugar",
    "Sweetmeats",
    "Tricentennial",
    "Knead for speed",
    "Well the cookies start coming and they don't stop coming",
    "I don't know if you've noticed but all these icons are very slightly off-center",
    "The proof of the cookie is in the baking",
    "If it's worth doing, it's worth overdoing",
    "The dreams in which I'm baking are the best I've ever had",
    "Set for life",
    "You and the beanstalk",
    "Romancing the stone",
    "Ex machina",
    "And I need it now",
    "Pray on the weak",
    "It's a kind of magic",
    "Make it so",
    "All that glitters is gold",
    "H̸̷͓̳̳̯̟͕̟͍͍̣͡ḛ̢̦̰̺̮̝͖͖̘̪͉͘͡ ̠̦͕̤̪̝̥̰̠̫̖̣͙̬͘ͅC̨̦̺̩̲̥͉̭͚̜̻̝̣̼͙̮̯̪o̴̡͇̘͎̞̲͇̦̲͞͡m̸̩̺̝̣̹̱͚̬̥̫̳̼̞̘̯͘ͅẹ͇̺̜́̕͢s̶̙̟̱̥̮̯̰̦͓͇͖͖̝͘͘͞",
    "Way back then",
    "Exotic matter",
    "At the end of the tunnel",
    "Click (starring Adam Sandler)",
    "Frantiquities",
    "Overgrowth",
    "Sedimentalism",
    "Labor of love",
    "Reverse funnel system",
    "Thus spoke you",
    "Manafest destiny",
    "Neither snow nor rain nor heat nor gloom of night",
    "I've got the Midas touch",
    "Which eternal lie",
    "Déjà vu",
    "Powers of Ten",
    "Now the dark days are gone",
    "Freaky jazz hands",
    "Methuselah",
    "Huge tracts of land",
    "D-d-d-d-deeper",
    "Patently genius",
    "A capital idea",
    "It belongs in a bakery",
    "Motormouth",
    "Been there done that",
    "Phlogisticated substances",
    "Bizarro world",
    "The long now",
    "Chubby hadrons",
    "Palettable",
    "Bibbidi-bobbidi-boo",
    "I'm the wiz",
    "A wizard is you",
    "Four-leaf cookie",
    "Lucked out",
    "What are the odds",
    "Grandma needs a new pair of shoes",
    "Million to one shot, doc",
    "As luck would have it",
    "Ever in your favor",
    "Be a lady",
    "Dicey business",
    "Fingers crossed",
    "Just a statistic",
    "Murphy's wild guess",
    "Let's leaf it at that",
    "The ultimate clickdown",
    "Aged well",
    "101st birthday",
    "Defense of the ancients",
    "Harvest moon",
    "Mine?",
    "In full gear",
    "Treacle tart economics",
    "Holy cookies, grandma!",
    "The Prestige",
    "That's just peanuts to space",
    "Worth its weight in lead",
    "What happens in the vortex stays in the vortex",
    "Invited to yesterday's party",
    "Downsizing",
    "My eyes",
    "Maybe a chance in hell, actually",
    "Make like a tree",
    "Cave story",
    "In-cog-neato",
    "Save your breath because that's all you've got left",
    "Vengeful and almighty",
    "Spell it out for you",
    "Space space space space space",
    "Don't get used to yourself, you're gonna have to change",
    "Objects in the mirror dimension are closer than they appear",
    "Groundhog day",
    "A matter of perspective",
    "Optical illusion",
    "Jackpot",
    "So much to do so much to see",
    "Running with scissors",
    "Rarefied air",
    "Push it to the limit",
    "Green cookies sleep furiously",
    "Panic! at Nabisco",
    "Bursting at the seams",
    "Just about full",
    "Hungry for more",
    "All the other kids with the pumped up clicks",
    "One...more...click...",
    "Botany enthusiast",
    "Green, aching thumb",
    "In the garden of Eden (baby)",
    "Keeper of the conservatory",
    "Seedless to nay",
    "You get nothing",
    "Humble rebeginnings",
    "The end of the world",
    "Oh, you're back",
    "Lazarus",
    "Leisurely pace",
    "Hypersonic",
    "Feed me, Orteil",
    "And then what?",
    "Tricentennial and a half",
    "Quadricentennial",
    "Quadricentennial and a half",
    "Quincentennial",
    "Maillard reaction",
    "When the cookies ascend just right",
    "With her finger and her thumb",
    "But wait 'til you get older",
    "Sharpest tool in the shed",
    "Hey now, you're a rock",
    "Break the mold",
    "Get the show on, get paid",
    "My world's on fire, how about yours",
    "The meteor men beg to differ",
    "Only shooting stars",
    "We could all use a little change",
    "Your brain gets smart but your head gets dumb",
    "The years start coming",
    "What a concept",
    "You'll never shine if you don't glow",
    "You'll never know if you don't go",
    "Self-contained",
    "Threw you for a loop",
    "The sum of its parts",
    "Bears repeating",
    "More of the same",
    "Last recurse",
    "Out of one, many",
    "An example of recursion",
    "For more information on this achievement, please refer to its title",
    "I'm so meta, even this achievement",
    "Never get bored",
    "The needs of the many",
    "Eating its own",
    "We must go deeper",
    "Sierpinski rhomboids",
    "Gotta go fast",
    "I think it's safe to say you've got it made",
    "Renaissance baker",
    "Veteran",
    "Thick-skinned",
    "F12",
    "Variable success",
    "No comments",
    "Up to code",
    "Works on my machine",
    "Technical debt",
    "Mind your language",
    "Inconsolable",
    "Closure",
    "Dude what if we're all living in a simulation like what if we're all just code on a computer somewhere",
    "Taking the back streets",
    "Inherited prototype",
    "A model of document object",
    "First-class citizen",
    "Alexandria",
    "Bake him away, toys",
    "You're #1 so why try harder",
    "Haven't even begun to peak",
    "A sometimes food",
    "Not enough of a good thing",
    "Horn of plenty",
    "Smurf account",
    "If at first you don't succeed",
    "O Fortuna",
    "Initial public offering",
    "Rookie numbers",
    "No nobility in poverty",
    "Full warehouses",
    "Make my day",
    "Buy buy buy",
    "Gaseous assets",
    "Pyramid scheme",
    "Jellicles",
    "Quincentennial and a half",
    "What did we even eat before these",
    "Heavy flow",
    "More you say?",
    "Large and in charge",
    "Absolutely stuffed",
    "It's only wafer-thin",
    "Clickety split",
    "Gotta hand it to you",
    "Okay boomer",
    "Overripe",
    "Rock on",
    "Self-manmade man",
    "Checks out",
    "Living on a prayer",
    "Higitus figitus migitus mum",
    "The incredible journey",
    "Just a phase",
    "Don't let me leave, Murph",
    "Caveman to cosmos",
    "Particular tastes",
    "A light snack",
    "Tempting fate",
    "Tautological",
    "Curly braces",
    "Seven horseshoes",
    "Olden days",
    "The devil's workshop",
    "In the green",
    "Mountain out of a molehill, but like in a good way",
    "The wheels of progress",
    "That's rich",
    "Preaches and cream",
    "Magic thinking",
    "Is there life on Mars?",
    "Bad chemistry",
    "Reduced to gibbering heaps",
    "Back already?",
    "Nuclear throne",
    "Making light of the situation",
    "Flip a cookie. Chips, I win. Crust, you lose.",
    "In and of itself",
    "Duck typing",
    "They'll never know what hit 'em",
    "Well-versed",
    "Ripe for the picking",
    "Unreal",
    "Once you've seen one",
    "Spoils and plunder",
    "Nobody exists on purpose, nobody belongs anywhere",
    "Hyperspace expressway",
    "Versatile",
    "You are inevitable",
    "Away from this place",
    "Everywhere at once",
    "Reject reality, substitute your own",
    "Fringe",
    "Coherence",
    "Earth-616",
    "Strange topologies",
    "Grand design",
    "Ecumenopolis",
    "The full picture",
    "When there's nothing left to add",
    "Sexcentennial",
    "Keep going until I say stop",
    "But I didn't say stop, did I?",
    "With unrivaled fervor",
    "Think big",
    "Hypersize me",
    "Max capacity",
    "Liquid assets",
]

export const AchievementsByName = invertMap(AchievementsById);

/* Cookie Clicker buffs.
 * `name` here is the "technical name" used in the code;
 * for example, in Game.buffTypesByName.
 *
 * `time` is Game.fps * the duration of the buff in seconds.
 * (Note that the first argument to Game.gainBuff is in seconds, not Game.fps * seconds.)
 * `maxTime` is the maximum duration the buff, used e.g. by the "Stretch Time" grimoire spell
 */
export class CCBuffFrenzy {
    name: 'frenzy' = 'frenzy';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 7; // 7x CpS multiplier
}

export class CCBuffElderFrenzy {
    name: 'blood frenzy' = 'blood frenzy';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 666; // 666x CpS multiplier
}

export class CCBuffClot {
    name: 'clot' = 'clot';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 0.5; // 0.5x CpS multiplier
}

export class CCBuffDragonHarvest {
    name: 'dragon harvest' = 'dragon harvest';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 15; // 15x CpS multiplier
}

export class CCBuffEverythingMustGo {
    name: 'everything must go' = 'everything must go';
    maxTime: number = 0;
    time: number = 0;
    power: number = 5; // 5% price reduction
}

export class CCBuffCursedFinger {
    name: 'cursed finger' = 'cursed finger';
    maxTime: number = 0;
    time: number = 0;
    power: number = 0; // Cookies gained per click (default: 10 * current CpS)
}

export class CCBuffClickFrenzy {
    name: 'click frenzy' = 'click frenzy';
    maxTime: number = 0;
    time: number = 0;
    multClick: number = 777; // 777x cookies click multiplier
}

export class CCBuffDragonflight {
    name: 'dragonflight' = 'dragonflight';
    maxTime: number = 0;
    time: number = 0;
    multClick: number = 1111; // 1111x cookies per click multiplier
}

export class CCBuffCookieStorm {
    name: 'cookie storm' = 'cookie storm';
    maxTime: number = 0;
    time: number = 0;
    power: number = 7; // Unused
}

export class CCBuffBuildingSpecial {
    name: 'building buff' = 'building buff';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 2; // 2x CpS multiplier
    building: number = 1; // Building ID (grandmas in this case)
}

export class CCBuffBuildingRust {
    name: 'building debuff' = 'building debuff';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 0.5; // 0.5x CpS multiplier
    building: number = 1; // Building ID (grandmas in this case)
}

export class CCBuffSugarBlessing {
    name: 'sugar blessing' = 'sugar blessing';
    maxTime: number = 0;
    time: number = 0;
}

export class CCBuffHagglersLuck {
    name: 'haggler luck' = 'haggler luck';
    maxTime: number = 0;
    time: number = 0;
    power: number = 2; // Upgrades 2% cheaper
}

export class CCBuffHagglersMisery {
    name: 'haggler misery' = 'haggler misery';
    maxTime: number = 0;
    time: number = 0;
    power: number = 2; // Upgrades 2% pricier
}

export class CCBuffCraftyPixies {
    name: 'pixie luck' = 'pixie luck';
    maxTime: number = 0;
    time: number = 0;
    power: number = 2; // Buildings 2% cheaper
}

export class CCBuffNastyGoblins {
    name: 'pixie misery' = 'pixie misery';
    maxTime: number = 0;
    time: number = 0;
    power: number = 2; // Buildings 2% pricier
}

export class CCBuffMagicAdept {
    name: 'magic adept' = 'magic adept';
    maxTime: number = 0;
    time: number = 0;
    power: number = 10; // Spells backfire 10x less
}

export class CCBuffMagicInept {
    name: 'magic inept' = 'magic inept';
    maxTime: number = 0;
    time: number = 0;
    power: number = 5; // Spells backfire 5x more
}

export class CCBuffDevastation {
    name: 'devastation' = 'devastation';
    maxTime: number = 0;
    time: number = 0;
    multClick: number = 2; // 2x cookies per click multiplier
}

export class CCBuffSugarFrenzy {
    name: 'sugar frenzy' = 'sugar frenzy';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 3; // 3x CpS multiplier
}

export class CCBuffModestLoan {
    name: 'loan 1' = 'loan 1';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 1.5; // 1.5x CpS multiplier
}

export class CCBuffModestLoanRepayment {
    name: 'loan 1 (interest)' = 'loan 1 (interest)';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 0.25; // 0.25x CpS multiplier
}

export class CCBuffPawnshopLoan {
    name: 'loan 2' = 'loan 2';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 2; // 2x CpS multiplier
}

export class CCBuffPawnshopLoanRepayment {
    name: 'loan 2 (interest)' = 'loan 2 (interest)';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 0.1; // 3x CpS multiplier
}

export class CCBuffRetirementLoan {
    name: 'loan 3' = 'loan 3';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 1.2; // 1.2x CpS multiplier
}

export class CCBuffRetirementLoanRepayment {
    name: 'loan 3 (interest)' = 'loan 3 (interest)';
    maxTime: number = 0;
    time: number = 0;
    multCpS: number = 0.8; // 0.8x CpS multiplier
}

export class CCUnknownBuff {
    // This buff does not exist in the game code; it is here only to keep TypeScript happy
    name: 'unknown' = 'unknown';
    id: number = 26;
    maxTime: number = 0;
    time: number = 0;
    arg1: number = 0;
    arg2: number = 0;
    arg3: number = 0;
}

export const BuffNamesById = [
    'frenzy',
    'blood frenzy',
    'clot',
    'dragon harvest',
    'everything must go',
    'cursed finger',
    'click frenzy',
    'dragonflight',
    'cookie storm',
    'building buff',
    'building debuff',
    'sugar blessing',
    'haggler luck',
    'haggler misery',
    'pixie luck',
    'pixie misery',
    'magic adept',
    'magic inept',
    'devastation',
    'sugar frenzy',
    'loan 1',
    'loan 1 (interest)',
    'loan 2',
    'loan 2 (interest)',
    'loan 3',
    'loan 3 (interest)',
    'unknown',
];

export const BuffIdsByName = invertMap(BuffNamesById);

export type CCBuff = CCBuffFrenzy | CCBuffElderFrenzy | CCBuffClot |
    CCBuffDragonHarvest | CCBuffEverythingMustGo | CCBuffCursedFinger |
    CCBuffClickFrenzy | CCBuffDragonflight | CCBuffCookieStorm |
    CCBuffBuildingSpecial | CCBuffBuildingRust | CCBuffSugarBlessing |
    CCBuffHagglersLuck | CCBuffHagglersMisery | CCBuffCraftyPixies |
    CCBuffNastyGoblins | CCBuffMagicAdept | CCBuffMagicInept |
    CCBuffDevastation | CCBuffSugarFrenzy | CCBuffModestLoan |
    CCBuffModestLoanRepayment | CCBuffPawnshopLoan | CCBuffPawnshopLoanRepayment |
    CCBuffRetirementLoan | CCBuffRetirementLoanRepayment | CCUnknownBuff;

// List of all buff classes
export const BuffClasses = [
    CCBuffFrenzy, CCBuffElderFrenzy, CCBuffClot,
    CCBuffDragonHarvest, CCBuffEverythingMustGo, CCBuffCursedFinger,
    CCBuffClickFrenzy, CCBuffDragonflight, CCBuffCookieStorm,
    CCBuffBuildingSpecial, CCBuffBuildingRust, CCBuffSugarBlessing,
    CCBuffHagglersLuck, CCBuffHagglersMisery, CCBuffCraftyPixies,
    CCBuffNastyGoblins, CCBuffMagicAdept, CCBuffMagicInept,
    CCBuffDevastation, CCBuffSugarFrenzy, CCBuffModestLoan,
    CCBuffModestLoanRepayment, CCBuffPawnshopLoan, CCBuffPawnshopLoanRepayment,
    CCBuffRetirementLoan, CCBuffRetirementLoanRepayment, CCUnknownBuff,
];

// The 'T extends T' part forces the generic type to distribute over union
type KeysOfUnion<T> = T extends T ? keyof T : never;

// This will have to be refactored if any buff with a non-numerical attribute is introduced...
const buffArgNames: (KeysOfUnion<CCBuff> | null)[][] = [
    BuffClasses.map(buffClass => {
        let t = new buffClass();
        if('multCpS' in t) return 'multCpS';
        if('power' in t) return 'power';
        if('multClick' in t) return 'multClick';
        return null;
    }),
    BuffClasses.map(buffClass => {
        let t = new buffClass();
        if('building' in t) return 'building';
        return null;
    }),
];

export function parseBuffFromString(str: string) : CCBuff {
    let data = str.split(',');
    let typeId = Number(data[0]);
    let maxTime = Number(data[1]);
    let time = Number(data[2]);
    let arg1 = Number(data[3] ?? 0);
    let arg2 = Number(data[4] ?? 0);
    let arg3 = Number(data[5] ?? 0);

    if(!(typeId in BuffClasses) || typeId == BuffClasses.length - 1) {
        return {name: 'unknown', id: Number(data[0]), maxTime, time, arg1, arg2, arg3};
    }

    let buff = new BuffClasses[typeId]();
    buff.maxTime = maxTime;
    buff.time = time;

    let argName1 = buffArgNames[0][typeId];
    let argName2 = buffArgNames[1][typeId];
    if(argName1 && argName1 in buff) {
        (buff as any)[argName1] = arg1;
    }
    if(argName2 != null && argName2 in buff) {
        (buff as any)[argName2] = arg2;
    }

    return buff;
}

/* Writes the buff to a string in the format produced by Cookie Clicker.
 * It includes the trailing semicolon (as in Cookie Clicker).
 *
 * As a special provision,
 * for sugar blessing buffs,
 * it includes the ',1' in the string.
 * This ',1' represents the argument 'pow' in the function
 * Game.buffTypesByName['sugar blessing'].func,
 * but this argument is always 1, has no effect in the game whatsoever
 * and isn't even included by the function in the object it returns.
 *
 * This attribute only appears in the save file
 * due to the same mechanism that appends ,0,0 to e.g. Frenzies which were saved,
 * then parsed, and then saved again.
 * Adding it manually keeps consistency with the save files produced by Cookie Clicker.
 */
export function writeBuffToString(buff: CCBuff) {
    let str = BuffIdsByName[buff.name] + ',' + buff.maxTime + ',' + buff.time;
    if('multCpS' in buff)
        str += ',' + buff.multCpS;
    if('multClick' in buff)
        str += ',' + buff.multClick;
    if('power' in buff)
        str += ',' + buff.power;
    if('building' in buff)
        str += ',' + buff.building;
    if(buff.name === 'sugar blessing')
        str += ',1';
    if(buff.name === 'unknown')
        str += ',' + buff.arg1 + ',' + buff.arg2 + ',' + buff.arg3;

    return str + ';';
}

export function parseBuffFromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
    if(typeof obj != 'object' || obj === null) {
        onError(`source${subobjectName} is not an object`);
        return null;
    }

    if(!('name' in obj as any)) {
        onError(`source${subobjectName} is missing buff name`);
        return null;
    }

    let name: string = (obj as any).name;

    if(!(name in BuffIdsByName)) {
        onError(`source${subobjectName}.name is not a valid buff name (typo?)`);
        return null;
    }

    let buff = new BuffClasses[BuffIdsByName[name]]();
    return pseudoObjectAssign(buff, obj, onError, subobjectName);
}

/* In the Game namespace,
 * the values of modSaveData are always strings.
 * However, a common pattern is for the string to be the output of JSON.stringify.
 * Therefore, if the given string is JSON.parse-able,
 * this is the value it will be written here.
 */
export class CCModSaveData {
    [modName: string] : string | object;

    /* Cookie Clicker's handcrafted save format relies on '|' and ';' as separators,
     * so to prevent mod data from messing with this,
     * all '|' and ';' are replaced with '[P]' and '[S]', respectively,
     * and back again when restoring.
     *
     * This does mean that if the save itself contains '[P]', for example,
     * then this process will break the mods' save.
     * If your mod can potentially generate a save with the substring '[P]',
     * one workaround is to replace all instances of '[P' with '[PP'
     * before saving, and '[PP' to '[P' when restoring.
     * Similarly '[S' -> '[SS' before saving and '[SS' -> '[S' when restoring.
     */
    static safeSaveString(str: string) {
        return str.replace(/\|/g, '[P]').replace(/;/g, '[S]');
    }
    static safeLoadString(str: string) {
        return str.replace(/\[P\]/g, '|').replace(/\[S\]/g, ';');
    }

    static fromNativeSave(str: string) {
        let modSaveData = new CCModSaveData();
        if(!str) return modSaveData;

        let allData = str.split(';');
        for(let data of allData) {
            if(!data) continue;
            let i = data.indexOf(':');
            let modName = data.substring(0, i);
            let modRawData = CCModSaveData.safeLoadString(data.substring(i+1));

            if(modName.trim() == '' && modRawData.trim() == '') {
                /* This should not happen normally.
                 * It may happen if the save is un-base64-encoded,
                 * the plain save is edited manually,
                 * and when encoding back to base64,
                 * a "\n" at the end of the file is accidentally encoded together with the rest.
                 *
                 * We silently ignore this entry in this case.
                 */
                continue;
            }

            try {
                modSaveData[modName] = JSON.parse(modRawData);
            } catch (_) {
                modSaveData[modName] = modRawData;
            }
        }
        return modSaveData;
    }

    static toNativeSave(modSaveData: CCModSaveData, _version: number) {
        let str = '';
        for(let name in modSaveData) {
            let rawData = modSaveData[name];
            if(typeof rawData != 'string')
                rawData = JSON.stringify(rawData);
            str += name + ':' + CCModSaveData.safeSaveString(rawData) + ';';
        }
        return str;
    }

    static fromObject(obj: unknown, onError: ErrorHandler, subobjectName: string) {
        let data = new CCModSaveData();
        if(Array.isArray(obj)) {
            onError(`target${subobjectName} is not an array`);
            return data;
        }
        if(typeof obj != 'object' || obj === null) {
            onError(`source${subobjectName} is not an object`);
            return data;
        }
        for(let [key, value] of Object.entries(obj)) {
            if(typeof value == 'string' || typeof value == 'object') {
                data[key] = value;
            } else {
                onError(`source${subobjectName}["${key}"] is not an object or a string`);
            }
        }
        return data;
    }
}

export class CCSave {
    // Attribute names have the same name in game
    version: number = 2.031;
    startDate: TimePoint = 1.6e12; // Run start date
    fullDate: TimePoint = 1.6e12; // Legacy start date; NaN for very old save files
    lastDate: TimePoint = 1.6e12; // when the save was made; used to compute offline production
    bakeryName: string = "Test"; // Matches [A-Za-z0-9_ ]{1,28}
    seed: string = "aaaaa"; // Matches [a-z]{5}

    prefs: CCPreferences = new CCPreferences();

    cookies: number = 0; // Number of cookies in bank
    cookiesEarned: number = 0; // Total number of cookies baked in this ascension
    cookieClicks: number = 0; // Number of times the big cookie was clicked
    goldenClicks: number = 0; // Number of golden cookies clicked
    handmadeCookies: number = 0; // Cookies made by clicking (including e.g. buffs)
    missedGoldenClicks: number = 0; // Number of golden cookies that faded away
    bgType: number = 0; // Current background; used e.g. in the background selector
    milkType: number = 0; // Current milk; either from achievements or from milk selector
    cookiesReset: number = 0; // Total number of cookies baked in previous ascensions
    elderWrath: number = 0; // Current stage of grandmapocalypse
    pledges: number = 0; // Number of times that "Elder pledge" was used
    pledgeT: number = 0; // Game.fps * seconds since last pledge
    nextResearch: number = 0; // Upgrade id of the next research to be unlocked by the bingo center
    researchT: number = 0; // Game.fps * seconds to unlock new research
    resets: number = 0; // Number of "valid" ascensions (where prestige was gained)
    goldenClicksLocal: number = 0; // Number of golden cookies clicked in this ascension
    cookiesSucked: number = 0; // Unused; see CCWrinklerData
    wrinklersPopped: number = 0; // Number of wrinklers popped this ascension
    santaLevel: number = 0; // Level of the Santa Claus minifigure
    reindeerClicked: number = 0; // Number of reindeer clicked in this ascension
    seasonT: number = 0; // Game.fps * seconds left in the current season
    seasonUses: number = 0; // Number of times that seasons were switched in this ascension
    season: string = ''; // Current season ('', valentines, easter, fools, halloween, christmas)
    wrinklers: CCWrinklerData = new CCWrinklerData();
    prestige: number = 0; // Current prestige level
    heavenlyChips: number = 0; // Number of unspent heavenly chips
    heavenlyChipsSpent: number = 0; // prestige - heavenlyChips
    ascensionMode: number = 0; // 0 if regular, 1 if Born again
    permanentUpgrades: string[] = ['', '', '', '', '']; // Upgrade ids in the permanent upgrade slots
    dragonLevel: number = 0; // Current level of Krumblor
    dragonAura: number = 0; // Id of the first aura
    dragonAura2: number = 0; // Id of the second aura
    chimeType: number = 0; // Golden cookie sound selector; 0 = no sound, 1 = chime
    volume: number = 75; // Volume of game sounds
    lumps: number = -1; // Number of sugar lumps; -1 if sugar lumps hasn't been unlocked yet
    lumpsTotal: number = -1; // Total number of lumps collected across ascensions
    lumpT: TimePoint = 1.6e12; // Time when the current coalescing lump started growing
    lumpRefill: number = 0; // Game.fps * seconds since a minigame lump refill was used
    lumpCurrentType: string = 'normal';
    vault: string[] = []; // vaulted upgrades (from the Insipired checklist heavenly upgrade)
    heralds: number = 42; // Heralds when the game was saved (for calculating offline production)
    fortuneGC: boolean = false; // Whether the golden-cookie-spawning fortune appeared or not
    fortuneCPS: boolean = false; // Whether the hour-of-CpS fortune appeared or not
    cookiesPsRawHighest: number = 0; // Highest raw CpS in this ascension (used in the stock market)

    // 2.04-specific
    volumeMusic: number = 50; // Background music volume

    // The following attributes have no direct counterpart in the `Game` namespace.

    buildings: CCBuildingsData = new CCBuildingsData();
    ownedUpgrades: string[] = [];
    unlockedUpgrades: string[] = []; // Upgrades which are currently unlocked but not owned
    achievements: string[] = []; // Achievements won
    buffs: CCBuff[] = [];
    modSaveData = new CCModSaveData();

    static maxVersion = 2.042;
    static minVersion = 2.022; // Versions earlier than this may not be properly parseable

    static toNativeSave(save: CCSave): string {
        let saveString = '';
        saveString += save.version;

        saveString += '|';
        // The second slot is reserved for future extension

        saveString += '|';
        saveString += save.startDate + ';' +
            save.fullDate + ';' +
            save.lastDate + ';' +
            save.bakeryName + ';' +
            save.seed;

        saveString += '|';
        saveString += CCPreferences.toNativeSave(save.prefs, save.version)

        saveString += '|';
        saveString += save.cookies + ';' +
            save.cookiesEarned + ';' +
            save.cookieClicks + ';' +
            save.goldenClicks + ';' +
            save.handmadeCookies + ';' +
            save.missedGoldenClicks + ';' +
            save.bgType + ';' +
            save.milkType + ';' +
            save.cookiesReset + ';' +
            save.elderWrath + ';' +
            save.pledges + ';' +
            save.pledgeT + ';' +
            save.nextResearch + ';' +
            save.researchT + ';' +
            save.resets + ';' +
            save.goldenClicksLocal + ';' +
            save.cookiesSucked + ';' +
            save.wrinklersPopped + ';' +
            save.santaLevel + ';' +
            save.reindeerClicked + ';' +
            save.seasonT + ';' +
            save.seasonUses + ';' +
            save.season + ';' +
            save.wrinklers.amount + ';' +
            save.wrinklers.number + ';' +
            save.prestige + ';' +
            save.heavenlyChips + ';' +
            save.heavenlyChipsSpent + ';' +
            '0;' + // Game.heavenlyCookies; unused, always zero
            save.ascensionMode + ';' +
            save.permanentUpgrades.map(u => u == '' ? '-1' : UpgradesByName[u]).join(';') + ';' +
            save.dragonLevel + ';' +
            save.dragonAura + ';' +
            save.dragonAura2 + ';' +
            save.chimeType + ';' +
            save.volume + ';' +
            save.wrinklers.shinies + ';' +
            save.wrinklers.amountShinies + ';' +
            save.lumps + ';' +
            save.lumpsTotal + ';' +
            save.lumpT + ';' +
            save.lumpRefill + ';' +
            SugarLumpTypesByName[save.lumpCurrentType] + ';' +
            save.vault.map(u => UpgradesByName[u]).join(',') + ';' +
            save.heralds + ';' +
            Number(save.fortuneGC) + ';' +
            Number(save.fortuneCPS) + ';' +
            save.cookiesPsRawHighest + ';';

        if(save.version >= 2.04) {
            saveString += save.volumeMusic + ';';
        }

        saveString += '|';
        saveString += CCBuildingsData.toNativeSave(save.buildings, save.version);

        saveString += '|';
        let upgrades = '00'.repeat(UpgradesById.length).split('');
        for(let upgrade of save.ownedUpgrades) {
            let i = UpgradesByName[upgrade];
            upgrades[2*i] = upgrades[2*i+1] = '1';
        }
        for(let upgrade of save.unlockedUpgrades) {
            let i = UpgradesByName[upgrade];
            upgrades[2*i] = '1';
        }
        saveString += upgrades.join('');

        saveString += '|';
        let achievements = '0'.repeat(AchievementsById.length).split('');
        for(let achievement of save.achievements) {
            let i = AchievementsByName[achievement];
            achievements[i] = '1';
        }
        saveString += achievements.join('');

        saveString += '|';
        saveString += save.buffs.map(writeBuffToString).join('');

        saveString += '|';
        saveString += CCModSaveData.toNativeSave(save.modSaveData, save.version);

        saveString = Buffer.from(saveString).toString('base64');
        return encodeURIComponent(saveString) + '%21END%21';
    }

    static fromNativeSave(saveString: string): CCSave {
        saveString = decodeURIComponent(saveString).replace('!END!', '');
        saveString = Buffer.from(saveString, 'base64').toString(); // TODO: might fail outside latin1
        let saveObject = new CCSave();
        let data = saveString.split('|');

        saveObject.version = parseFloat(data[0]);
        if(saveObject.version < CCSave.minVersion) {
            console.log(`Old save (version ${saveObject.version}, min is ${CCSave.minVersion}),`
                        +' may not be parsed properly.');
        }
        if(saveObject.version > CCSave.maxVersion) {
            console.log(`Future version save (${saveObject.version}, max is ${CCSave.maxVersion}),`
                        +' may not be parsed properly.');
        }

        let saveMetadata = data[2].split(';'); // saveString[1] is empty
        saveObject.startDate = Number(saveMetadata[0]);
        saveObject.fullDate = Number(saveMetadata[1]);
        saveObject.lastDate = Number(saveMetadata[2]);
        saveObject.bakeryName = saveMetadata[3] ?? 'Test';
        saveObject.seed = saveMetadata[4];

        saveObject.prefs = CCPreferences.fromNativeSave(data[3]);

        let generalData = data[4].split(';');
        saveObject.cookies = Number(generalData[0]);
        saveObject.cookiesEarned = Number(generalData[1]);
        saveObject.cookieClicks = Number(generalData[2]);
        saveObject.goldenClicks = Number(generalData[3]);
        saveObject.handmadeCookies = Number(generalData[4]);
        saveObject.missedGoldenClicks = Number(generalData[5]);
        saveObject.bgType = Number(generalData[6]);
        saveObject.milkType = Number(generalData[7]);
        saveObject.cookiesReset = Number(generalData[8]);
        saveObject.elderWrath = Number(generalData[9]);
        saveObject.pledges = Number(generalData[10]);
        saveObject.pledgeT = Number(generalData[11]);
        saveObject.nextResearch = Number(generalData[12]);
        saveObject.researchT = Number(generalData[13]);
        saveObject.resets = Number(generalData[14]);
        saveObject.goldenClicksLocal = Number(generalData[15]);
        saveObject.cookiesSucked = Number(generalData[16]);
        saveObject.wrinklersPopped = Number(generalData[17]);
        saveObject.santaLevel = Number(generalData[18]);
        saveObject.reindeerClicked = Number(generalData[19]);
        saveObject.seasonT = Number(generalData[20]);
        saveObject.seasonUses = Number(generalData[21]);
        saveObject.season = generalData[22];
        saveObject.wrinklers.amount = Number(generalData[23]);
        saveObject.wrinklers.number = Number(generalData[24]);
        saveObject.prestige = Number(generalData[25]);
        saveObject.heavenlyChips = Number(generalData[26]);
        saveObject.heavenlyChipsSpent = Number(generalData[27]);
        // generalData[28] is Game.heavenlyCookies, which is always zero
        saveObject.ascensionMode = Number(generalData[29]);
        saveObject.permanentUpgrades[0] = generalData[30] == '-1' ? '' : UpgradesById[Number(generalData[30])];
        saveObject.permanentUpgrades[1] = generalData[31] == '-1' ? '' : UpgradesById[Number(generalData[31])];
        saveObject.permanentUpgrades[2] = generalData[32] == '-1' ? '' : UpgradesById[Number(generalData[32])];
        saveObject.permanentUpgrades[3] = generalData[33] == '-1' ? '' : UpgradesById[Number(generalData[33])];
        saveObject.permanentUpgrades[4] = generalData[34] == '-1' ? '' : UpgradesById[Number(generalData[34])];
        saveObject.dragonLevel = Number(generalData[35]);
        saveObject.dragonAura = Number(generalData[36]);
        saveObject.dragonAura2 = Number(generalData[37]);
        saveObject.chimeType = Number(generalData[38]);
        saveObject.volume = Number(generalData[39]);
        saveObject.wrinklers.shinies = Number(generalData[40]);
        saveObject.wrinklers.amountShinies = Number(generalData[41]);
        saveObject.lumps = Number(generalData[42]);
        saveObject.lumpsTotal = Number(generalData[43]);
        saveObject.lumpT = Number(generalData[44]);
        saveObject.lumpRefill = Number(generalData[45]);
        saveObject.lumpCurrentType = SugarLumpTypesById[Number(generalData[46])];
        saveObject.vault = generalData[47]
            .split(',')
            .filter(s => s != '') // If generalData[47] == '', this turns the array to []
            .sort( (id1, id2) => Number(id1) - Number(id2) )
            .map(s => UpgradesById[Number(s)]);
        saveObject.heralds = Number(generalData[48]);
        saveObject.fortuneGC = generalData[49] == '1';
        saveObject.fortuneCPS = generalData[50] == '1';
        saveObject.cookiesPsRawHighest = Number(generalData[51]);

        // Introduced in 2.04
        if(generalData[52]) saveObject.volumeMusic = Number(generalData[52]);

        saveObject.buildings = CCBuildingsData.fromNativeSave(data[5]);

        for(let i = 0; i < UpgradesById.length; i++) {
            if(data[6].charAt(2*i) == '1' && data[6].charAt(2*i+1) == '1')
                saveObject.ownedUpgrades.push(UpgradesById[i]);
            if(data[6].charAt(2*i) == '1' && data[6].charAt(2*i+1) == '0')
                saveObject.unlockedUpgrades.push(UpgradesById[i]);
        }

        for(let i = 0; i < AchievementsById.length; i++) {
            if(data[7].charAt(i) == '1')
                saveObject.achievements.push(AchievementsById[i]);
        }

        let buffStr = data[8].split(';');
        for(let str of buffStr) {
            if(str != '') saveObject.buffs.push(parseBuffFromString(str));
        }

        saveObject.modSaveData = CCModSaveData.fromNativeSave(data[9]);

        return saveObject;
    }

    static fromObject(obj: unknown, onError: ErrorHandler = throwOnError) {
        let save = new CCSave();

        /* https://github.com/microsoft/TypeScript/issues/21732
         * Why, TypeScript, why?
         * TODO: add better types
         */
        if(obj === null) {
            return save;
        }

        if(typeof obj != 'object') {
            onError('source is not an object');
            return save;
        }

        let _obj = {...obj} as Record<string, unknown>;

        /* Special handling of fullDate.
         * If more of these special handlings appear,
         * we should modify pseudoObjectAssign.
         */
        if('fullDate' in _obj && _obj.fullDate === null) {
            _obj.fullDate = NaN;
            // This tricks pseudoObjectAssign into doing the right thing without complaining
        }

        pseudoObjectAssign(save, _obj, onError);

        if('prefs' in _obj) {
            save.prefs = CCPreferences.fromObject(_obj.prefs, onError, '.prefs');
        }

        if('wrinklers' in _obj) {
            save.wrinklers = CCWrinklerData.fromObject(_obj.wrinklers, onError, '.wrinklers');
        }

        // The permanent upgrade slots have to be handled manually
        if('permanentUpgrades' in _obj) {
            if(!Array.isArray(_obj.permanentUpgrades)) {
                onError(`source.permanentUpgrades is not an array`);
            } else {
                let length = Math.min(_obj.permanentUpgrades.length, save.permanentUpgrades.length);
                if(_obj.permanentUpgrades.length > length) {
                    onError(`source.permanentUpgrades has more than ${length} entries`);
                }
                for(let i = 0; i < length; i++) {
                    if(typeof _obj.permanentUpgrades[i] == 'string') {
                        let upgrade: string = _obj.permanentUpgrades[i];
                        if(upgrade in UpgradesByName || upgrade == '') {
                            save.permanentUpgrades[i] = upgrade;
                        } else {
                            onError(`source.permanentUpgrades[${i}] is not an upgrade (typo?)`);
                        }
                    } else if(typeof _obj.permanentUpgrades[i] == 'number') {
                        let id: number = _obj.permanentUpgrades[i];
                        if(Number.isInteger(id) && id >= -1 && id < UpgradesById.length) {
                            if(id == -1) {
                                save.permanentUpgrades[i] = '';
                            } else {
                                save.permanentUpgrades[i] = UpgradesById[id];
                            }
                        } else {
                            onError(`source.permanentUpgrades[${i}] is not an upgrade id`);
                        }
                    } else {
                        onError(`source.permanentUpgrades[${i}] is not a number or a string`);
                    }
                }
            }
        }

        /* Converts ids to the corresponding upgrade,
         * passes strings through,
         * and for everything else complains and returns null.
         */
        function toUpgrade(u: unknown, subobjectName: string) {
            if(typeof u == 'string') {
                if(u in UpgradesByName) {
                    return u;
                } else {
                    onError(`source${subobjectName} is not an upgrade (typo?)`);
                }
            } else if(typeof u == 'number') {
                if(Number.isInteger(u) && u >= 0 && u < UpgradesById.length) {
                    return UpgradesById[u];
                } else {
                    onError(`source${subobjectName} is not an upgrade id (typo?)`);
                }
            } else {
                onError(`source${subobjectName} is not a number or a string`);
            }
            return null;
        }

        /* Convert whatever is given to a list of upgrades,
         * and sort by id.
         */
        function toSortedUpgradeList(u: unknown, subobjectName: string) {
            if(!Array.isArray(u)) {
                onError(`source${subobjectName} is not an array`);
                return [];
            } else {
                return u.map( (u: unknown, i: number) => {
                    return toUpgrade(u, `${subobjectName}[${i}]`);
                }).filter( (u: string | null): u is string => {
                    return u != null;
                }).sort((u, v) => UpgradesByName[u] - UpgradesByName[v]);
            }
        }

        if('vault' in _obj) {
            save.vault = toSortedUpgradeList(_obj.vault, '.vault');
        }

        if('buildings' in _obj) {
            save.buildings = CCBuildingsData.fromObject(_obj.buildings, onError, '.buildings');
        }

        if('ownedUpgrades' in _obj) {
            save.ownedUpgrades = toSortedUpgradeList(_obj.ownedUpgrades, '.ownedUpgrades');
        }

        if('unlockedUpgrades' in _obj) {
            save.unlockedUpgrades = toSortedUpgradeList(_obj.unlockedUpgrades, '.unlockedUpgrades');
        }

        // Remove upgrades both in unlockedUpgrades and ownedUpgrades
        {
            let ownedSet = new Set(save.ownedUpgrades);
            save.unlockedUpgrades = save.unlockedUpgrades.filter( u => {
                if(ownedSet.has(u)) {
                    onError(`Upgrade "${u}" appears in both source.ownedUpgrades` +
                            ` and source.unlockedUpgrades`);
                    return false;
                }
                return true;
            });
        }

        if('achievements' in _obj) {
            // TODO: maybe eliminate duplicates?
            if(!Array.isArray(_obj.achievements)) {
                onError(`source.achievements is not an array`);
            } else {
                for(let i = 0; i < _obj.achievements.length; i++) {
                    if(typeof _obj.achievements[i] == 'string') {
                        let achievement: string = _obj.achievements[i];
                        if(achievement in AchievementsByName) {
                            save.achievements.push(achievement);
                        } else {
                            onError(`source.achievements[${i}] is not an achievement (typo?)`);
                        }
                    } else if(typeof _obj.achievements[i] == 'number') {
                        let id: number = _obj.achievements[i];
                        if(Number.isInteger(id) && id >= 0 && id < AchievementsById.length) {
                            save.achievements.push(AchievementsById[id]);
                        } else {
                            onError(`source.achievements[${i}] is not an achievement id (typo?)`);
                        }
                    } else {
                        onError(`source.achievements[${i}] is not a number or a string`);
                    }
                }
                save.achievements.sort((u, v) => AchievementsByName[u] - AchievementsByName[v]);
            }
        }

        if('buffs' in _obj) {
            if(!Array.isArray(_obj.buffs)) {
                onError(`source.buffs is not an array`);
            } else {
                for(let i = 0; i < _obj.buffs.length; i++) {
                    let buff = parseBuffFromObject(_obj.buffs[i], onError, `.buffs[${i}]`);
                    if(buff !== null) {
                        save.buffs.push(buff);
                    }
                }
            }
        }

        if('modSaveData' in _obj) {
            save.modSaveData = CCModSaveData.fromObject(_obj.modSaveData, onError, `.modSaveData`);
        }

        return save;
    }
};
