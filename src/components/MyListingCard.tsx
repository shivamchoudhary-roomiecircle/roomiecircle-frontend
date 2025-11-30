import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ShieldCheck, MapPin, MoreVertical, Edit, Trash, Eye, EyeOff } from "lucide-react";
import { RoomListingDTO } from "@/types/api.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MyListingCardProps {
    listing: RoomListingDTO;
    onEdit?: (listingId: number) => void;
    onDelete?: (listingId: number) => void;
    onStatusChange?: (listingId: number, newStatus: string) => void;
    className?: string;
}

export const MyListingCard = ({ listing, onEdit, onDelete, onStatusChange, className }: MyListingCardProps) => {
    const {
        id,
        monthlyRent,
        addressText,
        images,
        lister,
        roomType,
        bhkType,
        propertyType,
        status,
    } = listing;

    const formatPrice = (price?: number) => {
        if (!price) return "N/A";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatRoomType = (type?: string) => {
        if (!type) return "";
        switch (type) {
            case "private_room": return "Private Room";
            case "shared_room": return "Shared Room";
            case "entire_place": return "Entire Place";
            default: return type.replace(/_/g, ' ');
        }
    };

    const isActive = status === "ACTIVE";

    return (
        <Card
            className={cn(
                "group overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 relative",
                !isActive && "opacity-60",
                className
            )}
        >
            {/* Image Carousel */}
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {images && images.length > 0 ? (
                    <Carousel className="w-full h-full group/carousel">
                        <CarouselContent>
                            {images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-[4/3] relative w-full h-full">
                                        <img
                                            src={image.url}
                                            alt={`Room photo ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {images.length > 1 && (
                            <>
                                <div
                                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselPrevious className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background border-0 shadow-sm" />
                                </div>
                                <div
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselNext className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background border-0 shadow-sm" />
                                </div>
                            </>
                        )}
                        {/* Photo count badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-medium text-white pointer-events-none">
                            1 / {images.length}
                        </div>
                    </Carousel>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                        <MapPin className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-xs">No photos available</span>
                    </div>
                )}

                {/* Price Badge */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-full shadow-sm border border-border/50 z-10">
                    <div className="flex items-baseline gap-1">
                        <span className="font-bold text-foreground">{formatPrice(monthlyRent)}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">/mo</span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">
                        {status || "DRAFT"}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Lister Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-border ring-2 ring-background">
                            <AvatarImage src={lister?.profilePicture || undefined} alt={lister?.name} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                                {getInitials(lister?.name)}
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

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {onStatusChange && (
                                <DropdownMenuItem onClick={() => onStatusChange(id, isActive ? "INACTIVE" : "ACTIVE")}>
                                    {isActive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                    {isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <DropdownMenuItem onClick={() => onDelete(id)} className="text-destructive">
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Room Details */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/90 flex-wrap">
                        <span>{formatRoomType(roomType)}</span>
                        {bhkType && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span>{bhkType}</span>
                            </>
                        )}
                        {propertyType && propertyType[0] && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span>{propertyType[0]}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-start gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground truncate leading-tight" title={addressText}>
                            {addressText || "Location not available"}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
