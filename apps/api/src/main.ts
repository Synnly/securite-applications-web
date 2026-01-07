import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { Request, Response } from 'express';
import * as fs from 'fs';
import path from 'path';

async function bootstrap() {
    const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, '../keys/key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '../keys/cert.pem')),
    };

    const app = await NestFactory.create(AppModule, { httpsOptions });

    const { doubleCsrfProtection } = doubleCsrf({
        getSecret: () =>
            process.env.CSRF_SECRET ||
            'default-strong-secret-that-should-never-be-used-in-production',
        getSessionIdentifier: (req: any) => {
            return (
                req.cookies?.['__Host-psifi.session'] ??
                req.cookies?.sessionId ??
                ''
            );
        },
        cookieName: '__Host-psifi.x-csrf-token',
        cookieOptions: {
            sameSite: 'lax',
            path: '/',
            secure: true,
        },
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getCsrfTokenFromRequest: (req: any) => req.headers['x-csrf-token'],
    });

    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    });

    app.use(cookieParser());

    app.use(doubleCsrfProtection);

    app.getHttpAdapter().get('/csrf-token', (req: Request, res: Response) => {
        const csrfToken = (req as any).csrfToken();
        res.json({ csrfToken });
    });

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
