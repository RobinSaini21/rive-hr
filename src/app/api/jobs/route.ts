import { requireAuth } from '@/lib/server/auth';
import { createJob, listJobs } from '@/lib/server/jobs';
import { handleError, json } from '@/lib/server/http';
import { JobStatus } from '@/lib/server/enums';

export async function GET(request: Request) {
  try {
    requireAuth(request);
    return json(await listJobs());
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const body = await request.json();
    const job = await createJob({
      title: body.title,
      description: body.description,
      skills: body.skills,
      status: body.status as JobStatus | undefined,
    });
    return json(job, 201);
  } catch (error) {
    return handleError(error);
  }
}
