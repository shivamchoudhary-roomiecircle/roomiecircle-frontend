import { IconRenderer } from "@/lib/iconMapper";
import { SectionProps } from "./types";
import { AMENITY_GROUPS } from "@/constants/ui-constants";

export const AmenitiesSection = ({ formData, onChange }: SectionProps) => {

    const handleAmenityToggle = (amenityValue: string) => {
        const currentAmenities = formData.amenities || [];
        const newAmenities = currentAmenities.includes(amenityValue)
            ? currentAmenities.filter(a => a !== amenityValue)
            : [...currentAmenities, amenityValue];

        onChange("amenities", newAmenities);
    };

    const renderCategory = (title: string, items: any[]) => {
        // Safe guard against items being undefined or not an array which would break .map
        if (!items || !Array.isArray(items)) return null;

        return (
            <div key={title}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
                <div className="flex flex-wrap gap-2">
                    {items.map((amenity: any) => (
                        <div
                            key={amenity.value}
                            className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors flex items-center gap-2 ${formData.amenities.includes(amenity.value)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted"
                                }`}
                            onClick={() => handleAmenityToggle(amenity.value)}
                        >
                            <IconRenderer symbol={amenity.iconName} />
                            <span>{amenity.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="bg-card rounded-lg border shadow-sm px-4 py-4 space-y-6">
                {Object.entries(AMENITY_GROUPS).map(([key, items]) => {
                    // Map key to title: IN_UNIT -> In Unit, etc. or just use keys if they are readable
                    // Keys in AMENITY_GROUPS are "IN_UNIT", "BUILDING", "SAFETY"
                    const title = key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                    return renderCategory(title, items);
                })}
            </div>
        </div>
    );
};
