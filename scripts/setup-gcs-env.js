#!/usr/bin/env node

/**
 * Helper script to set up GCS credentials for environment variables
 * 
 * This script helps you convert your GCS JSON key file into a format
 * suitable for environment variables.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage: node scripts/setup-gcs-env.js <path-to-json-key-file>

This script will:
1. Read your GCS JSON key file
2. Show you how to set GCS_CREDENTIALS_JSON in your .env file

Example:
  node scripts/setup-gcs-env.js ./gcs-credentials.json
  `);
  process.exit(1);
}

const keyFilePath = resolve(args[0]);

try {
  // Read the JSON file
  const keyFileContent = readFileSync(keyFilePath, 'utf8');
  
  // Validate it's valid JSON
  const keyData = JSON.parse(keyFileContent);
  
  if (!keyData.type || keyData.type !== 'service_account') {
    console.error('❌ Error: This does not appear to be a service account key file');
    process.exit(1);
  }
  
  console.log('✅ Valid service account key file found!\n');
  console.log('Service Account Email:', keyData.client_email);
  console.log('Project ID:', keyData.project_id);
  console.log('\n---\n');
  console.log('📝 Add this to your .env file:\n');
  console.log('Option 1: Use file path (recommended for local development)');
  console.log(`GCS_CREDENTIALS_JSON=${keyFilePath}\n`);
  
  console.log('Option 2: Use JSON content as single-line string');
  console.log('(For production/hosting platforms like Vercel)');
  const singleLine = keyFileContent.replace(/\n/g, '\\n').replace(/"/g, '\\"');
  console.log(`GCS_CREDENTIALS_JSON="${singleLine}"\n`);
  
  console.log('Option 3: Use JSON content directly (if your env supports multi-line)');
  console.log('GCS_CREDENTIALS_JSON=');
  console.log(keyFileContent);
  console.log('\n---\n');
  console.log('⚠️  Remember:');
  console.log('   - Never commit credentials to Git');
  console.log('   - Add gcs-credentials.json to .gitignore');
  console.log('   - For production, use environment variables in your hosting platform');
  
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`❌ Error: File not found: ${keyFilePath}`);
  } else if (error instanceof SyntaxError) {
    console.error('❌ Error: Invalid JSON file');
    console.error(error.message);
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}

