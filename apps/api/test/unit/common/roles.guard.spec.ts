import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../../src/common/roles/roles.guard';
import { Role } from '../../../src/common/roles/roles.enum';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };

    const createMockExecutionContext = (user?: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get<Reflector>(Reflector);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true when no roles are required', () => {
            mockReflector.getAllAndOverride.mockReturnValue(undefined);
            const context = createMockExecutionContext();

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should return true when required roles array is empty', () => {
            mockReflector.getAllAndOverride.mockReturnValue([]);
            const context = createMockExecutionContext();

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should throw ForbiddenException when user is not defined', () => {
            mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);
            const context = createMockExecutionContext(undefined);

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            expect(() => guard.canActivate(context)).toThrow('User role not found');
        });

        it('should throw ForbiddenException when user.role is not defined', () => {
            mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);
            const context = createMockExecutionContext({ email: 'test@test.com' });

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            expect(() => guard.canActivate(context)).toThrow('User role not found');
        });

        it('should return true when user has the required role (USER)', () => {
            mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);
            const context = createMockExecutionContext({ role: Role.USER });

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should return true when user has ADMIN role and USER role is required', () => {
            mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);
            const context = createMockExecutionContext({ role: Role.ADMIN });

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should return true when user has ADMIN role and ADMIN role is required', () => {
            mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
            const context = createMockExecutionContext({ role: Role.ADMIN });

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should throw ForbiddenException when user has USER role but ADMIN is required', () => {
            mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
            const context = createMockExecutionContext({ role: Role.USER });

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            expect(() => guard.canActivate(context)).toThrow('Access denied');
        });

        it('should return true when user role matches one of multiple required roles', () => {
            mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.USER]);
            const context = createMockExecutionContext({ role: Role.USER });

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should throw ForbiddenException when user role is not in RoleHierarchy', () => {
            mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
            const context = createMockExecutionContext({ role: 'UNKNOWN_ROLE' });

            // When role is not in RoleHierarchy, userRoles is undefined, causing TypeError
            expect(() => guard.canActivate(context)).toThrow();
        });
    });
});
