import {
    Amenity,
    Gender,
    Profession,
    PropertyType,
    RoomType,
    RoomStatus,
    LifestylePreference,
    Urgency
} from "@api-docs/typescript/enums";

export interface UIConfig {
    label: string;
    iconName?: string;
    value: string;
    symbol?: string; // For gender symbols etc
}

// Helper to create simple config
const cfg = (value: string, label: string, iconName?: string, symbol?: string): UIConfig => ({
    value, label, iconName, symbol
});

export const PROPERTY_TYPE_UI: Record<PropertyType, UIConfig> = {
    [PropertyType.INDEPENDENT_HOUSE]: cfg(PropertyType.INDEPENDENT_HOUSE, "Independent House", "home"),
    [PropertyType.GATED_SOCIETY]: cfg(PropertyType.GATED_SOCIETY, "Gated Society", "layers"),
    [PropertyType.PENTHOUSE]: cfg(PropertyType.PENTHOUSE, "Penthouse", "roofing"),
    [PropertyType.DUPLEX]: cfg(PropertyType.DUPLEX, "Duplex", "villa"),
    [PropertyType.VILLA]: cfg(PropertyType.VILLA, "Villa", "villa"),
};

export const ROOM_TYPE_UI: Record<RoomType, UIConfig> = {
    [RoomType.PRIVATE_ROOM]: cfg(RoomType.PRIVATE_ROOM, "Private Room", "security"),
    [RoomType.SHARED_ROOM]: cfg(RoomType.SHARED_ROOM, "Shared Room", "group"),
};

export const AMENITY_UI: Record<Amenity, UIConfig> = {
    [Amenity.PRIVATE_BATH]: cfg(Amenity.PRIVATE_BATH, "Private Bath", "private_bath"),
    [Amenity.FURNISHED]: cfg(Amenity.FURNISHED, "Furnished", "chair"),
    [Amenity.BALCONY]: cfg(Amenity.BALCONY, "Balcony", "wb_sunny"),
    [Amenity.AIR_CONDITIONING]: cfg(Amenity.AIR_CONDITIONING, "Air Conditioning", "ac_unit"),
    [Amenity.WIFI_INCLUDED]: cfg(Amenity.WIFI_INCLUDED, "Wifi Included", "wifi"),
    [Amenity.IN_UNIT_LAUNDRY]: cfg(Amenity.IN_UNIT_LAUNDRY, "In-Unit Laundry", "local_laundry_service"),
    [Amenity.ELEVATOR]: cfg(Amenity.ELEVATOR, "Elevator", "elevator"),
    [Amenity.DOORMAN]: cfg(Amenity.DOORMAN, "Doorman", "doorman"),
    [Amenity.SWIMMING_POOL]: cfg(Amenity.SWIMMING_POOL, "Swimming Pool", "pool"),
    [Amenity.FREE_PARKING]: cfg(Amenity.FREE_PARKING, "Free Parking", "local_parking"),
    [Amenity.SMOKE_ALARM]: cfg(Amenity.SMOKE_ALARM, "Smoke Alarm", "smoke_detector"),
    [Amenity.SECURITY_SYSTEM]: cfg(Amenity.SECURITY_SYSTEM, "Security System", "security"),
    [Amenity.GYM]: cfg(Amenity.GYM, "Gym", "fitness_center"),
};

export const GENDER_UI: Record<Gender, UIConfig> = {
    [Gender.MALE]: cfg(Gender.MALE, "Male", undefined, "♂"),
    [Gender.FEMALE]: cfg(Gender.FEMALE, "Female", undefined, "♀"),
    [Gender.ANY]: cfg(Gender.ANY, "Any", "group"),
    [Gender.NOT_SURE_YET]: cfg(Gender.NOT_SURE_YET, "Not Sure Yet", "person"),
};

