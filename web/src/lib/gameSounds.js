export const GOAL_SOUND = new Audio('/mondialito-assets/sounds/goal_sound.mp3');
export const LOSE_SOUND = new Audio('/mondialito-assets/sounds/lose_sound.mp3');
export const BG_MUSIC = new Audio('/mondialito-assets/sounds/background_music.mp3');
BG_MUSIC.loop = true;
BG_MUSIC.volume = 0.5;

export function playGoal() {
  GOAL_SOUND.currentTime = 0;
  GOAL_SOUND.play().catch(() => {});
}

export function playLose() {
  LOSE_SOUND.currentTime = 0;
  LOSE_SOUND.play().catch(() => {});
}

export function startBgMusic() {
  BG_MUSIC.play().catch(() => {});
}

export function stopBgMusic() {
  BG_MUSIC.pause();
}