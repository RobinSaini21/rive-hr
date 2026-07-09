import { put } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';
import { Types } from 'mongoose';
import { connectDb } from './db';
import { StoredDocument } from './models';
import { DocumentType } from './enums';

const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function getUploadDir() {
  return path.resolve(process.env.UPLOAD_DIR ?? './uploads');
}

async function persistBuffer(
  candidateId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string,
) {
  if (useBlob()) {
    const blob = await put(`${candidateId}/${fileName}`, buffer, {
      access: 'public',
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  const candidateDir = path.join(getUploadDir(), candidateId);
  fs.mkdirSync(candidateDir, { recursive: true });
  const filePath = path.join(candidateDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function saveFile(
  candidateId: string,
  type: DocumentType,
  file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
) {
  await connectDb();

  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storedName = `${Date.now()}-${safeName}`;
  const filePath = await persistBuffer(
    candidateId,
    storedName,
    file.buffer,
    file.mimetype,
  );

  const doc = await StoredDocument.create({
    candidateId: new Types.ObjectId(candidateId),
    type,
    fileName: file.originalname,
    filePath,
    mimeType: file.mimetype,
    size: file.size,
  });

  return toDto(doc);
}

export async function saveBuffer(
  candidateId: string,
  type: DocumentType,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
) {
  await connectDb();

  const filePath = await persistBuffer(candidateId, fileName, buffer, mimeType);

  const doc = await StoredDocument.create({
    candidateId: new Types.ObjectId(candidateId),
    type,
    fileName,
    filePath,
    mimeType,
    size: buffer.length,
  });

  return toDto(doc);
}

export async function getDocument(id: string) {
  await connectDb();
  const doc = await StoredDocument.findById(id);
  return doc ? toDto(doc) : null;
}

export function isRemotePath(filePath: string) {
  return filePath.startsWith('http://') || filePath.startsWith('https://');
}

export function fileExists(filePath: string) {
  if (isRemotePath(filePath)) return true;
  return fs.existsSync(filePath);
}

export async function getFileBuffer(filePath: string): Promise<Buffer> {
  if (!isRemotePath(filePath)) {
    return fs.readFileSync(filePath);
  }

  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error('Failed to fetch remote file');
  }

  return Buffer.from(await response.arrayBuffer());
}

function toDto(doc: {
  _id: Types.ObjectId;
  candidateId: Types.ObjectId;
  type: DocumentType;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  createdAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    candidateId: doc.candidateId.toString(),
    type: doc.type,
    fileName: doc.fileName,
    filePath: doc.filePath,
    mimeType: doc.mimeType,
    size: doc.size,
    createdAt: doc.createdAt,
  };
}
