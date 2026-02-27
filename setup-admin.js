#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════
// Setup Script - Initialize Admin Credentials
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const ADMIN_SETTINGS_PATH = path.join(__dirname, 'src/config/admin-settings.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('===================================================');
  console.log('STIH - Admin Setup');
  console.log('===================================================\n');

  const username = await prompt('Enter admin username (default: admin): ') || 'admin';
  const password = await prompt('Enter admin password: ');
  const confirmPassword = await prompt('Confirm admin password: ');

  if (password !== confirmPassword) {
    console.error('❌ Passwords do not match!');
    rl.close();
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters!');
    rl.close();
    process.exit(1);
  }

  console.log('\n⏳ Generating password hash...');

  const passwordHash = bcrypt.hashSync(password, 10);

  const settings = {
    admin: {
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    },
  };

  fs.writeFileSync(ADMIN_SETTINGS_PATH, JSON.stringify(settings, null, 2));

  console.log('✅ Admin credentials saved successfully!');
  console.log(`\n📋 Admin Settings:
  - Username: ${username}
  - Password: [hidden]
  - Location: ${ADMIN_SETTINGS_PATH}`);

  rl.close();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
