"""Confere o inventário, os assets e a integridade da publicação."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import hashlib
import json

root = Path(__file__).resolve().parents[1]
site = root / "site"
manifest = json.loads((site / "deployment-manifest.json").read_text(encoding="utf-8"))
for relative, expected in manifest["files"].items():
    path = (site / relative).resolve()
    assert path.is_relative_to(site.resolve()), relative
    assert path.is_file(), f"Arquivo ausente: {relative}"
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, relative
actual = {
    path.relative_to(site).as_posix()
    for path in site.rglob("*")
    if path.is_file() and path.name not in {"deployment-manifest.json", "desktop.ini"}
}
assert actual == set(manifest["files"]), "Atualize deployment-manifest.json."

class AssetReferences(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source = source

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag not in {"script", "link", "img", "iframe", "a"}:
            return
        reference = attrs.get("src") or attrs.get("href") or attrs.get("data-src")
        if not reference:
            return
        parsed = urlsplit(reference)
        if parsed.scheme or parsed.netloc or not parsed.path:
            return
        assert not parsed.path.startswith("/"), f"Caminho absoluto incompatível: {reference}"
        path = (self.source.parent / unquote(parsed.path)).resolve()
        assert path.is_relative_to(site.resolve()), reference
        assert path.exists(), f"Referência ausente em {self.source.name}: {reference}"

for html in site.rglob("*.html"):
    AssetReferences(html).feed(html.read_text(encoding="utf-8"))
catalog = json.loads((site / "catalogo.json").read_text(encoding="utf-8"))
files = [file for group in catalog for file in group["files"]]
assert len(catalog) == 5 and len(files) == 553
assert len({file["id"] for file in files}) == 553
assert sum(int(file["size"]) for file in files) == 66611739362
pdf = site / "assets/documentos/Relatorio_Tecnico_CBERS4A_Gleba_Maici_R03_Agosto2026.pdf"
assert hashlib.sha256(pdf.read_bytes()).hexdigest() == "5d23c48dd05a71a2cef641350a51762a7c5b84b954bb9db470b03fc4a961217f"
assert len({(g["id"], f["path"]) for g in catalog for f in g["files"]}) == len(files)
# O acervo ativo contém somente cenas de agosto. A documentação do
# processamento pode mencionar referências auxiliares históricas.
import re
for group in catalog:
    for file in group["files"]:
        dates = re.findall(r"CBERS(?:_4A|4A)[^/]*?_(2026\d{4})", file["title"], re.I)
        assert all(date in {"20260812", "20260817"} for date in dates), (
            f"Cena fora do acervo vigente de agosto: {file['path']}"
        )
assert not list((site / "assets/documentos").glob("*202610*"))
assert not (site / "assets/documentos/Relatorio_Tecnico_CBERS4A_Gleba_Maici.pdf").exists()
embedded = (site / "dados.js").read_text(encoding="utf-8").split("=", 1)[1].strip().removesuffix(";")
assert json.loads(embedded) == catalog, "Catálogo JSON e dados.js divergentes."
assert not list(site.rglob(".env"))
assert not (site / ".openai").exists()
print(f"Publicação validada: {len(actual)} arquivos e {len(files)} registros no catálogo.")
