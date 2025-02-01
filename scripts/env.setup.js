// Environment setup and validation
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const pkg = require('../package.json');

// Validate Node.js version
const required = pkg.engines.node;
const current = process.version;

if (!semver.satisfies(current, required)) {
  console.error(`Required Node.js version is ${required}, but you're using ${current}`);
  process.exit(1);
}

// Define __non_webpack_require__ at the earliest possible point
global.__non_webpack_require__ = require;