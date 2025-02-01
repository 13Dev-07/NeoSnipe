// Simple version check script
const semver = require('semver');
const pkg = require('./package.json');

const required = pkg.engines.node;
const current = process.version;

if (!semver.satisfies(current, required)) {
    console.error(`Required Node.js version is ${required}, but you're using ${current}`);
    process.exit(1);
}