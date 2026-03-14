# Space Racer (מירוץ הכוכבים)

Hebrew RTL children's math game. Deployed on GitHub Pages via GitHub Actions.

## Tech Stack
- Vanilla JS (ES modules), HTML5 Canvas + DOM UI
- CSS: `style.css` (base) → `animations.css` → `game.css` (components) → `responsive.css` (media queries)
- No build step — served as static files
- Service worker (`star-race-v3`) caches aggressively — **always clear SW cache when testing locally**

## Local Development
```bash
npx http-server -p 3000 -c-1
```
**Important:** The service worker will cache old CSS/JS even with `-c-1`. To test changes:
1. Unregister SW in DevTools → Application → Service Workers
2. Or run in Playwright: `navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))` + `caches.keys().then(names => names.forEach(n => caches.delete(n)))`

## CSS Architecture
- `responsive.css` loads last and overrides `game.css` via source order (same specificity wins)
- Desktop: `@media (min-width: 1025px)` — targets 1600x900 resolution
- `game.css` uses `clamp()` for fluid sizing; `responsive.css` overrides with explicit values per breakpoint
- Safe-area rules scoped to `@media (max-width: 1024px)` to avoid affecting desktop
- HUD uses longhand padding properties (not shorthand) to prevent safe-area conflicts

## Visual Validation Agent Pattern
When testing UI changes visually, spawn a sub-agent to handle Playwright screenshots so images don't clog the main conversation context:

```
Agent(
  subagent_type: "general-purpose",
  description: "Visual validation test",
  prompt: "Navigate to http://localhost:3000, resize to 1600x900, navigate to [scene],
           use browser_evaluate to measure [elements]. Report TEXT ONLY — no screenshots."
)
```

Key points:
- Always tell the agent to report **text only** (computed heights, padding, etc.) — not screenshots
- Use `browser_evaluate` with `getBoundingClientRect()` and `getComputedStyle()` for precise measurements
- **Always unregister the service worker first** or measurements will reflect cached CSS
- Can run multiple visual test agents in parallel for different scenes
- Use this pattern for any UI change that needs visual verification at specific resolutions

## Scene Files
- `js/scenes/MenuScene.js` — main menu
- `js/scenes/SetupScene.js` — name/grade + color/mode selection (3-state render)
- `js/scenes/PracticeTypeScene.js` — puzzle type picker
- `js/scenes/PuzzleScene.js` — gameplay (puzzle card + answers + timer)
- `js/scenes/RaceScene.js` — canvas-based race track
- `js/scenes/StationScene.js` — station/zone screen
- `js/scenes/ResultsScene.js` — results + medals + alien unlocks

## Key Gotchas
- Hebrew nikud (vowel marks) inflates line-height — use explicit `line-height` or matching padding when buttons sit side by side
- Inline styles in JS templates prevent CSS media query overrides — extract to CSS classes instead
- `.scene` uses `justify-content: center` which crops overflowing content — use `.scene-scrollable` class for scrollable scenes
- `#game-container` on desktop has `max-height: 900px` — content must fit or scroll
