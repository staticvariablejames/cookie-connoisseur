import { test, expect } from '@playwright/test';
import {
    CCBuff,
    CCBuffBuildingSpecial,
    CCBuffDragonflight,
    CCBuffSugarBlessing,
    CCGardenMinigame,
    CCGrimoireMinigame,
    CCMarketMinigame,
    CCPantheonMinigame,
    CCSave
} from '../src/ccsave';
import { openCookieClickerPage } from '../src/cookie-clicker-page';

const saveAsString =
   'Mi4wMzF8fDE2MDY1Mjg0MzYyNjI7MTU5MTQ2NTM1NTUyMDsxNjA2NjE3ODUyNTQwO1N0YXRpYzt1'+
   'anhucXwxMTExMTExMTAwMTExMTEwMDEwMTB8Mi44NjY5MzY0Mzk1Nzg2MzA0ZSs2NDsyLjg2Njkz'+
   'NjUyOTU4MDY1MjRlKzY0Ozk2ODsyNzkxODsyLjg2NjkzNjQyMjAyMTY4NTVlKzY0OzI3MTIwOzQ7'+
   'MjsyLjA3MDA4NDUyMzk0NDA5NjJlKzY1OzA7MTQ7MTAzNjkzOzA7LTE7MTAwNzsxMDE7NS4wNDU0'+
   'MjQ5NzIxNDQ2NzNlKzUzOzI0OzE0OzMwOzI1ODc3MTg7NDt2YWxlbnRpbmVzOzA7MDs1OTE1NTYy'+
   'MjEzODc3NzA0MDA7NTkxNTU0MDM0NTM3NTgyNjAwOzIxODY4NTAxODgwOTI7MDswOzY5NTs3MTQ7'+
   'NjEzOzY0MTs3MTY7MjU7MTU7MTA7MTs1NDswOzA7MTM1OzEyODM7MTYwNjU1NjAzNDE1MzswOzI7'+
   'MjI3OzQxOzE7MTs4LjcwNDc5OTY3NDcwNTI5M2UrNTA7fDczMSwyOTMyLDQuNTQzMTQwNjI2NTE1'+
   'NDkxZSs1NCwyMCwsMCw3ODI7ODIxLDE0MTUsMy44NjgxMTY5NzUxNDkxOTdlKzU0LDEwLCwxLDgy'+
   'MTswLDEwOTIsNy4zNDEzNTMzNzgzMTI1NTg2ZSs1MCwxMCwxNjA2NTc5MzIxNjA3OjI6MTYwNjUz'+
   'ODE1OTU5ODoxOjE6MzQ5MDoxOjE6MTYwNjUyODQzNjI2OTogMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMSAwOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDo2Ojg3OjA6'+
   'MDo2Ojk4OjA6MDowOjA6MDowOjA6MDo2Ojk2OjY6OTg6MDowOjA6MDowOjA6MDowOjA6MDo2Ojk4'+
   'OjA6MDowOjA6MDowOjY6OTg6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDosMSw3NDI7'+
   'MCwxMDcxLDYuNzU1MDY3NDIyMDk0Mjg4ZSs1MiwxMCwsMSw3MjE7MCwxMDU4LDEuMTgyMDk0OTYy'+
   'NzQ2MDg2M2UrNTIsMTAsLDEsNzA4OzAsMTA0OSwyLjQ4MzYxMjUwMjYwMzg1MTVlKzUxLDEwLDU6'+
   'MDoxOjA6MDogNTAxOjI6LTI5OjI1NjowOjA6MCE2OTU6NDotMTA2Ojc1MDowOjA6MCE0MjA5OjA6'+
   'LTEwOjU2MzowOjA6MCEyNDcyOjQ6LTE0MjoxMTY6MDowOjAhNDQyOjQ6LTk1OjEzMDowOjA6MCE0'+
   'ODgxOjI6LTUxOjI3MDowOjA6MCExMDUzOjQ6LTE0Mzo0NDI6MDowOjAhNjIxMToyOi02Mjo2NjI6'+
   'MDowOjAhNDgzOjQ6LTEzOToxODc6MDowOjAhMTI1Nzk6MTozOToxODg6MDowOjAhMTAwMzQ6NTox'+
   'Njo1MDU6MDowOjAhMzMyOTo0Oi0yMzg6Mzc1OjA6MDowITE0NDA4OjE6MTo2NjE6MDowOjAhMTI4'+
   'Mzk6MjotNTM6NjUxOjA6MDowITE2MzU4OjE6Nzo0ODk6MDowOjAhMTQ4MjM6NTotMjI6NDk1OjA6'+
   'MDowISAxLDAsNjk5OzAsMTAyMywxLjAwOTY4ODAyMjY4Mjk0OThlKzUyLDEwLDIvOC82IDMgMTYw'+
   'NjU3OTYyMTg0MSAwLDEsNjczOzEsMTcxNSwyLjE4Nzk2NTEzMTU4NzAxNWUrNTEsMTAsMS4zNTkz'+
   'MDA2NTc0NDk4MjU2IDkgMjg3NyAxLDAsNzExOzAsOTgwLDguOTkxODUwMTkyMzU5MjQ3ZSs1MCwx'+
   'MCwsMSw2MzA7NjAwLDk1MCw0Ljg4MDA1MjE4MjgzMzU1MDZlKzUxLDEwLCwxLDYwMDs1OTMsOTQz'+
   'LDguODQxNjUyMTkxMTQ4OTU2ZSs1MywxMCwsMSw1OTM7NTcyLDkyMiwxLjc3MDExODQ5ODMxNDYz'+
   'MTNlKzUzLDEwLCwxLDU3Mjs1NTUsOTA1LDEuODAxNzIzMjE3NTA3NzEzNWUrNTQsMTAsLDEsNTU1'+
   'OzYwMiw5NTIsMS4wNDYxMDY5NzI2NjE4ODQ1ZSs1NSwxMCwsMSw2MDI7NjAwLDIwMzgsMy42MzQ1'+
   'ODYxODE0MDU5MzM0ZSs1NSwxMCwsMSw2MDA7NjAwLDIwNTIsMi43OTM4MjE0NTg4MjQwMzllKzU2'+
   'LDEwLCwxLDYwMDs1ODMsMTk2Miw3LjM3NjYyOTIyMTU4NDAxNGUrNTUsMTAsLDEsNTgzOzU0NSwy'+
   'NDI4LDQuNjM2MzUzNTMxMTE4MDkxNWUrNTYsMTAsLDEsNTUwO3wxMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMDAxMDExMTExMTExMTExMTAwMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTAwMTExMTExMTExMTExMTExMTExMDAwMDAwMDAwMDAwMDAxMTAwMTExMTExMDAwMDExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTAxMDExMTAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAw'+
   'MTAxMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAwMDAwMTAxMTAwMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTEwMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTEwMDAwMTExMTExMDAxMTExMTEwMDAwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDEwMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEw'+
   'MTAxMDEwMTExMTExMTF8MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTExMTExMDAw'+
   'MDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEx'+
   'MTExMTExMTExMTAxMTExMTExMTExMTEwMTExMTExMTEwMTExMTExMXwwLDM2NDgzLDIzNjgwLDc7'+
   'MTEsMjU5MjAwMCwyNTYxNTI0LDE7Myw2Mzc0LDExMTgsMTU7MjAsMjE2MDAwLDIxMDk1MywxLjU7'+
   'MjQsNTE4NDAwMCw1MTc4OTY4LDEuMjsxOSwxMDgwMDAsMTAzMDExLDM7MjIsMTIwNiw3MDAsMjs3'+
   'LDY5MCwyMTUsMTExMTs2LDkwMCw0NDIsNzc3OzksMjA3MCwxNjQ0LDYwLjMsMTA7fG1vZDE6c29t'+
   'ZSBub24tSlNPTi5wYXJzZS1hYmxlIGRhdGE7bW9kMjp7InRoaXNJc1BhcnNlYWJsZSI6dHJ1ZX07'+
   'bW9kMzp7ImEgdHJpY2t5IGVudHJ5IjoiW1BdIiwiYW5vdGhlciBvbmUiOiJbU10ifTs%3D%21END'+
   '%21';

