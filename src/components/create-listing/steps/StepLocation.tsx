import React, { useState, useRef } from 'react';
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { GoogleMap } from "@/components/search/GoogleMap";
import { useFormContext } from "react-hook-form";
import { ListingFormData } from "@/schemas/listingSchema";

const DELHI_CENTER = { lat: 28.6129, lng: 77.2295 };

export function StepLocation() {
    const { setValue, getValues, formState: { errors } } = useFormContext<ListingFormData>();

    // We can still use local state for map visual center if needed, or drive it from form
    // Driving from form is better for persistence.
    // However, GoogleMap component manages its own center usually unless controlled.

    const lat = getValues("latitude");
    const lng = getValues("longitude");

    const initialCenter = (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : DELHI_CENTER;

    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(initialCenter);
    const [searchValue, setSearchValue] = useState(getValues("addressText") || "");
    const isUserDraggingRef = useRef(false);

    // Handle map center changes from pin dragging
    const handleCenterChange = async (center: { lat: number; lng: number }) => {
        if (!isUserDraggingRef.current) {
            isUserDraggingRef.current = true;
        }

        setMapCenter(center);

        // Update coordinates
        setValue("latitude", center.lat, { shouldValidate: true });
        setValue("longitude", center.lng, { shouldValidate: true });

        // Reverse geocode to get address
        try {
            const google = (window as any).google;
            if (google?.maps) {
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: center }, (results: any, status: any) => {
                    if (status === "OK" && results[0]) {
                        console.log("Map pin drag location found:", {
                            address: results[0].formatted_address,
                            placeId: results[0].place_id
                        });
                        setSearchValue(results[0].formatted_address);
                        setValue("addressText", results[0].formatted_address, { shouldValidate: true });
                        setValue("placeId", results[0].place_id, { shouldValidate: true });
                    }
                });
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
        } finally {
            setTimeout(() => {
                isUserDraggingRef.current = false;
            }, 500);
        }
    };

    // Handle search selection
    const handleSearchChange = async (value: string, placeId?: string) => {
        setSearchValue(value);
        setValue("addressText", value, { shouldValidate: true });

        if (placeId) {
            // User selected a place from autocomplete
            setValue("placeId", placeId, { shouldValidate: true });

            // Get coordinates for the selected place using Google Geocoder
            try {
                const google = (window as any).google;
                if (google?.maps) {
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ placeId: placeId }, (results: any, status: any) => {
                        if (status === "OK" && results[0]) {
                            const location = results[0].geometry.location;
                            const newCenter = {
                                lat: location.lat(),
                                lng: location.lng()
                            };
                            setMapCenter(newCenter);
                            setValue("latitude", newCenter.lat, { shouldValidate: true });
                            setValue("longitude", newCenter.lng, { shouldValidate: true });
                        } else {
                            console.error("Geocode failed:", status);
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching place details:", error);
            }
        }
    };

    // Handle initial location detection
    const handleInitialLocationFound = (location: { lat: number; lng: number; address: string; placeId?: string }) => {
        const currentAddr = getValues("addressText");
        if (!currentAddr) {
            // Only set if no location is already set
            setMapCenter({ lat: location.lat, lng: location.lng });
            setSearchValue(location.address);
            setValue("addressText", location.address, { shouldValidate: true });
            setValue("latitude", location.lat, { shouldValidate: true });
            setValue("longitude", location.lng, { shouldValidate: true });
            if (location.placeId) {
                setValue("placeId", location.placeId, { shouldValidate: true });
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Map Container - fills available space */}
            <div className="flex-1 relative rounded-xl overflow-hidden border border-border min-h-0">
                <GoogleMap
                    center={mapCenter}
                    showMovablePin={true}
                    onCenterChange={handleCenterChange}
                    fullscreenControl={false}
                    onInitialLocationFound={handleInitialLocationFound}
                    gestureHandling="none"
                    pinDraggable={false}
                />

                {/* Search Bar Overlay at Bottom */}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                    <div className="bg-background/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-border p-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">
                                Search for location
                            </label>
                            <LocationAutocomplete
                                value={searchValue}
                                onChange={handleSearchChange}
                                placeholder="Search for your property's location..."
                                className="h-10 text-sm"
                                dropdownDirection="up"
                            />
                            {errors.addressText && (
                                <p className="text-xs text-destructive font-medium">{errors.addressText.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
