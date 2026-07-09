import { requireAuth } from '@/lib/server/auth';
import { createCandidate, listCandidates } from '@/lib/server/candidates';
import { handleError, json } from '@/lib/server/http';
import { CandidateStatus } from '@/lib/server/enums';

export async function GET(request: Request) {
  try {
    requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as CandidateStatus | null;
    const search = searchParams.get('search') ?? undefined;

    return json(
      await listCandidates({
        status: status ?? undefined,
        search,
      }),
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const form = await request.formData();

    const name = form.get('name');
    const email = form.get('email');
    const jobOpeningId = form.get('jobOpeningId');
    const resume = form.get('resume');

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof jobOpeningId !== 'string' ||
      !(resume instanceof File)
    ) {
      return json({ message: 'Invalid form data' }, 400);
    }

    if (resume.type !== 'application/pdf') {
      return json({ message: 'Resume must be a PDF file' }, 400);
    }

    if (resume.size > 10 * 1024 * 1024) {
      return json({ message: 'Resume must be under 10MB' }, 400);
    }

    const buffer = Buffer.from(await resume.arrayBuffer());

    const candidate = await createCandidate({
      name,
      email,
      jobOpeningId,
      resume: {
        originalname: resume.name,
        buffer,
        mimetype: resume.type,
        size: resume.size,
      },
    });

    return json(candidate, 201);
  } catch (error) {
    return handleError(error);
  }
}
