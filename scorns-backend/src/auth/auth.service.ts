import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService
    ) { }

    async register(email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepo.create({
            email,
            password: hashedPassword,
        });
        return this.userRepo.save(user);
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        // Hash refresh token trước khi lưu
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userRepo.update(user.id, { hashedRefreshToken });

        return { accessToken, refreshToken };
    }

    async refresh(userId: string, refreshToken: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.hashedRefreshToken) {
            throw new UnauthorizedException();
        }

        const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!isMatch) throw new UnauthorizedException();

        const payload = { sub: user.id, email: user.email, role: user.role };
        const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        return { accessToken: newAccessToken };
    }

    async logout(userId: string) {
        // Set hashedRefreshToken to null to revoke it
        await this.userRepo.update(userId, { hashedRefreshToken: null });
    }
}