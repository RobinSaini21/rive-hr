import { GridFSBucket, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { connectDb } from './db';

export const GRIDFS_PREFIX = 'gridfs:';
export const GRIDFS_BUCKET = 'documents';

export function isGridFsPath(filePath: string) {
  return filePath.startsWith(GRIDFS_PREFIX);
}

export function gridFsPath(fileId: string | ObjectId) {
  return `${GRIDFS_PREFIX}${fileId.toString()}`;
}

export function parseGridFsId(filePath: string) {
  return new ObjectId(filePath.slice(GRIDFS_PREFIX.length));
}

async function getBucket() {
  await connectDb();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database not connected');
  }
  return new GridFSBucket(db, { bucketName: GRIDFS_BUCKET });
}

export async function uploadBuffer(
  filename: string,
  buffer: Buffer,
  metadata?: Record<string, unknown>,
) {
  const bucket = await getBucket();

  return new Promise<string>((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      metadata: { ...metadata, mimeType: metadata?.mimeType },
    });

    stream.on('error', reject);
    stream.on('finish', () => resolve(gridFsPath(stream.id)));
    stream.end(buffer);
  });
}

export async function downloadBuffer(filePath: string) {
  const bucket = await getBucket();
  const id = parseGridFsId(filePath);
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    const stream = bucket.openDownloadStream(id);
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function gridFsFileExists(filePath: string) {
  const bucket = await getBucket();
  return bucket.find({ _id: parseGridFsId(filePath) }).hasNext();
}

export async function dropBucket() {
  await connectDb();
  const db = mongoose.connection.db;
  if (!db) return;

  await db.dropCollection(`${GRIDFS_BUCKET}.files`).catch(() => undefined);
  await db.dropCollection(`${GRIDFS_BUCKET}.chunks`).catch(() => undefined);
}
