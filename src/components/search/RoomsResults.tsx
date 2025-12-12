import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { RoomsResultsListView } from "./RoomsResultsListView";
import { RoomsResultsMapView } from "./RoomsResultsMapView";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useRoomSearch } from "@/hooks/useRoomSearch";
import { RoomsResultsHeader } from "./RoomsResultsHeader";

export const RoomsResults = () => {
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const debouncedMapCenter = useDebounce(mapCenter, 300);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { filters, setters } = useSearchFilters();
  const { placeId } = filters;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useRoomSearch({ filters, viewMode, debouncedMapCenter });

  // Effect to resolve placeId to coordinates whenever it changes
  useEffect(() => {
    if (placeId) {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ placeId: placeId }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          setMapCenter({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
      });
    } else {
      setMapCenter(undefined);
    }
  }, [placeId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const rooms = data?.pages.flatMap((page) => page.content) || [];
  const totalElements = data?.pages[0]?.totalElements || 0;

  return (
    <>
      <RoomsResultsHeader
        filters={filters}
        setters={setters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalElements={totalElements}
        isLoading={isLoading}
      />

      <div className={viewMode === "list" ? "block" : "hidden"}>
        <RoomsResultsListView
          filters={filters}
          setters={setters}
          setViewMode={setViewMode}
          isLoading={isLoading}
          totalElements={totalElements}
          rooms={rooms}
          observerTarget={observerTarget}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>

      <div className={viewMode === "map" ? "block" : "hidden"}>
        <RoomsResultsMapView
          filters={filters}
          setters={setters}
          setViewMode={setViewMode}
          mapCenter={mapCenter}
          setMapCenter={setMapCenter}
          rooms={rooms}
        />
      </div>
    </>
  );
};
