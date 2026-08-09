const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');

const MAX_ACCOUNT_SLOTS = 6;

function getAccounts() {
  const accounts = [];
  for (let n = 1; n <= MAX_ACCOUNT_SLOTS; n++) {
    const username = process.env[`ADMIN${n}_USERNAME`];
    const passwordHash = process.env[`ADMIN${n}_PASSWORD_HASH`];
    const totpSecret = process.env[`ADMIN${n}_TOTP_SECRET`];
    const label = process.env[`ADMIN${n}_LABEL`] || username;
    const role = process.env[`ADMIN${n}_ROLE`] === 'owner' ? 'owner' : 'admin';
    if (username && passwordHash && totpSecret) {
      accounts.push({ slot: n, username, passwordHash, totpSecret, label, role });
    }
  }
  return accounts;
}

function nextFreeSlot() {
  const used = new Set(getAccounts().map(a => a.slot));
  for (let n = 1; n <= MAX_ACCOUNT_SLOTS; n++) {
    if (!used.has(n)) return n;
  }
  return null;
}

function findAccount(username) {
  return getAccounts().find(a => a.username.toLowerCase() === String(username || '').toLowerCase());
}

async function verifyLogin(username, password, totpToken) {
  const account = findAccount(username);
  if (!account) {
    // Still hash something to keep timing roughly consistent whether or not the user exists.
    await bcrypt.compare(password || '', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8gI/aA7gVW1H3F1w1F1w1F1w1F1w1a');
    return { ok: false };
  }
  const passwordOk = await bcrypt.compare(password || '', account.passwordHash);
  if (!passwordOk) return { ok: false };

  const totpOk = authenticator.verify({ token: String(totpToken || '').trim(), secret: account.totpSecret });
  if (!totpOk) return { ok: false };

  return { ok: true, user: { username: account.username, label: account.label, role: account.role } };
}

module.exports = { getAccounts, findAccount, verifyLogin, nextFreeSlot, MAX_ACCOUNT_SLOTS };
