/*
 * gameConfig.js — ÉN kilde til sandhed for al spilbalance.
 * Alle tal her kan justeres uden at røre spillogik eller UI.
 * Beløb er i Staldollars (SD).
 */

const gameConfig = {
  // ---- Valuta ----
  currencyName: 'Staldollars',
  currencyAbbr: 'SD',

  // ---- Startværdier ----
  startCash: 0,                 // før warm-up (teams starter uden kontanter)
  warmupReward: 5000,           // udbetales til ALLE efter warm-up race
  baseHorseValue: 1000,
  baseJockeyValue: 1000,
  baseStableValue: 1000,

  // ---- Spilstruktur (default; kan overrides ved oprettelse) ----
  defaults: {
    numTeams: 6,
    totalRounds: 2,
    roundLengthSeconds: 20 * 60,
    includeWarmup: true,
    auctionLengthSeconds: 3 * 60,
  },

  maxTeams: 12,

  // ---- Race ----
  raceTrackLength: 30,
  normalRaceRolls: 4,
  finalRaceRolls: 5,
  diceBaseMin: 2,               // diceMin = diceBaseMin + jockeyLevel
  diceBaseMax: 5,               // diceMax = diceBaseMax + horseLevel
  normalRacePrizes: { 1: 1200, 2: 900, 3: 700, 4: 500, default: 300 },
  finalRacePrizes: { 1: 3000, 2: 2400, 3: 1800, 4: 1200, default: 700 },

  // ---- Performance-point → niveauer ----
  // Antal point krævet for at nå niveau 1,2,3,4
  horseLevelThresholds: [3, 7, 12, 18],
  jockeyLevelThresholds: [3, 7, 12, 18],
  // Værdi lagt til hest/jockey pr. opnået niveau
  horseValuePerLevel: 400,
  jockeyValuePerLevel: 400,
  maxHorseLevel: 4,
  maxJockeyLevel: 4,

  // Point pr. resultatniveau i performance-øvelser
  performancePoints: { pass: 1, bronze: 2, silver: 3, gold: 5 },

  // ---- Investeringer (direkte køb) ----
  // valueIncrease = hvor meget aktivets værdi stiger. performancePoints = point til niveau.
  investmentOptions: {
    horse: [
      { id: 'horse-1', label: 'Bedre foder', cost: 1000, valueIncrease: 800, performancePoints: 2 },
      { id: 'horse-2', label: 'Elitetræning', cost: 2000, valueIncrease: 1700, performancePoints: 4 },
    ],
    jockey: [
      { id: 'jockey-1', label: 'Ridekursus', cost: 1000, valueIncrease: 800, performancePoints: 2 },
      { id: 'jockey-2', label: 'Mentaltræning', cost: 2000, valueIncrease: 1700, performancePoints: 4 },
    ],
    stable: [
      // Stald = sikker investering: værdi stiger MERE end prisen.
      { id: 'stable-1', label: 'Ny boks', cost: 1000, valueIncrease: 1200, performancePoints: 0 },
      { id: 'stable-2', label: 'Staldudvidelse', cost: 2000, valueIncrease: 2500, performancePoints: 0 },
    ],
  },

  // ---- Auktion ----
  auctionHouseExchangeRate: 0.5, // gebyr = 50% af oprindelig købspris ved bytte i auktionshus

  // ---- Cooldowns (sekunder) ----
  defaultCooldownSeconds: 300,   // 5 min for pengeopgaver
  auctionExerciseCooldownSeconds: 180, // 3 min for penge-auktionsøvelser

  // ---- Pengeopgaver (altid tilgængelige) ----
  moneyTasks: {
    tip13: {
      rewardPerCorrect: 100,     // 13/13 = 1300 SD
      cooldownSeconds: 300,
    },
    tidslinje: {
      rewardOnSuccess: 300,
      rewardOnFail: 0,
      cooldownSeconds: 300,
    },
    dyst: {
      rewardWinner: 500,
      rewardLoser: 0,            // kan sættes negativt for at tabe penge
      questionsPerDuel: 3,
      cooldownSeconds: 300,
    },
  },

  // ---- Puslespil / Derby-licens ----
  puzzle: {
    grantsDerbyLicense: true,
    rewardOnComplete: 500,       // bonus ved fuldført puslespil (kan sættes til 0)
    // Handicap hvis man kører finalen UDEN licens (færre rolls). 0 = intet handicap.
    noLicenseFinalRollPenalty: 1,
  },

  // ---- Kreative opgaver (host scorer manuelt) ----
  creative: {
    horseStyling: { label: 'Pynt jeres hest', maxBonus: 1500 },
    stableSign: { label: 'Design jeres staldskilt', maxBonus: 1500 },
    // Bonus gives som staldværdi (påvirker totalværdi men ikke kontanter).
    bonusAsStableValue: true,
  },
};

module.exports = gameConfig;
