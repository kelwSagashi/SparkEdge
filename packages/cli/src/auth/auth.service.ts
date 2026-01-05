import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const COOKIE_NAME = 'nmg8_token';

@Service()
export class AuthService {
  async register(payload: { email: string; password: string; first_name?: string; last_name?: string }) {
    const existing = dbManager.users.findByEmail(payload.email);
    if (existing.data) return { error: 'User already exists', data: null };

    const password_hash = await bcrypt.hash(payload.password, 10);
    const user = {
      email: payload.email,
      first_name: payload.first_name ?? null,
      last_name: payload.last_name ?? null,
      password_hash,
      role: 'viewer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;

    const result = dbManager.users.create(user);
    return result;
  }

  async login(payload: { email: string; password: string }) {
    const found = dbManager.users.findByEmail(payload.email);
    const user = found.data;
    if (!user) return { error: 'Invalid credentials', data: null };

    const ok = await bcrypt.compare(payload.password, user.password_hash ?? '');
    if (!ok) return { error: 'Invalid credentials', data: null };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return { data: { token, user } };
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
}

export default AuthService;
