# The Creative Voyage

A pirate-inspired personal portfolio for **Iza Yunus Andhika**, built with React, TypeScript, and the Sites Vinext starter.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by the development server.

## Add your work

Edit **lib/portfolio.ts**. Categories: programming, design, videography. Each project contains:

- `title`, `label`, `description`, `tags`: text for its story slide.
- `media`: a public path or image/video URL. Leave `null` to show the concept preview.
- `mediaType`: use `video` for video files; otherwise images are displayed.
- `url`: a full project URL. Leave `null` until ready.

Place media inside `public/portfolio/`. A file at `public/portfolio/my-website.jpg` uses `media: '/portfolio/my-website.jpg'`.

Replace illustrative text with accurate descriptions. Included entries are project concepts, not completed projects.

The `contact` object in the same file controls email, Instagram, and LinkedIn. Empty fields stay hidden. Social profiles use full HTTPS URLs; email uses a plain address.

## Experience

- Animated pirate greeting once per browser session, with a skip button.
- Ship navigation through Code Cove, Design Island, and Motion Bay.
- Accessible native dialogs with keyboard arrows, previous/next buttons, and touch swipes.
- Alternating media and text positions across slides.
- Responsive ocean illustrations, fish, compass, seaweed, waving captain.
- Reduced motion support, keyboard focus indicators, and English copy.

## Verify

```sh
npx tsc --noEmit
npm run build
```

Sites configuration: `.openai/hosting.json`. Publishing preserves its existing project ID.
