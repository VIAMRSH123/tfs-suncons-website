# Lazy loaders

`dynamic()` only code-splits when it is called from a Client Component, so the
loaders live in these `"use client"` files rather than in the pages
(see `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`).

They are split by where they are used, because every file that imports a loader
module carries *all* of that module's loaders: `chrome.tsx` is on every page,
`home.tsx` only on the homepage, and so on. Keep it that way — one shared file
put roughly a kilobyte of homepage loaders on every product page.
