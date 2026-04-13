// NETRA Dashboard — Deterministic Scenario + Graph Routing + UI adapters

export type Coord = { r: number; c: number };
export type XY = { x: number; y: number };

// Graph structures
export type Node = { id: number; r: number; c: number; pct: XY };
export type Edge = { a: number; b: number }; // undirected

// Simulation entities
export type Person = { id: string; node: number };
export type Exit = { id: string; node: number; label: string };
export type Incident = { node: number; radius: number; severity: 'low'|'medium'|'high' };

export type Scenario = {
  building: { nodes: Node[]; edges: Edge[] };
  people: Person[];
  exits: Exit[];
  incident: Incident;
  blocked_edges: Edge[];
  congestion_nodes: { node: number; weight: number }[];
};

export type Route = { person_id: string; exit_id: string; path_nodes: number[]; path_costs?: number[]; cost: number };

export type RoutingResult = {
  routes: Route[];
  exitLoad: Record<string, number>;
  exitIds: string[];
  computeMs: number;
};

export type UIAdapter = {
  totalPeople: number;
  blockedRoutes: number;
  dangerX: number; dangerY: number;
  exitLoads: Record<string, number>;
  exitPcts: Record<string, number>;
  routeOverlays: { userId: string; exitId: string; points: XY[]; style: 'safe'|'congested'|'alternate'; color: string }[];
  peopleDots: { id: string; x: number; y: number; color: string }[];
};

// Seeded PRNG (mulberry32)
function rngFromSeed(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// Build grid nodes and 4-neighbor edges
function buildGridGraph(rows: number, cols: number): { nodes: Node[]; edges: Edge[]; edgeSet: Set<string> } {
  const nodes: Node[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      nodes.push({ id, r, c, pct: { x: (c / (cols - 1)) * 100, y: (r / (rows - 1)) * 100 } });
    }
  }
  const edges: Edge[] = [];
  const set = new Set<string>();
  const add = (a: number, b: number) => { const k = a < b ? `${a}-${b}` : `${b}-${a}`; if (!set.has(k)) { set.add(k); edges.push({ a, b }); } };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      if (r + 1 < rows) add(id, (r + 1) * cols + c);
      if (c + 1 < cols) add(id, r * cols + (c + 1));
    }
  }
  return { nodes, edges, edgeSet: set };
}

function neighborsOf(id: number, edges: Edge[]): number[] {
  const out: number[] = [];
  for (const e of edges) {
    if (e.a === id) out.push(e.b);
    else if (e.b === id) out.push(e.a);
  }
  return out;
}

function isConnected(nodes: Node[], edges: Edge[]): boolean {
  if (!nodes.length) return true;
  const seen = new Set<number>();
  const q = [nodes[0].id]; seen.add(nodes[0].id);
  while (q.length) {
    const v = q.shift()!;
    for (const n of neighborsOf(v, edges)) if (!seen.has(n)) { seen.add(n); q.push(n); }
  }
  return seen.size === nodes.length;
}

function removeEdgesWithConnectivity(rng: () => number, nodes: Node[], edges: Edge[], targetRemovals: number): Edge[] {

  let removed = 0;
  let tries = 0;
  const maxTries = edges.length * 3;
  while (removed < targetRemovals && tries++ < maxTries && edges.length > 0) {
    const idx = Math.floor(rng() * edges.length);
    const saved = edges[idx];
    edges.splice(idx, 1);
    if (!isConnected(nodes, edges)) {
      edges.splice(idx, 0, saved);
      continue;
    }
    removed++;
  }
  return edges;
}

function chooseBoundaryExits(rng: () => number, nodes: Node[], rows: number, cols: number, count: number): Exit[] {
  const boundary = nodes.filter(n => n.r === 0 || n.c === 0 || n.r === rows - 1 || n.c === cols - 1);
  const exits: Exit[] = [];
  const labels = ['A','B','C','D','E','F'];
  // farthest-point sampling along boundary to spread exits
  const pick = () => boundary[Math.floor(rng() * boundary.length)];
  let first = pick();
  exits.push({ id: labels[0], node: first.id, label: `Exit ${labels[0]}` });
  while (exits.length < count) {
    let best: Node | null = null; let bestMinDist = -1;
    for (let i = 0; i < 200; i++) { // sample
      const cand = pick();
      const mind = Math.min(...exits.map(e => Math.abs(nodes[e.node].r - cand.r) + Math.abs(nodes[e.node].c - cand.c)));
      if (mind > bestMinDist) { bestMinDist = mind; best = cand; }
    }
    if (best) {
      const lbl = labels[exits.length];
      exits.push({ id: lbl, node: best.id, label: `Exit ${lbl}` });
    } else {
      const lbl = labels[exits.length];
      const cand = pick();
      exits.push({ id: lbl, node: cand.id, label: `Exit ${lbl}` });
    }
  }
  return exits;
}

