import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import helmet from 'helmet';
import { Request, Response } from 'express';
import * as fs from 'fs';
import path from 'path';
import { ConsoleLogger } from '@nestjs/common';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
    const keyPath = path.join(__dirname, '../keys/key.pem');
    const certPath = path.join(__dirname, '../keys/cert.pem');

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        throw new Error(
            `Fichiers TLS manquants. Vérifiez la présence de ${keyPath} et ${certPath}`,
        );
    }

    const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
    };

    const logger = new ConsoleLogger({
        json: true,
        timestamp: true,
        colors: true,
        logLevels: ['log', 'error', 'warn'],
    });

    const app = await NestFactory.create(AppModule, {
        httpsOptions,
        logger: logger,
    });

    const seedService = app.get(SeedService);
    try {
        await seedService.run();
    } catch (error) {
        logger.error('Seeding failed during bootstrap:', error, 'SeedService');
    }

    app.use(
        helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    requireTrustedTypesFor: ["'script'"],
                },
            },
        }),
    );

    if (!process.env.CSRF_SECRET) throw new Error('CSRF_SECRET is not set.');

    const { doubleCsrfProtection } = doubleCsrf({
        getSecret: () => process.env.CSRF_SECRET!,
        getSessionIdentifier: (req: any) => {
            return (
                req.cookies?.['__Host-psifi.session-api'] ??
                req.cookies?.sessionId ??
                ''
            );
        },
        cookieName: '__Host-psifi.x-csrf-token-api',
        cookieOptions: {
            sameSite: 'lax',
            path: '/',
            secure: true,
            httpOnly: true,
        },
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getCsrfTokenFromRequest: (req: any) =>
            req.cookies?.['__Host-psifi.x-csrf-token-api'],
    });

    if (!process.env.CORS_URL) throw new Error('CORS_URL is not set.');

    app.enableCors({
        origin: process.env.CORS_URL!,
        credentials: true,
    });

    logger.log(`CORS enabled for : ${process.env.CORS_URL}`, 'InstanceLoader');

    app.use(cookieParser());

    app.use(doubleCsrfProtection);

    app.getHttpAdapter().get('/csrf-token', (req: Request, res: Response) => {
        const csrfToken = (req as any).csrfToken();
        res.json({ csrfToken });
    });

    await app.listen(process.env.PORT ?? 3000);
    logger.log('Listening on port ' + (process.env.PORT ?? 3000), 'Bootstrap');
}
bootstrap();
