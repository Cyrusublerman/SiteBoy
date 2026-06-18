import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE || 'https://media.einoder.net';

function getClient() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured');
  }
  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function publicUrl(key) {
  return `${R2_PUBLIC_BASE.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

export async function signPut(key, mime, bytes) {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error('R2_BUCKET not configured');
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mime,
    ContentLength: bytes,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return { url, key, fields: null };
}

export async function getObjectBuffer(key) {
  const bucket = process.env.R2_BUCKET;
  const client = getClient();
  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const chunks = [];
  for await (const chunk of res.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function putObjectBuffer(key, buffer, mime) {
  const bucket = process.env.R2_BUCKET;
  const client = getClient();
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mime,
  }));
}
