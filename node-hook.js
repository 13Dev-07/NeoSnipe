// Redirect to scripts/node-hook.js
const path = require('path');
try {
  require(path.join(__dirname, 'scripts', 'node-hook.js'));
} catch (err) {
  console.error('Error: Please run clean.bat or clean.sh to reset your environment');
  process.exit(1);
}