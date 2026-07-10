const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('schema supports image storage for portal submissions', () => {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'server', 'schema.sql'), 'utf8');
  assert.match(schema, /CREATE TABLE IF NOT EXISTS marketplace_items[\s\S]*image_urls TEXT/i);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS printer_stations[\s\S]*image_urls TEXT/i);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS accommodations[\s\S]*image_urls TEXT/i);
});

test('home page includes a summary area for recent listings', () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(indexHtml, /id="recentSummary"/);
});
