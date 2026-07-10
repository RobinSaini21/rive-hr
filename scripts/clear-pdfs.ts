import { config } from 'dotenv';

config({ path: '.env.local' });
config();

import mongoose from 'mongoose';
import { connectDb } from '../src/lib/server/db';
import * as gridfs from '../src/lib/server/gridfs';
import { StoredDocument } from '../src/lib/server/models';

async function main() {
  await connectDb();

  const dbName = mongoose.connection.db?.databaseName;
  const host = mongoose.connection.host;

  const beforeDocs = await StoredDocument.countDocuments();
  const beforeGridFs = await mongoose.connection.db
    ?.collection('documents.files')
    .countDocuments();

  await gridfs.dropBucket();
  const deletedDocs = await StoredDocument.deleteMany({});

  const afterGridFs = await mongoose.connection.db
    ?.collection('documents.files')
    .countDocuments();

  console.log(`Connected to ${dbName} (${host})`);
  console.log(`Removed ${beforeGridFs ?? 0} GridFS files`);
  console.log(`Removed ${deletedDocs.deletedCount} stored document records (was ${beforeDocs})`);
  console.log(`GridFS files remaining: ${afterGridFs ?? 0}`);
  console.log('All PDFs and file metadata cleared from Atlas.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
