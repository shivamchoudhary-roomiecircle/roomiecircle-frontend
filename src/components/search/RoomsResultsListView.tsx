import { useIsMobile } from "@/hooks/use-mobile";
import { RoomsResultsListViewDesktop } from "./RoomsResultsListViewDesktop";
import { RoomsResultsListViewMobile } from "./RoomsResultsListViewMobile";
import { RoomSearchResultDTO } from "@/types/api.types";
import { SearchFilters as SearchFiltersType } from "@/hooks/useSearchFilters";

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

    if (isMobile) {
        return <RoomsResultsListViewMobile {...props} />;
    }

    return <RoomsResultsListViewDesktop {...props} />;
};
