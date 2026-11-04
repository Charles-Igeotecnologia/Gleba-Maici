// A base externa contextualiza o produto R02; não integra os dados de agosto.
(async () => {
  const mapElement = document.getElementById('localizacao-mapa');
  const fallback = document.getElementById('localizacao-previa');
  const status = document.getElementById('localizacao-status');
  if (!window.L) return;
  try {
    const responses = await Promise.all([
      fetch('assets/localizacao-gleba.geojson'), fetch('assets/localizacao-metadados.json')
    ]);
    if (responses.some(response => !response.ok)) throw new Error('Dados de localização indisponíveis');
    const [geometry, metadata] = await Promise.all(responses.map(response => response.json()));
    mapElement.hidden = false;
    mapElement.parentElement.classList.add('is-mapping');
    const map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: true, maxZoom: 15 });
    const imagery = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Satélite: Esri, Vantor, Earthstar Geographics e comunidade GIS'
    }).addTo(map);
    imagery.on('tileload', () => {
      fallback.hidden = true;
      status.textContent = 'Gleba destacada sobre a imagem de satélite do entorno.';
    });
    imagery.on('tileerror', () => {
      if (!fallback.hidden) status.textContent = 'Base de contexto indisponível. Exibindo a prévia do produto R02.';
    });
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 450;
    map.getPane('labels').style.pointerEvents = 'none';
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      pane: 'labels', maxZoom: 19, attribution: 'Nomes: Esri, HERE, Garmin, © OpenStreetMap e comunidade GIS'
    }).addTo(map);
    const product = L.imageOverlay('assets/previa-r02-webmercator.png', metadata.bounds_latlon, {
      opacity: 0.95, attribution: 'Produto R02: CBERS-4A/WPM · INPE · CC BY 4.0'
    }).addTo(map);
    L.geoJSON(geometry, {
      filter: feature => feature.properties.papel === 'recorte',
      style: { color: '#ffffff', weight: 1, opacity: 0.7, dashArray: '4 5', fill: false }
    }).addTo(map);
    const boundary = L.geoJSON(geometry, {
      filter: feature => feature.properties.papel === 'gleba',
      style: { color: '#ffe278', weight: 2.5, opacity: 1, fillColor: '#ffe278', fillOpacity: 0.04 }
    }).addTo(map);
    boundary.bindTooltip('GLEBA MAICI', { permanent: true, direction: 'center', className: 'gleba-label' });
    const bounds = boundary.getBounds();
    L.control.scale({ imperial: false, maxWidth: 100 }).addTo(map);
    const regionButton = document.getElementById('ver-entorno');
    const glebaButton = document.getElementById('ver-gleba');
    function frame(region) {
      map.fitBounds(region ? bounds.pad(0.65) : bounds.pad(0.1), { padding: [12, 12], animate: false });
      regionButton.setAttribute('aria-pressed', String(region));
      glebaButton.setAttribute('aria-pressed', String(!region));
    }
    regionButton.addEventListener('click', () => frame(true));
    glebaButton.addEventListener('click', () => frame(false));
    document.getElementById('mostrar-produto').addEventListener('change', event => {
      if (event.target.checked) product.addTo(map); else product.remove();
    });
    document.getElementById('localizacao-controles').hidden = false;
    frame(true);
  } catch (error) {
    status.textContent = 'Não foi possível abrir o mapa. A prévia de agosto permanece disponível.';
    console.warn('Mapa de apresentação:', error.message);
  }
})();
