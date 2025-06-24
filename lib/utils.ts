import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Global error handler utility
export function handleApiError(error: unknown, context?: string) {
  const isDev = process.env.NODE_ENV !== "production";
  let message = "An unexpected error occurred.";
  let status = 500;

  if (error instanceof Error) {
    message = error.message;
    if (isDev) {
      // Log stack trace and context in development
      // eslint-disable-next-line no-console
      console.error(`[API ERROR]${context ? ` [${context}]` : ""}:`, error.stack || error);
    }
  } else if (typeof error === "string") {
    message = error;
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(`[API ERROR]${context ? ` [${context}]` : ""}:`, error);
    }
  } else {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(`[API ERROR]${context ? ` [${context}]` : ""}:`, error);
    }
  }

  // In production, return a generic message
  return {
    status,
    body: { error: isDev ? message : "Something went wrong. Please try again later." },
  };
}
