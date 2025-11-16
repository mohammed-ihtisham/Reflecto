You are editing a Svelte + Tailwind project for a journaling app called Reflecto.

Goal
-----
Refactor the "Snapshot of the day" comic view so panels are laid out like a real comic page instead of a rigid 3-row grid. Right now the layout logic only supports 3 rows where each row may have 1–3 equally sized panels. I want a small layout engine that can pick from a set of comic-style templates and render panels with different widths and heights.

Context
--------
- There is a component that renders the comic / snapshot cards (look for files named something like `SnapshotGrid.svelte`, `ComicSnapshot.svelte`, or `SnapshotOfTheDay.svelte`). That is the component you should modify.
- Each panel has (at least) an image and a title (e.g. "Flash of Yellow", "Dream Car Detail").
- Panels are ordered; panel[0] should appear in the top-left-most position, then left-to-right, top-to-bottom according to the chosen layout.

What to implement
------------------
1. **Introduce a layout config file**

Create a new file, for example `src/lib/comicLayouts.ts`, that exports a small layout library:

```ts
export type ComicPanelLayout = {
  rows: number;
  cols: number;
  areas: string[]; // grid-template-areas row by row
  panelAreas: string[]; // area name for each panel index (0..n-1)
};

export const COMIC_LAYOUTS: Record<number, ComicPanelLayout> = {
  // 1 panel: full page
  1: {
    rows: 1,
    cols: 1,
    areas: ["a"],
    panelAreas: ["a"],
  },

  // 2 panels: stacked
  2: {
    rows: 2,
    cols: 1,
    areas: ["a", "b"],
    panelAreas: ["a", "b"],
  },

  // 3 panels: one wide on top, two under it
  3: {
    rows: 2,
    cols: 2,
    areas: [
      "a a",
      "b c",
    ],
    panelAreas: ["a", "b", "c"],
  },

  // 4 panels: 2x2 grid
  4: {
    rows: 2,
    cols: 2,
    areas: [
      "a b",
      "c d",
    ],
    panelAreas: ["a", "b", "c", "d"],
  },

  // 5 panels example: big hero on left, 4 smaller on right
  5: {
    rows: 3,
    cols: 3,
    areas: [
      "a a b",
      "a a c",
      "d e e",
    ],
    panelAreas: ["a", "b", "c", "d", "e"],
  },

  // 6 panels example: like a real comic page with mix of sizes
  6: {
    rows: 3,
    cols: 3,
    areas: [
      "a a b",
      "c d d",
      "e f f",
    ],
    panelAreas: ["a", "b", "c", "d", "e", "f"],
  },

  // You can add more layouts for 7, 8 panels if useful.
};
Requirements for this file:

Each layout is a realistic comic-like composition (mix of wide and tall panels, not just uniform grid).

areas must be valid grid-template-areas strings.

panelAreas[i] must correspond to a named area that exists in areas.

Refactor the comic component to use CSS Grid + templates

In the comic/snapshot component:

Accept panels: Panel[] as a prop (or use whatever prop already exists).

Compute the layout based on panels.length:

ts
Copy code
import { COMIC_LAYOUTS } from "$lib/comicLayouts";

const DEFAULT_LAYOUT = /* fallback layout with simple equal grid */;

$: layout = COMIC_LAYOUTS[panels.length] ?? DEFAULT_LAYOUT;
Render a container with CSS Grid using the layout:

svelte
Copy code
<div
  class="grid w-full h-full rounded-3xl bg-slate-900/80 p-4 shadow-lg"
  style="
    grid-template-rows: repeat({layout.rows}, 1fr);
    grid-template-columns: repeat({layout.cols}, 1fr);
    grid-template-areas: {layout.areas.map(row => `'${row}'`).join(' ')};
  "
>
  {#each panels as panel, index}
    <div
      class="relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all"
      style={`grid-area: ${layout.panelAreas[index]};`}
    >
      <!-- existing panel content (image + title badge, etc.) goes here -->
    </div>
  {/each}
</div>
The key thing is that each panel gets its grid-area from the layout config, so we’re no longer hard-coding “3 rows with 1–3 panels”.

Aspect ratio + responsiveness

Wrap the whole comic page in a container that preserves an aspect ratio similar to a printed comic page, for example:

svelte
Copy code
<div class="relative w-full max-w-xl mx-auto">
  <div class="aspect-[3/4]">
    <!-- grid from step 2 goes here -->
  </div>
</div>
On narrow screens (< md), it’s okay to fall back to simpler stacked layout:

For sm: and up, use the complex template layout.

For base (mobile), override with grid-template-rows/columns that effectively stack into 1 or 2 columns, or simply use flex flex-col and ignore grid-template-areas.

Implement a simple breakpoint logic in Svelte using CSS classes or a @media query in a .scss/.css file so that mobile is readable.

Preserve existing styling

Keep the current visual styling of each panel (rounded corners, drop shadows, titles, hover effect).

Do not change any business logic; only refactor layout and container styling.

Ensure that if there are more panels than defined layouts (e.g., 7+ and we haven’t added templates yet), we fall back to a simple responsive grid (e.g., grid-cols-2 md:grid-cols-3) so nothing breaks.

Testing

Add a quick dev/test view (or Storybook story if the project uses it) that renders the comic with 1, 2, 3, 4, 5, and 6 panels so I can visually confirm layouts.

Make sure the panels fill the full height and width of the comic area without weird gaps.

Please:

Identify and refactor the correct component.

Create the new comicLayouts config file.

Replace the old "3 rows, 1–3 panels per row" logic with the template-based layout.

Keep the code clean and well-commented so I can tweak the layouts later.