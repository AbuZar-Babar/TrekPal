/**
 * Helper script to create .env file from template
 * Run: node create-env.js
 */

const fs = require('fs');
const path = require('path');

const envExample = `# Environment
NODE_ENV=development
PORT=3000

# Database - PostgreSQL Connection String
# Format: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public
# Example: postgresql://postgres:yourpassword@localhost:5432/trekpal?schema=public
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/trekpal?schema=public"

# JWT Secret - Must be at least 32 characters long
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
JWT_EXPIRES_IN=7d

# Firebase (Optional in development - can be left empty)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_STORAGE_BUCKET=

# CORS - Frontend URL
CORS_ORIGIN=http://localhost:5173
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to recreate it, delete the existing .env file first.');
  process.exit(0);
}

try {
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Edit .env file and update DATABASE_URL with your PostgreSQL credentials');
  console.log('   2. Update JWT_SECRET with a secure key (min 32 characters)');
  console.log('   3. Create the database: psql -U postgres -c "CREATE DATABASE trekpal;"');
  console.log('   4. Run: npm run prisma:generate');
  console.log('   5. Run: npm run prisma:migrate');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

