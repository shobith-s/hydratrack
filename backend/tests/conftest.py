"""
Shared pytest fixtures for backend tests.
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="session")
def client():
    """
    Single TestClient for the entire test session.

    Patches load_model and start_scheduler so CI never tries to download
    CLIP weights or spin up the APScheduler event loop — both of which
    cause 'Event loop is closed' errors across test modules.
    """
    with (
        patch("main.load_model"),
        patch("main.start_scheduler"),
        patch("main.stop_scheduler"),
        patch("main.ping_db"),
        TestClient(app) as c,
    ):
        yield c