function pickIncident(rng: () => number, nodes: Node[], exits: Exit[], rows: number, cols: number): Incident {
  const exitSet = new Set(exits.map(e => e.node));
  const interior = nodes.filter(n => n.r>1 && n.c>1 && n.r<rows-2 && n.c<cols-2 && !exitSet.has(n.id));
  const n = interior[Math.floor(rng()*interior.length)];
  const radius = 2 + Math.floor(rng()*4); // 2..5
  const sevRand = rng();
  const severity: Incident['severity'] = sevRand < 0.33 ? 'low' : sevRand < 0.66 ? 'medium' : 'high';
  return { node: n.id, radius, severity };
}

function placeCongestion(rng: () => number, nodes: Node[], edges: Edge[], countZones: number): { node: number; weight: number }[] {
  // Choose degree-2 corridor-like nodes
  const deg = new Map<number, number>();
  for (const n of nodes) deg.set(n.id, 0);
  for (const e of edges) { deg.set(e.a, (deg.get(e.a) || 0) + 1); deg.set(e.b, (deg.get(e.b) || 0) + 1); }
  const corridor = nodes.filter(n => (deg.get(n.id) || 0) === 2);
  const zones: { node:number; weight:number }[] = [];
  const picked = new Set<number>();
  const zoneCount = clamp(countZones, 1, 2);
  for (let z = 0; z < zoneCount; z++) {
    if (!corridor.length) break;
    const center = corridor[Math.floor(rng()*corridor.length)];
    const radius = 2 + Math.floor(rng()*3);
    const weight = Math.round((1.2 + rng()*1.3)*10)/10; // 1.2..2.5
    for (const n of nodes) {
      const d = Math.abs(n.r - center.r) + Math.abs(n.c - center.c);
      if (d <= radius && !picked.has(n.id)) {
        picked.add(n.id);
        zones.push({ node: n.id, weight });
      }
    }
  }
  return zones;
}

function isInsideIncident(n: Node, inc: Incident, nodes: Node[]): boolean {
  const c = nodes[inc.node];
  const d = Math.abs(n.r - c.r) + Math.abs(n.c - c.c);
  return d <= inc.radius;
}

type DijkstraResult = { dist: Map<number, number>; prev: Map<number, number> };

