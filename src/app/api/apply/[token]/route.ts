import { getApplication, submitApplication } from '@/lib/server/apply';
import { handleError, json } from '@/lib/server/http';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    return json(await getApplication(token));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();
    return json(await submitApplication(token, body));
  } catch (error) {
    return handleError(error);
  }
}
