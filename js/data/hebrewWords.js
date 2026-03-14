// hebrewWords.js — בנק מילים עבריות לתרגילים (עם ניקוד)

const HEBREW_WORDS = {
  easy: [
    // כיתה א' — מילים פשוטות (3-4 אותיות)
    { word: 'בַּיִת', hint: 'מָקוֹם שֶׁגָּרִים בּוֹ', category: 'מְקוֹמוֹת' },
    { word: 'יֶלֶד', hint: 'בֵּן קָטָן', category: 'אֲנָשִׁים' },
    { word: 'שֶׁמֶשׁ', hint: 'מְאִירָה בַּיּוֹם', category: 'טֶבַע' },
    { word: 'כּוֹכָב', hint: 'מֵאִיר בַּלַּיְלָה', category: 'חָלָל' },
    { word: 'יָרֵחַ', hint: 'נִרְאֶה בַּלַּיְלָה', category: 'חָלָל' },
    { word: 'סֵפֶר', hint: 'קוֹרְאִים אוֹתוֹ', category: 'חֲפָצִים' },
    { word: 'דָּג', hint: 'חַי בַּמַּיִם', category: 'חַיּוֹת' },
    { word: 'חָתוּל', hint: 'מְיָאוּ', category: 'חַיּוֹת' },
    { word: 'כֶּלֶב', hint: 'הַאוּ הַאוּ', category: 'חַיּוֹת' },
    { word: 'פֶּרַח', hint: 'גָּדֵל בַּגִּינָה', category: 'טֶבַע' },
    { word: 'עֵץ', hint: 'גָּבוֹהַּ וְיָרֹק', category: 'טֶבַע' },
    { word: 'גֶּשֶׁם', hint: 'יוֹרֵד מֵהַשָּׁמַיִם', category: 'טֶבַע' },
    { word: 'יָם', hint: 'מַיִם כְּחוּלִים גְּדוֹלִים', category: 'טֶבַע' },
    { word: 'דֶּלֶת', hint: 'נִכְנָסִים דַּרְכָּהּ', category: 'חֲפָצִים' },
    { word: 'חַלּוֹן', hint: 'רוֹאִים דַּרְכּוֹ', category: 'חֲפָצִים' },
    { word: 'אַבָּא', hint: 'הוֹרֶה', category: 'מִשְׁפָּחָה' },
    { word: 'אִמָּא', hint: 'הוֹרָה', category: 'מִשְׁפָּחָה' },
    { word: 'יָד', hint: 'חֵלֶק בַּגּוּף', category: 'גּוּף' },
    { word: 'רֶגֶל', hint: 'הוֹלְכִים אִיתָּהּ', category: 'גּוּף' },
    { word: 'עַיִן', hint: 'רוֹאִים אִיתָּהּ', category: 'גּוּף' },
    { word: 'אַף', hint: 'מְרִיחִים אִיתּוֹ', category: 'גּוּף' },
    { word: 'פֶּה', hint: 'אוֹכְלִים אִיתּוֹ', category: 'גּוּף' },
    { word: 'לֵב', hint: 'דוֹפֵק בַּגּוּף', category: 'גּוּף' },
    { word: 'גַּן', hint: 'מְשַׂחֲקִים בּוֹ', category: 'מְקוֹמוֹת' },
    { word: 'כַּדּוּר', hint: 'מְשַׂחֲקִים אִיתּוֹ', category: 'חֲפָצִים' },
    { word: 'שֶׁלֶג', hint: 'לָבָן וְקַר', category: 'טֶבַע' },
    { word: 'רוּחַ', hint: 'נוֹשֶׁבֶת בַּחוּץ', category: 'טֶבַע' },
    { word: 'צִיפּוֹר', hint: 'עָפָה בַּשָּׁמַיִם', category: 'חַיּוֹת' },
    { word: 'דְּבַשׁ', hint: 'מָתוֹק', category: 'אוֹכֶל' },
    { word: 'לֶחֶם', hint: 'אוֹכְלִים אוֹתוֹ', category: 'אוֹכֶל' },
  ],
  medium: [
    // כיתה ב' — מילים בינוניות (4-5 אותיות)
    { word: 'חֲלָלִית', hint: 'טָסָה בַּחָלָל', category: 'חָלָל' },
    { word: 'מָטוֹס', hint: 'טָס בַּשָּׁמַיִם', category: 'כְּלֵי תַּחְבּוּרָה' },
    { word: 'מַחְשֵׁב', hint: 'עוֹבְדִים וּמְשַׂחֲקִים בּוֹ', category: 'טֶכְנוֹלוֹגְיָה' },
    { word: 'סְפִינָה', hint: 'שָׁטָה עַל הַמַּיִם', category: 'כְּלֵי תַּחְבּוּרָה' },
    { word: 'טִילוֹן', hint: 'טָס מַהֵר לַחָלָל', category: 'חָלָל' },
    { word: 'כַּדּוּרֶגֶל', hint: 'מִשְׂחָק עִם כַּדּוּר', category: 'סְפּוֹרְט' },
    { word: 'תַּפּוּחַ', hint: 'פְּרִי אָדֹם אוֹ יָרֹק', category: 'אוֹכֶל' },
    { word: 'בָּנָנָה', hint: 'פְּרִי צָהֹב', category: 'אוֹכֶל' },
    { word: 'מוֹרָה', hint: 'מְלַמֵּד בְּבֵית סֵפֶר', category: 'אֲנָשִׁים' },
    { word: 'תַּלְמִיד', hint: 'לוֹמֵד בְּבֵית סֵפֶר', category: 'אֲנָשִׁים' },
    { word: 'חָבֵר', hint: 'מְשַׂחֲקִים אִיתּוֹ', category: 'אֲנָשִׁים' },
    { word: 'אַרְנָב', hint: 'חַיָּה עִם אוֹזְנַיִם אֲרוּכּוֹת', category: 'חַיּוֹת' },
    { word: 'פַּרְפַּר', hint: 'עָף עִם כְּנָפַיִם צִבְעוֹנִיּוֹת', category: 'חַיּוֹת' },
    { word: 'דּוֹלְפִין', hint: 'חַי בַּיָּם וּמְאֹד חָכָם', category: 'חַיּוֹת' },
    { word: 'מְכוֹנִית', hint: 'נוֹסְעִים בָּהּ עַל הַכְּבִישׁ', category: 'כְּלֵי תַּחְבּוּרָה' },
    { word: 'רַכֶּבֶת', hint: 'נוֹסַעַת עַל פַּסִּים', category: 'כְּלֵי תַּחְבּוּרָה' },
    { word: 'מִטְרִיָּה', hint: 'מְגִינָה מִגֶּשֶׁם', category: 'חֲפָצִים' },
    { word: 'שָׁעוֹן', hint: 'מַרְאֶה אֶת הַשָּׁעָה', category: 'חֲפָצִים' },
    { word: 'טֶלֶפוֹן', hint: 'מְדַבְּרִים בּוֹ', category: 'טֶכְנוֹלוֹגְיָה' },
    { word: 'שוּלְחָן', hint: 'יוֹשְׁבִים לְיָדוֹ', category: 'חֲפָצִים' },
    { word: 'מִסְגֶּרֶת', hint: 'שָׂמִים בָּהּ תְּמוּנָה', category: 'חֲפָצִים' },
    { word: 'גַּלְגַּל', hint: 'עָגֹל וּמִסְתּוֹבֵב', category: 'חֲפָצִים' },
    { word: 'קֶשֶׁת', hint: 'צִבְעוֹנִית בַּשָּׁמַיִם אַחֲרֵי גֶּשֶׁם', category: 'טֶבַע' },
    { word: 'הַר', hint: 'גָּבוֹהַּ מְאֹד', category: 'טֶבַע' },
    { word: 'נָהָר', hint: 'מַיִם שֶׁזּוֹרְמִים', category: 'טֶבַע' },
  ],
  hard: [
    // כיתה ג' — מילים מורכבות
    { word: 'אַסְטְרוֹנָאוּט', hint: 'אָדָם שֶׁטָּס לַחָלָל', category: 'חָלָל' },
    { word: 'טֶלֶסְקוֹפּ', hint: 'מַכְשִׁיר לְהִסְתַּכֵּל עַל כּוֹכָבִים', category: 'חָלָל' },
    { word: 'גָּלַקְסְיָה', hint: 'אוֹסֶף עָנָק שֶׁל כּוֹכָבִים', category: 'חָלָל' },
    { word: 'פְּלָנֶטָה', hint: 'כּוֹכַב לֶכֶת', category: 'חָלָל' },
    { word: 'לַוְיָן', hint: 'סוֹבֵב אֶת כַּדּוּר הָאָרֶץ', category: 'חָלָל' },
    { word: 'אַטְמוֹסְפֶרָה', hint: 'הָאֲוִיר סְבִיב כַּדּוּר הָאָרֶץ', category: 'מַדָּע' },
    { word: 'כְּבִידָה', hint: 'כֹּחַ שֶׁמּוֹשֵׁךְ אוֹתָנוּ לַקַּרְקַע', category: 'מַדָּע' },
    { word: 'מַעְבָּדָה', hint: 'עוֹשִׂים בָּהּ נִיסּוּיִים', category: 'מַדָּע' },
    { word: 'דִּינוֹזָאוּר', hint: 'חַיָּה עֲנָקִית שֶׁנִּכְחֲדָה', category: 'חַיּוֹת' },
    { word: 'מִיקְרוֹסְקוֹפּ', hint: 'מַגְדִּיל דְּבָרִים קְטַנִּים', category: 'מַדָּע' },
    { word: 'אוֹקְיָנוּס', hint: 'יָם עָנָק', category: 'טֶבַע' },
    { word: 'הַרְפַּתְקָה', hint: 'מַסָּע מְרַגֵּשׁ', category: 'כְּלָלִי' },
    { word: 'אֶנְצִיקְלוֹפֶּדְיָה', hint: 'סֵפֶר עִם מֵידָע רַב', category: 'כְּלָלִי' },
    { word: 'טֶכְנוֹלוֹגְיָה', hint: 'מַחְשְׁבִים וּמַכְשִׁירִים', category: 'טֶכְנוֹלוֹגְיָה' },
    { word: 'תִּקְשֹׁרֶת', hint: 'דְּרָכִים לְדַבֵּר וְלִשְׁמֹעַ', category: 'כְּלָלִי' },
    { word: 'מָתֵמָטִיקָה', hint: 'מִסְפָּרִים וְחִישׁוּבִים', category: 'לִימּוּדִים' },
    { word: 'גֵּאוֹגְרַפְיָה', hint: 'לוֹמְדִים עַל מְדִינוֹת וּמְקוֹמוֹת', category: 'לִימּוּדִים' },
    { word: 'אַקְלִים', hint: 'מֶזֶג הָאֲוִיר הַמְּמֻצָּע', category: 'טֶבַע' },
    { word: 'מִדְבָּר', hint: 'מָקוֹם חַם עִם חוֹל', category: 'טֶבַע' },
    { word: 'יַבֶּשֶׁת', hint: 'שֶׁטַח יַבָּשָׁה גָּדוֹל', category: 'טֶבַע' },
    { word: 'וּוּלְקָן', hint: 'הַר שֶׁמִּתְפָּרֵץ', category: 'טֶבַע' },
    { word: 'שַׁלְדָּג', hint: 'צִיפּוֹר צִבְעוֹנִית לְיַד מַיִם', category: 'חַיּוֹת' },
    { word: 'מַצְפֵּן', hint: 'מַרְאֶה אֵיפֹה צָפוֹן', category: 'חֲפָצִים' },
    { word: 'מְשֻׁוָּאָה', hint: 'תַּרְגִּיל עִם סִימַן שָׁוֶה', category: 'לִימּוּדִים' },
    { word: 'תַּצְפִּית', hint: 'הִסְתַּכְּלוּת מִלְמַעְלָה', category: 'כְּלָלִי' },
  ],
};

export default HEBREW_WORDS;

// Helper: get words by difficulty level
export function getWordsByLevel(level) {
  switch (level) {
    case 1: return HEBREW_WORDS.easy;
    case 2: return HEBREW_WORDS.medium;
    case 3: return HEBREW_WORDS.hard;
    default: return HEBREW_WORDS.easy;
  }
}

// Helper: get a random word
export function getRandomWord(level) {
  const words = getWordsByLevel(level);
  return words[Math.floor(Math.random() * words.length)];
}

// Helper: get all words from every level
export function getAllWords() {
  return [...HEBREW_WORDS.easy, ...HEBREW_WORDS.medium, ...HEBREW_WORDS.hard];
}
