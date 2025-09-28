#!/usr/bin/env node

const { execSync } = require('child_process');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // First, try to connect to the database
    console.log('📡 Testing database connection...');
    execSync('npx prisma db pull || true', { stdio: 'inherit' });

    // Push the schema to create tables
    console.log('📋 Creating database tables...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

    console.log('✅ Database setup completed successfully!');

    // Start the Next.js server
    console.log('🚀 Starting Next.js server...');
    execSync('next start', { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);

    // Try to start anyway (in case tables already exist)
    console.log('⚠️  Attempting to start server anyway...');
    try {
      execSync('next start', { stdio: 'inherit' });
    } catch (startError) {
      console.error('💥 Server startup also failed:', startError.message);
      process.exit(1);
    }
  }
}

setupDatabase();