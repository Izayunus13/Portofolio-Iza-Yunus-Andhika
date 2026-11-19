Add portfolio images and videos here, then edit lib/portfolio.ts.

Structure: category (island) -> projects (Portfolio A, B, C) -> slides.
Each portfolio has its own media/description slides. Tabs select portfolios;
left/right arrows, keyboard arrows, and swipes browse slides in that portfolio.
Switching portfolios starts at its first slide; media navigation wraps inside it.

Set each slide's media to a public path, e.g. /portfolio/portfolio-a-overview.jpg.
Use mediaType: 'video' for video files, or 'image' for images.
Each slide has its own title, label, description, tags, and optional project URL.
Leave media and url as null until the real files and project links are ready.
Rename a portfolio's name to replace its temporary Portfolio A/B/C tab label.
