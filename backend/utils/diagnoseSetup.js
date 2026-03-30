#!/usr/bin/env node

/**
 * Diagnostic Script - Check Backend Setup
 * Run: node utils/diagnoseSetup.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 BACKEND SETUP DIAGNOSTIC\n');
console.log('=' .repeat(50));

// Check 1: Environment Variables
console.log('\n1️⃣  ENVIRONMENT VARIABLES');
console.log('-'.repeat(50));

const requiredEnvVars = ['PORT', 'MONGO_URL', 'JWT_SECRET'];
let envOk = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName === 'JWT_SECRET' ? '***' : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    envOk = false;
  }
});

if (!envOk) {
  console.log('\n⚠️  Missing environment variables! Check .env file');
}

// Check 2: Required Files
console.log('\n2️⃣  REQUIRED FILES');
console.log('-'.repeat(50));

const requiredFiles = [
  'index.js',
  'routes/auth.js',
  'models/User.js',
  'middleware/authMiddleware.js',
  '.env'
];

let filesOk = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}: MISSING`);
    filesOk = false;
  }
});

// Check 3: Node Modules
console.log('\n3️⃣  DEPENDENCIES');
console.log('-'.repeat(50));

const requiredPackages = [
  'express',
  'mongoose',
  'bcrypt',
  'jsonwebtoken',
  'cors',
  'dotenv'
];

let packagesOk = true;
requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg}`);
  } catch (e) {
    console.log(`❌ ${pkg}: NOT INSTALLED`);
    packagesOk = false;
  }
});

if (!packagesOk) {
  console.log('\n⚠️  Missing packages! Run: npm install');
}

// Check 4: MongoDB Connection
console.log('\n4️⃣  MONGODB CONNECTION');
console.log('-'.repeat(50));

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log(`✅ Connected to MongoDB`);
  console.log(`📍 Database URL: ${process.env.MONGO_URL}`);
  
  // Check 5: Database Collections
  console.log('\n5️⃣  DATABASE COLLECTIONS');
  console.log('-'.repeat(50));
  
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.log(`❌ Error listing collections: ${err.message}`);
    } else {
      if (collections.length === 0) {
        console.log('⚠️  No collections found (database is empty)');
      } else {
        collections.forEach(col => {
          console.log(`✅ ${col.name}`);
        });
      }
    }
    
    // Check 6: Admin User
    console.log('\n6️⃣  ADMIN USER');
    console.log('-'.repeat(50));
    
    const User = require('../models/User');
    User.findOne({ email: 'admin@draftin.com' })
      .then(admin => {
        if (admin) {
          console.log(`✅ Admin user exists`);
          console.log(`   Email: ${admin.email}`);
          console.log(`   Username: ${admin.username}`);
          console.log(`   Role: ${admin.role}`);
        } else {
          console.log(`❌ Admin user NOT found`);
          console.log(`   Run: npm run create-admin`);
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 DIAGNOSTIC SUMMARY');
        console.log('='.repeat(50));
        
        const allOk = envOk && filesOk && packagesOk && admin;
        
        if (allOk) {
          console.log('\n✅ All checks passed! Backend is ready to run.');
          console.log('\nStart backend with: npm run dev');
        } else {
          console.log('\n⚠️  Some checks failed. See above for details.');
          console.log('\nCommon fixes:');
          if (!envOk) console.log('  - Check .env file');
          if (!filesOk) console.log('  - Check required files exist');
          if (!packagesOk) console.log('  - Run: npm install');
          if (!admin) console.log('  - Run: npm run create-admin');
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        mongoose.connection.close();
        process.exit(allOk ? 0 : 1);
      })
      .catch(err => {
        console.log(`❌ Error checking admin user: ${err.message}`);
        console.log('\n' + '='.repeat(50) + '\n');
        mongoose.connection.close();
        process.exit(1);
      });
  });
})
.catch(err => {
  console.log(`❌ MongoDB Connection Failed`);
  console.log(`   Error: ${err.message}`);
  console.log(`   URL: ${process.env.MONGO_URL}`);
  console.log('\n⚠️  Make sure MongoDB is running!');
  console.log('   Windows: Start-Service MongoDB');
  console.log('   Or: mongod');
  console.log('\n' + '='.repeat(50) + '\n');
  process.exit(1);
});
