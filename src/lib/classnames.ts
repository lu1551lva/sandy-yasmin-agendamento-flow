
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind + clsx merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
