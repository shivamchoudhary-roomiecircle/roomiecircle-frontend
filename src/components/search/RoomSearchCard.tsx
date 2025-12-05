import { useCallback, useRef } from "react";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { MapPin, Home, Bed, Building2 } from "lucide-react";
import { RoomSearchResultDTO, RoomType, BhkType, PropertyType } from "@/types/api.types";
import { cn, getImageUrl } from "@/lib/utils.ts";
import { preloadImages } from "@/lib/imagePreload.ts";

interface RoomSearchCardProps {
    room: RoomSearchResultDTO;
    onClick?: () => void;
    className?: string;
}

export const RoomSearchCard = ({ room, onClick, className }: RoomSearchCardProps) => {
    const {
        monthlyRent,
        address,
        photos,
        roomType,
        bhkType,
        propertyTypes,
        floor,
    } = room;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatRoomType = (type: RoomType) => {
        switch (type) {
            case RoomType.PRIVATE_ROOM: return "Private Room";
            case RoomType.SHARED_ROOM: return "Shared Room";
            default: return (type as string)?.replace(/_/g, ' ') || type;
        }
    };

    const formatBhkType = (type: number) => {
        switch (type) {
            case 0: return "RK";
            case 1: return "1 BHK";
            case 2: return "2 BHK";
            case 3: return "3 BHK";
            case 4: return "4 BHK";
            default: return `${type} BHK`;
        }
    };

    const formatPropertyType = (type: PropertyType) => {
        return type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || type;
    };

    const formatFloor = (floorNum?: number) => {
        if (floorNum === undefined || floorNum === null) return null;
        if (floorNum === 0) return "Ground Floor";
        if (floorNum === 1) return "1st Floor";
        if (floorNum === 2) return "2nd Floor";
        if (floorNum === 3) return "3rd Floor";
        return `${floorNum}th Floor`;
    };

    const getRoomTypeIcon = (type: RoomType) => {
        switch (type) {
            case RoomType.PRIVATE_ROOM: return "🚪";
            case RoomType.SHARED_ROOM: return "👥";
            default: return "🏠";
        }
    };

    const floorDisplay = formatFloor(floor);

    // Track if we've already preloaded to avoid duplicate work
    const hasPreloaded = useRef(false);

    const handleMouseEnter = useCallback(() => {
        if (hasPreloaded.current || !photos?.length) return;
        hasPreloaded.current = true;
        // Preload all photos for instant loading on detail page
        preloadImages(photos.map(p => p.url));
    }, [photos]);

    return (
        <Card
            className={cn(
                "group overflow-hidden cursor-pointer border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                className
            )}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
        >
            {/* Image Carousel */}
            <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                {photos && photos.length > 0 ? (
                    <Carousel className="w-full h-full group/carousel">
                        <CarouselContent>
                            {photos.map((photo, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-[16/10] relative w-full h-full">
                                        <img
                                            src={getImageUrl(photo.url)}
                                            alt={`Room photo ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading={index === 0 ? "eager" : "lazy"}
                                            fetchPriority={index === 0 ? "high" : "auto"}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {photos.length > 1 && (
                            <>
                                <div
                                    className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselPrevious className="h-6 w-6 bg-background/90 backdrop-blur-md hover:bg-background border-0 shadow-lg" />
                                </div>
                                <div
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselNext className="h-6 w-6 bg-background/90 backdrop-blur-md hover:bg-background border-0 shadow-lg" />
                                </div>
                            </>
                        )}
                        {/* Photo count badge */}
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-lg rounded text-[10px] font-medium text-white pointer-events-none shadow-md">
                            1/{photos.length}
                        </div>
                    </Carousel>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50 text-muted-foreground">
                        <MapPin className="w-8 h-8 mb-1 opacity-20" />
                        <span className="text-[10px] font-medium">No photos</span>
                    </div>
                )}

                {/* Price Badge - Glassmorphism */}
                <div className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-xl rounded-full shadow-md border border-white/20 z-10 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-baseline gap-0.5">
                        <span className="font-bold text-white text-xs">{formatPrice(monthlyRent)}</span>
                        <span className="text-[9px] text-white/90 font-medium">/mo</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                {/* Info Badges Row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Room Type Badge */}
                    <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold transition-all"
                    >
                        <span className="mr-1">{getRoomTypeIcon(roomType)}</span>
                        {formatRoomType(roomType)}
                    </Badge>

                    {/* BHK Badge */}
                    <Badge
                        variant="secondary"
                        className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 px-1.5 py-0.5 text-[10px] font-semibold transition-all"
                    >
                        <Bed className="w-2.5 h-2.5 mr-1" />
                        {formatBhkType(bhkType)}
                    </Badge>

                    {/* Floor Badge */}
                    {floorDisplay && (
                        <Badge
                            variant="secondary"
                            className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 px-1.5 py-0.5 text-[10px] font-semibold transition-all"
                        >
                            <Building2 className="w-2.5 h-2.5 mr-1" />
                            {floorDisplay}
                        </Badge>
                    )}
                </div>

                {/* Location */}
                <div className="flex items-start gap-1.5 min-w-0">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    <p
                        className="text-xs text-muted-foreground truncate leading-tight flex-1"
                        title={address}
                    >
                        {address || "Location not available"}
                    </p>
                </div>

                {/* Property Type Tags */}
                {propertyTypes && propertyTypes.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Home className="w-3 h-3 text-muted-foreground/60" />
                        {propertyTypes.slice(0, 2).map((type, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-1.5 py-0.5 rounded border border-border bg-background/50 text-[10px] font-medium text-foreground/70"
                            >
                                {formatPropertyType(type)}
                            </span>
                        ))}
                        {propertyTypes.length > 2 && (
                            <span className="text-[10px] text-muted-foreground font-medium">
                                +{propertyTypes.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
