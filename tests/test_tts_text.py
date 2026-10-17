import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from raymi.tts_text import normalize_minimal, split_sentences, validate_spoken


def test_normalize_minimal_preserves_apostrophes_inside_words():
    text = "it’s don’t i’m"
    assert normalize_minimal(text) == "it's don't i'm"


def test_validate_spoken_reports_unsupported_glyphs_and_bad_words():
    text = "it's a vibe ᴗ ᗜ ˆ lol"
    issues = validate_spoken(text)
    assert issues
    assert any("kaomoji" in issue.lower() or "lol" in issue.lower() or "ᴗ" in issue for issue in issues)


def test_split_sentences_keeps_contractions_and_real_sentence_boundaries():
    text = "it's a vibe. don't panic. i'm good."
    assert split_sentences(text) == ["it's a vibe.", "don't panic.", "i'm good."]