const saveAsObject: CCSave = {
    version: 2.031,
    startDate: 1606528436262,
    fullDate: 1591465355520,
    lastDate: 1606617852540,
    bakeryName: 'Static',
    seed: 'ujxnq',

    prefs: {
        particles: true,
        numbers: true,
        autosave: true,
        autoupdate: true,
        milk: true,
        fancy: true,
        warn: true,
        cursors: true,
        focus: false,
        format: false,
        notifs: true,
        wobbly: true,
        monospace: true,
        filters: true,
        cookiesound: true,
        crates: false,
        showBackupWarning: false,
        extraButtons: true,
        askLumps: false,
        customGrandmas: true,
        timeout: false,
    },

    cookies: 2.8669364395786304e+64,
    cookiesEarned: 2.8669365295806524e+64,
    cookieClicks: 968,
    goldenClicks: 27918,
    handmadeCookies: 2.8669364220216855e+64,
    missedGoldenClicks: 27120,
    bgType: 4,
    milkType: 2,
    cookiesReset: 2.0700845239440962e+65,
    elderWrath: 0,
    pledges: 14,
    pledgeT: 103693,
    nextResearch: 0,
    researchT: -1,
    resets: 1007,
    goldenClicksLocal: 101,
    cookiesSucked: 5.045424972144673e+53,
    wrinklersPopped: 24,
    santaLevel: 14,
    reindeerClicked: 30,
    seasonT: 2587718,
    seasonUses: 4,
    season: 'valentines',
    wrinklers: {
        amount: 0,
        number: 0,
        shinies: 0,
        amountShinies: 0,
    },
    prestige: 591556221387770400,
    heavenlyChips: 591554034537582600,
    heavenlyChipsSpent: 2186850188092,
    ascensionMode: 0,
    permanentUpgrades: [
        "Universal idling",
        "A box",
        "Kitten executives",
        "Fortune #103",
        "Break the fifth wall",
    ],
    dragonLevel: 25,
    dragonAura: 15,
    dragonAura2: 10,
    chimeType: 1,
    volume: 54,
    lumps: 135,
    lumpsTotal: 1283,
    lumpT: 1606556034153,
    lumpRefill: 0,
    lumpCurrentType: 'golden',
    vault: [
        "Chocolate egg",
    ],
    heralds: 41,
    fortuneGC: true,
    fortuneCPS: true,
    cookiesPsRawHighest: 8.704799674705293e+50,

    buildings: {
        'Cursor':               {amount: 731, bought: 2932, totalCookies:  4.543140626515491e+54, level: 20, muted: false, highest: 782},
        'Grandma':              {amount: 821, bought: 1415, totalCookies:  3.868116975149197e+54, level: 10, muted:  true, highest: 821},
        'Farm':                 {amount:   0, bought: 1092, totalCookies: 7.3413533783125586e+50, level: 10, muted:  true, highest: 742,
            minigame: {
                nextStep: 1606579321607,
                soil: 'clay',
                nextSoil: 1606538159598,
                freeze: true,
                harvests: 1,
                harvestsTotal: 3490,
                onMinigame: true,
                convertTimes: 1,
                nextFreeze: 1606528436269,
                unlockedPlants: [
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
                ],

                plot: [
                    [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0],         ['empty', 0],         ['empty', 0]],
                    [['empty', 0], ['empty', 0], ['empty', 0], ['goldenClover', 87], ['empty', 0],         ['goldenClover', 98]],
                    [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0],         ['goldenClover', 96], ['goldenClover', 98]],
                    [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0],         ['empty', 0],         ['goldenClover', 98]],
                    [['empty', 0], ['empty', 0], ['empty', 0], ['goldenClover', 98], ['empty', 0],         ['empty', 0]],
                    [['empty', 0], ['empty', 0], ['empty', 0], ['empty', 0],         ['empty', 0],         ['empty', 0]],
                ] as [string, number][][],
            },
        },
        'Mine':                 {amount:   0, bought: 1071, totalCookies:  6.755067422094288e+52, level: 10, muted:  true, highest: 721},
        'Factory':              {amount:   0, bought: 1058, totalCookies: 1.1820949627460863e+52, level: 10, muted:  true, highest: 708},
        'Bank':                 {amount:   0, bought: 1049, totalCookies: 2.4836125026038515e+51, level: 10, muted: false, highest: 699,
            minigame: {
                officeLevel: 5,
                brokers: 0,
                graphLines: true,
                profit: 0,
                graphCols: false,
                onMinigame: true,
                goods: {
                    'CRL': {val:   5.01, mode: 'slow fall', d: -0.29, dur: 256, stock: 0, hidden: false, last: 0},
                    'CHC': {val:   6.95, mode: 'fast fall', d: -1.06, dur: 750, stock: 0, hidden: false, last: 0},
                    'BTR': {val:  42.09, mode:    'stable', d: -0.1,  dur: 563, stock: 0, hidden: false, last: 0},
                    'SUG': {val:  24.72, mode: 'fast fall', d: -1.42, dur: 116, stock: 0, hidden: false, last: 0},
                    'NUT': {val:   4.42, mode: 'fast fall', d: -0.95, dur: 130, stock: 0, hidden: false, last: 0},
                    'SLT': {val:  48.81, mode: 'slow fall', d: -0.51, dur: 270, stock: 0, hidden: false, last: 0},
                    'VNL': {val:  10.53, mode: 'fast fall', d: -1.43, dur: 442, stock: 0, hidden: false, last: 0},
                    'EGG': {val:  62.11, mode: 'slow fall', d: -0.62, dur: 662, stock: 0, hidden: false, last: 0},
                    'CNM': {val:   4.83, mode: 'fast fall', d: -1.39, dur: 187, stock: 0, hidden: false, last: 0},
                    'CRM': {val: 125.79, mode: 'slow rise', d:  0.39, dur: 188, stock: 0, hidden: false, last: 0},
                    'JAM': {val: 100.34, mode:   'chaotic', d:  0.16, dur: 505, stock: 0, hidden: false, last: 0},
                    'WCH': {val:  33.29, mode: 'fast fall', d: -2.38, dur: 375, stock: 0, hidden: false, last: 0},
                    'HNY': {val: 144.08, mode: 'slow rise', d:  0.01, dur: 661, stock: 0, hidden: false, last: 0},
                    'CKI': {val: 128.39, mode: 'slow fall', d: -0.53, dur: 651, stock: 0, hidden: false, last: 0},
                    'RCP': {val: 163.58, mode: 'slow rise', d:  0.07, dur: 489, stock: 0, hidden: false, last: 0},
                    'SBD': {val: 148.23, mode:   'chaotic', d: -0.22, dur: 495, stock: 0, hidden: false, last: 0},
                },
            },
        },

        'Temple':               {amount:   0, bought: 1023, totalCookies: 1.0096880226829498e+52, level: 10, muted:  true, highest: 673,
            minigame: {diamondSlot: 'ruin', rubySlot: 'mother', jadeSlot: 'labor', swaps: 3, swapT: 1606579621841, onMinigame: false}},
        'Wizard tower':         {amount:   1, bought: 1715, totalCookies:  2.187965131587015e+51, level: 10, muted: false, highest: 711,
            minigame: {magic: 1.3593006574498256, spellsCast: 9, spellsCastTotal: 2877, onMinigame: true}},
        'Shipment':             {amount:   0, bought:  980, totalCookies:  8.991850192359247e+50, level: 10, muted:  true, highest: 630},
        'Alchemy lab':          {amount: 600, bought:  950, totalCookies: 4.8800521828335506e+51, level: 10, muted:  true, highest: 600},
        'Portal':               {amount: 593, bought:  943, totalCookies:  8.841652191148956e+53, level: 10, muted:  true, highest: 593},
        'Time machine':         {amount: 572, bought:  922, totalCookies: 1.7701184983146313e+53, level: 10, muted:  true, highest: 572},
        'Antimatter condenser': {amount: 555, bought:  905, totalCookies: 1.8017232175077135e+54, level: 10, muted:  true, highest: 555},
        'Prism':                {amount: 602, bought:  952, totalCookies: 1.0461069726618845e+55, level: 10, muted:  true, highest: 602},
        'Chancemaker':          {amount: 600, bought: 2038, totalCookies: 3.6345861814059334e+55, level: 10, muted:  true, highest: 600},
        'Fractal engine':       {amount: 600, bought: 2052, totalCookies:  2.793821458824039e+56, level: 10, muted:  true, highest: 600},
        'Javascript console':   {amount: 583, bought: 1962, totalCookies:  7.376629221584014e+55, level: 10, muted:  true, highest: 583},
        'Idleverse':            {amount: 545, bought: 2428, totalCookies: 4.6363535311180915e+56, level: 10, muted:  true, highest: 550},
    },

    ownedUpgrades: [
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
        "Eclipse cookies",
        "Zebra cookies",
        "Quintillion fingers",
        "Revoke Elder Covenant",
        "Get lucky",
        "Sacrificial rolling pins",
        "Snickerdoodles",
        "Stroopwafels",
        "Macaroons",
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
        "Fig gluttons",
        "Loreols",
        "Jaffa cakes",
        "Grease's cups",
        "Heavenly chip secret",
        "Heavenly cookie stand",
        "Heavenly bakery",
        "Heavenly confectionery",
        "Heavenly key",
        "Persistent memory",
        "Christmas tree biscuits",
        "Snowflake biscuits",
        "Snowman biscuits",
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
        "Lovesick biscuit",
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
        "Century egg",
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
        "Golden switch [on]",
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
        "Fortune #103",
        "Fortune #104",
        "Fortune cookies",
        "Prism heart biscuits",
        "Kitten wages",
        "Pet the dragon",
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
        "Earl Grey macarons",
        "Pokey",
        "Cashew cookies",
        "Milk chocolate cookies",
    ],

    unlockedUpgrades: [
        "Elder Covenant",
        "Festive biscuit",
        "Ghostly biscuit",
        "Fool's biscuit",
        "Bunny biscuit",
        "Chocolate egg",
        "Golden switch [off]",
        "Milk selector",
        "Golden cookie sound selector",
        "Background selector",
        "Shimmering veil [off]",
        "Welsh cookies",
        "Raspberry cheesecake cookies",
        "Bokkenpootjes",
        "Fat rascals",
        "Ischler cookies",
        "Matcha cookies",
    ],

    achievements: [
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
        "Fringe",
        "Coherence",
        "Earth-616",
        "Strange topologies",
        "Grand design",
        "Ecumenopolis",
        "The full picture",
        "When there's nothing left to add",
        "Keep going until I say stop",
        "But I didn't say stop, did I?",
        "With unrivaled fervor",
        "Think big",
        "Hypersize me",
        "Max capacity",
        "Liquid assets",
    ],

    buffs: <CCBuff[]>[
        {name: 'frenzy',         maxTime: 36483,   time: 23680, multCpS: 7},
        {name: 'sugar blessing', maxTime: 2592000, time: 2561524},
        {name: 'dragon harvest', maxTime: 6374,    time: 1118, multCpS: 15},
        {name: 'loan 1',         maxTime: 216000,  time: 210953, multCpS: 1.5},
        {name: 'loan 3',         maxTime: 5184000, time: 5178968, multCpS: 1.2},
        {name: 'sugar frenzy',   maxTime: 108000,  time: 103011, multCpS: 3},
        {name: 'loan 2',         maxTime: 1206,    time: 700, multCpS: 2},
        {name: 'dragonflight',   maxTime: 690,     time: 215, multClick: 1111},
        {name: 'click frenzy',   maxTime: 900,     time: 442, multClick: 777},
        {name: 'building buff',  maxTime: 2070,    time: 1644, multCpS: 60.3, building: 10},
    ],

    modSaveData: {
        mod1: "some non-JSON.parse-able data",
        mod2: {
            thisIsParseable: true,
        },
        mod3: {
            'a tricky entry': '|',
            'another one': ';',
        },
    },
};

