const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to get the bundle size from stats file
const getBundleSize = (statsPath) => {
  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  const assets = stats.assets || [];
  let totalSize = 0;

  assets.forEach(asset => {
    if (asset.name.endsWith('.js')) {
      totalSize += asset.size;
    }
  });

  return totalSize / 1024 / 1024; // Convert to MB
};

// Build the application with bundle analyzer
console.log('Building application with bundle analyzer...');
execSync('ANALYZE=true npm run build', { stdio: 'inherit' });

// Get the bundle size
const statsPath = path.join(__dirname, '../.next/stats.json');
const bundleSize = getBundleSize(statsPath);

// Check if bundle size exceeds threshold (1MB)
const THRESHOLD = 1.0; // MB
if (bundleSize > THRESHOLD) {
  console.error(`Bundle size (${bundleSize.toFixed(2)}MB) exceeds threshold of ${THRESHOLD}MB`);
  console.log('Suggestions for optimization:');
  console.log('1. Use dynamic imports for large dependencies');
  console.log('2. Review and remove unused dependencies');
  console.log('3. Implement code splitting for routes');
  console.log('4. Consider using smaller alternatives for large packages');
  process.exit(1);
} else {
  console.log(`Bundle size: ${bundleSize.toFixed(2)}MB (under ${THRESHOLD}MB threshold)`);
  process.exit(0);
}