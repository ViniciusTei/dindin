export interface TransactionRunner<TTx> {
  run<TResult>(work: (tx: TTx) => Promise<TResult>): Promise<TResult>;
}
