

# Recover Right Sidebar and Optimize Codebase

## Problem
The app fails to build because 49 unused UI component files in `src/components/ui/` require ~15 missing npm packages. The right sidebar (MemberSidebar) code is intact but never renders because the build crashes.

## Solution

### 1. Delete all unused UI components and related files
None of the files in `src/components/ui/` are imported by the app. Delete the entire folder and related unused files:

- **Delete all files** in `src/components/ui/`
- **Delete** `src/hooks/use-toast.ts`
- **Delete** `src/hooks/use-mobile.tsx`
- **Delete** `src/components/NavLink.tsx`
- **Delete** `src/lib/utils.ts`
- **Delete** `src/pages/Index.tsx` and `src/pages/NotFound.tsx`

This eliminates all missing dependency errors instantly.

### 2. Remove unused dependencies from package.json
These installed packages are only used by the deleted UI components:

- `@radix-ui/react-slot`
- `@radix-ui/react-toast`
- `@radix-ui/react-tooltip`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `sonner`
- `tailwindcss-animate`

### 3. Result
Once the dead code is removed, the build succeeds and the MemberSidebar (right sidebar) renders as designed. No changes needed to the actual app components -- only removal of unused scaffolding.

## Technical Details

The member sidebar is fully implemented in `src/components/Layout.tsx`:
- Renders when `showMemberSidebar` is true (non-DM, non-explore views)
- Supports collapse/expand via hover zones and toggle button
- Shows member groups (Operators, Idle, Offline) with status indicators
- On mobile/tablet renders as overlay with backdrop

**File impact:** ~55 files deleted, 1 file edited (package.json to remove unused deps), 0 app component changes needed.

