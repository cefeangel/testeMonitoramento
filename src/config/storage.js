import { Storage } from '@google-cloud/storage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const storage = new Storage({
  keyFilename: process.env.GCS_KEY_PATH,
  projectId: process.env.GCS_PROJECT_ID, // Opcional se estiver no JSON
});

export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || 'api-eventos');

export default storage;
