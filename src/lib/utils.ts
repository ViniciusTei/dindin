import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number): string {
  const RealCurrency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return RealCurrency.format(value);
}

function generateColorVariations(): string[] {
  const colors: string[] = [];
  const baseColors = [
    { r: 255, g: 99, b: 132 },
    { r: 54, g: 162, b: 235 },
    { r: 255, g: 206, b: 86 },
    { r: 75, g: 192, b: 192 },
    { r: 153, g: 102, b: 255 },
    { r: 255, g: 159, b: 64 },
  ];

  for (let i = 0; i < baseColors.length; i++) {
    for (let j = 0; j < 16; j++) {
      const opacity = 0.1 + j * 0.05;
      const color = baseColors[i];
      colors.push(
        `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity.toFixed(2)})`,
      );
    }
  }

  return colors;
}

export function getColors(N: number): string[] {
  const colors = generateColorVariations();
  const result: string[] = [];
  for (let i = 0; i < N; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
}
