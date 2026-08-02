/**
 * AST & File System Assertion Helpers for Zero-Dependency Node.js E2E Test Suite
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '../../');

function getAbsolutePath(relativePath) {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.join(ROOT_DIR, relativePath);
}

function fileExists(relativePath) {
  const fullPath = getAbsolutePath(relativePath);
  return fs.existsSync(fullPath);
}

function getFileContent(relativePath) {
  const fullPath = getAbsolutePath(relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relativePath} (full path: ${fullPath})`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function assertFileExists(relativePath, message) {
  const exists = fileExists(relativePath);
  assert.ok(exists, message || `Expected file to exist: ${relativePath}`);
  return true;
}

function assertContains(relativePath, searchPattern, message) {
  const content = getFileContent(relativePath);
  if (searchPattern instanceof RegExp) {
    assert.ok(searchPattern.test(content), message || `Expected ${relativePath} to match pattern ${searchPattern}`);
  } else {
    assert.ok(content.includes(searchPattern), message || `Expected ${relativePath} to contain "${searchPattern}"`);
  }
  return true;
}

function assertImports(relativePath, moduleName, message) {
  const content = getFileContent(relativePath);
  const importRegex = new RegExp(`import\\s+.*from\\s+['"]${moduleName}['"]|require\\(['"]${moduleName}['"]\\)`);
  assert.ok(importRegex.test(content), message || `Expected ${relativePath} to import "${moduleName}"`);
  return true;
}

function assertTailwindClasses(relativePath, classes, message) {
  const content = getFileContent(relativePath);
  const classList = Array.isArray(classes) ? classes : [classes];
  for (const cls of classList) {
    assert.ok(content.includes(cls), message || `Expected ${relativePath} to contain Tailwind class "${cls}"`);
  }
  return true;
}

function assertExportExists(relativePath, exportName, message) {
  const content = getFileContent(relativePath);
  const exportRegex = new RegExp(`export\\s+(default\\s+)?(async\\s+)?(async\s+)?(function|const|class|type|interface|let|var)?\\s*\\b${exportName}\\b`);
  assert.ok(exportRegex.test(content), message || `Expected ${relativePath} to export "${exportName}"`);
  return true;
}

function parseJsonLd(relativePath) {
  const content = getFileContent(relativePath);
  const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [];
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    try {
      matches.push(JSON.parse(match[1].trim()));
    } catch (e) {
      // Invalid JSON in script
    }
  }
  return matches;
}

module.exports = {
  ROOT_DIR,
  getAbsolutePath,
  fileExists,
  getFileContent,
  assertFileExists,
  assertContains,
  assertImports,
  assertTailwindClasses,
  assertExportExists,
  parseJsonLd
};
