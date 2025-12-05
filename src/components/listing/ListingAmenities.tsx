import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconRenderer } from "@/lib/iconMapper";
import { useConfig } from "@/contexts/ConfigContext";

interface ListingAmenitiesProps {
    listing: any;
}

export function ListingAmenities({ listing }: ListingAmenitiesProps) {
    const { config } = useConfig();

    // Flatten amenities logic
    const getAllAmenities = () => {
        if (!listing.amenities) return [];

        if (Array.isArray(listing.amenities)) {
            return listing.amenities;
        }

        const all: any[] = [];
        Object.values(listing.amenities).forEach((category: any) => {
            if (Array.isArray(category)) {
                all.push(...category);
            }
        });
        return all;
    };

    const amenities = getAllAmenities();

    const getAmenityIcon = (amenityKey: string) => {
        if (!config?.amenities) return null;

        // Search in all amenity categories
        for (const category of Object.values(config.amenities) as any[]) {
            const found = category.find((a: any) => a.value === amenityKey);
            if (found?.icon) return found.icon;
            if (found?.symbol) return found.symbol;
        }

        // Fallback: try to use the key itself as symbol if it matches icon names
        return amenityKey;
    };

    return (
        <Card className="border border-border/50 shadow-md bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Amenities</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                    {amenities.length > 0 ? (
                        amenities.map((item: any) => {
                            const iconSymbol = getAmenityIcon(item.key);
                            return (
                                <div key={item.key} className="flex items-center gap-2 text-xs">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {iconSymbol ? (
                                            <IconRenderer symbol={iconSymbol} className="h-3 w-3 text-primary" />
                                        ) : (
                                            <Check className="h-3 w-3 text-primary" />
                                        )}
                                    </div>
                                    <span className="text-foreground/80">{item.label}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-muted-foreground text-sm italic">No specific amenities listed.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
