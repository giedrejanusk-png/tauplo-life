import { createInitialState, applyTransaction } from '../finance/ledger';
import { explainConsequence } from '../finance/scenario';
import type { Choice } from '../finance/scenario';
import type { PlayerState } from '../finance/types';

export interface Outcome {
  readonly choice: Choice;
  readonly ok: boolean;
  readonly message: string;
}

type Listener = (state: PlayerState, outcome: Outcome | null) => void;

/** Holds the current game state and notifies the UI. All money rules live in finance/. */
export class GameStore {
  private state: PlayerState = createInitialState();
  private lastOutcome: Outcome | null = null;
  private listeners = new Set<Listener>();

  get current(): PlayerState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state, this.lastOutcome);
    return () => this.listeners.delete(listener);
  }

  choose(choice: Choice): void {
    const result = applyTransaction(this.state, { kind: choice.kind, amount: choice.amount, label: choice.detail });
    this.state = result.state;
    this.lastOutcome = {
      choice,
      ok: result.ok,
      message: result.ok
        ? explainConsequence(choice.kind, choice.amount, result.state)
        : 'You do not have enough money in your wallet for this.',
    };
    this.emit();
  }

  reset(): void {
    this.state = createInitialState();
    this.lastOutcome = null;
    this.emit();
  }

  private emit(): void {
    for (const l of this.listeners) l(this.state, this.lastOutcome);
  }
}
