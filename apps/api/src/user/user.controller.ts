import {
    Body,
    ConflictException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/createUser.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    /**
     * Retrieves all companies
     * @returns An array of all companies
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<UserDto[]> {
        const companies = await this.userService.findAll();

        return companies.map((user) =>
            plainToInstance(UserDto, user, {
                excludeExtraneousValues: true,
            }),
        );
    }

    /**
     * Retrieves a single user by its ID
     * @param userId The user identifier
     * @returns The user with the specified ID
     * @throws {NotFoundException} if no user exists with the given ID
     */
    @Get(':userId')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('userId', ParseObjectIdPipe) userId: string,
    ): Promise<UserDto> {
        const user = await this.userService.findOne(userId);
        if (!user)
            throw new NotFoundException(`User with id ${userId} not found`);
        return plainToInstance(UserDto, user, {
            excludeExtraneousValues: true,
        });
    }

    /**
     * Creates a new user
     * @param dto The user data for creation
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        dto: CreateUserDto,
    ) {
        try {
            await this.userService.create(dto);
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException(
                    `User with email ${dto.username} already exists`,
                );
            } else {
                throw error;
            }
        }
    }
}
