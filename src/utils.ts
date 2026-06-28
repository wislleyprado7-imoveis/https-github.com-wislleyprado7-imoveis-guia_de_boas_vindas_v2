import { Guest } from "./types";

export type StayStatus = "BEFORE" | "DURING" | "AFTER";

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 version 4 compliant UUID generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getStayStatus(guest: Guest): StayStatus {
  if (guest.isAlwaysUnlocked) {
    return "DURING";
  }

  // Get current local date in YYYY-MM-DD format (based on local timezone)
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;
  
  if (todayStr < guest.checkInDate) {
    return "BEFORE";
  } else if (todayStr > guest.checkOutDate) {
    return "AFTER";
  } else {
    return "DURING";
  }
}

export function formatDateBr(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

