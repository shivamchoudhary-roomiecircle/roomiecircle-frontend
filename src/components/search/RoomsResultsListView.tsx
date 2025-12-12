import { useIsMobile } from "@/hooks/use-mobile";
import { RoomsResultsListViewDesktop } from "./RoomsResultsListViewDesktop";
import { RoomsResultsListViewMobile } from "./RoomsResultsListViewMobile";
import { RoomSearchResultDTO } from "@/types/api.types";
import { SearchFilters as SearchFiltersType } from "@/hooks/useSearchFilters";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistApi } from "@/lib/api/wishlist";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";


interface RoomsResultsListViewProps {
    filters: SearchFiltersType;
    setters: any;
    setViewMode: (val: "list" | "map") => void;
    isLoading: boolean;
    totalElements: number;
    rooms: RoomSearchResultDTO[];
    observerTarget: React.RefObject<HTMLDivElement>;
    isFetchingNextPage: boolean;
}

export const RoomsResultsListView = (props: RoomsResultsListViewProps) => {
    const isMobile = useIsMobile();
    const { isAuthenticated } = useAuth();
    const [wishlistedRoomIds, setWishlistedRoomIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!isAuthenticated) {
            setWishlistedRoomIds(new Set());
            return;
        }

        const fetchWishlist = async () => {
            try {
                // Fetching first 100 items - optimisation needed for large wishlists
                const response = await wishlistApi.getWishlist({ page: 0, size: 100 });
                if (response.success && response.data) {
                    const ids = new Set(response.data.content.map(item => item.id));
                    setWishlistedRoomIds(ids);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };

        fetchWishlist();
    }, [isAuthenticated]);

    const handleToggleWishlist = useCallback(async (roomId: number) => {
        if (!isAuthenticated) {
            toast.error("Please login to manage your wishlist");
            return;
        }

        const isCurrentlyWishlisted = wishlistedRoomIds.has(roomId);

        // Optimistic update
        setWishlistedRoomIds(prev => {
            const next = new Set(prev);
            if (isCurrentlyWishlisted) {
                next.delete(roomId);
            } else {
                next.add(roomId);
            }
            return next;
        });

        try {
            if (isCurrentlyWishlisted) {
                await wishlistApi.removeFromWishlist(roomId);
                toast.success("Removed from wishlist");
            } else {
                await wishlistApi.addToWishlist(roomId);
                toast.success("Added to wishlist");
            }
        } catch (error) {
            // Revert on failure
            setWishlistedRoomIds(prev => {
                const next = new Set(prev);
                if (isCurrentlyWishlisted) {
                    next.add(roomId);
                } else {
                    next.delete(roomId);
                }
                return next;
            });
            toast.error("Failed to update wishlist");
        }
    }, [isAuthenticated, wishlistedRoomIds]);

    const extendedProps = {
        ...props,
        wishlistedRoomIds,
        onToggleWishlist: handleToggleWishlist
    };

    if (isMobile) {
        return <RoomsResultsListViewMobile {...extendedProps} />;
    }

    return <RoomsResultsListViewDesktop {...extendedProps} />;
};
