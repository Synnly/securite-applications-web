import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { StatService } from './stat.service';
import { plainToInstance } from 'class-transformer';
import { StatDto } from './dto/stat.dto';

@Controller('/stat')
export class StatController {
    constructor(private readonly statService: StatService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getStats(): Promise<StatDto> {
        const stats = await this.statService.getStats();
        return plainToInstance(StatDto, stats, {
            excludeExtraneousValues: true,
        });
    }
}
