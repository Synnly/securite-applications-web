/**
 * Enumeration of user roles in the system
 * Defines the levels of user access
 */
export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

/**
 * Defines the hierarchical relationship between roles
 * Each role has access to its own permissions plus any roles included in its hierarchy
 * For example, ADMIN has access to USER permissions
 * @readonly
 */
export const RoleHierarchy: Readonly<Record<Role, Role[]>> = {
    [Role.ADMIN]: [Role.ADMIN, Role.USER],
    [Role.USER]: [Role.USER],
};
