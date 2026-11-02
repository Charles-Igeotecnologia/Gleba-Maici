"use strict";
(() => {
  const root = 'https://drive.google.com/drive/folders/1izpRkgm5dS0cvKGG8I72rmT8WLUhwvlR';
  const titles = ['Imagens brutas INPE', 'Produto mestre · 4 bandas', 'Cor natural V3', 'Falsa cor 432', 'Qualidade posicional', 'Relatório e anexos'];
  const descriptions = [
    'Cenas originais CBERS-4A/WPM, nível L4. WGS 84 / UTM 20S. Imagens e metadados de origem.',
    'Fusão GSA a 2 m em SIRGAS 2000 / UTM 20S. Quatro bandas B–G–R–NIR, int16 (DN). Base para cálculos.',
    'Produtos de interpretação visual em GeoTIFF RGB e ECW. Pixel de 2 m; não representam reflectância de superfície.',
    'Composição 432 para interpretação de vegetação e água. Produtos GeoTIFF e ECW com pixel de 2 m.',
    'Pontos homólogos digitalizados e resíduos em relação ao GNSS. Baixe todos os componentes do Shapefile juntos.',
    'Relatório técnico em PDF e DOCX; cartas-imagem em PDF e PNG, orientações e arquivo de integridade.'
  ];
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const size = value => { let n = Number(value), i = 0; const u = ['B','KB','MB','GB']; while(n >= 1000 && i < 3) {n /= 1000; i++;} return n.toLocaleString('pt-BR', {maximumFractionDigits:i ? 2 : 0}) + ' ' + u[i]; };
  const format = name => name.split('.').pop().toUpperCase();
  const catalog = window.CATALOGO;
  if (!Array.isArray(catalog) || catalog.length !== 6) {
    $('arquivos').innerHTML = '<div class="error">Não foi possível carregar o catálogo. <a href="'+root+'">Acesse os arquivos no Google Drive.</a></div>';
    return;
  }
  const all = catalog.flatMap((g, category) => g.files.map(f => ({...f, category, extension:format(f.title)})));
  let active = -1;
  let shown = [];
  let toastTimer;
  const notify = message => { $('aviso').textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('aviso').textContent = ''; }, 5000); };
  const url = new URL(location.href);
  const params = url.searchParams;
  if (params.has('grupo') && /^[0-5]$/.test(params.get('grupo'))) active = Number(params.get('grupo'));
  $('busca').value = params.get('q') || '';
  [...new Set(all.map(f => f.extension))].sort().forEach(ext => {const option = document.createElement('option'); option.value=ext; option.textContent=ext; $('formato').append(option);});
  if ([...$('formato').options].some(o => o.value === params.get('formato'))) $('formato').value = params.get('formato');
  if (['nome','maior','menor'].includes(params.get('ordem'))) $('ordem').value = params.get('ordem');
  function syncUrl() {
    if (location.protocol === 'file:') return;
    const next = new URL(location.href);
    for (const key of ['grupo','q','formato','ordem']) next.searchParams.delete(key);
    if (active >= 0) next.searchParams.set('grupo', active);
    if ($('busca').value.trim()) next.searchParams.set('q', $('busca').value.trim());
    if ($('formato').value) next.searchParams.set('formato', $('formato').value);
    if ($('ordem').value !== 'nome') next.searchParams.set('ordem', $('ordem').value);
    history.replaceState(null, '', next);
  }
  function renderCategories() {
    $('categorias').innerHTML = [-1,...catalog.keys()].map(i => '<button type="button" data-grupo="'+i+'" aria-pressed="'+(i===active)+'"><span class="cat-num">'+(i<0?'↳':String(i+1).padStart(2,'0'))+'</span><span class="cat-label">'+(i<0?'Todo o acervo':titles[i])+'</span><span class="cat-count">'+(i<0?all.length:catalog[i].files.length)+'</span></button>').join('');
  }
  function render() {
    const query = normalize($('busca').value.trim());
    shown = all.filter(f => (active < 0 || f.category === active) && (!$('formato').value || f.extension === $('formato').value) && normalize(f.title+' '+titles[f.category]).includes(query));
    shown.sort((a,b) => $('ordem').value === 'maior' ? Number(b.size)-Number(a.size) : $('ordem').value === 'menor' ? Number(a.size)-Number(b.size) : a.title.localeCompare(b.title,'pt-BR'));
    $('grupo-titulo').textContent = active<0?'Todos os arquivos':titles[active];
    $('grupo-descricao').textContent = active<0?'O conjunto completo de imagens, dados e documentos.':descriptions[active];
    $('pasta-grupo').href = active<0?root:'https://drive.google.com/drive/folders/'+catalog[active].id;
    $('resultado').textContent = shown.length+' de '+all.length+' arquivos · '+size(shown.reduce((n,f)=>n+Number(f.size),0));
    $('arquivos').innerHTML = shown.length ? shown.map(f => '<article class="file-row"><span class="file-icon" aria-hidden="true">'+escape(f.extension)+'</span><div><a class="file-title" href="'+escape(f.url)+'" target="_blank" rel="noopener noreferrer">'+escape(f.title)+'</a><div class="file-meta"><span>'+escape(titles[f.category])+'</span><span>·</span><span>'+size(f.size)+'</span></div></div><div class="file-actions"><a href="'+escape(f.url)+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir '+escape(f.title)+' no Drive">Abrir ↗</a><a href="https://drive.google.com/uc?export=download&amp;id='+encodeURIComponent(f.id)+'" target="_blank" rel="noopener noreferrer" aria-label="Baixar '+escape(f.title)+' pelo Google Drive">Baixar ↓</a></div></article>').join('') : '<div class="empty"><h3>Nenhum arquivo encontrado.</h3><p>Experimente outro nome, formato ou grupo do acervo.</p><button class="button" type="button" data-reset>Limpar filtros</button></div>';
    document.querySelectorAll('[data-format]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.format === $('formato').value)));
    syncUrl();
  }
  function reset() {active=-1;$('busca').value='';$('formato').value='';$('ordem').value='nome';renderCategories();render();}
  $('categorias').addEventListener('click', event => {const button = event.target.closest('[data-grupo]'); if(!button) return; active=Number(button.dataset.grupo); renderCategories(); render();});
  $('busca').addEventListener('input', render);
  $('formato').addEventListener('change', render);
  $('ordem').addEventListener('change', render);
  $('limpar').addEventListener('click', reset);
  $('arquivos').addEventListener('click', event => {if(event.target.closest('[data-reset]')) reset();});
  $('exportar').addEventListener('click', () => {
    const cell = v => '"'+String(v).replace(/"/g,'""')+'"';
    const rows = [['grupo','arquivo','formato','tamanho_bytes','url_drive'], ...shown.map(f => [titles[f.category],f.title,f.extension,f.size,f.url])];
    const blob = new Blob(['\ufeff'+rows.map(r=>r.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='Gleba_Maici_Inventario.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);notify('Inventário exportado: '+shown.length+' arquivos da seleção atual.');
  });
  const reportDialog = $('relatorio-modal');
  const reportFrame = $('relatorio-frame');
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || link.hasAttribute('download')) return;
    const isReport = link.hasAttribute('data-relatorio') || (link.getAttribute('href') || '').includes('/d/1z_D33iPd4EmNcsBYyMV0FSP0TOUg-EAS/');
    if (!isReport) return;
    event.preventDefault();
    if (reportDialog.open) return;
    reportDialog.showModal();
    document.body.classList.add('pdf-open');
    reportFrame.src = reportFrame.dataset.src;
  });
  $('fechar-relatorio').addEventListener('click', () => reportDialog.close());
  reportDialog.addEventListener('close', () => {
    document.body.classList.remove('pdf-open');
    reportFrame.removeAttribute('src');
  });
  const modal=$('modal');
  const names={a:'Anexo A — Pontos GNSS',b:'Anexo B — Cena 226/123',c:'Anexo C — Cena 226/124'};
  document.querySelectorAll('[data-anexo]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.anexo;$('modal-titulo').textContent=names[id];$('modal-imagem').src='assets/anexo-'+id+'.webp';$('modal-imagem').alt=names[id];modal.showModal();}));
  $('fechar').addEventListener('click',()=>modal.close());
  modal.addEventListener('click',event=>{if(event.target===modal){const box=modal.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)modal.close();}});
  $('compartilhar').addEventListener('click',async()=>{
    const link = location.protocol==='file:'?'https://charles-igeotecnologia.github.io/Gleba-Maici/':location.href;
    try {await navigator.clipboard.writeText(link);notify('Link do portal copiado.');}
    catch {let input=document.querySelector('.share-fallback');if(!input){input=document.createElement('input');input.className='share-fallback';input.readOnly=true;input.setAttribute('aria-label','Link do portal para copiar');$('compartilhar').parentElement.append(input);}input.value=link;input.focus();input.select();notify('Selecione e copie o link exibido no rodapé.');}
  });
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    active=Number(button.dataset.preset); $('busca').value=''; $('formato').value=''; renderCategories(); render(); $('catalogo').scrollIntoView({behavior:'smooth'});
  }));
  document.querySelectorAll('[data-format]').forEach(button => button.addEventListener('click', () => { $('formato').value=button.dataset.format; render(); }));
  $('search-form').addEventListener('submit', event => {event.preventDefault();render();$('catalogo').scrollIntoView({behavior:'smooth'});});
  renderCategories();render();
})();
