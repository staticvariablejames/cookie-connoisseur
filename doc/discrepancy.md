Lump Timestamp Computation Discrepancy
======================================

This is a technical document analyzing the code surrounding the discrepancy bug,
and how Cookie Connoisseur forces it to happen.

Summary
-------

`Game.lumpT` is a JavaScript timestamp (number of milliseconds since 1970-01-01)
which corresponds to when the current coalescing sugar lump has started growing.
If the lump falls while offline,
the function `Game.loadLumps` calculates when it fell and sets `Game.lumpT` to this new value.
However, due to timing issues stemming from multiple `Date.now()` calls,
sometimes `Game.lumpT` is set to a number which is a few milliseconds later
than what would be the theoretical instant the previous lump fell.
The difference between the actual value of `Game.lumpT` and the theoretical value
is the **discrepancy**.

Cookie Connoisseur meddles with the `Date` object
and is thus able to intentionally trigger this timing issue,
forcing the discrepancy to be any chosen nonnegative integer.
The implementation is fairly simple:
if no achievements are awarded when the game loads,
and the player does not have the upgrade "Century egg",
then the game calls `Date.now()` exactly 15 times
before arriving at the two `Date.now()` calls that cause the discrepancy bug.
So we simply count the number of invocations,
and intentionally return two timestamps whose difference is exactly the discrepancy.

(Each awarded achievement triggers a call to `Date.now()`.
In theory it is possible to compute how many achievements would be awarded upon loading,
but doing so would basically require a reimplementation of `Game.CalculateGains()`.
So Cookie Connoisseur simply bails out and refuses to attempt to control the discrepancy in this case.)


Code analysis of `Game.loadLumps`
=================================

This and associated functions are created by `Game.Init`, in `main.js`.
The code can be distilled as follows.

```javascript
    Game.computeLumpTimes = function() {
        Game.lumpRipeAge = ...; // Account for heavenly upgrades
        if(Game.hasGod) {
            ... // Handle Rigidel
        }
        Game.lumpRipeAge /= 1 + 0.05*Game.auraMult('Dragon\'s Curve');
        Game.lumpOverripeAge = Game.lumpRipeAge + 3600 * 1000;

        Game.lumpMatureAge = ...; // Not relevant for the discrepancy bug
    }

    Game.loadLumps = function() {
        Game.computeLumpTimes();
        if(Over 1 billion cookies baked, and not on a "Born again" run) {
            Game.lumpT = Math.min(Date.now(), Game.lumpT); // First assignment
            var age = Math.max(Date.now() - Game.lumpT, 0); // Poisoned age calculation
            var amount = Math.floor(age/Game.lumpOverripeAge);
            if (amount>=1) {
                Game.harvestLumps(1); // Implicitly does a second Game.lumpT assignment
                Game.lumpCurrentType = 0;
                if (amount>1) Game.harvestLumps(amount-1); // Third assignment
                Game.Notify(you harvested this many lumps while away);
                Game.lumpT = Date.now() - (age-amount*Game.lumpOverripeAge); // Fourth, poisoned assignment
                Game.computeLumpType();
            }
        }
    }

    Game.harvestLumps = function(amount) {
        Game.lumpT = Date.now();
        if(Game.lumpCurrentType == 2) { // golden lump
            ... // gain buff sugar blessing
            Game.Notify(Sugar blessing activated);
        }
        if(Game.lumpCurrentType == 4) { // caramelized lump
            ... // clear cooldowns
            Game.Notify(Sugar lump cooldowns cleared);
        }
        var total = ... // Random amount, weighted by Game.lumpCurrentType
        Game.gainLumps(amount * total);
        ... // Win achievements based on lump type
        Game.computeLumpTimes(); // Not relevant for the discrepancy bug
    }

    Game.gainLumps = function(total) {
        Game.lumps += total;
        Game.lumpsTotal += total;
        ... // Win achievements based on number of lumps harvested
    }

    Game.computeLumpType() {
        Game.seedrandom(Game.seed + '/' + Game.lumpT);
        // Rest of the code
    }
```

The pantheon does not load in time
----------------------------------

