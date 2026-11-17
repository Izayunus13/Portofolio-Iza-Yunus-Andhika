# The Creative Voyage — an isometric 3D portfolio

A pirate-inspired personal portfolio for **Iza Yunus Andhika**, built with React, TypeScript, Three.js, and the Sites Vinext starter.

## Live development

```sh
npm install
npm run dev
```

Open the Local URL printed by the server, normally http://localhost:5173. The page updates as you edit the source.

## The voyage

The dashboard and three creative islands share one real-time 3D ocean. Click the pirate ship, use the next-horizon button, or choose a destination in the harbour controls. The ship follows the same curved path used to place the dotted route. Its heading changes with the curve, and the orthographic camera translates without changing its isometric angle.

After docking, the island opens its own parchment gallery. Each island currently has Portfolio A, B, and C in the top tabs. Select a tab to change portfolios; arrow controls, keyboard arrows, and swipes browse media and descriptions inside the selected portfolio. Media navigation wraps within that portfolio. Switching portfolios resets to its first media page. Alternate media slides reverse the media and description positions. Escape closes the gallery. The next-island button resumes sailing.

The ship, palms, islands, jetty, laptop, lighthouse, easel, palette, and film camera are procedural 3D meshes with lit materials and real shadows. The flag waves, the ship floats, and foam travels with its hull. No external 3D model or texture downloads are required. The fonts are loaded from Google Fonts.

Reduced-motion preferences shorten travel and disable ambient motion. If WebGL cannot initialize, the same destinations and gallery remain accessible through the harbour controls.

## Add your portfolio

Edit **lib/portfolio.ts**. Categories: programming, design, videography. Each category has `projects`, currently three portfolios. Each portfolio has a stable `id`, its tab `name`, and a nonempty `slides` array. Each slide contains:

- `title`, `label`, `description`, `tags`: its story.
- `media`: a public path or image/video URL. Leave `null` for the illustrated concept preview.
- `mediaType`: `video` for video files; otherwise an image is displayed.
- `url`: a complete project URL, or `null` until ready.

Place files inside `public/portfolio/`; for example `public/portfolio/project.jpg` becomes `/portfolio/project.jpg` in the data file. Replace concept text with accurate descriptions. The included entries are placeholders, not claims about completed projects.

The `contact` object in the same file controls email, Instagram, and LinkedIn. Empty fields stay hidden. Social profiles use full HTTPS URLs; email uses a plain address.

## Source map

- `app/page.tsx`: the four chapters, travel controls, about/contact dialogs, portfolio gallery.
- `app/globals.css`: the responsive interface and transition styling.
- `components/voyage-scene.tsx`: lazy loading, React lifecycle, and renderer fallback.
- `lib/voyage-engine.ts`: lighting, shadows, camera, raycasting, animation.
- `lib/voyage-routes.ts`: shared harbour positions, safe sailing curves, shoreline/jetty/title clearance bounds.
- `lib/voyage-motion.ts`: distance-based cruising, smooth acceleration/braking, and frame-rate-independent camera/heading springs.
- `lib/voyage-render.ts`: material batches for stationary model details, preserving the animated flag.
- `lib/voyage-water.ts`: animated ocean surface, bow pressure waves, and a fading world-space foam wake driven by actual ship speed.
- `lib/pirate-ship.ts`: the detailed pirate ship and animated flag.
- `lib/ship-hull.ts`: closed hull/deck and thick sails, flush hull trim, and the coordinated ship palette.
- `lib/ship-animation.ts`: articulated cartoon captain and looping departure wave; damped anchor/chain swing responding to acceleration, turning, and hull motion.
- `lib/voyage-islands.ts`: all three themed islands and their positions.
- `lib/three-kit.ts`: reusable geometry/material helpers.

## Verify

```sh
npx tsc --noEmit
npm run test:e2e
npm run build
```

Browser tests cover actual WebGL rendering, clicking the mesh, continuous travel, arrival, the complete voyage, gallery controls, mobile swipes, contact details, and a missing-WebGL fallback. Windows uses the installed Edge browser; other platforms need a Playwright Chromium browser.

Navigation checks sample every leg against every island, jetty, and water title with a safety radius covering the full ship while turning. The same curves drive the route dots and ship in both directions, including skipped destinations. Water tests check that moving ships emit foam and that the wake dissipates after docking; reduced-motion mode keeps the ocean and wake still.

Movement checks cover constant speed and heading across unequal route legs, smooth departure/arrival acceleration, and spring consistency at 30, 60, and 144 FPS. Ships retain their arrival heading at creative islands. Back at Home waters, the ship turns gently in place to its original welcoming heading; reduced-motion mode applies that heading immediately.

Ship checks verify closed geometry and outward-facing surfaces, preserve animated joints through render batching, and cover anchor settling plus repeated captain waves on island departures. The captain lowers his hand after arrival; reduced-motion mode keeps these animations still.

Sites configuration is in `.openai/hosting.json`. Preserve its existing project ID and audience when publishing updates.

## Island navigation and beach lettering

The navigation uses four individually rendered 3D island views in one shared WebGL canvas. Hover or focus lifts a miniature, and clicking sails to its matching island. The names are shared in `lib/destinations.ts`:

- **Bytehaven**: programming; a home for bytes and ideas.
- **Pigment Atoll**: design; colour and form on a creative atoll.
- **Framewake Bay**: videography; frames that leave a story in their wake.

