// uiStrings.js — כל הטקסטים בעברית (עם ניקוד)

const UI = {
  // כללי
  gameName: 'מֵרוֹץ הַכּוֹכָבִים',
  loading: 'טוֹעֵן...',

  // תפריט ראשי
  menu: {
    startRace: 'הַתְחֵל מֵרוֹץ!',
    continueRace: 'הַמְשֵׁך מִשְׂחָק',
    newGame: 'מִשְׂחָק חָדָשׁ',
    myCollection: 'הָאוֹסֶף שֶׁלִּי',
    settings: 'הַגְדָּרוֹת',
    howToPlay: 'אֵיךְ מְשַׂחֲקִים?',
    resetAll: 'אַפֵּס הַכֹּל',
    resetConfirm: 'לִמְחֹק אֶת כָּל הָהִתְקַדְּמוּת, הָאוֹסֶף וְהַנִּקּוּד?',
    resetDone: 'הַכֹּל נִמְחַק!',
  },

  // מסך הגדרות
  setup: {
    enterName: 'מַה הַשֵּׁם שֶׁלְּךָ?',
    namePlaceholder: 'הַכְנֵס שֵׁם...',
    chooseColor: 'בְּחַר צֶבַע חֲלָלִית:',
    chooseLevel: 'בְּחַר כִּתָּה:',
    grade1: 'כִּתָּה א\'',
    grade2: 'כִּתָּה ב\'',
    grade3: 'כִּתָּה ג\'',
    startButton: 'קָדִימָה לַמֵּרוֹץ!',
    nameRequired: 'צָרִיךְ לְהַכְנִיס שֵׁם!',
    chooseMode: 'בְּחַר מַצָּב מִשְׂחָק:',
    modePractice: 'תִּרְגּוּל',
    modePracticeDesc: 'בְּחַר בְּעַצְמְךָ אֵיזוֹ חִידָה לְתַרְגֵּל',
    modeCompetition: 'תַּחֲרוּת',
    modeCompetitionDesc: 'הַמַּעֲרֶכֶת בּוֹחֶרֶת — נִקּוּד עוֹלָמִי!',
  },

  // מירוץ
  race: {
    station: 'תַּחֲנָה',
    of: 'מִתּוֹךְ',
    score: 'נִקּוּד',
    position: 'מָקוֹם',
    go: '!קָדִימָה',
    countdown3: '3',
    countdown2: '2',
    countdown1: '1',
    boost: 'בּוּסְט!',
    getReady: 'הִתְכּוֹנְנוּ!',
    raceStart: 'זוּוּוּז!',
  },

  // תחנה
  station: {
    title: 'תַּחֲנַת חָלָל',
    choosePuzzle: 'בְּחַר חִידָה:',
    puzzlesLeft: 'חִידוֹת נוֹתְרוּ:',
    stationOf: 'תַּחֲנָה {current} מִתּוֹךְ {total}',
    locked: 'נָעוּל',
    notAvailable: 'לֹא זָמִין בְּכִתָּה זוֹ',
    autoSelected: 'הַחִידָה הַבָּאָה:',
  },

  // חידות
  puzzle: {
    addition: 'חִיבּוּר',
    subtraction: 'חִיסּוּר',
    multiplication: 'כֶּפֶל',
    comparison: 'הַשְׁוָאָה',
    sequence: 'סִדְרוֹת',
    words: 'מִלִּים',
    timeLeft: 'זְמַן נוֹתָר',
    correct: 'תְּשׁוּבָה נְכוֹנָה! 🌟',
    wrong: 'לֹא נָכוֹן, נַסֶּה שׁוּב!',
    timeout: 'נִגְמַר הַזְּמַן!',
    whichBigger: 'מִי גָּדוֹל יוֹתֵר?',
    whichSmaller: 'מִי קָטָן יוֹתֵר?',
    whatNext: 'מָה הַמִּסְפָּר הַבָּא?',
    fillMissing: 'הַשְׁלֵם אֶת הָאוֹת הַחֲסֵרָה:',
    chooseCorrectWord: 'בְּחַר אֶת הַמִּלָּה הַנְּכוֹנָה:',
  },

  // תוצאות
  results: {
    title: 'סִיּוּם הַמֵּרוֹץ!',
    yourPlace: 'סִיַּמְתָּ בַּמָּקוֹם',
    first: 'רִאשׁוֹן! 🏆',
    second: 'שֵׁנִי! 🥈',
    third: 'שְׁלִישִׁי! 🥉',
    score: 'נִקּוּד סוֹפִי',
    accuracy: 'דִּיּוּק',
    avgTime: 'זְמַן מְמֻצָּע',
    longestStreak: 'רֶצֶף הֲכִי אָרֹךְ',
    medals: 'מְדָלְיוֹת',
    gold: 'זָהָב',
    silver: 'כֶּסֶף',
    bronze: 'אָרָד',
    newAliens: 'חַיְזָרִים חֲדָשִׁים!',
    noNewAliens: 'אֵין חַיְזָרִים חֲדָשִׁים הַפַּעַם',
    playAgain: 'שַׂחֵק שׁוּב!',
    backToMenu: 'חֲזוֹר לַתַּפְרִיט',
    greatJob: 'כָּל הַכָּבוֹד!',
    tryHarder: 'בַּפַּעַם הַבָּאָה יִהְיֶה יוֹתֵר טוֹב!',
  },

  // אוסף
  collection: {
    title: 'הָאוֹסֶף שֶׁלִּי',
    aliens: 'חַיְזָרִים',
    collected: 'נֶאֶסְפוּ',
    of: 'מִתּוֹךְ',
    locked: '🔒',
    back: 'חֲזָרָה',
  },

  // טבלת שיאים
  leaderboard: {
    title: 'טַבְלַת שִׂיאִים',
    button: 'טַבְלַת שִׂיאִים',
    rank: 'דֵּרוּג',
    player: 'שַׂחְקָן',
    score: 'נִקּוּד',
    level: 'כִּתָּה',
    date: 'תַּאֲרִיךְ',
    noScores: 'אֵין שִׂיאִים עֲדַיִן — לֵךְ לְשַׂחֵק!',
    tabLocal: 'הַנִּקּוּד שֶׁלִּי',
    tabGlobal: '🌍 עוֹלָמִי',
    globalLoading: 'טוֹעֵן שִׂיאִים עוֹלָמִיִּים...',
    globalError: 'לֹא נִמְצְאוּ שִׂיאִים — בְּדֹק חִיבּוּר לָאִינְטֶרְנֶט',
    globalNotConfigured: 'לוּחַ הַשִּׂיאִים הַגְּלוֹבָּלִי אֵינוֹ מוּגְדָּר עֲדַיִן.',
    globalSubmitted: '✅ הַנִּקּוּד נִשְׁמַר בַּלּוּחַ הַגְּלוֹבָּלִי!',
    globalSubmitFailed: '⚠️ לֹא הַצְלַחְנוּ לִשְׁמוֹר בַּלּוּחַ הַגְּלוֹבָּלִי.',
    gradeAll: 'הַכֹּל',
    gradeFilter: 'סִנּוּן כִּתָּה:',
  },

  // שונות
  misc: {
    sound: 'סָאוּנְד',
    soundOn: 'סָאוּנְד פּוֹעֵל',
    soundOff: 'סָאוּנְד כָּבוּי',
    pause: 'הַשְׁהֵה',
    resume: 'הַמְשֵׁךְ',
    quit: 'יְצִיאָה',
    yes: 'כֵּן',
    no: 'לֹא',
    ok: 'אִישׁוּר',
    areYouSure: 'בָּטוּחַ?',
  },

  // תגים
  badges: {
    additionKing: 'מֶלֶךְ הַחִיבּוּר',
    subtractionStar: 'כּוֹכַב הַחִיסּוּר',
    multiplicationHero: 'גִּיבּוֹר הַכֶּפֶל',
    speedDemon: 'בָּרָק הַמְּהִירוּת',
    perfectScore: 'נִקּוּד מֻשְׁלָם',
    collector: 'אַסְפָן חַיְזָרִים',
    streakMaster: 'אַלּוּף הָרְצָפִים',
  },
};

export default UI;
