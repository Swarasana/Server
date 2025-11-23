export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DatabaseResult<T = any> {
  data: T | null;
  error: any;
}

export interface PaginationParams {
  cursor?: string;
  limit?: number | undefined;
}

export interface SearchFilterParams extends PaginationParams {
  q?: string; // Search query
}

export interface ExhibitionSearchParams extends SearchFilterParams {
  curator?: string; // Filter by curator name
  curatorId?: string; // Filter by curator ID
}

export interface CommentSearchParams extends SearchFilterParams {
  // Just search, no additional filters needed
}

export interface CollectionSearchParams extends SearchFilterParams {
  artist?: string; // Filter by artist name
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    totalCount?: number;
  };
}

export interface User {
  id: string;
  username: string;
  user_pic_url: string | null;
  role: "curator" | "visitor";
  created_at: string;
  updated_at: string;
  display_name: string;
  password: string;
  points: number;
}

export interface Level {
  id: string;
  level_number: number;
  level_name: string;
  minimum_points: number;
  desc: string;
  avatar_url: string;
}

export interface Merch {
  id: number;
  name: string;
  desc: string;
  price: number;
  exhibition: string;
}

export interface Collection {
  id: string;
  name: string;
  picture_url: string;
  artist_name: string;
  artist_explanation: string;
  ai_summary_text: string;
  likes_count: number;
  visitor_count: number;
  created_at: string;
  updated_at: string;
  qr_code_url: string;
}

export interface VisitorLog {
  id: string;
  collection_id: string;
  visitor_fingerprint: string;
  session_id: string | null;
  user_id: string | null;
  visited_at: string;
  visited_date: string;
  created_at: string;
}

export interface UserVisitedCollection {
  id: string;
  name: string;
  picture_url: string;
  artist_name: string;
  visited_at: string;
}

export interface Comment {
  id: string;
  collection_id: string;
  username: string;
  user_pic_url: string | null;
  comment_text: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentCollection {
  id: string;
  comment_text: string;
  likes_count: number;
  collection_id: string;
  collection_name: string;
  exhibition_name: string;
}

export interface Exhibition {
  id: string;
  name: string;
  description: string;
  curator_id: string;
  curator_name: string;
  location: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ExhibitionCollection {
  id: string;
  exhibition_id: string;
  collection_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}
