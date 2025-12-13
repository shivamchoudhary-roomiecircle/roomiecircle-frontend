/**
 * TypeScript Interface Definitions for RoomieCircle Backend API
 * 
 * This file contains all response type definitions for the API endpoints.
 * All endpoints return data wrapped in the ApiResponse<T> structure.
 */

// ============================================================================
// COMMON / BASE TYPES
// ============================================================================

/**
 * Validation errors with field-specific messages
 */
export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Base API response wrapper - all endpoints return this structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string; // ISO 8601 format
}

/**
 * Paginated response for list endpoints
 */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// ============================================================================
// AUTH MODULE - Authentication & Authorization
// ============================================================================

/**
 * POST /api/v1/auth/signup/initiate-verification
 * Response when initiating signup process
 */
export interface SignupInitiateResponse {
  message: string;
  tempId: string;
}

/**
 * POST /api/v1/auth/signup/verify
 * POST /api/v1/auth/login
 * POST /api/v1/auth/google
 * POST /api/v1/auth/login/otp/verify
 * Response for successful authentication (signup, login, google auth, OTP login)
 */
export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  email: string;
  name: string;
  profilePicture?: string;
  isVerified: boolean;
}

/**
 * POST /api/v1/auth/token/refresh
 * Response when refreshing access token
 */
export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * POST /api/v1/auth/signup/resend-verification
 * Response when resending verification code
 */
export interface ResendVerificationResponse {
  message: string;
}

/**
 * POST /api/v1/auth/login/otp/initiate
 * Response when initiating OTP login
 */
export interface OtpLoginInitiateResponse {
  message: string;
  tempId: string;
}

// ============================================================================
// USER MODULE - User Profile Management
// ============================================================================

/**
 * GET /api/v1/users/me
 * PUT /api/v1/users/me
 * Full user profile data
 */
export interface UserProfileDTO {
  userId: number;
  email: string;
  phone?: string;
  profileScore?: number;
  verificationLevel?: string;
  bio?: string;
  occupation?: string;
  company?: string;
  age?: number;
  gender?: string;
  profilePhotoUrl?: string;
  lifestylePreferences?: Record<string, any>;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations?: string[];
  hasFlatSecured?: boolean;
  flatDetails?: Record<string, any>;
  linkedinVerified?: boolean;
  workEmailVerified?: boolean;
}

/**
 * POST /api/v1/users/me/photo
 * Response after uploading profile photo
 */
export type UploadProfilePhotoResponse = string; // The photo URL

/**
 * DELETE /api/v1/users/me
 * Response after account deletion
 */
export type DeleteAccountResponse = null;

// ============================================================================
// ROOM LISTING MODULE - Room Listing Management
// ============================================================================

/**
 * POST /api/v1/listings/rooms
 * GET /api/v1/listings/rooms/{id}
 * PATCH /api/v1/listings/rooms/{id}
 * PATCH /api/v1/listings/rooms/{id}/status
 * Detailed room listing with all fields
 */
