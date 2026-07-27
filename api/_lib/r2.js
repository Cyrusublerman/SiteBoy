import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
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

function bucketName() {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error('R2_BUCKET not configured');
  return bucket;
}

export async function signPut(key, mime, bytes, sha256 = null) {
  const bucket = bucketName();
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mime,
    ContentLength: bytes,
    Metadata: sha256 ? { sha256 } : undefined,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return {
    url,
    key,
    fields: null,
    headers: {
      'Content-Type': mime,
      ...(sha256 ? { 'x-amz-meta-sha256': sha256 } : {}),
    },
  };
}

export async function headObject(key) {
  const response = await getClient().send(new HeadObjectCommand({
    Bucket: bucketName(),
    Key: key,
  }));
  return {
    bytes: Number(response.ContentLength),
    mime: response.ContentType || null,
    etag: response.ETag?.replaceAll('"', '') || null,
    sha256: response.Metadata?.sha256 || response.ChecksumSHA256 || null,
  };
}

export async function createMultipart(key, mime, sha256 = null) {
  const response = await getClient().send(new CreateMultipartUploadCommand({
    Bucket: bucketName(),
    Key: key,
    ContentType: mime,
    Metadata: sha256 ? { sha256 } : undefined,
  }));
  return { uploadId: response.UploadId };
}

export async function signMultipartPart(key, uploadId, partNumber) {
  const command = new UploadPartCommand({
    Bucket: bucketName(),
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(getClient(), command, { expiresIn: 3600 });
}

export async function completeMultipart(key, uploadId, parts) {
  return getClient().send(new CompleteMultipartUploadCommand({
    Bucket: bucketName(),
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.map(({ partNumber, etag }) => ({
        PartNumber: partNumber,
        ETag: etag,
      })),
    },
  }));
}

export async function abortMultipart(key, uploadId) {
  await getClient().send(new AbortMultipartUploadCommand({
    Bucket: bucketName(),
    Key: key,
    UploadId: uploadId,
  }));
}

export async function deleteObject(key) {
  await getClient().send(new DeleteObjectCommand({ Bucket: bucketName(), Key: key }));
}

export async function listObjectKeys(prefix = '', continuationToken) {
  const response = await getClient().send(new ListObjectsV2Command({
    Bucket: bucketName(),
    Prefix: prefix,
    ContinuationToken: continuationToken,
  }));
  return {
    keys: (response.Contents || []).map(({ Key }) => Key).filter(Boolean),
    continuationToken: response.IsTruncated ? response.NextContinuationToken : null,
  };
}

export async function getObjectBuffer(key) {
  const bucket = bucketName();
  const client = getClient();
  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const chunks = [];
  for await (const chunk of res.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function putObjectBuffer(key, buffer, mime) {
  const bucket = bucketName();
  const client = getClient();
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mime,
  }));
}
