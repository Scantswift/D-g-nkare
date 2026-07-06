import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || ''

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic: boolean = true
): Promise<{ uploadUrl: string; cloudStoragePath: string; publicUrl?: string }> {
  const extension = fileName.split('.').pop()
  const key = `uploads/${randomUUID()}.${extension}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  const publicUrl = isPublic
    ? `${process.env.AWS_PUBLIC_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`}/${key}`
    : undefined

  return { uploadUrl, cloudStoragePath: key, publicUrl }
}

export async function getFileUrl(
  cloudStoragePath: string,
  contentType: string,
  isPublic: boolean
): Promise<string> {
  if (isPublic && process.env.AWS_PUBLIC_URL) {
    return `${process.env.AWS_PUBLIC_URL}/${cloudStoragePath}`
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: cloudStoragePath
  })

  return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}
