"""Prepara a ilustração georreferenciada da apresentação; não altera os mestres."""
from pathlib import Path
import hashlib
import json

import geopandas as gpd
import numpy as np
import rasterio
from rasterio.enums import ColorInterp, Resampling
from rasterio.transform import array_bounds
from rasterio.warp import calculate_default_transform, reproject, transform_bounds

source = Path(r'M:\Meu Drive\01 PROJETOS 2026\0022 GLEBA MACI V2\03_IMAGEM_TRABALHO_GLEBA_1KM_ECW')
assets = Path(__file__).resolve().parents[1] / 'site/assets'
vector = source / 'CONTROLE/LIMITE_E_FAIXA_1KM.gpkg'
features = []
for name, role in [('gleba_referencia', 'gleba'), ('gleba_mais_1000m', 'recorte')]:
    layer = gpd.read_file(vector, layer=name)
    assert str(layer.crs) == 'EPSG:31980'
    assert len(layer) == 1 and layer.geometry.is_valid.all() and not layer.geometry.is_empty.any()
    geometry = json.loads(layer.to_crs(4326).to_json())['features'][0]['geometry']
    features.append({'type': 'Feature', 'properties': {'papel': role}, 'geometry': geometry})
(assets / 'localizacao-gleba.geojson').write_text(
    json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':'))+'\n', encoding='utf-8')

with rasterio.open(source / 'GLEBA_MAICI_R02_2M_1KM_COR_NATURAL.tif') as dataset:
    assert dataset.crs.to_epsg() == 31980 and dataset.count == 3
    # A prévia precisa da grade Web Mercator para se sobrepor à base sem deslocamento.
    transform, width, height = calculate_default_transform(
        dataset.crs, 'EPSG:3857', dataset.width, dataset.height, *dataset.bounds,
        dst_width=550, dst_height=1220)
    rgb = np.zeros((3, height, width), dtype='uint8')
    for band in range(3):
        reproject(source=rasterio.band(dataset, band+1), destination=rgb[band],
                  src_transform=dataset.transform, src_crs=dataset.crs,
                  dst_transform=transform, dst_crs='EPSG:3857',
                  src_nodata=0, dst_nodata=0, resampling=Resampling.bilinear,
                  num_threads=2, warp_mem_limit=128, OVERVIEW_LEVEL='AUTO')
    rgba = np.concatenate([rgb, np.where(np.any(rgb != 0, axis=0), 255, 0).astype('uint8')[None]])
    west, south, east, north = transform_bounds('EPSG:3857', 'EPSG:4326', *array_bounds(height, width, transform))
    bounds = [[south, west], [north, east]]
    assert -63 < west < east < -61 and -10 < south < north < -7
    output = assets / 'previa-r02-webmercator.png'
    # O georreferenciamento fica no JSON; evita gerar auxiliares de imagem no site.
    with rasterio.open(output, 'w', driver='PNG', width=width, height=height, count=4, dtype='uint8') as dst:
        dst.write(rgba)
        dst.colorinterp = (ColorInterp.red, ColorInterp.green, ColorInterp.blue, ColorInterp.alpha)
    metadata = {
        'source_file': Path(dataset.name).name, 'source_crs': 'EPSG:31980',
        'preview_crs': 'EPSG:3857', 'source_pixel_m': 2,
        'preview_pixel_m': [transform.a, abs(transform.e)], 'size': [width, height],
        'bounds_latlon': bounds, 'source_imagery': '12 e 17/08/2026',
        'geometric_revision': 'R02', 'purpose': 'apenas apresentação; sem nova avaliação posicional',
        'resampling': 'bilinear', 'transparent_pixels': int(np.sum(rgba[3] == 0)),
        'vector_source': vector.name, 'vector_sha256': hashlib.sha256(vector.read_bytes()).hexdigest(),
        'originals_modified': False,
    }
(assets / 'localizacao-metadados.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'bounds': bounds, 'preview_size': [width, height], 'features': len(features), 'preview_bytes': output.stat().st_size}))
