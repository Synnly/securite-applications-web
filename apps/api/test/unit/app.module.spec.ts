import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from '../../src/user/user.module';
import { AuthModule } from '../../src/auth/auth.module';
import { PostModule } from '../../src/post/post.module';
import { CommentModule } from '../../src/comment/comment.module';
import { SeedModule } from '../../src/seed/seed.module';

describe('AppModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        // Mock environment variables

        module = await Test.createTestingModule({
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
                            ttl: 20000,
                            limit: 40,
                        },
                    ],
                }),
                UserModule,
                AuthModule,
                PostModule,
                CommentModule,
                SeedModule,
            ],
        }).compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should have ConfigModule as global module', () => {
        const configService = module.get<ConfigService>(ConfigService);
        expect(configService).toBeDefined();
    });

    it('should import UserModule', () => {
        const userModule = module.get(UserModule);
        expect(userModule).toBeDefined();
    });

    it('should import AuthModule', () => {
        const authModule = module.get(AuthModule);
        expect(authModule).toBeDefined();
    });

    it('should import PostModule', () => {
        const postModule = module.get(PostModule);
        expect(postModule).toBeDefined();
    });

    it('should import CommentModule', () => {
        const commentModule = module.get(CommentModule);
        expect(commentModule).toBeDefined();
    });

    it('should import SeedModule', () => {
        const seedModule = module.get(SeedModule);
        expect(seedModule).toBeDefined();
    });

    afterEach(async () => {
        if (module) {
            await module.close();
        }
    });
});
