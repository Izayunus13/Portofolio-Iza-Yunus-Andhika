# Prologue image assets

Built-in imagegen mode was used for two background-extraction edits and one new beach background. The selected generated files were copied into this project as WebP assets; their original generated PNGs and source photographs were retained.

- `iza-red-cutout.webp`: transparent cutout based on the user-supplied `IMG_3536.JPG.jpeg`. It is rendered as a silhouette and revealed in colour with CSS.
- `iza-almet-cutout.webp`: transparent full-body cutout based on the user-supplied `IMG_2529.JPG`. The cutout is displayed inside a light portrait frame with a solid studio-style backdrop; the previous bottom-opacity fade is no longer used.
- `beach.webp`: original generated beach, retained but no longer used. The active opening now uses procedural lit 3D terrain and volumetric trees in `lib/prologue-terrain.ts`, with a vector fallback in `components/prologue-mountains.tsx`. The eight-second cloud/white transition is styled by `app/voyage-prologue.css`. Birds have independently animated wing planes; cloud banks reuse the portfolio opening's feathered WebP textures; mountains, trunks, branches and foliage are real 3D geometry when WebGL is available. About Me enters over the summit without scrolling the document. The portraits and shared cloud textures are raster assets; the mountain landscape uses code-generated 3D geometry with a vector fallback.
- Font: `../../fonts/ringbearer.ttf`, copied from the user's `RINGM___.TTF`.

## Prompt set

### Red-jacket cutout

Use case: background-extraction. Edit target: the supplied photograph. Extract ONLY the exact young man in the red outdoor jacket as a clean photographic cutout on a truly transparent alpha background. Preserve his exact identity, face, hair, expression, natural skin tone, original red jacket, black trousers, hands, pose, lighting, and all visible clothing details unchanged. Keep only his existing visible body, with the original lower crop: do not invent feet, legs or clothing outside the photo. Remove ALL mountain, sky, plants, landscape and other background. Refine hair edges naturally, no white halo, no shadow baked outside his body. Tightly frame the existing person with a small transparent margin. No restyling, illustration, facial retouching, added objects, text or watermark. This will be the same full-colour person under a CSS silhouette reveal in a personal portfolio website.

### University-blazer cutout

Use case: background-extraction. Edit target: the supplied full-body studio photograph. Remove only the pale studio wall and floor, leaving the exact young man in his teal university blazer, black shirt, black trousers and sneakers on a truly transparent background. Preserve his identity, exact face, hair, expression, pose, hands, body proportions, original clothing, embroidered Diponegoro University crest, buttons, colours, and original photographic lighting unchanged. Keep the full existing visible person including both shoes, tightly framed with a small transparent margin. Natural precise hair and clothing edges, no white fringe and no background/floor/shadow outside the body. Do not fade the person: the bottom opacity gradient will be applied in CSS. No illustration, added objects, facial alteration, new text or watermark.

### Beach background

Use case: photorealistic-natural. Asset type: cinematic full-bleed website opening background, wide landscape 16:9 composition. A serene expansive tropical beach and vast open sea, viewed at human eye level from the sand. A very wide uninterrupted ocean horizon near the upper third, pale turquoise and sea-green water in gentle long waves, fine warm ivory and beige beach sand filling the lower third and curving softly along the shoreline. Soft warm morning sunlight from the left, atmospheric pale blue sky with subtle thin clouds, natural photographic detail, refined calm cinematic mood. Leave the foreground open so a separately supplied portrait can be composited near the centre and text can appear over the open sky and water. Harmonise with a muted seafoam, warm parchment and deep green personal portfolio. Empty landscape only: absolutely no people, silhouettes, buildings, boats, palm trees, props, lettering, typography, logos or watermark. The image must be a believable photograph, not a painted illustration, flat graphic or UI mockup.

Opening first-frame terrain:
- summit-desktop.webp (3000 x 1000) and summit-phone.webp (699 x 500) are captures of the existing procedural summit, with identical cameras, lighting and sky background.
- A small inline WebP in app/prologue-poster.css paints the same mountain even before the external image or JavaScript loads. The high-priority responsive poster provides the full detail while WebGL initializes.
- The poster and inline preview use centered cover sizing; their wide views preserve the terrain camera's vertical field of view on normal desktop and phone screens.
- Regenerate both captures and CSS previews if the summit terrain or camera changes. No silhouette, clouds, birds or text are baked into these assets.
