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

After docking, the chapter changes and the portfolio gallery opens. Browse with the arrow controls, keyboard arrows, or touch swipes. Alternate project slides reverse the positions of the media and description. Escape closes the gallery. The next-island button resumes sailing.

The ship, palms, islands, jetty, laptop, lighthouse, easel, palette, and film camera are procedural 3D meshes with lit materials and real shadows. The flag waves, the ship floats, and foam travels with its hull. No external 3D model or texture downloads are required. The fonts are loaded from Google Fonts.

Reduced-motion preferences shorten travel and disable ambient motion. If WebGL cannot initialize, the same destinations and gallery remain accessible through the harbour controls.

## Add your portfolio

Edit **lib/portfolio.ts**. Categories: programming, design, videography. Each project contains:

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
- `lib/voyage-engine.ts`: water, lighting, shadows, route curves, camera, raycasting, animation.
- `lib/pirate-ship.ts`: the detailed pirate ship and animated flag.
- `lib/voyage-islands.ts`: all three themed islands and their positions.
- `lib/three-kit.ts`: reusable geometry/material helpers.

## Verify

```sh
npx tsc --noEmit
npm run test:e2e
npm run build
```

Browser tests cover actual WebGL rendering, clicking the mesh, continuous travel, arrival, the complete voyage, gallery controls, mobile swipes, contact details, and a missing-WebGL fallback. Windows uses the installed Edge browser; other platforms need a Playwright Chromium browser.

Sites configuration is in `.openai/hosting.json`. Preserve its existing project ID and audience when publishing updates.
