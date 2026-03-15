// alienCollection.js — 20 חייזרים עם שמות עבריים (עם ניקוד)

const ALIENS = [
  {
    id: 1,
    name: 'זוֹהֲרִי',
    color: '#00ffff',
    bodyColor: '#00cccc',
    shape: 'round',
    eyes: 2,
    antenna: true,
    unlockCondition: 'first_correct',
    unlockDescription: 'עֲנֵה נָכוֹן עַל חִידָה רִאשׁוֹנָה',
    description: 'חַיְזָר קָטָן וְזוֹהֵר שֶׁאוֹהֵב מִסְפָּרִים',
  },
  {
    id: 2,
    name: 'נִיצְנוּץ',
    color: '#ff00ff',
    bodyColor: '#cc00cc',
    shape: 'star',
    eyes: 3,
    antenna: true,
    unlockCondition: '3_streak',
    unlockDescription: 'עֲנֵה נָכוֹן 3 פְּעָמִים בִּרְצִיפוּת',
    description: 'כּוֹכָב מְנַצְנֵץ שֶׁלֹּא מַפְסִיק לְחַיֵּךְ',
  },
  {
    id: 3,
    name: 'חִישְׁבּוֹן',
    color: '#39ff14',
    bodyColor: '#2ecc10',
    shape: 'square',
    eyes: 2,
    antenna: false,
    unlockCondition: '5_addition',
    unlockDescription: 'פְּתוֹר 5 תַּרְגִּילֵי חִיבּוּר',
    description: 'חַיְזָר מְרוּבָּע שֶׁאוֹהֵב חִיבּוּר',
  },
  {
    id: 4,
    name: 'כּוֹכָבִית',
    color: '#ffd700',
    bodyColor: '#ccac00',
    shape: 'star',
    eyes: 2,
    antenna: true,
    unlockCondition: 'score_200',
    unlockDescription: 'הַגִּיעַ לְ-200 נְקוּדּוֹת',
    description: 'כּוֹכָבִית זְהוּבָה שֶׁמְּאִירָה אֶת הַדֶּרֶךְ',
  },
  {
    id: 5,
    name: 'סַהֲרוֹן',
    color: '#c0c0ff',
    bodyColor: '#9090cc',
    shape: 'crescent',
    eyes: 1,
    antenna: false,
    unlockCondition: 'complete_station',
    unlockDescription: 'סַיֵּם תַּחֲנָה שְׁלֵמָה',
    description: 'חֲצִי יָרֵחַ חָמוּד שֶׁאוֹהֵב לַיְלָה',
  },
  {
    id: 6,
    name: 'מְהִירוֹן',
    color: '#ff6600',
    bodyColor: '#cc5200',
    shape: 'triangle',
    eyes: 2,
    antenna: true,
    unlockCondition: 'fast_answer',
    unlockDescription: 'עֲנֵה נָכוֹן תּוֹךְ 5 שְׁנִיּוֹת',
    description: 'חַיְזָר מָהִיר כְּמוֹ בָּרָק',
  },
  {
    id: 7,
    name: 'חַכְמוֹלִי',
    color: '#9966ff',
    bodyColor: '#7744cc',
    shape: 'round',
    eyes: 4,
    antenna: true,
    unlockCondition: '5_streak',
    unlockDescription: 'עֲנֵה נָכוֹן 5 פְּעָמִים בִּרְצִיפוּת',
    description: 'חַיְזָר עִם 4 עֵינַיִם שֶׁרוֹאֶה הַכֹּל',
  },
  {
    id: 8,
    name: 'פַּחְסָנִית',
    color: '#ff69b4',
    bodyColor: '#cc5490',
    shape: 'flat',
    eyes: 2,
    antenna: false,
    unlockCondition: '5_subtraction',
    unlockDescription: 'פְּתוֹר 5 תַּרְגִּילֵי חִיסּוּר',
    description: 'חַיְזָרִית שְׁטוּחָה וּמְתוּקָה',
  },
  {
    id: 9,
    name: 'בּוּעָתִי',
    color: '#00ff99',
    bodyColor: '#00cc7a',
    shape: 'round',
    eyes: 2,
    antenna: true,
    unlockCondition: 'win_race',
    unlockDescription: 'נַצֵּחַ בַּמֵּרוֹץ (מָקוֹם רִאשׁוֹן)',
    description: 'חַיְזָר עָגֹל כְּמוֹ בּוּעָה',
  },
  {
    id: 10,
    name: 'פִּיקְסֶל',
    color: '#ff0040',
    bodyColor: '#cc0033',
    shape: 'square',
    eyes: 2,
    antenna: false,
    unlockCondition: '3_multiplication',
    unlockDescription: 'פְּתוֹר 3 תַּרְגִּילֵי כֶּפֶל',
    description: 'חַיְזָר דִּיגִיטָלִי מְרוּבָּע',
  },
  {
    id: 11,
    name: 'שְׁבִיטוֹן',
    color: '#ffffff',
    bodyColor: '#cccccc',
    shape: 'comet',
    eyes: 2,
    antenna: true,
    unlockCondition: '10_correct',
    unlockDescription: 'עֲנֵה נָכוֹן עַל 10 חִידוֹת',
    description: 'שָׁבִיט קָטָן עִם זָנָב זוֹהֵר',
  },
  {
    id: 12,
    name: 'עֶנָנִי',
    color: '#87ceeb',
    bodyColor: '#6ba5bc',
    shape: 'cloud',
    eyes: 2,
    antenna: false,
    unlockCondition: 'perfect_station',
    unlockDescription: 'סַיֵּם תַּחֲנָה בְּלִי טְעוּיוֹת',
    description: 'חַיְזָר רַךְ כְּמוֹ עָנָן',
  },
  {
    id: 13,
    name: 'גָּלַקְסִי',
    color: '#ff00ff',
    bodyColor: '#9900ff',
    shape: 'spiral',
    eyes: 3,
    antenna: true,
    unlockCondition: 'score_500',
    unlockDescription: 'הַגִּיעַ לְ-500 נְקוּדּוֹת',
    description: 'חַיְזָר סְפִּירָלִי מִגָּלַקְסְיָה רְחוֹקָה',
  },
  {
    id: 14,
    name: 'קְרִינָה',
    color: '#ffff00',
    bodyColor: '#cccc00',
    shape: 'star',
    eyes: 2,
    antenna: true,
    unlockCondition: '5_comparison',
    unlockDescription: 'פְּתוֹר 5 תַּרְגִּילֵי הַשְׁוָאָה',
    description: 'כּוֹכֶבֶת שֶׁמֶשׁ קְטַנָּה וּמְאִירָה',
  },
  {
    id: 15,
    name: 'סַדְרָן',
    color: '#00ccff',
    bodyColor: '#009ecc',
    shape: 'diamond',
    eyes: 2,
    antenna: false,
    unlockCondition: '5_sequence',
    unlockDescription: 'פְּתוֹר 5 תַּרְגִּילֵי סִדְרוֹת',
    description: 'חַיְזָר שֶׁאוֹהֵב סֵדֶר',
  },
  {
    id: 16,
    name: 'אוֹתִיּוֹן',
    color: '#ff9900',
    bodyColor: '#cc7a00',
    shape: 'round',
    eyes: 2,
    antenna: true,
    unlockCondition: '5_words',
    unlockDescription: 'פְּתוֹר 5 תַּרְגִּילֵי מִלִּים',
    description: 'חַיְזָר שֶׁאוֹהֵב אוֹתִיּוֹת',
  },
  {
    id: 17,
    name: 'כְּפוֹלִי',
    color: '#66ff66',
    bodyColor: '#44cc44',
    shape: 'double',
    eyes: 4,
    antenna: true,
    unlockCondition: '7_streak',
    unlockDescription: 'עֲנֵה נָכוֹן 7 פְּעָמִים בִּרְצִיפוּת',
    description: 'חַיְזָר כָּפוּל — שְׁנַיִם בְּבַת אַחַת!',
  },
  {
    id: 18,
    name: 'נוֹבָה',
    color: '#ff3366',
    bodyColor: '#cc2952',
    shape: 'burst',
    eyes: 2,
    antenna: false,
    unlockCondition: 'score_1000',
    unlockDescription: 'הַגִּיעַ לְ-1000 נְקוּדּוֹת',
    description: 'פִּיצּוּץ שֶׁל צְבָעִים וָאוֹר',
  },
  {
    id: 19,
    name: 'טַבַּעְתִּי',
    color: '#cc99ff',
    bodyColor: '#9966cc',
    shape: 'ring',
    eyes: 2,
    antenna: true,
    unlockCondition: '15_correct',
    unlockDescription: 'עֲנֵה נָכוֹן עַל כָּל 15 הַחִידוֹת בַּמִּשְׂחָק',
    description: 'חַיְזָר עִם טַבַּעוֹת כְּמוֹ שַׁבְּתַאי',
  },
  {
    id: 20,
    name: 'אַלּוּפִי',
    color: '#ffd700',
    bodyColor: '#ffaa00',
    shape: 'trophy',
    eyes: 2,
    antenna: true,
    unlockCondition: 'collect_15',
    unlockDescription: 'אֱסוֹף 15 חַיְזָרִים אֲחֵרִים',
    description: 'הַחַיְזָר הַנָּדִיר בְּיוֹתֵר — רַק לָאַלּוּפִים!',
  },
];

