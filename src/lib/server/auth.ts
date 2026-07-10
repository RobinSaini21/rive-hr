import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { connectDb } from './db';
import { User } from './models';

const JWT_SECRET = process.env.JWT_SECRET ?? 'rove-hire-dev-secret';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export async function login(email: string, password: string) {
  await connectDb();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' },
  );

  return {
    token,
    user: { id: user._id.toString(), email: user.email, name: user.name } satisfies AuthUser,
  };
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, JWT_SECRET) as {
    sub: string;
    email: string;
    name: string;
  };

  return { id: payload.sub, email: payload.email, name: payload.name };
}

export function getBearerToken(request: Request) {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7);
}

export function requireAuth(request: Request): AuthUser {
  const token = getBearerToken(request);
  if (!token) {
    throw new HttpError('Unauthorized', 401);
  }

  try {
    return verifyToken(token);
  } catch {
    throw new HttpError('Unauthorized', 401);
  }
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function getWebUrl() {
  const configured = process.env.WEB_URL?.replace(/\/$/, '');
  if (configured) return configured;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, '');
  if (productionHost) {
    return productionHost.startsWith('http')
      ? productionHost
      : `https://${productionHost}`;
  }

  const deploymentHost = process.env.VERCEL_URL?.replace(/\/$/, '');
  if (deploymentHost) return `https://${deploymentHost}`;

  return 'http://localhost:3000';
}
