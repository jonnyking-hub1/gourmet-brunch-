# EEA logo — version 1

Created with the built-in image generation tool for Emerging Entrepreneurs Accelerator.

## Assets

- [Transparent PNG](../public/images/brand/eea-logo-transparent-v1.png): primary logo on a transparent background; preserve its alpha channel.
- [Cream PNG](../public/images/brand/eea-logo-cream-v1.png): opaque presentation version on warm cream.

Both files are 1536 × 1024 raster PNGs. These are not vector artwork.
The EEA lettering incorporates a rising stroke through the A to suggest progress.
The full name covers the accelerator across business sectors.

Intended palette: deep rust `#923E2B`, warm charcoal `#302B22`, and cream `#FAF7EF`.
Use the transparent logo on a light surface and preserve its aspect ratio.
The generated files are saved as new assets; existing organiser logos are preserved.

## Generation prompt

```text
Use case: logo-brand.
Asset type: primary logo for EEA, the Emerging Entrepreneurs Accelerator, to be used on its website, pitch decks, programme materials and social profiles.
Primary request: Create one original, professionally designed EEA logo. This is a serious but approachable entrepreneurship accelerator helping founders learn, build, pitch, and grow cash-flow businesses across many industries. It should feel confident, enterprising, warm and established.

Design: A distinctive custom typographic monogram reading exactly "EEA", with a strong silhouette, bold sculptural letterforms and restrained sharp slab-serif details. The three letters must remain immediately readable. Integrate a subtle upward/rightward sense of progress into the A's construction or the relationship of the letterforms; make it part of the typography, not a separate clip-art arrow. Excellent optical spacing, carefully balanced counters, clean geometry, enough stroke weight to work at small sizes. Editorial sophistication matching a website with elegant serif headings and a warm palette.

Layout: one centered stacked logo lockup. Large EEA monogram above the full name in smaller, beautifully spaced, highly legible uppercase sans-serif lettering on two centered lines:
"EMERGING ENTREPRENEURS"
"ACCELERATOR"
Keep the full name large enough to read and precisely spelled. The complete logo should occupy approximately 75% of the canvas width with comfortable clear space around all edges.

Palette: solid deep rust #923E2B for the EEA monogram; solid warm charcoal #302B22 for the supporting name. The site uses warm cream #FAF7EF but the delivered logo must have a genuinely transparent background, including transparent counters, so it works on cream or white.
Style: flat, crisp, vector-like brand design, high-resolution raster PNG with alpha transparency. No gradients, textures, shadows, bevels, mockups, presentation board, watermark, registration symbol, extra captions, tagline, food imagery, chefs, utensils, rockets, lightbulbs, coins, stock chart, lion, or copied partner logos. Show one finished logo only.
```

## Cream-background version prompt

Input: the generated transparent EEA logo.

```text
Use case: background-extraction / logo-brand presentation export.
Input image 1 is the finished EEA logo and is the edit target. It is an RGBA PNG with real transparency; some previews incorrectly show the RGB of fully transparent pixels as a dark orange haze.
Make one clean cream-background version of this exact logo. Preserve the exact EEA letterforms, upward/rightward stroke integrated in the A, all letter spacing, the composition, and the two name lines exactly. Text is "EEA", "EMERGING ENTREPRENEURS", "ACCELERATOR". Replace only transparent background areas with a uniform flat warm cream #FAF7EF, including all letter counters and surrounding clear space. Opaque EEA letters should remain solid deep rust #923E2B, and the full-name lettering should remain warm charcoal #302B22. The result must look like crisp flat graphic design on clean cream, without black, orange haze, glow, gradients, shadows, texture, vignette, or 3D effects. Do not change the typography or design. Export as a high-resolution opaque PNG.
```

