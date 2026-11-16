(() => {
  'use strict';
  const controls = document.querySelector('[data-catalog-filters]');
  const grid = document.querySelector('[data-catalog-grid]');
  if (!controls || !grid) return;

  const buttons = [...controls.querySelectorAll('[data-category-filter]')];
  const cards = [...grid.querySelectorAll('[data-product-category]')];
  const status = document.querySelector('[data-catalog-status]');
  const empty = document.querySelector('[data-catalog-empty]');
  const sizeSelect = document.querySelector('[data-filter-size]');
  const colorSelect = document.querySelector('[data-filter-color]');
  const sortSelect = document.querySelector('[data-sort]');
  const validCategories = new Set(buttons.map(b => b.dataset.categoryFilter));
  cards.forEach((card, i) => { card.dataset.order = String(i); });

  const list = value => (value || '').split('|').map(s => s.trim()).filter(Boolean);
  const optionValues = select => select ? new Set([...select.options].map(o => o.value)) : new Set();
  const validSizes = optionValues(sizeSelect);
  const validColors = optionValues(colorSelect);
  const validSorts = optionValues(sortSelect);

  function readState() {
    const p = new URL(location.href).searchParams;
    const pick = (key, valid, fallback) => {
      const v = p.get(key);
      return v && valid.has(v) ? v : fallback;
    };
    return {
      category: pick('category', validCategories, 'all'),
      size: pick('size', validSizes, ''),
      color: pick('color', validColors, ''),
      sort: pick('sort', validSorts, 'default')
    };
  }

  let state = readState();

  function writeUrl() {
    const url = new URL(location.href);
    const set = (key, value, empty) => {
      if (!value || value === empty) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    };
    set('category', state.category, 'all');
    set('size', state.size, '');
    set('color', state.color, '');
    set('sort', state.sort, 'default');
    if (url.href !== location.href) {
      try { history.pushState(null, '', url); } catch (e) {}
    }
  }

  function apply() {
    let count = 0;
    cards.forEach(card => {
      const visible =
        (state.category === 'all' || card.dataset.productCategory === state.category) &&
        (!state.size || list(card.dataset.sizes).includes(state.size)) &&
        (!state.color || list(card.dataset.colors).includes(state.color));
      card.hidden = !visible;
      if (visible) count++;
    });

    const price = c => Number(c.dataset.price) || 0;
    const name = c => (c.querySelector('.gv-name') || c).textContent.trim();
    const sorted = [...cards].sort((a, b) => {
      if (state.sort === 'price-asc') return price(a) - price(b);
      if (state.sort === 'price-desc') return price(b) - price(a);
      if (state.sort === 'name') return name(a).localeCompare(name(b), 'ru');
      return Number(a.dataset.order) - Number(b.dataset.order);
    });
    sorted.forEach(card => grid.appendChild(card));

    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.categoryFilter === state.category)));
    if (sizeSelect) sizeSelect.value = state.size;
    if (colorSelect) colorSelect.value = state.color;
    if (sortSelect) sortSelect.value = state.sort;
    [sizeSelect, colorSelect].forEach(s => s && s.classList.toggle('is-active', !!s.value));
    if (sortSelect) sortSelect.classList.toggle('is-active', state.sort !== 'default');

    if (empty) empty.hidden = count !== 0;
    if (status) status.textContent = 'Найдено товаров: ' + count;
    grid.dataset.activeCategory = state.category;
  }

  function update(patch) {
    state = Object.assign({}, state, patch);
    writeUrl();
    apply();
  }

  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-category-filter]');
    if (button && controls.contains(button) && validCategories.has(button.dataset.categoryFilter)) {
      update({ category: button.dataset.categoryFilter });
    }
  });
  if (sizeSelect) sizeSelect.addEventListener('change', () => update({ size: sizeSelect.value }));
  if (colorSelect) colorSelect.addEventListener('change', () => update({ color: colorSelect.value }));
  if (sortSelect) sortSelect.addEventListener('change', () => update({ sort: sortSelect.value }));

  const reset = document.querySelector('[data-category-reset]');
  if (reset) reset.addEventListener('click', () => update({ category: 'all', size: '', color: '', sort: state.sort }));

  addEventListener('popstate', () => { state = readState(); apply(); });
  apply();
})();
