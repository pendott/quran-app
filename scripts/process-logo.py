#!/usr/bin/env python3
"""Regenerate logo assets from public/logo-source.png (or logo.png)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "logo-source.png"
FALLBACK = PUBLIC / "logo.png"

CREAM = (247, 244, 235, 255)
LANDING_BG = (250, 248, 243, 255)


def is_background(r: int, g: int, b: int, a: int) -> bool:
    if a < 20:
        return True
    if r > 235 and g > 235 and b > 235:
        return True
    return r > 248 and g > 248 and b > 248


def main() -> None:
    src_path = SOURCE if SOURCE.exists() else FALLBACK
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    transparent = img.copy()
    tp = transparent.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = tp[x, y]
            if is_background(r, g, b, a):
                tp[x, y] = (r, g, b, 0)

    transparent.save(PUBLIC / "logo.png", optimize=True)

    cream = Image.new("RGBA", (w, h), CREAM)
    cream.paste(transparent, (0, 0), transparent)
    cream.save(PUBLIC / "logo-cream.png", optimize=True)

    pad = 28
    card = Image.new("RGBA", (w + pad * 2, h + pad * 2), LANDING_BG)
    inner_pad = 20
    inner = Image.new("RGBA", (w + inner_pad, h + inner_pad), (255, 255, 255, 230))
    inner_cream = Image.new("RGBA", (w + inner_pad, h + inner_pad), CREAM)
    inner_cream.paste(transparent, (inner_pad // 2, inner_pad // 2), transparent)
    card.paste(inner_cream, (pad - inner_pad // 2, pad - inner_pad // 2), inner_cream)
    card.save(PUBLIC / "logo-card.png", optimize=True)

    print(f"Wrote logo.png, logo-cream.png, logo-card.png ({w}x{h})")


if __name__ == "__main__":
    main()
