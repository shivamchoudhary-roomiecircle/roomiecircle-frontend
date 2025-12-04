import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, LocateFixed, Navigation } from "lucide-react";
import { searchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string) => void;
  placeholder?: string;
  className?: string;
  dropdownDirection?: 'up' | 'down';
}

export const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Where are you looking?",
  className,
  dropdownDirection = 'down'
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessionToken] = useState(() => Math.random().toString(36).substring(7));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<string>("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchPlaces = async () => {
      // Skip search if this value was just selected from dropdown
      if (value === lastSelectedRef.current) {
        return;
      }

      // Skip search if input is not focused (prevents search on initial load)
      if (document.activeElement !== inputRef.current) {
        return;
      }

      if (value.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchApi.searchPlacesStartingWith(value, sessionToken);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching places:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounce);
  }, [value, sessionToken]);

  const handleSelectPlace = (place: any) => {
    lastSelectedRef.current = place.description;
    onChange(place.description, place.placeId);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative w-full">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("h-12 text-base", className, "pr-14")}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    const geocoder = new (window as any).google.maps.Geocoder();
                    geocoder.geocode(
                      { location: { lat: latitude, lng: longitude } },
                      (results: any, status: any) => {
                        if (status === "OK" && results[0]) {
                          onChange(results[0].formatted_address, results[0].place_id);
                        }
                      }
                    );
                  },
                  (error) => {
                    console.error("Error getting location:", error);
                    if (error.code === error.PERMISSION_DENIED) {
                      // Fallback to current view (do nothing)
                      // Optionally show a toast or alert
                      alert("Please allow location access to use this feature.");
                    }
                  }
                );
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-transparent rounded-full transition-all duration-200 group"
            title="Show your location"
          >
            <Navigation className="h-5 w-5 text-blue-500 group-hover:text-blue-600 fill-current" />
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className={cn(
          "absolute z-50 w-full bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto",
          dropdownDirection === 'up' ? "bottom-full mb-1" : "mt-1"
        )}>
          {suggestions.map((place) => (
            <button
              key={place.placeId}
              onClick={() => handleSelectPlace(place)}
              className="w-full px-4 py-3 text-left hover:bg-muted flex items-start gap-3 transition-colors"
            >
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{place.mainText}</p>
                <p className="text-sm text-muted-foreground truncate">{place.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
