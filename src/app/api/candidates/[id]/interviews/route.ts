import { requireAuth } from '@/lib/server/auth';
import { scheduleInterview } from '@/lib/server/interviews';
import { handleError, json } from '@/lib/server/http';
import { InterviewType } from '@/lib/server/enums';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    return json(
      await scheduleInterview(id, {
        scheduledAt: body.scheduledAt,
        type: body.type as InterviewType,
        interviewerName: body.interviewerName,
        notes: body.notes,
      }),
      201,
    );
  } catch (error) {
    return handleError(error);
  }
}
