const crypto = require('crypto');

function ensureToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  return req.session.csrfToken;
}

function verifyToken(req) {
  return Boolean(
    req.body &&
    req.body._csrf &&
    req.session.csrfToken &&
    req.body._csrf === req.session.csrfToken
  );
}

module.exports = { ensureToken, verifyToken };