test('The save game is properly parsed', async() => {
    expect(CCSave.fromStringSave(saveAsString)).toEqual(saveAsObject);
});

test('Written saves can be recovered', async() => {
    let str = CCSave.toStringSave(saveAsObject);
    expect(CCSave.fromStringSave(str)).toEqual(saveAsObject);
});

test('The JSON save is properly converted to a Cookie Clicker save', () => {
    expect(CCSave.toStringSave(saveAsObject)).toEqual(saveAsString);
});

test.describe('CCSave.toStringSave edge cases:', () => {
    test('Sugar blessing includes the trailing ,1', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate( () => Game.gainBuff('sugar blessing',24*60*60,1) );
        let strSave = await page.evaluate( () => Game.WriteSave(1) );
        let jsonSave = CCSave.fromStringSave(strSave);
        expect(jsonSave.buffs[0].name).toBe('sugar blessing');
        // strSave includes the trailing ",1" so we can just test for equality:
        expect(CCSave.toStringSave(jsonSave)).toEqual(strSave);
    });

    test('Empty pantheon slots parse from -1 and back', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate( () => Game.Earn(1e9) ); // Unlock lumps
        await page.evaluate( () => {Game.lumps = 1;} ); // Get one lump
        await page.evaluate( () => Game.Objects['Temple'].getFree(1) ); // Get a temple
        await page.evaluate( () => Game.Objects['Temple'].levelUp() ); // Unlock Pantheon
        // We must wait for the minigame to load before Game.WriteSave.
        await page.waitForFunction( () => Game.isMinigameReady(Game.Objects['Temple']) );

        let strSave = await page.evaluate( () => Game.WriteSave(1) );
        let jsonSave = CCSave.fromStringSave(strSave);
        expect(jsonSave.buildings['Temple'].minigame.diamondSlot).toBe('');
        expect(jsonSave.buildings['Temple'].minigame.rubySlot).toBe('');
        expect(jsonSave.buildings['Temple'].minigame.jadeSlot).toBe('');
        // strSave saves the pantheon as -1/-1/-1 so we can just test for equality:
        expect(CCSave.toStringSave(jsonSave)).toEqual(strSave);
    });

    test('Saves started a long while ago are preserved', async ({ browser }) => {
        let jsonSave = new CCSave();
        jsonSave.fullDate = NaN;
        let page = await openCookieClickerPage(browser, {saveGame: CCSave.toStringSave(jsonSave)});
        let fullDate = await page.evaluate( () => Game.fullDate );
        expect(fullDate).toBe(NaN);
        let strSave = await page.evaluate( () => Game.WriteSave(1) );
        jsonSave = CCSave.fromStringSave(strSave);
        expect(jsonSave.fullDate).toBe(NaN);
        expect(CCSave.toStringSave(jsonSave)).toEqual(strSave);
    });

    test('Vault is sorted', async ({ browser }) => {
        let page = await openCookieClickerPage(browser);
        await page.evaluate( () => Game.Upgrades['Carpal tunnel prevention cream'].vault() );
        await page.evaluate( () => Game.Upgrades['Reinforced index finger'].vault() );
        let strSave = await page.evaluate( () => Game.WriteSave(1) );
        let jsonSave = CCSave.fromStringSave(strSave);
        expect(jsonSave.vault).toEqual([
            'Reinforced index finger',
            'Carpal tunnel prevention cream',
        ]);
    });

    test('Default-initialized CCSave contains minigame data', () => {
        let save = new CCSave();
        expect(save.buildings['Farm'].minigame).not.toBeNull();
        expect(save.buildings['Bank'].minigame).not.toBeNull();
        expect(save.buildings['Temple'].minigame).not.toBeNull();
        expect(save.buildings['Wizard tower'].minigame).not.toBeNull();
    });

    test('Minigame data is not included for level 0 buildings', () => {
        let withMinigames = new CCSave();
        let withoutMinigames = new CCSave();
        withoutMinigames.buildings['Farm'].minigame = null;
        withoutMinigames.buildings['Bank'].minigame = null;
        withoutMinigames.buildings['Temple'].minigame = null;
        withoutMinigames.buildings['Wizard tower'].minigame = null;
        expect(CCSave.toStringSave(withMinigames)).toEqual(CCSave.toStringSave(withoutMinigames));
    });

    test('Absent minigame data is parsed back to null', () => {
        let save = CCSave.fromStringSave(CCSave.toStringSave(new CCSave()));
        let withoutMinigames = new CCSave();
        expect(save.buildings['Farm'].minigame).toBeNull();
        expect(save.buildings['Bank'].minigame).toBeNull();
        expect(save.buildings['Temple'].minigame).toBeNull();
        expect(save.buildings['Wizard tower'].minigame).toBeNull();
    });
});

