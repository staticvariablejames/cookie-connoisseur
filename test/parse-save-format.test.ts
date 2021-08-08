import { test, expect } from '@playwright/test';
import { CCSave } from '../lib/parse-save-format.js';

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
   'MTExMTExMTExMTAxMTExMTExMTExMTEwMTExMTExMTEwMTExMTExMXwwLDM2NDgzLDIzNjgwLDcs'+
   'MCwwOzExLDI1OTIwMDAsMjU2MTUyNCwxLDAsMDszLDYzNzQsMTExOCwxNSwwLDA7MjAsMjE2MDAw'+
   'LDIxMDk1MywxLjUsMCwwOzI0LDUxODQwMDAsNTE3ODk2OCwxLjIsMCwwOzE5LDEwODAwMCwxMDMw'+
   'MTEsMywwLDA7MjIsMTIwNiw3MDAsMjs3LDY5MCwyMTUsMTExMTs2LDkwMCw0NDIsNzc3OzksMjA3'+
   'MCwxNjQ0LDYwLjMsMTA7fA%3D%3D%21END%21';

const saveAsObject = {
    version: 2.031,
    startDate: 1606528436262,
    fullDate: 1591465355520,
    lastDate: 1606617852540,
    bakeryName: 'Static',
    seed: 'ujxnq',

    preferences: {
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
    permanentUpgrades: [695, 714, 613, 641, 716],
    dragonLevel: 25,
    dragonAura: 15,
    dragonAura2: 10,
    chimeType: 1,
    volume: 54,
    lumps: 135,
    lumpsTotal: 1283,
    lumpT: 1606556034153,
    lumpRefill: 0,
    lumpCurrentType: 2,
    vault: [227],
    heralds: 41,
    fortuneGC: true,
    fortuneCPS: true,
    cookiesPsRawHighest: 8.704799674705293e+50,

    buildings: {
        'Cursor':               {amount: 731, bought: 2932, totalCookies:  4.543140626515491e+54, level: 20, muted: false, highest: 782},
        'Grandma':              {amount: 821, bought: 1415, totalCookies:  3.868116975149197e+54, level: 10, muted:  true, highest: 821},
        'Farm':                 {amount:   0, bought: 1092, totalCookies: 7.3413533783125586e+50, level: 10, muted:  true, highest: 742},
        'Mine':                 {amount:   0, bought: 1071, totalCookies:  6.755067422094288e+52, level: 10, muted:  true, highest: 721},
        'Factory':              {amount:   0, bought: 1058, totalCookies: 1.1820949627460863e+52, level: 10, muted:  true, highest: 708},
        'Bank':                 {amount:   0, bought: 1049, totalCookies: 2.4836125026038515e+51, level: 10, muted: false, highest: 699},
        'Temple':               {amount:   0, bought: 1023, totalCookies: 1.0096880226829498e+52, level: 10, muted:  true, highest: 673},
        'Wizard tower':         {amount:   1, bought: 1715, totalCookies:  2.187965131587015e+51, level: 10, muted: false, highest: 711},
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
}

test('The save game is properly parsed', async() => {
    expect(CCSave.fromStringSave(saveAsString)).toMatchObject(saveAsObject);
});

test('Written saves can be recovered', async() => {
    let str = CCSave.toStringSave(saveAsObject);
    expect(CCSave.fromStringSave(str)).toMatchObject(saveAsObject);
});
