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
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {amenities.length > 0 ? (
                        amenities.map((item: any) => {
                            const iconSymbol = getAmenityIcon(item.key);
                            return (
                                <div key={item.key} className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {iconSymbol ? (
                                            <IconRenderer symbol={iconSymbol} className="h-4 w-4 text-primary" />
                                        ) : (
                                            <Check className="h-4 w-4 text-primary" />
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
