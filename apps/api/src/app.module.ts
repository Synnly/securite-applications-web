import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PostModule } from './post/post.module';
import { TokensMiddleware } from './common/middleware/tokens.middleware';
import { CommentModule } from './comment/comment.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('DATABASE_URL'),
            }),
            inject: [ConfigService],
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: seconds(20),
                    limit: 40,
                },
            ],
        }),
        UserModule,
        AuthModule,
        PostModule,
        CommentModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TokensMiddleware).forRoutes('*');
    }
}