export const PROFESSION_UI: Record<Profession, UIConfig> = {
    [Profession.SOFTWARE_ENGINEER]: cfg(Profession.SOFTWARE_ENGINEER, "Software Engineer", "code"),
    [Profession.DATA_SCIENTIST]: cfg(Profession.DATA_SCIENTIST, "Data Scientist", "analytics"),
    [Profession.PRODUCT_MANAGER]: cfg(Profession.PRODUCT_MANAGER, "Product Manager", "work"),
    [Profession.DESIGNER]: cfg(Profession.DESIGNER, "Designer", "palette"),
    [Profession.MARKETING]: cfg(Profession.MARKETING, "Marketing", "campaign"),
    [Profession.SALES]: cfg(Profession.SALES, "Sales", "point_of_sale"),
    [Profession.CONSULTANT]: cfg(Profession.CONSULTANT, "Consultant", "business_center"),
    [Profession.DOCTOR]: cfg(Profession.DOCTOR, "Doctor", "medical_services"),
    [Profession.NURSE]: cfg(Profession.NURSE, "Nurse", "local_hospital"),
    [Profession.TEACHER]: cfg(Profession.TEACHER, "Teacher", "school"),
    [Profession.LAWYER]: cfg(Profession.LAWYER, "Lawyer", "gavel"),
    [Profession.ACCOUNTANT]: cfg(Profession.ACCOUNTANT, "Accountant", "calculate"),
    [Profession.FINANCIAL_ANALYST]: cfg(Profession.FINANCIAL_ANALYST, "Financial Analyst", "trending_up"),
    [Profession.RESEARCHER]: cfg(Profession.RESEARCHER, "Researcher", "science"),
    [Profession.STUDENT]: cfg(Profession.STUDENT, "Student", "menu_book"),
    [Profession.ENTREPRENEUR]: cfg(Profession.ENTREPRENEUR, "Entrepreneur", "rocket_launch"),
    [Profession.FREELANCER]: cfg(Profession.FREELANCER, "Freelancer", "work_outline"),
    [Profession.ARCHITECT]: cfg(Profession.ARCHITECT, "Architect", "architecture"),
    [Profession.ENGINEER]: cfg(Profession.ENGINEER, "Engineer", "engineering"),
    [Profession.OTHER]: cfg(Profession.OTHER, "Other", "more_horiz"),
};

export const LIFESTYLE_UI: Record<LifestylePreference, UIConfig> = {
    [LifestylePreference.EARLY_BIRD]: cfg(LifestylePreference.EARLY_BIRD, "Early Bird", "early_bird"),
    [LifestylePreference.NIGHT_OWL]: cfg(LifestylePreference.NIGHT_OWL, "Night Owl", "night_owl"),
    [LifestylePreference.SMOKER]: cfg(LifestylePreference.SMOKER, "Smoker", "smoker"),
    [LifestylePreference.NON_SMOKER]: cfg(LifestylePreference.NON_SMOKER, "Non Smoker", "non_smoker"),
    [LifestylePreference.VEGETARIAN]: cfg(LifestylePreference.VEGETARIAN, "Vegetarian", "vegetarian"),
    [LifestylePreference.VEGAN]: cfg(LifestylePreference.VEGAN, "Vegan", "vegan"),
    [LifestylePreference.PET_FRIENDLY]: cfg(LifestylePreference.PET_FRIENDLY, "Pet Friendly", "pet_friendly"),
    [LifestylePreference.FITNESS_ENTHUSIAST]: cfg(LifestylePreference.FITNESS_ENTHUSIAST, "Fitness Enthusiast", "fitness_enthusiast"),
    [LifestylePreference.MUSIC_LOVER]: cfg(LifestylePreference.MUSIC_LOVER, "Music Lover", "music_lover"),
    [LifestylePreference.GAMER]: cfg(LifestylePreference.GAMER, "Gamer", "gamer"),
    [LifestylePreference.BOOKWORM]: cfg(LifestylePreference.BOOKWORM, "Bookworm", "bookworm"),
    [LifestylePreference.TRAVELER]: cfg(LifestylePreference.TRAVELER, "Traveler", "traveler"),
    [LifestylePreference.SOCIAL]: cfg(LifestylePreference.SOCIAL, "Social", "social"),
    [LifestylePreference.INTROVERT]: cfg(LifestylePreference.INTROVERT, "Introvert", "introvert"),
    [LifestylePreference.EXTROVERT]: cfg(LifestylePreference.EXTROVERT, "Extrovert", "extrovert"),
    [LifestylePreference.CLEAN_FREAK]: cfg(LifestylePreference.CLEAN_FREAK, "Clean Freak", "clean_freak"),
    [LifestylePreference.MINIMALIST]: cfg(LifestylePreference.MINIMALIST, "Minimalist", "minimalist"),
    [LifestylePreference.FOODIE]: cfg(LifestylePreference.FOODIE, "Foodie", "foodie"),
    [LifestylePreference.PARTY_ANIMAL]: cfg(LifestylePreference.PARTY_ANIMAL, "Party Animal", "party_animal"),
    [LifestylePreference.QUIET_LIFESTYLE]: cfg(LifestylePreference.QUIET_LIFESTYLE, "Quiet Lifestyle", "quiet_lifestyle"),
};

