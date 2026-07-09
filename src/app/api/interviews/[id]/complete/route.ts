import { requireAuth } from '@/lib/server/auth';
import { completeInterview } from '@/lib/server/interviews';
import { handleError, json } from '@/lib/server/http';
import { FeedbackRecommendation } from '@/lib/server/enums';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    return json(
      await completeInterview(id, {
        recommendation: body.recommendation as FeedbackRecommendation,
        note: body.note,
      }),
    );
  } catch (error) {
    return handleError(error);
  }
}