`lib/water-title.ts` builds the names as extruded TextGeometry with bevels and two lit materials. The larger names follow an elliptical curve around the front beach, with their underside on the sand and real shadows. Each glyph is bent with the same baseline and oriented inward along the coast. `lib/island-shore.ts` supplies the shared sand geometry used to check that the complete lettering stays on land. `components/island-navigation.tsx` and `lib/miniature-harbour.ts` provide the miniature controls and renderer. The island names use the supplied Anthrope font, converted to a bundled typeface JSON with its original font metadata in `lib/fonts/`. It needs no runtime font download. Run `node scripts/prepare-water-title-font.mjs "path/to/Anthrope Personal Use Only.ttf"` to regenerate the title glyphs.

## Loading performance

The intro uses cached, feathered WebP clouds at 640px on phones and 1024px on larger screens. Cloud images share two animated banks; their alpha masks are baked into the files. The three birds use a 32-pose atlas rendered from the existing 3D model, so the loader needs no WebGL context or JavaScript animation loop. CSS transforms animate the flight and wings.

World geometry and shaders prepare in stages, followed by the batched navigation miniatures. The cloud exit waits for both first frames, and the world stays paused until the intro finishes. Reduced-motion and missing-WebGL fallbacks remain available. To regenerate the cloud variants and bird atlas with the local dev server running, run `node scripts/prepare-intro-assets.mjs`.


## Sound

The supplied ocean-and-bird recording streams from public/audio/ocean-birds.mp3 and loops at a background volume. Sound begins after the first interaction, as required by browser playback policies. The borderless speaker icon in the bottom-left corner toggles sound, with matching speaker controls inside dialogs; its preference persists in this browser. Muting stops both the music and effects.

The cloud whoosh, paper rustle, water ambience, and click are synthesized locally by lib/voyage-audio.ts, with no external sound downloads. Paper sounds follow the shared map component and other dialog openings. Water swells play only while sailing, fade out at arrival, and stop while muted or the tab is hidden. Returning to the tab resumes the same music position and the appropriate ambience.


## Priorify AI

Bytehaven Portfolio C contains twelve original Priorify AI screenshots, ordered from the landing page through task input, ranking, available study time, generated sessions, assistant guidance, completion, settings, and mobile use. Images and capture notes are in `public/portfolio/priorify-ai/`. Descriptions reflect the live prototype, including its simulated assistant.


## Légionnaire

Framewake Bay Portfolio B presents Légionnaire (Catatan Akhir Sekolah 75, SMAN 1 MADIUN, 2024): an official-thumbnail introduction, five one-minute film excerpts, and the original production credit at 43:55. The Co-Producer description reflects the owner's direction assistance, equipment, and practical production support. Assets and source time ranges are in `public/portfolio/legionnaire/manifest.json`. Regenerate with `python scripts/prepare-legionnaire-clips.py --source path/to/original.mp4 --ffmpeg path/to/ffmpeg`.


## MADENO Nightride

Framewake Bay Portfolio C presents Nightride with MADENO STUDIOS with the owner as Cameraman. An opening still is followed by four 20-second excerpts covering bike details, rider preparations, night rolling shots, and city lights. The player accepts source dimensions so these wide clips retain their native proportions. Only the Instagram file's baked black padding is removed; video and colour grading remain credited to the studio. Source ranges and encoding details are in `public/portfolio/madeno-nightride/manifest.json`. Regenerate with `python scripts/prepare-nightride-clips.py --source path/to/original.mp4 --ffmpeg path/to/ffmpeg`.


## Flag and beach placement

The Jolly Roger is attached along a fixed hoist on the aft mast. `lib/ship-flag.ts` orients it opposite the ship's actual movement, with smooth direction changes and travelling ripples concentrated at the free edge. At rest, gravity gathers the flag into a closed, hanging shape; accelerating opens it gradually and braking lets it fall again. Flutter stops once the cloth settles. Reduced-motion mode changes the pose without flutter. All three Anthrope island names lie flat on the sand, with real depth and shadows; the routes continue to clear the full ship and shore.


## Shore, welcome, and About Me

The first view is a procedural 3D mountain summit with the owner's red-jacket portrait shown as a silhouette. The same feathered cloud textures as the portfolio opening cover the lower foreground, while five birds loop across the sky with independently flapping wing planes in CSS 3D perspective. Clicking zooms out, restores the portrait's colour and briefly reveals the Ringbearer welcome. About Me then rises over the opening without scrolling the document; cloud banks open sideways and the portrait and copy enter in sequence. Its lit terrain mesh uses eroded slopes, smooth normals, rock colours and atmospheric fog. Trees contain real trunks, branches and shaded foliage volumes with gentle shader wind. A vector fallback remains usable without WebGL. The shared eight-second entrance holds the zoom and welcome, brings both cloud banks together, pauses behind a white fade, then reveals a brighter About Me with a framed university-blazer portrait. Mobile users can scroll within About Me to reach the portfolio button. The university-blazer portrait is displayed in a light bordered frame. The portfolio button hands off to the existing cloud animation and 3D voyage. Reduced-motion and keyboard flows follow the same steps without continuous movement. The island-and-ship engine starts only when entering the portfolio; the prologue terrain renderers are disposed during that handoff.

Assets and image prompts are documented in `public/images/prologue/README.md`. The supplied font is stored at `public/fonts/ringbearer.ttf`.
#   P o r t o f o l i o - I z a - Y u n u s - A n d h i k a  
 