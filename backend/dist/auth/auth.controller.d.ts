import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: Partial<import("../entities/user.entity").User>;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: Partial<import("../entities/user.entity").User>;
    }>;
    getProfile(req: any): {
        message: string;
        user: any;
    };
    adminOnly(req: any): {
        message: string;
        user: any;
    };
}
