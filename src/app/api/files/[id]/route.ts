import { requireAuth } from '@/lib/server/auth';
import * as files from '@/lib/server/files';
import { handleError } from '@/lib/server/http';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const document = await files.getDocument(id);

    if (!document || !(await files.fileExists(document.filePath))) {
      return new Response(JSON.stringify({ message: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = await files.getFileBuffer(document.filePath);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
