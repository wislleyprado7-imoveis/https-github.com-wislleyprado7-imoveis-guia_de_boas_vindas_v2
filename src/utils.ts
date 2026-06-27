import { Guest } from "./types";

export type StayStatus = "BEFORE" | "DURING" | "AFTER";

export function getStayStatus(guest: Guest): StayStatus {
  if (guest.isAlwaysUnlocked) {
    return "DURING";
  }

  // Get current local date in YYYY-MM-DD format (based on user's timezone)
  const todayStr = new Date().toISOString().split("T")[0];
  
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
