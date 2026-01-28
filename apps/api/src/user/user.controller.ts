import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/roles/roles.guard';
import { Role } from '../common/roles/roles.enum';
import { Roles } from '../common/roles/roles.decorator';
import express from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    /**
     * Retrieves all users with USER role (excluding admins)
     * @returns An array of regular users for ban/unban management
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
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
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
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
     * @param req
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
        dto.role = Role.USER; // Force role to USER on creation
        try {
            await this.userService.create(dto);
        } catch (error) {
            if ((error as any).code === 11000) {
                throw new ConflictException(
                    `User with email ${dto.email} already exists`,
                );
            } else {
                throw error;
            }
        }
    }

    /**
     * Bans a user by setting its deletedAt field
     * @param userId The user identifier
     * @throws {NotFoundException} if no user exists with the given ID
     *
     */
    @Put(':userId/ban')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    async banUser(
        @Param('userId', ParseObjectIdPipe) userId: string,
    ): Promise<{ success: boolean }> {
        const user = await this.userService.findOne(userId);
        if (!user)
            throw new NotFoundException(`User with id ${userId} not found`);

        if (user.role !== Role.USER)
            throw new BadRequestException(
                `Only users with role USER can be banned`,
            );

        const success = await this.userService.banUser(userId);
        return { success };
    }

    /**
     * Unbans a user by removing its bannedAt field
     * @param userId The user identifier
     * @throws {NotFoundException} if no user exists with the given ID
     */
    @Put(':userId/unban')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    async unbanUser(
        @Param('userId', ParseObjectIdPipe) userId: string,
    ): Promise<{ success: boolean }> {
        const user = await this.userService.findOne(userId);
        if (!user)
            throw new NotFoundException(`User with id ${userId} not found`);

        if (user.role !== Role.USER)
            throw new BadRequestException(
                `Only users with role USER can be unbanned`,
            );

        const success = await this.userService.unbanUser(userId);
        return { success };
    }
}
