

# Fix Right Sidebar (MemberSidebar) Visibility

## Problem
The MemberSidebar code exists and is wired up correctly, but two issues prevent it from working:

1. **Auto-collapse on tablet**: At widths below 1100px, `memberListCollapsed` is set to `true` on mount. The sidebar uses `translate-x-full` when collapsed, pushing it entirely off-screen.
2. **Hover flicker loop**: The hover-to-expand mechanism uses separate elements for the trigger zone (`w-4` div) and the sidebar container (`w-[280px]` div with `onMouseLeave`). When the sidebar animates in, mouse events fire in rapid succession causing the sidebar to flicker in and out (confirmed by session replay).

## Solution

### 1. Fix the hover expand/collapse mechanism in Layout.tsx
Replace the fragile two-element hover trigger with a single wrapper that handles both the collapsed trigger strip and the expanded sidebar, preventing the flicker loop.

### 2. Ensure the sidebar is visible by default on desktop
- On desktop (>= 1100px): sidebar starts expanded (current behavior, works fine)
- On tablet (600-1100px): sidebar starts collapsed but can be toggled via the button in the chat header (the people icon)
- Remove the hover-to-expand behavior for the member sidebar on tablet since overlay sidebars should be explicitly toggled, not hover-triggered

### 3. Specific changes

**`src/components/Layout.tsx`** (lines 181-210):
- Wrap the hover trigger and sidebar container in a single div with unified mouse events
- On tablet/mobile, disable hover-expand entirely -- only use the toggle button
- Remove the separate `w-4` hover trigger div that causes race conditions
- Keep the `memberListHovered` state only for desktop non-collapsed scenarios

**`src/components/MemberSidebar.tsx`**:
- Remove the internal collapsed handle strip (the thin `w-[12px]` div) since hover handling is managed by the parent Layout
- Simplify: when `collapsed` is true, don't render content at all instead of using `translate-x-full` (prevents invisible offscreen content)

## Technical Details

The root cause is a mouse event race condition:
1. Mouse enters the 4px trigger zone -> `memberListHovered = true`
2. Sidebar starts animating from `translate-x-full` to `translate-x-0`
3. During animation, mouse briefly leaves the sidebar container -> `memberListHovered = false`
4. Sidebar collapses -> mouse is back over trigger -> cycle repeats

The fix consolidates hover handling into one container and disables hover-expand on overlay (tablet/mobile) viewports where a toggle button is more appropriate.
