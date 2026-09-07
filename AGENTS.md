# Repository Guidelines

## Project Structure & Module Organization

AniGallery is a dependency-free static site. Root-level HTML files are the deployable pages: `index.html` is the gallery, `blog.html` is the article index, and `plot_<film>.html` / `video_<film>.html` hold film-specific content. Shared presentation lives in `css/style.css`; `css/bootstrap.css` and minified files under `js/` are vendored dependencies. First-party browser behavior is in `js/clean-url.js`, `js/site-search-index.js`, and `js/title-search.js`. Store optimized artwork in `images/` and MP4 content in `videos/`. Vercel routing is configured by `vercel.json`.

## Build, Test, and Development Commands

There is no compilation step or package manifest. Useful local checks are:

- `python3 -m http.server 8000` — quick static preview at `http://localhost:8000/index.html`; request explicit `.html` paths because this server does not emulate Vercel clean URLs.
- `npx vercel dev` — preview suffixless production-style routes such as `/plot_qian` when the Vercel CLI is available.
- `node --check js/title-search.js` — syntax-check a changed first-party JavaScript file; repeat for other edited scripts.
- `git diff --check` — detect whitespace errors before committing.

## Coding Style & Naming Conventions

Follow the existing formatting: four-space indentation in HTML and JavaScript, two spaces in CSS, double-quoted HTML attributes, and semicolon-terminated JavaScript. Keep browser code compatible with the current ES5-style modules (`var`, function expressions, and UMD exports); there is no transpilation. Use lowercase filenames: hyphens for shared scripts (`clean-url.js`) and the established `plot_<film>.html` / `video_<film>.html` pattern for content. Do not edit vendored Bootstrap or minified JavaScript for site-specific behavior. When adding an article, update its page links and the fallback entries in `js/site-search-index.js`.

## Testing Guidelines

No automated test suite or coverage threshold currently exists. Manually verify the home, blog, plot, and video pages at desktop and mobile widths. Check navigation, media loading, responsive menus, search mouse/keyboard behavior, and clean URLs under `vercel dev`. Confirm the browser console remains free of new errors.

## Commit & Pull Request Guidelines

History favors short prefixes such as `feat:`, `feat(search):`, `fix:`, and `update:`. Use an imperative, focused subject and an optional lowercase scope, for example `fix(search): preserve keyboard focus`. Keep unrelated asset and behavior changes separate. Pull requests should summarize affected pages, describe manual verification, link relevant issues, and include before/after screenshots for visual or responsive changes. Call out large media additions and routing changes explicitly.
