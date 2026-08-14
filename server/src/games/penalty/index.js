// Plugin jwèt "Penalti" (Mondialito) — vèsyon SÈVÈ-AUTORITATIF.
//
// Diferans kle ak vèsyon Base44 a: kliyan an SEL sa li soumèt se chwa zòn li
// (kote li tire / kote li chwazi pare). Sèvè a kalkile skò a ak deklare
// genyan an — okenn kliyan pa ka janm ekri yon skò oswa yon "winner_id"
// dirèkteman (koreksyon pou pwoblèm kritik ki idantifye nan odit la).

const ROUNDS = 5;
const ZONE_POINTS = [50, 20, 50, 30, 20, 30]; // 6 zòn posib (0-5)
const ABANDON_TIMEOUT_MS = 5 * 60 * 1000;

function emptySide() {
  return { gk: [], shots: [] };
}

function initialState() {
  return {
    phase: 'gk_selection', // gk_selection -> shooting -> (tiebreak_gk <-> tiebreak_shooting)* -> finished
    p1: emptySide(),
    p2: emptySide(),
    tb: { gkP1: [], gkP2: [], shotP1: null, shotP2: null },
  };
}

function isValidZoneArray(arr, len) {
  return Array.isArray(arr) && arr.length === len && arr.every((n) => Number.isInteger(n) && n >= 0 && n < 6);
}
function isValidZone(n) {
  return Number.isInteger(n) && n >= 0 && n < 6;
}

function computeScore(shotZones, gkChoicesPerRound) {
  return shotZones.reduce((total, shotZone, i) => {
    const covered = gkChoicesPerRound[i] || [];
    return covered.includes(shotZone) ? total : total + (ZONE_POINTS[shotZone] || 0);
  }, 0);
}

/**
 * @param {object} match  HeadToHeadMatch (Prisma row) — .state se JSON, .player1Score/.player2Score
 * @param {string} userId moun k ap fè aksyon an
 * @param {string} moveType 'submit_gk' | 'submit_shots' | 'submit_tb_gk' | 'submit_tb_shot' | 'claim_timeout'
 * @param {any} payload
 * @returns {{ state: object, player1Score: number, player2Score: number, winnerSlot: 'p1'|'p2'|null, finished: boolean }}
 */
