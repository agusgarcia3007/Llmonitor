import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(num: number) {
  if (num >= 1000000) {
    const formatted = (num / 1000000).toFixed(1);
    return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}M`;
  } else if (num >= 1000) {
    const formatted = (num / 1000).toFixed(1);
    return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}K`;
  }
  return num.toString();
}
