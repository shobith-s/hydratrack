"""
test_verify.py — Tests for the /verify endpoint and CLIP inference logic.
"""
import base64
from io import BytesIO
from unittest.mock import patch

import pytest
from PIL import Image


def _make_dummy_frame(color: tuple = (0, 128, 255)) -> str:
    """Create a tiny solid-colour JPEG as base64 (no data-URI prefix)."""
    img = Image.new("RGB", (64, 64), color=color)
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode()


DUMMY_FRAME = _make_dummy_frame()


class TestVerifyEndpoint:
    def test_returns_422_with_empty_frames(self, client):
        """Empty frames list should be rejected by Pydantic validation."""
        resp = client.post(
            "/verify",
            json={"frames": []},
            headers={"Authorization": "Bearer fake_token"},
        )
        assert resp.status_code == 422

    def test_returns_422_with_too_many_frames(self, client):
        """More than 4 frames should fail validation."""
        resp = client.post(
            "/verify",
            json={"frames": [DUMMY_FRAME] * 5},
            headers={"Authorization": "Bearer fake_token"},
        )
        assert resp.status_code == 422

    def test_returns_401_without_token(self, client):
        resp = client.post("/verify", json={"frames": [DUMMY_FRAME]})
        assert resp.status_code == 403  # HTTPBearer returns 403 when no header

    @patch("main.verify_frames")
    @patch("main.get_current_user_id", return_value="test-user-id")
    def test_confirmed_drink(self, _mock_auth, mock_verify, client):
        """When CLIP returns confirmed=True, endpoint mirrors that."""
        mock_verify.return_value = {
            "confirmed": True,
            "confidence": 0.92,
            "frames_evaluated": 3,
        }
        resp = client.post(
            "/verify",
            json={"frames": [DUMMY_FRAME] * 3},
            headers={"Authorization": "Bearer valid_token"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["confirmed"] is True
        assert data["confidence"] == pytest.approx(0.92)
        assert data["frames_evaluated"] == 3

    @patch("main.verify_frames")
    @patch("main.get_current_user_id", return_value="test-user-id")
    def test_rejected_drink(self, _mock_auth, mock_verify, client):
        """When CLIP returns confirmed=False, endpoint mirrors that."""
        mock_verify.return_value = {
            "confirmed": False,
            "confidence": 0.31,
            "frames_evaluated": 2,
        }
        resp = client.post(
            "/verify",
            json={"frames": [DUMMY_FRAME] * 2},
            headers={"Authorization": "Bearer valid_token"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["confirmed"] is False
        assert data["confidence"] == pytest.approx(0.31)

    def test_malformed_base64_returns_500(self, client):
        """Garbage base64 should surface as a 500 from CLIP decode."""
        with patch("main.get_current_user_id", return_value="test-user-id"):
            resp = client.post(
                "/verify",
                json={"frames": ["not-valid-base64!!!"]},
                headers={"Authorization": "Bearer valid_token"},
            )
        assert resp.status_code == 500
