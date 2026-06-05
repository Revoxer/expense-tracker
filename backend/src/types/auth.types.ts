export interface RegisterDto {
  email: string;
  password: string;
}

export type LoginDto = RegisterDto;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
}

export interface UserDto {
  id: string;
  email: string;
  createdAt: Date;
}