export interface RoomListingDTO {
  id: number;
  listerId: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  placeId?: string;
  monthlyRent?: number;
  maintenance?: number;
  maintenanceIncluded?: boolean;
  deposit?: number;
  availableDate?: string; // LocalDate format: YYYY-MM-DD
  roomType?: RoomType; // 'private_room' | 'shared_room'
  propertyType?: PropertyType[];
  bhkType?: BhkType; // 'rk' | '1bhk' | '2bhk' | '3bhk'
  floor?: number;
  hasBalcony?: boolean;
  hasPrivateWashroom?: boolean;
  hasFurniture?: boolean;
  amenities?: Record<string, any>;
  images?: MediaDto[];
  neighborhoodReview?: string;
  neighborhoodRatings?: Record<string, number>;
  neighborhoodImages?: MediaDto[];
  roommatePreferences?: RoommatePreferenceDTO;
  existingRoommates?: ExistingRoommateDTO[];
  lister?: ListerSummaryDTO;
  status?: string;
  completionScore?: number;
  publishedAt?: string; // ISO 8601
  deactivatedAt?: string; // ISO 8601
  createdAt?: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

/**
 * GET /api/v1/listings/rooms/my
 * Response containing user's room listings grouped by status
 */
export interface MyRoomsResponse {
  active: RoomListingDTO[];
  inactive: RoomListingDTO[];
}

/**
 * DELETE /api/v1/listings/rooms/{id}
 * Response after deleting a room
 */
export type DeleteRoomResponse = null;

// ============================================================================
// ROOM SEARCH MODULE - Room Search & Discovery
// ============================================================================

/**
 * GET /api/v1/search/rooms/recent
 * GET /api/v1/search/rooms/location
 * GET /api/v1/search/rooms/map
 * Simplified room data for search results
 */
export const Urgency = {
  IMMEDIATE: 'IMMEDIATE',
  WITHIN_1_WEEK: 'WITHIN_1_WEEK',
  WITHIN_1_MONTH: 'WITHIN_1_MONTH',
  FLEXIBLE: 'FLEXIBLE'
} as const;

export type Urgency = typeof Urgency[keyof typeof Urgency];

export const PropertyType = {
  INDEPENDENT_HOUSE: 'INDEPENDENT_HOUSE',
  GATED_SOCIETY: 'GATED_SOCIETY',
  PENTHOUSE: 'PENTHOUSE',
  DUPLEX: 'DUPLEX',
  VILLA: 'VILLA'
} as const;

export type PropertyType = typeof PropertyType[keyof typeof PropertyType];

export const RoomType = {
  PRIVATE_ROOM: 'PRIVATE_ROOM',
  SHARED_ROOM: 'SHARED_ROOM'
} as const;

export type RoomType = typeof RoomType[keyof typeof RoomType];

export const BhkType = {
  RK: 'RK',
  ONE_BHK: 'ONE_BHK',
  TWO_BHK: 'TWO_BHK',
  THREE_BHK: 'THREE_BHK'
} as const;

export type BhkType = typeof BhkType[keyof typeof BhkType];

export const Amenity = {
  // IN_HOME
  WIFI_INCLUDED: 'WIFI_INCLUDED',
  IN_UNIT_LAUNDRY: 'IN_UNIT_LAUNDRY',
  PRIVATE_BATH: 'PRIVATE_BATH',
  FURNISHED: 'FURNISHED',
  AIR_CONDITIONING: 'AIR_CONDITIONING',
  BALCONY: 'BALCONY',
  // ON_PROPERTY
  ELEVATOR: 'ELEVATOR',
  GYM: 'GYM',
  DOORMAN: 'DOORMAN',
  SWIMMING_POOL: 'SWIMMING_POOL',
  FREE_PARKING: 'FREE_PARKING',
  // SAFETY
  SMOKE_ALARM: 'SMOKE_ALARM',
  SECURITY_SYSTEM: 'SECURITY_SYSTEM'
} as const;

export type Amenity = typeof Amenity[keyof typeof Amenity];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  ANY: 'ANY',
  NOT_SURE_YET: 'NOT_SURE_YET'
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export const Profession = {
  SOFTWARE_ENGINEER: 'SOFTWARE_ENGINEER',
  DATA_SCIENTIST: 'DATA_SCIENTIST',
  PRODUCT_MANAGER: 'PRODUCT_MANAGER',
  DESIGNER: 'DESIGNER',
  MARKETING: 'MARKETING',
  SALES: 'SALES',
  CONSULTANT: 'CONSULTANT',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  TEACHER: 'TEACHER',
  LAWYER: 'LAWYER',
  ACCOUNTANT: 'ACCOUNTANT',
  FINANCIAL_ANALYST: 'FINANCIAL_ANALYST',
  RESEARCHER: 'RESEARCHER',
  STUDENT: 'STUDENT',
  ENTREPRENEUR: 'ENTREPRENEUR',
  FREELANCER: 'FREELANCER',
  ARCHITECT: 'ARCHITECT',
  ENGINEER: 'ENGINEER',
  OTHER: 'OTHER'
} as const;

export type Profession = typeof Profession[keyof typeof Profession];

export const LifestylePreference = {
  EARLY_BIRD: 'EARLY_BIRD',
  NIGHT_OWL: 'NIGHT_OWL',
  SMOKER: 'SMOKER',
  NON_SMOKER: 'NON_SMOKER',
  VEGETARIAN: 'VEGETARIAN',
  VEGAN: 'VEGAN',
  PET_FRIENDLY: 'PET_FRIENDLY',
  FITNESS_ENTHUSIAST: 'FITNESS_ENTHUSIAST',
  MUSIC_LOVER: 'MUSIC_LOVER',
  GAMER: 'GAMER',
  BOOKWORM: 'BOOKWORM',
  TRAVELER: 'TRAVELER',
  SOCIAL: 'SOCIAL',
  INTROVERT: 'INTROVERT',
  EXTROVERT: 'EXTROVERT',
  CLEAN_FREAK: 'CLEAN_FREAK',
  MINIMALIST: 'MINIMALIST',
  FOODIE: 'FOODIE',
  PARTY_ANIMAL: 'PARTY_ANIMAL',
  QUIET_LIFESTYLE: 'QUIET_LIFESTYLE'
} as const;

export type LifestylePreference = typeof LifestylePreference[keyof typeof LifestylePreference];

export const RoomStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED'
} as const;

