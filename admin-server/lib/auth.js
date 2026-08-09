const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');

function getAccounts() {
  const accounts = [];
  for (const n of [1, 2]) {
    const username = process.env[`ADMIN${n}_USERNAME`];
    const passwordHash = process.env[`ADMIN${n}_PASSWORD_HASH`];
    const totpSecret = process.env[`ADMIN${n}_TOTP_SECRET`];
    const label = process.env[`ADMIN${n}_LABEL`] || username;
    if (username && passwordHash && totpSecret) {
      accounts.push({ username, passwordHash, totpSecret, label });
    }
  }
  return accounts;
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

  return { ok: true, user: { username: account.username, label: account.label } };
}

module.exports = { getAccounts, findAccount, verifyLogin };
