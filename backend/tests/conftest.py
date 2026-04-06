"""
Shared pytest fixtures for backend tests.
"""
import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="module")
def client():
    """Synchronous test client — avoids spinning up real uvicorn."""
    with TestClient(app) as c:
        yield c
