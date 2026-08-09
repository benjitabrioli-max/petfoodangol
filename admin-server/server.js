require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const { verifyLogin, getAccounts, nextFreeSlot, MAX_ACCOUNT_SLOTS } = require('./lib/auth');
const { ensureToken, verifyToken, rotateToken } = require('./lib/csrf');
const { loadProducts, saveProducts, slugify, findProduct, getHistory, restoreToCommit } = require('./lib/data');
const { createAccountCredentials } = require('./lib/provision');
const views = require('./lib/views');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000
  }
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
});

function requireAuth(req, res, next) {
  if (req.session.user) return next();
  return res.redirect('/admin/login');
}

function requireOwner(req, res, next) {
  if (req.session.user && req.session.user.role === 'owner') return next();
  return res.status(403).send('Esta página es solo para la cuenta owner.');
}

function requireCsrf(req, res, next) {
  if (!verifyToken(req)) {
    return res
      .status(403)
      .send(
        'Este formulario ya fue enviado (o hiciste doble clic). Si tu cambio no se aplicó, ' +
        '<a href="/admin">volvé al panel</a> e intentá de nuevo.'
      );
  }
  // Single-use token: rotate immediately so a duplicate/replayed submission
  // (double-click, back-button resubmit) can't apply the same change twice.
  rotateToken(req);
  next();
}

app.get('/', (req, res) => res.redirect('/admin'));

app.get('/admin/login', (req, res) => {
  if (req.session.user) return res.redirect('/admin');
  const csrfToken = ensureToken(req);
  res.send(views.loginPage({ csrfToken }));
});

app.post('/admin/login', loginLimiter, async (req, res) => {
  const csrfToken = ensureToken(req);
  if (!verifyToken(req)) {
    return res.status(403).send(views.loginPage({ error: 'Solicitud inválida, intenta de nuevo.', csrfToken }));
  }
  const { username, password, token } = req.body;
  try {
    const result = await verifyLogin(username, password, token);
    if (!result.ok) {
      return res.send(views.loginPage({ error: 'Usuario, contraseña o código incorrecto.', csrfToken: ensureToken(req) }));
    }
    req.session.regenerate(err => {
      if (err) return res.send(views.loginPage({ error: 'Error de sesión, intenta de nuevo.', csrfToken }));
      req.session.user = result.user;
      res.redirect('/admin');
    });
  } catch (err) {
    console.error(err);
    res.send(views.loginPage({ error: 'Error inesperado, intenta de nuevo.', csrfToken: ensureToken(req) }));
  }
});

