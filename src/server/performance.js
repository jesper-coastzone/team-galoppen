/*
 * performance.js — hest/jockey-point → niveauer → terning + værdi.
 * Hesten løfter topniveauet (diceMax). Jockeyen løfter bundniveauet (diceMin).
 */
const cfg = require('../../config/gameConfig');
const gs = require('./gameState');

function levelForPoints(points, thresholds, maxLevel) {
  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (points >= thresholds[i]) level = i + 1;
  }
  return Math.min(level, maxLevel);
}

// Tilføj point og opgradér niveau + værdi hvis en tærskel krydses.
function addPerformancePoints(game, team, which, points) {
  if (which === 'horse') {
    team.horsePerformancePoints += points;
    const newLevel = levelForPoints(team.horsePerformancePoints, cfg.horseLevelThresholds, cfg.maxHorseLevel);
    applyLevelChange(game, team, 'horse', newLevel);
  } else {
    team.jockeyPerformancePoints += points;
    const newLevel = levelForPoints(team.jockeyPerformancePoints, cfg.jockeyLevelThresholds, cfg.maxJockeyLevel);
    applyLevelChange(game, team, 'jockey', newLevel);
  }
}

function applyLevelChange(game, team, which, newLevel) {
  if (which === 'horse') {
    while (team.horseLevel < newLevel) {
      team.horseLevel += 1;
      team.horseValue += cfg.horseValuePerLevel;
      gs.logEvent(game, `${team.stableName}: hesten nåede niveau ${team.horseLevel}.`);
    }
  } else {
    while (team.jockeyLevel < newLevel) {
      team.jockeyLevel += 1;
      team.jockeyValue += cfg.jockeyValuePerLevel;
      gs.logEvent(game, `${team.stableName}: jockeyen nåede niveau ${team.jockeyLevel}.`);
    }
  }
}

// Resultatniveau (pass/bronze/silver/gold) → point, ud fra øvelsens tærskler.
function resultLevelToPoints(level) {
  return cfg.performancePoints[level] || 0;
}

// Beregn resultatniveau ud fra en talværdi og øvelsens thresholds.
function scoreToLevel(exercise, value) {
  const t = exercise.thresholds;
  if (!t) return null;
  const order = ['gold', 'silver', 'bronze', 'pass'];
  if (exercise.lowerIsBetter) {
    // lavere tid er bedre: gold har laveste tærskel
    for (const lvl of order) if (value <= t[lvl]) return lvl;
    return null; // dårligere end pass
  }
  for (const lvl of order) if (value >= t[lvl]) return lvl;
  return null;
}

module.exports = { addPerformancePoints, resultLevelToPoints, scoreToLevel, levelForPoints };
