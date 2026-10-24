"""The file toki downloads is named after its upload day and title (toki 2026-10-24: 'nicht immer nur final')."""
from raymi.channel_rules import delivery_name


def test_name_from_upload_slot_and_recommended_title(tmp_path):
    (tmp_path / "upload.md").write_text("Upload slot: **Mon 2026-10-26** (x)\n\n## Title options\n1. POV: You Sat In A Stingray's Seat\n"
                                        "2. Other\nRecommended: 1 - because\n", encoding="utf-8")
    assert delivery_name(tmp_path) == "2026-10-26_Raymi_POV-You-Sat-In-A-Stingrays-Seat_Short.mp4"
    assert delivery_name(tmp_path, "mv").endswith("_MV.mp4")


def test_name_falls_back_to_job_date_and_script_title(tmp_path):
    d = tmp_path / "2026-10-24_pov-x"
    d.mkdir()
    (d / "shots.json").write_text('{"title": "Name A Better Color. You Can\'t."}', encoding="utf-8")
    assert delivery_name(d) == "2026-10-24_Raymi_Name-A-Better-Color-You-Cant_Short.mp4"
