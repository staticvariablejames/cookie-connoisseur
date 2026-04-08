Lump Timestamp Computation Discrepancy
======================================

This is a technical document analyzing the code surrounding the discrepancy bug.

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
