import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r: { data: AuthResponse }) => r.data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((r: { data: AuthResponse }) => r.data),

  getMe: () =>
    api.get<User>('/auth/me').then((r: { data: User }) => r.data),
};
