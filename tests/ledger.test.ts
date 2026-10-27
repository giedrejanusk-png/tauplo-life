import { describe, expect, it } from 'vitest';
import {
  applyTransaction, createInitialState, euros, formatMoney, netWorth, save, spend, STARTING_WALLET,
} from '../src/finance/ledger';
import { explainConsequence } from '../src/finance/scenario';

describe('initial state', () => {
  it('starts with the default wallet and no savings', () => {
    const s = createInitialState();
    expect(s.wallet).toBe(STARTING_WALLET);
    expect(s.savings).toBe(0);
    expect(s.history).toEqual([]);
  });
});

describe('spending', () => {
  it('reduces the wallet and leaves savings unchanged', () => {
    const r = spend(createInitialState(euros(200)), euros(50));
    expect(r.ok).toBe(true);
    expect(r.state.wallet).toBe(euros(150));
    expect(r.state.savings).toBe(0);
    expect(netWorth(r.state)).toBe(euros(150));
  });

  it('records the transaction in history', () => {
    const r = spend(createInitialState(), euros(50), 'Headphones');
    expect(r.state.history).toEqual([{ kind: 'spend', amount: euros(50), label: 'Headphones' }]);
  });
});

describe('saving', () => {
  it('moves money from wallet to savings without changing net worth', () => {
    const start = createInitialState(euros(200));
    const r = save(start, euros(50));
    expect(r.ok).toBe(true);
    expect(r.state.wallet).toBe(euros(150));
    expect(r.state.savings).toBe(euros(50));
    expect(netWorth(r.state)).toBe(netWorth(start));
  });

  it('accumulates across several saves', () => {
    let s = createInitialState(euros(200));
    s = save(s, euros(50)).state;
    s = save(s, euros(50)).state;
    expect(s.wallet).toBe(euros(100));
    expect(s.savings).toBe(euros(100));
    expect(s.history).toHaveLength(2);
  });
});

describe('balance rules', () => {
  it('rejects transactions larger than the wallet and keeps state', () => {
    const start = createInitialState(euros(30));
    const r = spend(start, euros(50));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('insufficient-funds');
    expect(r.state).toBe(start);
  });

  it('allows spending the exact wallet amount', () => {
    const r = spend(createInitialState(euros(50)), euros(50));
    expect(r.ok).toBe(true);
    expect(r.state.wallet).toBe(0);
  });

  it.each([0, -100, 12.5, Number.NaN])('rejects invalid amount %s', (amount) => {
    const r = applyTransaction(createInitialState(), { kind: 'save', amount, label: 'x' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('invalid-amount');
  });

  it('never mutates the previous state', () => {
    const start = createInitialState(euros(200));
    const snapshot = structuredClone(start);
    save(start, euros(50));
    spend(start, euros(50));
    expect(start).toEqual(snapshot);
  });

  it('is deterministic for the same inputs', () => {
    const a = save(createInitialState(), euros(50));
    const b = save(createInitialState(), euros(50));
    expect(a).toEqual(b);
  });
});

describe('formatting and explanations', () => {
  it('formats cents as euros', () => {
    expect(formatMoney(euros(200))).toBe('€200.00');
    expect(formatMoney(5)).toBe('€0.05');
    expect(formatMoney(euros(1250))).toBe('€1,250.00');
  });

  it('explains saving and spending differently', () => {
    const after = createInitialState(euros(150));
    expect(explainConsequence('save', euros(50), after)).toContain('moved to savings');
    expect(explainConsequence('spend', euros(50), after)).toContain('gone');
  });
});
