

# Wire External Components into the Lovable Build

## Overview
The root-level component files (`components/`, `data.ts`, `types.ts`, `utils/`) exist but are outside the `src/` directory, so they are not part of the Vite build. We need to move them into `src/` and update `src/App.tsx` to render the `Layout` component.

## Changes

### 1. Move data and type files into `src/`
- Create `src/data.ts` (copy from root `data.ts`)
- Create `src/types.ts` (copy from root `types.ts`)
- Create `src/utils/themeGenerator.ts` (copy from root `utils/themeGenerator.ts`)

### 2. Move all components into `src/components/`
- `src/components/Layout.tsx`
- `src/components/ServerRail.tsx`
- `src/components/ChannelRail.tsx`
- `src/components/ChatArea.tsx`
- `src/components/MemberSidebar.tsx`
- `src/components/SettingsScreen.tsx`
- `src/components/ServerExplorer.tsx`
- `src/components/CreateServerModal.tsx`

All import paths will be updated from `../types` / `../data` / `../utils/themeGenerator` to `@/types`, `@/data`, `@/utils/themeGenerator` (using the configured alias).

### 3. Update `src/App.tsx`
Replace the current routing setup with a direct render of the `Layout` component (the app is a single-screen chat UI, not a multi-page app):

```tsx
import { Layout } from "@/components/Layout";

const App = () => <Layout />;
export default App;
```

### 4. Add missing CSS utility
The `glass-panel` class is used in several components but not defined in `src/index.css`. Add it alongside the existing `glass-card` class.

Also add `no-scrollbar` utility and `pb-safe` for mobile bottom safe area.

### 5. Add `animate-in` utilities
Components use Tailwind animate classes like `animate-in`, `fade-in`, `zoom-in-95`, `slide-in-from-bottom-10`, `slide-in-from-top-2`. These come from `tailwindcss-animate` which is already installed and configured.

## File count
- 8 new component files in `src/components/`
- 2 new data/type files in `src/`
- 1 new utility file in `src/utils/`
- 1 edit to `src/App.tsx`
- 1 edit to `src/index.css` (add missing utilities)
- Total: 11 new files, 2 edits

