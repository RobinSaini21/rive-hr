import * as fs from 'fs';
import { Types } from 'mongoose';
import { connectDb } from './db';
import { StoredDocument } from './models';
import { DocumentType } from './enums';
import * as gridfs from './gridfs';

function isRemotePath(filePath: string) {
  return filePath.startsWith('http://') || filePath.startsWith('https://');
}

async function persistBuffer(
  candidateId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string,
) {
  return gridfs.uploadBuffer(fileName, buffer, { candidateId, mimeType });
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

export async function fileExists(filePath: string) {
  if (gridfs.isGridFsPath(filePath)) {
    return gridfs.gridFsFileExists(filePath);
  }

  if (isRemotePath(filePath)) {
    return true;
  }

  return fs.existsSync(filePath);
}

export async function getFileBuffer(filePath: string) {
  if (gridfs.isGridFsPath(filePath)) {
    return gridfs.downloadBuffer(filePath);
  }

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
