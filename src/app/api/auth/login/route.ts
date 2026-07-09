import { login } from '@/lib/server/auth';
import { handleError, json } from '@/lib/server/http';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await login(body.email, body.password);
    return json(result);
  } catch (error) {
    return handleError(error);
  }
}
