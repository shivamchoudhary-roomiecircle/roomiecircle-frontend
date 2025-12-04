import { useState } from "react";
import { Urgency, PropertyType, RoomType, BhkType, Amenity } from "@/types/api.types";

export interface SearchFilters {
    location: string;
    placeId: string;
    priceType: string;
    minPrice: string;
    maxPrice: string;
    radius: number;
    urgency: Urgency | undefined;
    propertyTypes: PropertyType[];
    roomTypes: RoomType[];
    bhkTypes: BhkType[];
    amenities: Amenity[];
    sortBy: string;
}

export const useSearchFilters = () => {
    const [location, setLocation] = useState("");
    const [placeId, setPlaceId] = useState("");
    const [priceType, setPriceType] = useState("monthly");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [radius, setRadius] = useState(10);
    const [urgency, setUrgency] = useState<Urgency | undefined>(undefined);
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [bhkTypes, setBhkTypes] = useState<BhkType[]>([]);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [sortBy, setSortBy] = useState("");

    const handleLocationChange = (value: string, id?: string) => {
        setLocation(value);
        if (id) {
            setPlaceId(id);
        } else if (value === "") {
            setPlaceId("");
        }
    };

    const clearFilters = () => {
        setUrgency(undefined);
        setRoomTypes([]);
        setBhkTypes([]);
        setPropertyTypes([]);
        setAmenities([]);
        setMinPrice("");
        setMaxPrice("");
        setPriceType("monthly");
    };

    return {
        filters: {
            location,
            placeId,
            priceType,
            minPrice,
            maxPrice,
            radius,
            urgency,
            propertyTypes,
            roomTypes,
            bhkTypes,
            amenities,
            sortBy,
        },
        setters: {
            setLocation,
            setPlaceId,
            setPriceType,
            setMinPrice,
            setMaxPrice,
            setRadius,
            setUrgency,
            setPropertyTypes,
            setRoomTypes,
            setBhkTypes,
            setAmenities,
            setSortBy,
            handleLocationChange,
            clearFilters,
        },
    };
};
