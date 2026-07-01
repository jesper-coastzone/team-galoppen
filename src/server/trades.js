/*
 * trades.js — byttehandel af auktionsøvelser mellem to hold.
 * A tilbyder sin øvelse (+ evt. ekstra betaling) for B's øvelse. B accepterer/afviser.
 */
const cfg = require('../../config/gameConfig');
const { uid, now } = require('./util');
const gs = require('./gameState');
const econ = require('./economy');

const TRADE_TTL_MS = 3 * 60 * 1000;

function createTrade(game, fromTeam, toTeamId, offeredExerciseId, requestedExerciseId, extraPayment) {
  const toTeam = gs.getTeam(game, toTeamId);
  if (!toTeam) return { ok: false, error: 'Ukendt modtager.' };
  if (fromTeam.id === toTeamId) return { ok: false, error: 'I kan ikke bytte med jer selv.' };
  extraPayment = Math.max(0, Math.round(extraPayment || 0));

  if (fromTeam.ownedAuctionExerciseId !== offeredExerciseId)
    return { ok: false, error: 'I ejer ikke længere den øvelse.' };
  if (toTeam.ownedAuctionExerciseId !== requestedExerciseId)
    return { ok: false, error: 'Modtageren ejer ikke længere den ønskede øvelse.' };
  if (extraPayment > fromTeam.cash)
    return { ok: false, error: 'I har ikke nok kontanter til den ekstra betaling.' };

  const offered = gs.exerciseById(game, offeredExerciseId);
  const requested = gs.exerciseById(game, requestedExerciseId);
  const trade = {
    id: uid('trade'),
    fromTeamId: fromTeam.id, toTeamId,
    fromStable: fromTeam.stableName, toStable: toTeam.stableName,
    offeredExerciseId, requestedExerciseId,
    offeredName: offered.name, requestedName: requested.name,
    extraPayment, status: 'pending',
    createdAt: now(), expiresAt: now() + TRADE_TTL_MS,
  };
  game.trades.unshift(trade);
  gs.logEvent(game, `${fromTeam.stableName} tilbød ${toTeam.stableName} en byttehandel.`);
  return { ok: true, trade };
}

function respondTrade(game, team, tradeId, accept) {
  const trade = game.trades.find((t) => t.id === tradeId);
  if (!trade) return { ok: false, error: 'Handlen findes ikke.' };
  if (trade.toTeamId !== team.id) return { ok: false, error: 'Kun modtageren kan svare.' };
  if (trade.status !== 'pending') return { ok: false, error: 'Handlen er ikke længere aktiv.' };
  if (now() > trade.expiresAt) { trade.status = 'expired'; return { ok: false, error: 'Handlen er udløbet.' }; }

  if (!accept) {
    trade.status = 'rejected';
    gs.logEvent(game, `${team.stableName} afviste en byttehandel.`);
    return { ok: true, trade };
  }

  const from = gs.getTeam(game, trade.fromTeamId);
  const to = gs.getTeam(game, trade.toTeamId);
  // revalidér ejerskab og penge
  if (from.ownedAuctionExerciseId !== trade.offeredExerciseId ||
      to.ownedAuctionExerciseId !== trade.requestedExerciseId) {
    trade.status = 'invalid';
    return { ok: false, error: 'Ejerskab er ændret — handlen er ikke længere gyldig.' };
  }
  if (trade.extraPayment > from.cash) {
    trade.status = 'invalid';
    return { ok: false, error: 'Afsenderen har ikke nok kontanter længere.' };
  }

  const offered = gs.exerciseById(game, trade.offeredExerciseId);
  const requested = gs.exerciseById(game, trade.requestedExerciseId);

  // byt ejerskab
  offered.currentOwnerTeamId = to.id;
  requested.currentOwnerTeamId = from.id;
  from.ownedAuctionExerciseId = requested.id;
  to.ownedAuctionExerciseId = offered.id;
  // bær øvelsens seneste pris med som "investering" (bruges til byttegebyr)
  from.ownedExercisePurchasePrice = requested.lastPurchasePrice || 0;
  to.ownedExercisePurchasePrice = offered.lastPurchasePrice || 0;
  from.mindPuzzleLevel = 0; to.mindPuzzleLevel = 0;

  if (trade.extraPayment > 0) {
    econ.addTransaction(game, from, -trade.extraPayment, 'trade', `Ekstra betaling i handel med ${to.stableName}`);
    econ.addTransaction(game, to, trade.extraPayment, 'trade', `Ekstra betaling fra ${from.stableName}`);
  }

  trade.status = 'accepted';
  gs.logEvent(game, `Handel: ${from.stableName} ↔ ${to.stableName} (${trade.offeredName} ↔ ${trade.requestedName}).`);
  return { ok: true, trade };
}

function cancelTrade(game, team, tradeId) {
  const trade = game.trades.find((t) => t.id === tradeId);
  if (!trade) return { ok: false, error: 'Handlen findes ikke.' };
  if (team && trade.fromTeamId !== team.id) return { ok: false, error: 'Kun afsenderen kan annullere.' };
  if (trade.status === 'pending') trade.status = 'cancelled';
  return { ok: true, trade };
}

function hostCancelTrade(game, tradeId) {
  const trade = game.trades.find((t) => t.id === tradeId);
  if (!trade) return { ok: false, error: 'Handlen findes ikke.' };
  trade.status = 'cancelled';
  return { ok: true };
}

function expireTrades(game) {
  let changed = false;
  for (const t of game.trades) {
    if (t.status === 'pending' && now() > t.expiresAt) { t.status = 'expired'; changed = true; }
  }
  return changed;
}

module.exports = { createTrade, respondTrade, cancelTrade, hostCancelTrade, expireTrades };
