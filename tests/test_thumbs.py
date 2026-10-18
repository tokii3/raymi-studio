"""Thumbnails stage: one stills run renders the MV and the Short candidates; the feed sheet shows them at 168 px."""
import numpy as np
import pytest

from raymi import thumbs as T


def test_passes_keep_the_old_single_format_and_add_mv_plus_short():
    assert T.pass_lines({"format": "short", "frames": [3, 9], "names": ["a", "b"]}) == ["short\t3,9\ta,b"]
    spec = {"passes": [{"format": "mv", "frames": [1, 2], "names": ["thumb_mv_M1", "thumb_mv_M2"]},
                       {"format": "short", "frames": [5], "names": ["thumb_short_S1"]}]}
    assert T.pass_lines(spec) == ["mv\t1,2\tthumb_mv_M1,thumb_mv_M2", "short\t5\tthumb_short_S1"]


def test_feed_sheet_shows_every_candidate_at_feed_size_dark_and_light(tmp_path):
    cv2 = pytest.importorskip("cv2")
    for i in range(4):
        cv2.imwrite(str(tmp_path / f"thumb_mv_M{i}.jpg"), np.full((1080, 1920, 3), 40 * i, np.uint8))
        cv2.imwrite(str(tmp_path / f"thumb_short_S{i}.jpg"), np.full((1920, 1080, 3), 50 + 30 * i, np.uint8))
    out = T.feed_sheet(tmp_path)
    img = cv2.imread(str(out))
    assert img.shape[0] == 2 * (299 + 34) and img.shape[1] == 8 * (T.FEED_W + 16)
