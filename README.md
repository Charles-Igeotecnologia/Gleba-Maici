# GLEBA MAICI — Biblioteca de Dados

Biblioteca técnica de dados do pós-processamento das imagens orbitais CBERS-4A/WPM da Gleba Maici. Projeto AMAZON TOPOGRAFIA. Desenvolvimento da biblioteca: Igeotecnologia — Soluções Geoespaciais e Engenharia LTDA.

## Acesso

- Portal: https://charles-igeotecnologia.github.io/Gleba-Maici/
- Dados de origem: https://drive.google.com/drive/folders/1izpRkgm5dS0cvKGG8I72rmT8WLUhwvlR

## Recursos

Busca e filtros para 56 arquivos em seis grupos; ordenação; exportação CSV; links de acesso e download no Google Drive; cartas-imagem sob demanda; relatório técnico com leitor integrado, navegação pelas 23 páginas, zoom e download.

O catálogo foi consultado em 01/11/2026. O relatório técnico, as prévias dos três anexos e os metadados da pasta 06 foram atualizados em 02/11/2026, com conferência do SHA256SUMS de origem. Não há sincronização automática. Os produtos pesados permanecem no Google Drive. A cópia do relatório PDF está incluída no portal e deve ser atualizada explicitamente quando houver nova revisão.

## Publicação e manutenção

O diretório `site/` contém o portal estático. Cada envio à branch `main` executa as verificações de sintaxe e integridade e publica `site/` pelo GitHub Actions no GitHub Pages. A configuração está em `.github/workflows/pages.yml`.

Para visualizar localmente:

```sh
python -m http.server 8000 --directory site
```

Para verificar os arquivos:

```sh
python scripts/validate_site.py
node --check site/portal.js
node --input-type=module --check < site/assets/relatorio-viewer.js
```

Após editar qualquer arquivo de `site/`, atualize o manifesto de integridade antes de enviar:

```sh
python scripts/update_manifest.py
```

Para reverter uma publicação, reverta o commit correspondente em `main`; o workflow publica novamente a versão resultante.

## Referência técnica

Cenas 226/123 e 226/124, adquiridas em 18/10/2026. Produtos em SIRGAS 2000 / UTM 20S (EPSG:31980), pixel de saída de 2 m. Entradas WGS 84 / UTM 20S (EPSG:32720), segundo documentação. Produto mestre com quatro bandas para cálculos; composições RGB destinadas à visualização.

O RMSE de 2,15 m em 12 pontos GNSS e as classes cartográficas são resultados declarados no relatório técnico. O portal não realiza nova validação posicional. O controle concentra-se nos núcleos Sul e Leste; fora desses núcleos, observe a ressalva técnica revisada na seção 8 do relatório.

## Fontes e licenças

Imagens CBERS-4A/WPM: INPE, licença CC BY 4.0 conforme documentação de origem. PDF.js 6.5.438: licença Apache-2.0, incluída em `site/assets/vendor/pdfjs/LICENSE`. Fontes Inter: licenças OFL incluídas em `site/assets/`. Logo Igeotecnologia fornecida pelo responsável pelo projeto.

Os termos dessas fontes não atribuem automaticamente licença aos demais documentos do projeto.
