import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getDiscountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: "Pending Payment", color: "#92400e", bg: "#fef3c7" },
  pending_verification: { label: "Pending Verification", color: "#92400e", bg: "#fef3c7" },
  accepted: { label: "Accepted", color: "#065f46", bg: "#d1fae5" },
  rejected: { label: "Rejected", color: "#991b1b", bg: "#fee2e2" },
  shipped: { label: "Shipped", color: "#1e40af", bg: "#dbeafe" },
  delivered: { label: "Delivered", color: "#5b21b6", bg: "#ede9fe" },
  cancelled: { label: "Cancelled", color: "#374151", bg: "#f3f4f6" },
};

export const occasions = [
  "Birthday", "Anniversary", "Valentine's Day", "Wedding", "Baby Shower",
  "Graduation", "Rakhi", "Diwali", "Christmas", "Farewell",
  "Friendship Day", "Mother's Day", "Father's Day", "Just Because",
];
