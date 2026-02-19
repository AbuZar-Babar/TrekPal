/**
 * Helper script to create .env file from template
 * Run: node create-env.js
 */

const fs = require('fs');
const path = require('path');

const envExample = `# Environment
NODE_ENV=development
PORT=3000

# Database URLs
# Runtime DB URL (local PostgreSQL in development)
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/trekpal?schema=public"
# Direct DB URL (used by prisma migrate deploy against Supabase)
DIRECT_URL=""

# JWT Secret - Must be at least 32 characters long
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
JWT_EXPIRES_IN=7d

# Supabase (required for KYC uploads + signed URL generation)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET_KYC=kyc-private
SUPABASE_SIGNED_URL_TTL_SECONDS=3600

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
  console.log('WARNING: .env file already exists');
  console.log('Delete the existing .env file first if you want to recreate it.');
  process.exit(0);
}

try {
  fs.writeFileSync(envPath, envExample);
  console.log('SUCCESS: .env file created');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update DATABASE_URL for local PostgreSQL');
  console.log('2. Set a secure JWT_SECRET (min 32 characters)');
  console.log('3. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.log('4. Add DIRECT_URL when running prisma migrate deploy against Supabase');
  console.log('5. Run: npm run prisma:generate');
  console.log('6. Run: npm run prisma:migrate');
} catch (error) {
  console.error('ERROR creating .env file:', error.message);
  process.exit(1);
}
