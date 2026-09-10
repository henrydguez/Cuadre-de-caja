const denominations = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50];
const container = document.querySelector('#denominations');
const template = document.querySelector('#denomination-template');
const grandTotal = document.querySelector('#grand-total');
const resetButton = document.querySelector('#reset');

const euro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatDenomination(value) {
  return euro.format(value).replace(/\s?$/, '');
}

function getNumber(input) {
  if (input.value.trim() === '') return 0;
  const value = Number.parseInt(input.value, 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function saveState() {
  const values = [...document.querySelectorAll('.card')].map(card => {
    const strongInput = card.querySelector('.strong-input');
    const smallInput = card.querySelector('.small-input');
    return {
      strong: strongInput.value === '' ? '' : getNumber(strongInput),
      small: smallInput.value === '' ? '' : getNumber(smallInput)
    };
  });
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
      const strong = saved[index].strong;
      const small = saved[index].small;
      card.querySelector('.strong-input').value = strong === '' ? '' : Math.max(0, Number(strong) || 0);
      card.querySelector('.small-input').value = small === '' ? '' : Math.max(0, Number(small) || 0);
    });
  } catch {
    localStorage.removeItem('cuadreCaja');
  }
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

container.addEventListener('input', (event) => {
  if (event.target.matches('input')) {
    if (event.target.value !== '' && Number(event.target.value) < 0) event.target.value = 0;
    calculate();
  }
});

resetButton.addEventListener('click', () => {
  document.querySelectorAll('input').forEach(input => input.value = '');
  calculate();
});

loadState();
calculate();
