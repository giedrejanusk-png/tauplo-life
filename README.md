# Tauplo Life

A small browser-based 2D life simulator for learning financial literacy by making choices and seeing what happens. Built with **Phaser 3**, **TypeScript** and **Vite**.

It uses fictional currency and local game state only: no accounts, payments, backend or network calls.

## Milestone 1: one room

- Walk around a room with **WASD** or the **arrow keys**.
- Go to the desk and press **E** to use the computer.
- Pick **Spend €50** or **Save €50**.
- The wallet and savings totals update, and a short explanation describes the consequence.
- **Reset** (top right) restarts the scenario. **Esc** closes the panel.

## Play online

The game is published automatically to **https://giedrejanusk-png.github.io/tauplo-life/** on every push to `main`. The workflow in `.github/workflows/deploy.yml` runs the tests, builds the game and deploys it.

One-time setup: in the repository on GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.

## Run it locally

You need Node.js 20 or newer.

```bash
cd tauplo-life   # after: git clone https://github.com/giedrejanusk-png/tauplo-life
npm install
npm run dev        # open the printed URL (default http://localhost:5173)
```

Other scripts:

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm test`          | Runs the Vitest unit tests (finance logic)    |
| `npm run typecheck` | Type-checks the project with `tsc`            |
| `npm run build`     | Type-checks, then builds a static site into `dist/` |
| `npm run preview`   | Serves the production build locally           |

## Project structure

```
tauplo-life/
├── index.html              # Page shell: game canvas + DOM overlays
├── src/
│   ├── main.ts             # Wires the store, UI and Phaser game together
│   ├── styles.css          # Design tokens (CSS custom properties) + UI styles
│   ├── finance/            # Pure, deterministic money logic (no Phaser, no DOM)
│   │   ├── types.ts        #   PlayerState, Transaction, TransactionResult
│   │   ├── ledger.ts       #   applyTransaction, spend, save, formatMoney…
│   │   └── scenario.ts     #   The desk scenario + consequence explanations
│   ├── game/
│   │   ├── RoomScene.ts    # Phaser scene: room, player movement, interaction
│   │   ├── store.ts        # Holds PlayerState, notifies the UI on changes
│   │   └── theme.ts        # Colour tokens for the Phaser renderer
│   └── ui/
│       ├── hud.ts          # Wallet / savings HUD and Reset button
│       └── choicePanel.ts  # Accessible dialog with the two choices
└── tests/
    └── ledger.test.ts      # Balance, saving and spending tests
```

### Design decisions

- **Money in integer cents.** `€50` is stored as `5000`, so there are no floating-point rounding errors.
- **Finance logic is pure.** `applyTransaction(state, tx)` returns a new state and never mutates the old one. Spending more than the wallet holds, or using a non-positive or fractional amount, returns `ok: false` with the state unchanged.
- **Rendering is separate from rules.** The Phaser scene only draws and moves things. The HUD and panel are plain DOM elements, so they are real, keyboard-focusable buttons that work with screen readers.
- **No external assets.** Every graphic is a Phaser geometric shape. Fonts fall back to the system UI font, and the design system names Lexend and IBM Plex Mono if you add them later.

## Design system (summary)

| Token        | Hex       | Use                         |
| ------------ | --------- | --------------------------- |
| Ground       | `#EEF2F0` | Page, room wall             |
| Ink          | `#18212B` | Text, outlines              |
| Ink muted    | `#4A5866` | Secondary text              |
| Save         | `#1F5FAE` | Saving, player              |
| Spend        | `#A84A06` | Spending                    |
| Focus        | `#F2B705` | Keyboard focus ring         |

Saving is always blue and spending is always orange. The two colours also differ in lightness, and every choice carries a text label, so colour is never the only signal. Touch targets are at least 44px.
