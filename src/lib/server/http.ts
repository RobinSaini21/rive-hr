import { NextResponse } from 'next/server';
import { HttpError } from './auth';

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return json({ message: error.message }, error.status);
  }

  if (error instanceof Error) {
    const status =
      error.message.includes('not found') || error.message.includes('Not found')
        ? 404
        : error.message.includes('Invalid') ||
            error.message.includes('already') ||
            error.message.includes('Cannot') ||
            error.message.includes('must') ||
            error.message.includes('required') ||
            error.message.includes('expired') ||
            error.message.includes('submitted')
          ? 400
          : 500;

    return json({ message: error.message }, status);
  }

  return json({ message: 'Internal server error' }, 500);
}
