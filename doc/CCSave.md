CCSave
======

**[Example](#example-script) |
[API](#api) |
[Attributes](#attributes) |
[Mod data](#mod-data) |
[Executables](#executables) |
[Idiosyncrasies](#idiosyncrasies)**

Objects of this class are a JSON-friendly representation of a Cookie Clicker save.
These objects can be converted to Cookie Clicker's native save format and back.

The attribute names of a CCSave object mimic the attribute names of the `Game` object,
with a few exceptions (documented [below](#attributes)).


Example Script
==============

Construct a CCSave with a quadrillion cookies,
a specific seed,
with the option to display crates on the Stats menu,
one Temple,
the Pantheon minigame unlocked,
Rigidel slotted in the diamond slot,
and 20 hours left of a 24-hour sugar blessing buff.

```javascript
...
    let save = new CCSave();
    save.cookies = save.cookiesEarned = 1e15;
    save.seed = "james";
    save.prefs.crates = true;
    save.buildings['Temple'].amount = 1;
    save.buildings['Temple'].level = 1;
    save.buildings['Temple'].minigame.diamondSlot = 'order';
    save.buffs.push({
        name: 'sugar blessing',
        maxTime: 24*3600*30, // 86400 seconds * fps
        time: 20*3600*30,
    });

    // Or, equivalently:
    save = CCSave.fromObject({
        cookies: 1e15,
        cookiesEarned: 1e15,
        seed: "james",
        prefs: {
            crates: true,
        },
        buildings: {
            'Temple': {
                amount: 1,
                level: 1,
                minigame: {
                    diamondSlot: 'order',
                },
            },
        },
        buffs: [
            {
                name: 'sugar blessing',
                maxTime: 24*3600*30, // 86400 seconds * fps
                time: 20*3600*30,
            },
        ],
    });

    let page = await openCookieClickerPage(browser, {
        saveGame: CCSave.toNativeSave(save),
    });
...
```


API
===

The main class is `CCSave`.
It's attributes are outlined [below](#attributes).

The default constructor sets the attributes to the game defaults
(no cookies, no buildings, default preferences etc.),
with the following exceptions:
-   `startDate`, `lastDate`, `fullDate`, `lumpT` are all set to `1.6e12`.
    In-game, they are derived from `Date.now()`.
-   `bakeryName = "Test"` and `seed = "aaaaa"`.
    In-game, these are randomly generated.
-   `heralds = 42`.
    In-game, this is derived from a network query.


```typescript
    CCSave.toNativeSave(save: CCSave): string;
```

Converts the `CCSave` object to Cookie Clicker's native save format.

```typescript
    CCSave.fromNativeSave(saveString: string): CCSave;
```

Parses the Cookie Clicker's native save format into a `CCSave` object.


```typescript
    CCSave.fromObject(obj: unknown, onError: (msg: string) => void = throwOnError): CCSave;
```

Converts an object in the shape of `CCSave` to a `CCSave`.
This function is meant to handle both the output of `JSON.parse`
and manually constructed partial saves.
Missing properties will be set to their default values.

The `onError` callback is called whenever an attribute is not in its expected shape
(like a typo or an attribute of the wrong type).
The message argument tries to point out where and why something went wrong.
By default,
it simply throws a `new Error` with the message;
the intention is to be loud about hardcoded partial saves.

For usability purposes,
the default constructor and the conversion functions handle minigame data differently.
A default constructed `CCSave` will have all `minigame` attributes
constructed with the minigame default constructors,
even in situations in which this does not make sense
(like the Garden minigame).
This simplifies the process of constructing a CCSave according to your specifications.
`CCSave.toNativeSave` knows not to output the minigame data if the building level is 0.
`CCSave.fromNativeSave`, on the other hand,
does _not_ provide a default-constructed minigame data if the data is absent from the native save.
`CCSave.fromObject` stays in-between:
if no `minigame` key is defined,
it sets it to null if the building level is 0,
and to a default-constructed value if the building level is nonzero.


Attributes
==========

(Note:
Currently, the only comprehensive list of attributes is
[the source code itself](../src/ccsave.ts).
This is an "executive summary",
listing the gotchas and caveats.)

The attributes of `CCSave` objects describe all the information stored in a save file.
For the most part,
they follow the names of the corresponding variables in the `Game` namespace.

The types do not necessarily match the in-game types.
Most proeminently:
-   Cookie Clicker frequently uses 0 and 1 for boolean attributes.
    `CCSave` attributes are actually `boolean`.

-   `CCSave.lumpCurrentType` is a string
    (`'normal', 'bifurcated', 'golden', 'meaty', 'caramelized'`),
    rather than an id.
    Cookie Connoisseur exports maps `SugarLumpTypesById` and `SugarLumpTypesByName`
    that convert between these.

-   Garden soils and plants are referred to by their names,
    rather than ids.
    Cookie Connoisseur exports maps `CCGardenMinigame.SoilsById`, `CCGardenMinigame.SoilsByName`,
    `CCGardenMinigame.PlantsById`, `CCGardenMinigame.PlantsByName`
    that convert between these.

-   Pantheon spirits are referred to by their in-game code
    (e.g. 'order' for Rigidel, instead of 10).
    Absence of a spirit is represented by the empty string ''.
    Cookie Connoisseur exports functions `CCPantheonMinigame.godNameFromId`
    and `CCPantheonMinigame.godIdFromName`
    that convert between these.

-   Upgrades and Achievements are referred to by their names,
    rather than ids.
    Cookie Connoisseur exports maps `UpgradesById`, `UpgradesByName`,
    `AchievementsById`, `AchievementsByName`
    that map between those.
    Some names were changed:
    -   Upgrade id 105 is was renamed to `Sablés`; it is `Sabl&eacute;s` in-game.
    -   Upgrade id 718 is was renamed to `Milkhelp® lactose intolerance relief tablets`;
        it is `Milkhelp&reg; lactose intolerance relief tablets` in-game.
    -   Achievement id 230 was renamed to `Brought to you by the letter 🍪` here;
        it is `Brought to you by the letter <div style="display:inline-block;background:url(img/money.png);width:16px;height:16px;"></div>` in-game.
    -   Achievement id 240 was truncated to `There's really no hard limit to how long these achievement names can be`.
    -   Achievement id 304 was renamed to `Déjà vu`; it is `D&eacute;j&agrave; vu` in-game.

-   Buffs (like Frenzy) are referred to by their names,
    rather than ids.
    Cookie Connoisseur exports maps `BuffNamesById` and `BuffIdsByName`
    that map between those.

The won achievements and owned/unlocked upgrades
are kept in the attributes `ownedUpgrades`,
`unlockedUpgrades` and `achievements`.
These lists contain their names,
rather than ids.

Because an upgrade can only be owned if they are unlocked,
the `unlockedUpgrades` list only contains the upgrades which are unlocked,
but not owned.

Building data is stored in the `buildings` attribute.
It somewhat mirrors the `Game.Objects` map.
Each building is an object inside `buildings`;
for example, Antimatter condenser data is stored in `buildings['Antimatter condenser']`.

Data for each minigame is stored in a `minigame` attribute,
together with the corresponding building data.
For example, the Grimoire data is stored in `buildings['Wizard tower'].minigame`.

The `buffs` attribute is a list of buffs.
Each buff (including debuffs) has its own class,
containing only the relevant arguments.
Since each buff type has a unique `name` attribute,
they form a discriminated union.

Modded data is stored in the `modSaveData` attribute.
This field is essentially a `Record<string, string | object>`.
In-game, all mod data must be a string,
but since storing a `JSON.stringify`ed object is common practice,
the `modSaveData` attribute also accepts objects (like the output of `JSON.stringify`).


Mod Data
========

Cookie Clicker allows mods to store data in the save file.
This data is available in the `modSaveData` attribute both in the game and in the `CCSave` object.

Because Cookie Clicker only allows other mods to save a single string,
I expect most mods to `JSON.stringify` an object containing all the save data.
For convenience,
`CCSave.toNativeSave` accepts any object instead of a string,
and `JSON.stringify`es it before converting.
Similarly,
`CCSave.fromNativeSave` attemtps to `JSON.parse` the save data,
keeping them as strings in case of failure.

Sometimes,
when importing save strings,
Cookie Clicker messes up when parsing the mod IDs
and appends an extra "mod" with ID `""` or `"\u0000"`.
This "mod" is then saved back to the save game.
`CCSave.fromNativeSave` silently discards these "mods".


Executables
===========

There are two commands based on `CCSave`,
which essentially convert back and forth between Cookie Clicker's native format
and `CCSave`.

    npx cookie-connoisseur native-to-json

Reads from stdin a save in Cookie Clicker's native save format,
converts that to a `CCSave`,
and prints the `JSON.stringify`cation of it to stdout.
(It makes a bit of effort to pretty-print the save.)

    npx cookie-connoisseur json-to-native

Does the opposite: `JSON.parse`s the input,
pipes to `CCSave.fromObject`,
and prints it to stdout in Cookie Clicker's native save format.


Idiosyncrasies
==============

To accomodate for some quirks of the game,
some parts of `CCSave.fromNativeSave`, `CCSave.toNativeSave` and `CCSave.fromObject`
behave idiosyncratically.

-   As discussed [above](#mod-data),
    CCSave lightly tinkers with mod data,
    for convenience.

-   Cookie Clicker has a bug in `minigamePantheon.js`, function `M.slotGod`.
    When slotting a spirit from the roster into an occuppied slot,
    the game swaps the slots of the new and old spirit.
    But the new spirit had no slot,
    so the game ends up writing to `M.slot[-1]`,
    and the "slot" -1 appears in the save file as the last slot.
    So, for example,
    the data for the Pantheon minigame could be 10/8/6/2,
    meaning spirit 10 (Rigidel) slotted on diamond, 8 (Mokalsium) on ruby,
    6 (Muridal) on jade, and 2 (Godzamok) in the -1 slot.

    `CCSave.fromNativeSave` silently discards this last slot,
    so it does not show up when converting back to Cookie Clicker's native save format.

-   When creating a buff for the first time,
    Cookie Clicker stores only the arguments actually used by that buff
    (two arguments for Building specials/rusts, one for other buffs).
    But when parsing a buff, it fills nonexistent arguments with zeros.
    Therefore, a frenzy which was originally saved as `0,2310,2310,7`
    will be saved as `0,2310,2310,7,0,0` if loaded and saved again.
    `CCSave.toNativeSave` never writes the spurious `,0,0`.

-   `Game.vault` is the list of the vaulted upgrades
    (for the _Inspired checklist_ heavenly upgrade).
    This list is constructed as the player vaults upgrades.
    and therefore may be out of order.
    (This has no gameplay effect.)
    Both `CCSave.fromObject` and `CCSave.fromNativeSave`
    sort the vault according to upgrade id.

-   `fullDate` registers the date of the beginning of the run.
    Very old saves don't contain this information,
    so they are parsed as `NaN` by the game,
    and kept this way when exporting the save again.
    The game actually has explicit support for these kinds of save;
    it automatically awards "So much to do so much to see" for them,
    and displays "a long while ago" in the "Legacy started" statistic.

    Therefore, for compatibility,
    `CCSave.fullDate` may also be `NaN`.
    Since `JSON.stringify` outputs `NaN` as `null`,
    `CCSave.fromObject` interprets `null` as `NaN` for `fullDate`.

-   Buildings have a `.highest` attribute that's always higher than `.amount` in-game.
    If `.highest` is not present, `CCSave.fromObject` sets it to `.amount`.
    Rationale: a few parts of the game (most notably the Stock market minigame)
    don't work properly if `.highest = 0`,
    so this allows us to explicitly set `.amount` only,
    without worrying about `.highest`.
