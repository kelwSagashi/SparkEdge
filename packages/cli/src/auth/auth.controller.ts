import { Post, Get, RestController } from '@spark-edge/di';
import { Response, Request } from 'express';
import AuthService from './auth.service';
import AuthRequest from './auth.request';

const COOKIE_NAME = 'spark_edge_token';

@RestController('/auth')
export class AuthController {
  constructor(readonly authService: AuthService) {}

  @Post('/register')
  async register(req: AuthRequest.Register) {
    return await this.authService.register(req.body);
  }

  @Post('/login')
  async login(req: AuthRequest.Login, res: Response) {
    const result = await this.authService.login(req.body);
    if (result.error || !result.data) return { data: null, error: result.error };

    const { token, user } = result.data;
    
    // set httpOnly cookie
    res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000 });

    // Inform Cloud about the active local user context
    try {
      const { mqttService } = await import('spark-edge-core');
      await mqttService.publishContext({
        id: user?.id ?? "",
        email: user?.email ?? "",
        first_name: user?.first_name ?? "",
        last_name: user?.last_name ?? ""
      });
    } catch (err) {
      console.warn('[AuthController] Failed to publish local user context:', err);
    }

    return { data: user , error: null };
  }

  @Post('/logout')
  async logout(req: Request, res: Response) {
    res.clearCookie(COOKIE_NAME);
    return { data: true };
  }

  @Get('/me')
  async me(req: Request) {
    // middleware should attach user to req as any.user
    return { data: (req as any).user ?? null };
  }

  @Post('/generate-new-api-key/:userId')
  async generateNewApiKey(req: Request) {
    return await this.authService.generateNewApiKey(req.params.userId);
  }
}

export default AuthController;