function applyMove(match, userId, moveType, payload) {
  const isP1 = match.player1Id === userId;
  const isP2 = match.player2Id === userId;
  if (!isP1 && !isP2) throw new Error('not_a_participant');
  const state = JSON.parse(JSON.stringify(match.state || initialState()));
  const mySlot = isP1 ? 'p1' : 'p2';
  const oppSlot = isP1 ? 'p2' : 'p1';
  let player1Score = match.player1Score || 0;
  let player2Score = match.player2Score || 0;
  let winnerSlot = null;
  let finished = false;

  if (moveType === 'claim_timeout') {
    const elapsed = Date.now() - new Date(match.updatedAt).getTime();
    if (elapsed < ABANDON_TIMEOUT_MS) throw new Error('opponent_not_timed_out_yet');
    winnerSlot = mySlot;
    finished = true;
    if (mySlot === 'p1') player1Score = Math.max(player1Score, 1); else player2Score = Math.max(player2Score, 1);
    return { state: { ...state, phase: 'finished' }, player1Score, player2Score, winnerSlot, finished };
  }

  if (moveType === 'submit_gk') {
    if (state.phase !== 'gk_selection') throw new Error('wrong_phase');
    if (!Array.isArray(payload) || payload.length !== ROUNDS || !payload.every((r) => isValidZoneArray(r, 3))) {
      throw new Error('invalid_gk_payload');
    }
    if (state[mySlot].gk.length > 0) throw new Error('already_submitted');
    state[mySlot].gk = payload;
    if (state.p1.gk.length === ROUNDS && state.p2.gk.length === ROUNDS) {
      state.phase = 'shooting';
    }
    return { state, player1Score, player2Score, winnerSlot: null, finished: false };
  }

  if (moveType === 'submit_shots') {
    if (state.phase !== 'shooting') throw new Error('wrong_phase');
    if (!isValidZoneArray(payload, ROUNDS)) throw new Error('invalid_shots_payload');
    if (state[mySlot].shots.length > 0) throw new Error('already_submitted');
    state[mySlot].shots = payload;

    if (state.p1.shots.length === ROUNDS && state.p2.shots.length === ROUNDS) {
      player1Score = computeScore(state.p1.shots, state.p2.gk);
      player2Score = computeScore(state.p2.shots, state.p1.gk);
      if (player1Score !== player2Score) {
        winnerSlot = player1Score > player2Score ? 'p1' : 'p2';
        state.phase = 'finished';
        finished = true;
      } else {
        state.phase = 'tiebreak_gk';
      }
    }
    return { state, player1Score, player2Score, winnerSlot, finished };
  }

  if (moveType === 'submit_tb_gk') {
    if (state.phase !== 'tiebreak_gk') throw new Error('wrong_phase');
    if (!isValidZoneArray(payload, 3)) throw new Error('invalid_tb_gk_payload');
    const key = mySlot === 'p1' ? 'gkP1' : 'gkP2';
    if (state.tb[key].length > 0) throw new Error('already_submitted');
    state.tb[key] = payload;
    if (state.tb.gkP1.length > 0 && state.tb.gkP2.length > 0) state.phase = 'tiebreak_shooting';
    return { state, player1Score, player2Score, winnerSlot: null, finished: false };
  }

  if (moveType === 'submit_tb_shot') {
    if (state.phase !== 'tiebreak_shooting') throw new Error('wrong_phase');
    if (!isValidZone(payload)) throw new Error('invalid_tb_shot_payload');
    const key = mySlot === 'p1' ? 'shotP1' : 'shotP2';
    if (state.tb[key] !== null) throw new Error('already_submitted');
    state.tb[key] = payload;

    if (state.tb.shotP1 !== null && state.tb.shotP2 !== null) {
      const p1TbScore = state.tb.gkP2.includes(state.tb.shotP1) ? 0 : (ZONE_POINTS[state.tb.shotP1] || 0);
      const p2TbScore = state.tb.gkP1.includes(state.tb.shotP2) ? 0 : (ZONE_POINTS[state.tb.shotP2] || 0);
      player1Score = (match.player1Score || 0) + p1TbScore;
      player2Score = (match.player2Score || 0) + p2TbScore;
      if (player1Score !== player2Score) {
        winnerSlot = player1Score > player2Score ? 'p1' : 'p2';
        state.phase = 'finished';
        finished = true;
      } else {
        // Nouvo tou tiebreak
        state.tb = { gkP1: [], gkP2: [], shotP1: null, shotP2: null };
        state.phase = 'tiebreak_gk';
      }
    }
    return { state, player1Score, player2Score, winnerSlot, finished };
  }

  throw new Error('unknown_move_type');
}

// Tounwa: jwè a soumèt yon skò (jwèt aksyon tanrèl kote replay konplè difisil pou valide san
// enfrastrikti siplemantè). Sèvè a fè yon kontwòl rezonabilite senp pou blote tricherie grosye.
const MAX_TOURNAMENT_SCORE_PER_ATTEMPT = 300; // 5 tir * pi gwo valè zòn (50..) — ajiste selon jwèt la

function validateTournamentScore(score) {
  if (!Number.isInteger(score) || score < 0 || score > MAX_TOURNAMENT_SCORE_PER_ATTEMPT) {
    throw new Error('score_out_of_range');
  }
  return score;
}

export const penaltyGame = {
  slug: 'penalty',
  name: 'Penalti',
  modes: ['TOURNAMENT', 'HEAD_TO_HEAD'],
  headToHead: { ROUNDS, initialState, applyMove, ABANDON_TIMEOUT_MS },
  tournament: { validateTournamentScore, maxScore: MAX_TOURNAMENT_SCORE_PER_ATTEMPT },
};
