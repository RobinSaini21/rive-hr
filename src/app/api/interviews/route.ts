import { requireAuth } from '@/lib/server/auth';
import { listInterviews } from '@/lib/server/interviews';
import { handleError, json } from '@/lib/server/http';

export async function GET(request: Request) {
  try {
    requireAuth(request);
    return json(await listInterviews());
  } catch (error) {
    return handleError(error);
  }
}
