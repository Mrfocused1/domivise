#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const blockedTokens = [
  'cGF1bA==',
  'YnJpZGdlcw==',
  'c2hvbm93bw==',
  'cGF1bHNob25vd28=',
  'c2hvbm93bzI=',
  'ZG9taXZpc2VxYQ=='
];

function loosePattern(token) {
  const value = Buffer.from(token, 'base64').toString('utf8');
  return new RegExp(value.split('').map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*'), 'i');
}

const blockedPatterns = blockedTokens.map((token) => ({
  label: 'blocked personal identity',
  pattern: loosePattern(token)
}));

const ignoredDirs = new Set([
  '.git',
  '.vercel',
  'node_modules'
]);

const ignoredFiles = new Set([
  'AGENTS.md',
  '.cursor/rules/domivise-privacy-guard.mdc',
  'scripts/privacy-guard.mjs'
]);

const binaryExtensions = new Set([
  '.avif',
  '.db',
  '.gif',
  '.heic',
  '.ico',
  '.jpeg',
  '.jpg',
  '.mov',
  '.mp4',
  '.pdf',
  '.png',
  '.sqlite',
  '.webp'
]);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function isBinaryPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return binaryExtensions.has(ext) || path.basename(filePath) === '.DS_Store';
}

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relative = toPosix(path.relative(root, fullPath));

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) files.push(...listFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (ignoredFiles.has(relative) || isBinaryPath(fullPath)) continue;
    files.push(fullPath);
  }

  return files;
}

const findings = [];

for (const filePath of listFiles(root)) {
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch {
    continue;
  }

  const relative = toPosix(path.relative(root, filePath));
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const blocked of blockedPatterns) {
      if (blocked.pattern.test(line)) {
        findings.push(`${relative}:${index + 1}: ${blocked.label}`);
      }
    }
  });
}

if (findings.length) {
  console.error('Privacy guard failed. Remove blocked personal identity references before continuing.');
  findings.slice(0, 50).forEach((finding) => console.error(`- ${finding}`));
  if (findings.length > 50) console.error(`- ...and ${findings.length - 50} more`);
  process.exit(1);
}

console.log('Privacy guard passed: no blocked personal identity references found.');
