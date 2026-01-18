import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { TokensMiddleware } from '../../../src/common/middleware/tokens.middleware';
import { InvalidConfigurationException } from '../../../src/common/exceptions/invalidConfiguration.exception';
import { Role } from '../../../src/common/roles/roles.enum';

describe('TokensMiddleware', () => {
    let middleware: TokensMiddleware;
    let jwtService: JwtService;
    let configService: ConfigService;

    const mockJwtService = {
        verify: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    const mockRequest = (): Partial<Request> => ({
        headers: {},
        user: undefined,
    });

    const mockResponse = (): Partial<Response> => ({});

    const mockNext = jest.fn();

    beforeEach(async () => {
        jest.clearAllMocks();
        mockConfigService.get.mockReturnValue('test-access-token-secret');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokensMiddleware,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        middleware = module.get<TokensMiddleware>(TokensMiddleware);
        jwtService = module.get<JwtService>(JwtService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(middleware).toBeDefined();
    });

    describe('constructor', () => {
        it('should throw InvalidConfigurationException when ACCESS_TOKEN_SECRET is not configured', async () => {
            mockConfigService.get.mockReturnValue(undefined);

            await expect(async () => {
                await Test.createTestingModule({
                    providers: [
                        TokensMiddleware,
                        {
                            provide: JwtService,
                            useValue: mockJwtService,
                        },
                        {
                            provide: ConfigService,
                            useValue: mockConfigService,
                        },
                    ],
                }).compile();
            }).rejects.toThrow(InvalidConfigurationException);
        });
    });

    describe('use', () => {
        it('should call next() when no authorization header is present', async () => {
            const req = mockRequest() as Request;
            const res = mockResponse() as Response;

            await middleware.use(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });

        it('should call next() when authorization header is malformed', async () => {
            const req = mockRequest() as Request;
            req.headers = { authorization: 'InvalidFormat' };
            const res = mockResponse() as Response;

            await middleware.use(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });

        it('should call next() when authorization type is not Bearer', async () => {
            const req = mockRequest() as Request;
            req.headers = { authorization: 'Basic token123' };
            const res = mockResponse() as Response;

            await middleware.use(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });

        it('should set user and accessToken when valid token is provided', async () => {
            const token = 'valid-jwt-token';
            const payload = {
                sub: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                role: Role.USER,
            };

            const req = mockRequest() as Request;
            req.headers = { authorization: `Bearer ${token}` };
            const res = mockResponse() as Response;

            mockJwtService.verify.mockReturnValue(payload);

            await middleware.use(req, res, mockNext);

            expect(jwtService.verify).toHaveBeenCalledWith(token, {
                secret: 'test-access-token-secret',
            });
            expect(req['accessToken']).toBe(token);
            expect(req.user).toEqual({
                sub: payload.sub.toString(),
                email: payload.email,
                role: payload.role,
            });
            expect(mockNext).toHaveBeenCalled();
        });

        it('should call next() even when token verification fails', async () => {
            const token = 'invalid-jwt-token';
            const req = mockRequest() as Request;
            req.headers = { authorization: `Bearer ${token}` };
            const res = mockResponse() as Response;

            mockJwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await middleware.use(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(req['accessToken']).toBeUndefined();
        });

        it('should handle token with ADMIN role', async () => {
            const token = 'admin-jwt-token';
            const payload = {
                sub: '507f1f77bcf86cd799439011',
                email: 'admin@example.com',
                role: Role.ADMIN,
            };

            const req = mockRequest() as Request;
            req.headers = { authorization: `Bearer ${token}` };
            const res = mockResponse() as Response;

            mockJwtService.verify.mockReturnValue(payload);

            await middleware.use(req, res, mockNext);

            expect(req.user).toEqual({
                sub: payload.sub.toString(),
                email: payload.email,
                role: Role.ADMIN,
            });
            expect(mockNext).toHaveBeenCalled();
        });

        it('should initialize req.user as empty object if not exists', async () => {
            const token = 'valid-jwt-token';
            const payload = {
                sub: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                role: Role.USER,
            };

            const req = mockRequest() as Request;
            req.headers = { authorization: `Bearer ${token}` };
            req.user = undefined; // Ensure user is undefined
            const res = mockResponse() as Response;

            mockJwtService.verify.mockReturnValue(payload);

            await middleware.use(req, res, mockNext);

            expect(req.user).toBeDefined();
            expect(req.user!.sub).toBe(payload.sub.toString());
        });

        it('should handle empty Bearer token', async () => {
            const req = mockRequest() as Request;
            req.headers = { authorization: 'Bearer ' };
            const res = mockResponse() as Response;

            await middleware.use(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });
    });
});
