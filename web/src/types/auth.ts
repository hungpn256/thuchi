export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  account: Account;
  profile: Profile;
}

export interface Account {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  profileUsers: ProfileUser[];
}

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUser {
  id: string;
  profileId: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  permission: Permission;
  profile?: Profile;
  account?: Account;
}

export enum Permission {
  ADMIN = 'ADMIN',
  WRITE = 'WRITE',
  READ = 'READ',
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UseAuthReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  checkPendingAuth: () => Promise<void>;
  refreshToken: () => Promise<AuthResponse>;
  logout: () => void;
  isLoading: boolean;
  error: Error | null;
}
