import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url: string | undefined | null): string {
  if (!url) return "";

  // Handle local Minio URLs when running frontend locally
  if (url.includes("minio:9000")) {
    return url.replace("minio:9000", "localhost:9000");
  }

  return url;
}