export type RoomStatus = typeof RoomStatus[keyof typeof RoomStatus];

export interface RoomSearchFilterRequest {
  placeId?: string;
  radiusKm?: number;
  minRent?: number;
  maxRent?: number;
  urgency?: Urgency;
  propertyType?: PropertyType[];
  bhkType?: BhkType[];
  amenities?: Amenity[];
  roomType?: RoomType[];
  page?: number;
  size?: number;
  gender?: string;
  floorMin?: number;
  floorMax?: number;
}

export interface RoomSearchFilterOnMapRequest {
  // add map bounds in a google map view
  // bounds: {
  //   ne: {
  //     lat: number;
  //     lng: number;
  //   };
  //   sw: {
  //     lat: number;
  //     lng: number;
  //   };
  // }

  placeId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minRent?: number;
  maxRent?: number;
  urgency?: Urgency;
  propertyType?: PropertyType[];
  bhkType?: BhkType[];
  amenities?: Amenity[];
  roomType?: RoomType[];
}

/**
 * GET /api/v1/search/rooms/recent
 * GET /api/v1/search/rooms/location
 * GET /api/v1/search/rooms/map
 * Simplified room data for search results
 */
export interface RoomSearchResultDTO {
  id: number;
  monthlyRent: number;
  address: string;
  latitude?: number;
  longitude?: number;
  photos: MediaLinkDTO[];
  lister: ListerSummaryDTO;
  roomType?: RoomType;
  bhkType?: number; // 0 = RK, 1 = 1BHK, 2 = 2BHK, etc.
  floor?: number;
  propertyTypes?: PropertyType[];
}

/**
 * GET /api/v1/search/rooms/{id}
 * Detailed room listing for public view (search result detail page)
 */
export interface RoomListingDetailDTO {
  id: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  placeId?: string;
  monthlyRent?: number;
  maintenance?: number;
  maintenanceIncluded?: boolean;
  deposit?: number;
  availableDate?: string; // LocalDate format: YYYY-MM-DD
  roomType?: string;
  propertyType?: string[];
  bhkType?: string;
  floor?: number;
  hasBalcony?: boolean;
  hasPrivateWashroom?: boolean;
  hasFurniture?: boolean;
  amenities?: Record<string, any>;
  images?: MediaLinkDTO[];
  neighborhoodReview?: string;
  neighborhoodRatings?: Record<string, number>;
  neighborhoodImages?: MediaLinkDTO[];
  roommatePreferences?: RoommatePreferenceDTO;
  existingRoommates?: ExistingRoommateDTO[];
  lister?: ListerSummaryDTO;
  publishedAt?: string; // ISO 8601
}

// ============================================================================
// PLACE MODULE - Google Places Integration
// ============================================================================