app.post('/admin/logout', requireAuth, requireCsrf, (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

app.use('/admin', requireAuth);

app.get('/admin', async (req, res) => {
  try {
    const data = await loadProducts();
    const csrfToken = ensureToken(req);
    const notice = req.session.notice;
    delete req.session.notice;
    res.send(views.dashboardPage(data, { user: req.session.user, csrfToken, notice }));
  } catch (err) {
    console.error(err);
    res.status(500).send('No se pudo cargar el catálogo desde GitHub. Revisa que GITHUB_TOKEN, GITHUB_OWNER y GITHUB_REPO estén configurados. Detalle: ' + err.message);
  }
});

app.get('/admin/products/new', async (req, res) => {
  try {
    const data = await loadProducts();
    const csrfToken = ensureToken(req);
    res.send(views.newProductPage({ data, sections: {}, csrfToken, user: req.session.user }));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error cargando datos: ' + err.message);
  }
});

app.post('/admin/products/new', requireCsrf, async (req, res) => {
  try {
    const data = await loadProducts();
    const csrfToken = ensureToken(req);
    const body = req.body;

    if (!body.name || !body.sectionId || !body.unit || body.price === '') {
      return res.send(views.newProductPage({ data, sections: {}, csrfToken, user: req.session.user, error: 'Faltan campos obligatorios.' }));
    }

    const section = data.sections.find(s => s.id === body.sectionId);
    if (!section) {
      return res.send(views.newProductPage({ data, sections: {}, csrfToken, user: req.session.user, error: 'Categoría inválida.' }));
    }

    const subTitle = (body.subTitle || '').trim() || null;
    let subsection = section.subsections.find(s => (s.title || null) === subTitle);
    if (!subsection) {
      subsection = { title: subTitle, badge: null, products: [] };
      section.subsections.push(subsection);
    }

    const colorClass = Array.isArray(body.colorClass) ? body.colorClass.join(' ') : (body.colorClass || '');
    const typeBadges = (body.typeBadges || '').split(',').map(s => s.trim()).filter(Boolean);

    let id = slugify(`${section.id}-${subTitle || ''}-${body.name}-${body.desc || ''}`) || slugify(body.name);
    let uniqueId = id;
    let n = 2;
    const allIds = new Set();
    data.sections.forEach(s => s.subsections.forEach(sub => sub.products.forEach(p => allIds.add(p.id))));
    while (allIds.has(uniqueId)) {
      uniqueId = `${id}-${n}`;
      n++;
    }

    subsection.products.push({
      id: uniqueId,
      name: body.name.trim(),
      desc: (body.desc || '').trim(),
      extra: (body.extra || '').trim(),
      unit: body.unit.trim(),
      price: parseInt(body.price, 10),
      oldPrice: body.oldPrice ? parseInt(body.oldPrice, 10) : null,
      colorClass,
      typeBadges,
      hidden: Boolean(body.hidden)
    });

    await saveProducts(data, `Agregar producto: ${body.name.trim()}`, req.session.user.label);
    req.session.notice = 'Producto agregado. Estará publicado en 1-2 min.';
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error guardando: ' + err.message);
  }
});

app.get('/admin/products/:id/edit', async (req, res) => {
  try {
    const data = await loadProducts();
    const found = findProduct(data, req.params.id);
    if (!found) return res.status(404).send('Producto no encontrado.');
    const csrfToken = ensureToken(req);
    res.send(views.editProductPage({
      data,
      product: found.product,
      sections: { currentSectionId: found.section.id, currentSubTitle: found.subsection.title || '' },
      csrfToken,
      user: req.session.user
    }));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error cargando datos: ' + err.message);
  }
});

app.post('/admin/products/:id/edit', requireCsrf, async (req, res) => {
  try {
    const data = await loadProducts();
    const found = findProduct(data, req.params.id);
    if (!found) return res.status(404).send('Producto no encontrado.');
    const csrfToken = ensureToken(req);
    const body = req.body;

    if (!body.name || !body.sectionId || !body.unit || body.price === '') {
      return res.send(views.editProductPage({
        data,
        product: found.product,
        sections: { currentSectionId: found.section.id, currentSubTitle: found.subsection.title || '' },
        csrfToken,
        user: req.session.user,
        error: 'Faltan campos obligatorios.'
      }));
    }

    // Remove from its current location first.
    found.subsection.products = found.subsection.products.filter(p => p.id !== found.product.id);

    const newSection = data.sections.find(s => s.id === body.sectionId) || found.section;
    const subTitle = (body.subTitle || '').trim() || null;
    let newSubsection = newSection.subsections.find(s => (s.title || null) === subTitle);
    if (!newSubsection) {
      newSubsection = { title: subTitle, badge: null, products: [] };
      newSection.subsections.push(newSubsection);
    }

    const colorClass = Array.isArray(body.colorClass) ? body.colorClass.join(' ') : (body.colorClass || '');
    const typeBadges = (body.typeBadges || '').split(',').map(s => s.trim()).filter(Boolean);

    newSubsection.products.push({
      id: found.product.id,
      name: body.name.trim(),
      desc: (body.desc || '').trim(),
      extra: (body.extra || '').trim(),
      unit: body.unit.trim(),
      price: parseInt(body.price, 10),
      oldPrice: body.oldPrice ? parseInt(body.oldPrice, 10) : null,
      colorClass,
      typeBadges,
      hidden: Boolean(body.hidden)
    });

    await saveProducts(data, `Editar producto: ${body.name.trim()}`, req.session.user.label);
    req.session.notice = 'Cambios guardados. Estarán publicados en 1-2 min.';
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error guardando: ' + err.message);
  }
});

app.post('/admin/products/:id/toggle', requireCsrf, async (req, res) => {
  try {
    const data = await loadProducts();
    const found = findProduct(data, req.params.id);
    if (!found) return res.status(404).send('Producto no encontrado.');
    found.product.hidden = !found.product.hidden;
    await saveProducts(data, `${found.product.hidden ? 'Ocultar' : 'Mostrar'} producto: ${found.product.name}`, req.session.user.label);
    req.session.notice = 'Cambio guardado. Estará publicado en 1-2 min.';
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error guardando: ' + err.message);
  }
});

app.post('/admin/products/:id/delete', requireCsrf, async (req, res) => {
  try {
    const data = await loadProducts();
    const found = findProduct(data, req.params.id);
    if (!found) return res.status(404).send('Producto no encontrado.');
    found.subsection.products = found.subsection.products.filter(p => p.id !== found.product.id);
    await saveProducts(data, `Eliminar producto: ${found.product.name}`, req.session.user.label);
    req.session.notice = 'Producto eliminado. Se publicará en 1-2 min.';
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error eliminando: ' + err.message);
  }
});

app.get('/admin/accounts', requireOwner, (req, res) => {
  const csrfToken = ensureToken(req);
  res.send(views.accountsPage({ accounts: getAccounts(), user: req.session.user, csrfToken }));
});

app.get('/admin/accounts/new', requireOwner, (req, res) => {
  const csrfToken = ensureToken(req);
  res.send(views.newAccountFormPage({ user: req.session.user, csrfToken }));
});

app.post('/admin/accounts/new', requireOwner, requireCsrf, async (req, res) => {
  const csrfToken = ensureToken(req);
  try {
    const { username, label, role } = req.body;
    if (!username || !label) {
      return res.send(views.newAccountFormPage({ user: req.session.user, csrfToken, error: 'Faltan campos obligatorios.' }));
    }
    if (getAccounts().some(a => a.username.toLowerCase() === username.trim().toLowerCase())) {
      return res.send(views.newAccountFormPage({ user: req.session.user, csrfToken, error: 'Ya existe una cuenta con ese usuario.' }));
    }
    const slot = nextFreeSlot();
    if (!slot) {
      return res.send(views.newAccountFormPage({ user: req.session.user, csrfToken, error: `Ya se alcanzó el máximo de ${MAX_ACCOUNT_SLOTS} cuentas.` }));
    }
    const safeRole = role === 'owner' ? 'owner' : 'admin';
    const creds = await createAccountCredentials(slot, username.trim(), safeRole, label.trim());
    res.send(views.newAccountResultPage({
      user: req.session.user,
      csrfToken,
      username: username.trim(),
      password: creds.password,
      qrDataUrl: creds.qrDataUrl,
      envBlock: creds.envBlock
    }));
  } catch (err) {
    console.error(err);
    res.status(500).send(views.newAccountFormPage({ user: req.session.user, csrfToken, error: 'Error generando la cuenta: ' + err.message }));
  }
});

app.get('/admin/history', async (req, res) => {
  try {
    const commits = await getHistory(20);
    const csrfToken = ensureToken(req);
    const notice = req.session.notice;
    delete req.session.notice;
    res.send(views.historyPage({ user: req.session.user, csrfToken, commits, notice }));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error cargando historial: ' + err.message);
  }
});

app.post('/admin/history/:sha/restore', requireCsrf, async (req, res) => {
  try {
    await restoreToCommit(req.params.sha, req.session.user.label);
    req.session.notice = 'Catálogo restaurado. Se publicará en 1-2 min.';
    res.redirect('/admin/history');
  } catch (err) {
    console.error(err);
    const csrfToken = ensureToken(req);
    const commits = await getHistory(20).catch(() => []);
    res.status(500).send(views.historyPage({ user: req.session.user, csrfToken, commits, error: 'Error al restaurar: ' + err.message }));
  }
});

app.listen(PORT, () => {
  console.log(`Admin server listening on port ${PORT}`);
});
