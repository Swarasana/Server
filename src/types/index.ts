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