import { euros, formatMoney, netWorth } from './ledger';
import type { Cents, PlayerState, TransactionKind } from './types';

export interface Choice {
  readonly kind: TransactionKind;
  readonly amount: Cents;
  readonly title: string;
  readonly detail: string;
}

export interface Scenario {
  readonly eyebrow: string;
  readonly prompt: string;
  readonly question: string;
  readonly choices: readonly Choice[];
}

const AMOUNT = euros(50);

export const desktopScenario: Scenario = {
  eyebrow: 'Your computer',
  prompt: `You have ${formatMoney(AMOUNT)} left over this week.`,
  question: 'What do you do with it?',
  choices: [
    { kind: 'spend', amount: AMOUNT, title: `Spend ${formatMoney(AMOUNT)}`, detail: 'Buy new headphones' },
    { kind: 'save', amount: AMOUNT, title: `Save ${formatMoney(AMOUNT)}`, detail: 'Move it to savings' },
  ],
};

/** Plain-language explanation of what a choice did to the player's money. */
export function explainConsequence(kind: TransactionKind, amount: Cents, after: PlayerState): string {
  const money = formatMoney(amount);
  const owned = formatMoney(netWorth(after));
  if (kind === 'save') {
    return `Your wallet went down by ${money}, but the money is still yours — it moved to savings. ` +
      `You still own ${owned} in total. Savings build a cushion for surprises and future goals.`;
  }
  return `Your wallet went down by ${money} and that money is gone. You now own ${owned} in total. ` +
    `Spending on things you enjoy is fine — the trade-off is that this ${money} can no longer cover an emergency or grow.`;
}
