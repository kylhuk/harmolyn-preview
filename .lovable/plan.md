

## Fix: Sidebar Pointer Events and Hover Reliability

### Root Cause

Both sidebars share the same core problem: invisible elements blocking interaction.

**Left sidebar:** A 280px-wide absolutely-positioned wrapper (z-40) is always in the DOM even when the channel list is collapsed (it just slides its content off-screen with `translate-x`). This invisible 280px box intercepts all clicks and hovers over the chat area.

**Right sidebar:** The hover trigger and the expanded panel are two separate conditional blocks that swap via unmount/mount. When the trigger sets `memberListHovered = true`, React unmounts the trigger and mounts the panel in the next render. During this swap the mouse can briefly be over "nothing," causing the hover state to reset immediately. The sidebar never stays open.

### Fix Strategy

Use `pointer-events-none` / `pointer-events-auto` instead of conditional rendering. Both sidebars should always exist in the DOM but be non-interactive when collapsed.

### Technical Changes

**File: `src/components/Layout.tsx`**

1. Left sidebar wrapper (line 161-166): Add `pointer-events-none` when collapsed, and add `pointer-events-auto` to the ChannelRail container itself so it becomes interactive when expanded or hovered.

2. Right sidebar (lines 239-281): Replace the three separate conditional blocks with a **single always-rendered wrapper** div that:
   - Is always in the DOM (no conditional unmount)
   - Uses `pointer-events-none` by default when collapsed
   - Switches to `pointer-events-auto` on hover or when expanded
   - Contains both the narrow trigger strip AND the full sidebar panel, toggled via opacity/visibility rather than conditional rendering
   - Uses `onMouseEnter` / `onMouseLeave` on the single outer wrapper so the mouse never "leaves" during the trigger-to-panel transition

3. Remove the left sidebar's 6px hover-trigger strip (lines 154-158) — fold its job into the always-present wrapper with proper pointer-events on just the edge strip.

**File: `src/components/MemberSidebar.tsx`**

4. Remove the `if (collapsed) return null` early return (line 29). The parent wrapper now handles visibility. The component should always render its content; the parent controls whether it's visible and interactive.

### Why This Fixes Both Issues

- **Left sidebar**: The wrapper won't block clicks because `pointer-events-none` makes it transparent to the mouse. Only the visible channel list (when expanded/hovered) receives events.
- **Right sidebar**: No more unmount/mount race condition. The wrapper is always there, mouse events flow naturally between the thin trigger edge and the expanded panel without any DOM removal.

