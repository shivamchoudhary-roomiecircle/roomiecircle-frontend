import React, { useState, useEffect, useRef } from 'react';
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { GoogleMap } from "@/components/search/GoogleMap";

interface StepLocationProps {
    formData: any;
    onChange: (field: string, value: any) => void;
    onLocationSelect: (address: string, placeId: string) => void;
}

const DELHI_CENTER = { lat: 28.6129, lng: 77.2295 };

export function StepLocation({ formData, onChange, onLocationSelect }: StepLocationProps) {
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
        formData.latitude && formData.longitude
            ? { lat: Number(formData.latitude), lng: Number(formData.longitude) }
            : DELHI_CENTER
    );
    const [searchValue, setSearchValue] = useState(formData.addressText || "");
    const isUserDraggingRef = useRef(false);

    // Handle map center changes from pin dragging
    const handleCenterChange = async (center: { lat: number; lng: number }) => {
        if (!isUserDraggingRef.current) {
            isUserDraggingRef.current = true;
        }

        setMapCenter(center);

        // Update coordinates immediately
        onChange("latitude", center.lat);
        onChange("longitude", center.lng);

        // Reverse geocode to get address
        try {
            const google = (window as any).google;
            if (google?.maps) {
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: center }, (results: any, status: any) => {
                    if (status === "OK" && results[0]) {
                        setSearchValue(results[0].formatted_address);
                        onChange("addressText", results[0].formatted_address);
                        onChange("placeId", results[0].place_id);
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
        onChange("addressText", value);

        if (placeId) {
            // User selected a place from autocomplete
            onLocationSelect(value, placeId);

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
                            onChange("latitude", newCenter.lat);
                            onChange("longitude", newCenter.lng);
                            onChange("placeId", placeId);
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
        if (!formData.addressText && !formData.latitude) {
            // Only set if no location is already set
            setMapCenter({ lat: location.lat, lng: location.lng });
            setSearchValue(location.address);
            onChange("addressText", location.address);
            onChange("latitude", location.lat);
            onChange("longitude", location.lng);
            if (location.placeId) {
                onChange("placeId", location.placeId);
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
                            <p className="text-xs text-muted-foreground">
                                Drag the pin to adjust your exact location
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
