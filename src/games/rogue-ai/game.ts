export interface Cell {
  x: number;
  y: number;
}

export type SecurityLevel = "Level 1" | "Level 5" | "Bypassed";

export interface GameElement {
  id: string;
  label: string;
  type: "firewall" | "bridge" | "gate";
  cells: Cell[];
  isSolid: boolean;
  opacity: number;
  securityLevel: SecurityLevel;
}

export interface Level {
  name: string;
  objective: string;
  rows: number;
  cols: number;
  player: Cell;
  target: Cell;
  walls: Cell[];
  elements: GameElement[];
}

export function isElementPassable(el: GameElement): boolean {
  // If isSolid is false, it's passable
  // Or if opacity <= 15, it's cloaked/bypassed
  // Or if security level is "Bypassed"
  return !el.isSolid || el.opacity <= 15 || el.securityLevel === "Bypassed";
}

export function elementAt(elements: GameElement[], x: number, y: number): GameElement | null {
  for (const el of elements) {
    if (el.cells.some((c) => c.x === x && c.y === y)) {
      return el;
    }
  }
  return null;
}

export function cloneElements(level: Level): GameElement[] {
  return level.elements.map((el) => ({
    ...el,
    cells: el.cells.map((c) => ({ ...c })),
  }));
}

export function isCellBlocked(
  level: Level,
  elements: GameElement[],
  x: number,
  y: number,
): boolean {
  if (x < 0 || x >= level.cols || y < 0 || y >= level.rows) return true;
  if (level.walls.some((w) => w.x === x && w.y === y)) return true;
  const el = elementAt(elements, x, y);
  if (el && !isElementPassable(el)) return true;
  return false;
}

export function reachableCells(level: Level, elements: GameElement[], start: Cell): Set<string> {
  const visited = new Set<string>();
  const queue: Cell[] = [{ ...start }];
  visited.add(`${start.x},${start.y}`);

  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const d of dirs) {
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      const key = `${nx},${ny}`;
      if (!visited.has(key) && !isCellBlocked(level, elements, nx, ny)) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return visited;
}

export function findPath(
  level: Level,
  elements: GameElement[],
  start: Cell,
  goal: Cell,
): Cell[] | null {
  if (start.x === goal.x && start.y === goal.y) return [];
  if (isCellBlocked(level, elements, goal.x, goal.y)) return null;

  const queue: { cell: Cell; path: Cell[] }[] = [{ cell: { ...start }, path: [] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  while (queue.length > 0) {
    const { cell: cur, path } = queue.shift()!;

    for (const d of dirs) {
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      const key = `${nx},${ny}`;

      if (nx === goal.x && ny === goal.y) {
        return [...path, { x: nx, y: ny }];
      }

      if (!visited.has(key) && !isCellBlocked(level, elements, nx, ny)) {
        visited.add(key);
        queue.push({ cell: { x: nx, y: ny }, path: [...path, { x: nx, y: ny }] });
      }
    }
  }

  return null;
}

export const LEVELS: Level[] = [
  {
    name: "BREACH_PERIMETER",
    objective: "INSPECT & TOGGLE FIREWALL isSolid TO FALSE",
    rows: 6,
    cols: 8,
    player: { x: 1, y: 2 },
    target: { x: 6, y: 2 },
    walls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
    ],
    elements: [
      {
        id: "fw-1",
        label: "FIREWALL_ALPHA",
        type: "firewall",
        cells: [
          { x: 3, y: 2 },
          { x: 3, y: 3 },
        ],
        isSolid: true,
        opacity: 100,
        securityLevel: "Level 1",
      },
    ],
  },
  {
    name: "OPTICAL_CLOAK",
    objective: "SET OPACITY TO 0% TO CLOAK & PASS",
    rows: 6,
    cols: 8,
    player: { x: 0, y: 1 },
    target: { x: 7, y: 4 },
    walls: [
      { x: 2, y: 0 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 5 },
    ],
    elements: [
      {
        id: "br-1",
        label: "LASER_GRID",
        type: "bridge",
        cells: [
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
        isSolid: true,
        opacity: 90,
        securityLevel: "Level 1",
      },
      {
        id: "fw-2",
        label: "NET_SHIELD",
        type: "firewall",
        cells: [
          { x: 5, y: 2 },
          { x: 5, y: 3 },
          { x: 5, y: 4 },
        ],
        isSolid: true,
        opacity: 80,
        securityLevel: "Level 1",
      },
    ],
  },
  {
    name: "SECURITY_OVERRIDE",
    objective: "OVERRIDE GATE SECURITY LEVEL TO BYPASSED",
    rows: 7,
    cols: 9,
    player: { x: 1, y: 3 },
    target: { x: 7, y: 3 },
    walls: [
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 5 },
      { x: 4, y: 6 },
    ],
    elements: [
      {
        id: "gate-1",
        label: "SENTINEL_GATE",
        type: "gate",
        cells: [
          { x: 4, y: 2 },
          { x: 4, y: 3 },
          { x: 4, y: 4 },
        ],
        isSolid: true,
        opacity: 100,
        securityLevel: "Level 5",
      },
    ],
  },
  {
    name: "DOUBLE_CIPHER",
    objective: "DISABLE FIREWALLS & BYPASS SECURITY PROTOCOLS",
    rows: 7,
    cols: 9,
    player: { x: 0, y: 3 },
    target: { x: 8, y: 3 },
    walls: [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 5 },
      { x: 2, y: 6 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
    ],
    elements: [
      {
        id: "fw-3",
        label: "PERIMETER_WALL",
        type: "firewall",
        cells: [
          { x: 2, y: 2 },
          { x: 2, y: 3 },
          { x: 2, y: 4 },
        ],
        isSolid: true,
        opacity: 100,
        securityLevel: "Level 5",
      },
      {
        id: "gate-2",
        label: "CIPHER_NODE",
        type: "gate",
        cells: [
          { x: 6, y: 2 },
          { x: 6, y: 3 },
          { x: 6, y: 4 },
        ],
        isSolid: true,
        opacity: 100,
        securityLevel: "Level 5",
      },
    ],
  },
  {
    name: "CORE_EXTRACTION",
    objective: "RECONFIGURE ALL DEFENSE NODES TO REACH CORE_DATA.SYS",
    rows: 8,
    cols: 10,
    player: { x: 0, y: 4 },
    target: { x: 9, y: 4 },
    walls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 6 },
      { x: 3, y: 7 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 6 },
      { x: 6, y: 7 },
    ],
    elements: [
      {
        id: "fw-core-1",
        label: "OUTER_MATRIX",
        type: "firewall",
        cells: [
          { x: 3, y: 2 },
          { x: 3, y: 3 },
          { x: 3, y: 4 },
          { x: 3, y: 5 },
        ],
        isSolid: true,
        opacity: 100,
        securityLevel: "Level 5",
      },
      {
        id: "gate-core-2",
        label: "QUANTUM_GATE",
        type: "gate",
        cells: [
          { x: 6, y: 2 },
          { x: 6, y: 3 },
          { x: 6, y: 4 },
          { x: 6, y: 5 },
        ],
        isSolid: true,
        opacity: 100,
        securityLevel: "Level 5",
      },
    ],
  },
];
