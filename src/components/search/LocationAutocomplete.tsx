import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string) => void;
  placeholder?: string;
  className?: string;
}

export const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Where are you looking?",
  className 
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

  useEffect(() => {
    const searchPlaces = async () => {
      // Skip search if this value was just selected from dropdown
      if (value === lastSelectedRef.current) {
        return;
      }

      if (value.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await apiClient.searchPlaces(value, sessionToken);
        console.log("Search results:", results);
        console.log("Results type:", typeof results, "Is array:", Array.isArray(results));
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
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-10 h-12 text-base", className)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
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
