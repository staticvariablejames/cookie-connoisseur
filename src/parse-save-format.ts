/* Contains tools to translate the Cookie Clicker save format to a JSON-friendly object
 * and back.
 *
 * The name of the attributes match their names in the `Game` namespace,
 * but several boolean attributes are in fact either 0 or 1 in the game code.
 */

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

    static toBitstring(prefs: CCPreferences) {
        let str = '';
        for(let [_key, value] of Object.entries(prefs)) {
            str += value ? '1' : '0';
        }
        return str;
    }
    static fromBitstring(str: string) {
        let prefs = new CCPreferences();
        let keys = Object.keys(prefs) as Array<keyof CCPreferences>;
        for(let i = 0; i < Math.min(keys.length, str.length); i++) {
            prefs[keys[i]] = Boolean(Number(str.charAt(i)));
        }
        return prefs;
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
}

export class CCPlainBuilding { // Building without minigame data
    amount: number = 0; // Amount of that building that is currently owned
    bought: number = 0; // Number of times this building was bought this ascension
    // "Bought" is only used as an additional check to make buildings full-opacity
    totalCookies: number = 0; // Cookies produced by that building alone
    level: number = 0;
    muted: boolean = false; // Whether the building is hidden or not
    highest: number = 0; // Higest amount of this building owned in this ascension

    static fromStringSave(str: string) {
        let obj = new CCPlainBuilding();
        let data = str.split(',');
        obj.amount = Number(data[0]);
        obj.bought = Number(data[1]);
        obj.totalCookies = Number(data[2]);
        obj.level = Number(data[3]);
        // data[4] is the minigame data
        obj.muted = Boolean(Number(data[5]));
        obj.highest = Number(data[6] ?? obj.amount); // highest was introduced in 2.026
        return obj;
    }

    static toStringSave(obj: CCPlainBuilding) {
        return obj.amount + ',' +
            obj.bought + ',' +
            obj.totalCookies + ',' +
            obj.level + ',' +
            ',' + // No minigame data
            Number(obj.muted) + ',' +
            obj.highest;
    }
}

export class CCBuildingsData { // Aggregates all buildings
    'Cursor': CCPlainBuilding = new CCPlainBuilding();
    'Grandma': CCPlainBuilding = new CCPlainBuilding();
    'Farm': CCPlainBuilding = new CCPlainBuilding(); // TODO: implement minigame
    'Mine': CCPlainBuilding = new CCPlainBuilding();
    'Factory': CCPlainBuilding = new CCPlainBuilding();
    'Bank': CCPlainBuilding = new CCPlainBuilding(); // TODO
    'Temple': CCPlainBuilding = new CCPlainBuilding(); // TODO
    'Wizard tower': CCPlainBuilding = new CCPlainBuilding(); // TODO
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

    static fromStringSave(str: string) {
        let buildings = new CCBuildingsData();
        let data = str.split(';');
        buildings['Cursor'] = CCPlainBuilding.fromStringSave(data[0]);
        buildings['Grandma'] = CCPlainBuilding.fromStringSave(data[1]);
        buildings['Farm'] = CCPlainBuilding.fromStringSave(data[2]);
        buildings['Mine'] = CCPlainBuilding.fromStringSave(data[3]);
        buildings['Factory'] = CCPlainBuilding.fromStringSave(data[4]);
        buildings['Bank'] = CCPlainBuilding.fromStringSave(data[5]);
        buildings['Temple'] = CCPlainBuilding.fromStringSave(data[6]);
        buildings['Wizard tower'] = CCPlainBuilding.fromStringSave(data[7]);
        buildings['Shipment'] = CCPlainBuilding.fromStringSave(data[8]);
        buildings['Alchemy lab'] = CCPlainBuilding.fromStringSave(data[9]);
        buildings['Portal'] = CCPlainBuilding.fromStringSave(data[10]);
        buildings['Time machine'] = CCPlainBuilding.fromStringSave(data[11]);
        buildings['Antimatter condenser'] = CCPlainBuilding.fromStringSave(data[12]);
        buildings['Prism'] = CCPlainBuilding.fromStringSave(data[13]);
        buildings['Chancemaker'] = CCPlainBuilding.fromStringSave(data[14]);
        buildings['Fractal engine'] = CCPlainBuilding.fromStringSave(data[15]);
        buildings['Javascript console'] = CCPlainBuilding.fromStringSave(data[16]);
        if(data[17] != '') // Idleverses were introduced in 2.03
            buildings['Idleverse'] = CCPlainBuilding.fromStringSave(data[17]);
        return buildings;
    }

    static toStringSave(buildings: CCBuildingsData) {
        let str = '';
        str += CCPlainBuilding.toStringSave(buildings['Cursor']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Grandma']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Farm']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Mine']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Factory']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Bank']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Temple']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Wizard tower']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Shipment']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Alchemy lab']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Portal']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Time machine']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Antimatter condenser']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Prism']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Chancemaker']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Fractal engine']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Javascript console']) + ';';
        str += CCPlainBuilding.toStringSave(buildings['Idleverse']) + ';';
        return str;
    }
}

