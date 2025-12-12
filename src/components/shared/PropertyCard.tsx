import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Heart } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { ReactNode, useRef } from "react";

export interface PropertyCardProps {
    id: number | string;
    images?: { url: string }[];
    price?: number;
    address?: string;
    badges?: ReactNode[]; // For status (Active/Draft) or other top-right badges
    footer?: ReactNode;   // For action buttons or additional info
    onClick?: () => void;
    className?: string;
    priceLabel?: string;  // e.g. "/mo"
    children?: ReactNode; // Main content area (Title, features, etc)
    isWishlisted?: boolean;
    onToggleWishlist?: (e: React.MouseEvent) => void;
}

export const PropertyCard = ({
    images = [],
    price,
    address,
    badges,
    footer,
    onClick,
    className,
    priceLabel = "/mo",
    children,
    isWishlisted,
    onToggleWishlist
}: PropertyCardProps) => {

    const formatPrice = (p?: number) => {
        if (!p) return "N/A";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(p);
    };

    const hasPreloaded = useRef(false);

    const handleMouseEnter = () => {
        if (hasPreloaded.current || !images?.length) return;
        hasPreloaded.current = true;

        // Dynamic import to avoid circular dependency if utilizing a utility that imports components
        import("@/lib/imagePreload").then(({ preloadImages }) => {
            preloadImages(images.map(img => img.url));
        });
    };

    return (
        <Card
            className={cn(
                "group overflow-hidden border-border/50 bg-card hover:shadow-xl transition-all duration-300 relative flex flex-col h-full",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
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
                                            alt={`Property photo ${index + 1}`}
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
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselPrevious className="static translate-y-0 h-8 w-8 bg-black/30 backdrop-blur-md hover:bg-black/50 border border-white/20 text-white shadow-sm transition-all duration-200 hover:scale-110" />
                                </div>
                                <div
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CarouselNext className="static translate-y-0 h-8 w-8 bg-black/30 backdrop-blur-md hover:bg-black/50 border border-white/20 text-white shadow-sm transition-all duration-200 hover:scale-110" />
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

                {/* Price Badge - Always Top Left */}
                {price !== undefined && (
                    <div className="absolute top-3 left-3 z-10">
                        <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg shadow-sm border border-white/10">
                            <div className="flex items-baseline gap-1 text-white">
                                <span className="font-bold">{formatPrice(price)}</span>
                                <span className="text-[10px] opacity-80 font-medium">{priceLabel}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Right Badges & Wishlist */}
                {((badges && badges.length > 0) || onToggleWishlist) && (
                    <div className="absolute top-3 right-3 z-10 flex gap-2 items-center">
                        {badges}
                        {onToggleWishlist && (
                            <button
                                onClick={onToggleWishlist}
                                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-110"
                            >
                                <Heart
                                    className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")}
                                />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1 gap-3">
                {/* Header: Title or Address (Optional standard header logic) */}
                {address && (
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <p className="text-xs truncate" title={address}>
                            {address}
                        </p>
                    </div>
                )}

                {/* Main injected content */}
                <div className="flex-1">
                    {children}
                </div>

                {/* Footer Area */}
                {footer && (
                    <div className="mt-auto pt-3 border-t border-border/50">
                        {footer}
                    </div>
                )}
            </div>
        </Card>
    );
};
