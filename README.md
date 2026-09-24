# Tidewater

A modularized, Vite-based build of the Tidewater fishing prototype — split out
of the original single 2,700-line HTML file into separate files by concern.

## Running it

```
npm install
npm run dev       # local dev server with hot reload, at http://localhost:5173
npm run build     # production build, output in dist/
npm run preview   # serve the production build locally to sanity-check it
```

## Layout

```
index.html      — page shell: all the screen markup (unchanged from the original)
src/
  style.css     — all CSS, unchanged
  data.js       — static game data: fish, bait, gear, cosmetics, XP curve,
                  quality tiers, collection log, challenges. Pure data/lookups,
                  no dependency on mutable state.
  state.js      — the mutable `state` object, save-slot persistence (slots,
                  load/save, migration), catch quality/rating rolls, and
                  per-species proficiency.
  audio.js      — the procedural 8-bit sound system.
  render.js     — toasts, the character renderer, and the screen-switcher.
  game.js       — the core play loop: character creation, HUD, the catch
                  roll, the recent-catch feed, selling/trophies, and the
                  always-on auto-fishing loop.
  screens.js    — secondary screens: inventory, trophy room, records, skills,
                  collection log, challenges, tackle shop.
  menu.js       — title screen, save/load slot picker, options, the confirm
                  modal, and the save-status indicator.
  main.js       — entry point; see the note below before editing it.
```

This first pass is a coarse split — a handful of files instead of ~2,700
lines in one — rather than one file per screen. `game.js`, `screens.js`, and
`menu.js` in particular could each be split further later; nothing here
blocks that, it just wasn't done yet.

## A note on circular imports (read this before touching `main.js`)

Every module in this game ends up needing something from most of the others
(fish data needs `state`, `state` needs fish data, the UI needs both, etc.),
so the module graph is genuinely circular. That's normal in JS, but it means
**a module's own top-level code can't safely assume another module has
finished loading yet** — only code inside a function is safe, because it
only runs later, once everything has settled.

A few places in the original file did real work at the top level (building
the initial `state` object from game data, building the character-creation
swatches, wiring the volume slider to `state`). Those were pulled out into
explicitly-exported functions — `buildProfXpTable()`, `initCharacterCreationUI()`,
`initSoundOptionsUI()`, and the initial state being set via `setState(makeFreshState())`
— and `main.js` calls them in order, only after every module has imported
cleanly. If you add new top-level code to any module that immediately reads
a value from another module (not just registers a callback for later), it
needs the same treatment: export a function, call it from `main.js`.

This was verified with a headless smoke test (boot → new game → character
creation → dock → save to a slot → reload → load that slot) that exercises
this exact hazard; all of it passed with zero runtime errors before this was
handed off.

## What's unchanged

The actual game logic, balance, save format, and all markup/CSS are byte-for-
byte the same as the pre-split version — this was a structural refactor
only, not a rewrite. `localStorage` saves from the old version are migrated
into Slot 1 automatically on first load, same as before.
