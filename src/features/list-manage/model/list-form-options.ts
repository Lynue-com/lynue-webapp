export const LIST_TYPES = [
  { value: "RENT" as const, label: "Rent", desc: "List for tenants to rent" },
  { value: "SELL" as const, label: "Sell", desc: "List for buyers to purchase" },
];

export const LIST_AS = [
  { value: "OWNER" as const, label: "Owner", desc: "I own this property" },
  { value: "AGENT" as const, label: "Agent", desc: "I represent the owner" },
];

export const FURNISHING_OPTIONS = [
  { value: "FURNISHED" as const, label: "Furnished" },
  { value: "SEMI_FURNISHED" as const, label: "Semi-furnished" },
  { value: "UNFURNISHED" as const, label: "Unfurnished" },
];

export const CONDITION_OPTIONS = [
  { value: "NEW" as const, label: "New / Newly Built" },
  { value: "RENOVATED" as const, label: "Renovated" },
  { value: "FAIRLY_USED" as const, label: "Fairly Used" },
  { value: "OLD" as const, label: "Old" },
  { value: "UNDER_CONSTRUCTION" as const, label: "Under Construction" },
];

export const TITLE_DOCUMENTS = [
  { value: "c_of_o" as const, label: "Certificate of Occupancy (C of O)" },
  { value: "governors_consent" as const, label: "Governor's Consent" },
  { value: "deed_of_assignment" as const, label: "Deed of Assignment" },
  { value: "registered_survey" as const, label: "Registered Survey" },
  { value: "receipt_of_purchase" as const, label: "Receipt of Purchase" },
  { value: "excision" as const, label: "Excision" },
  { value: "gazette" as const, label: "Gazette" },
  { value: "none" as const, label: "None / Other" },
];

export const PRICE_UNITS = [
  { value: "YEAR" as const, label: "Per Year" },
  { value: "MONTH" as const, label: "Per Month" },
  { value: "WEEK" as const, label: "Per Week" },
  { value: "DAY" as const, label: "Per Day" },
];

export const AMENITIES = [
  { slug: "air-conditioning", label: "Air Conditioning" },
  { slug: "ceiling-fan", label: "Ceiling Fan" },
  { slug: "water-heater", label: "Water Heater" },
  { slug: "kitchen", label: "Kitchen" },
  { slug: "fitted-kitchen", label: "Fitted Kitchen" },
  { slug: "smart-home", label: "Smart Home" },
  { slug: "tv-cable", label: "TV Cable" },
  { slug: "wi-fi", label: "Wi-Fi" },
  { slug: "walk-in-closet", label: "Walk-in Closet" },
  { slug: "wardrobe", label: "Wardrobe" },
  { slug: "en-suite", label: "En-suite Bathroom" },
  { slug: "balcony", label: "Balcony" },
  { slug: "terrace", label: "Terrace" },
  { slug: "jacuzzi", label: "Jacuzzi" },
  { slug: "private-pool", label: "Private Pool" },
  { slug: "garden", label: "Private Garden" },
  { slug: "garage", label: "Garage" },
  { slug: "furnished", label: "Furnished" },
  { slug: "semi-furnished", label: "Semi-Furnished" },
  { slug: "waterfront", label: "Waterfront" },
];

export const FACILITIES = [
  { slug: "security-gate", label: "Security Gate" },
  { slug: "security-guard", label: "Security Guard" },
  { slug: "cctv", label: "CCTV" },
  { slug: "generator", label: "Generator" },
  { slug: "solar-power", label: "Solar Power" },
  { slug: "borehole", label: "Borehole" },
  { slug: "treated-water", label: "Treated Water" },
  { slug: "parking", label: "Parking" },
  { slug: "elevator", label: "Elevator" },
  { slug: "access-road", label: "Access Road" },
  { slug: "swimming-pool", label: "Swimming Pool" },
  { slug: "gym", label: "Gym" },
  { slug: "playground", label: "Playground" },
  { slug: "garden", label: "Garden" },
  { slug: "clubhouse", label: "Clubhouse" },
  { slug: "sports-court", label: "Sports Court" },
  { slug: "cleaning-service", label: "Cleaning Service" },
  { slug: "laundry", label: "Laundry" },
  { slug: "concierge", label: "Concierge" },
  { slug: "waste-disposal", label: "Waste Disposal" },
  { slug: "perimeter-fencing", label: "Perimeter Fencing" },
  { slug: "drainage", label: "Drainage System" },
  { slug: "street-lights", label: "Street Lights" },
  { slug: "wi-fi", label: "Estate Wi-Fi" },
  { slug: "dry-land", label: "Dry Land" },
];