Cookie Clicker splits the code for the minigames into their own files
(e.g. `minigamePantheon.js`).
These are loaded by `Game.LoadMinigames()`,
which essentially appends a new tag `<script src='minigameName.js'>` to `document.head`.
Because JavaScript is single-threaded (ignoring web workers),
the minigame scripts will only be loaded
after the current [job](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#job) finishes.
This means that,
when loading the save from localStorage
(a "cold boot" of sorts),
`Game.hasGod` is always `undefined` when the game calls `Game.loadLumps`,
therefore **Rigidel is never active when loading from localStorage**.

Note that this bug is not related to the lump timestamp computation discrepancy,
although it also messes up the the final value of `Game.lumpT`.
This same bug prevents any minigames from affecting offline gains, for example.

The workaround is to simply load the save twice:
the first time (either from localStorage or manually from a file)
will make `Game.LoadMinigames()` load minigame code,
and then on the second time (necessarily manually from a file)
the lump timestamp computation can take advantage of Rigidel.

The sugar lump timestamp computation discrepancy
------------------------------------------------

Fundamentally,
the issue is that the lines annotated "poisoned age calculation" and the "poisoned assignment"
may use different values of `Date.now()`.
The discrepancy is exactly the difference between these two `Date.now()` calls.

The function `Game.loadLumps` assigns values to `Game.lumpT` four times.

The first assignment simply replace `Game.lumpT` with `Date.now()` if `Game.lumpT > Date.now()`.
This may only happen if players set their system clock forward in time
(to harvest many lumps instead of waiting for them)
and then set the system clock back,
and has no effect regarding the discrepancy.
- I believe this was meant to patch a bug in `Game.doLumps()`.
  This function (among other things) updates the coalescing lump icon (just below the stats button),
  and it uses a mathematical formula to pick the right icon from inside `img/icons.png`.
  The formula is not capped to be always nonnegative,
  so if `Game.lumpT > Date.now()` the chosen icon would be some random icon from the game,
  rather than a sugar lump.
  Replacing `Game.lumpT` with `Date.now()` in this case prevents this issue.

  Except it does not patch the issue completely,
  because players could set their clock back while the game is open.
  Cookie Clicker version 2.03 introduced a proper fix;
  if `Game.lumpT > Date.now()`,
  it sets the lump icon to be Orteil's head
  and displays the "time travel shenanigans" text in the tooltip.

  This means that nowadays that first `Game.lumpT` assignment could be removed,
  forcing time-travelers to keep their excruciatingly long lump maturation times.

Then the function computes `age`,
based on the new value of `Game.lumpT`.
For the sake of the analysis,
call this value `originalLumpT`,
and call `firstDateNow` the output of `Date.now()` during the poisoned age calculation.
The line from the previous assignment ensures `Game.lumpT <= Date.now()`,
so the `Math.max` in the computation always returns the first operand.
Hence,
`age` is always `firstDateNow - originalLumpT`.

If at least one lump has been autoharvested since the game was closed,
`amount` will be at least 1 and we enter the `if` and call `Game.harvestLumps(1)`.
Besides harvesting lumps and granting achievements,
this function also sets `Game.lumpT = Date.now()`.
Note that,
as a side-effect,
the game now does not have access to `originalLumpT` anymore.

If more than one lumps have been autoharvested,
we call `Game.harvestLumps` again, but this does not affect the discrepancy.

Then the poisoned assignment to `Game.lumpT` happens.
Call `secondDateNow` the value of `Date.now()` used in the second poisoned assignment.
The formula used for the assignment expands to
```js
    secondDateNow - (firstDateNow - originalLumpT - amount*Game.lumpOverripeAge).
```
If we call `discrepancy = secondDateNow - firstDateNow`,
this code is equivalent to
```js
    Game.lumpT = originalLumpT + amount*Game.lumpOverripeAge + discrepancy;
```

Consequences for lump types
---------------------------

This insignificant increase in lump growth timestamp
has a significant consequence for `Game.computeLumpType()`,
which is executed immediately after the poisoned assignment.

The lump type computation uses a RNG seed based on `Game.seed` and `Game.lumpT`.
The discrepancy is the difference between two `Date.now()` calls,
so by loading the same save over and over again
we get different values of discrepancy,
thus getting different seeds for `Game.computeLumpType()`.
On the other hand,
if the theoretical new value of `Game.lumpT`
is calculated by [a lump planner](https://github.com/staticvariablejames/ChooseYourOwnLump),
having a discrepancy value different from the discrepancy used in calculation
will make the player miss out on the chosen lump
(as lump types computed with different discrepancy values are essentially random).

Note that **the discrepancy bug has no visible effect for players who are not savescumming**,
as the other seeds for `Game.computeLumpType()` would not be visible in this case.


Forcing the Discrepancy
=======================

In order to force the discrepancy to be the value `forceDiscrepancy`,
the value returned by `Date.now()` in the second poisoned line
must be exactly `forceDiscrepancy` milliseconds more
than the value returned by `Date.now()` in the first poisoned line.

Cookie Connoisseur already overwrites `Date.now()` in order to implement date mocking,
and this overwrite happens even before Cookie Clicker is loaded.
We thus modify our reimplementation of `Date.now()` to also force the discrepancy.

We essentially have to detect when that line is being executed.
[`Function.prototype.caller` is deprecated](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller)
and [`Error.prototype.stack` is not standardized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack),
so we resort to simply counting how many times `Date.now()` has been invoked
and trigger the code to force discrepancy at the right moment.

Calls to `Date.now()` when loading from localStorage
----------------------------------------------------

**Before running `Game.LoadSave()`**,
Cookie Clicker calls `Date.now()` or `new Date()` 13 times
in the following order:

- 1 time before the `Game.Launch()` function,
    to initialize the global `Timer.t`.

- 2 times in the beginning of `Game.Launch()`, to calculate `Game.baseSeason`.
  - These two are actually calls to `new Date()`,
    but Cookie Connoiseur's `Date` override simply calls `Date.now()` in this case.

- 6 times in `Game.Init()`,
  to populate `Game.lastActivity`, `Game.time`, `Game.lumpT`,
  `Game.startDate`, `Game.fullDate`, `Game.lastDate`,
  - `Game.lumpT` is indeed initialized here, but this initialization is completely inert.
    If the player has a save file, it will be overwritten during load.
    If the player does not have a save file,
    then `Game.lumpsTotal` will be `-1`,
    so `Game.doLumps()` will overwrite `Game.lumpT` with `Date.now()` again.
    Whence this value never has any visible effect in the game.

- 3 times in `Game.Init()` when calling `getJson`.
  The first time queries `'cookieclickerinfo.json'`,
  the second time is inside `Game.UpdateHeralds()` querying `'cookieclickersteam.json'`,
  and the third is inside `Game.FetchGrandmanames()` querying `grandmas.json`.
  - The function `getJson(url, callback, error)` will ping the given URL,
    and calls `callback` once it gets the result back.
    It appends the URL with `'nocache='+Math.floor(Date.now()/1000/60/30)` before issuing the request,
    which is where the `Date.now()` call comes from.
  - All these queries are intercepted by Cookie Connoisseur
    (see <./openCookieClickerPage.md>),
    but JavaScript is single-threaded so the response can never trigger more `Date.now()` calls.

- 1 time in `Game.Init()` to compute the local variable `years`,
  which is then used to calculate the power of the Birthday cookie upgrade.

**Inside `Game.LoadSave` but before `Game.loadLumps`**
the game calls `Date.now()` a few more times:

- One time per tiered building achievement awarded.
  - Awarding an achievement via `Game.Win` triggers a notification via `Game.Notify`,
    which creates a note whose creation date is populated with a single `Date.now()` call.
  - On load, the game awards tiered building achievements
    (awarded for reaching thresholds of amount of each building owned).
    Each achievement won triggers one call to `Game.Notify`.
  - Typically these achievements should only be awarded on `Game.LoadSave`
    if the player has updated their game,
    or from manufactured saves (like the ones produced by Cookie Connoisseur).

- 1 time to calculate `framesElapsed`,
  used to update `Game.pledgeT`, `Game.seasonT`, and `Game.researchT`.

- How many times are needed inside `Game.loadModData()`.
  - But never on loading from localStorage,
    which happens before `Game.LoadMod` has had the chance to run.

- One time per raw-cookies-per-second achievement awarded
  (inside `Game.CalculateGains()`).

- 1 time inside `Game.CalculateGains()`,
  to compute the effect of Century egg
  (if the player owns this upgrade).

- 1 time to populate the local variable `timeOffline`,
  to compute offline idling.

Without achievements or Century egg,
this is fixed at 2 `Date.now()` calls.

At this point,
the game calls `Game.loadLumps(timeOffline)`,
but the argument is ignored inside the function.
**Inside `Game.loadLumps`**,
the sequence of calls is as follows.

- 1 time for the first assignment outlined above.

- 1 time for computing the variable `age`. This is the "poisoned age calculation" outlined above.
  With no achievements or Century egg,
  this is the 17th call.

- 1 time inside `Game.harvestLumps` for the second assignment outlined above.

- If the autoharvested lump was a golden one,
  1 time inside `Game.harvestLumps` to notify the player about the sugar blessing.

- If the autoharvested lump was a caramelized one,
  1 time inside `Game.harvestLumps` to notify the player about sugar lumps cooldowns being cleared.

- Once per lump-related achievement (lump amount and lump types).

- 1 time inside `Game.harvestLumps` for the third assignment outlined above.

- Once per lump-related achievement (only lump amounts this time).

- 1 time inside `Game.loadLumps` to notify the number of lumps harvested.

- 1 time for the "poisoned assignment" outlined above.
  Without achievements, Century egg, or special lumps, and only one lump harvested,
  this is the 20th call;
  if the autoharvested lump was either golden or caramelized,
  and more than one lump was harvested,
  this is the 22nd call.

**After `Game.loadLumps`** returns,
the game still triggers `Date.now()` up to three more times:
- Winning the "All the stars in heaven" achievement, if applicable;
- Announcing the current season, if applicable;
- Notifying the player that the save has loaded.
These have no effect on the discrepancy bug.

Forcing the discrepancy when loading from a save file
-----------------------------------------------------

"Loading from a save file" means running `Game.LoadSave(save)` after the game has loaded.
In this case,
if the given save file would not earn any achievements upon load,
and also does not own Century egg,
then we know there are exactly three `Date.now()` calls before reaching the first poisoned line,
then the `Date.now()` call from the poisoned line,
then between two and four calls between the poisoned lines,
and finally the `Date.now()` call from the second poisoned line.

Cookie Connoisseur's solution is to simply count the number of calls to `Date.now()`
and return appropriately rigged timestamps.
The function `setupDiscrepancy` is meant to be called like this:
```javascript
    await page.evaluate(save => {
        CConnoisseur.setupDiscrepancy(3);
        Game.LoadSave(save); // The discrepancy should be exactly 3
    }, save);
```
When running the first line,
Cookie Connoisseur stores the current value of `Date.now()`;
call this `baseTimestamp`.
In the next four calls to `Date.now()`
Cookie Connoisseur simply returns `baseTimestamp`.
(This is exactly enough for the first poisoned line to use the value `baseTimestamp`.)
Then,
for the next five calls,
Cookie Connoisseur returns `baseTimestamp + 3`.
This ensures that,
regardless of the type and how many lumps were autoharvested,
the second poisoned line uses the value `baseTimestamp + 3`.
As analyzed above,
this forces the discrepancy to be exactly 3.

Predictably-spaced calls to `Date.now()`
----------------------------------------

```typescrypt
    CConnoisseur.forceDateNowSpacing: (delays: number[]) => number
```

This is a more general time manipulation function.
When this function is called, the current value of `Date.now()`
is stored as the base timestamp,
and the subsequent calls to `Date.now()` returns that timestamp plus the nth number in `nthDelay`.

`CConnoisseur.setupDiscrepancy` actually just calls `CConnoisseur.forceDateNowSpacing`
with an appropriate array.
The main motivation for also exposing `forceDateNowSpacing`
is that mods may want to try to patch the discrepancy themselves,
so by running code like
```javascript
    await page.evaluate(save => {
        MyMod.patchDiscrepancyBug();
        CConnoisseur.forceDateNowSpacing([0, 0, 1, 5, 233]);
        Game.LoadSave(save);
    }, save);
```
we are effectively testing whether the implementation's patch worked,
without having to assume that the "poisoned lines" from vanilla Cookie Clicker are the same.

This function does one more thing:
it ensures that `Date.now()` keeps behaving monotonically after we "run out" of delays.
More specifically,
the function stores in  `highestForcedSpacingTimestamp`
the value of `baseTimestamp + delays[delays.length-1]`.
After we run out of delays,
`Date.now()` returns its "normal" value,
unless it would be smaller than `highestForcedSpacingTimestamp`,
in which case it returns that instead.

Forcing the discrepancy when loading from localStorage
------------------------------------------------------

"Loading from localStorage" means the save game loading performed by the game during initialization,
when the save used in `Game.LoadSave(save)` comes from `window.localStorage`.
In this case the instruction to force discrepancy comes directly from `openCookieClickerPage`,
in the `CCPageOptions.forceDiscrepancy` attribute.

This happens before the game has finished loading,
so we cannot execute commands in the page beforehand.
However Cookie Connoisseur's `Date.now()` mocking
gets installed in the page even before the game starts loading.
We know that the game calls `Date.now()` 13 times before calling `Game.LoadSave`,
so again we simply count invocations,
and in the 13th invocation of `Date.now()` we call `setupDiscrepancy` ourselves.
