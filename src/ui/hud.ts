import { formatMoney } from '../finance/ledger';
import type { GameStore } from '../game/store';

export function mountHud(root: HTMLElement, store: GameStore): void {
  root.innerHTML = `
    <div class="hud" role="status" aria-live="polite">
      <div class="hud-cell">
        <span class="label">Wallet</span>
        <span class="money" data-wallet></span>
      </div>
      <div class="hud-cell hud-savings">
        <span class="label">Savings</span>
        <span class="money" data-savings></span>
      </div>
    </div>
    <button type="button" class="btn btn-outline hud-reset" data-reset>Reset</button>
    <p class="controls">WASD / arrows — move · E — interact · Esc — close</p>
  `;
  const wallet = root.querySelector<HTMLElement>('[data-wallet]')!;
  const savings = root.querySelector<HTMLElement>('[data-savings]')!;
  root.querySelector<HTMLButtonElement>('[data-reset]')!.addEventListener('click', () => store.reset());

  store.subscribe((state) => {
    wallet.textContent = formatMoney(state.wallet);
    savings.textContent = formatMoney(state.savings);
  });
}
