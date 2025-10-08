// temp_hash.js (Run this once to get a hash)
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hashed Password: ${hash}`);
}

// Replace 'password123' with a secure password for your initial user
hashPassword('password123');