export default ALIENS;

// Helper: check if an alien should be unlocked based on game state
export function checkAlienUnlock(alien, gameState, extras = {}) {
  const h = gameState.puzzleHistory || [];
  const condition = alien.unlockCondition;

  switch (condition) {
    case 'first_correct':
      return h.some(p => p.correct);

    case '3_streak':
      return gameState.streak >= 3 || getLongestStreak(h) >= 3;

    case '5_streak':
      return gameState.streak >= 5 || getLongestStreak(h) >= 5;

    case '7_streak':
      return gameState.streak >= 7 || getLongestStreak(h) >= 7;

    case '5_addition':
      return h.filter(p => p.type === 'addition' && p.correct).length >= 5;

    case '5_subtraction':
      return h.filter(p => p.type === 'subtraction' && p.correct).length >= 5;

    case '3_multiplication':
      return h.filter(p => p.type === 'multiplication' && p.correct).length >= 3;

    case '5_comparison':
      return h.filter(p => p.type === 'comparison' && p.correct).length >= 5;

    case '5_sequence':
      return h.filter(p => p.type === 'sequence' && p.correct).length >= 5;

    case '5_words':
      return h.filter(p => p.type === 'words' && p.correct).length >= 5;

    case 'score_200':
      return (gameState.score || 0) >= 200;

    case '15_correct':
      return h.filter(p => p.correct).length >= 15;

    case 'complete_station':
      return gameState.currentStation > 1 || gameState.currentStationPuzzlesCompleted >= 3;

    case 'perfect_station':
      // Check if any 3 consecutive puzzles are all correct
      for (let i = 0; i <= h.length - 3; i++) {
        if (h[i].correct && h[i + 1].correct && h[i + 2].correct) return true;
      }
      return false;

    case 'fast_answer':
      return h.some(p => p.correct && p.timeMs < 5000);

    case 'win_race':
      return extras.racePosition === 1;

    case '10_correct':
      return h.filter(p => p.correct).length >= 10;

    case 'score_500':
      return (gameState.score || 0) >= 500;

    case 'score_1000':
      return (gameState.score || 0) >= 1000;

    case 'collect_15':
      return (gameState.aliensCollected || []).length >= 15;

    default:
      return false;
  }
}

function getLongestStreak(history) {
  let max = 0;
  let current = 0;
  for (const p of history) {
    if (p.correct) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }
  return max;
}
