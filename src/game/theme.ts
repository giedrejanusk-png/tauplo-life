/** Design tokens shared by the Phaser scene. Mirrors the CSS custom properties in styles.css. */
export const theme = {
  ground: 0xeef2f0,
  ink: 0x18212b,
  inkMuted: 0x4a5866,
  floor: 0xd6cfc0,
  save: 0x1f5fae,
  saveDeep: 0x163f75,
  saveTint: 0xdce8f7,
  desk: 0x8a6a4a,
  screen: 0x7fd1c3,
  focus: 0xf2b705,
} as const;

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 600;