test.describe('CCSave.fromObject', () => {
    test('Can parse entire save objects', () => {
        // This is an "integration test" of sorts
        expect(CCSave.fromObject(saveAsObject)).toEqual(saveAsObject);
    });

    test('throws if argument is not object', () => {
        expect( () => {
            CCSave.fromObject('wrong')
        }).toThrow('not an object');
    });

    test('uses callback if provided', () => {
        let localStr = '';
        let callback = (str: string) => {localStr = str};
        expect( () => {
            CCSave.fromObject('wrong', callback)
        }).not.toThrow();
        expect(localStr).toContain('not an object');
    });

    test.describe('returns default-initialized object', () => {
        test('on empty input', () => {
            expect(CCSave.fromObject({})).toEqual(new CCSave());
        });

        test('on null input', () => {
            expect(CCSave.fromObject(null)).toEqual(new CCSave());
        });
    });

    test('handles simple attributes', () => {
        let manualSave = new CCSave();
        manualSave.heralds = 72;
        manualSave.season = 'christmas';
        let jsonSave = CCSave.fromObject({heralds: 72, season: 'christmas'});
        expect(jsonSave).toEqual(manualSave);
    });

    test.describe('handles .prefs', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.prefs.milk = false;
            let jsonSave = CCSave.fromObject({prefs: {milk: false}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({prefs: 'green'})
            }).toThrow('source.prefs is not an object');
            expect(() => {
                CCSave.fromObject({prefs: {milk: 'high'}})
            }).toThrow('source.prefs.milk is not a boolean');
            expect(() => {
                CCSave.fromObject({prefs: {nonExistent: true}})
            }).toThrow('target.prefs.nonExistent does not exist');
        });
    });

    test.describe('handles .permanentUpgrades', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.permanentUpgrades[0] = 'Kitten helpers';
            manualSave.permanentUpgrades[1] = '';
            manualSave.permanentUpgrades[2] = '';
            manualSave.permanentUpgrades[3] = 'Cheap hoes';
            let jsonSave = CCSave.fromObject({permanentUpgrades: ['Kitten helpers', -1, '', 10]});
            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({permanentUpgrades: 'all of them'});
            }).toThrow('source.permanentUpgrades is not an array');
            expect(() => {
                CCSave.fromObject({permanentUpgrades: ['', '', '', '', '', '']});
            }).toThrow('source.permanentUpgrades has more than 5 entries');
            expect(() => {
                CCSave.fromObject({permanentUpgrades: ['invalid upgrade']});
            }).toThrow('source.permanentUpgrades[0] is not an upgrade');
            expect(() => {
                CCSave.fromObject({permanentUpgrades: ['', -5]});
            }).toThrow('source.permanentUpgrades[1] is not an upgrade id');
            expect(() => {
                CCSave.fromObject({permanentUpgrades: ['', '', 3.14]});
            }).toThrow('source.permanentUpgrades[2] is not an upgrade id');
            expect(() => {
                CCSave.fromObject({permanentUpgrades: ['', '', '', 31415926535]});
            }).toThrow('source.permanentUpgrades[3] is not an upgrade id');
            expect(() => {
                CCSave.fromObject({permanentUpgrades: ['', '', '', '', true]});
            }).toThrow('source.permanentUpgrades[4] is not a number or a string');
        });
    });

    test.describe('handles .vault', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.vault[0] = 'Cheap hoes';
            manualSave.vault[1] = 'Kitten helpers';
            let jsonSave = CCSave.fromObject({vault: ['Kitten helpers', 10]});
            expect(jsonSave).toEqual(manualSave);
        });

        test('sorting the vault if necessary', () => {
            let manualSave = new CCSave();
            manualSave.vault[0] = 'Cheap hoes';
            manualSave.vault[1] = 'Kitten helpers';
            let jsonSave = CCSave.fromObject({vault: [10, 'Kitten helpers']});
            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({vault: 'all of them'});
            }).toThrow('source.vault is not an array');
            expect(() => {
                CCSave.fromObject({vault: ['invalid upgrade']});
            }).toThrow('source.vault[0] is not an upgrade');
            expect(() => {
                CCSave.fromObject({vault: [10, -5]});
            }).toThrow('source.vault[1] is not an upgrade id');
            expect(() => {
                CCSave.fromObject({vault: [10, 11, 3.14]});
            }).toThrow('source.vault[2] is not an upgrade id');
            expect(() => {
                CCSave.fromObject({vault: [10, 11, 12, 31415926535]});
            }).toThrow('source.vault[3] is not an upgrade id');
            expect(() => {
                CCSave.fromObject({vault: [10, 11, 12, 13, true]});
            }).toThrow('source.vault[4] is not a number or a string');
        });
    });

    test.describe('handles .buildings without minigames', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Cursor"].totalCookies = 1e5;
            let jsonSave = CCSave.fromObject({buildings: {"Cursor": {totalCookies: 1e5}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({buildings: 'all of them'});
            }).toThrow('source.buildings is not an object');
            expect(() => {
                CCSave.fromObject({buildings: null});
            }).toThrow('source.buildings is not an object');
            expect(() => {
                CCSave.fromObject({buildings: {"Cursor": {a: 5}}});
            }).toThrow('target.buildings["Cursor"].a does not exist');
            expect(() => {
                CCSave.fromObject({buildings: {"Barracks": {level: 5}}});
            }).toThrow('target.buildings.Barracks does not exist');
        });
    });

    test.describe('handles the Garden minigame', () => {
        test('setting it to null if level == 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Farm"].level = 0;
            manualSave.buildings["Farm"].minigame = null;
            let jsonSave = CCSave.fromObject({buildings: {"Farm": {level: 0}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('autocreating it if level > 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Farm"].level = 1;
            manualSave.buildings["Farm"].minigame = new CCGardenMinigame();
            let jsonSave = CCSave.fromObject({buildings: {"Farm": {level: 1}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('leaving it alone if null, even if level > 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Farm"].level = 1;
            manualSave.buildings["Farm"].minigame = null;
            let jsonSave = CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: null}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('sorting unlocked seeds', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Farm"].level = 1;
            manualSave.buildings["Farm"].minigame = new CCGardenMinigame();
            manualSave.buildings["Farm"].minigame.unlockedPlants[1] = 'bakeberry';
            let jsonSave = CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                unlockedPlants: ['bakeberry', 'bakerWheat'],
            }}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('always unlocking Barker\'s Wheat', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Farm"].level = 1;
            manualSave.buildings["Farm"].minigame = new CCGardenMinigame();
            manualSave.buildings["Farm"].minigame.unlockedPlants[1] = 'bakeberry';
            let jsonSave = CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                unlockedPlants: ['bakeberry'],
            }}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('extending plots', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Farm"].level = 1;
            manualSave.buildings["Farm"].minigame = new CCGardenMinigame();
            manualSave.buildings["Farm"].minigame.plot[2][2] = ['bakerWheat', 5];
            let jsonSave = CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                plot: [
                    [], [], [[], [], ['bakerWheat', 5]]
                ],
            }}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('complaining nicely about weird unlockedPlants', () => {
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    unlockedPlants: 'bakeberry',
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.unlockedPlants is not an array');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    unlockedPlants: [5],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.unlockedPlants[0] is not a string');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    unlockedPlants: ['bakerWheat', 'unknownPlant'],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.unlockedPlants[1] is not a plant');
        });

        test('complaining nicely about weird plots', () => {
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    plot: 'all',
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.plot is not an array');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    plot: [[], [], [], [], [], [], []],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.plot contains too many elements');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    plot: ['all'],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.plot[0] is not an array');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    plot: [
                        [],
                        [[], [], [], [], [], [], []],
                    ],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.plot[1] contains too many elements');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    plot: [
                        [],
                        [[], [], 'bakerWheat'],
                    ],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.plot[1][2] is not an array');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    plot: [
                        [], [],
                        [[], [], ['bakerWheat', 5, 'mature']],
                    ],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.plot[2][2] contains too many elements');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    plot: [
                        [[0, 5]],
                    ],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.plot[0][0][0] is not a string');
            expect(() => {
                CCSave.fromObject({buildings: {"Farm": {level: 1, minigame: {
                    plot: [
                        [['bakersWheat', 'mature']],
                    ],
                }}}});
            }).toThrow('source.buildings["Farm"].minigame.plot[0][0][1] is not a number');
        });
    });

    test.describe('handles the Stock Market minigame', () => {
        test('setting it to null if level == 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Bank"].level = 0;
            manualSave.buildings["Bank"].minigame = null;
            let jsonSave = CCSave.fromObject({buildings: {"Bank": {level: 0}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('autocreating it if level > 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Bank"].level = 1;
            manualSave.buildings["Bank"].minigame = new CCMarketMinigame();
            let jsonSave = CCSave.fromObject({buildings: {"Bank": {level: 1}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('leaving it alone if null, even if level > 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Bank"].level = 1;
            manualSave.buildings["Bank"].minigame = null;
            let jsonSave = CCSave.fromObject({buildings: {"Bank": {level: 1, minigame: null}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Bank"].level = 1;
            manualSave.buildings["Bank"].minigame = new CCMarketMinigame();
            manualSave.buildings["Bank"].minigame.brokers = 15;
            manualSave.buildings["Bank"].minigame.goods.EGG.val = 9;
            let jsonSave = CCSave.fromObject({buildings: {"Bank": {level: 1, minigame: {
                brokers: 15,
                goods: {
                    EGG: {
                        val: 9,
                    },
                },
            }}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('complaining nicely about weird goods', () => {
            expect(() => {
                CCSave.fromObject({buildings: {"Bank": {level: 1, minigame: {
                    goods: 'all-of-them',
                }}}});
            }).toThrow('source.buildings["Bank"].minigame.goods is not an object');
            expect(() => {
                CCSave.fromObject({buildings: {"Bank": {level: 1, minigame: {
                    goods: {
                        ALL: {
                            value: 15,
                        },
                    },
                }}}});
            }).toThrow('target.buildings["Bank"].minigame.goods.ALL does not exist');
            expect(() => {
                CCSave.fromObject({buildings: {"Bank": {level: 1, minigame: {
                    goods: {
                        EGG: {
                            value: 15,
                        },
                    },
                }}}});
            }).toThrow('target.buildings["Bank"].minigame.goods.EGG.value does not exist');
        });
    });

    test.describe('handles the Pantheon minigame', () => {
        test('setting it to null if level == 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Temple"].level = 0;
            manualSave.buildings["Temple"].minigame = null;
            let jsonSave = CCSave.fromObject({buildings: {"Temple": {level: 0}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('autocreating it if level > 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Temple"].level = 1;
            manualSave.buildings["Temple"].minigame = new CCPantheonMinigame();
            let jsonSave = CCSave.fromObject({buildings: {"Temple": {level: 1}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('leaving it alone if null, even if level > 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Temple"].level = 1;
            manualSave.buildings["Temple"].minigame = null;
            let jsonSave = CCSave.fromObject({buildings: {"Temple": {level: 1, minigame: null}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Temple"].level = 1;
            manualSave.buildings["Temple"].minigame = new CCPantheonMinigame();
            manualSave.buildings["Temple"].minigame.diamondSlot = 'ruin';
            let jsonSave = CCSave.fromObject({buildings: {"Temple": {level: 1, minigame: {
                diamondSlot: 'ruin',
            }}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('complaining nicely about bad inputs', () => {
            expect(() => {
                CCSave.fromObject({buildings: {"Temple": {level: 1, minigame: 'yes'}}});
            }).toThrow('source.buildings["Temple"].minigame is not an object');
            expect(() => {
                CCSave.fromObject({buildings: {"Temple": {level: 1, minigame: {
                    diamondSlot: 3
                }}}});
            }).toThrow('source.buildings["Temple"].minigame.diamondSlot is not a string');
            expect(() => {
                CCSave.fromObject({buildings: {"Temple": {level: 1, minigame: {
                    goldenSlot: 'mother',
                }}}});
            }).toThrow('target.buildings["Temple"].minigame.goldenSlot does not exist');
        });
    });

    test.describe('handles the Grimoire minigame', () => {
        test('setting it to null if level == 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Wizard tower"].level = 0;
            manualSave.buildings["Wizard tower"].minigame = null;
            let jsonSave = CCSave.fromObject({buildings: {"Wizard tower": {level: 0}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('autocreating it if level > 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Wizard tower"].level = 1;
            manualSave.buildings["Wizard tower"].minigame = new CCGrimoireMinigame();
            let jsonSave = CCSave.fromObject({buildings: {"Wizard tower": {level: 1}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('leaving it alone if null, even if level > 0', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Wizard tower"].level = 1;
            manualSave.buildings["Wizard tower"].minigame = null;
            let jsonSave = CCSave.fromObject({buildings: {"Wizard tower": {
                level: 1, minigame: null,
            }}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.buildings["Wizard tower"].level = 1;
            manualSave.buildings["Wizard tower"].minigame = new CCGrimoireMinigame();
            manualSave.buildings["Wizard tower"].minigame.spellsCastTotal = 5;
            let jsonSave = CCSave.fromObject({buildings: {"Wizard tower": {level: 1, minigame: {
                spellsCastTotal: 5,
            }}}});
            expect(jsonSave).toEqual(manualSave);
        });

        test('complaining nicely about bad inputs', () => {
            expect(() => {
                CCSave.fromObject({buildings: {"Wizard tower": {level: 1, minigame: 'yes'}}});
            }).toThrow('source.buildings["Wizard tower"].minigame is not an object');
            expect(() => {
                CCSave.fromObject({buildings: {"Wizard tower": {level: 1, minigame: {
                    spellsCastTotal: 'a lot',
                }}}});
            }).toThrow('source.buildings["Wizard tower"].minigame.spellsCastTotal is not a number');
            expect(() => {
                CCSave.fromObject({buildings: {"Wizard tower": {level: 1, minigame: {
                    forceGC: 'building special',
                }}}});
            }).toThrow('target.buildings["Wizard tower"].minigame.forceGC does not exist');
        });
    });

    test.describe('handles .ownedUpgrades', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.ownedUpgrades[0] = 'Cheap hoes';
            manualSave.ownedUpgrades[1] = 'Kitten helpers';
            let jsonSave = CCSave.fromObject({ownedUpgrades: ['Kitten helpers', 10]});
            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({ownedUpgrades: ['invalid upgrade']});
            }).toThrow('source.ownedUpgrades[0] is not an upgrade');
        });

        // More extensive test is not needed because the code is the same as for .vault
    });

    test.describe('handles .unlockedUpgrades', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.unlockedUpgrades[0] = 'Cheap hoes';
            manualSave.unlockedUpgrades[1] = 'Kitten helpers';
            let jsonSave = CCSave.fromObject({unlockedUpgrades: ['Kitten helpers', 10]});
            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({unlockedUpgrades: ['invalid upgrade']});
            }).toThrow('source.unlockedUpgrades[0] is not an upgrade');
        });

        test('complaining about owned upgrades', () => {
            expect(() => {
                CCSave.fromObject({
                    ownedUpgrades: ['Cheap hoes', 'Kitten helpers'],
                    unlockedUpgrades: ['Cheap hoes', 'Kitten experts'],
                });
            }).toThrow('Upgrade "Cheap hoes" appears in both source.ownedUpgrades and source.unlockedUpgrades');
        });
    });

    test.describe('handles .achievements', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.achievements[0] = 'Wake and bake';
            manualSave.achievements[1] = 'Gaseous assets';
            let jsonSave = CCSave.fromObject({achievements: [0, 'Gaseous assets']});
            expect(jsonSave).toEqual(manualSave);
        });

        test('sorting the achievements if necessary', () => {
            let manualSave = new CCSave();
            manualSave.achievements[0] = 'Wake and bake';
            manualSave.achievements[1] = 'Gaseous assets';
            let jsonSave = CCSave.fromObject({achievements: ['Gaseous assets', 0]});
            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({achievements: 'all of them'});
            }).toThrow('source.achievements is not an array');
            expect(() => {
                CCSave.fromObject({achievements: ['invalid achievement']});
            }).toThrow('source.achievements[0] is not an achievement');
            expect(() => {
                CCSave.fromObject({achievements: [10, -5]});
            }).toThrow('source.achievements[1] is not an achievement id');
            expect(() => {
                CCSave.fromObject({achievements: [10, 11, 3.14]});
            }).toThrow('source.achievements[2] is not an achievement id');
            expect(() => {
                CCSave.fromObject({achievements: [10, 11, 12, 31415926535]});
            }).toThrow('source.achievements[3] is not an achievement id');
            expect(() => {
                CCSave.fromObject({achievements: [10, 11, 12, 13, true]});
            }).toThrow('source.achievements[4] is not a number or a string');
        });
    });

    test.describe('handles .buffs', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            let sugarBlessing = new CCBuffSugarBlessing();
            sugarBlessing.maxTime = 24*3600*1000;
            sugarBlessing.time = 20*3600*1000;
            let buildingSpecial = new CCBuffBuildingSpecial();
            buildingSpecial.maxTime = 60*1000;
            buildingSpecial.time = 30*1000;
            buildingSpecial.building = 6;
            buildingSpecial.multCpS = 60;
            let dragonflight = new CCBuffDragonflight();
            dragonflight.maxTime = 20*1000;
            dragonflight.time = 5*1000;
            dragonflight.multClick = 1223;
            manualSave.buffs[0] = sugarBlessing;
            manualSave.buffs[1] = buildingSpecial;
            manualSave.buffs[2] = dragonflight;

            let jsonSave = CCSave.fromObject({buffs: [
                {
                    name: 'sugar blessing',
                    maxTime: 24*3600*1000,
                    time: 20*3600*1000,
                },
                {
                    name: 'building buff',
                    maxTime: 60*1000,
                    time: 30*1000,
                    building: 6,
                    multCpS: 60,
                },
                {
                    name: 'dragonflight',
                    maxTime: 20*1000,
                    time: 5*1000,
                    multClick: 1223,
                },
            ]});

            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({buffs: 'all of them'});
            }).toThrow('source.buffs is not an array');
            expect(() => {
                CCSave.fromObject({buffs: [
                    'dragonflight',
                ]});
            }).toThrow('source.buffs[0] is not an object');
            expect(() => {
                CCSave.fromObject({buffs: [
                    {},
                ]});
            }).toThrow('source.buffs[0] is missing buff name');
            expect(() => {
                CCSave.fromObject({buffs: [
                    {name: 5},
                ]});
            }).toThrow('source.buffs[0].name is not a valid buff name');
            expect(() => {
                CCSave.fromObject({buffs: [
                    {
                        name: 'building buff',
                        maxTime: 60*1000,
                        time: 30*1000,
                        building: 6,
                        multCpS: 60,
                    },
                    {
                        name: 'some powerful buff'
                    },
                ]});
            }).toThrow('source.buffs[1].name is not a valid buff name');
            expect(() => {
                CCSave.fromObject({buffs: [
                    {
                        name: 'dragonflight',
                        multCpS: 17,
                    },
                ]});
            }).toThrow('target.buffs[0].multCpS does not exist');
        });
    });

    test.describe('handles .modSaveData', () => {
        test('with correct inputs', () => {
            let manualSave = new CCSave();
            manualSave.modSaveData.mod1 = 'a string';
            manualSave.modSaveData.mod2 = {anObject: true};
            manualSave.modSaveData.mod3 = {trickyString: '|;'};
            let jsonSave = CCSave.fromObject({modSaveData: {
                mod1: 'a string',
                mod2: {anObject: true},
                mod3: {trickyString: '|;'},
            }});
            expect(jsonSave).toEqual(manualSave);
        });

        test('throwing readable error messages', () => {
            expect(() => {
                CCSave.fromObject({modSaveData: 'data'});
            }).toThrow('source.modSaveData is not an object');
            expect(() => {
                CCSave.fromObject({modSaveData: []});
            }).toThrow('target.modSaveData is not an array');
            expect(() => {
                CCSave.fromObject({modSaveData: {
                    mod1: 42,
                }});
            }).toThrow('source.modSaveData["mod1"] is not an object or a string');
        });
    });
});
