import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { ConsoleLogger } from '@nestjs/common';
import { AccountService } from './account/account.service';
import { doubleCsrf } from 'csrf-csrf';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

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

    if (process.env.PRETTY_LOGS === undefined) {
        throw new Error('PRETTY_LOGS is not set.');
    }

    const logger = new ConsoleLogger({
        json: process.env.PRETTY_LOGS === 'false',
        timestamp: true,
        colors: true,
        logLevels: ['log', 'error', 'warn'],
    });

    const app = await NestFactory.create(AppModule, {
        httpsOptions,
        logger: logger,
    });

    const accountService = app.get(AccountService);
    try {
        await accountService.seedAccounts();
    } catch (error) {
        logger.error(
            'Seeding accounts failed during bootstrap:',
            error,
            'AccountService',
        );
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
                req.cookies?.['__Host-psifi.session-bank'] ??
                req.cookies?.sessionId ??
                ''
            );
        },
        cookieName: '__Host-psifi.x-csrf-token-bank',
        cookieOptions: {
            sameSite: 'lax',
            path: '/',
            secure: true,
            httpOnly: true,
        },
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getCsrfTokenFromRequest: (req: any) =>
            req.cookies?.['__Host-psifi.x-csrf-token-bank'],
    });

    if (!process.env.CORS_URL) throw new Error('CORS_URL is not set.');

    app.enableCors({
        origin: process.env.CORS_URL.split(';'),
        credentials: true,
    });

    logger.log(
        `CORS enabled for : ${process.env.CORS_URL.split(';')}`,
        'InstanceLoader',
    );

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
