import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ShieldCheck, MapPin } from "lucide-react";
import { RoomSearchResultDTO } from "@/types/api.types";
import { cn, getImageUrl } from "@/lib/utils";

interface ListingCardProps {
    listing: RoomSearchResultDTO;
    onClick?: () => void;
    className?: string;
}

export const ListingCard = ({ listing, onClick, className }: ListingCardProps) => {
    const {
        monthlyRent,
        address,
        photos,
        lister,
        roomType,
        bhkType,
        propertyTypes,
    } = listing;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatRoomType = (type: string) => {
        switch (type) {
            case "private_room": return "Private Room";
            case "shared_room": return "Shared Room";
            case "entire_place": return "Entire Place";
            default: return type.replace(/_/g, ' ');
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

    return (
        <Card
            className={cn(
                "group overflow-hidden cursor-pointer border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                className
            )}
            onClick={onClick}
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
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                                    <CarouselPrevious className="h-6 w-6 bg-background/80 backdrop-blur-sm hover:bg-background border-0 shadow-sm" />
                                </div>
                                <div
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselNext className="h-6 w-6 bg-background/80 backdrop-blur-sm hover:bg-background border-0 shadow-sm" />
                                </div>
                            </>
                        )}
                        {/* Photo count badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-medium text-white pointer-events-none">
                            1 / {photos.length}
                        </div>
                    </Carousel>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                        <MapPin className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-xs">No photos available</span>
                    </div>
                )}

                {/* Price Badge - Floating */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-full shadow-sm border border-border/50 z-10">
                    <div className="flex items-baseline gap-1">
                        <span className="font-bold text-foreground">{formatPrice(monthlyRent)}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">/mo</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                {/* Lister Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-border ring-2 ring-background">
                            <AvatarImage src={getImageUrl(lister?.profilePicture) || undefined} alt={lister?.name} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                                {lister?.name ? getInitials(lister.name) : "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold leading-none">{lister?.name || "Unknown User"}</span>
                                {lister?.verified && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                )}
                            </div>
                            <span className="text-[10px] text-muted-foreground capitalize">
                                {lister?.verificationLevel?.toLowerCase().replace(/_/g, ' ') || "Unverified"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Room Details */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                        <span>{formatRoomType(roomType)}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{bhkType !== undefined && bhkType !== null ? formatBhkType(bhkType) : 'N/A'}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{propertyTypes?.[0] || "Apartment"}</span>
                    </div>

                    <div className="flex items-start gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground truncate leading-tight" title={address}>
                            {address || "Location not available"}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
