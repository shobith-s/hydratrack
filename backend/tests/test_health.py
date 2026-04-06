"""
test_health.py — Smoke test: /health must respond 200 with no auth.
"""


def test_health_returns_200(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert data["status"] == "ok"
