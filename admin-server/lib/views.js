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
</style>
</head>
<body>
${opts.user ? `<header>
  <div class="logo">PetFood<span>Angol</span> · Admin</div>
  <div class="user-bar">
    <span>${esc(opts.user.label)}</span>
    <form method="POST" action="/admin/logout" style="margin:0;">
      <input type="hidden" name="_csrf" value="${esc(opts.csrfToken)}">
      <button class="btn small ghost" type="submit">Salir</button>
    </form>
  </div>
</header>` : ''}
<main>
${bodyHtml}
</main>
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
    <div class="card">${rows}</div>
  `;
  return layout('Panel', body, { user, csrfToken });
}

function productForm({ product, sections, data, error, csrfToken, isNew }) {
  const p = product || { name: '', desc: '', extra: '', unit: '', price: '', oldPrice: '', colorClass: '', typeBadges: [], hidden: false };
  const currentSection = product ? sections.currentSectionId : '';
  const currentSubTitle = product ? sections.currentSubTitle : '';

  const body = `
    <h1>${isNew ? 'Agregar producto' : 'Editar producto'}</h1>
    ${error ? `<div class="error">${esc(error)}</div>` : ''}
    <div class="card">
      <form method="POST" action="${isNew ? '/admin/products/new' : `/admin/products/${esc(p.id)}/edit`}">
        <input type="hidden" name="_csrf" value="${esc(csrfToken)}">

        <label>Categoría</label>
        <select name="sectionId" required>${sectionOptions(data, currentSection)}</select>

        <label>Subsección / marca (opcional, ej: "Master Dog 18kg")</label>
        <input type="text" name="subTitle" list="subOptions" value="${esc(currentSubTitle)}">
        ${subsectionDatalist(data)}

        <label>Nombre del producto</label>
        <input type="text" name="name" value="${esc(p.name)}" required>

        <label>Descripción (sabor, edad, tamaño...)</label>
        <input type="text" name="desc" value="${esc(p.desc)}">

        <label>Info extra (ej: "Granel: $2.000 x kilo")</label>
        <input type="text" name="extra" value="${esc(p.extra)}">

        <div class="grid2">
          <div>
            <label>Unidad (ej: "bolsa 18kg", "unidad")</label>
            <input type="text" name="unit" value="${esc(p.unit)}" required>
          </div>
          <div>
            <label>Precio actual (CLP)</label>
            <input type="number" name="price" value="${esc(p.price)}" min="0" step="1" required>
          </div>
        </div>

        <label>Precio anterior (dejar vacío si no está en oferta)</label>
        <input type="number" name="oldPrice" value="${esc(p.oldPrice || '')}" min="0" step="1">

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
  `;
  return body;
}

function editProductPage(opts) {
  return layout('Editar producto', productForm({ ...opts, isNew: false }), { user: opts.user, csrfToken: opts.csrfToken });
}

function newProductPage(opts) {
  return layout('Agregar producto', productForm({ ...opts, isNew: true }), { user: opts.user, csrfToken: opts.csrfToken });
}

module.exports = { layout, loginPage, dashboardPage, editProductPage, newProductPage, esc };
