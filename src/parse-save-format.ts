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

export const UpgradesByName = (() => {
    let map: { [name: string] : number } = {};
    for(let i in UpgradesById) {
        map[UpgradesById[i]] = Number(i);
    }
    return map;
})();

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

export const AchievementsByName = (() => {
    let map: { [name: string] : number } = {};
    for(let i in AchievementsById) {
        map[AchievementsById[i]] = Number(i);
    }
    return map;
})();

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

    // The following attributes have no direct counterpart in the `Game` namespace.
    buildings: CCBuildingsData = new CCBuildingsData();
    ownedUpgrades: string[] = [];
    unlockedUpgrades: string[] = []; // Upgrades which are currently unlocked but non owned
    achievements: string[] = []; // Achievements won

    // TODO: Add constructor accepting partial data

    static currentVersion = 2.031;
    static minVersion = 2.022; // Versions earlier than this may not be properly parseable
    static upgradeCount = 729;
    static achievementCount = 538;

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
        let upgrades = '00'.repeat(CCSave.upgradeCount).split('');
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
        let achievements = '0'.repeat(CCSave.achievementCount).split('');
        for(let achievement of save.achievements) {
            let i = AchievementsByName[achievement];
            achievements[i] = '1';
        }
        saveString += achievements.join('');

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

        for(let i = 0; i < CCSave.upgradeCount; i++) {
            if(data[6].charAt(2*i) == '1' && data[6].charAt(2*i+1) == '1')
                saveObject.ownedUpgrades.push(UpgradesById[i]);
            if(data[6].charAt(2*i) == '1' && data[6].charAt(2*i+1) == '0')
                saveObject.unlockedUpgrades.push(UpgradesById[i]);
        }

        for(let i = 0; i < CCSave.achievementCount; i++) {
            if(data[7].charAt(i) == '1')
                saveObject.achievements.push(AchievementsById[i]);
        }

        return saveObject;
    }
};
