const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('signup page exposes the IDs expected by the auth script', () => {
  const signupHtml = fs.readFileSync(path.join(__dirname, '..', 'signup.html'), 'utf8');

  assert.match(signupHtml, /id="fullName"/);
  assert.match(signupHtml, /id="regNumber"/);
  assert.match(signupHtml, /id="whatsappNumber"/);
  assert.match(signupHtml, /id="password"/);
  assert.match(signupHtml, /id="confirmPassword"/);
});
