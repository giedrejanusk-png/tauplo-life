/** Money is stored in whole cents to avoid floating-point rounding errors. */
export type Cents = number;

export type TransactionKind = 'spend' | 'save';

export interface Transaction {
  readonly kind: TransactionKind;
  readonly amount: Cents;
  readonly label: string;
}

export interface PlayerState {
  readonly wallet: Cents;
  readonly savings: Cents;
  readonly history: readonly Transaction[];
}

export type TransactionResult =
  | { readonly ok: true; readonly state: PlayerState; readonly transaction: Transaction }
  | { readonly ok: false; readonly state: PlayerState; readonly reason: 'insufficient-funds' | 'invalid-amount' };
