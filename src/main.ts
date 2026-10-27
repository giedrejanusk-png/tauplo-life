import Phaser from 'phaser';
import './styles.css';
import { desktopScenario } from './finance/scenario';
import { RoomScene } from './game/RoomScene';
import { GameStore } from './game/store';
import { GAME_HEIGHT, GAME_WIDTH } from './game/theme';
import { mountChoicePanel } from './ui/choicePanel';
import { mountHud } from './ui/hud';

const store = new GameStore();
const gameEl = document.getElementById('game')!;

mountHud(document.getElementById('hud')!, store);
const panel = mountChoicePanel(document.getElementById('panel')!, store, desktopScenario, () => gameEl.focus());

new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameEl,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: new RoomScene({ onInteract: () => panel.open(), isUiOpen: () => panel.isOpen }),
});
