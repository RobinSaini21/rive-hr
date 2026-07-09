import { requireAuth } from '@/lib/server/auth';
import { generateOfferDocuments } from '@/lib/server/candidates';
import { handleError, json } from '@/lib/server/http';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    return json(await generateOfferDocuments(id, body));
  } catch (error) {
    return handleError(error);
  }
}
