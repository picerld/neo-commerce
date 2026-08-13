import { Smartphone, Shirt, Home, Dumbbell, HeartPulse, Tag, type LucideIcon } from "lucide-react";

const ICONS_BY_SLUG: Record<string, LucideIcon> = {
  elektronik: Smartphone,
  fashion: Shirt,
  "rumah-tangga": Home,
  olahraga: Dumbbell,
  "kesehatan-kecantikan": HeartPulse,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return ICONS_BY_SLUG[slug] ?? Tag;
}
