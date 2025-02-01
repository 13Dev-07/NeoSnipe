export interface SecurityConfig {
  auth: {
    jwtSecret: string;
    tokenExpiration: number; // milliseconds
    refreshTokenExpiration: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  encryption: {
    algorithm: string;
    keySize: number;
    saltRounds: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    credentials: boolean;
  };
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  roles: string[];
  permissions: string[];
  exp: number;
  iat: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type Permission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'super_admin';

export type Resource =
  | 'user'
  | 'profile'
  | 'content'
  | 'settings'
  | 'system';

export interface AccessControl {
  role: string;
  permissions: Map<Resource, Set<Permission>>;
}

export interface SecurityContext {
  userId: string;
  roles: string[];
  permissions: Map<Resource, Set<Permission>>;
  token: string;
  metadata: Record<string, unknown>;
}