"""
Take the JhyapOS app-icon PNG and make everything outside its disc transparent.

The source is an opaque square: the disc artwork sits on a black field. Dropped
straight onto the site it would read as a black box. This finds the disc, keeps
its pixels byte-for-byte, and clears the padding around it — no redrawing, no
recolouring, just an alpha channel.
"""

import struct
import sys
import zlib


def read_png(path):
    data = open(path, "rb").read()
    pos, idat, ihdr = 8, b"", None
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        kind = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        if kind == b"IHDR":
            ihdr = struct.unpack(">IIBB", chunk[:10])
        elif kind == b"IDAT":
            idat += chunk
        pos += 12 + length

    width, height, depth, color = ihdr
    assert depth == 8 and color == 6, f"expected 8-bit RGBA, got depth={depth} color={color}"

    raw = zlib.decompress(idat)
    stride = width * 4
    out = bytearray(height * stride)
    prev = bytearray(stride)
    p = 0
    for y in range(height):
        filt = raw[p]
        p += 1
        line = bytearray(raw[p : p + stride])
        p += stride
        for i in range(stride):
            a = line[i - 4] if i >= 4 else 0
            b = prev[i]
            c = prev[i - 4] if i >= 4 else 0
            if filt == 1:
                line[i] = (line[i] + a) & 255
            elif filt == 2:
                line[i] = (line[i] + b) & 255
            elif filt == 3:
                line[i] = (line[i] + (a + b) // 2) & 255
            elif filt == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 255
        out[y * stride : (y + 1) * stride] = line
        prev = line
    return width, height, out


def write_png(path, width, height, px):
    stride = width * 4
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter: none
        raw += px[y * stride : (y + 1) * stride]

    def chunk(kind, payload):
        return (
            struct.pack(">I", len(payload))
            + kind
            + payload
            + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
        )

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    open(path, "wb").write(png)


def main(src, dst):
    w, h, px = read_png(src)

    # Fit the disc from its silhouette. A plain bounding box won't do: the
    # field around the disc carries a faint vignette that a fixed threshold
    # picks up, so instead find the horizontal span of the disc on each row and
    # take the widest one as the diameter.
    def span(y, threshold=25, need=3):
        lo = hi = None
        run = 0
        for x in range(w):
            i = (y * w + x) * 4
            if max(px[i], px[i + 1], px[i + 2]) >= threshold:
                run += 1
                if run >= need and lo is None:
                    lo = x - need + 1
                hi = x
            else:
                run = 0
        return lo, hi

    rows = []
    for y in range(h):
        lo, hi = span(y)
        if lo is not None and hi - lo > 20:
            rows.append((y, lo, hi))

    widest = max(rows, key=lambda r: r[2] - r[1])
    cx = (widest[1] + widest[2]) / 2.0
    cy = (rows[0][0] + rows[-1][0]) / 2.0
    radius = (widest[2] - widest[1]) / 2.0
    print(f"disc center ({cx:.1f}, {cy:.1f})  radius {radius:.1f}")

    # Clear outside the disc, with a 1px feather so the edge stays smooth.
    feather = 1.0
    for y in range(h):
        dy = y - cy
        row = y * w
        for x in range(w):
            dx = x - cx
            dist = (dx * dx + dy * dy) ** 0.5
            if dist <= radius - feather:
                continue
            i = (row + x) * 4 + 3
            if dist >= radius:
                px[i] = 0
            else:
                px[i] = int(px[i] * (radius - dist) / feather)

    # Crop to the disc's bounding square so there's no dead padding.
    pad = 1
    left = max(0, int(cx - radius) - pad)
    top = max(0, int(cy - radius) - pad)
    right = min(w, int(cx + radius) + pad + 1)
    bottom = min(h, int(cy + radius) + pad + 1)
    cw, ch = right - left, bottom - top

    cropped = bytearray(cw * ch * 4)
    for y in range(ch):
        s = ((y + top) * w + left) * 4
        d = y * cw * 4
        cropped[d : d + cw * 4] = px[s : s + cw * 4]

    write_png(dst, cw, ch, cropped)
    print(f"wrote {dst}  {cw}x{ch}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
