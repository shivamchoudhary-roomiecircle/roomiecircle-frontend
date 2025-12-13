import { z } from "zod";
import {
    Amenity,
    Gender,
    Profession,
    PropertyType,
    RoomType,
    LifestylePreference
} from "../types/api.types";

// Shared Schemas
const requiredString = z.string().min(1, "This field is required");
const positiveNumber = z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Must be greater than 0");
const nonNegativeNumber = z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, "Cannot be negative");

export const propertyStepSchema = z.object({
    roomType: z.nativeEnum(RoomType, { errorMap: () => ({ message: "Please select a room type" }) }),
    // bhkType is 0-20. 0 means RK.
    bhkType: z.coerce.number()
        .min(0, "Must be 0 or more")
        .max(20, "Must be 20 or less")
        .int("Must be an integer"),
    propertyType: z.array(z.nativeEnum(PropertyType)).optional(),
});

export const locationStepSchema = z.object({
    addressText: z.string().min(5, "Address must be at least 5 characters"),
    placeId: z.string().min(1, "Please select a location from the suggestions"),
    latitude: z.number(),
    longitude: z.number(),
});

export const basicsStepSchema = z.object({
    // Floor: can be negative (basement), 0 (ground), or positive
    floor: z.coerce.number().int("Floor must be an integer"),
    availableDate: z.string().refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Date cannot be in the past",
    }),
    description: z.string().min(10, "Description must be at least 10 characters long"),
});

export const amenitiesStepSchema = z.object({
    amenities: z.array(z.string()), // Strings from Amenity enum, managed manually for now or via UI
});

export const pricingStepSchema = z.object({
    monthlyRent: positiveNumber,
    deposit: positiveNumber,
    maintenance: nonNegativeNumber,
    maintenanceIncluded: z.boolean(),
});

export const preferencesStepSchema = z.object({
    gender: z.nativeEnum(Gender).optional().or(z.literal("")),
    minAge: z.coerce.number().min(18, "Min age must be 18+").optional().or(z.literal("")),
    maxAge: z.coerce.number().max(100, "Max age must be under 100").optional().or(z.literal("")),
    profession: z.nativeEnum(Profession).optional().or(z.literal("")),
    lifestyle: z.array(z.nativeEnum(LifestylePreference)).optional(),
}).refine((data) => {
    if (data.minAge && data.maxAge) {
        return Number(data.minAge) <= Number(data.maxAge);
    }
    return true;
}, {
    message: "Min age cannot be greater than max age",
    path: ["minAge"],
});

export const photosStepSchema = z.object({
    images: z.array(z.object({
        id: z.number(),
        url: z.string(),
        isUploading: z.boolean().optional()
    })).min(1, "Add at least 1 photo"),
});

// Combined Schema
export const listingSchema = z.intersection(
    propertyStepSchema,
    z.intersection(
        locationStepSchema,
        z.intersection(
            basicsStepSchema,
            z.intersection(
                amenitiesStepSchema,
                z.intersection(
                    pricingStepSchema,
                    z.intersection(
                        preferencesStepSchema,
                        photosStepSchema
                    )
                )
            )
        )
    )
);

export type ListingFormData = z.infer<typeof listingSchema>;
