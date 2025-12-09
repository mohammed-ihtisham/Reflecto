import { MongoClient } from 'mongodb';

// Get environment variables from process.env
// Make sure to set these in your .env file or export them before running
const MONGODB_URL = process.env.MONGODB_URL;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URL || !DB_NAME) {
  console.error('❌ Missing environment variables:');
  console.error('   MONGODB_URL:', MONGODB_URL ? '✓' : '✗');
  console.error('   DB_NAME:', DB_NAME ? '✓' : '✗');
  process.exit(1);
}

async function checkDatabase() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('   Database:', DB_NAME);
    console.log('   URL:', MONGODB_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    console.log('\n✅ Connected successfully!\n');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Collections in database:');
    if (collections.length === 0) {
      console.log('   (No collections yet - they will be created when you first insert data)');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} document(s)`);
      }
    }
    
    console.log('\n📝 Expected collections:');
    console.log('   - users (created when first user signs up)');
    console.log('   - journal_entries (created when first journal entry is saved)');
    
    // Check if collections exist
    const usersExists = collections.some(c => c.name === 'users');
    const journalExists = collections.some(c => c.name === 'journal_entries');
    
    console.log('\n🔍 Status:');
    console.log('   users:', usersExists ? '✓ Exists' : '✗ Not created yet');
    console.log('   journal_entries:', journalExists ? '✓ Exists' : '✗ Not created yet');
    
    if (usersExists) {
      const users = await db.collection('users').find({}).limit(5).toArray();
      console.log('\n👤 Sample users:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.name})`);
      });
    }
    
    if (journalExists) {
      const entries = await db.collection('journal_entries').find({}).limit(5).toArray();
      console.log('\n📔 Sample journal entries:');
      entries.forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString();
        const preview = entry.content?.substring(0, 50) || '(empty)';
        console.log(`   - ${date}: ${preview}...`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed');
    }
  }
}

checkDatabase();

