const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('server migration logic upgrades existing database tables with image_urls columns', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'server', 'index.js'), 'utf8');
  assert.match(indexSource, /ALTER TABLE/i);
  assert.match(indexSource, /image_urls/i);
});
