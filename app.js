const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10];
const container = document.querySelector('#denominations');
const template = document.querySelector('#denomination-template');
const grandTotal = document.querySelector('#grand-total');
const resetButton = document.querySelector('#reset');
const keypad = document.querySelector('#numeric-keypad');
let activeInput = null;

const euro = new Intl.NumberFormat('es-ES', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2
});

function formatDenomination(value) { return euro.format(value).replace(/\s?$/, ''); }
function getNumber(input) {
  if (input.value.trim() === '') return 0;
  const value = Number.parseInt(input.value, 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}
function saveState() {
  const values = [...document.querySelectorAll('.card')].map(card => ({
    strong: card.querySelector('.strong-input').value === '' ? '' : getNumber(card.querySelector('.strong-input')),
    small: card.querySelector('.small-input').value === '' ? '' : getNumber(card.querySelector('.small-input'))
  }));
  localStorage.setItem('cuadreCaja', JSON.stringify(values));
}
function calculate() {
  let total = 0;
  document.querySelectorAll('.card').forEach((card, index) => {
    const strong = getNumber(card.querySelector('.strong-input'));
    const small = getNumber(card.querySelector('.small-input'));
    const subtotal = (strong + small) * denominations[index];
    card.querySelector('.card-total').textContent = euro.format(subtotal);
    total += subtotal;
  });
  grandTotal.textContent = euro.format(Math.round((total + Number.EPSILON) * 100) / 100);
  saveState();
}
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('cuadreCaja') || '[]');
    document.querySelectorAll('.card').forEach((card, index) => {
      if (!saved[index]) return;
      const { strong, small } = saved[index];
      card.querySelector('.strong-input').value = strong === '' ? '' : Math.max(0, Number(strong) || 0);
      card.querySelector('.small-input').value = small === '' ? '' : Math.max(0, Number(small) || 0);
    });
  } catch { localStorage.removeItem('cuadreCaja'); }
}
function showKeypad(input) { activeInput = input; input.focus({ preventScroll: true }); }
function applyKey(key) {
  if (!activeInput) return;
  if (key === 'clear') activeInput.value = '';
  else if (key === 'backspace') activeInput.value = activeInput.value.slice(0, -1);
  else if (/^\d$/.test(key)) activeInput.value = `${activeInput.value}${key}`.replace(/^0+(?=\d)/, '');
  calculate();
  activeInput.focus({ preventScroll: true });
}

denominations.forEach((value, index) => {
  const card = template.content.cloneNode(true);
  const article = card.querySelector('.card');
  article.dataset.index = index;
  article.querySelector('.denomination').textContent = formatDenomination(value);
  article.querySelector('.strong-input').setAttribute('aria-label', `Cantidad de ${formatDenomination(value)} en caja fuerte`);
  article.querySelector('.small-input').setAttribute('aria-label', `Cantidad de ${formatDenomination(value)} en caja menor`);
  container.appendChild(card);
});

container.addEventListener('focusin', event => {
  if (event.target.matches('input')) showKeypad(event.target);
});
container.addEventListener('click', event => {
  if (event.target.matches('input')) showKeypad(event.target);
});
keypad.addEventListener('pointerdown', event => {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  event.preventDefault();
  applyKey(button.dataset.key);
});
resetButton.addEventListener('click', () => {
  document.querySelectorAll('input').forEach(input => input.value = '');
  activeInput = null;
  calculate();
});

loadState();
calculate();
