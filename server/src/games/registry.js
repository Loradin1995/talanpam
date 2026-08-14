// Rejis santral tout jwèt platfòm nan konnen. Pou ajoute yon NOUVO jwèt (diferan
// de Penalti), kreye yon dosye `src/games/<slug>/index.js` ki ekspòte yon objè
// menm fòm ak `penaltyGame` (wè penalty/index.js pou egzanp konplè), epi
// anrejistre l isit la. Wout jenerik yo (`tournaments.routes.js`,
// `matches.routes.js`) ap otomatikman travay avèk nenpòt jwèt ki anrejistre.
import { penaltyGame } from './penalty/index.js';

const GAMES = {
  [penaltyGame.slug]: penaltyGame,
};

export function getGamePlugin(slug) {
  const game = GAMES[slug];
  if (!game) throw new Error(`unknown_game:${slug}`);
  return game;
}

export function listGamePlugins() {
  return Object.values(GAMES);
}
