import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
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
}