export type UserRole = "user" | "agent" | "admin";
export type ListingStatus = "pending" | "approved" | "rejected";
export type ListingType = "rent" | "buy";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
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
  agent?: Pick<User, "id" | "name" | "phone" | "avatar_url">;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
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
