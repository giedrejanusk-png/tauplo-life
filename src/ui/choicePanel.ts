import { formatMoney } from '../finance/ledger';
import type { Scenario } from '../finance/scenario';
import type { GameStore } from '../game/store';

export interface ChoicePanel {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

export function mountChoicePanel(root: HTMLElement, store: GameStore, scenario: Scenario, onClose: () => void): ChoicePanel {
  root.innerHTML = `
    <div class="backdrop" hidden data-backdrop>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title">
        <div class="panel-head">
          <div>
            <span class="label">${scenario.eyebrow}</span>
            <h2 id="panel-title">${scenario.prompt}</h2>
            <p class="muted">${scenario.question}</p>
          </div>
          <button type="button" class="btn-icon" aria-label="Close" data-close>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="choices">
          ${scenario.choices.map((c, i) => `
            <button type="button" class="choice choice-${c.kind}" data-choice="${i}">
              <span class="choice-title">${c.title}</span>
              <span class="muted">${c.detail}</span>
            </button>`).join('')}
        </div>
        <div class="result" role="status" aria-live="polite" hidden data-result>
          <span class="label" data-result-label></span>
          <p data-result-text></p>
        </div>
      </div>
    </div>
  `;
  const backdrop = root.querySelector<HTMLElement>('[data-backdrop]')!;
  const result = root.querySelector<HTMLElement>('[data-result]')!;
  const resultLabel = root.querySelector<HTMLElement>('[data-result-label]')!;
  const resultText = root.querySelector<HTMLElement>('[data-result-text]')!;
  const choiceButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-choice]')];

  choiceButtons.forEach((btn) => {
    btn.addEventListener('click', () => store.choose(scenario.choices[Number(btn.dataset.choice)]));
  });
  root.querySelector('[data-close]')!.addEventListener('click', () => panel.close());
  backdrop.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') panel.close();
  });

  store.subscribe((state, outcome) => {
    choiceButtons.forEach((btn) => {
      btn.disabled = scenario.choices[Number(btn.dataset.choice)].amount > state.wallet;
    });
    result.hidden = outcome === null;
    if (!outcome) return;
    result.dataset.kind = outcome.ok ? outcome.choice.kind : 'error';
    const verb = outcome.choice.kind === 'save' ? 'You saved' : 'You spent';
    resultLabel.textContent = outcome.ok ? `${verb} ${formatMoney(outcome.choice.amount)}` : 'Not possible';
    resultText.textContent = outcome.message;
  });

  const panel: ChoicePanel = {
    get isOpen() {
      return !backdrop.hidden;
    },
    open() {
      backdrop.hidden = false;
      (choiceButtons.find((b) => !b.disabled) ?? root.querySelector<HTMLButtonElement>('[data-close]'))!.focus();
    },
    close() {
      if (backdrop.hidden) return;
      backdrop.hidden = true;
      onClose();
    },
  };
  return panel;
}
