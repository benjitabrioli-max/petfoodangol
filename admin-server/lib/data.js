const { readFile, writeFiles } = require('./github');
const { renderSite } = require('./render');

const PRODUCTS_PATH = 'data/products.json';
const SITE_PATH = 'index.html';

async function loadProducts() {
  const { content } = await readFile(PRODUCTS_PATH);
  return JSON.parse(content);
}

async function saveProducts(data, commitMessage, authorLabel) {
  const productsJson = JSON.stringify(data, null, 2);
  const siteHtml = renderSite(data);
  const message = `${commitMessage} (panel admin${authorLabel ? ', ' + authorLabel : ''})`;
  await writeFiles(
    [
      { path: PRODUCTS_PATH, content: productsJson },
      { path: SITE_PATH, content: siteHtml }
    ],
    message
  );
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function findProduct(data, productId) {
  for (const section of data.sections) {
    for (const sub of section.subsections) {
      const product = sub.products.find(p => p.id === productId);
      if (product) return { section, subsection: sub, product };
    }
  }
  return null;
}

module.exports = { loadProducts, saveProducts, slugify, findProduct };
