import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Brush,
  ClipboardEdit,
  GitCompareArrows,
  Hammer,
  Handshake,
  Lock,
  Monitor,
  PartyPopper,
  PlugZap,
  Truck,
  Wrench,
} from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

const HOME_ICON_MAP: Record<string, LucideIcon> = {
  Armchair,
  Hammer,
  Monitor,
  Truck,
  Brush,
  Wrench,
  PlugZap,
  Lock,
  ClipboardEdit,
  GitCompareArrows,
  Handshake,
  PartyPopper,
};

export const HOMEPAGE_ICON_OPTIONS = [
  ...Object.keys(HOME_ICON_MAP),
  "Wind",
  "Flame",
  "Zap",
  "Droplets",
  "Sparkles",
  "Home",
  "Tv",
  "KeyRound",
];

export function getHomepageIcon(name?: string | null): LucideIcon {
  if (!name) return Wrench;
  return HOME_ICON_MAP[name] ?? getCategoryIcon(name);
}
