// Os links anteriores com filtros continuam abrindo a biblioteca correspondente.
const oldUrl = new URL(location.href);
if (['q', 'grupo', 'formato', 'ordem'].some(key => oldUrl.searchParams.has(key)) ||
    ['#catalogo', '#cartas', '#tecnica', '#busca'].includes(oldUrl.hash)) {
  const library = new URL('biblioteca.html', location.href);
  library.search = oldUrl.search;
  library.hash = oldUrl.hash;
  location.replace(library.href);
}

const choices = document.querySelectorAll('input[name="objetivo"]');
function showRecommendation() {
  const selected = document.querySelector('input[name="objetivo"]:checked');
  document.querySelectorAll('[data-recomendacao]').forEach(panel => {
    panel.hidden = panel.dataset.recomendacao !== selected.value;
  });
}
choices.forEach(choice => choice.addEventListener('change', showRecommendation));
showRecommendation();
