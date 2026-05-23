export type UserRole = "user" | "agent" | "admin" | "tenant" | "landlord";
export type ListingStatus = "pending" | "approved" | "rejected";
export type ListingType = "rent" | "buy";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;

  // Trust & Verification
  email_verified?: boolean;
  identity_verified?: boolean;
  id_document_type?: string;
  id_document_verified?: boolean;
  selfie_verified?: boolean;

  // Behavioral Reputation
  trust_score?: number;       // 0-100, default 90
  response_rate?: number;     // 0-100 %
  successful_rentals?: number;
  cancellation_rate?: number; // 0-100 %
}

export interface VerificationChecklist {
  landlord_identity: boolean;
  ownership_documents: boolean;
  water_supply_active: boolean;
  power_grid_active: boolean;
  structural_audit_passed: boolean;
  inspection_date: string;
}

export interface NeighborhoodUptime {
  water_reliability: string;
  power_reliability: string;
  noise_level: "quiet" | "moderate" | "lively";
}

export interface CommuteTimeEstimator {
  landmark: string;
  car_mins: number;
  boda_mins: number;
  walking_mins: number;
}

export interface LandlordReview {
  id: string;
  tenant_name: string;
  rating: number;
  tag: string;
  comment: string;
  date: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  listing_type: ListingType;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm?: number;
  images: string[];
  amenities: string[];
  agent_id: string;
  status: ListingStatus;
  created_at: string;
  updated_at?: string;
  agent?: Pick<User, "id" | "name" | "phone" | "avatar_url">;

  // GPS coordinates
  gps_lat?: number;
  gps_lng?: number;

  // Property Trust Metrics (from backend)
  property_verified?: boolean;
  owner_verified?: boolean;
  caretaker_confirmed?: boolean;
  last_confirmed_available?: string;
  auto_expire_at?: string;

  // Trust Infrastructure fields (Optional for backward compatibility)
  is_verified?: boolean;
  move_in_score?: number;
  safety_score?: number;
  verification_checklist?: VerificationChecklist;
  neighborhood_uptime?: NeighborhoodUptime;
  commute_times?: CommuteTimeEstimator[];
  video_walkthrough_url?: string;
  landlord_rating?: number;
  landlord_reviews_count?: number;
  landlord_reviews?: LandlordReview[];
}


export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

export interface VisitConfirmation {
  id?: string;
  listing_id: string;
  was_real: boolean;
  pricing_accurate: boolean;
  was_available: boolean;
}

export interface TrustBadge {
  level: 1 | 2 | 3 | 4;
  label: string;
  achieved: boolean;
  description: string;
}

export type NotificationType = "info" | "message" | "listing" | "system" | "promo";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  listing_id?: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
  sender?: Pick<User, "id" | "name" | "avatar_url">;
  listing?: Pick<Listing, "id" | "title" | "images">;
}

export interface Conversation {
  other_user: Pick<User, "id" | "name" | "phone" | "avatar_url">;
  listing: Pick<Listing, "id" | "title" | "images">;
  last_message: Message;
  unread_count: number;
}

export interface ListingFilters {
  type?: ListingType | "all";
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
