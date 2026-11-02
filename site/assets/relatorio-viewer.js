import * as pdfjs from './vendor/pdfjs/pdf.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;
const $ = id => document.getElementById(id);
let documentPdf;
let pageNumber = 1;
let latestRequest = 0;
let renderQueue = Promise.resolve();
let resizeTimer;

function renderPage() {
  if (!documentPdf) return;
  const request = ++latestRequest;
  const target = pageNumber;
  $('pagina').value = target;
  $('anterior').disabled = target <= 1;
  $('proxima').disabled = target >= documentPdf.numPages;
  $('status').textContent = 'Carregando página ' + target + '…';
  renderQueue = renderQueue.catch(() => {}).then(async () => {
    if (request !== latestRequest) return;
    const page = await documentPdf.getPage(target);
    if (request !== latestRequest) return;
    const original = page.getViewport({scale: 1});
    const available = Math.max(200, document.documentElement.clientWidth - (innerWidth <= 600 ? 16 : 32));
    const scale = $('zoom').value === 'fit' ? Math.min(2, available / original.width) : Number($('zoom').value);
    const viewport = page.getViewport({scale});
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    const canvas = $('pdf-canvas');
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';
    canvas.hidden = false;
    $('folha').setAttribute('aria-busy', 'true');
    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
      transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0]
    }).promise;
    if (request !== latestRequest) return;
    $('status').textContent = 'Página ' + target + ' de ' + documentPdf.numPages;
    $('folha').setAttribute('aria-busy', 'false');
    const text = await page.getTextContent();
    if (request === latestRequest) $('texto-pagina').textContent = text.items.map(item => item.str || '').join(' ');
  }).catch(error => {
    if (request !== latestRequest) return;
    $('status').textContent = 'Não foi possível exibir esta página. Use Baixar PDF ou Abrir em nova aba.';
    $('folha').setAttribute('aria-busy', 'false');
    console.error('Falha ao renderizar a página do relatório:', error);
  });
}

function navigate(next) {
  if (!documentPdf) return;
  pageNumber = Math.max(1, Math.min(documentPdf.numPages, next));
  renderPage();
  window.scrollTo({top: 0});
}

$('anterior').addEventListener('click', () => navigate(pageNumber - 1));
$('proxima').addEventListener('click', () => navigate(pageNumber + 1));
$('paginar').addEventListener('submit', event => {
  event.preventDefault();
  const requested = Number($('pagina').value);
  if (Number.isInteger(requested)) navigate(requested);
});
$('zoom').addEventListener('change', renderPage);
document.addEventListener('keydown', event => {
  if (['INPUT', 'SELECT', 'BUTTON'].includes(event.target.tagName)) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(pageNumber - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); navigate(pageNumber + 1); }
});
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if ($('zoom').value === 'fit') renderPage(); }, 150);
});

try {
  documentPdf = await pdfjs.getDocument({
    url: new URL('./documentos/Relatorio_Tecnico_CBERS4A_Gleba_Maici.pdf?v=40246c98854b', import.meta.url).href,
    cMapUrl: new URL('./vendor/pdfjs/cmaps/', import.meta.url).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('./vendor/pdfjs/standard_fonts/', import.meta.url).href,
    wasmUrl: new URL('./vendor/pdfjs/wasm/', import.meta.url).href,
    isEvalSupported: false
  }).promise;
  $('total').textContent = '/ ' + documentPdf.numPages;
  $('pagina').max = documentPdf.numPages;
  $('pagina').disabled = false;
  $('ir').disabled = false;
  $('zoom').disabled = false;
  renderPage();
} catch (error) {
  $('status').textContent = 'Não foi possível carregar o relatório. Use Baixar PDF ou Abrir em nova aba.';
  console.error('Falha ao carregar o relatório:', error);
}
