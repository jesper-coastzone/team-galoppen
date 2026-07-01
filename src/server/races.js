/*
 * races.js — løbslogik.
 *  - terning: min = 2 + jockeyLevel, max = 5 + horseLevel
 *  - normal: 4 slag pr. hold · finale: 5 slag
 *  - tie-break: højeste sidste slag → højeste slagsum → delt placering
 */
const cfg = require('../../config/gameConfig');
const { uid, randomInt } = require('./util');
const gs = require('./gameState');
const econ = require('./economy');

function allowedRollsFor(game, team, type) {
  let rolls = type === 'final' ? cfg.finalRaceRolls : cfg.normalRaceRolls;
  if (type === 'final' && !team.derbyLicense) rolls -= cfg.puzzle.noLicenseFinalRollPenalty || 0;
  return Math.max(1, rolls);
}

function startRace(game, type, round) {
  const race = {
    id: uid('race'), type, round: round || game.currentRound,
    status: 'ready', rollingOpen: false,
    rollsPerTeam: type === 'final' ? cfg.finalRaceRolls : cfg.normalRaceRolls,
    positions: {}, rolls: {}, allowed: {}, results: null, prizesApplied: false,
  };
  for (const t of game.teams) {
    race.positions[t.id] = 0;
    race.rolls[t.id] = [];
    race.allowed[t.id] = allowedRollsFor(game, t, type);
    t.race = { position: 0, rolls: [], lastRoll: 0, rollSum: 0, done: false, hasRolled: false, allowed: race.allowed[t.id] };
  }
  game.races.push(race);
  game.currentRaceId = race.id;
  gs.logEvent(game, `${type === 'final' ? 'Finaleløb' : 'Løb'} startet (${race.rollsPerTeam} slag).`);
  return { ok: true, race };
}

function setRolling(game, open) {
  const race = gs.currentRace(game);
  if (!race) return { ok: false, error: 'Intet aktivt løb.' };
  race.rollingOpen = open;
  race.status = open ? 'running' : race.status;
  return { ok: true };
}

function rollForTeam(game, team) {
  const race = gs.currentRace(game);
  if (!race) return { ok: false, error: 'Intet aktivt løb.' };
  if (!race.rollingOpen) return { ok: false, error: 'Rolling er ikke åben endnu.' };
  const used = race.rolls[team.id].length;
  if (used >= race.allowed[team.id]) return { ok: false, error: 'I har brugt alle jeres slag.' };

  const min = cfg.diceBaseMin + team.jockeyLevel;
  const max = Math.max(cfg.diceBaseMax + team.horseLevel, min);
  const roll = randomInt(min, max);
  race.rolls[team.id].push(roll);
  race.positions[team.id] = Math.min(race.positions[team.id] + roll, cfg.raceTrackLength);

  const rr = race.rolls[team.id];
  team.race = {
    position: race.positions[team.id], rolls: rr.slice(),
    lastRoll: roll, rollSum: rr.reduce((a, b) => a + b, 0),
    done: rr.length >= race.allowed[team.id], hasRolled: true, allowed: race.allowed[team.id],
  };
  return { ok: true, roll, position: race.positions[team.id], done: team.race.done };
}

function allRolled(game) {
  const race = gs.currentRace(game);
  if (!race) return false;
  return game.teams.every((t) => race.rolls[t.id].length >= race.allowed[t.id]);
}

function prizeFor(place, type) {
  const table = type === 'final' ? cfg.finalRacePrizes : cfg.normalRacePrizes;
  return table[place] != null ? table[place] : table.default;
}

function finishRace(game) {
  const race = gs.currentRace(game);
  if (!race) return { ok: false, error: 'Intet aktivt løb.' };
  if (race.prizesApplied) return { ok: false, error: 'Løbet er allerede afsluttet.' };

  const ranked = game.teams.map((t) => {
    const rr = race.rolls[t.id];
    return {
      teamId: t.id, stableName: t.stableName,
      position: race.positions[t.id],
      lastRoll: rr.length ? rr[rr.length - 1] : 0,
      rollSum: rr.reduce((a, b) => a + b, 0),
    };
  }).sort((a, b) => b.position - a.position || b.lastRoll - a.lastRoll || b.rollSum - a.rollSum);

  // placeringer med delt plads ved fuldt lige
  const results = [];
  let place = 0, prevKey = null, prevPlace = 0;
  ranked.forEach((r, idx) => {
    const key = `${r.position}|${r.lastRoll}|${r.rollSum}`;
    place = key === prevKey ? prevPlace : idx + 1;
    prevKey = key; prevPlace = place;
    const prize = prizeFor(place, race.type);
    results.push({ ...r, place, prize });
  });

  for (const r of results) {
    const team = gs.getTeam(game, r.teamId);
    econ.addTransaction(game, team, r.prize, 'race', `${race.type === 'final' ? 'Finaleløb' : 'Løb'}: ${r.place}. plads`, race.id);
  }

  race.results = results;
  race.prizesApplied = true;
  race.rollingOpen = false;
  race.status = 'finished';
  gs.logEvent(game, `Løb afsluttet. Vinder på banen: ${results[0].stableName}.`);
  return { ok: true, results };
}

module.exports = { startRace, setRolling, rollForTeam, hostRollForTeam: rollForTeam, allRolled, finishRace, prizeFor };
