export interface Photo {
    url: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
    fullUrl: string | null;
}

export interface Lister {
    id: number;
    name: string;
    profilePicture: string | null;
    verified: boolean;
    verificationLevel: string;
}

export interface Listing {
    id: number;
    monthlyRent: number;
    address: string;
    photos: Photo[];
    lister: Lister;
    roomType: string;
    bhkType: string;
    floor: number;
    propertyTypes: string[];
    latitude?: number;
    longitude?: number;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}
