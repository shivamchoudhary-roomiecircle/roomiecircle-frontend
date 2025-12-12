import { RoomType } from "@/types/api.types";
import { Gender } from "@api-docs/typescript/enums";

export interface RoommateData {
    name: string;
    gender: string;
    age: number;
    profession: string;
    bio: string;
}

export interface NeighborhoodRatings {
    safety: number;
    connectivity: number;
    amenities: number;
}

export interface ListingFormData {
    description: string;
    roomType: string; // RoomType
    bhkType: string;
    floor: number;
    availableDate: string;
    propertyType: string[];


    // Pricing
    monthlyRent: number;
    deposit: number;
    maintenance: number;
    maintenanceIncluded: boolean;

    // Location
    addressText: string;
    placeId: string;

    // Amenities
    amenities: string[];

    // Roommates & Preferences
    roommates: RoommateData[];
    minAge: string; // Form input is string, parsed to number
    maxAge: string;
    gender: string; // Gender
    profession: string;
    lifestyle: string[];

    // Neighborhood
    neighborhoodReview: string;
    neighborhoodRatings: NeighborhoodRatings;
    neighborhoodImages: { id: number; url: string; isUploading?: boolean }[];

    // Images
    images: { id: number; url: string; isUploading?: boolean }[];
}

export interface SectionProps {
    formData: ListingFormData;
    onChange: (field: string, value: any) => void; // Generic handler
    onPartialChange?: (updates: Partial<ListingFormData>) => void; // For complex updates
}
