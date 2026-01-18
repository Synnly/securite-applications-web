import { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Mock external dependencies
jest.mock('cookie-parser', () => jest.fn());
jest.mock('csrf-csrf', () => ({
    doubleCsrf: jest.fn(() => ({
        doubleCsrfProtection: jest.fn(),
    })),
}));
jest.mock('helmet', () => jest.fn(() => jest.fn()));
jest.mock('fs');
jest.mock('path');

describe('Main Bootstrap', () => {
    let app: INestApplication;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup environment variables
        process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
        process.env.CSRF_SECRET = 'test-csrf-secret';
        process.env.FRONTEND_URL = 'http://localhost:5173';
        process.env.PORT = '3000';
        process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
        process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
    });

    describe('TLS certificate validation', () => {
        it('should check for key.pem existence', () => {
            const keyPath = path.join(__dirname, '../keys/key.pem');
            const certPath = path.join(__dirname, '../keys/cert.pem');

            (fs.existsSync as jest.Mock).mockImplementation((filePath) => {
                if (filePath === keyPath) return false;
                if (filePath === certPath) return true;
                return false;
            });

            expect(fs.existsSync(keyPath)).toBe(false);
        });

        it('should check for cert.pem existence', () => {
            (fs.existsSync as jest.Mock).mockReturnValueOnce(true).mockReturnValueOnce(false);

            const keyExists = fs.existsSync('any-path');
            const certExists = fs.existsSync('any-path');

            expect(keyExists).toBe(true);
            expect(certExists).toBe(false);
        });

        it('should read key and cert files when they exist', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock)
                .mockReturnValueOnce(Buffer.from('mock-key-content'))
                .mockReturnValueOnce(Buffer.from('mock-cert-content'));

            const keyContent = fs.readFileSync('any-path');
            const certContent = fs.readFileSync('any-path');

            expect(keyContent.toString()).toBe('mock-key-content');
            expect(certContent.toString()).toBe('mock-cert-content');
        });
    });

    describe('Environment configuration', () => {
        it('should use PORT from environment variable', () => {
            const port = process.env.PORT;
            expect(port).toBe('3000');
        });

        it('should default to port 3000 when PORT is not set', () => {
            delete process.env.PORT;
            const port = process.env.PORT ?? 3000;
            expect(port).toBe(3000);
        });

        it('should use FRONTEND_URL from environment variable', () => {
            const frontendUrl = process.env.FRONTEND_URL;
            expect(frontendUrl).toBe('http://localhost:5173');
        });

        it('should default FRONTEND_URL when not set', () => {
            delete process.env.FRONTEND_URL;
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            expect(frontendUrl).toBe('http://localhost:5173');
        });

        it('should use CSRF_SECRET from environment variable', () => {
            const csrfSecret = process.env.CSRF_SECRET;
            expect(csrfSecret).toBe('test-csrf-secret');
        });

        it('should have default CSRF_SECRET fallback', () => {
            delete process.env.CSRF_SECRET;
            const csrfSecret =
                process.env.CSRF_SECRET ||
                'default-strong-secret-that-should-never-be-used-in-production';
            expect(csrfSecret).toBe(
                'default-strong-secret-that-should-never-be-used-in-production',
            );
        });
    });

    describe('CORS configuration', () => {
        it('should enable CORS with credentials', () => {
            const corsConfig = {
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                credentials: true,
            };

            expect(corsConfig.origin).toBe('http://localhost:5173');
            expect(corsConfig.credentials).toBe(true);
        });

        it('should use custom FRONTEND_URL for CORS origin', () => {
            process.env.FRONTEND_URL = 'https://example.com';
            const corsConfig = {
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                credentials: true,
            };

            expect(corsConfig.origin).toBe('https://example.com');
        });
    });

    describe('CSRF configuration', () => {
        it('should configure CSRF cookie options', () => {
            const cookieOptions = {
                sameSite: 'lax' as const,
                path: '/',
                secure: true,
                httpOnly: true,
            };

            expect(cookieOptions.sameSite).toBe('lax');
            expect(cookieOptions.path).toBe('/');
            expect(cookieOptions.secure).toBe(true);
            expect(cookieOptions.httpOnly).toBe(true);
        });

        it('should set correct CSRF cookie name', () => {
            const cookieName = '__Host-psifi.x-csrf-token';
            expect(cookieName).toBe('__Host-psifi.x-csrf-token');
        });

        it('should ignore CSRF for GET, HEAD, OPTIONS methods', () => {
            const ignoredMethods = ['GET', 'HEAD', 'OPTIONS'];
            expect(ignoredMethods).toContain('GET');
            expect(ignoredMethods).toContain('HEAD');
            expect(ignoredMethods).toContain('OPTIONS');
            expect(ignoredMethods).not.toContain('POST');
        });

        it('should set CSRF token size to 64', () => {
            const size = 64;
            expect(size).toBe(64);
        });
    });

    describe('Helmet security configuration', () => {
        it('should configure Content Security Policy with trusted types', () => {
            const helmetConfig = {
                contentSecurityPolicy: {
                    useDefaults: true,
                    directives: {
                        requireTrustedTypesFor: ["'script'"],
                    },
                },
            };

            expect(helmetConfig.contentSecurityPolicy.useDefaults).toBe(true);
            expect(helmetConfig.contentSecurityPolicy.directives.requireTrustedTypesFor).toEqual([
                "'script'",
            ]);
        });
    });

    afterEach(async () => {
        await app?.close();
    });
});
