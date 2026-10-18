"""The asset library: every component carries toki's status, its code exists, its stills exist."""
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
CAT = REPO / "studio" / "catalog"


def test_every_component_has_a_valid_status_real_code_and_real_stills():
    data = json.loads((CAT / "status.json").read_text(encoding="utf-8"))
    ids = set()
    for c in data["components"]:
        assert c["id"] not in ids
        ids.add(c["id"])
        assert c["status"] in data["statuses"], c["id"]
        assert re.match(r"\d{4}-\d{2}-\d{2}$", c["date"]), c["id"]
        if c["status"] in ("toki-liked", "open"):
            assert c["toki"], f"{c['id']}: {c['status']} needs toki's words"
        for path in re.findall(r"studio/src/[\w/]+\.tsx?|raymi/\w+\.py", c["code"]):
            assert (REPO / path).is_file(), f"{c['id']}: {path}"
        for still in c["stills"]:
            assert (CAT / still).is_file(), f"{c['id']}: {still}"
