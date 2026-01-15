import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DonationModule } from '../../src/donation/donation.module';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('DonationModule (Integration)', () => {
    let app: INestApplication;
    let httpService: HttpService;

    const mockHttpService = {
        get: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [DonationModule],
        })
            .overrideProvider(HttpService)
            .useValue(mockHttpService)
            .compile();

        app = moduleFixture.createNestApplication();
        httpService = moduleFixture.get<HttpService>(HttpService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /donation/verify/:id', () => {
        const paymentId = 'payment123';

        it('should return 200 OK when bank verification succeeds', async () => {
            mockHttpService.get.mockReturnValue(of({ status: 200, data: {} }));

            await request(app.getHttpServer())
                .post(`/donation/verify/${paymentId}`)
                .expect(200);

            expect(httpService.get).toHaveBeenCalled();
        });

        it('should return 404 Not Found when bank returns 404', async () => {
            mockHttpService.get.mockReturnValue(
                throwError(() => ({ status: 404, message: 'Not Found' })),
            );

            await request(app.getHttpServer())
                .post(`/donation/verify/${paymentId}`)
                .expect(404);
        });

        it('should return 400 Bad Request when bank returns 400 (already claimed)', async () => {
            mockHttpService.get.mockReturnValue(
                throwError(() => ({ status: 400, message: 'Already claimed' })),
            );

            await request(app.getHttpServer())
                .post(`/donation/verify/${paymentId}`)
                .expect(400);
        });

        it('should return 400 Bad Request on generic server failure', async () => {
            mockHttpService.get.mockReturnValue(
                throwError(() => ({ status: 500, message: 'Server Error' })),
            );

            await request(app.getHttpServer())
                .post(`/donation/verify/${paymentId}`)
                .expect(400);
        });
    });
});
