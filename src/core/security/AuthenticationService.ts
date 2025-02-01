import { SecurityConfig, UserCredentials, AuthToken, TokenPayload } from './SecurityTypes';
import { ValidationUtils } from '../types/ValidationUtils';
import { ErrorHandler } from '../error/ErrorHandler';
import { ErrorType } from '../error/ErrorTypes';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export class AuthenticationService {
  private config: SecurityConfig;
  private errorHandler: ErrorHandler;
  private loginAttempts: Map<string, number> = new Map();
  private lockouts: Map<string, number> = new Map();

  constructor(config: SecurityConfig, errorHandler: ErrorHandler) {
    this.config = config;
    this.errorHandler = errorHandler;
  }

  async authenticate(credentials: UserCredentials): Promise<AuthToken> {
    try {
      this.validateCredentials(credentials);
      await this.checkLockout(credentials.username);

      if (!await this.verifyCredentials(credentials)) {
        await this.handleFailedLogin(credentials.username);
        throw new Error('Invalid credentials');
      }

      this.clearLoginAttempts(credentials.username);
      return this.generateTokens(credentials.username);
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        type: ErrorType.VALIDATION_ERROR,
        context: { username: credentials.username }
      });
      throw error;
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.config.auth.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        type: ErrorType.VALIDATION_ERROR,
        context: { token }
      });
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        this.config.auth.jwtSecret
      ) as TokenPayload;

      return this.generateTokens(decoded.userId);
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        type: ErrorType.VALIDATION_ERROR,
        context: { refreshToken }
      });
      throw error;
    }
  }

  private validateCredentials(credentials: UserCredentials): void {
    ValidationUtils.assertNonNull(credentials, 'Credentials cannot be null');
    ValidationUtils.assertNonNull(credentials.username, 'Username cannot be null');
    ValidationUtils.assertNonNull(credentials.password, 'Password cannot be null');

    if (credentials.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (credentials.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  private async verifyCredentials(credentials: UserCredentials): Promise<boolean> {
    // TODO: Implement actual credential verification against a user store
    return true;
  }

  private async checkLockout(username: string): Promise<void> {
    const lockoutTime = this.lockouts.get(username);
    if (lockoutTime && Date.now() - lockoutTime < this.config.auth.lockoutDuration) {
      throw new Error('Account is locked. Please try again later.');
    }
  }

  private async handleFailedLogin(username: string): Promise<void> {
    const attempts = (this.loginAttempts.get(username) || 0) + 1;
    this.loginAttempts.set(username, attempts);

    if (attempts >= this.config.auth.maxLoginAttempts) {
      this.lockouts.set(username, Date.now());
      this.loginAttempts.delete(username);
    }
  }

  private clearLoginAttempts(username: string): void {
    this.loginAttempts.delete(username);
    this.lockouts.delete(username);
  }

  private generateTokens(userId: string): AuthToken {
    const payload: TokenPayload = {
      userId,
      roles: [], // TODO: Load from user store
      permissions: [], // TODO: Load from user store
      exp: Math.floor(Date.now() / 1000) + this.config.auth.tokenExpiration,
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = jwt.sign(payload, this.config.auth.jwtSecret);
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.config.auth.jwtSecret,
      { expiresIn: this.config.auth.refreshTokenExpiration }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.auth.tokenExpiration
    };
  }
}