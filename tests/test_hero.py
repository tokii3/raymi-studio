"""The hero element at phone size: a crown on dark hair reads, the same crown on a yellow sign melts away."""
import numpy as np
import pytest

from raymi import hero as H

pytest.importorskip("cv2")


def frame(bg, crown, box=(0.45, 0.30, 0.55, 0.42)):
    img = np.full((1080, 1920, 3), bg, np.uint8)
    x0, y0, x1, y1 = (int(box[0] * 1920), int(box[1] * 1080), int(box[2] * 1920), int(box[3] * 1080))
    img[y0:y1, x0:x1] = crown
    return img, list(box)


def test_gold_crown_on_dark_hair_reads():
    img, box = frame((20, 16, 30), (232, 185, 74))
    r = H.contrast(img, box)
    assert r["readable"] and r["sep"] > 0.4


def test_gold_crown_on_a_yellow_sign_melts():
    img, box = frame((240, 200, 90), (232, 185, 74))
    r = H.contrast(img, box)
    assert not r["readable"] and "contrast" in r["why"]


def test_a_tiny_crown_is_unreadable_whatever_its_contrast():
    img, box = frame((20, 16, 30), (255, 230, 120), box=(0.5, 0.5, 0.51, 0.51))
    r = H.contrast(img, box)
    assert not r["readable"] and "small" in r["why"]


def test_check_reports_every_sampled_frame(tmp_path):
    import cv2
    img, box = frame((20, 16, 30), (232, 185, 74))
    cv2.imwrite(str(tmp_path / "a.jpg"), img[..., ::-1])
    res = H.check({"fps": 30, "boxes": [{"shot": "s1", "frame": 10, "name": "crown", "box": box},
                                        {"shot": "s2", "frame": 40, "name": "crown", "box": None}]},
                  tmp_path, stills={10: tmp_path / "a.jpg"})
    assert res["checked"] == 2 and res["unreadable"] == 1 and res["verdict"].startswith("UNREADABLE")
