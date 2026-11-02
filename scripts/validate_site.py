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
assert len(catalog) == 6 and len(files) == 56
assert len({file["id"] for file in files}) == 56
assert sum(int(file["size"]) for file in files) == 30130535347
pdf = site / "assets/documentos/Relatorio_Tecnico_CBERS4A_Gleba_Maici.pdf"
assert hashlib.sha256(pdf.read_bytes()).hexdigest() == "40246c98854b61a4a898b3c398950534ce010650baa6202a27e088860b1fe876"
assert not list(site.rglob(".env"))
assert not (site / ".openai").exists()
print(f"Publicação validada: {len(actual)} arquivos e 56 registros no catálogo.")
