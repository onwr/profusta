import type { LucideIcon } from "lucide-react";
import {
  Droplets,
  Flame,
  Hammer,
  Home,
  KeyRound,
  Sparkles,
  Thermometer,
  Tv,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Wind,
  Flame,
  Zap,
  Droplets,
  Thermometer,
  Sparkles,
  Hammer,
  Home,
  Tv,
  KeyRound,
  Wrench,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(ICON_MAP);

export function getCategoryIcon(name?: string | null): LucideIcon {
  if (!name) return Wrench;
  return ICON_MAP[name] ?? Wrench;
}
