import {
  SecurityContext,
  Permission,
  Resource,
  AccessControl
} from './SecurityTypes';
import { ErrorHandler } from '../error/ErrorHandler';
import { ErrorType } from '../error/ErrorTypes';

export class AuthorizationService {
  private accessControls: Map<string, AccessControl> = new Map();
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles(): void {
    // Admin role
    this.addRole('admin', new Map([
      ['user', new Set(['read', 'write', 'delete'])],
      ['profile', new Set(['read', 'write', 'delete'])],
      ['content', new Set(['read', 'write', 'delete'])],
      ['settings', new Set(['read', 'write'])],
      ['system', new Set(['read'])]
    ]));

    // Super admin role
    this.addRole('super_admin', new Map([
      ['user', new Set(['read', 'write', 'delete', 'admin'])],
      ['profile', new Set(['read', 'write', 'delete', 'admin'])],
      ['content', new Set(['read', 'write', 'delete', 'admin'])],
      ['settings', new Set(['read', 'write', 'admin'])],
      ['system', new Set(['read', 'write', 'admin', 'super_admin'])]
    ]));

    // Regular user role
    this.addRole('user', new Map([
      ['user', new Set(['read'])],
      ['profile', new Set(['read', 'write'])],
      ['content', new Set(['read'])],
      ['settings', new Set(['read'])],
      ['system', new Set([])]
    ]));
  }

  addRole(role: string, permissions: Map<Resource, Set<Permission>>): void {
    this.accessControls.set(role, { role, permissions });
  }

  hasPermission(
    context: SecurityContext,
    resource: Resource,
    permission: Permission
  ): boolean {
    try {
      // Super admin has all permissions
      if (context.roles.includes('super_admin')) {
        return true;
      }

      // Check if any of the user's roles have the required permission
      return context.roles.some(role => {
        const accessControl = this.accessControls.get(role);
        if (!accessControl) return false;

        const resourcePermissions = accessControl.permissions.get(resource);
        return resourcePermissions?.has(permission) || false;
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.VALIDATION_ERROR,
        context: {
          securityContext: context,
          resource,
          permission
        }
      });
      return false;
    }
  }

  async authorize(
    context: SecurityContext,
    resource: Resource,
    permission: Permission
  ): Promise<boolean> {
    try {
      if (!this.hasPermission(context, resource, permission)) {
        throw new Error(
          `User ${context.userId} does not have permission ${permission} for resource ${resource}`
        );
      }
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        type: ErrorType.VALIDATION_ERROR,
        context: {
          userId: context.userId,
          resource,
          permission
        }
      });
      throw error;
    }
  }

  getRolePermissions(role: string): Map<Resource, Set<Permission>> | undefined {
    return this.accessControls.get(role)?.permissions;
  }

  getEffectivePermissions(roles: string[]): Map<Resource, Set<Permission>> {
    const effectivePermissions = new Map<Resource, Set<Permission>>();

    roles.forEach(role => {
      const rolePermissions = this.getRolePermissions(role);
      if (!rolePermissions) return;

      rolePermissions.forEach((permissions, resource) => {
        if (!effectivePermissions.has(resource)) {
          effectivePermissions.set(resource, new Set());
        }
        permissions.forEach(permission => {
          effectivePermissions.get(resource)?.add(permission);
        });
      });
    });

    return effectivePermissions;
  }
}