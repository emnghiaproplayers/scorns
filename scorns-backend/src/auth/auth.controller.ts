import { Controller, Post, Body, UseGuards, Req, Get } from "@nestjs/common";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "./decorators/roles.decorator";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import express from "express";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() body: { email: string; password: string }) {
        return this.authService.register(body.email, body.password);
    }

    @Post('login')
    login(@Body() body: { email: string; password: string }) {
        return this.authService.login(body.email, body.password);
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    refresh(@Req() req: any) {
        const user = req['user'] as any;
        return this.authService.refresh(user.sub, user.refreshToken);
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('logout')
    logout(@Req() req: any) {
        const user = req['user'] as any;
        return this.authService.logout(user.sub);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: any) {
        return req['user'];
    }

    @Post('admin/items')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    createItem(@Body() body: any) {
        return { message: 'Item created successfully by Admin', data: body };
    }
}