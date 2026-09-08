const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

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
  if (!imageUrl || !imageUrl.includes(PUBLIC_URL)) return;
  
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