import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Map Material Icon names to Lucide React icons
const iconMap: Record<string, keyof typeof LucideIcons> = {
  // Property types
  layers: "Layers",
  apartment: "Building2",
  home: "Home",
  roofing: "Building",
  villa: "Home",
  
  // Amenities
  ac_unit: "Wind",
  chair: "Armchair",
  local_laundry_service: "Shirt",
  bathroom: "Bath",
  wifi: "Wifi",
  wifi_included: "Wifi",
  security: "Shield",
  security_system: "Shield",
  elevator: "ArrowUpDown",
  local_parking: "ParkingCircle",
  free_parking: "ParkingCircle",
  pool: "Droplets",
  swimming_pool: "Droplets",
  smoke_detector: "AlertCircle",
  smoke_alarm: "AlertCircle",
  doorman: "UserCheck",
  furnished: "Armchair",
  in_unit_laundry: "Shirt",
  private_bath: "Bath",
  
  // Genders
  female: "UserCircle",
  male: "UserCircle",
  person: "User",
  visibility_off: "EyeOff",
  
  // Professions
  calculate: "Calculator",
  architecture: "Ruler",
  business_center: "Briefcase",
  analytics: "BarChart3",
  palette: "Palette",
  medical_services: "Heart",
  engineering: "Cog",
  rocket_launch: "Rocket",
  trending_up: "TrendingUp",
  work: "Briefcase",
  gavel: "Scale",
  campaign: "Megaphone",
  local_hospital: "Hospital",
  work_outline: "Briefcase",
  manage_accounts: "UserCog",
  science: "FlaskConical",
  point_of_sale: "ShoppingCart",
  code: "Code",
  menu_book: "BookOpen",
  school: "GraduationCap",
  
  // Lifestyle
  bookworm: "BookOpen",
  clean_freak: "Sparkles",
  cleaning_services: "Sparkles",
  early_bird: "Sun",
  wb_sunny: "Sun",
  extrovert: "Users",
  group: "Users",
  fitness_enthusiast: "Dumbbell",
  fitness_center: "Dumbbell",
  foodie: "Utensils",
  restaurant: "Utensils",
  gamer: "Gamepad2",
  sports_esports: "Gamepad2",
  introvert: "User",
  minimalist: "Package",
  inventory_2: "Package",
  music_lover: "Music",
  music_note: "Music",
  night_owl: "Moon",
  nightlight: "Moon",
  non_smoker: "Ban",
  smoke_free: "Ban",
  other: "MoreHorizontal",
  more_horiz: "MoreHorizontal",
  party_animal: "PartyPopper",
  celebration: "PartyPopper",
  pet_friendly: "Heart",
  pets: "Heart",
  quiet_lifestyle: "VolumeX",
  volume_off: "VolumeX",
  smoker: "Cigarette",
  smoking_rooms: "Cigarette",
  social: "Users",
  groups: "Users",
  traveler: "Plane",
  flight: "Plane",
  vegan: "Leaf",
  spa: "Leaf",
  vegetarian: "LeafyGreen",
  eco: "LeafyGreen",
};

export const getIcon = (symbol: string | null | undefined): LucideIcon | null => {
  if (!symbol) return null;
  
  const iconName = iconMap[symbol];
  if (!iconName) return null;
  
  const IconComponent = LucideIcons[iconName] as LucideIcon;
  return IconComponent || null;
};

// Special handling for gender symbols using Unicode
const genderSymbolMap: Record<string, string> = {
  female: "♀",
  male: "♂",
};

export const IconRenderer: React.FC<{ symbol: string | null | undefined; className?: string }> = ({ 
  symbol, 
  className = "h-4 w-4" 
}) => {
  if (!symbol) return null;
  
  // Handle gender symbols with Unicode
  if (genderSymbolMap[symbol]) {
    return (
      <span className="inline-flex items-center justify-center w-4 h-4 font-semibold text-primary">
        {genderSymbolMap[symbol]}
      </span>
    );
  }
  
  const Icon = getIcon(symbol);
  if (!Icon) return null;
  return <Icon className={className} />;
};

