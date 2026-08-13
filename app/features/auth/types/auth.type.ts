export type UserRole = "admin" | "user";

export type UserSummary = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  address: string | null;
};

export type MeResponse = UserSummary;

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type UpdateProfileRequest = {
  name: string;
  phone: string;
  address?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
