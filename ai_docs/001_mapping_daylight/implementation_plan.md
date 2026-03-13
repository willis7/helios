# UI Implementation Brief: "Follow the Sun" On-Call Visualizer

## Overview
Build a responsive, split-pane dashboard that visualizes global on-call engineering schedules. The layout consists of a fixed-width left sidebar for navigation and a large interactive global map occupying the remaining viewport.

## Layout & Breakpoints
* **Mobile (<768px):** The map takes up the full screen. The sidebar collapses into a bottom sheet or a toggleable drawer.
* **Tablet/Desktop (≥768px):** A permanent split view. The left sidebar is fixed at ~320px width; the right side is the interactive map.

## The Map (Right Pane)
* **Base Layer:** Implement a global world map without street-level clutter. Landmasses and oceans should use the `grays` palette tokens to remain subdued.
* **Day/Night Overlay:** Implement a dynamic terminator line overlay. It should cast a shadow (using the `terminatorNight` token) over the portions of the globe currently experiencing nighttime, updating automatically. * **Markers:** Instead of store pins, plot user avatars at their geographic locations. Include a small badge attached to the bottom of the avatar showing their current local time.
* **Handoff Route:** Draw a glowing line (using `primary.default` and `primary.glow` tokens) connecting the currently active primary engineer to the secondary/escalation engineer.
* **Hover Tooltips:** When hovering over an avatar on the map, display a floating glassmorphism card (translucent dark background, subtle border, backdrop blur) containing their name, role, and immediate contact icons.

## The Sidebar (Left Pane)
* **Header & Controls:** Include a search bar for finding engineers and filter dropdowns (e.g., "Filter by Team", "Sort by Role").
* **List Items:** Display a scrollable list of engineers. Each row must show:
  * Avatar (left-aligned).
  * Engineer Name.
  * Location and Shift Status (e.g., "London, UK • Primary 'til 6pm"). The active shift text should use the `primary.default` color.
  * Status icons (right-aligned) showing readiness or current state (e.g., awake/asleep).
* **Active State:** The currently active on-call engineer's list item should be highlighted with a `primary.default` border and a soft `primary.glow` box-shadow.

## Theming & Tokens
* **Strict Token Usage:** Do not hardcode hex values. Use semantic color tokens like `bg-surface-sidebar`, `text-primary`, `text-muted`, `border-active`, and `accent-route`.
* Support both Light and Dark modes. The default experience should be dark mode, utilizing deep zinc/neutral shades (`#09090B` to `#27272A`) to make the bright mint green (`#4ADE80`) active states and the daylight areas of the map pop. In light mode, invert the map and sidebar backgrounds while maintaining the green accent hierarchy.