/**
 * GET /api/v1/places/autocomplete
 * Response with place suggestions
 */
export interface PlaceAutocompleteResponse {
  suggestions: PlaceSuggestionDTO[];
}

export interface PlaceSuggestionDTO {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

/**
 * GET /api/v1/places/{placeId}
 * Detailed place information
 */
export interface PlaceDetailsDTO {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// ============================================================================
// MEDIA MODULE - File Upload & Management
// ============================================================================

/**
 * POST /api/v1/media/upload-url
 * Response with pre-signed URL for direct S3 upload
 */
export interface UploadResponseDto {
  uploadId: string; // Redis key for temporary media data
  presigned_url: string; // Note: uses snake_case in JSON response
  tag: ResourceTag;
  mediaType: MediaType;
}

/**
 * POST /api/v1/media/confirm/{uploadId}
 * Response after confirming upload
 */
export interface MediaDto {
  id: number;
  url: string;
  tag: ResourceTag;
  mediaType: MediaType;
  status: MediaStatus;
  originalName?: string;
  createdAt: string; // ISO 8601
  thumbnailUrl?: string;
  mediumUrl?: string;
  fullUrl?: string;
}

/**
 * GET /api/v1/media/resource/{resourceId}
 * List of media for a resource
 */
export type MediaListResponse = MediaDto[];

/**
 * DELETE /api/v1/media/{mediaId}
 * PUT /api/v1/media/reorder
 * Response for deletion and reorder operations
 */
export type MediaMutationResponse = null;

/**
 * Simplified media data (just URLs, no metadata)
 * Used in search results to reduce payload size
 */
export interface MediaLinkDTO {
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  fullUrl?: string;
}

// Media-related enums
export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type MediaStatus = 'PENDING' | 'ACTIVE' | 'DELETED';
export type ResourceTag =
  | 'LISTING'
  | 'NEIGHBORHOOD'
  | 'PROFILE';

// ============================================================================
// CONFIGURATION MODULE - Platform Configuration
// ============================================================================

/**
 * GET /api/v1/configuration
 * Platform configuration with all enum values for dropdowns
 */
export interface ClientConfigResponse {
  roomTypes: EnumOption[];
  propertyTypes: EnumOption[];
  bhkTypes: EnumOption[];
  roomStatuses: EnumOption[];
  amenityCategories: EnumOption[];
  amenities: Record<string, EnumOption[]>; // Keyed by category value
  genders: EnumOption[];
  professions: EnumOption[];
  lifestylePreferences: EnumOption[];
}

export interface EnumOption {
  value: string; // Value to send to API
  label: string; // Display name
  symbol?: string; // Optional icon/emoji
}

// ============================================================================
// NESTED / SHARED TYPES
// ============================================================================

/**
 * Roommate preference criteria for a room listing
 */
export interface RoommatePreferenceDTO {
  minAge?: number;
  maxAge?: number;
  gender?: string;
  profession?: string;
  lifestyle?: string[];
}

/**
 * Information about existing roommates in the property
 */
export interface ExistingRoommateDTO {
  name: string;
  gender?: string;
  age?: number;
  profession?: string;
  bio?: string;
}

/**
 * Summary information about the room lister
 */
export interface ListerSummaryDTO {
  id: number;
  name: string;
  profilePicture?: string;
  verified?: boolean;
  verificationLevel?: string;
}

// ============================================================================
// API ENDPOINT REFERENCE
// ============================================================================

/**
 * Complete API Endpoint Reference with Response Types
 *
 * AUTH ENDPOINTS:
 * - POST   /api/v1/auth/signup/initiate-verification     -> ApiResponse<SignupInitiateResponse>
 * - POST   /api/v1/auth/signup/verify                    -> ApiResponse<AuthResponse>
 * - POST   /api/v1/auth/login                            -> ApiResponse<AuthResponse>
 * - POST   /api/v1/auth/google                           -> ApiResponse<AuthResponse>
 * - POST   /api/v1/auth/token/refresh                    -> ApiResponse<RefreshTokenResponse>
 * - POST   /api/v1/auth/signup/resend-verification       -> ApiResponse<ResendVerificationResponse>
 * - POST   /api/v1/auth/login/otp/initiate               -> ApiResponse<OtpLoginInitiateResponse>
 * - POST   /api/v1/auth/login/otp/verify                 -> ApiResponse<AuthResponse>
 *
 * USER ENDPOINTS:
 * - GET    /api/v1/users/me                              -> ApiResponse<UserProfileDTO>
 * - PUT    /api/v1/users/me                              -> ApiResponse<UserProfileDTO>
 * - POST   /api/v1/users/me/photo                        -> ApiResponse<string>
 * - DELETE /api/v1/users/me                              -> ApiResponse<null>
 *
 * ROOM LISTING ENDPOINTS:
 * - POST   /api/v1/listings/rooms                        -> ApiResponse<RoomListingDTO>
 * - GET    /api/v1/listings/rooms/{id}                   -> ApiResponse<RoomListingDTO>
 * - PATCH  /api/v1/listings/rooms/{id}                   -> ApiResponse<RoomListingDTO>
 * - DELETE /api/v1/listings/rooms/{id}                   -> ApiResponse<null>
 * - PATCH  /api/v1/listings/rooms/{id}/status            -> ApiResponse<RoomListingDTO>
 * - GET    /api/v1/listings/rooms/my                     -> ApiResponse<MyRoomsResponse>
 *
 * ROOM SEARCH ENDPOINTS:
 * - GET    /api/v1/search/rooms/recent                   -> ApiResponse<PagedResponse<RoomSearchResultDTO>>
 * - GET    /api/v1/search/rooms/{id}                     -> ApiResponse<RoomListingDetailDTO>
 * - GET    /api/v1/search/rooms/location                 -> ApiResponse<PagedResponse<RoomSearchResultDTO>>
 * - GET    /api/v1/search/rooms/map                      -> ApiResponse<PagedResponse<RoomSearchResultDTO>>
 *
 * PLACE ENDPOINTS:
 * - GET    /api/v1/places/autocomplete                   -> ApiResponse<PlaceAutocompleteResponse>
 * - GET    /api/v1/places/{placeId}                      -> ApiResponse<PlaceDetailsDTO>
 *
 * MEDIA ENDPOINTS:
 * - POST   /api/v1/media/upload-url                      -> ApiResponse<UploadResponseDto>
 * - POST   /api/v1/media/confirm/{uploadId}              -> ApiResponse<MediaDto>
 * - DELETE /api/v1/media/{mediaId}                       -> ApiResponse<null>
 * - PUT    /api/v1/media/reorder                         -> ApiResponse<null>
 * - GET    /api/v1/media/resource/{resourceId}           -> ApiResponse<MediaDto[]>
 *
 * CONFIGURATION ENDPOINTS:
 * - GET    /api/v1/configuration                         -> ApiResponse<ClientConfigResponse>
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Fetching user profile
 * 
 * ```typescript
 * const response = await fetch('/api/v1/users/me', {
 *   headers: { 'Authorization': `Bearer ${accessToken}` }
 * });
 * const data: ApiResponse<UserProfileDTO> = await response.json();
 * 
 * if (data.success) {
 *   console.log('User email:', data.data.email);
 * }
 * ```
 * 
 * Example: Searching for rooms
 * 
 * ```typescript
 * const response = await fetch('/api/v1/search/rooms/recent?page=0&size=20');
 * const data: ApiResponse<PagedResponse<RoomSearchResultDTO>> = await response.json();
 * 
 * if (data.success) {
 *   data.data.content.forEach(room => {
 *     console.log(`Room ${room.id}: ₹${room.monthlyRent}/month`);
 *   });
 * }
 * ```
 * 
 * Example: Login
 * 
 * ```typescript
 * const response = await fetch('/api/v1/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
 * });
 * const data: ApiResponse<AuthResponse> = await response.json();
 * 
 * if (data.success) {
 *   localStorage.setItem('accessToken', data.data.accessToken);
 *   localStorage.setItem('refreshToken', data.data.refreshToken);
 * }
 * ```
 */
