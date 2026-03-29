export type ReceiptItem = {
  id: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
};

export type ParsedReceipt = {
  storeName: string | null;
  date: Date | null;
  items: ReceiptItem[];
  totalCents: number;
};
