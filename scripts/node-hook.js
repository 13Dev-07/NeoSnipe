// Node.js hook for development environment setup
const path = require('path');
const semver = require('semver');
const pkg = require('../package.json');

// Required environment setup
require(path.join(__dirname, 'env.setup.js'));

// Validate Node.js version
const required = pkg.engines.node;
const current = process.version;

if (!semver.satisfies(current, required)) {
    console.error(`Required Node.js version is ${required}, but you're using ${current}`);
    process.exit(1);
}

// This file is used by both predev and dev scripts