export const ROOM_STATUS_UI: Record<RoomStatus, UIConfig> = {
    [RoomStatus.ACTIVE]: cfg(RoomStatus.ACTIVE, "Active"),
    [RoomStatus.INACTIVE]: cfg(RoomStatus.INACTIVE, "Inactive"),
    [RoomStatus.ARCHIVED]: cfg(RoomStatus.ARCHIVED, "Archived"),
};

export const URGENCY_UI: Record<Urgency, UIConfig> = {
    [Urgency.IMMEDIATE]: cfg(Urgency.IMMEDIATE, "Immediate"),
    [Urgency.WITHIN_1_WEEK]: cfg(Urgency.WITHIN_1_WEEK, "Within 1 Week"),
    [Urgency.WITHIN_1_MONTH]: cfg(Urgency.WITHIN_1_MONTH, "Within 1 Month"),
    [Urgency.FLEXIBLE]: cfg(Urgency.FLEXIBLE, "Flexible"),
};

// Map arrays for iteration if needed
export const ROOM_TYPES = Object.values(ROOM_TYPE_UI);
export const PROPERTY_TYPES = Object.values(PROPERTY_TYPE_UI);
export const AMENITIES = Object.values(AMENITY_UI);
export const PROFESSIONS = Object.values(PROFESSION_UI);
export const GENDERS = Object.values(GENDER_UI);
export const LIFESTYLES = Object.values(LIFESTYLE_UI);
export const ROOM_STATUSES = Object.values(ROOM_STATUS_UI);

export const BHK_TYPES = [
    { value: "0", label: "RK" },
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
    { value: "4", label: "4+ BHK" }
];

export const AMENITY_GROUPS = {
    "IN_UNIT": [
        AMENITY_UI[Amenity.PRIVATE_BATH],
        AMENITY_UI[Amenity.FURNISHED],
        AMENITY_UI[Amenity.BALCONY],
        AMENITY_UI[Amenity.AIR_CONDITIONING],
        AMENITY_UI[Amenity.WIFI_INCLUDED],
        AMENITY_UI[Amenity.IN_UNIT_LAUNDRY],
    ],
    "BUILDING": [
        AMENITY_UI[Amenity.ELEVATOR],
        AMENITY_UI[Amenity.DOORMAN],
        AMENITY_UI[Amenity.SWIMMING_POOL],
        AMENITY_UI[Amenity.FREE_PARKING],
        AMENITY_UI[Amenity.GYM],
    ],
    "SAFETY": [
        AMENITY_UI[Amenity.SMOKE_ALARM],
        AMENITY_UI[Amenity.SECURITY_SYSTEM],
    ]
};