export class CCSave {
    // Attribute names have the same name in game
    version: number = 2.031;
    startDate: TimePoint = 1.6e12; // Run start date
    fullDate: TimePoint = 1.6e12; // Legacy start date
    lastDate: TimePoint = 1.6e12; // when the save was made; used to compute offline production
    bakeryName: string = "Test"; // Matches [A-Za-z0-9_ ]{1,28}
    seed: string = "aaaaa"; // Matches [a-z]{5}

    preferences: CCPreferences = new CCPreferences();

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
    permanentUpgrades: number[] = [-1, -1, -1, -1, -1]; // Upgrade ids in the permanent upgrade slots
    dragonLevel: number = 0; // Current level of Krumblor
    dragonAura: number = 0; // Id of the first aura
    dragonAura2: number = 0; // Id of the second aura
    chimeType: number = 0; // Golden cookie sound selector; 0 = no sound, 1 = chime
    volume: number = 50; // Volume of game sounds
    lumps: number = -1; // Number of sugar lumps; -1 if sugar lumps hasn't been unlocked yet
    lumpsTotal: number = -1; // Total number of lumps collected across ascensions
    lumpT: TimePoint = 1.6e12; // Time when the current coalescing lump started growing
    lumpRefill: number = 0; // Game.fps * seconds since a minigame lump refill was used
    lumpCurrentType: number = 0;
    vault: number[] = []; // ids of vaulted upgrades (from the Insipired checklist heavenly upgrade)
    heralds: number = 42; // Heralds when the game was saved (for calculating offline production)
    fortuneGC: boolean = false; // Whether the golden-cookie-spawning fortune appeared or not
    fortuneCPS: boolean = false; // Whether the hour-of-CpS fortune appeared or not
    cookiesPsRawHighest: number = 0; // Highest raw CpS in this ascension (used in the stock market)

    buildings: CCBuildingsData = new CCBuildingsData();

    // TODO: Add constructor accepting partial data

    static currentVersion = 2.031;
    static minVersion = 2.022; // Versions earlier than this may not be properly parseable

    static toStringSave(save: CCSave): string {
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
        saveString += CCPreferences.toBitstring(save.preferences)

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
            save.permanentUpgrades[0] + ';' +
            save.permanentUpgrades[1] + ';' +
            save.permanentUpgrades[2] + ';' +
            save.permanentUpgrades[3] + ';' +
            save.permanentUpgrades[4] + ';' +
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
            save.lumpCurrentType + ';' +
            save.vault.join(',') + ';' +
            save.heralds + ';' +
            Number(save.fortuneGC) + ';' +
            Number(save.fortuneCPS) + ';' +
            save.cookiesPsRawHighest + ';';

        saveString += '|';
        saveString += CCBuildingsData.toStringSave(save.buildings);

        saveString += '|';
        saveString = Buffer.from(saveString).toString('base64');
        return encodeURIComponent(saveString) + '%21END%21';
    }

    static fromStringSave(saveString: string): CCSave {
        saveString = decodeURIComponent(saveString).replace('!END!', '');
        saveString = Buffer.from(saveString, 'base64').toString(); // TODO: might fail outside latin1
        let saveObject = new CCSave();
        let data = saveString.split('|');

        saveObject.version = parseFloat(data[0]);
        if(saveObject.version < CCSave.minVersion) {
            console.log(`Old save (version ${saveObject.version}, min is ${CCSave.minVersion}),`
                        +' may not be parsed properly.');
        }
        if(saveObject.version > CCSave.currentVersion) {
            console.log(`Future version save (${saveObject.version}, max is ${CCSave.minVersion}),`
                        +' may not be parsed properly.');
        }

        let saveMetadata = data[2].split(';'); // saveString[1] is empty
        saveObject.startDate = Number(saveMetadata[0]);
        saveObject.fullDate = Number(saveMetadata[1]);
        saveObject.lastDate = Number(saveMetadata[2]);
        saveObject.bakeryName = saveMetadata[3] ?? 'Test';
        saveObject.seed = saveMetadata[4];

        saveObject.preferences = CCPreferences.fromBitstring(data[3]);

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
        saveObject.permanentUpgrades[0] = Number(generalData[30]);
        saveObject.permanentUpgrades[1] = Number(generalData[31]);
        saveObject.permanentUpgrades[2] = Number(generalData[32]);
        saveObject.permanentUpgrades[3] = Number(generalData[33]);
        saveObject.permanentUpgrades[4] = Number(generalData[34]);
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
        saveObject.lumpCurrentType = Number(generalData[46]);
        saveObject.vault = generalData[47].split(',').map(s => Number(s));
        saveObject.heralds = Number(generalData[48]);
        saveObject.fortuneGC = generalData[49] == '1';
        saveObject.fortuneCPS = generalData[50] == '1';
        saveObject.cookiesPsRawHighest = Number(generalData[51]);

        saveObject.buildings = CCBuildingsData.fromStringSave(data[5]);

        return saveObject;
    }
};
