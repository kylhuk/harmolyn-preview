

## Remove zoom:0.8 and Scale All Dimensions to 80%

### What This Plan Does

Yes -- the `zoom: 0.8` hack gets removed entirely. Every hardcoded pixel value, font size, spacing, and dimension across all components gets multiplied by 0.8 and rounded to the nearest clean number. The result is the same visual density you saw at 80% zoom, but done properly through actual CSS values.

Additionally, the right sidebar gets moved inside the content flow so it syncs with the left sidebar across all breakpoints.

### Scaling Formula

Every structural value: `new = old * 0.8`, rounded to nearest Tailwind-friendly number.

### Complete Dimension Map

```text
STRUCTURAL WIDTHS
  ServerRail width:        88px  -->  70px
  Sidebar widths:         280px  --> 224px
  Collapsed strip:         12px  -->  10px
  Hover trigger:           16px  -->  12px

BUTTON / ICON SIZES
  Server rail buttons:     56px  -->  44px
  Core action (mobile):    48px  -->  40px
  Create modal icon:      112px  -->  90px
  Explorer server icons:   64px  -->  52px

HEIGHTS
  Header bars (h-16):      64px  -->  52px (h-[52px])
  Bottom dock:             88px  -->  70px
  Popup banner:            80px  -->  64px (h-16)
  Settings banner:        128px  -->  100px
  Settings avatar:        128px  -->  100px

AVATARS
  User footer avatar:      40px  -->  32px (w-8)
  Member list avatar:      32px  -->  26px (w-[26px])
  Chat message avatar:     40px  -->  32px (w-8)
  Popup avatar:            80px  -->  64px (w-16)
  Settings avatar:        128px  -->  100px

RAIL INDICATORS
  Active marker:        w-2 h-7  -->  w-1.5 h-5
  Indicator left offset:  -24px  -->  -20px
  Divider width:           40px  -->  32px

FONT SIZES
  text-[32px]  -->  text-[26px]
  text-3xl     -->  text-2xl
  text-2xl     -->  text-xl
  text-xl      -->  text-lg
  text-lg      -->  text-base
  text-[16px]  -->  text-[13px]
  text-base    -->  text-sm
  (text-sm and smaller stay unchanged -- already minimal)

SPACING / PADDING
  p-10     -->  p-8
  p-8      -->  p-6
  px-8     -->  px-6
  py-16    -->  py-12
  py-8     -->  py-6
  px-6     -->  px-5
  gap-6    -->  gap-5
  gap-4    -->  gap-3
  space-y-8 --> space-y-6
  (4px and 8px spacings stay unchanged)

BORDER RADIUS (large values only)
  rounded-r4  -->  rounded-[52px]
  rounded-3xl -->  rounded-2xl
  (r1, r2, full stay unchanged -- already spec-defined)
```

### Files to Modify (12 files)

1. **`src/components/Layout.tsx`**
   - Remove `zoom: 0.8` from root style
   - Sidebar spacers: 280px to 224px, 12px to 10px, 16px to 12px
   - Bottom dock: 88px to 70px, core button w-12/h-12 to w-10/h-10
   - Move right sidebar inside content flow (fix sync issue)

2. **`src/components/ServerRail.tsx`**
   - Rail width: 88px to 70px
   - Buttons: 56px to 44px
   - Active marker: w-2 h-7 to w-1.5 h-5, left offset -24px to -20px
   - Tooltip offset: left-[70px] to left-[56px]
   - Divider: w-10 to w-8
   - Padding/gaps scaled down

3. **`src/components/ChannelRail.tsx`**
   - Width: 280px to 224px
   - Header: h-16 to h-[52px]
   - Collapsed handle: 12px to 10px
   - User footer avatar: w-10 to w-8
   - Font sizes, paddings scaled

4. **`src/components/MemberSidebar.tsx`**
   - Width: 280px to 224px
   - Header: h-16 to h-[52px]
   - Member avatars: w-8 to w-[26px]
   - Padding/spacing scaled

5. **`src/components/ChatArea.tsx`**
   - Header: h-16 to h-[52px]
   - Message avatars: w-10 to w-8
   - UserPopup: w-72 to w-[230px], avatar w-20/h-20 to w-16/h-16, banner h-20 to h-16
   - Font sizes: text-2xl to text-xl, text-lg to text-base, text-[16px] to text-[13px]
   - Input area padding scaled

6. **`src/components/SettingsScreen.tsx`**
   - Sidebar: 280px to 224px
   - Title: text-[32px] to text-[26px]
   - Profile avatar: w-32/h-32 to w-[100px]/h-[100px]
   - Banner: h-32 to h-[100px]
   - All padding/spacing scaled

7. **`src/components/ServerSettingsScreen.tsx`**
   - Sidebar: 280px to 224px
   - Same scaling pattern as SettingsScreen

8. **`src/components/CreateServerModal.tsx`**
   - Icon: w-28/h-28 to w-[90px]/h-[90px]
   - Title: text-3xl to text-2xl
   - Padding: p-10 to p-8
   - Input heights, button sizes scaled

9. **`src/components/StatusPicker.tsx`**
   - Width: 280px to 224px
   - Padding/spacing scaled

10. **`src/components/ServerExplorer.tsx`**
    - Server icons: w-16/h-16 to w-12/h-12
    - Card padding, font sizes scaled

11. **`src/components/FriendsPanel.tsx`**
    - Avatar sizes, header heights, font sizes scaled

12. **`src/components/EmojiPicker.tsx`**
    - Grid cell sizes, popup dimensions scaled

### Right Sidebar Sync Fix

The member sidebar wrapper moves inside the content area (same parent as the left sidebar), using the identical pattern:
- Always rendered in the DOM
- `pointer-events-none` when collapsed
- `pointer-events-auto` when expanded or hovered
- On tablet/mobile: overlay with backdrop, triggered by explicit toggle
- On desktop: inline with hover-to-peek

This guarantees both sidebars appear and disappear at the same breakpoint.

