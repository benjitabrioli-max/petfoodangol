const { formatCLP } = require('./render');

const COLOR_CLASSES = ['gatos', 'antiparasitarios', 'higiene', 'accesorios', 'hogar', 'snacks', 'humedo', 'palta', 'huevos'];

const SECTION_LABELS = {
  perros: '🐶 Perros',
  gatos: '🐱 Gatos',
  humedo: '🥫 Sobres y latas',
  snacks: '🍬 Snacks',
  antiparasitarios: '💊 Antiparasitarios',
  higiene: '🧴 Higiene',
  accesorios: '🍽️ Accesorios',
  hogar: '🏠 Hogar',
  palta: '🥑 Palta',
  huevos: '🥚 Huevos'
};

function esc(str) {
  return String(str === null || str === undefined ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title, bodyHtml, opts = {}) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} · Panel PetFoodAngol</title>
<style>
  :root{
    --brown-900:#3d2b1f; --brown-700:#6b4a30; --brown-500:#a9714b;
    --cream:#fbf3e7; --cream-2:#f3e4cc; --green:#5c7a4a; --red:#c0392b;
    --yellow:#e0a52c; --white:#fff; --text:#3a2f27; --radius:12px;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Segoe UI',Verdana,Arial,sans-serif;background:var(--cream);color:var(--text);}
  header{background:linear-gradient(135deg,var(--brown-900),var(--brown-700));color:var(--cream);padding:1.2rem 1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.6rem;}
  header .logo{font-weight:800;font-size:1.3rem;}
  header .logo span{color:var(--yellow);}
  header .user-bar{display:flex;align-items:center;gap:1rem;font-size:0.9rem;}
  header a, header button{color:var(--cream);}
  main{max-width:900px;margin:0 auto;padding:1.5rem;}
  .card{background:var(--white);border-radius:var(--radius);padding:1.2rem 1.5rem;box-shadow:0 4px 14px rgba(61,43,31,0.1);margin-bottom:1.2rem;}
  h1{font-size:1.4rem;color:var(--brown-900);}
  h2.sec{font-size:1.15rem;color:var(--brown-900);margin:1.6rem 0 0.6rem;border-bottom:2px solid var(--cream-2);padding-bottom:0.3rem;}
  h3.sub{font-size:0.95rem;color:var(--brown-700);margin:1rem 0 0.4rem;font-weight:700;}
  label{display:block;font-size:0.85rem;font-weight:700;margin:0.8rem 0 0.3rem;color:var(--brown-700);}
  input[type=text], input[type=number], input[type=password], select{
    width:100%;padding:0.6rem 0.8rem;border-radius:8px;border:1px solid var(--cream-2);font-size:0.95rem;font-family:inherit;
  }
  .checkbox-row{display:flex;align-items:center;gap:0.5rem;margin:0.8rem 0;}
  .checkbox-row input{width:auto;}
  .btn{display:inline-block;background:var(--brown-700);color:#fff;border:none;padding:0.6rem 1.2rem;border-radius:999px;font-weight:700;cursor:pointer;font-size:0.9rem;text-decoration:none;}
  .btn:hover{background:var(--brown-900);}
  .btn.green{background:var(--green);}
  .btn.red{background:var(--red);}
  .btn.small{padding:0.35rem 0.8rem;font-size:0.8rem;}
  .btn.ghost{background:transparent;color:var(--brown-700);border:1px solid var(--cream-2);}
  .row{display:flex;gap:0.6rem;flex-wrap:wrap;align-items:center;}
  .error{background:#fbeaea;color:#8a2c22;padding:0.7rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:0.9rem;}
  .notice{background:#e7efdd;color:#3c5230;padding:0.7rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:0.9rem;}
  table{width:100%;border-collapse:collapse;font-size:0.88rem;}
  th{text-align:left;color:var(--brown-700);font-size:0.78rem;text-transform:uppercase;padding:0.4rem 0.5rem;border-bottom:2px solid var(--cream-2);}
  td{padding:0.5rem;border-bottom:1px solid var(--cream-2);vertical-align:top;}
  .hidden-tag{background:#eee;color:#888;font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:999px;font-weight:700;}
  .price{font-weight:700;}
  .old{text-decoration:line-through;color:#b3a596;font-size:0.8rem;margin-right:0.3rem;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;}
  form.inline{display:inline;}
  fieldset{border:1px solid var(--cream-2);border-radius:8px;padding:0.6rem 1rem;margin:0.6rem 0;}
  legend{font-size:0.8rem;font-weight:700;color:var(--brown-700);padding:0 0.4rem;}
  .field-error{color:var(--red);font-size:0.8rem;margin-top:0.3rem;display:none;}
  input.invalid{border-color:var(--red);}
  .subnav{display:flex;gap:0.5rem;flex-wrap:wrap;padding:0.7rem 1.5rem;background:var(--cream-2);}
  .subnav a{color:var(--brown-700);text-decoration:none;font-size:0.85rem;font-weight:700;padding:0.3rem 0.7rem;border-radius:999px;}
  .subnav a.active{background:var(--brown-700);color:#fff;}
  .subnav a:hover{background:rgba(107,74,48,0.15);}
  .search-box{position:relative;margin-bottom:1rem;}
  .search-box input{padding-left:2.1rem;}
  .search-box .icon{position:absolute;left:0.7rem;top:50%;transform:translateY(-50%);color:#8a7a6b;}
  .cold-start-note{font-size:0.78rem;color:#8a7a6b;text-align:center;margin-top:1rem;}
  code.env-block{display:block;white-space:pre-wrap;background:#2a2018;color:#e7dcc9;padding:1rem;border-radius:8px;font-size:0.82rem;overflow-x:auto;}
</style>
</head>
<body>
${opts.user ? `<header>
  <div class="logo">PetFood<span>Angol</span> · Admin</div>
  <div class="user-bar">
    <span>${esc(opts.user.label)}${opts.user.role === 'owner' ? ' 👑' : ''}</span>
    <form method="POST" action="/admin/logout" style="margin:0;">
      <input type="hidden" name="_csrf" value="${esc(opts.csrfToken)}">
      <button class="btn small ghost" type="submit">Salir</button>
    </form>
  </div>
</header>
<nav class="subnav">
  <a href="/admin" class="${opts.active === 'products' ? 'active' : ''}">Productos</a>
  <a href="/admin/history" class="${opts.active === 'history' ? 'active' : ''}">Historial</a>
  ${opts.user.role === 'owner' ? `<a href="/admin/accounts" class="${opts.active === 'accounts' ? 'active' : ''}">Cuentas</a>` : ''}
</nav>` : ''}
<main>
${bodyHtml}
</main>
<script>
  // Disable the submit button right after a form is submitted, so a double-click
  // (or an impatient second tap) can't fire the same request twice. Runs on the
  // bubble phase, after any per-form validation listener already had a chance to
  // call preventDefault() — if it did, the form isn't actually being sent, so we
  // must not disable the button (otherwise a failed validation would leave it
  // stuck forever).
  document.addEventListener('submit', function (e) {
    if (e.defaultPrevented) return;
    var btn = e.target.querySelector('button[type="submit"]');
    if (!btn || btn.disabled) return;
    btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Guardando...';
  });
</script>
</body>
</html>`;
}

function loginPage({ error, csrfToken }) {
  const body = `
  <div class="card" style="max-width:420px;margin:3rem auto;">
    <h1>PetFood<span style="color:var(--yellow)">Angol</span> · Panel</h1>
    ${error ? `<div class="error">${esc(error)}</div>` : ''}
    <form method="POST" action="/admin/login">
      <input type="hidden" name="_csrf" value="${esc(csrfToken)}">
      <label>Usuario</label>
      <input type="text" name="username" autocomplete="username" required autofocus>
      <label>Contraseña</label>
      <input type="password" name="password" autocomplete="current-password" required>
      <label>Código de la app autenticadora (6 dígitos)</label>
      <input type="text" name="token" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required>
      <div style="margin-top:1.2rem;">
        <button class="btn green" type="submit" style="width:100%;">Entrar</button>
      </div>
    </form>
    <p class="cold-start-note">
      ¿Tardó en cargar esta página? Es normal — el panel es un servicio gratuito que
      "se duerme" cuando nadie lo usa y tarda unos 30-50 segundos en despertar la primera vez.
      Una vez cargado, el resto es rápido.
    </p>
  </div>`;
  return layout('Iniciar sesión', body);
}

function colorClassCheckboxes(selected = []) {
  const sel = new Set((selected || '').split(/\s+/).filter(Boolean));
  return COLOR_CLASSES.map(c =>
    `<label style="display:inline-flex;align-items:center;gap:0.3rem;font-weight:400;margin-right:0.8rem;">
      <input type="checkbox" name="colorClass" value="${c}" ${sel.has(c) ? 'checked' : ''}> ${c}
    </label>`
  ).join('');
}

function sectionOptions(data, selected) {
  return data.sections.map(s =>
    `<option value="${esc(s.id)}" ${s.id === selected ? 'selected' : ''}>${esc(SECTION_LABELS[s.id] || s.title)}</option>`
  ).join('');
}

function subsectionDatalist(data) {
  const titles = new Set();
  data.sections.forEach(s => s.subsections.forEach(sub => { if (sub.title) titles.add(sub.title); }));
  return `<datalist id="subOptions">${Array.from(titles).map(t => `<option value="${esc(t)}">`).join('')}</datalist>`;
}

function dashboardPage(data, { user, csrfToken, notice }) {
  let rows = '';
  data.sections.forEach(section => {
    rows += `<h2 class="sec">${esc(SECTION_LABELS[section.id] || section.title)}</h2>`;
    section.subsections.forEach(sub => {
      if (sub.title) rows += `<h3 class="sub">${esc(sub.title)}</h3>`;
      rows += '<table><tbody>';
      sub.products.forEach(p => {
        rows += `<tr>
          <td>
            ${p.hidden ? '<span class="hidden-tag">OCULTO</span> ' : ''}<strong>${esc(p.name)}</strong>
            ${p.desc ? `<br><span style="color:#8a7a6b;font-size:0.82rem;">${esc(p.desc)}</span>` : ''}
          </td>
          <td class="price">
            ${p.oldPrice ? `<span class="old">${formatCLP(p.oldPrice)}</span>` : ''}${formatCLP(p.price)}
            <br><span style="color:#8a7a6b;font-size:0.78rem;">${esc(p.unit)}</span>
          </td>
          <td>
            <div class="row">
              <a class="btn small" href="/admin/products/${esc(p.id)}/edit">Editar</a>
              <form class="inline" method="POST" action="/admin/products/${esc(p.id)}/toggle">
                <input type="hidden" name="_csrf" value="${esc(csrfToken)}">
                <button class="btn small ghost" type="submit">${p.hidden ? 'Mostrar' : 'Ocultar'}</button>
              </form>
              <form class="inline" method="POST" action="/admin/products/${esc(p.id)}/delete" onsubmit="return confirm('¿Eliminar ${esc(p.name).replace(/'/g, '')}? Esta acción no se puede deshacer.');">
                <input type="hidden" name="_csrf" value="${esc(csrfToken)}">
                <button class="btn small red" type="submit">Eliminar</button>
              </form>
            </div>
          </td>
        </tr>`;
      });
      rows += '</tbody></table>';
    });
  });

  const body = `
    <div class="row" style="justify-content:space-between;margin-bottom:1rem;">
      <h1 style="margin:0;">Productos</h1>
      <a class="btn green" href="/admin/products/new">+ Agregar producto</a>
    </div>
    ${notice ? `<div class="notice">${esc(notice)}</div>` : ''}
    <div class="search-box">
      <span class="icon">🔍</span>
      <input type="text" id="dashSearch" placeholder="Buscar producto o marca...">
    </div>
    <p id="dashNoResults" style="display:none;color:#8a7a6b;text-align:center;padding:2rem;">
      Sin resultados para esa búsqueda.
    </p>
    <div class="card" id="catalogBody">${rows}</div>
    <script>
    (function(){
      function normalize(str){ return str.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); }
      var root = document.getElementById('catalogBody');
      var input = document.getElementById('dashSearch');
      var noResults = document.getElementById('dashNoResults');
      input.addEventListener('input', function(){
        var q = normalize(input.value.trim());
        var children = Array.prototype.slice.call(root.children);
        var anyVisible = false;
        var i = 0;
        while (i < children.length){
          var el = children[i];
          if (el.tagName === 'H2'){
            var j = i + 1;
            var groupEls = [];
            while (j < children.length && children[j].tagName !== 'H2'){ groupEls.push(children[j]); j++; }
            var sectionHasMatch = (q === '');
            var k = 0;
            while (k < groupEls.length){
              var h3 = null;
              if (groupEls[k].tagName === 'H3'){ h3 = groupEls[k]; k++; }
              var table = groupEls[k]; k++;
              if (!table) break;
              var rowsEls = Array.prototype.slice.call(table.querySelectorAll('tr'));
              var subHasMatch = (q === '');
              rowsEls.forEach(function(tr){
                var match = (q === '') || normalize(tr.textContent).indexOf(q) !== -1;
                tr.style.display = match ? '' : 'none';
                if (match) subHasMatch = true;
              });
              if (h3) h3.style.display = subHasMatch ? '' : 'none';
              table.style.display = subHasMatch ? '' : 'none';
              if (subHasMatch) sectionHasMatch = true;
            }
            el.style.display = sectionHasMatch ? '' : 'none';
            if (sectionHasMatch) anyVisible = true;
            i = j;
          } else { i++; }
        }
        noResults.style.display = (q !== '' && !anyVisible) ? 'block' : 'none';
      });
    })();
    </script>
  `;
  return layout('Panel', body, { user, csrfToken, active: 'products' });
}

function productForm({ product, sections, data, error, csrfToken, isNew }) {
  const p = product || { name: '', desc: '', extra: '', unit: '', price: '', oldPrice: '', colorClass: '', typeBadges: [], hidden: false };
  const currentSection = product ? sections.currentSectionId : '';
  const currentSubTitle = product ? sections.currentSubTitle : '';

  const body = `
    <h1>${isNew ? 'Agregar producto' : 'Editar producto'}</h1>
    ${error ? `<div class="error">${esc(error)}</div>` : ''}
    <div class="card">
      <form method="POST" id="productForm" action="${isNew ? '/admin/products/new' : `/admin/products/${esc(p.id)}/edit`}" novalidate>
        <input type="hidden" name="_csrf" value="${esc(csrfToken)}">

        <label>Categoría</label>
        <select name="sectionId" required>${sectionOptions(data, currentSection)}</select>

        <label>Subsección / marca (opcional, ej: "Master Dog 18kg")</label>
        <input type="text" name="subTitle" list="subOptions" value="${esc(currentSubTitle)}">
        ${subsectionDatalist(data)}

        <label>Nombre del producto</label>
        <input type="text" name="name" id="f-name" value="${esc(p.name)}" required>
        <span class="field-error" id="e-name">Falta el nombre.</span>

        <label>Descripción (sabor, edad, tamaño...)</label>
        <input type="text" name="desc" value="${esc(p.desc)}">

        <label>Info extra (ej: "Granel: $2.000 x kilo")</label>
        <input type="text" name="extra" value="${esc(p.extra)}">

        <div class="grid2">
          <div>
            <label>Unidad (ej: "bolsa 18kg", "unidad")</label>
            <input type="text" name="unit" id="f-unit" value="${esc(p.unit)}" required>
            <span class="field-error" id="e-unit">Falta la unidad.</span>
          </div>
          <div>
            <label>Precio actual (CLP)</label>
            <input type="number" name="price" id="f-price" value="${esc(p.price)}" min="0" step="1" required>
            <span class="field-error" id="e-price">Falta el precio.</span>
          </div>
        </div>

        <label>Precio anterior (dejar vacío si no está en oferta)</label>
        <input type="number" name="oldPrice" id="f-oldPrice" value="${esc(p.oldPrice || '')}" min="0" step="1">
        <span class="field-error" id="e-oldPrice">El precio anterior debe ser mayor al precio actual.</span>

        <fieldset>
          <legend>Color de tarjeta (categoría visual)</legend>
          ${colorClassCheckboxes(p.colorClass)}
        </fieldset>

        <label>Etiquetas (ej: Sobre, Lata) separadas por coma</label>
        <input type="text" name="typeBadges" value="${esc((p.typeBadges || []).join(', '))}">

        <div class="checkbox-row">
          <input type="checkbox" name="hidden" id="hidden" value="1" ${p.hidden ? 'checked' : ''}>
          <label for="hidden" style="margin:0;">Ocultar del sitio público</label>
        </div>

        <div class="row" style="margin-top:1.2rem;">
          <button class="btn green" type="submit">Guardar y publicar</button>
          <a class="btn ghost" href="/admin">Cancelar</a>
        </div>
      </form>
    </div>
    <script>
    (function(){
      var form = document.getElementById('productForm');
      var name = document.getElementById('f-name');
      var unit = document.getElementById('f-unit');
      var price = document.getElementById('f-price');
      var oldPrice = document.getElementById('f-oldPrice');

      function showError(input, errId, show){
        document.getElementById(errId).style.display = show ? 'block' : 'none';
        input.classList.toggle('invalid', show);
      }

      function validate(){
        var ok = true;
        if (!name.value.trim()){ showError(name, 'e-name', true); ok = false; } else showError(name, 'e-name', false);
        if (!unit.value.trim()){ showError(unit, 'e-unit', true); ok = false; } else showError(unit, 'e-unit', false);
        if (price.value === '' || Number(price.value) < 0){ showError(price, 'e-price', true); ok = false; } else showError(price, 'e-price', false);
        if (oldPrice.value !== '' && price.value !== '' && Number(oldPrice.value) <= Number(price.value)){
          showError(oldPrice, 'e-oldPrice', true); ok = false;
        } else showError(oldPrice, 'e-oldPrice', false);
        return ok;
      }

      [name, unit, price, oldPrice].forEach(function(input){
        input.addEventListener('input', validate);
      });

      form.addEventListener('submit', function(e){
        if (!validate()){
          e.preventDefault();
          var firstInvalid = form.querySelector('.invalid');
          if (firstInvalid) firstInvalid.focus();
          // Re-enable the submit button the double-submit guard disabled, since we blocked this attempt.
          var btn = form.querySelector('button[type="submit"]');
          if (btn){ btn.disabled = false; btn.textContent = btn.dataset.originalText || btn.textContent; }
        }
      });
    })();
    </script>
  `;
  return body;
}

function editProductPage(opts) {
  return layout('Editar producto', productForm({ ...opts, isNew: false }), { user: opts.user, csrfToken: opts.csrfToken, active: 'products' });
}

function newProductPage(opts) {
  return layout('Agregar producto', productForm({ ...opts, isNew: true }), { user: opts.user, csrfToken: opts.csrfToken, active: 'products' });
}

function accountsPage({ accounts, user, csrfToken }) {
  const rows = accounts.map(a => `
    <tr>
      <td><strong>${esc(a.label)}</strong><br><span style="color:#8a7a6b;font-size:0.8rem;">@${esc(a.username)}</span></td>
      <td>${a.role === 'owner' ? '👑 Owner' : 'Admin'}</td>
      <td style="color:#8a7a6b;font-size:0.82rem;">ADMIN${a.slot}_*</td>
      <td>${a.username === user.username
        ? '<span style="color:#8a7a6b;font-size:0.82rem;">(tu cuenta)</span>'
        : `<span style="color:#8a7a6b;font-size:0.82rem;">Para eliminarla, borra las variables ADMIN${a.slot}_* en Render → Environment.</span>`}
      </td>
    </tr>
  `).join('');

  const body = `
    <div class="row" style="justify-content:space-between;margin-bottom:1rem;">
      <h1 style="margin:0;">Cuentas</h1>
      <a class="btn green" href="/admin/accounts/new">+ Nueva cuenta</a>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Cuenta</th><th>Rol</th><th>Variables</th><th>Eliminar</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p style="color:#8a7a6b;font-size:0.85rem;">
      Solo las cuentas con rol <strong>Owner</strong> pueden ver esta página y crear cuentas nuevas.
      Crear o eliminar una cuenta requiere pegar/borrar sus variables en Render, así que el cambio
      no queda activo hasta que lo hagas ahí y el servicio redespliegue.
    </p>
  `;
  return layout('Cuentas', body, { user, csrfToken, active: 'accounts' });
}

function newAccountFormPage({ user, csrfToken, error }) {
  const body = `
    <h1>Nueva cuenta</h1>
    ${error ? `<div class="error">${esc(error)}</div>` : ''}
    <div class="card">
      <form method="POST" action="/admin/accounts/new" id="accountForm" novalidate>
        <input type="hidden" name="_csrf" value="${esc(csrfToken)}">
        <label>Usuario</label>
        <input type="text" name="username" id="f-username" required>
        <span class="field-error" id="e-username">Escribe un usuario.</span>

        <label>Nombre a mostrar</label>
        <input type="text" name="label" id="f-label" required>
        <span class="field-error" id="e-label">Escribe un nombre.</span>

        <label>Rol</label>
        <select name="role">
          <option value="admin">Admin (no puede gestionar cuentas)</option>
          <option value="owner">Owner (puede gestionar cuentas)</option>
        </select>

        <div class="row" style="margin-top:1.2rem;">
          <button class="btn green" type="submit">Generar credenciales</button>
          <a class="btn ghost" href="/admin/accounts">Cancelar</a>
        </div>
      </form>
    </div>
    <script>
    (function(){
      var form = document.getElementById('accountForm');
      var username = document.getElementById('f-username');
      var label = document.getElementById('f-label');
      function showError(input, errId, show){
        document.getElementById(errId).style.display = show ? 'block' : 'none';
        input.classList.toggle('invalid', show);
      }
      function validate(){
        var ok = true;
        if (!username.value.trim()){ showError(username, 'e-username', true); ok = false; } else showError(username, 'e-username', false);
        if (!label.value.trim()){ showError(label, 'e-label', true); ok = false; } else showError(label, 'e-label', false);
        return ok;
      }
      [username, label].forEach(function(i){ i.addEventListener('input', validate); });
      form.addEventListener('submit', function(e){
        if (!validate()){
          e.preventDefault();
          var btn = form.querySelector('button[type="submit"]');
          if (btn){ btn.disabled = false; btn.textContent = btn.dataset.originalText || btn.textContent; }
        }
      });
    })();
    </script>
  `;
  return layout('Nueva cuenta', body, { user, csrfToken, active: 'accounts' });
}

function newAccountResultPage({ user, csrfToken, username, password, qrDataUrl, envBlock }) {
  const body = `
    <h1>Cuenta creada: ${esc(username)}</h1>
    <div class="notice">Guarda estos datos ahora — la contraseña no se vuelve a mostrar.</div>
    <div class="card">
      <label>Contraseña</label>
      <code class="env-block">${esc(password)}</code>

      <label>Código QR para la app autenticadora</label>
      <img src="${qrDataUrl}" alt="QR 2FA" style="display:block;margin:0.5rem auto;">

      <label>Variables para pegar en Render → Environment</label>
      <code class="env-block">${esc(envBlock)}</code>

      <p style="color:#8a7a6b;font-size:0.85rem;">
        Esta cuenta no podrá entrar hasta que pegues estas variables en Render y el servicio redespliegue (1-2 min).
      </p>
      <a class="btn green" href="/admin/accounts">Listo, volver a Cuentas</a>
    </div>
  `;
  return layout('Cuenta creada', body, { user, csrfToken, active: 'accounts' });
}

function historyPage({ user, csrfToken, commits, notice, error }) {
  const rows = commits.map(c => `
    <tr>
      <td>
        ${esc(c.message)}
        <br><span style="color:#8a7a6b;font-size:0.78rem;">${esc(c.author)} · ${esc(c.date)}</span>
      </td>
      <td>
        <form class="inline" method="POST" action="/admin/history/${esc(c.sha)}/restore"
          onsubmit="return confirm('Esto va a descartar TODOS los cambios hechos después de este punto y va a dejar el catálogo tal como estaba en ese momento. ¿Seguro que quieres continuar?');">
          <input type="hidden" name="_csrf" value="${esc(csrfToken)}">
          <button class="btn small red" type="submit">Restaurar a este punto</button>
        </form>
      </td>
    </tr>
  `).join('');

  const body = `
    <h1>Historial de cambios</h1>
    ${notice ? `<div class="notice">${esc(notice)}</div>` : ''}
    ${error ? `<div class="error">${esc(error)}</div>` : ''}
    <div class="card">
      <table>
        <thead><tr><th>Cambio</th><th>Acción</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p style="color:#8a7a6b;font-size:0.85rem;">
      "Restaurar a este punto" deja el catálogo exactamente como estaba en ese momento,
      descartando cualquier cambio hecho después. No borra el historial: queda registrado
      como un cambio nuevo, así que siempre se puede volver atrás.
    </p>
  `;
  return layout('Historial', body, { user, csrfToken, active: 'history' });
}

module.exports = {
  layout, loginPage, dashboardPage, editProductPage, newProductPage,
  accountsPage, newAccountFormPage, newAccountResultPage, historyPage, esc
};
