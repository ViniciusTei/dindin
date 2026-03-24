export function centsToInput(cents: number): string {
  const abs = Math.abs(cents);
  return (abs / 100).toFixed(2).replace(".", ",");
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}
