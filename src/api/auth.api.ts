
import type { ILoginInput, IRegisterInput, IUser, IAuthResponse } from "../types/auth.types";
import axiosClient from "./axiosClient";

// Login
export const loginApi = async (data: ILoginInput): Promise<IAuthResponse> => {
  const res = await axiosClient.post<IAuthResponse>("/auth/login", data);
  return res.data;
};

// Register
export const registerApi = async (data: IRegisterInput): Promise<IAuthResponse> => {
  const res = await axiosClient.post<IAuthResponse>("/auth/register", data);
  return res.data;
};

// Logout
export const logoutApi = async (): Promise<void> => {
  await axiosClient.post("/auth/logout");
};

// Get current user
export const getMeApi = async (): Promise<IUser> => {
  const res = await axiosClient.get<{ success: boolean; data: IUser }>("/auth/me");
  return res.data.data;
};

// Refresh token handled by axios interceptor
export const refreshTokenApi = async (): Promise<void> => {
  await axiosClient.post("/auth/refresh-token");
};