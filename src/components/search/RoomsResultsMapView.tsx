import { useIsMobile } from "@/hooks/use-mobile";
import { RoomsResultsMapViewDesktop } from "./RoomsResultsMapViewDesktop";
import { RoomsResultsMapViewMobile } from "./RoomsResultsMapViewMobile";
import { RoomSearchResultDTO } from "@/types/api.types";
import { SearchFilters as SearchFiltersType } from "@/hooks/useSearchFilters";

interface RoomsResultsMapViewProps {
    filters: SearchFiltersType;
    setters: any;
    setViewMode: (val: "list" | "map") => void;
    mapCenter: { lat: number; lng: number } | undefined;
    setMapCenter: (val: { lat: number; lng: number } | undefined) => void;
    rooms: RoomSearchResultDTO[];
}

export const RoomsResultsMapView = (props: RoomsResultsMapViewProps) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <RoomsResultsMapViewMobile {...props} />;
    }

    return <RoomsResultsMapViewDesktop {...props} />;
};
