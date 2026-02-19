

# Fix React Frontend for Lovable

## Problem
The project was created outside Lovable and has several configuration conflicts preventing it from rendering properly. The `index.html` has duplicate script tags and loads Tailwind via CDN (conflicting with the build system), and the entry point references are mismatched.

## Changes

### 1. Fix `index.html`
- Remove the duplicate `<script type="module" src="index.tsx">` tag (the correct entry is `src/main.tsx` loaded automatically by Vite)
- Remove the CDN Tailwind script (`<script src="https://cdn.tailwindcss.com">`) and inline `tailwind.config` block -- Tailwind is already configured via the build system (`tailwind.config.ts` + PostCSS)
- Keep the Google Fonts link and custom CSS/styles
- Remove `<script type="module" src="/index.tsx">` duplicate

### 2. Move external styles into the build system
- Merge the custom CSS from root `index.css` (glass effects, grid overlay, scrollbar styles, etc.) into `src/index.css` so it's processed by the build pipeline

### 3. Prepare `src/App.tsx` for the external components
- Once the GitHub repo is connected and files like `Layout.tsx`, `data.ts`, `types.ts`, and `utils/themeGenerator.ts` arrive, update `src/App.tsx` to import and render the `Layout` component instead of the placeholder `Index` page
- The external component files (currently at root `components/`, `data.ts`, `types.ts`, `utils/`) will need to be moved under `src/` and import paths updated to use the `@/` alias

### 4. Note for the user
- The main application components (`Layout`, `ChatArea`, `ServerRail`, etc.) referenced in the code **do not exist on disk yet**. You'll need to connect your GitHub repo first, then we can wire everything together.

## Technical Details

**`index.html` cleanup** -- remove these lines:
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config = { ... }</script>
<script type="module" src="index.tsx"></script>
<script type="module" src="/index.tsx"></script>
```

Keep only the standard Vite entry:
```html
<script type="module" src="/src/main.tsx"></script>
```

**CSS merge** -- The custom theme CSS (glass effects, grid overlay, glow utilities, scrollbar styles) from root `index.css` will be appended to `src/index.css` after the Tailwind directives.

**Tailwind config** -- The custom colors (`bg-0`, `primary`, `accent`, `glass`), fonts, and border radius values from the inline config will be merged into `tailwind.config.ts`.

