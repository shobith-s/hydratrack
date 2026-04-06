#!/usr/bin/env python3
"""
generate-vapid.py — One-time VAPID key pair generator for HydroTrack.

Run once before deploying:
    python scripts/generate-vapid.py

Then set the printed values in:
  • frontend/.env.local         → VITE_VAPID_PUBLIC_KEY
  • HuggingFace Space secrets  → VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

Requirements:
    pip install pywebpush py-vapid
"""
from py_vapid import Vapid


def main() -> None:
    vapid = Vapid()
    vapid.generate_keys()

    public_key = vapid.public_key.decode()
    private_key = vapid.private_key.decode()

    print("\n✅  VAPID Keys Generated\n" + "─" * 50)
    print(f"VAPID_PUBLIC_KEY={public_key}")
    print(f"VAPID_PRIVATE_KEY={private_key}")
    print("─" * 50)
    print("⚠️   Never commit VAPID_PRIVATE_KEY. Store it in HF Space secrets.")
    print("📋  VAPID_PUBLIC_KEY goes in frontend/.env.local AND HF Space secrets.\n")


if __name__ == "__main__":
    main()
