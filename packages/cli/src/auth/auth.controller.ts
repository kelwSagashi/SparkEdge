import { Body, Post, Get, RestController } from '@nmg8/di';
import { Response, Request } from 'express';
import AuthService from './auth.service';
import { AuthenticatedRequest } from 'nmg8-workflow';

@RestController('/auth')
export class AuthController {
  constructor(readonly authService: AuthService) {}

  @Post('/register')
  async register(req: AuthenticatedRequest<
    {}, 
    {}, 
    { 
      email: string;
      password: string;
      first_name?: string;
      last_name?: string
    }
  >) {
    const result = await this.authService.register(req.body);
    return { data: result.data, error: result.error };
  }

  @Post('/login')
  async login(req: AuthenticatedRequest<{}, {}, { email: string; password: string }>, res: Response) {
    const result = await this.authService.login(req.body);
    if (result.error || !result.data) return { data: null, error: result.error };

    const { token, user } = result.data;
    // set httpOnly cookie
    res.cookie('nmg8_token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000 });
    return { data: { user }, error: null };
  }

  @Post('/logout')
  async logout(req: Request, res: Response) {
    res.clearCookie('nmg8_token');
    return { data: true };
  }

  @Get('/me')
  async me(req: Request) {
    // middleware should attach user to req as any.user
    return { data: (req as any).user ?? null };
  }
}

export default AuthController;
