import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Service } from '@spark-edge/di';
import { dbManager, UserUpsertValues } from 'spark-edge-db';
import AuthRequest from './auth.request';
import AuthResponse from './auth.response';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

@Service()
export class AuthService {
  async register(payload: AuthRequest.UserRegister) {
    const existing = dbManager.users.findByEmail(payload.email);
    if (existing.data) return { error: 'User already exists', data: null };

    const password_hash = await bcrypt.hash(payload.password, 10);

    const user: UserUpsertValues = {
      email: payload.email,
      first_name: payload.first_name ?? null,
      last_name: payload.last_name ?? null,
      password_hash,
      role: 'admin',
      is_active: true,
    };

    const result = dbManager.users.create(user);

    if (result.data) {
      dbManager.projects.create({
        name: 'PERSONAL',
        key: 'PERSONAL',
        description: 'Personal project',
        visibility: 'private',
        owner_id: result.data.id
      });
    }
    return result;
  }

  async login(payload: AuthRequest.UserLogin) {
    const found = dbManager.users.findByEmail(payload.email);
    const user = found.data;

    const result: AuthResponse.Login = {
      data: {
        token: null,
        user: null,
      },
      error: 'Invalid credentials'
    };

    if (!user) return result;

    const ok = await bcrypt.compare(payload.password, user.password_hash ?? '');

    if (!ok) return result

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    result.error = undefined;
    result.data.token = token;
    result.data.user = user;

    if (result.data.user) {
      dbManager.projects.upsert({
        name: 'PERSONAL',
        key: 'PERSONAL',
        description: 'Personal project',
        visibility: 'private',
        owner_id: result.data.user.id
      });
    }

    return result;
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const found = dbManager.users.findById(decoded.id);
      return { data: found.data ?? null };
    } catch (err) {
      return { error: err, data: null };
    }
  }

  async generateNewApiKey(userId: string) {
    const result = dbManager.users.createApiKey(userId);
    return result;
  }
}

export default AuthService;

