const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

function generateFileName(originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `projects/${timestamp}-${randomBytes}.${ext}`;
}

async function uploadToR2(fileBuffer, fileName, mimeType) {
  const hasR2Config = process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && BUCKET_NAME && PUBLIC_URL;

  if (!hasR2Config) {
    // MongoDB keeps this fallback persistent on Railway when R2 is not configured.
    return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
  }

  const key = generateFileName(fileName);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await r2Client.send(command);
  
  return `${PUBLIC_URL}/${key}`;
}

async function deleteFromR2(imageUrl) {
  if (!imageUrl) return;

  if (imageUrl.startsWith('/uploads/')) {
    const localName = path.basename(imageUrl);
    try {
      await fs.unlink(path.join(__dirname, '..', 'uploads', localName));
    } catch (error) {
      if (error.code !== 'ENOENT') console.error('Failed to delete local image:', error);
    }
    return;
  }

  if (imageUrl.startsWith('data:')) return;

  if (!PUBLIC_URL || !imageUrl.includes(PUBLIC_URL)) return;
  
  try {
    const key = imageUrl.replace(`${PUBLIC_URL}/`, '');
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
  } catch (error) {
    console.error('Failed to delete image from R2:', error);
  }
}

module.exports = { uploadToR2, deleteFromR2, r2Client };