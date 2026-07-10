const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('auth and portal scripts use a shared API base helper', () => {
  const authSignup = fs.readFileSync(path.join(__dirname, '..', 'auth.js'), 'utf8');
  const authSignin = fs.readFileSync(path.join(__dirname, '..', 'auth-signin.js'), 'utf8');
  const portal = fs.readFileSync(path.join(__dirname, '..', 'portal.html'), 'utf8');

  assert.match(authSignup, /DomasiHubApi|apiUrl\(/);
  assert.match(authSignin, /DomasiHubApi|apiUrl\(/);
  assert.match(portal, /DomasiHubApi|apiUrl\(/);
});
