

## Fix: Synchronized Sidebar Visibility and UI Scale

### Problem 1: Sidebars Out of Sync
The left sidebar (ChannelRail) is visible on tablet screens (600-1100px), but the right sidebar (MemberSidebar) is completely hidden on tablet because `showMemberSidebar && !isOverlaySidebar` filters it out at the root level (`isOverlaySidebar = isMobile || isTablet`). Meanwhile, the left sidebar only hides on mobile (`< 600px`). This mismatch means the right sidebar disappears at a wider breakpoint than the left.

**Fix**: Unify the behavior so both sidebars follow the same rules:
- Desktop (>= 1100px): Both sidebars visible, collapsible, hover-to-peek
- Tablet/Mobile (< 1100px): Both sidebars hidden by default, only available via explicit toggle (overlay mode)

### Problem 2: UI Too Large
The overall UI elements feel oversized at 100% browser zoom. The user reports it looks correct at 80% zoom.

**Fix**: Apply CSS `zoom: 0.8` on the root layout container. This scales all elements uniformly without changing any individual component sizes or spacing tokens.

### Technical Changes

**File: `src/components/Layout.tsx`**

1. On the root container div (line 128), add `style` property to include `zoom: 0.8` (merged with the existing `themeStyle`).

2. Ensure the right member sidebar renders on tablet/mobile as an overlay (same as left sidebar behavior):
   - Move the member sidebar overlay rendering (currently only backdrop at lines 211-216) to include the actual `MemberSidebar` component for tablet/mobile.
   - The root-level member sidebar block (lines 237-266) stays for desktop-only hover-to-peek behavior.

3. Add the right sidebar overlay panel for tablet/mobile alongside the existing backdrop (around line 211-216), so toggling the "people" icon on smaller screens slides in the member list as an overlay -- mirroring exactly how the left channel list works on mobile.

**File: `src/components/MemberSidebar.tsx`**
No changes needed.

**File: `src/index.css`**
No changes needed -- `zoom` is applied inline.

### Result
- Both sidebars appear/disappear at the same breakpoint
- On smaller screens, both use overlay mode with backdrop dismiss
- The entire UI is 80% of its current size, matching the user's preferred density
