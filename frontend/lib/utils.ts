import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (value: string, options?: Intl.DateTimeFormatOptions, locale = "en-GB") =>
  new Intl.DateTimeFormat(locale, {
    timeZone: "Africa/Banjul",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options
  }).format(new Date(value));

export const formatTime = (value: string, locale = "en-GB") =>
  new Intl.DateTimeFormat(locale, {
    timeZone: "Africa/Banjul",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
