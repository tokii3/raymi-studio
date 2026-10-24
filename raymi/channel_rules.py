"""Channel rules from real analytics (old engine brain/08 + Kanal-Puls 2026-10-16). Ported 2026-10-17.

Everything here is a 30-day TEST rule set, not eternal truth: re-check after the next analytics export
(planned ~2026-10-14 / end of October) and adjust the constants, not the call sites.
"""
from __future__ import annotations

import datetime as dt
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SERIES_PATH = REPO / "canon" / "series.json"

TITLE_MAX = 60
# Song Shorts: toki 2026-10-08 "ein gutes 15-18 sek short", max 20 s. Lore Shorts (Raymi talking) won at 22-38 s
# (CLAUDE.md of the old engine), so the old global 20 s cap was wrong for them - fixed in the port.
SHORT_LEN_BY_KIND = {"song": (12, 20), "lore": (15, 35)}
SHORT_TARGET_S = (15, 18)
SECOND_HOOK_BY_S = 5.5          # viewers leave from ~4 s on: a new info/twist must start by then
EARLY_WINDOW_S = (4.0, 13.0)    # beats in this window at most ~3.5 s per pose
EARLY_MAX_SEG_S = 3.5
LONGFORM_INTRO_MAX_S = 10.0     # intro <= ~8 s (+ sentence gap slack)
SAME_SERIES_PER_7_DAYS = 2
HASHTAGS_EXACT = 3              # topic, #vtuber, #envtuber - only 3 show above the title
REQUIRED_HASHTAGS = ("#vtuber", "#envtuber")

# tags/hashtags that promise something the channel does not deliver, or borrow big names
TAG_BLOCK = (
    (r"\bai ?vtuber\b|#aivtuber", "'ai vtuber' widerspricht der bewusst vagen Linie der Persona"),
    (r"\breacts?\b|\breaction\b", "Raymi macht keine Reactions (falsches Versprechen, Metadaten-Risiko)"),
    (r"\bvtuber clips\b|\bfunny moments\b", "Suchende erwarten Stream-Ausschnitte bekannter VTuber"),
    (r"\bviral shorts\b|\bgen z humor\b|#?\bfyp\b|#?\bfoodtok\b|#?\bforyou\b", "Sammel-Tag ohne Themenbezug"),
    (r"\bshylily\b|\bbao\b", "sehr grosser fremder Kanal, Video handelt nicht von ihm"),
)
# small, genuinely similar channels may stay while they measurably bring views (analysis part 2)
TAG_ALLOW_NOTE = ("nayami",)

TITLE_MARKERS = ("vtuber", "stingray")   # role in the title: 'Stingray VTuber ...' had the best search CTR (n=1, Sept.)
# toki 2026-10-04: "nobody would write 'stingray vtuber' like that in a title" - the role only as part of a natural
# sentence ('A Stingray Explains ...'), never as a label tacked on ('... | Stingray VTuber'); song videos never need it
ROLE_LABEL = re.compile(r"[|(\[\-–,]\s*(a\s+)?stingray\s*vtuber|stingray\s*vtuber\s*[)\]]?\s*$", re.I)


def load_series() -> dict:
    return json.loads(SERIES_PATH.read_text(encoding="utf-8"))["series"] if SERIES_PATH.is_file() else {}


def _emoji_or_kaomoji_count(title: str) -> int:
    kaomoji = re.findall(r"\([^()]*[^\x00-\x7f][^()]*\)", title)
    rest = re.sub(r"\([^()]*[^\x00-\x7f][^()]*\)", "", title)
    emoji = [c for c in rest if ord(c) > 0x2000 and not c.isalpha()]
    return len(kaomoji) + len(emoji)


def title_issues(titles: list[str], fmt: str) -> list[str]:
    out = []
    for t in titles:
        if len(t) > TITLE_MAX:
            out.append(f"Titel zu lang ({len(t)} > {TITLE_MAX}): {t}")
        if "#" in t:
            out.append(f"Keine Hashtags im Titel (gehoeren in die Beschreibung): {t}")
        if _emoji_or_kaomoji_count(t) > 1:
            out.append(f"Hoechstens ein Kaomoji/Emoji pro Titel: {t}")
    for t in titles:
        if ROLE_LABEL.search(t):
            out.append(f"Rolle als angehaengtes Etikett - so schreibt niemand Titel (canon/12): {t}")
    if fmt not in ("mv", "musikvideo", "song") and titles and             not any(any(m in t.lower() for m in TITLE_MARKERS) for t in titles):
        out.append("Mindestens eine Titel-Option braucht die Rolle im Titel ('VTuber' / 'Stingray ...').")
    return out


def tag_issues(tags: list[str], hashtags: list[str]) -> list[str]:
    out = []
    for item in [*tags, *hashtags]:
        for pattern, why in TAG_BLOCK:
            if re.search(pattern, item.lower()):
                out.append(f"Tag/Hashtag '{item}' raus: {why}.")
                break
    hs = [h.lower() for h in hashtags]
    if len(hs) != HASHTAGS_EXACT:
        out.append(f"Genau {HASHTAGS_EXACT} Hashtags (Thema, #vtuber, #envtuber) - es sind {len(hs)}.")
    for req in REQUIRED_HASHTAGS:
        if req not in hs:
            out.append(f"Hashtag {req} fehlt.")
    return out


