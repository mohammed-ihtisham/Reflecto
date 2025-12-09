# Google Cloud Storage (GCS) Setup Guide

## Step 1: Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **"Create Service Account"**
5. Fill in:
   - **Service account name**: `reflecto-storage` (or any name you prefer)
   - **Service account ID**: Will auto-generate
   - **Description**: "Service account for Reflecto image storage"
6. Click **"Create and Continue"**

## Step 2: Grant Permissions

1. In the **"Grant this service account access to project"** section:
   - Add role: **"Storage Object Admin"** (or **"Storage Admin"** for full access)
   - This allows the service account to read/write objects in your bucket
2. Click **"Continue"** → **"Done"**

## Step 3: Create and Download JSON Key

1. Find your newly created service account in the list
2. Click on the service account email
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"** as the key type
6. Click **"Create"**
   - This will automatically download a JSON file (e.g., `your-project-xxxxx-xxxxx.json`)

## Step 4: Get the JSON Content

You have two options for setting `GCS_CREDENTIALS_JSON`:

### Option A: JSON String (Recommended for environment variables)

1. Open the downloaded JSON file in a text editor
2. Copy the entire contents
3. For your `.env` file, you can either:
   - **Single line (escaped)**: Remove all newlines and escape quotes
   - **Multi-line**: Some systems support multi-line env vars, but it's tricky

**Better approach**: Use the file path instead (see Option B)

### Option B: File Path (Easier)

Instead of pasting the JSON content, you can:

1. Save the JSON file in your project (e.g., `gcs-credentials.json`)
2. Add it to `.gitignore` (IMPORTANT - never commit credentials!)
3. Set `GCS_CREDENTIALS_JSON` to the file path

## Step 5: Set Environment Variables

Add to your `.env` file:

```bash
# Option A: JSON content as string (one line, escaped)
GCS_CREDENTIALS_JSON='{"type":"service_account","project_id":"your-project",...}'

# Option B: File path (recommended)
GCS_CREDENTIALS_JSON=/path/to/your/gcs-credentials.json
# Or relative to project root:
GCS_CREDENTIALS_JSON=./gcs-credentials.json
```

## Step 6: Verify Your Bucket

1. Go to **Cloud Storage** → **Buckets** in Google Cloud Console
2. Make sure your bucket exists and is accessible
3. Note the bucket name (this goes in `GCS_BUCKET_NAME`)

## Security Best Practices

1. **Never commit credentials to Git**

   - Add `gcs-credentials.json` to `.gitignore`
   - Add `.env` to `.gitignore` (if not already)

2. **For production** (e.g., Vercel):

   - Use environment variables in your hosting platform
   - For Vercel: Settings → Environment Variables
   - Paste the JSON content as a single-line string

3. **Limit permissions**: Only grant the minimum permissions needed
   - For just storing images: **Storage Object Admin** is sufficient
   - Don't use **Storage Admin** unless you need bucket management

## Example JSON Key Structure

The downloaded JSON file will look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "reflecto-storage@your-project.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Troubleshooting

- **"Permission denied"**: Make sure the service account has the right role
- **"Bucket not found"**: Verify the bucket name matches `GCS_BUCKET_NAME`
- **"Invalid credentials"**: Check that the JSON is valid and not corrupted
- **For Vercel**: You may need to base64 encode the JSON or use their secret management
