# GLEBA MAICI — Biblioteca de Dados

Biblioteca técnica de dados do pós-processamento das imagens orbitais CBERS-4A/WPM da Gleba Maici. Projeto AMAZON TOPOGRAFIA. Desenvolvimento da biblioteca: Igeotecnologia — Soluções Geoespaciais e Engenharia LTDA.

## Acesso

- Portal: https://charles-igeotecnologia.github.io/Gleba-Maici/
- Dados de origem: https://drive.google.com/drive/folders/1XAG91VTpnTGsMcuvn-Jdmmr6xz7lCd4E

## Recursos

Busca e filtros para 464 arquivos em cinco grupos; ordenação; exportação CSV; links de acesso e download no Google Drive; quatro cartas-imagem sob demanda; relatório técnico com leitor integrado, navegação pelas 23 páginas, zoom e download.

O catálogo foi reconstruído recursivamente em 03/11/2026 a partir da pasta V2: https://drive.google.com/drive/folders/1XAG91VTpnTGsMcuvn-Jdmmr6xz7lCd4E. São 464 arquivos (66.578.833.231 bytes), com caminhos relativos para distinguir históricos, referências e produtos finais. O relatório R03 e as quatro prévias de seus anexos estão incluídos no portal. Os arquivos pesados permanecem no Drive; não há sincronização automática.

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

Cinco cenas CBERS-4A/WPM L4 de 12 e 17/08/2026: 227/122, 227/123, 226/122, 226/123 e 226/124. Produtos R02 em SIRGAS 2000 / UTM 20S (EPSG:31980), pixel de 2 m, mestres UInt16 de quatro bandas. VRTs dependem da estrutura de GeoTIFFs. A imagem de trabalho cobre a gleba com margem de 1 km; prefira o pacote ZIP com ECW e auxiliares.

O RMSE de 1,95 m em sete checagens, máximo de 2,87 m e as classes cartográficas são resultados declarados no R03, não recalculados pelo portal. A leitura de referência tem conhecimento prévio dos alvos e não equivale a sete novas leituras cegas. Os pontos concentram-se nos núcleos Sul, Leste e Noroeste, com apenas um CHK no interior. A exatidão absoluta uniforme de toda a gleba não foi demonstrada. Consulte as seções 6.4, 6.8 e 8 do R03.

A atualização substitui os links, o relatório e os indicadores da entrega de outubro pela entrega V2 de agosto. O histórico anterior permanece no Git, sem misturar seus arquivos ao catálogo atual.

## Fontes e licenças

Imagens CBERS-4A/WPM: INPE, licença CC BY 4.0 conforme documentação de origem. PDF.js 6.5.438: licença Apache-2.0, incluída em `site/assets/vendor/pdfjs/LICENSE`. Fontes Inter: licenças OFL incluídas em `site/assets/`. Logo Igeotecnologia fornecida pelo responsável pelo projeto.

Os termos dessas fontes não atribuem automaticamente licença aos demais documentos do projeto.

## Referência vigente e conferência de 04/11/2026

A versão de outubro foi retirada do projeto ativo por determinação do responsável. A referência vigente é o acervo V2 de agosto, com rasters R02 e relatório R03. Os 464 registros do catálogo foram comparados aos caminhos e tamanhos locais da pasta V2, sem ausências, divergências ou arquivos adicionais nos cinco grupos. O SHA-256 do PDF R03 também foi conferido. Essa verificação local não representa um novo ensaio de precisão nem nova leitura integral dos rasters.

## Auditoria integral de links em 04/11/2026

A enumeração remota recursiva detectou estudos preparatórios que ainda continham texto e páginas do relatório de outubro. A pasta ANALISE_EXATIDAO_CARTOGRAFICA (89 arquivos, 32.906.131 bytes) foi movida para o arquivo histórico externo à V2 e retirada do catálogo. O acervo ativo contém 464 arquivos. A retirada inclui o conjunto comparativo completo para preservar sua coerência fora da entrega vigente.
