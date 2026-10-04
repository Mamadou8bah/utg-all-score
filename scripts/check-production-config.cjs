const path = require('node:path');
const { loadEnvConfig } = require('../frontend/node_modules/@next/env');

process.env.NODE_ENV = 'production';
let failures = 0;
const placeholder = (value) => !value || /change.this|your[-_ ]|example\.com|dev.secret/i.test(value);
function check(app, name, valid) {
  console.log(`${valid ? 'PASS' : 'FAIL'} ${app}: ${name}`);
  if (!valid) failures++;
}
function https(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname); }
  catch { return false; }
}

for (const app of ['frontend', 'admin-app', 'agent-app']) {
  const { combinedEnv: env } = loadEnvConfig(path.resolve(app), false, { info() {}, error() {} }, true);
  if (app === 'frontend') {
    for (const name of ['DATABASE_URL', 'DIRECT_URL']) {
      check(app, name, !!env[name] && /^postgres(ql)?:\/\//.test(env[name]) && !placeholder(env[name]));
    }
    check(app, 'AUTH_SECRET (unique, at least 32 characters)', !placeholder(env.AUTH_SECRET) && env.AUTH_SECRET.length >= 32);
    for (const name of ['ADMIN_APP_URL', 'AGENT_APP_URL']) check(app, name, https(env[name]));
    const uploads = !!env.CLOUDINARY_CLOUD_NAME && !!(env.CLOUDINARY_UPLOAD_PRESET || (env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET));
    check(app, 'Cloudinary upload configuration', uploads);
    console.log(`${env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY ? 'PASS' : 'WARN'} ${app}: push notification keys`);
    if (env.SETUP_SECRET) {
      check(app, 'SETUP_SECRET (unique, at least 32 characters)', !placeholder(env.SETUP_SECRET) && env.SETUP_SECRET.length >= 32);
      console.log('WARN frontend: remove SETUP_SECRET after initial setup');
    }
    if (env.ADMIN_INITIAL_PASSWORD) check(app, 'ADMIN_INITIAL_PASSWORD (unique, at least 12 characters)', !placeholder(env.ADMIN_INITIAL_PASSWORD) && env.ADMIN_INITIAL_PASSWORD.length >= 12 && env.ADMIN_INITIAL_PASSWORD !== 'UTGSUAdmin2026!');
  } else {
    check(app, 'NEXT_PUBLIC_API_URL', https(env.NEXT_PUBLIC_API_URL));
    if (env.NEXT_PUBLIC_PUBLIC_SITE_URL) check(app, 'NEXT_PUBLIC_PUBLIC_SITE_URL', https(env.NEXT_PUBLIC_PUBLIC_SITE_URL));
  }
}
console.log(`Production configuration: ${failures ? `${failures} checks need attention` : 'all required checks passed'}. No secret values were printed.`);
process.exitCode = failures ? 1 : 0;
