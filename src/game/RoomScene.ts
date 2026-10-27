import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, theme } from './theme';

const PLAYER_SPEED = 220;
const PLAYER_RADIUS = 18;
const INTERACT_DISTANCE = 90;
const WALL_THICKNESS = 12;
const WALL_BAND = 160;

export interface RoomCallbacks {
  /** Called when the player presses E next to the computer. */
  onInteract(): void;
  /** True while a UI panel is open; movement and interaction pause. */
  isUiOpen(): boolean;
}

export class RoomScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private desk!: Phaser.GameObjects.Rectangle;
  private prompt!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private obstacles: Phaser.Geom.Rectangle[] = [];

  constructor(private readonly callbacks: RoomCallbacks) {
    super('room');
  }

  create(): void {
    this.drawRoom();
    this.player = this.add.container(240, 400, [
      this.add.circle(0, 0, PLAYER_RADIUS, theme.save).setStrokeStyle(4, theme.saveDeep),
      this.add.circle(0, -6, 4, 0xffffff),
    ]);
    this.prompt = this.buildPrompt();

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.interactKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    // Let the DOM panel receive keys (Tab, Space, Enter) while it is open.
    kb.disableGlobalCapture();
  }

  update(_time: number, deltaMs: number): void {
    const uiOpen = this.callbacks.isUiOpen();
    if (!uiOpen) this.movePlayer(deltaMs / 1000);

    const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.desk.x, this.desk.y + 60) < INTERACT_DISTANCE;
    this.prompt.setVisible(near && !uiOpen);
    if (near && !uiOpen && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.callbacks.onInteract();
    }
  }

  private movePlayer(dt: number): void {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;
    const dir = new Phaser.Math.Vector2(Number(right) - Number(left), Number(down) - Number(up));
    if (dir.lengthSq() === 0) return;
    dir.normalize().scale(PLAYER_SPEED * dt);

    // Move one axis at a time so the player slides along obstacles.
    const nextX = Phaser.Math.Clamp(this.player.x + dir.x, WALL_THICKNESS + PLAYER_RADIUS, GAME_WIDTH - WALL_THICKNESS - PLAYER_RADIUS);
    if (!this.collides(nextX, this.player.y)) this.player.x = nextX;
    const nextY = Phaser.Math.Clamp(this.player.y + dir.y, WALL_BAND + PLAYER_RADIUS, GAME_HEIGHT - WALL_THICKNESS - PLAYER_RADIUS);
    if (!this.collides(this.player.x, nextY)) this.player.y = nextY;
  }

  private collides(x: number, y: number): boolean {
    const body = new Phaser.Geom.Circle(x, y, PLAYER_RADIUS);
    return this.obstacles.some((r) => Phaser.Geom.Intersects.CircleToRectangle(body, r));
  }

  private drawRoom(): void {
    this.cameras.main.setBackgroundColor(theme.floor);
    this.add.rectangle(0, 0, GAME_WIDTH, WALL_BAND, theme.ground).setOrigin(0);
    this.add.rectangle(0, WALL_BAND - 6, GAME_WIDTH, 6, theme.ink).setOrigin(0);
    this.add.rectangle(400, 36, 160, 88, theme.saveTint).setOrigin(0).setStrokeStyle(4, theme.ink);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT).setOrigin(0).setStrokeStyle(WALL_THICKNESS * 2, theme.ink);

    this.desk = this.add.rectangle(750, 238, 220, 84, theme.desk).setStrokeStyle(4, theme.ink);
    this.add.rectangle(750, 182, 100, 64, theme.ink);
    this.add.rectangle(750, 182, 88, 52, theme.screen);
    this.add.rectangle(750, 324, 48, 48, theme.inkMuted).setStrokeStyle(0);
    this.obstacles.push(new Phaser.Geom.Rectangle(640, 150, 220, 130));
  }

  private buildPrompt(): Phaser.GameObjects.Container {
    const style = { fontFamily: 'Lexend, system-ui, sans-serif', fontSize: '15px', color: '#FFFFFF' };
    const label = this.add.text(22, 0, 'Use computer', style).setOrigin(0, 0.5);
    const width = label.width + 54;
    const bg = this.add.rectangle(-18, 0, width, 40, theme.ink).setOrigin(0, 0.5);
    const keyCap = this.add.rectangle(-10, 0, 26, 26, 0xffffff).setOrigin(0, 0.5);
    const key = this.add.text(3, 0, 'E', { ...style, color: '#18212B', fontFamily: '"IBM Plex Mono", monospace' }).setOrigin(0.5);
    return this.add.container(750 - width / 2 + 18, 112, [bg, keyCap, key, label]).setVisible(false);
  }
}
