import re

INVALID_TTS_CHARS = {"ᴗ", "ᗜ", "ˆ", "˶", "<", ">", "^", "~", "=", "*", "#", "@", "|", "\\", "{", "}"}
KAOMOJI_PATTERNS = (
    r"(?<!\w)(?:=3=|>_<|>\.<|T_T|xD|xP|owo|uwu|:3|:>|\^-\^|~\.~|lol|lmao|;_;|;\s*_\s*;|:\)|:-\)|:\(|:-\(|;\)|;-)(?!\w)",
    r"(?<!\w)\(｡•ᴗ•｡\)(?!\w)",
    r"(?<!\w)\(\s*˶ˆ\s*ᗜ\s*ˆ˵\s*\)(?!\w)",
    r"(?<!\w)\(\s*ˊᗜˋ\s*\)♡(?!\w)",
    r"(?<!\w)\(\s*⁎˃ᆺ˂\s*\)(?!\w)",
)


def normalize_minimal(text: str) -> str:
    if text is None:
        return ""
    normalized = str(text)
    normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")
    replacements = {
        "\u2018": "'",
        "\u2019": "'",
        "\u201C": '"',
        "\u201D": '"',
        "\u2014": ", ",
        "\u2013": ", ",
        "…": "...",
        "\u00a0": " ",
    }
    for old, new in replacements.items():
        normalized = normalized.replace(old, new)
    normalized = re.sub(r"\n\s*\n+", "\n\n", normalized)
    normalized = re.sub(r"\s+", " ", normalized)
    normalized = normalized.replace("\n", "\n")
    return normalized.strip()


def validate_spoken(text: str) -> list[str]:
    issues: list[str] = []
    if text is None:
        return ["text is empty"]
    cleaned = normalize_minimal(text)
    if not cleaned.strip():
        return ["text is empty"]
    if any(ch in cleaned for ch in INVALID_TTS_CHARS):
        issues.append("kaomoji or unsupported TTS glyphs found")
    if re.search(r"[\U0001F300-\U0001FAFF\u2600-\u27BF\u3000-\u303F\uFF00-\uFFEF]", cleaned, flags=re.UNICODE):
        issues.append("emoji or non-latin symbol glyphs found")
    if re.search(r"\d", cleaned):
        issues.append("digits are not allowed; spell numbers out in spoken text")
    if any(re.search(pattern, cleaned, flags=re.IGNORECASE | re.UNICODE) for pattern in KAOMOJI_PATTERNS):
        issues.append("kaomoji or emoticon token found")
    for sentence in split_sentences(cleaned):
        if not sentence.endswith((".", "!", "?")):
            issues.append("missing sentence-final punctuation")
            break
        bad_words = ["lol", "xd", "owo", "uwu", "xD", "T_T"]
        for bad in bad_words:
            if re.search(rf"\b{re.escape(bad)}\b", sentence, flags=re.IGNORECASE):
                issues.append(f"word '{bad}' should be spoken as 'haha' or another spoken form")
    return sorted(dict.fromkeys(issues))


def split_sentences(text: str) -> list[str]:
    cleaned = normalize_minimal(text)
    if not cleaned:
        return []
    normalized = cleaned.replace("\n", " ")
    parts = re.split(r"(?<=[.!?])\s+", normalized)
    return [part.strip() for part in parts if part.strip()]


# ---------------------------------------------------------------------------
# Deterministic speech cleanup (v13)
# Kaomoji, emoticons, emoji and decorative glyphs are visual chat decoration. They must never
# reach the TTS engine (it reads them aloud or stumbles). This runs BEFORE validate_spoken() and
# the optional LLM repair, so the common case needs no model call and cannot fail.
# Sentence-final punctuation is kept/restored so pacing stays natural (no glued sentences).
# ---------------------------------------------------------------------------
_EMOJI_RE = re.compile(
    "[\U0001F000-\U0001FAFF\u2190-\u21FF\u2300-\u23FF\u2600-\u27BF\u2B00-\u2BFF"
    "\u2E80-\u303F\uFE00-\uFE0F\uFF00-\uFFEF\u200D\u2661\u2665\u2726\u2727\u266A-\u266F]+",
    flags=re.UNICODE,
)
# ( ... ) groups that contain NO real word (no run of 2+ ASCII letters) = face-like kaomoji
_PAREN_FACE_RE = re.compile(r"\(\s*(?![^()]*[A-Za-z]{2})[^()\n]{1,24}\)\s*[\u2661\u2665\u266A-\u266F~!?.]*")
_ASCII_FACE_RE = re.compile(
    r"(?<!\w)(?:=3=|=w=|>_<|>\.<|>//<|T_T|T\.T|;_;|;\s*_\s*;|\^-\^|\^_\^|~\.~|-\.-|:3|:>|:<|:D|:P|:p|:o|:O|:\)|:-\)|:\(|:-\(|;\)|;-\)|xD|xP|XD|owo|uwu|OwO|UwU)(?!\w)"
)
_LAUGH_WORDS_RE = re.compile(r"\b(?:lol|lmao|lmfao|rofl)\b", flags=re.IGNORECASE)


def strip_non_speech(text: str) -> str:
    """Remove kaomoji/emoticons/emoji/decorative glyphs deterministically and repair punctuation.

    Returns text that is safe to hand to TTS (digits are NOT handled here; validate_spoken still
    flags them). Keeps apostrophes, commas and sentence-final punctuation intact.
    """
    if text is None:
        return ""
    out = normalize_minimal(text)
    out = _PAREN_FACE_RE.sub(" ", out)
    out = _ASCII_FACE_RE.sub(" ", out)
    out = _EMOJI_RE.sub(" ", out)
    out = _LAUGH_WORDS_RE.sub("haha", out)
    for ch in INVALID_TTS_CHARS:
        out = out.replace(ch, " ")
    out = out.replace("\u2661", " ")
    out = re.sub(r"\s+([,.!?;:])", r"\1", out)          # no space before punctuation
    out = re.sub(r"([,;:])(?:\s*[,;:])+", r"\1", out)     # collapse ",,"
    out = re.sub(r"([.!?])\s*[,;:]+", r"\1", out)         # ". ," -> "."
    out = re.sub(r"\s+", " ", out).strip()
    # every sentence chunk must end with . ! or ? (kaomoji were often the only "terminator")
    parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", out) if p.strip()]
    fixed = []
    for part in parts:
        if not re.search(r"[A-Za-z]", part):
            continue  # nothing speakable left (was pure decoration)
        if not part.endswith((".", "!", "?")):
            part = part.rstrip(",;:- ") + "."
        fixed.append(part)
    return " ".join(fixed)
