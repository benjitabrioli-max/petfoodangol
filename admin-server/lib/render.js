const fs = require('fs');
const path = require('path');

const TEMPLATE_BEFORE = fs.readFileSync(path.join(__dirname, 'template-before.html'), 'utf8');
const TEMPLATE_AFTER = fs.readFileSync(path.join(__dirname, 'template-after.html'), 'utf8');

const NO_RESULTS_MARKUP =
  '  <p class="no-results" id="noResults">No encontramos productos que coincidan con tu búsqueda. ' +
  'Prueba con otra palabra o llama al <a href="tel:90957472">90957472</a>.</p>\n\n';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatCLP(amount) {
  if (amount === null || amount === undefined) return '';
  return '$' + Number(amount).toLocaleString('es-CL');
}

function renderProduct(product) {
  const classes = ['card', product.colorClass].filter(Boolean).join(' ').trim();
  const parts = [
    `    <div class="${escapeHtml(classes)}" data-pid="${escapeHtml(product.id)}" ` +
    `data-pname="${escapeHtml(product.name + (product.desc ? ' - ' + product.desc : ''))}" ` +
    `data-pprice="${Number(product.price) || 0}" data-punit="${escapeHtml(product.unit)}">`
  ];

  if (product.oldPrice) {
    parts.push('      <div class="oferta-badge">OFERTA</div>');
  }

  const badgeSpans = (product.typeBadges || [])
    .map(b => `<span class="type-badge">${escapeHtml(b)}</span>`)
    .join('');
  parts.push(`      <div class="name">${escapeHtml(product.name)}${badgeSpans}</div>`);

  if (product.desc) {
    parts.push(`      <div class="desc">${escapeHtml(product.desc)}</div>`);
  }
  if (product.extra) {
    parts.push(`      <div class="extra">${escapeHtml(product.extra)}</div>`);
  }

  parts.push('      <div class="price-row">');
  parts.push(`        <span class="unit">${escapeHtml(product.unit)}</span>`);
  if (product.oldPrice) {
    parts.push(
      `        <span><span class="old-price">${formatCLP(product.oldPrice)}</span>` +
      `<span class="price">${formatCLP(product.price)}</span></span>`
    );
  } else {
    parts.push(`        <span class="price">${formatCLP(product.price)}</span>`);
  }
  parts.push('      </div>');
  parts.push('      <button type="button" class="add-cart-btn" aria-label="Agregar al pedido">+ Agregar</button>');
  parts.push('    </div>');
  return parts.join('\n');
}

function renderSubsectionBlock(sub) {
  const visibleProducts = sub.products.filter(p => !p.hidden);
  if (visibleProducts.length === 0) return '';

  const out = [];
  if (sub.title) {
    const badge = sub.badge ? ` <span class="type-badge">${escapeHtml(sub.badge)}</span>` : '';
    out.push(`  <h3 class="sub-title">${escapeHtml(sub.title)}${badge}</h3>`);
  }
  out.push('  <div class="products">');
  out.push(visibleProducts.map(renderProduct).join('\n'));
  out.push('  </div>');
  return out.join('\n');
}

function sectionHasVisibleProducts(section) {
  return section.subsections.some(sub => sub.products.some(p => !p.hidden));
}

function renderMain(data) {
  const blocks = [NO_RESULTS_MARKUP.trimEnd()];
  let firstAssigned = false;

  data.sections.forEach(section => {
    if (!sectionHasVisibleProducts(section)) return;
    const titleClass = firstAssigned ? 'section-title' : 'section-title first';
    firstAssigned = true;
    const h2Line = `  <h2 class="${titleClass}" id="${escapeHtml(section.id)}"><span class="emoji">${section.emoji}</span> ${escapeHtml(section.title)}</h2>`;

    const subBlocks = section.subsections
      .map(renderSubsectionBlock)
      .filter(Boolean);

    // When the section's first visible subsection has no h3 (e.g. Accesorios),
    // the h2 and its .products div sit on consecutive lines with no blank line between.
    const firstSub = section.subsections.find(sub => sub.products.some(p => !p.hidden));
    if (firstSub && !firstSub.title) {
      blocks.push(h2Line + '\n' + subBlocks.shift());
    } else {
      blocks.push(h2Line);
    }
    blocks.push(...subBlocks);
  });

  return '<main>\n' + blocks.join('\n\n') + '\n\n</main>';
}

function renderSite(data) {
  return TEMPLATE_BEFORE + renderMain(data) + TEMPLATE_AFTER;
}

module.exports = { renderSite, formatCLP };
