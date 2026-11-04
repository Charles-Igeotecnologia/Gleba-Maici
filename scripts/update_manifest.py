"""Atualiza os hashes dos arquivos efetivamente publicados."""
from pathlib import Path
import hashlib
import json

site = Path(__file__).resolve().parents[1] / "site"
manifest_path = site / "deployment-manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["files"] = {
    path.relative_to(site).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
    for path in sorted(site.rglob("*"))
    if path.is_file() and path != manifest_path and path.name != "desktop.ini"
}
manifest_path.write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
)
print(f"Manifesto atualizado: {len(manifest['files'])} arquivos.")
