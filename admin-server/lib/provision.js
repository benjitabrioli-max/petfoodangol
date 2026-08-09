const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');

function randomPassword(len = 20) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%*';
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

async function createAccountCredentials(slot, username, role, label) {
  const password = randomPassword(20);
  const passwordHash = await bcrypt.hash(password, 12);
  const totpSecret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(username, 'PetFoodAngol Admin', totpSecret);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { width: 260 });

  const envBlock = [
    `ADMIN${slot}_USERNAME=${username}`,
    `ADMIN${slot}_PASSWORD_HASH=${passwordHash}`,
    `ADMIN${slot}_TOTP_SECRET=${totpSecret}`,
    `ADMIN${slot}_LABEL=${label}`,
    `ADMIN${slot}_ROLE=${role}`
  ].join('\n');

  return { password, passwordHash, totpSecret, otpauthUrl, qrDataUrl, envBlock };
}

module.exports = { createAccountCredentials, randomPassword };