def script_issues(script: dict, job_name: str = "") -> list[str]:
    """Rules that only need the script itself (validate_script calls this)."""
    fmt = script.get("format", "shorts")
    out = title_issues(script.get("title_options") or [], fmt)
    out += tag_issues(script.get("tags", []), script.get("hashtags", []))
    desc = str(script.get("description", "")).strip()
    if desc and len(desc.splitlines()[0]) > 100:
        out.append("Beschreibung Zeile 1 max. 100 Zeichen (Hook mit Themenwort).")
    if "?" not in desc:
        out.append("Beschreibung braucht eine Ein-Satz-Frage an die Zuschauer.")
    cta = script.get("cta") or [""]
    if not str(cta[0]).strip().endswith("?"):
        out.append("CTA muss eine Frage sein, die man in einem Satz beantwortet.")
    if fmt == "landscape":
        return out
    series = load_series()
    sid = script.get("series")
    if sid not in series:
        out.append(f"series fehlt/unbekannt - eine von {sorted(series)} (canon/series.json).")
    elif series[sid].get("counter"):
        c = series[sid]["counter"]
        new = script.get("series_counter")
        already_stored = c.get("by_job") == job_name and job_name and new == [c["right"], c["total"]]
        if not already_stored and not (isinstance(new, list) and len(new) == 2 and new[1] == c["total"] + 1
                                       and new[0] in (c["right"], c["right"] + 1)):
            out.append(f"series_counter muss [{c['right']} oder {c['right'] + 1}, {c['total'] + 1}] sein "
                       f"(bisher {c['right']} von {c['total']}).")
    sh = script.get("second_hook")
    if not isinstance(sh, int) or not 2 <= sh <= 4:
        out.append("second_hook fehlt: Nummer des Satzes (2-4) mit neuer Info/Wendung um Sekunde 4.")
    if not str(script.get("claim", "")).strip():
        out.append("claim fehlt: die Behauptung, der man widersprechen kann (in 3 s einer Seite zuzuordnen).")
    return out


def length_range(script: dict) -> tuple[int, int]:
    if script.get("format") == "landscape":
        return 150, 600
    return SHORT_LEN_BY_KIND.get(script.get("kind", "lore"), SHORT_LEN_BY_KIND["lore"])


def repetition_issues(script: dict, mem: dict, job_name: str = "", today: dt.date | None = None) -> list[str]:
    """Same series at most SAME_SERIES_PER_7_DAYS times per 7 days (feed prefers variety)."""
    sid = script.get("series")
    if not sid or script.get("format") == "landscape":
        return []
    today = today or dt.date.today()
    recent = [v for v in mem.get("videos", []) if v.get("series") == sid and v.get("job") != job_name
              and v.get("date") and (today - dt.date.fromisoformat(v["date"])).days < 7]
    if len(recent) >= SAME_SERIES_PER_7_DAYS:
        return [f"Serie '{sid}' lief schon {len(recent)}x in den letzten 7 Tagen - anderes Format waehlen."]
    return []


def timing_issues(script: dict, align: dict) -> list[str]:
    """After alignment: the second hook really starts early enough."""
    if script.get("format") == "landscape":
        return []
    sh = script.get("second_hook")
    sents = align.get("sents", [])
    if not isinstance(sh, int) or sh < 1:
        return []
    # align splits at every . ! ? -> map the script sentence number onto the aligned sentences
    idx = sum(max(1, len(re.findall(r"[.!?]+(?=\s|$)", x))) for x in (script.get("sentences") or [])[:sh - 1])
    if idx < len(sents) and sents[idx]["s"] > SECOND_HOOK_BY_S:
        return [f"Zweiter Hook (Satz {sh}) startet erst bei {sents[idx]['s']:.1f} s - spaetestens "
                f"{SECOND_HOOK_BY_S} s (Zuschauer gehen ab Sekunde 4). Setup kuerzen."]
    return []


def description_block(script: dict) -> str:
    """Series line appended to the description (playlist shelf)."""
    s = load_series().get(script.get("series", ""), {})
    return s.get("line", "")


def store_counter(script: dict, job_name: str) -> None:
    sid, new = script.get("series"), script.get("series_counter")
    data = json.loads(SERIES_PATH.read_text(encoding="utf-8"))
    ser = data["series"].get(sid)
    if not ser or not ser.get("counter") or not new:
        return
    ser["counter"].update(right=int(new[0]), total=int(new[1]), by_job=job_name)
    SERIES_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def delivery_name(job_dir: Path, fmt: str = "short") -> str:
    """The file name toki downloads (toki 2026-10-24: "dateien bitte benennen, nicht immer nur final"):
    <upload day>_Raymi_<recommended title>_<Short|MV>.mp4 from the job's upload.md (else the job date and the script's
    title). Only letters, digits and dashes, so a GitHub release keeps it as it is."""
    job_dir = Path(job_dir)
    up = job_dir / "upload.md"
    text = up.read_text(encoding="utf-8") if up.exists() else ""
    m = re.search(r"Upload slot:\s*\**\s*(?:\w+\s+)?(\d{4}-\d{2}-\d{2})", text)
    day = m.group(1) if m else job_dir.name[:10]
    title = ""
    rec = re.search(r"^Recommended:\s*(\d+)", text, re.M)
    if rec:
        opt = re.search(rf"^{rec.group(1)}\.\s+(.+)$", text, re.M)
        title = opt.group(1) if opt else ""
    if not title:
        for f in ("shots.json", "plan.json"):
            if (job_dir / f).exists():
                title = json.loads((job_dir / f).read_text(encoding="utf-8")).get("title", "")
                break
    words = re.findall(r"[A-Za-z0-9]+", title.replace("'", "")) or [job_dir.name]
    slug = "-".join(w[:1].upper() + w[1:] for w in words)
    return f"{day}_Raymi_{slug}_{'MV' if fmt == 'mv' else 'Short'}.mp4"
