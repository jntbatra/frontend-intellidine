// Profile Management API Types

export interface ManagerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "admin";
  restaurant_name: string;
  avatar_url?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProfileSettings {
  notification_email: boolean;
  notification_sms: boolean;
  notification_push: boolean;
  two_factor_enabled: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar_url?: string;
}

export interface ProfileResponse {
  profile: ManagerProfile;
  settings: ProfileSettings;
}
