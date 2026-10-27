import type { Cents, PlayerState, Transaction, TransactionResult } from './types';

export const STARTING_WALLET: Cents = 20_000;

export function createInitialState(wallet: Cents = STARTING_WALLET): PlayerState {
  return { wallet, savings: 0, history: [] };
}

export function euros(amount: number): Cents {
  return Math.round(amount * 100);
}

export function formatMoney(amount: Cents): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const whole = Math.floor(abs / 100).toLocaleString('en-IE');
  const cents = String(abs % 100).padStart(2, '0');
  return `${sign}€${whole}.${cents}`;
}

/**
 * Applies a transaction and returns a new state. Never mutates the input.
 * Spending removes money from the wallet; saving moves it from wallet to savings.
 */
export function applyTransaction(state: PlayerState, tx: Transaction): TransactionResult {
  if (!Number.isInteger(tx.amount) || tx.amount <= 0) {
    return { ok: false, state, reason: 'invalid-amount' };
  }
  if (tx.amount > state.wallet) {
    return { ok: false, state, reason: 'insufficient-funds' };
  }
  const wallet = state.wallet - tx.amount;
  const savings = tx.kind === 'save' ? state.savings + tx.amount : state.savings;
  return {
    ok: true,
    transaction: tx,
    state: { wallet, savings, history: [...state.history, tx] },
  };
}

export function spend(state: PlayerState, amount: Cents, label = 'Spend'): TransactionResult {
  return applyTransaction(state, { kind: 'spend', amount, label });
}

export function save(state: PlayerState, amount: Cents, label = 'Save'): TransactionResult {
  return applyTransaction(state, { kind: 'save', amount, label });
}

/** Total money the player still owns (wallet + savings). */
export function netWorth(state: PlayerState): Cents {
  return state.wallet + state.savings;
}
