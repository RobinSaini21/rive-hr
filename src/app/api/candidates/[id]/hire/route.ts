import { requireAuth } from '@/lib/server/auth';
import { markHired } from '@/lib/server/candidates';
import { handleError, json } from '@/lib/server/http';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAuth(request);
    const { id } = await params;
    return json(await markHired(id));
  } catch (error) {
    return handleError(error);
  }
}
