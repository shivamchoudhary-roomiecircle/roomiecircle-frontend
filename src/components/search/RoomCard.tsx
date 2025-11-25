import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, ShieldCheck, Shield } from "lucide-react";

interface RoomCardProps {
    listing: any;
    onClick?: () => void;
}

export const RoomCard = ({ listing, onClick }: RoomCardProps) => {
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

    return (
        <Card
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 group border-border/50"
            onClick={onClick}
        >
            {/* Header: Lister Details */}
            <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
                <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={lister?.profilePicture} alt={lister?.name} />
                    <AvatarFallback>{lister?.name ? getInitials(lister.name) : "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{lister?.name || "Unknown User"}</span>
                        {lister?.verified && (
                            <ShieldCheck className="w-4 h-4 text-primary fill-primary/20" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {lister?.verificationLevel && (
                            <Badge variant="secondary" className="h-5 px-1.5 font-normal text-[10px]">
                                {lister.verificationLevel}
                            </Badge>
                        )}
                        {/* We can add 'Today' or posted date here if available in future */}
                    </div>
                </div>
            </CardHeader>

            {/* Body: Photos Carousel */}
            <div className="relative aspect-[4/3] bg-muted">
                {photos && photos.length > 0 ? (
                    <Carousel className="w-full h-full group/carousel">
                        <CarouselContent>
                            {photos.map((photo: string, index: number) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img
                                            src={photo}
                                            alt={`Room photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {photos.length > 1 && (
                            <>
                                <div
                                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselPrevious className="static translate-y-0 h-8 w-8 bg-background/80 hover:bg-background border-0" />
                                </div>
                                <div
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselNext className="static translate-y-0 h-8 w-8 bg-background/80 hover:bg-background border-0" />
                                </div>
                            </>
                        )}
                    </Carousel>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        No photos available
                    </div>
                )}
            </div>

            {/* Footer: Room Details */}
            <CardContent className="p-4 space-y-3">
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">{formatPrice(monthlyRent)}</span>
                    <span className="text-sm text-muted-foreground">/ mo</span>
                </div>

                <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">
                        {roomType === "private_room" ? "Private Room" : roomType === "shared_room" ? "Shared Room" : "Entire Place"}
                        {" · "}
                        {bhkType}
                        {" · "}
                        {propertyTypes?.[0] || "Apartment"}
                    </div>
                    {/* Placeholder for availability date as it's missing in API */}
                    {/* <div className="text-sm text-muted-foreground">Nov 24, 2025 - Flexible</div> */}

                    <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
                        {/* <MapPin className="w-3.5 h-3.5" /> */}
                        <span className="truncate max-w-full bg-muted px-2 py-1 rounded-full text-xs font-medium text-foreground/80" title={address}>
                            {address || "Address not available"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
