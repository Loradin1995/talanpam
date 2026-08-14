// Centralized registry of all game asset URLs (images + sounds)
// Each entry: { filename, url }
// Used by the admin export button to download all assets as a zip

const IMAGE_ASSETS = {
  background_goalpost: '/mondialito-assets/images/background_goalpost.png',
  background_challenge: '/mondialito-assets/images/background_challenge.png',
  ball: '/mondialito-assets/images/ball.png',
  goalkeeper_idle: '/mondialito-assets/images/goalkeeper_idle.png',
  goalkeeper_jumping: '/mondialito-assets/images/goalkeeper_jumping.png',
  goalpost: '/mondialito-assets/images/goalpost.png',
  cursor: '/mondialito-assets/images/cursor.png',
  game_over: '/mondialito-assets/images/game_over.png',
  goal: '/mondialito-assets/images/goal.png',
  kicks: '/mondialito-assets/images/kicks.png',
  logo: '/mondialito-assets/images/logo.png',
  menu: '/mondialito-assets/images/menu.png',
  music_off: '/mondialito-assets/images/music_off.png',
  music_on: '/mondialito-assets/images/music_on.png',
  out: '/mondialito-assets/images/out.png',
  play: '/mondialito-assets/images/play.png',
  saved: '/mondialito-assets/images/saved.png',
  score: '/mondialito-assets/images/score.png',
};

const SOUND_ASSETS = {
  goal_sound: '/mondialito-assets/sounds/goal_sound.mp3',
  lose_sound: '/mondialito-assets/sounds/lose_sound.mp3',
  background_music: '/mondialito-assets/sounds/background_music.mp3',
};

function getExtension(url) {
  const clean = url.split('?')[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : 'png';
}

export const ASSET_LIST = [
  ...Object.entries(IMAGE_ASSETS).map(([name, url]) => ({ filename: `${name}.${getExtension(url)}`, url, folder: 'images' })),
  ...Object.entries(SOUND_ASSETS).map(([name, url]) => ({ filename: `${name}.${getExtension(url)}`, url, folder: 'sounds' })),
];