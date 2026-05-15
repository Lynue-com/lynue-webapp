import {
  ArrowUpFromDot, Baby, Bath, BedDouble, BellRing, Briefcase,
  Building, Building2, Car, Castle, Cctv, Check, CircleParking,
  CookingPot, Cpu, DoorOpen, Droplet, Droplets, Dumbbell, Fan,
  Fence, Flame, Globe, Home, Hotel, Leaf, Lightbulb, LandPlot,
  MapPin, Route, ShieldAlert, ShieldCheck, ShirtIcon, Sofa, SprayCan,
  Store, Sun, SunDim, Trash2, TreePine, Trees, Trophy, Tv, Warehouse,
  WashingMachine, Waves, Wifi, Wind, Wine, Zap,
  type LucideIcon,
} from "lucide-react";

/** Normalise a slug to hyphen-case so maps only need one entry per concept. */
const normalise = (s: string) => s.toLowerCase().replace(/_/g, "-");

// ── Amenities ─────────────────────────────────────────────────────────────────
export const AMENITY_ICONS: Record<string, LucideIcon> = {
  "air-conditioning": Wind,
  "ceiling-fan":      Fan,
  "water-heater":     Flame,
  "kitchen":          CookingPot,
  "fitted-kitchen":   CookingPot,
  "smart-home":       Cpu,
  "tv-cable":         Tv,
  "wi-fi":            Wifi,
  "internet":         Globe,
  "walk-in-closet":   DoorOpen,
  "wardrobe":         ShirtIcon,
  "en-suite":         Bath,
  "balcony":          Building2,
  "terrace":          Fence,
  "rooftop-terrace":  Fence,
  "jacuzzi":          Waves,
  "swimming-pool":    Droplets,
  "private-pool":     Droplets,
  "waterfront":       Waves,
  "garden":           Leaf,
  "garage":           Car,
  "furnished":        Sofa,
  "semi-furnished":   SunDim,
  "gym":              Dumbbell,
  "game-room":        Trophy,
  "backup-power":     Zap,
  "solar-power":      Sun,
  "cctv":             Cctv,
};

// ── Facilities ────────────────────────────────────────────────────────────────
export const FACILITY_ICONS: Record<string, LucideIcon> = {
  "security":          ShieldCheck,
  "security-gate":     ShieldCheck,
  "security-guard":    ShieldAlert,
  "gate-house":        ShieldAlert,
  "cctv":              Cctv,
  "generator":         Zap,
  "electricity":       Zap,
  "solar-power":       Sun,
  "borehole":          Droplet,
  "borehole-water":    Droplet,
  "treated-water":     Droplets,
  "drainage":          Droplet,
  "parking":           CircleParking,
  "elevator":          ArrowUpFromDot,
  "access-road":       Route,
  "estate-road":       Route,
  "swimming-pool":     Waves,
  "gym":               Dumbbell,
  "playground":        Baby,
  "garden":            Trees,
  "clubhouse":         Wine,
  "sports-court":      Trophy,
  "cleaning-service":  SprayCan,
  "laundry":           WashingMachine,
  "concierge":         BellRing,
  "waste-disposal":    Trash2,
  "perimeter-fencing": Fence,
  "street-lights":     Lightbulb,
  "street-lighting":   Lightbulb,
  "wi-fi":             Globe,
  "dry-land":          LandPlot,
  "shopping-center":   Store,
};

// ── Subcategories ─────────────────────────────────────────────────────────────
export const SUBCATEGORY_ICONS: Record<string, LucideIcon> = {
  "apartment":   Building,
  "duplex":      Home,
  "bungalow":    Home,
  "terrace":     Building2,
  "penthouse":   Castle,
  "studio":      BedDouble,
  "self-contain":DoorOpen,
  "mansion":     Castle,
  "office":      Briefcase,
  "shop":        Store,
  "warehouse":   Warehouse,
  "plaza":       Building,
  "hotel":       Hotel,
  "plot":        LandPlot,
  "acre":        TreePine,
  "hectare":     MapPin,
};

// ── Lookups ───────────────────────────────────────────────────────────────────
export const getAmenityIcon = (slug: string): LucideIcon =>
  AMENITY_ICONS[normalise(slug)] ?? Check;

export const getFacilityIcon = (slug: string): LucideIcon =>
  FACILITY_ICONS[normalise(slug)] ?? Check;

export const getSubCategoryIcon = (slug: string): LucideIcon | undefined =>
  SUBCATEGORY_ICONS[normalise(slug)];
