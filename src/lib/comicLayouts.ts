export type ComicPanelLayout = {
  rows: number;
  cols: number;
  areas: string[];
  panelAreas: string[];
};

export const COMIC_LAYOUTS: Record<number, ComicPanelLayout> = {
  1: {
    rows: 1,
    cols: 1,
    areas: ['a'],
    panelAreas: ['a']
  },
  2: {
    rows: 2,
    cols: 1,
    areas: ['a', 'b'],
    panelAreas: ['a', 'b']
  },
  3: {
    rows: 2,
    cols: 2,
    areas: ['a a', 'b c'],
    panelAreas: ['a', 'b', 'c']
  },
  4: {
    rows: 2,
    cols: 2,
    areas: ['a b', 'c d'],
    panelAreas: ['a', 'b', 'c', 'd']
  },
  5: {
    rows: 3,
    cols: 3,
    areas: ['a a b', 'a a c', 'd e e'],
    panelAreas: ['a', 'b', 'c', 'd', 'e']
  },
  6: {
    rows: 3,
    cols: 3,
    areas: ['a a b', 'c d d', 'e f f'],
    panelAreas: ['a', 'b', 'c', 'd', 'e', 'f']
  },
  7: {
    rows: 3,
    cols: 3,
    areas: ['a a b', 'c d e', 'f g g'],
    panelAreas: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
  },
  8: {
    rows: 3,
    cols: 3,
    areas: ['a a b', 'c d e', 'f g h'],
    panelAreas: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  }
};

export const DEFAULT_LAYOUT: ComicPanelLayout = {
  rows: 3,
  cols: 2,
  areas: ['a b', 'c d', 'e f'],
  panelAreas: ['a', 'b', 'c', 'd', 'e', 'f']
};

const AREA_NAMES = 'abcdefghijklmnopqrstuvwxyz';

export function getComicLayout(panelCount: number): ComicPanelLayout {
  if (!panelCount || panelCount <= 0) {
    return DEFAULT_LAYOUT;
  }
  const template = COMIC_LAYOUTS[panelCount];
  if (template) {
    return template;
  }

  const cols = panelCount >= 3 ? 3 : panelCount;
  const rows = Math.ceil(panelCount / cols);
  const areas: string[] = [];
  const panelAreas: string[] = [];
  let cursor = 0;

  for (let r = 0; r < rows; r += 1) {
    const rowNames: string[] = [];
    for (let c = 0; c < cols; c += 1) {
      const panelIndex = r * cols + c;
      if (panelIndex < panelCount) {
        const areaName = AREA_NAMES[cursor % AREA_NAMES.length];
        rowNames.push(areaName);
        panelAreas.push(areaName);
        cursor += 1;
      } else {
        rowNames.push('.');
      }
    }
    areas.push(rowNames.join(' '));
  }

  return {
    rows,
    cols,
    areas,
    panelAreas
  };
}

export function describeLayout(layout: ComicPanelLayout): string {
  return layout.areas
    .map((row, index) => `Row ${index + 1}: ${row.replace(/\./g, '·')}`)
    .join('; ');
}

