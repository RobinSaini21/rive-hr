import { requireAuth } from '@/lib/server/auth';
import { getCandidate } from '@/lib/server/candidates';
import { handleError, json } from '@/lib/server/http';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAuth(request);
    const { id } = await params;
    return json(await getCandidate(id));
  } catch (error) {
    return handleError(error);
  }
}
