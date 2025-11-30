import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { MapPin, Home, Bed, Building2 } from "lucide-react";
import { RoomSearchResultDTO } from "@/types/api.types";
import { cn } from "@/lib/utils.ts";

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

    const formatRoomType = (type: string) => {
        switch (type) {
            case "private_room": return "Private Room";
            case "shared_room": return "Shared Room";
            case "entire_place": return "Entire Place";
            default: return type.replace(/_/g, ' ');
        }
    };

    const formatFloor = (floorNum?: number) => {
        if (floorNum === undefined || floorNum === null) return null;
        if (floorNum === 0) return "Ground Floor";
        if (floorNum === 1) return "1st Floor";
        if (floorNum === 2) return "2nd Floor";
        if (floorNum === 3) return "3rd Floor";
        return `${floorNum}th Floor`;
    };

    const getRoomTypeIcon = (type: string) => {
        switch (type) {
            case "private_room": return "🚪";
            case "shared_room": return "👥";
            case "entire_place": return "🏡";
            default: return "🏠";
        }
    };

    const floorDisplay = formatFloor(floor);

    return (
        <Card
            className={cn(
                "group overflow-hidden cursor-pointer border-border/50 bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2",
                className
            )}
            onClick={onClick}
        >
            {/* Image Carousel */}
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {photos && photos.length > 0 ? (
                    <Carousel className="w-full h-full group/carousel">
                        <CarouselContent>
                            {photos.map((photo, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-[4/3] relative w-full h-full">
                                        <img
                                            src={photo.url}
                                            alt={`Room photo ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {photos.length > 1 && (
                            <>
                                <div
                                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselPrevious className="h-8 w-8 bg-background/90 backdrop-blur-md hover:bg-background border-0 shadow-lg" />
                                </div>
                                <div
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselNext className="h-8 w-8 bg-background/90 backdrop-blur-md hover:bg-background border-0 shadow-lg" />
                                </div>
                            </>
                        )}
                        {/* Photo count badge */}
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-lg rounded-lg text-[11px] font-semibold text-white pointer-events-none shadow-lg">
                            1 / {photos.length}
                        </div>
                    </Carousel>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50 text-muted-foreground">
                        <MapPin className="w-12 h-12 mb-2 opacity-20" />
                        <span className="text-xs font-medium">No photos available</span>
                    </div>
                )}

                {/* Price Badge - Glassmorphism */}
                <div className="absolute top-3 left-3 px-4 py-2 bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-xl rounded-full shadow-lg border border-white/20 z-10 hover:scale-105 transition-transform duration-200">
                    <div className="flex items-baseline gap-1">
                        <span className="font-bold text-white text-sm">{formatPrice(monthlyRent)}</span>
                        <span className="text-[10px] text-white/90 font-medium">/mo</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
                {/* Info Badges Row */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Room Type Badge */}
                    <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105"
                    >
                        <span className="mr-1.5">{getRoomTypeIcon(roomType)}</span>
                        {formatRoomType(roomType)}
                    </Badge>

                    {/* BHK Badge */}
                    <Badge
                        variant="secondary"
                        className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105"
                    >
                        <Bed className="w-3 h-3 mr-1.5" />
                        {bhkType}
                    </Badge>

                    {/* Floor Badge */}
                    {floorDisplay && (
                        <Badge
                            variant="secondary"
                            className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105"
                        >
                            <Building2 className="w-3 h-3 mr-1.5" />
                            {floorDisplay}
                        </Badge>
                    )}
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p
                        className="text-sm text-muted-foreground truncate leading-tight flex-1"
                        title={address}
                    >
                        {address || "Location not available"}
                    </p>
                </div>

                {/* Property Type Tags */}
                {propertyTypes && propertyTypes.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                        <Home className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {propertyTypes.slice(0, 3).map((type, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background/50 text-[11px] font-medium text-foreground/70 hover:bg-accent transition-colors"
                            >
                                {type}
                            </span>
                        ))}
                        {propertyTypes.length > 3 && (
                            <span className="text-[11px] text-muted-foreground font-medium">
                                +{propertyTypes.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
