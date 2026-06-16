import { api } from "./api";
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  UserDto,
} from "../types/auth.types";

export const register = async (data: RegisterDto): Promise<UserDto> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const getMe = async (): Promise<UserDto> => {
  const response = await api.get("/auth/me");
  return response.data;
};
