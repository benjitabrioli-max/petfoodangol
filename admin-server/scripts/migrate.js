// One-off migration: parses the current hand-written index.html into data/products.json.
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SITE_ROOT = path.join(__dirname, '..', '..');
const html = fs.readFileSync(path.join(SITE_ROOT, 'index.html'), 'utf8');
const $ = cheerio.load(html);

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parsePrice(text) {
  if (!text) return null;
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : null;
}

function textWithoutBadge($el) {
  const clone = $el.clone();
  clone.find('.type-badge, .emoji').remove();
  return clone.text().trim();
}

const sections = [];
const usedIds = new Set();

$('main > .section-title').each((_, h2El) => {
  const $h2 = $(h2El);
  const section = {
    id: $h2.attr('id'),
    emoji: $h2.find('.emoji').text().trim(),
    title: textWithoutBadge($h2),
    subsections: []
  };

  // Collect siblings until the next section-title, grouping optional sub-title + products.
  let $node = $h2.next();
  let currentSub = null;
  while ($node.length && !$node.hasClass('section-title')) {
    if ($node.hasClass('sub-title')) {
      const badgeText = $node.find('.type-badge').text().trim();
      currentSub = {
        title: textWithoutBadge($node),
        badge: badgeText || null,
        products: []
      };
      section.subsections.push(currentSub);
    } else if ($node.hasClass('products')) {
      if (!currentSub) {
        currentSub = { title: null, badge: null, products: [] };
        section.subsections.push(currentSub);
      }
      $node.children('.card').each((__, cardEl) => {
        const $card = $(cardEl);
        const classes = ($card.attr('class') || '').split(/\s+/).filter(c => c && c !== 'card');
        const $name = $card.children('.name');
        const typeBadges = [];
        $name.find('.type-badge').each((___, b) => typeBadges.push($(b).text().trim()));
        const name = textWithoutBadge($name);
        const desc = $card.children('.desc').length ? $card.children('.desc').text().trim() : '';
        const extra = $card.children('.extra').length ? $card.children('.extra').text().trim() : '';
        const unit = $card.find('.price-row .unit').text().trim();
        const priceText = $card.find('.price-row .price').first().text().trim();
        const oldPriceText = $card.find('.price-row .old-price').first().text().trim();

        let id = slugify(`${section.id}-${currentSub.title || ''}-${name}-${desc}`) || slugify(name);
        let uniqueId = id;
        let n = 2;
        while (usedIds.has(uniqueId)) {
          uniqueId = `${id}-${n}`;
          n++;
        }
        usedIds.add(uniqueId);

        currentSub.products.push({
          id: uniqueId,
          name,
          desc,
          extra,
          unit,
          price: parsePrice(priceText),
          oldPrice: oldPriceText ? parsePrice(oldPriceText) : null,
          colorClass: classes.join(' '),
          typeBadges,
          hidden: false
        });
      });
      currentSub = null;
    }
    $node = $node.next();
  }

  sections.push(section);
});

const data = { sections };
fs.writeFileSync(
  path.join(SITE_ROOT, 'data', 'products.json'),
  JSON.stringify(data, null, 2),
  'utf8'
);

// Report counts for verification against the source HTML.
const originalCardCount = $('.card').length;
const originalH2Count = $('main > .section-title').length;
const originalH3Count = $('main > .sub-title').length;
let migratedCardCount = 0;
let migratedH3Count = 0;
sections.forEach(s => s.subsections.forEach(sub => {
  if (sub.title) migratedH3Count++;
  migratedCardCount += sub.products.length;
}));

console.log('Secciones (h2):', originalH2Count, '->', sections.length);
console.log('Subsecciones (h3):', originalH3Count, '->', migratedH3Count);
console.log('Tarjetas (.card):', originalCardCount, '->', migratedCardCount);
console.log('Escrito data/products.json');
