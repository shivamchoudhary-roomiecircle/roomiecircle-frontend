import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, MoreVertical, Edit, Trash, Eye, EyeOff, Calendar, Home, BedDouble, Bath, Armchair } from "lucide-react";
import { RoomListingDTO } from "@/types/api.types";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

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
        roomType,
        bhkType,
        propertyType,
        status,
        availableDate,
        hasPrivateWashroom,
        hasFurniture,
        floor,
    } = listing;

    const formatPrice = (price?: number) => {
        if (!price) return "N/A";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
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
                "group overflow-hidden border-border/50 bg-card hover:shadow-xl transition-all duration-300 relative flex flex-col h-full",
                !isActive && "opacity-75 hover:opacity-100",
                className
            )}
        >
            {/* Image Carousel */}
            <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                {images && images.length > 0 ? (
                    <Carousel className="w-full h-full group/carousel">
                        <CarouselContent>
                            {images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-[16/10] relative w-full h-full">
                                        <img
                                            src={getImageUrl(image.url)}
                                            alt={`Room photo ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
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
                                    <CarouselPrevious className="h-8 w-8 bg-black/20 backdrop-blur-md hover:bg-black/40 border-0 text-white shadow-sm" />
                                </div>
                                <div
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselNext className="h-8 w-8 bg-black/20 backdrop-blur-md hover:bg-black/40 border-0 text-white shadow-sm" />
                                </div>
                            </>
                        )}
                        {/* Photo count badge */}
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-medium text-white pointer-events-none">
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
                <div className="absolute top-3 left-3">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg shadow-sm border border-white/10">
                        <div className="flex items-baseline gap-1 text-white">
                            <span className="font-bold">{formatPrice(monthlyRent)}</span>
                            <span className="text-[10px] opacity-80 font-medium">/mo</span>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                            "text-[10px] font-semibold px-2.5 py-0.5 shadow-sm backdrop-blur-md border border-white/10",
                            isActive ? "bg-green-500/90 hover:bg-green-500 text-white" : "bg-gray-500/90 hover:bg-gray-500 text-white"
                        )}
                    >
                        {status || "DRAFT"}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 gap-4">
                {/* Header: Address & Title */}
                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg leading-tight truncate flex-1" title={addressText}>
                            {addressText?.split(',')[0] || "Untitled Listing"}
                        </h3>

                        {/* Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(id)} className="cursor-pointer">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Listing
                                    </DropdownMenuItem>
                                )}
                                {onStatusChange && (
                                    <DropdownMenuItem
                                        onClick={() => onStatusChange(id, isActive ? "INACTIVE" : "ACTIVE")}
                                        className="cursor-pointer"
                                    >
                                        {isActive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                        {isActive ? "Deactivate" : "Activate"}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {onDelete && (
                                    <DropdownMenuItem onClick={() => onDelete(id)} className="text-destructive cursor-pointer focus:text-destructive">
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete Listing
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <p className="text-xs truncate max-w-[90%]" title={addressText}>
                            {addressText || "Location not available"}
                        </p>
                    </div>
                </div>

                {/* Key Features Grid */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Home className="w-4 h-4 shrink-0 text-primary/70" />
                        <span className="truncate">{formatRoomType(roomType)}</span>
                    </div>
                    {bhkType && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <BedDouble className="w-4 h-4 shrink-0 text-primary/70" />
                            <span className="truncate uppercase">{bhkType}</span>
                        </div>
                    )}
                    {hasPrivateWashroom && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Bath className="w-4 h-4 shrink-0 text-primary/70" />
                            <span className="truncate">Attached Bath</span>
                        </div>
                    )}
                    {hasFurniture && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Armchair className="w-4 h-4 shrink-0 text-primary/70" />
                            <span className="truncate">Furnished</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {availableDate ? `Available: ${format(new Date(availableDate), 'MMM d, yyyy')}` : "Available Now"}
                        </span>
                    </div>

                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => onEdit(id)}
                        >
                            Manage
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
