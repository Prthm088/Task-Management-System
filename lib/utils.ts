import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "HIGH":
      return "text-destructive border-destructive"
    case "MEDIUM":
      return "text-amber-500 border-amber-500"
    case "LOW":
      return "text-emerald-500 border-emerald-500"
    default:
      return ""
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "TODO":
      return "text-slate-500 border-slate-500"
    case "IN_PROGRESS":
      return "text-blue-500 border-blue-500"
    case "REVIEW":
      return "text-purple-500 border-purple-500"
    case "COMPLETED":
      return "text-emerald-500 border-emerald-500"
    default:
      return ""
  }
}
