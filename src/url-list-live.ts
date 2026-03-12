/* This file contains the list of URLs pointing to the resources
 * used by the live version of Cookie Clicker.
 */
import { URLDirectory, EntryURL, DropURLList } from './url-list';

export const liveEntryURL: EntryURL = 'https://orteil.dashnet.org/cookieclicker/';

export const liveURLs: URLDirectory = {
    'https://orteil.dashnet.org/cookieclicker/ascendCalibrator.js': {
        sha1sum: '5457b3e0c699ede5a4968946be5b74d732269e07',
    },
    'https://orteil.dashnet.org/cookieclicker/base64.js': {
        sha1sum: '9d105f55ed2e6ce99be4051ff12d2c6fa5ae7513',
    },
    'https://orteil.dashnet.org/cookieclicker/index.html': {
        contentType: 'text/html; charset=UTF-8', // see encoding.test.ts
        sha1sum: null,
        // No sha1sum; index.html hasn't been deterministic since 2.058 due to Cloudflare's JSD challenge
    },
    'https://orteil.dashnet.org/cookieclicker/main.js': {
        sha1sum: '8bb08ce14dd3ae25b1e21462031f4e16f60106a9',
    },
    'https://orteil.dashnet.org/cookieclicker/minigameGarden.js': {
        sha1sum: '1f49d035545f228b378a90ac0fb902490f92f65b',
    },
    'https://orteil.dashnet.org/cookieclicker/minigameGrimoire.js': {
        sha1sum: '09c73cd93b527a99dbed2bb9e91439e8f07b8ce6',
    },
    'https://orteil.dashnet.org/cookieclicker/minigameMarket.js': {
        sha1sum: 'd82152a8114cce03860c2e6b561a2e695d112781',
    },
    'https://orteil.dashnet.org/cookieclicker/minigamePantheon.js': {
        sha1sum: '298ea847fef10bb6d39bb9f53c04f6a6d9a9fc71',
    },
    'https://orteil.dashnet.org/cookieclicker/showads.js': {
        sha1sum: '63f4cc74c93b533257143e62b9f16aa33c465c89',
    },
    'https://orteil.dashnet.org/cookieclicker/style.css': {
        sha1sum: 'c4e0fdb2130e4b36286722706d9fcfe9b08ecb69',
    },

    'https://orteil.dashnet.org/cookieclicker/img/AQWorlds_CookieClicker_300x40.png': {
        sha1sum: 'a304715376aab2fef01e1a60bfc95f0301431743',
    },
    'https://orteil.dashnet.org/cookieclicker/img/alchemylabBackground.png': {
        sha1sum: 'f1e97d8f9e9154c2d1e71f72d53f9aa9f7dcfbe2',
    },
    'https://orteil.dashnet.org/cookieclicker/img/alchemylab.png': {
        sha1sum: '50b5a2bbfc5f77c3061ef83640da68705730041e',
    },
    'https://orteil.dashnet.org/cookieclicker/img/alteredGrandma.png': {
        sha1sum: '9e365a133e0c3624fefc17336417bbc0f5353617',
    },
    'https://orteil.dashnet.org/cookieclicker/img/alternateGrandma.png': {
        sha1sum: 'dbd5415790a83ab543b698ce4ddd8f937e4569f9',
    },
    'https://orteil.dashnet.org/cookieclicker/img/antiGrandma.png': {
        sha1sum: 'a05761e075a57ca5416c589b16b3f2708dbb5db6',
    },
    'https://orteil.dashnet.org/cookieclicker/img/antimattercondenserBackground.png': {
        sha1sum: '9538a4e3d96350e59d74cf5abea67cc47f746883',
    },
    'https://orteil.dashnet.org/cookieclicker/img/antimattercondenser.png': {
        sha1sum: 'eef41a1f44c0f6910e6a10e09f529b5459f8a201',
    },
    'https://orteil.dashnet.org/cookieclicker/img/ascendBox.png': {
        sha1sum: 'a8a9798f24a2188e0831e9fd9ba4e8dd07a43eab',
    },
    'https://orteil.dashnet.org/cookieclicker/img/ascendInfo.png': {
        sha1sum: 'de7d1b3d8739595fb76552895fec6534522d4e46',
    },
    'https://orteil.dashnet.org/cookieclicker/img/ascendSlot.png': {
        sha1sum: '36f68417a14e14b8fc4723b78e9e7e844740c56f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bankBackground.png': {
        sha1sum: 'bb78e1841108509d45515269e0b074a97f85b152',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bankGrandma.png': {
        sha1sum: '500ce9a609aa54b78afc33827b821e551e9f5076',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bank.png': {
        sha1sum: '6696b7f3100f01692d9d8d2c88fd67236f59d20a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgBlack.jpg': {
        sha1sum: 'de5c5799ba446450d68d2e8fc50e083ee94b347d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgBlue.jpg': {
        sha1sum: '2f34ae31a3cfa8523ef75170e846356d81bffefd',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgBW.jpg': {
        sha1sum: 'd7377d46d27dd4e0866297231055e81d403440ed',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgCandy.jpg': {
        sha1sum: '62189fcfe114386e104419edef7e2e3c740834c9',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgChoco.jpg': {
        sha1sum: '1b461e436d03eafd05f68ecc205191e86de6424d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgChocoDark.jpg': {
        sha1sum: '123a7913eb6c2214fa527b02c178548fff24daa4',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgCoarse.jpg': {
        // Apparently this background is unused
        sha1sum: '298cce6e78befb9aeb576e425aa65b983e9cf1d7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgFoil.jpg': {
        sha1sum: 'ac89431f26c4e012f30d38490a74e6f0f52855b6',
    },
    'https://orteil.dashnet.org/cookieclicker/img/BGgarden.jpg': {
        sha1sum: '2207ad25956847c8e29c298df55f49cc3b7c1e42',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgGold.jpg': {
        sha1sum: 'e1486b81a7c62ca7ccef359709af1fc2f8957f1a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/BGgrimoire.jpg': {
        sha1sum: '401d15065079589f4a777452e4228f131f7e354e',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgMint.jpg': {
        sha1sum: 'a6e54e2f679926d0bd9d57e1a1307e1f887b1f3a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/BGmarket.jpg': {
        sha1sum: '001d23f08cfacd0775d8eebeacfe730b8cd3ba67',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgMoney.jpg': {
        sha1sum: '8e353a1c2131b433a5cd44c9d42f316ab732ccf0',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgPaint.jpg': {
        sha1sum: 'ab84f11d6c8a5a6460f96587977499a4f0ec30a4',
    },
    'https://orteil.dashnet.org/cookieclicker/img/BGpantheon.jpg': {
        sha1sum: '312b8e8504d4b3ac975c6613e137e24c96142b64',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgPink.jpg': {
        sha1sum: '5e4ee01cd7181d78dc10003dcdd76420fe01518e',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgPurple.jpg': {
        sha1sum: '2e01902649a7a8ad02866b0dd33ac9d48059c82f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgRed.jpg': {
        sha1sum: 'df4fc7daad2586cd9e7b36cac0d0e66ad90015a3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgSilver.jpg': {
        sha1sum: '3a03a5e5849704d341e54738a6cdb32aa6ffc372',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgSky.jpg': {
        sha1sum: 'aa312e7d35d73e3036f6fec961321790888764ff',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgSnowy.jpg': {
        sha1sum: 'bd7a320274772ccb14d1af19be7bacdf5bfa7095',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgSpectrum.jpg': {
        sha1sum: '02542548e14e9105da9fcd814105ec5a11a24728',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgStars.jpg': {
        sha1sum: '59346a7c30eff3978c4849d1bf04d88e0292e579',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgWhite.jpg': {
        sha1sum: '54318c1b1e7cb13a808bd05df3077eecb8bb83e7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bgYellowBlue.jpg': {
        sha1sum: '50351333d6eb8001238931b1dbb5d2a31f1e6c91',
    },
    'https://orteil.dashnet.org/cookieclicker/img/blackGradient.png': {
        sha1sum: '90580358baf717939a0515aa3552e47e2f00ed8c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/blackGradientSmallTop.png': {
        sha1sum: 'db376fdc2ad5b434018e1f01dd8804fa6cf0f121',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bracketPanelLeftS.png': {
        sha1sum: 'a8b26cdd01186d830a1c0ad569c3caebb121375d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bracketPanelRightS.png': {
        sha1sum: '1b3c09a24a2d33595b4cb7744954a38b3af47aa7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/brainyGrandma.png': {
        sha1sum: 'f7dfdcd3c4b0d268419808b09ec74c5df044ad69',
    },
    'https://orteil.dashnet.org/cookieclicker/img/brokenCookieHalo.png': {
        sha1sum: 'd9f893a1dbc5e2e961a148b3c953193fb5a6ae4b',
    },
    'https://orteil.dashnet.org/cookieclicker/img/brokenCookie.png': {
        sha1sum: 'cb123c2cf13c0798f9105c8087b4b6f413563568',
    },
    'https://orteil.dashnet.org/cookieclicker/img/buildings.png': {
        sha1sum: 'edbcc07ce4117aeb27ab6449cb6b261dd5abf7ee',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bunnies.png': {
        sha1sum: 'a5ba9ceabd0e87a2ffd2fb2b305bf1a4d6b3599c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/bunnyGrandma.png': {
        sha1sum: 'dc3835a6348dfe300a74f5afcc20bcb8fbf5dc42',
    },
    'https://orteil.dashnet.org/cookieclicker/img/chancemakerBackground.png': {
        sha1sum: 'd1f38ad993229b0f15626a671809b9aea379db43',
    },
    'https://orteil.dashnet.org/cookieclicker/img/chancemaker.png': {
        sha1sum: 'cf37d71b460ce58d750dad333c174e861c1193ee',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cloneGrandma.png': {
        sha1sum: 'fbd7d0fdb48a1a0a2733a290c29cb57da44e1fd7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cookieShadow.png': {
        sha1sum: '89059f8118e99c45c289d6c58c4b7a8655e5c276',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cookieShower1.png': {
        sha1sum: '210025335614444bd7180e8374a43fc081920e44',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cookieShower2.png': {
        sha1sum: 'e216c189b02ddc27294a9e198b8815e8b768a4e3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cookieShower3.png': {
        sha1sum: '238104ca43cf07ecf0c047adb852a529f060e83a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cortex.png': {
        sha1sum: '554b638db217f884cf411307e631cdd5385625b4',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cortexBackground.png': {
        sha1sum: '6fe77f3ce1c53202ded5d24bf25dc304e8c6fadc',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cosmicGrandma.png': {
        sha1sum: '510d2ec627f68416a7667893c9a8dffbbb9dc509',
    },
    'https://orteil.dashnet.org/cookieclicker/img/cursor.png': {
        sha1sum: '91ff64fac259e1df1500f19e88d5ee8c3a613455',
    },
    'https://orteil.dashnet.org/cookieclicker/img/darkNoise.jpg': {
        sha1sum: '01868b64c76725eb191b823f649f5d87d4f9c0b5',
    },
    'https://orteil.dashnet.org/cookieclicker/img/darkNoiseTopBar.jpg': {
        sha1sum: '3a534475f2cb94541eee96ef3ff6ba34ae315e98',
    },
    'https://orteil.dashnet.org/cookieclicker/img/discord.png': {
        sha1sum: '36cdbacb7522068f06ee544f095635faa3c10f69',
    },
    'https://orteil.dashnet.org/cookieclicker/img/dragonBG2.png': {
        sha1sum: 'ae8d756329926c049e537d37efad3da6c7d66f8f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/dragon.png': {
        sha1sum: 'b94e301db5b47aa7e395cdb71fc5be4989763db8',
    },
    'https://orteil.dashnet.org/cookieclicker/img/elfGrandma.png': {
        sha1sum: '313149bc555d6717f8760f69b6b73c8baea73183',
    },
    'https://orteil.dashnet.org/cookieclicker/img/empty.png': {
        sha1sum: 'f790e262d20d980f4c847beba41a60ec3c6dbcee',
    },
    'https://orteil.dashnet.org/cookieclicker/img/factoryBackground.png': {
        sha1sum: 'ae9f9bd051ed5efa8df7ec12661036bb14773152',
    },
    'https://orteil.dashnet.org/cookieclicker/img/factory.png': {
        sha1sum: '548c6dc1ec6fcf12f009cdcf4cbaa13e43671480',
    },
    'https://orteil.dashnet.org/cookieclicker/img/familiars.png': {
        sha1sum: '1c385626d173da5eab0652bb16254419adb06265',
    },
    'https://orteil.dashnet.org/cookieclicker/img/fangamerClickerPic.png': {
        sha1sum: '756abd1441099a7c4aa2a9d3006f1e1e29e372be',
    },
    'https://orteil.dashnet.org/cookieclicker/img/farmBackground.png': {
        sha1sum: 'd0c9de9bd64c8c869368fc444e0e57b4cbab294c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/farmerGrandma.png': {
        sha1sum: 'b53b7039dcac5decf57672a6a2727357ae9a48e3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/farm.png': {
        sha1sum: 'fefa5a6205ab45d2d195d251e8c1c88936240589',
    },
    'https://orteil.dashnet.org/cookieclicker/img/favicon.ico': {
        // We ignore the favicon when downloading. This entry is here for consistency.
        sha1sum: 'fd2fd8e6d0501a01842015de6e6dc62544ac6d89',
    },
    'https://orteil.dashnet.org/cookieclicker/img/featherLeft.png': {
        sha1sum: 'a89d8ce64a32c7a2cc21fd79d3d5c3a5e5d01bf3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/featherRight.png': {
        sha1sum: '539b254c727b90eab623339f5acd8cba9a98e1d9',
    },
    'https://orteil.dashnet.org/cookieclicker/img/filler.png': {
        sha1sum: 'eeeb48bba1c0bee35ec2f8fae620b99fe6e79073',
    },
    'https://orteil.dashnet.org/cookieclicker/img/flare.png': {
        sha1sum: 'addaeb4b67421b6e2a2c9d4ccc95deb7225c510b',
    },
    'https://orteil.dashnet.org/cookieclicker/img/flareGold.png': {
        sha1sum: '16d05d85ee6147d897863ebc90fc6a469ce01dd7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/flareSuckRed.png': {
        sha1sum: '300d3afc98ad0838a6ef127a16a883babd0092c2',
    },
    'https://orteil.dashnet.org/cookieclicker/img/fractalEngineBackground.png': {
        sha1sum: '8457c639daf64afeaf4fc2ae9a55cfb5260e05ba',
    },
    'https://orteil.dashnet.org/cookieclicker/img/fractalEngine.png': {
        sha1sum: '4c4673eb6abb4c61f5bc8543389ceabce2f83050',
    },
    'https://orteil.dashnet.org/cookieclicker/img/frameBorder.png': {
        sha1sum: '7defb8bafe76a6183862d5af86285f8f7a947a07',
    },
    'https://orteil.dashnet.org/cookieclicker/img/frostedReindeer.png': {
        sha1sum: '215f020a4b2b0e1b144d63b6209b729a8db6d534',
    },
    'https://orteil.dashnet.org/cookieclicker/img/gardenPlants.png': {
        sha1sum: '261afc565b5d08cefaa927bbe663d7d0f5dadd5d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/gardenPlots.png': {
        sha1sum: '9a87330ce83dac865b17007aea1225fabcea894e',
    },
    'https://orteil.dashnet.org/cookieclicker/img/gardenTip.png': {
        sha1sum: '6abb1562d86a5e3150c83fcbf85b39c8dfbb5f57',
    },
    'https://orteil.dashnet.org/cookieclicker/img/glint.png': {
        sha1sum: 'c8df42002b077d6cf128e7c6de3ec7ea4be4414f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/goldCookie.png': {
        sha1sum: 'eece67399c9d1014b7633697132cb477375bb0b1',
    },
    'https://orteil.dashnet.org/cookieclicker/img/goldCookieWreath.png': {
        sha1sum: '805d2cec6099e69925301810d4f4e4e44ca1111d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/grandmaBackground.png': {
        sha1sum: 'bbb84370178b2a9906b6a34944c9440c96d14d00',
    },
    'https://orteil.dashnet.org/cookieclicker/img/grandma.png': {
        sha1sum: '7d7d343c55d5c631e49c3d4b39b7b9092802cb12',
    },
    'https://orteil.dashnet.org/cookieclicker/img/grandmas1.jpg': {
        sha1sum: '04daf1f454f5395c17b4d5527d4e5e8c217ad358',
    },
    'https://orteil.dashnet.org/cookieclicker/img/grandmas2.jpg': {
        sha1sum: '61b26c33b57e1f25be3f735b2816d9327c26444e',
    },
    'https://orteil.dashnet.org/cookieclicker/img/grandmas3.jpg': {
        sha1sum: '3604223d2743d497e8cf3a1dff31b67be45b12ac',
    },
    'https://orteil.dashnet.org/cookieclicker/img/grandmasGrandma.png': {
        sha1sum: '06bf71ef4f1af078f020479fce69ff4012cb810f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/hearts.png': {
        sha1sum: '8101c1d0f23aa7bc3bca3f36204013587c8bb338',
    },
    'https://orteil.dashnet.org/cookieclicker/img/heartStorm.png': {
        sha1sum: 'a1dd1e11ad28d414818b327a38dd67bd81453c29',
    },
    'https://orteil.dashnet.org/cookieclicker/img/heavenlyMoney.png': {
        sha1sum: 'a3cfba99c9cfdbfb92346e9a3c01f23a38a85dd1',
    },
    'https://orteil.dashnet.org/cookieclicker/img/heavenRing1.jpg': {
        sha1sum: 'd4b81f651f91946be8215a038e1b0027373a6a5e',
    },
    'https://orteil.dashnet.org/cookieclicker/img/heavenRing2.jpg': {
        sha1sum: '66710bd7c23ceedca43447b44d5e58ee7f93aa23',
    },
    'https://orteil.dashnet.org/cookieclicker/img/heraldFlag.png': {
        sha1sum: '0cf2651f4116b21e8854547fb5184d08b62e4eee',
    },
    'https://orteil.dashnet.org/cookieclicker/img/icons.png': {
        sha1sum: '16cfdb7bf258f3f4ada385a441db93a316ef4d68',
    },
    'https://orteil.dashnet.org/cookieclicker/img/idleverseBackground.png': {
        sha1sum: '87d227184517fba755632fabba02e2d894282f1d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/idleverse.png': {
        sha1sum: '8359c8b63746b1ab04c36344dcb43160e7a15268',
    },
    'https://orteil.dashnet.org/cookieclicker/img/imperfectCookie.png': {
        // Mentioned only in the comments
        sha1sum: '190c37ed323257f3e36515fa0ac337a64b34fcf8',
    },
    'https://orteil.dashnet.org/cookieclicker/img/infoBGfade.png': {
        // This file is mentioned in style.css but I don't think it appears anywhere
        sha1sum: '3843f8edbbe1664d31b1aaec33e2974b2dffe0b2',
    },
    'https://orteil.dashnet.org/cookieclicker/img/infoBG.png': {
        // This file is mentioned in style.css but I don't think it appears anywhere
        sha1sum: 'c1a4d5bbd6c6737a39537f2deab81ce5943a2d6b',
    },
    'https://orteil.dashnet.org/cookieclicker/img/javascriptconsoleBackground.png': {
        sha1sum: 'af3867b02af8a996657340074de7f2284676b4b3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/javascriptconsole.png': {
        sha1sum: '0abfdca04be536d109d5ff9fd4e444d7e2912fa4',
    },
    'https://orteil.dashnet.org/cookieclicker/img/levelUp.png': {
        sha1sum: '9bdd8bea3d68d1da8f531d8f5b2d372f532072be',
    },
    'https://orteil.dashnet.org/cookieclicker/img/linkPulse.gif': {
        sha1sum: '7101536af0b54ad5612d600ee6f3c81c8e5b237d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/lockOff.png': {
        /* Tiny little black padlock besides the version number in the bottom left corner.
         * It is only visible on the HTTP version (the HTTPS uses the green lockOn.png).
         * TODO: handle the HTTP version too
         */
        sha1sum: '254f2b26aa43c998660b13578e3f6af36a563e98',
    },
    'https://orteil.dashnet.org/cookieclicker/img/lockOn.png': {
        sha1sum: '14c36af7dcbe8b5d15ea237e11809f85d32361dc',
    },
    'https://orteil.dashnet.org/cookieclicker/img/luckyGrandma.png': {
        sha1sum: '2d999072551d2f73d1a70818c8b51dab37856d48',
    },
    'https://orteil.dashnet.org/cookieclicker/img/mapBG.jpg': {
        sha1sum: '62d5a785f8ad591e4918ab708e07c9f04a6315e4',
    },
    'https://orteil.dashnet.org/cookieclicker/img/messageBG.png': {
        sha1sum: '81a548100cdbcb85a9280cfb338a0297eec088d8',
    },
    'https://orteil.dashnet.org/cookieclicker/img/metaGrandma.png': {
        sha1sum: 'f3c7bc57251629b3de00223b19fe50bbe8b6cc59',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkBanana.png': {
        sha1sum: '27a91f2060e409fcbff75c042a28d894239876c3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkBlackcurrant.png': {
        sha1sum: '22c796875560e9bdd5e91c0accc01087436a9949',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkBlack.png': {
        sha1sum: '49f5546bde49cc5ccb2053a120849d929b8224fc',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkBlood.png': {
        sha1sum: '5b4be349a9da43bcdd8fd0cdb5b9865df2cce5c5',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkBlueberry.png': {
        sha1sum: 'fd04dcd59e56429817362cfbeb9ee4bc26cb7db7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkBlueFire.png': {
        sha1sum: '75a1e4974011beee17cc9960e647b4b3cad63011',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkCaramel.png': {
        sha1sum: '79e789736b1a2c9b389f5126b4532a884aa45a85',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkCherry.png': {
        sha1sum: 'cf723340e521e912b825f42c6cf43e9f7ceeb46a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkChocolate.png': {
        sha1sum: '9f35de306dd23277b41df81a743e8ebb5c77dd7e',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkCoconut.png': {
        sha1sum: '846a2918af5b77cd0d106c54f612ca2f8fe17809',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkCoffee.png': {
        sha1sum: '4d66c1feb4f496512054c8bd0d4588c5c2445feb',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkDragonfruit.png': {
        sha1sum: '74fe05c3d4767f2c6da775f6e50f5d52dc518f6a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkFire.png': {
        sha1sum: '79cc0f082ae0f15f60a5d6cfc0ec12fd0184f1c9',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkGold.png': {
        sha1sum: '3b80247db6997039050cb5beddb56083fa8d06b6',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkGreenFire.png': {
        sha1sum: 'c991bbf3cb90153f5987c07c93842809bd536a80',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkHazelnut.png': {
        sha1sum: '1e891f3385ab83ee4a30d07e12c9f2df5da28e36',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkHoney.png': {
        sha1sum: 'a055b43f3843a2622e84ac744dab3e6706d43347',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkLicorice.png': {
        sha1sum: '10ef092b028896978ac9e6711802913fe4ec6f7c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkLime.png': {
        sha1sum: 'aa511d8a593ccb2a4e86f3de2f1b79a87432d649',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkMaple.png': {
        sha1sum: 'f07f93a3226c886e30420db8d0c8795394ef8671',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkMelon.png': {
        sha1sum: '835e592d812e287a1bf8e377a84f90bd794f0650',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkMint.png': {
        sha1sum: '1033c7bef4d4720860ed06d7db3550dd18987cfe',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkOrange.png': {
        sha1sum: 'e9ff355d73fe9e030e84f46f6800d08737a58f92',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkPeach.png': {
        sha1sum: 'f807531fab4f3fd76f46bb13f6bc1094a9d40802',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkPlain.png': {
        sha1sum: '5b3ee3b5a315028360da702a14cb617dde90d299',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkRaspberry.png': {
        sha1sum: '715d88942ff8fc4a90104bf4710e3a4ed4bc6c54',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkRose.png': {
        sha1sum: '36ef9cfcbe0e3cb0c8c050bb458f7f79b4a2c941',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkSoy.png': {
        sha1sum: '6b58954ea10c4da2503112088efe394f598f5be3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkSpiced.png': {
        sha1sum: 'ae116b14e4153d8b69ad3ad3f3f0d1500ccfad97',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkStars.png': {
        sha1sum: '0cc259fa515a08b6f94702fdba931153741d202c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkStrawberry.png': {
        sha1sum: '880664d5c9ce726a21f38ba7aeb98d368d7855db',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkTea.png': {
        sha1sum: '7e8693d62cdd67340b031a2db6a21ce021cef5bf',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkVanilla.png': {
        sha1sum: 'b31fb24b6d3099ca8f759023dc0af7af286ddb96',
    },
    'https://orteil.dashnet.org/cookieclicker/img/milkZebra.png': {
        sha1sum: '31d312cb6b3b47aa0e7ae6ae0c626efc03f18560',
    },
    'https://orteil.dashnet.org/cookieclicker/img/mineBackground.png': {
        sha1sum: '31cb3ff812bbbd53fefd88d6be22aa055ad46c43',
    },
    'https://orteil.dashnet.org/cookieclicker/img/mine.png': {
        sha1sum: '2df3b49a90e6a406b7e523b337b3344cb842ccd4',
    },
    'https://orteil.dashnet.org/cookieclicker/img/minerGrandma.png': {
        sha1sum: '7ea962f308b257173bd4626137c670b3887f9ca7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/money.png': {
        sha1sum: '54a71d23fae3861383f385684861f7b8fb88fa28',
    },
    'https://orteil.dashnet.org/cookieclicker/img/nest.png': {
        sha1sum: '563e3fd6b3c9674025187082fffdcdbdfce59b96',
    },
    'https://orteil.dashnet.org/cookieclicker/img/panelGradientBottom.png': {
        sha1sum: 'd58e9308d5a4e125e022b2d6a6892e68d3d08cf9',
    },
    'https://orteil.dashnet.org/cookieclicker/img/panelGradientLeft.png': {
        sha1sum: 'aed83c3047b2f2f6dafa9ee7eddff7461ee66afc',
    },
    'https://orteil.dashnet.org/cookieclicker/img/panelGradientRight.png': {
        sha1sum: '46c7ad55add858321b6b844e5c1bb450c3faba12',
    },
    'https://orteil.dashnet.org/cookieclicker/img/panelGradientTop.png': {
        sha1sum: '48e9974e182032ff870b3c5b67428928aaa1bfd0',
    },
    'https://orteil.dashnet.org/cookieclicker/img/panelHorizontal.png': {
        sha1sum: 'b78b73c24d03ec0c1df0436ea661f014035b6ca3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/panelMenu3.png': {
        sha1sum: '9701c81a3c50882d34effd2b282c1702b0c0ef34',
    },
    'https://orteil.dashnet.org/cookieclicker/img/panelVertical.png': {
        sha1sum: 'a0c06e9e559f5d9e9a40e1e1c7c306517087a368',
    },
    'https://orteil.dashnet.org/cookieclicker/img/parade.png': {
        sha1sum: 'c34501db6da95e9b01880268a6615455fe485897',
    },
    'https://orteil.dashnet.org/cookieclicker/img/perfectCookie.png': {
        sha1sum: '4a2d51bc56fa225644eee29c2edf72be7648e239',
    },
    'https://orteil.dashnet.org/cookieclicker/img/pieFill.png': {
        sha1sum: '27ace4e32b2acedbce9e5012f2537879d9d1f80a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/pointGlow.gif': {
        sha1sum: 'f03c36de1c138efe23bd3196634468f20d9c2eb9',
    },
    'https://orteil.dashnet.org/cookieclicker/img/portalBackground.png': {
        sha1sum: 'd83b362396a108c06a91db3f24b5c9e270c5f88d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/portal.png': {
        sha1sum: '39a352bf4b1c55f2b12a6de6757f31cd9dc0cf05',
    },
    'https://orteil.dashnet.org/cookieclicker/img/prestigeBarCap.png': {
        sha1sum: 'fc001b73c26180807e3bf819ec91765fbfb22392',
    },
    'https://orteil.dashnet.org/cookieclicker/img/prestigeBar.jpg': {
        sha1sum: '07715a7ed751fd38f596712aa360ca0f963b75dc',
    },
    'https://orteil.dashnet.org/cookieclicker/img/prismBackground.png': {
        sha1sum: '38f43f2ed517e458956aa407ccf252a8379c35f8',
    },
    'https://orteil.dashnet.org/cookieclicker/img/prism.png': {
        sha1sum: '61a830140bf721ea9e0aa3dd2fdf67b04bccbddb',
    },
    'https://orteil.dashnet.org/cookieclicker/img/rainbowGrandma.png': {
        sha1sum: '93802b86126a133b33c60c0802e37f239ce9443d',
    },
    'https://orteil.dashnet.org/cookieclicker/img/roundedPanelBGS.png': {
        sha1sum: '9ea69f32f8c214623399b183eef2ee92acf0cef7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/roundedPanelLeft.png': {
        // This file is mentioned in style.css but I don't think it appears anywhere
        sha1sum: 'e80ab164aa98b97da4fa722ca77aa69e9c5ef3d2',
    },
    'https://orteil.dashnet.org/cookieclicker/img/roundedPanelRight.png': {
        // This file is mentioned in style.css but I don't think it appears anywhere
        sha1sum: 'fe2f6a566432436ee6a0ae700bc1a4b26ce9421f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/santa.png': {
        sha1sum: '25f6ac0022db63b858f69cc079fd426d2e47cddf',
    },
    'https://orteil.dashnet.org/cookieclicker/img/scriptGrandma.png': {
        sha1sum: 'd7d79a547da53b5dc63dc4701befe660f8f6896b',
    },
    'https://orteil.dashnet.org/cookieclicker/img/selectTarget.png': {
        sha1sum: '41fe80ae5744fed9c28a7d5baed547057303c38c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shadedBordersGold.png': {
        sha1sum: 'e805368847bf76f2137d9756e47f0e1bdc703063',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shadedBorders.png': {
        sha1sum: '87f8b0fd285cad3f8f5d6ddedd57c0418c2efcd2',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shadedBordersRed.png': {
        sha1sum: '469ddb3ff4a3239ec25d95698ed68d626458839a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shadedBordersSoft.png': {
        sha1sum: 'f01cf09e32d80abab2edae38fcab9a1fb141cbe5',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shimmeringVeil.png': {
        sha1sum: '9550be49015d84caa4988d6684948b57325ab8a7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shine.png': {
        sha1sum: 'afeaee007a5acc8f27eed34f0641d12cff6d9f3a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shineSpoke.png': {
        sha1sum: 'a22cc9a3c75b41948e2593d57e181165b3e4c16e',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shinyWinkler.png': {
        sha1sum: 'f8ab9225b396794ff197bf3cbd98b0d302b29f42',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shinyWrinklerBits.png': {
        sha1sum: 'c82f51089139dbeda2101b8d7b32a12f10fd03ee',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shinyWrinkler.png': {
        sha1sum: '9a1e74f61ef90db1118165c1ba6e03724ad5baa5',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shipmentBackground.png': {
        sha1sum: '15886edcd3de046b48162d4b598e5f582ee68276',
    },
    'https://orteil.dashnet.org/cookieclicker/img/shipment.png': {
        sha1sum: '9101766e597b15d9d84270815ee39f14f0518c5f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/smallCookies.png': {
        sha1sum: 'ab94eb9a22423f4bb685c888892c6bc7cdf3477c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/smallDollars.png': {
        sha1sum: '2129839086c7a75630b2b1a8ac12618f3a9ca43c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/snow2.jpg': {
        sha1sum: 'df865ae6ea111d7f08e06b3b13f1274632539118',
    },
    'https://orteil.dashnet.org/cookieclicker/img/spamCookies.gif': {
        sha1sum: 'b82b163cd287dc6abe88c5bca480009ffaf464dd',
    },
    'https://orteil.dashnet.org/cookieclicker/img/sparkles.jpg': {
        sha1sum: '6e94c717a9a05cc48061ebeb7c3dcfefb6647c15',
    },
    'https://orteil.dashnet.org/cookieclicker/img/spellBG.png': {
        sha1sum: '96f8a367af2346f214f56abe2abca3c370e38f28',
    },
    'https://orteil.dashnet.org/cookieclicker/img/spinnyBig.png': {
        sha1sum: 'dfced18a7021e57e98c6a343440353021c154bb1',
    },
    'https://orteil.dashnet.org/cookieclicker/img/spinnySmall.png': {
        sha1sum: '93e706461d7c91976bbf0a1efef8e28fa9c459f7',
    },
    'https://orteil.dashnet.org/cookieclicker/img/starbg.jpg': {
        sha1sum: '7ba4e8410842ad6c87415dd237e19b54ba7ea331',
    },
    'https://orteil.dashnet.org/cookieclicker/img/storeTile.jpg': {
        sha1sum: '158728f2f6785d3537349a9c98362a71a87bb47b',
    },
    'https://orteil.dashnet.org/cookieclicker/img/sugarLump.png': {
        sha1sum: '30f240b4a89be784e986a44d268e8355d7d81c64',
    },
    'https://orteil.dashnet.org/cookieclicker/img/templeBackground.png': {
        sha1sum: '1c938e385e06e96a5ad848d3cdd84815ac7355ed',
    },
    'https://orteil.dashnet.org/cookieclicker/img/templeGrandma.png': {
        sha1sum: 'd336b20ce5b54de0e06cb2f1b28248396a0c38b5',
    },
    'https://orteil.dashnet.org/cookieclicker/img/temple.png': {
        sha1sum: '8d00e3df404ed864122be6fdc9ab3571c4147d77',
    },
    'https://orteil.dashnet.org/cookieclicker/img/timemachineBackground.png': {
        sha1sum: '2ebfe9a1364305daebdb7a117048fb74b550d6b1',
    },
    'https://orteil.dashnet.org/cookieclicker/img/timemachine.png': {
        sha1sum: '0d47982ecb8eceaccef8ef30ede46628a383f2cd',
    },
    'https://orteil.dashnet.org/cookieclicker/img/tinyEyeOff.png': {
        sha1sum: '0eb883c4cf0a867dd00e6ef37ec2bae32843b306',
    },
    'https://orteil.dashnet.org/cookieclicker/img/tinyEyeOn.png': {
        sha1sum: '6106f34bc0fef72a5817ef24bdee019aecf2ebc8',
    },
    'https://orteil.dashnet.org/cookieclicker/img/tinyglobe.gif': {
        sha1sum: 'd5de284b89ec246fe7311493bc181bc248f8353a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/tinyglobeSheet.gif': {
        sha1sum: 'c201d44d39d6d7616bd146daaff2ad57b3d9a4e0',
    },
    'https://orteil.dashnet.org/cookieclicker/img/topbarDiv.png': {
        sha1sum: '4fc86e35715acc111864aad91f5b290410ea8fe8',
    },
    'https://orteil.dashnet.org/cookieclicker/img/topbarMobile.png': {
        sha1sum: '70a9c43b76bac6b6fde136e20b43ab887ed3187c',
    },
    'https://orteil.dashnet.org/cookieclicker/img/topbarSteam.png': {
        sha1sum: '415d039a38b4d70f77d607f9bf15fd7b6402c344',
    },
    'https://orteil.dashnet.org/cookieclicker/img/transmutedGrandma.png': {
        sha1sum: '7837325ddf83e70a60bff991f759974b25f176e9',
    },
    'https://orteil.dashnet.org/cookieclicker/img/turnInto.png': {
        sha1sum: 'e6c06e483fac8b7932a7adb5fb829a9925043a8a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/upgradeFrame.png': {
        sha1sum: '9b53bfc77bbd37eeacca3654718aebbf3d1a833a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/upgradeSelector.png': {
        sha1sum: 'a0d57310b88a8879ad7ef1bda1a55e77c36af32a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/weeHoodie.png': {
        sha1sum: 'efc1fdcbe49cdb9d93f2f10a679ec4172a881029',
    },
    'https://orteil.dashnet.org/cookieclicker/img/winkler.png': {
        sha1sum: 'fcb52aeefa41b34a50da89556e7acef0f3aaa674',
    },
    'https://orteil.dashnet.org/cookieclicker/img/winterWinkler.png': {
        sha1sum: '38184fba48d643e1b71625381ac7e0b52c4dc2b8',
    },
    'https://orteil.dashnet.org/cookieclicker/img/winterWrinkler.png': {
        sha1sum: 'cfb80e057f47c1ebabc0f10a21a32f197f8c160a',
    },
    'https://orteil.dashnet.org/cookieclicker/img/witchGrandma.png': {
        sha1sum: 'da6f299f174db221ba12896a0478f620b766cf52',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wizardtowerBackground.png': {
        sha1sum: '17464e1147feb1dc8f3b78ce18e78d9411f3ed1f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wizardtower.png': {
        sha1sum: 'e4958d75c3c141602452554ce1c9b2b6787e9948',
    },
    'https://orteil.dashnet.org/cookieclicker/img/workerGrandma.png': {
        sha1sum: '35aafdf6802513ce4386b7884e13e965e32c9941',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wrathCookie.png': {
        sha1sum: 'd351f435f030a7198ddebad3dfcaa86f226f16bb',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wrathCookieWreath.png': {
        sha1sum: '03eb85fdfcb906246e9edb3d65e1052528985bb2',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wrinklerBlink.png': {
        sha1sum: 'a105fdab9ed88661ff8e591fa54ed7e10f3fe03f',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wrinklerBits.png': {
        sha1sum: 'b9d100e1b61fb8235b4bddbd7313c0c3f3f376a3',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wrinklerGooglies.png': {
        sha1sum: 'fa7a468f8a7d82b467918492394df7fd64068b69',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wrinkler.png': {
        sha1sum: '301140ae06f3ba0bf20ce02f4b88b353d08658be',
    },
    'https://orteil.dashnet.org/cookieclicker/img/wrinklerShadow.png': {
        sha1sum: '0deaf8fa1398776186555c687d38d5a53d544f18',
    },
    'https://orteil.dashnet.org/cookieclicker/img/you.png': {
        sha1sum: 'ac9f2213790f8085b6c8cf43309f0034f477554b',
    },
    'https://orteil.dashnet.org/cookieclicker/img/youAddons.png': {
        sha1sum: '07913d11b040c4874ef3e33d620353802887b7cb',
    },
    'https://orteil.dashnet.org/cookieclicker/img/youBackground.png': {
        sha1sum: '24a83a572df5c13648d281c922b3c5184af3d260',
    },
    'https://orteil.dashnet.org/cookieclicker/img/youLight.png': {
        sha1sum: '3d8c564d01ad5ee8845379c9aeb60a93e53e3f92',
    },

    'https://orteil.dashnet.org/cookieclicker/loc/CS.js': {
        sha1sum: '9340ea14c04b29f90d24e01acabbd19a9b731823',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/DA.js': {
        sha1sum: '5aec1e7e33d082ca4a846ad98c76434fa3a94700',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/DE.js': {
        sha1sum: '4dc970ac76401bd4fa0c5387ece2300cf7e5a13b',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/EN.js': {
        sha1sum: '8bf95a25093b1c190f3bdf24889071be6d6dc229',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/ES.js': {
        sha1sum: 'ecc572bf2c7bd746b025d54cdfc9cd83dfe5d238',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/FR.js': {
        sha1sum: 'd6551a0e4353e08e125c6f3062d0d301de558aff',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/IT.js': {
        sha1sum: '645d7b70d07e1dd49186b97553d7e9622c0c3474',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/JA.js': {
        sha1sum: 'f058a31f6cfa0b03d7ad684901569c2838c6dee1',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/KO.js': {
        sha1sum: '5d0bcac5e911fe05ed2a6d9d9810834f0e12f9dc',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/NL.js': {
        sha1sum: 'ab8ba358b2e9000d1ef7bc3804f6d7e73b1b887f',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/NO.js': {
        sha1sum: '29b220a979afee3ca69ac513244648247b89ccce',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/PL.js': {
        sha1sum: '6354218d12b37425d44b9f97122a212f1855ae25',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/PT-BR.js': {
        sha1sum: '9b300ca6c13cb461b8c93460e1dbe04f547ab527',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/RU.js': {
        sha1sum: 'bdea104337faf69affcc06fb88416b3cd3d59816',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/SV.js': {
        sha1sum: 'f96dc7879b0061a8157c90a1abc4c188b43058e8',
    },
    'https://orteil.dashnet.org/cookieclicker/loc/ZH-CN.js': {
        sha1sum: 'c1e720f7849cef43316972975aca088a776c4a81',
    },

    'https://orteil.dashnet.org/cookieclicker/snd/buy1.mp3': {
        sha1sum: '0ae4ab7ef4ba7faca25ab994a3f90b40e1b1e4e9',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/buy2.mp3': {
        sha1sum: '24332e79a11ddd3cacb8255ff03fdf00c050877c',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/buy3.mp3': {
        sha1sum: '241ee229ef10dd9bfe977ba859983880b13a9fd1',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/buy4.mp3': {
        sha1sum: '0bc3eadda7bae43ed4d5a858c54a3c3503d8850a',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/cashIn2.mp3': {
        sha1sum: '7cdfcf584e1a5810d4e84d35904611356777bfc6',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/cashIn.mp3': {
        sha1sum: '48c931ff8737e853b9a27fcb74f51528d52f2a29',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/cashOut.mp3': {
        sha1sum: 'dbc73e1af704495eea18ff6a037e8059d7347fde',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/charging.mp3': {
        sha1sum: '902cbcc5b2e5fc9e9dcbedc4eaffd4ee0d2cddb9',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/chime.mp3': {
        sha1sum: 'd7f5a9978f5d238adafe49661a5fef7ee5aa3c01',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/choir.mp3': {
        sha1sum: 'eeba5a6e8d89307e229b9a76006a98fd358379ae',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/click1.mp3': {
        sha1sum: '5765a54921a0bee9a659507cd372afde63317b05',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/click2.mp3': {
        sha1sum: '2fe02c1fc3b8c7a0362f7113ddfe1c15c863e539',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/click3.mp3': {
        sha1sum: '73d13340d6e37be593fae859a0edc3648cc5995a',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/click4.mp3': {
        sha1sum: '9fbcc284d712a7cfce81e5cbc08d560cbade2c00',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/click5.mp3': {
        sha1sum: '538774a6085d94b06d416c0f2de46de85f8e1c52',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/click6.mp3': {
        sha1sum: 'ed70379cac14c05363d203b70a2d721c9d64ef1e',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/click7.mp3': {
        sha1sum: 'b4a986f9c60f46e3fcb55e977b3257884b50bd77',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickb1.mp3': {
        sha1sum: '3352c547cca5ec6156cbf27af315ee0ea1d08a12',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickb2.mp3': {
        sha1sum: '6b097ec383d1a1acbce99878f7668b38d7a6a158',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickb3.mp3': {
        sha1sum: 'b9cfa06af64a32d59cc1bb0d3e2f47848d8d534a',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickb4.mp3': {
        sha1sum: '6edca36bdda00af949cb14153447c3e835cae169',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickb5.mp3': {
        sha1sum: '5fb07f83be38381ca58fedffb24b0558d07614e1',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickb6.mp3': {
        sha1sum: '06d5f4a6c7c95d25a34acfea6eb13c0cfe1d193e',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickb7.mp3': {
        sha1sum: 'e382da51725660daff79019d8c1fb22d01084daf',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickOff.mp3': {
        sha1sum: 'c1cb0ea18179ee89a2c18c2e9210ac8a669dafbc',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickOff2.mp3': {
        sha1sum: '7b958b538236cf1b77804ddf9ca39012f12ce9f4',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickOn.mp3': {
        sha1sum: '362a8bd371aaaf2e4acbf15d771cf73b9d6cf5ee',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/clickOn2.mp3': {
        sha1sum: 'b3d330eb8e0e7b0905913e477965a01ffc86c226',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/cymbalRev.mp3': {
        sha1sum: 'f8710383ff8b7a54a901aadc85cff96044166aec',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/fortune.mp3': {
        sha1sum: '57fde832d7883ba4d01725a164d9baa51f09d6aa',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/freezeGarden.mp3': {
        sha1sum: '1248413351535305687de63927a15f2d4f02bbc0',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/giftSend.mp3': {
        sha1sum: 'bcadcc5a0618a3d505e001409e1fda9f887ee6e6',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/growl.mp3': {
        sha1sum: 'bd41918380071c78319c64e48788aac24ea6ce59',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/harvest1.mp3': {
        sha1sum: 'e15c14d740f1a5703d1994f0c533f0eee4554244',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/harvest2.mp3': {
        sha1sum: '4eec1176d07bdba5d32c49d306814c4619a30c5d',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/harvest3.mp3': {
        sha1sum: '3425fe6e3f68f6baa9105ce1f0b3f2b7c4c4beb0',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/jingleClick.mp3': {
        sha1sum: '9cf12b41e62b53e6a66d53b10ae40f9cd772ca12',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/jingle.mp3': {
        sha1sum: 'fd78e9af732ff80e3fdc8c09460f015507366cfa',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/pop1.mp3': {
        sha1sum: '5b5be99a545a840a87eca20237b3e2683a704950',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/pop2.mp3': {
        sha1sum: 'b9043bba0ae14f4e8201a0d7cb16a6ab5a5d5ecd',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/pop3.mp3': {
        sha1sum: 'db3fd7cdc3053275f44558bf1bbb64f803b6a5bf',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/press.mp3': {
        sha1sum: 'dc6784154ae5930b47d133f0703d97679ae6762e',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/sell1.mp3': {
        sha1sum: '4619fdbd2dc00497c58df7d6c5e3d188c2c22893',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/sell2.mp3': {
        sha1sum: '4850edf3b4d561aa92ace3631b365198c74c6d4f',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/sell3.mp3': {
        sha1sum: 'ac76b78432e5b84116ccc367ead820f38dcdcb5b',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/sell4.mp3': {
        sha1sum: 'd4bca20d3edd46226c457ade661b39e650116a8d',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/shimmerClick.mp3': {
        sha1sum: 'b774b41204d32f4c4e454e237768929dd1f5bf9c',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/smallTick.mp3': {
        sha1sum: '867cde2eca97571aa705eda3d8feeed23d034b58',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/spellFail.mp3': {
        sha1sum: '725af393398fb87b65e783b1b44b4e1f263d6f67',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/spell.mp3': {
        sha1sum: 'dd542206986f9bde6e512b8d322d864befa3396c',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/spirit.mp3': {
        sha1sum: 'f0521e08b79a9da5f3c9edcf5442067317b0f00b',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/squeak1.mp3': {
        sha1sum: 'e1df0581db97944273af148bb45a38c64863388b',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/squeak2.mp3': {
        sha1sum: '684510f126191345e69231d3cfe939e8b4db1cfe',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/squeak3.mp3': {
        sha1sum: 'b7c77fb790df16c9ef89e064640fc80d4df77f66',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/squeak4.mp3': {
        sha1sum: 'e0504b767085ebcbd0040d51dbc8c0d5199fea04',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/squish1.mp3': {
        sha1sum: '64abb99313b9a931f4af18bccba808568d943cdb',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/squish2.mp3': {
        sha1sum: 'e18697c5e91bb00d0d06a9b86f65bc09ba8afbd0',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/squish3.mp3': {
        sha1sum: 'dbee3564d7562f74aa88e14de49158e60e28d726',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/squish4.mp3': {
        sha1sum: 'bf21d28db2cd9c38f22957986c9c38ec3e412aba',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/thud.mp3': {
        sha1sum: 'f83b1a632093764f25d54d626ab5b3b22cb10d5f',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/tick.mp3': {
        sha1sum: 'b7971e9ac09e4321b3b92016ef671bfa192bea78',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/tickOff.mp3': {
        sha1sum: 'baaec432bd665047f9c513cf091d26ff7af80c9d',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/tillb1.mp3': {
        sha1sum: '594bf6d7e6e7da6bfc3e6bd72656590ab2efa7b8',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/tillb2.mp3': {
        sha1sum: '15c53c3697d11303e57ca832685e178bb2365242',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/tillb3.mp3': {
        sha1sum: '16c5aedaed8f68b205d262e05bab22f03bafe4d5',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/toneTick.mp3': {
        sha1sum: '11eca0c5e752ebf37a8a9bb53d2c3cdd51bba416',
    },
    'https://orteil.dashnet.org/cookieclicker/snd/upgrade.mp3': {
        sha1sum: '8666235bb8f0c4e4c89391086dc826a2480789fd',
    },

    'https://orteil.dashnet.org/cf-fonts/s/merriweather/5.0.11/cyrillic-ext/900/normal.woff2': {
        sha1sum: 'e1c5f56c5277bd6b904cbcb3a1ff147775727bee',
    },
    'https://orteil.dashnet.org/cf-fonts/s/merriweather/5.0.11/cyrillic/900/normal.woff2': {
        sha1sum: 'a1a40d8b0f89513f2862f3ba1c73ad6a2551a02b',
    },
    'https://orteil.dashnet.org/cf-fonts/s/merriweather/5.0.11/latin-ext/900/normal.woff2': {
        sha1sum: '8cd38337376b8b3db56925f2c66e0a9ea9bad9cd',
    },
    'https://orteil.dashnet.org/cf-fonts/s/merriweather/5.0.11/latin/900/normal.woff2': {
        sha1sum: '30864aa2e6ed42947180a3dcf8d8b30d51ed6de7',
    },
    'https://orteil.dashnet.org/cf-fonts/s/merriweather/5.0.11/vietnamese/900/normal.woff2': {
        sha1sum: '38006c12492d186134242f89e7666419da2b1a61',
    },

    'https://orteil.dashnet.org/cookieconsent.css': {
        sha1sum: '5497fd31ea49946cc1764fe7b7e4fe7af1daa1bc',
    },
    'https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.9/cookieconsent.min.js': {
        sha1sum: 'b4cdc1702e78dccbba3327dfe53341d5f7540dea',
    },
};

export const liveURLsToDrop: DropURLList = [
    'https://app-cdn.playsaurus.com',
    'https://connect.facebook.net',
    'https://orteil.dashnet.org/cdn-cgi/challenge-platform/',
    'https://pagead2.googlesyndication.com',
    'https://playsaurusstats.com',
    'https://serve.app.playsaurus.com',
    'https://static.cloudflareinsights.com',
    'https://www.facebook.com',
];
