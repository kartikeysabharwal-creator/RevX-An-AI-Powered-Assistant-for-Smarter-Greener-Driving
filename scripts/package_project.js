#!/usr/bin/env node
/**
 * RevX Project Packager
 * Creates a clean zip of the source code, excluding secrets, build artifacts, and node_modules
 * Run: node scripts/package_project.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const outputFile = path.join(rootDir, '..', `revx-source-${timestamp}.zip`);

const excludePatterns = [
  'node_modules',
  '.next',
  'dist',
  '.expo',
  '.env',
  '*.env',
  '*.log',
  '__pycache__',
  '*.pyc',
  '.DS_Store',
  'revx-source-*.zip',
];

const excludeArgs = excludePatterns.map(p => `--exclude='${p}'`).join(' ');

console.log('📦 RevX Source Code Packager');
console.log('=====================================');
console.log(`Root:   ${rootDir}`);
console.log(`Output: ${outputFile}`);
console.log('');
console.log('Excluding: node_modules, .next, dist, .env, .expo, build artifacts...');

try {
  const cmd = `cd "${rootDir}" && zip -r "${outputFile}" . ${excludeArgs} --exclude='*.zip'`;
  execSync(cmd, { stdio: 'inherit' });

  const stats = fs.statSync(outputFile);
  const sizeMb = (stats.size / 1024 / 1024).toFixed(1);
  
  console.log('');
  console.log(`✅ Packaged successfully! (${sizeMb} MB)`);
  console.log(`   File: ${outputFile}`);
  console.log('');
  console.log('To extract and run:');
  console.log('  unzip revx-source-*.zip -d revx');
  console.log('  cd revx');
  console.log('  npm install');
  console.log('  cp .env.example apps/api/.env  # fill in your values');
  console.log('  npm run dev:api                # start the backend');
  console.log('  npm run dev:web                # start the web dashboard');
  console.log('  npm run test:sim               # run simulator');
} catch (err) {
  console.error('❌ Packaging failed:', err.message);
  process.exit(1);
}
