const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const path = require('path');

const OUT_DIR = process.argv[2];
if (!OUT_DIR) {
  console.error('Usage: node generate-credentials.js <output-dir>');
  process.exit(1);
}

function randomPassword(len = 20) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%*';
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

async function buildAccount(n, username, label) {
  const password = randomPassword(20);
  const passwordHash = await bcrypt.hash(password, 12);
  const totpSecret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(username, 'PetFoodAngol Admin', totpSecret);
  const qrPath = path.join(OUT_DIR, `totp-qr-${username}.png`);
  await QRCode.toFile(qrPath, otpauthUrl, { width: 300 });
  return {
    envVars: {
      [`ADMIN${n}_USERNAME`]: username,
      [`ADMIN${n}_PASSWORD_HASH`]: passwordHash,
      [`ADMIN${n}_TOTP_SECRET`]: totpSecret,
      [`ADMIN${n}_LABEL`]: label
    },
    plaintext: { username, password, totpSecret, otpauthUrl, qrPath }
  };
}

(async () => {
  const acc1 = await buildAccount(1, 'benji', 'Benji');
  const acc2 = await buildAccount(2, 'dueno', 'Dueño');
  const sessionSecret = crypto.randomBytes(32).toString('hex');

  const allEnvVars = { ...acc1.envVars, ...acc2.envVars, SESSION_SECRET: sessionSecret };

  const fs = require('fs');
  fs.writeFileSync(
    path.join(OUT_DIR, 'render-env-vars.txt'),
    Object.entries(allEnvVars).map(([k, v]) => `${k}=${v}`).join('\n') + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'credentials-plaintext.json'),
    JSON.stringify({ acc1: acc1.plaintext, acc2: acc2.plaintext }, null, 2),
    'utf8'
  );

  console.log('Listo. Archivos en', OUT_DIR);
})();
