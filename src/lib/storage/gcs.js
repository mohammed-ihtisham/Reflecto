import { Storage } from '@google-cloud/storage';
import { GCS_BUCKET_NAME, GCS_CREDENTIALS_JSON } from '$env/static/private';
import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Initialize GCS Storage client
 */
function getStorageClient() {
  let credentials;

  // Check if GCS_CREDENTIALS_JSON is a file path or JSON string
  if (!GCS_CREDENTIALS_JSON) {
    throw new Error('GCS_CREDENTIALS_JSON environment variable is not set');
  }

  // Try to resolve as a file path first (relative or absolute)
  const possiblePath = resolve(GCS_CREDENTIALS_JSON);
  
  if (existsSync(possiblePath)) {
    // It's a file path, read the file
    try {
      const credentialsFile = readFileSync(possiblePath, 'utf8');
      credentials = JSON.parse(credentialsFile);
    } catch (e) {
      throw new Error(`Failed to read or parse credentials file: ${e.message}`);
    }
  } else {
    // It's likely a JSON string, parse it
    try {
      credentials = JSON.parse(GCS_CREDENTIALS_JSON);
    } catch (e) {
      // If parsing fails, it might be a file path that doesn't exist
      throw new Error(`GCS_CREDENTIALS_JSON is neither a valid file path nor valid JSON. File not found at: ${possiblePath}. JSON parse error: ${e.message}`);
    }
  }

  // Validate credentials structure
  if (!credentials.type || credentials.type !== 'service_account') {
    throw new Error('Invalid credentials: must be a service account key');
  }

  if (!GCS_BUCKET_NAME) {
    throw new Error('GCS_BUCKET_NAME environment variable is not set');
  }

  return new Storage({
    credentials
  });
}

/**
 * Upload an image to GCS
 * @param {Buffer|string} imageData - Image data as Buffer or base64 string
 * @param {string} fileName - File name/path in the bucket
 * @param {string} mimeType - MIME type (e.g., 'image/png')
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function uploadImageToGCS(imageData, fileName, mimeType = 'image/png') {
  const storage = getStorageClient();
  const bucket = storage.bucket(GCS_BUCKET_NAME);

  // Convert base64 string to Buffer if needed
  let buffer;
  if (typeof imageData === 'string') {
    // Remove data URL prefix if present
    const base64Data = imageData.includes(',') 
      ? imageData.split(',')[1] 
      : imageData;
    buffer = Buffer.from(base64Data, 'base64');
  } else {
    buffer = imageData;
  }

  // Create file reference
  const file = bucket.file(fileName);

  // Upload the file
  // Note: With uniform bucket-level access enabled, we can't use legacy ACLs
  // Files will be accessible based on bucket IAM permissions
  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    }
    // Removed 'public: true' - bucket must have public read access via IAM
  });

  // Return the public URL
  // This will work if the bucket has public read access configured via IAM
  // If the bucket is not public, you may need to use signed URLs instead
  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileName}`;
}

/**
 * Upload multiple images to GCS
 * @param {Array<{imageData: Buffer|string, fileName: string, mimeType?: string}>} images
 * @returns {Promise<Array<{fileName: string, url: string}>>}
 */
export async function uploadImagesToGCS(images) {
  const uploadPromises = images.map(({ imageData, fileName, mimeType = 'image/png' }) =>
    uploadImageToGCS(imageData, fileName, mimeType).then(url => ({
      fileName,
      url
    }))
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete an image from GCS
 * @param {string} fileName - File name/path in the bucket
 * @returns {Promise<void>}
 */
export async function deleteImageFromGCS(fileName) {
  const storage = getStorageClient();
  const bucket = storage.bucket(GCS_BUCKET_NAME);
  const file = bucket.file(fileName);
  await file.delete();
}

/**
 * Generate a file path for a comic image
 * @param {string} userId - User ID
 * @param {Date} date - Date of the entry
 * @param {number} panelIndex - Panel index (0-based)
 * @returns {string} File path in the bucket
 */
export function generateComicImagePath(userId, date, panelIndex) {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `users/${userId}/${dateStr}/panel-${panelIndex + 1}.png`;
}

