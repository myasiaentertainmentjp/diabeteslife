#!/usr/bin/env python3
"""Generate all favicon sizes from the D-Life logo."""

from PIL import Image
import os

SOURCE = '/Users/koji/Downloads/dlife logo.png'
OUTPUT_DIR = '/Users/koji/Desktop/Dライフ/public'

# Ensure output dir exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Open source image
img = Image.open(SOURCE).convert('RGBA')
print(f"Source: {img.size[0]}x{img.size[1]}, mode={img.mode}")

# Sizes to generate
sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

for filename, size in sizes.items():
    resized = img.resize((size, size), Image.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, filename)
    resized.save(output_path, 'PNG')
    print(f"  Created: {filename} ({size}x{size})")

# Generate favicon.ico (multi-size: 16, 32, 48)
ico_sizes = [16, 32, 48]
ico_images = [img.resize((s, s), Image.LANCZOS) for s in ico_sizes]
ico_path = os.path.join(OUTPUT_DIR, 'favicon.ico')
ico_images[0].save(ico_path, format='ICO', sizes=[(s, s) for s in ico_sizes], append_images=ico_images[1:])
print(f"  Created: favicon.ico (multi-size: {ico_sizes})")

print("\nDone! All favicons generated.")