function dijkstra(
  nodes: Node[],
  edges: Edge[],
  blocked: Set<string>,
  costAtNode: (id: number) => number,
  start: number,
): DijkstraResult {
  const dist = new Map<number, number>();
  const prev = new Map<number, number>();
  const visited = new Set<number>();
  const pq: [number, number][] = []; // [distance, node]
  const push = (d: number, u: number) => { pq.push([d,u]); pq.sort((a,b)=>a[0]-b[0]); };
  for (const n of nodes) dist.set(n.id, Infinity);
  dist.set(start, 0); push(0, start);
  const edgeKey = (a:number,b:number)=> a<b?`${a}-${b}`:`${b}-${a}`;
  while (pq.length) {
    const [d,u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (d> (dist.get(u) || Infinity)) continue;
    for (const v of neighborsOf(u, edges)) {
      const k = edgeKey(u,v);
      if (blocked.has(k)) continue;
      const w = 1 * costAtNode(v); // base distance 1 per edge * node penalties
      const nd = d + w;
      if (nd < (dist.get(v) || Infinity)) {
        dist.set(v, nd); prev.set(v, u); push(nd, v);
      }
    }
  }
  return { dist, prev };
}

function reconstructPath(prev: Map<number, number>, goal: number, start: number): number[] | null {
  if (!prev.has(goal) && goal !== start) return null;
  const out: number[] = [goal];
  let cur = goal;
  while (cur !== start) {
    const p = prev.get(cur);
    if (p === undefined) return null;
    out.push(p); cur = p;
  }
  out.reverse();
  return out;
}

function validateConnectivityToAnyExit(_nodes: Node[], edges: Edge[], blocked: Set<string>, exits: Exit[]): boolean {
  // BFS from first exit and ensure all exits reachable; people connectivity validated later
  if (!exits.length) return false;
  const start = exits[0].node;
  const seen = new Set<number>();
  const q = [start]; seen.add(start);
  const edgeKey = (a:number,b:number)=> a<b?`${a}-${b}`:`${b}-${a}`;
  while (q.length) {
    const u = q.shift()!;
    for (const v of neighborsOf(u, edges)) {
      if (seen.has(v)) continue; if (blocked.has(edgeKey(u,v))) continue; seen.add(v); q.push(v);
    }
  }
  // All exits must be in seen
  return exits.every(e => seen.has(e.node));
}

const INCIDENT_PEN = { low: 6.0, medium: 12.0, high: 20.0 } as const; // very high multiplier inside radius

// Approximate corridor zones in percent space (match existing UI corridors)
const ZONES = [
  { x: 17, y: 17, w: 24, h: 51 },
  { x: 45, y: 20, w: 28, h: 44 },
  { x: 27, y: 57, w: 31, h: 14 },
];
function insideZones(p: XY): boolean {
  return ZONES.some(z => p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h);
}

// Configurable pacing parameters
export const NETRA_PACING = {
  simulation_speed: 1.0,               // global multiplier
  agent_step_ms_min: 800,              // ~0.8s per step
  agent_step_ms_max: 1800,             // ~1.8s per step for more varied pacing
  spawn_delay_min: 500,                // per-cluster spawn wait
  spawn_delay_max: 1000,
  think_delay_ms_min: 2000,            // AI thinking
  think_delay_ms_max: 3000,
  route_draw_time_ms: 5000,            // UI route drawing
};

// Load base layout templates (bundled JSON in repo)
type LayoutTemplate = { name: string; rows: number; cols: number; zones: {x:number;y:number;w:number;h:number}[]; deactivateEdges: [number,number,number,number][]; exitCandidates: [number,number][] };
const LAYOUTS: LayoutTemplate[] = [];
try { LAYOUTS.push(require('./layouts/mall.json')); } catch {}
try { LAYOUTS.push(require('./layouts/airport.json')); } catch {}
try { LAYOUTS.push(require('./layouts/office.json')); } catch {}

export function generateScenarioAndRoute(seed?: number) {
  // Deterministic but new each click (seed defaults to Date.now())
  const baseSeed = (typeof seed === 'number' ? seed : Date.now()) >>> 0;
  const rand = rngFromSeed(baseSeed);

  // STATE 2 — BUILDING GRAPH GENERATION
  // Select a base layout template for realism and variety
  const tpl = LAYOUTS.length ? LAYOUTS[Math.floor(rand()*LAYOUTS.length)] : { name:'default', rows: 20, cols: 20, zones: [ {x:17,y:17,w:24,h:51}, {x:45,y:20,w:28,h:44}, {x:27,y:57,w:31,h:14} ], deactivateEdges: [], exitCandidates: [[0,10],[19,10],[10,0],[10,19]] };
  const rows = tpl.rows;
  const cols = tpl.cols;
  let { nodes, edges } = buildGridGraph(rows, cols);
  // Remove edges to reach avg degree ~2.5 while staying connected
  const targetEdges = Math.round(nodes.length * 2.5); // since undirected, edges ~ nodes*avgDegree/2 => targetEdges ~ nodes*2.5/2, but we'll keep higher to ensure cycles
  const removals = clamp(edges.length - targetEdges, Math.floor(edges.length*0.05), Math.floor(edges.length*0.15));
  edges = removeEdgesWithConnectivity(rand, nodes, edges, removals);
  // Apply template-specific deactivations with connectivity guard
  const eKey = (a:number,b:number)=> a<b?`${a}-${b}`:`${b}-${a}`;
  const toIdx = (r:number,c:number)=> r*cols + c;
  const blockedTemplate = new Set<string>();
  for (const [r1,c1,r2,c2] of tpl.deactivateEdges || []) {
    const a = toIdx(r1,c1), b = toIdx(r2,c2);
    const k = eKey(a,b);
    if (!edges.find(e => (e.a===a&&e.b===b) || (e.a===b&&e.b===a))) continue;
    blockedTemplate.add(k);
  }
  // Remove template edges if connectivity preserved
  for (const k of Array.from(blockedTemplate)) {
    const [a,b] = k.split('-').map(n=>parseInt(n,10));
    const idx = edges.findIndex(e => (e.a===a&&e.b===b)||(e.a===b&&e.b===a));
    if (idx>=0) {
      const saved = edges[idx];
      edges.splice(idx,1);
      if (!isConnected(nodes, edges)) edges.splice(idx,0,saved);
    }
  }

  // STATE 5 — EXIT PLACEMENT — fixed 4 exits to align with UI bars
  const exitCount = 4;
  // Pick exits from template candidates if available
  let exits: Exit[];
  if (tpl.exitCandidates?.length) {
    const sample: number[][] = [];
    // Farthest-first on candidates
    const pick = () => tpl.exitCandidates[Math.floor(rand()*tpl.exitCandidates.length)];
    const first = pick();
    sample.push(first);
    while (sample.length < exitCount) {
      let best: number[] | null = null; let bestMin = -1;
      for (let i=0;i<100;i++) {
        const cand = pick();
        const mind = Math.min(...sample.map(s => Math.abs(s[0]-cand[0]) + Math.abs(s[1]-cand[1])));
        if (mind > bestMin) { bestMin = mind; best = cand; }
      }
      sample.push(best || pick());
    }
    exits = sample.slice(0, exitCount).map((rc, i) => ({ id: ['A','B','C','D','E','F'][i], node: rc[0]*cols + rc[1], label: `Exit ${['A','B','C','D','E','F'][i]}` }));
  } else {
    exits = chooseBoundaryExits(rand, nodes, rows, cols, exitCount);
  }
  // Prefer exits that project inside corridor areas (improves visual realism)
  const zoneExits = exits.filter(e => insideZones(nodes[e.node].pct));
  if (zoneExits.length >= Math.min(3, exitCount)) exits = zoneExits.concat(exits.filter(e => !zoneExits.includes(e))).slice(0, exitCount);

  // STATE 3 — INCIDENT PLACEMENT
  const incident = pickIncident(rand, nodes, exits, rows, cols);

  // STATE 6 — PATH CONDITIONS
  const edgeKey = (a:number,b:number)=> a<b?`${a}-${b}`:`${b}-${a}`;
  const blocked = new Set<string>();
  
  // Incident severity impacts nearby structures aggressively
  if (incident.severity === 'high' || incident.severity === 'medium') {
    for (const e of edges) {
      if (e.a === incident.node || e.b === incident.node) {
        if (rand() > 0.4) {
          const k = edgeKey(e.a, e.b);
          if (!blocked.has(k)) {
            blocked.add(k);
            if (!validateConnectivityToAnyExit(nodes, edges, blocked, exits)) blocked.delete(k);
          }
        }
      }
    }
  }

  // Blocked edges extra randomized 1..5 ensuring exits remain reachable
  const maxBlocked = Math.floor(rand()*5) + 1;
  let trials = 0;
  while (blocked.size < maxBlocked && trials++ < 200) {
    const e = edges[Math.floor(rand()*edges.length)];
    const k = edgeKey(e.a, e.b);
    if (blocked.has(k)) continue;
    blocked.add(k);
    if (!validateConnectivityToAnyExit(nodes, edges, blocked, exits)) {
      blocked.delete(k);
      continue;
    }
  }

  // Congestion zones 1..3 for more variety
  const congestion_nodes = placeCongestion(rand, nodes, edges, 1 + Math.floor(rand()*3));

  // Routing node cost
  const costAtNode = (id:number) => {
    const n = nodes[id];
    let mult = 1.0;
    const cz = congestion_nodes.find(z => z.node === id);
    if (cz) mult *= cz.weight;
    if (isInsideIncident(n, incident, nodes)) mult *= INCIDENT_PEN[incident.severity];
    if (!insideZones(n.pct)) mult *= 10.0; // strongly discourage off-corridor traversal
    return mult;
  };

  // STATE 4 — PEOPLE DISTRIBUTION (30..80) in clusters away from incident
  const peopleCount = 30 + Math.floor(rand()*51);
  const people: Person[] = [];
  const batches: string[][] = [];
  const clusterCount = clamp(Math.floor(peopleCount / 8), 3, 8);
  // Restrict to template zones for coherent visuals; fallback to incident-safe nodes if zones omitted
  const insideTplZones = (p: XY) => (tpl.zones||[]).some(z => p.x>=z.x && p.x<=z.x+z.w && p.y>=z.y && p.y<=z.y+z.h);
  const candidate = nodes.filter(n => !isInsideIncident(n, incident, nodes) && (tpl.zones?.length ? insideTplZones(n.pct) : true));
  for (let k = 0; k < clusterCount; k++) {
    const center = candidate[Math.floor(rand()*candidate.length)];
    const size = clamp(3 + Math.floor(rand()*10), 3, 12);
    const batch: string[] = [];
    for (let i = 0; i < size && people.length < peopleCount; i++) {
      const dx = Math.floor((rand()*5) - 2);
      const dy = Math.floor((rand()*5) - 2);
      const r = clamp(center.r + dy, 0, rows-1);
      const c = clamp(center.c + dx, 0, cols-1);
      const id = `user_${people.length+1}`;
      const node = r*cols + c;
      if (isInsideIncident({id:node,r,c,pct:{x:0,y:0}}, incident, nodes)) { continue; }
      people.push({ id, node });
      batch.push(id);
    }
    if (batch.length) batches.push(batch);
    if (people.length >= peopleCount) break;
  }
  // Top-up if underfilled
  while (people.length < peopleCount) {
    const n = candidate[Math.floor(rand()*candidate.length)];
    const id = `user_${people.length+1}`;
    people.push({ id, node: n.id });
    if (!batches.length) batches.push([]);
    batches[batches.length-1].push(id);
  }

  // STATE 7 — AI ROUTING ENGINE
  const t0 = performance.now();
  const exitIds = exits.map(e => e.id);
  const exitLoad: Record<string, number> = Object.fromEntries(exitIds.map(id => [id, 0]));
  const routes: Route[] = [];
  // Precompute dijkstra from each exit to speed queries
  const perExit: Record<string, DijkstraResult> = {};
  for (const e of exits) perExit[e.id] = dijkstra(nodes, edges, blocked, costAtNode, e.node);

  try {
    for (const p of people) {
      let best: { exit: string; cost: number; path: number[] } | null = null;
      for (const ex of exits) {
        const dj = perExit[ex.id];
        const cost = dj.dist.get(p.node) ?? Infinity;
        if (!isFinite(cost)) continue;
        // small load balancing term
        const eff = cost + exitLoad[ex.id] * 0.8;
        if (!best || eff < best.cost) {
          const path = reconstructPath(dj.prev, p.node, ex.node);
          if (!path) continue;
          best = { exit: ex.id, cost: eff, path: [...path].reverse() }; // path from person -> exit
        }
      }
      if (!best) {
        throw new Error('INVALID_SCENARIO_UNREACHABLE');
      }
      exitLoad[best.exit] += 1;
      const path_costs = best.path.map(nid => costAtNode(nid));
      routes.push({ person_id: p.id, exit_id: best.exit, path_nodes: best.path, path_costs, cost: Math.round(best.cost*10)/10 });
    }
  } catch (e) {
    return generateScenarioAndRoute((baseSeed + 1) >>> 0);
  }
  const computeMs = Math.round(performance.now() - t0);

  const scenario: Scenario = {
    building: { nodes, edges },
    people,
    exits,
    incident,
    blocked_edges: Array.from(blocked).map(k => { const [a,b] = k.split('-').map(x=>parseInt(x,10)); return { a, b }; }),
    congestion_nodes,
  };

  // Scenario validation — ensure overall connectivity and all routes exist
  if (!isConnected(nodes, edges) || !validateConnectivityToAnyExit(nodes, edges, blocked, exits)) {
    return generateScenarioAndRoute((baseSeed + 1) >>> 0); // simple reseed
  }

  // Adapt to UI
  const totalPeople = people.length;
  const pct = (n: number) => Math.round((n / totalPeople) * 100);
  const exitPcts = Object.fromEntries(Object.entries(exitLoad).map(([k,v]) => [k, pct(v)]));
  const incNode = nodes[incident.node];
  // Color mapping per exit
  const exitColor: Record<string, string> = { A: 'var(--accent-green)', B: 'var(--accent-blue)', C: 'var(--accent-yellow)', D: 'var(--accent-purple)', E: '#06b6d4', F: 'var(--accent-orange)' };

  const routeOverlays = routes.map(r => ({
    userId: r.person_id,
    exitId: r.exit_id,
    points: r.path_nodes.map(nid => nodes[nid].pct),
    style: 'safe' as const,
    color: exitColor[r.exit_id] || 'var(--accent-blue)'
  }));

  const peopleDots = people.map(p => ({ id: p.id, x: nodes[p.node].pct.x, y: nodes[p.node].pct.y, color: exitColor[(routes.find(r=>r.person_id===p.id)||{exit_id:'B'}).exit_id] || 'var(--accent-blue)' }));

  const ui: UIAdapter = {
    totalPeople,
    blockedRoutes: scenario.blocked_edges.length,
    dangerX: incNode.pct.x, dangerY: incNode.pct.y,
    exitLoads: exitLoad,
    exitPcts: exitPcts as Record<string, number>,
    routeOverlays,
    peopleDots,
  };

  const result: RoutingResult = { routes, exitLoad, exitIds, computeMs };

  // eslint-disable-next-line no-console
  console.log('[NETRA]', { seed: baseSeed, rows, cols, people: people.length, exits: exits.length, blocked: scenario.blocked_edges.length, computeMs });

  return { scenario, result, ui, spawnBatches: batches } as any;
}
