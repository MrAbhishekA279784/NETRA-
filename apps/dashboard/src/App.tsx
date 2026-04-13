import { useState, useEffect } from 'react';
import { generateScenarioAndRoute, NETRA_PACING } from './engine';
import './index.css';

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

/* ═══════════════════════════════════════
   SVG ICON COMPONENTS 
   ═══════════════════════════════════════ */

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const WarningTriangle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const DashboardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
const MapIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
const PeopleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const AlertsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const AnalyticsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const SettingsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const UsersStatIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const DoorIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M14 9h1"/></svg>;
const ShieldCheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const AlertTriangleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TargetIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const TrendingIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12,color:'var(--accent-blue)'}}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;

/* ═══════════════════════════════════════
   ISOMETRIC MAP COMPONENT
   ═══════════════════════════════════════ */



// Legacy generateScenarioData retained for reference (unused after integration)
export const generateScenarioData = () => ({ totalPeople: 0, dangerX: 50, dangerY: 50, people: [], routes: { exitACongested: false, exitBCongested: false, alternateActive: false }, mapBlocked: [] });

const IsometricMap = ({ mapData, onGenerate }: { mapData: any, onGenerate: () => void }) => (
  <div className="map-canvas">
    {mapData.idle && (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, zIndex: 50 }}>
        <div style={{ fontWeight: 800, letterSpacing: 2, fontSize: 20, opacity: 0.95 }}>NETRA</div>
        <div style={{ opacity: 0.75 }}>Intelligent Crisis Awareness System</div>
        <div style={{ opacity: 0.6, fontSize: 12, marginTop: 4, marginBottom: 8 }}>Awaiting incident data...</div>
        <button className="regenerate-btn" onClick={onGenerate}>Generate Scenario</button>
      </div>
    )}
    {/* SVG Building Structure */}
    <svg className="building-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        {/* Gradients for 3D walls */}
        <linearGradient id="wallSideGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(15,23,42,0.95)"/>
          <stop offset="100%" stopColor="rgba(30,41,59,0.85)"/>
        </linearGradient>
        <linearGradient id="wallTopGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(40,55,75,0.7)"/>
          <stop offset="50%" stopColor="rgba(25,35,55,0.65)"/>
          <stop offset="100%" stopColor="rgba(15,23,42,0.9)"/>
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(20,30,50,0.4)"/>
          <stop offset="100%" stopColor="rgba(10,15,30,0.6)"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Grid */}
      <g opacity="0.1">
        {Array.from({length:25}, (_,i) => <line key={`h${i}`} x1="5" y1={5+i*3.8} x2="95" y2={5+i*3.8} stroke="#3B82F6" strokeWidth="0.08"/>)}
        {Array.from({length:25}, (_,i) => <line key={`v${i}`} x1={5+i*3.8} y1="5" x2={5+i*3.8} y2="95" stroke="#3B82F6" strokeWidth="0.08"/>)}
      </g>

      {/* ── 3D BUILDING STRUCTURE ── */}
      <g transform="translate(2,2) skewY(-2) skewX(2)">
        {/* Wall Depth Extrusion Components */}
        {/* West Wing Depth */}
        <polygon points="15,15 15,70 14,71 14,16" fill="url(#wallSideGrad)" opacity="0.85" />
        <rect x="15" y="15" width="28" height="55" rx="1.5" fill="url(#wallTopGrad)" stroke="rgba(180,190,210,0.3)" strokeWidth="0.5"/>
        <rect x="16" y="16" width="26" height="53" rx="1" fill="url(#floorGrad)"/>
        
        {/* East Wing Depth */}
        <polygon points="43,18 43,66 42,67 42,19" fill="url(#wallSideGrad)" opacity="0.85" />
        <rect x="43" y="18" width="32" height="48" rx="1.5" fill="url(#wallTopGrad)" stroke="rgba(180,190,210,0.3)" strokeWidth="0.5"/>
        <rect x="44" y="19" width="30" height="46" rx="1" fill="url(#floorGrad)"/>
        
        {/* South Wing Depth */}
        <polygon points="25,55 25,73 24,74 24,56" fill="url(#wallSideGrad)" opacity="0.85" />
        <rect x="25" y="55" width="35" height="18" rx="1.5" fill="url(#wallTopGrad)" stroke="rgba(180,190,210,0.3)" strokeWidth="0.5"/>
        <rect x="26" y="56" width="33" height="16" rx="1" fill="url(#floorGrad)"/>

        {/* Interior Corridor Depth Strips */}
        <g opacity="0.2">
          <rect x="16" y="28" width="26" height="4" fill="rgba(0,0,0,0.2)"/>
          <rect x="16" y="43" width="26" height="4" fill="rgba(0,0,0,0.2)"/>
          <rect x="44" y="33" width="30" height="4" fill="rgba(0,0,0,0.2)"/>
          <rect x="44" y="48" width="30" height="4" fill="rgba(0,0,0,0.2)"/>
          <rect x="28" y="16" width="4" height="52" fill="rgba(0,0,0,0.18)"/>
          <rect x="42" y="19" width="4" height="46" fill="rgba(0,0,0,0.2)"/>
          <rect x="57" y="19" width="4" height="46" fill="rgba(0,0,0,0.18)"/>
        </g>

        {/* Interior Corridor Guidelines */}
        <g opacity="0.35" stroke="rgba(148,163,184,0.5)" strokeWidth="0.35">
          <line x1="29" y1="16" x2="29" y2="69" />
          <line x1="16" y1="30" x2="42" y2="30" />
          <line x1="16" y1="45" x2="42" y2="45" />
          <line x1="44" y1="35" x2="74" y2="35" />
          <line x1="58" y1="19" x2="58" y2="65" />
        </g>

        {/* Shop Partitions (Realistic depth) */}
        <g fill="rgba(8,12,22,0.75)" stroke="rgba(148,163,184,0.22)" strokeWidth="0.4">
          <rect x="17" y="17" width="10" height="11" rx="0.6" />
          <rect x="17" y="32" width="10" height="11" rx="0.6" />
          <rect x="31" y="17" width="10" height="11" rx="0.6" />
          <rect x="31" y="32" width="10" height="11" rx="0.6" />
          <rect x="45" y="20" width="11" height="13" rx="0.6" />
          <rect x="45" y="37" width="11" height="11" rx="0.6" />
          <rect x="61" y="20" width="12" height="13" rx="0.6" />
          <rect x="61" y="37" width="12" height="11" rx="0.6" />
          <rect x="27" y="57" width="12" height="11" rx="0.6" />
          <rect x="44" y="57" width="14" height="11" rx="0.6" />
        </g>
        
        {/* Subtle window indicators on exterior walls */}
        <g fill="rgba(59,130,246,0.18)" rx="0.3">
          <rect x="19" y="22" width="5" height="2.5" rx="0.4"/>
          <rect x="19" y="38" width="5" height="2.5" rx="0.4"/>
          <rect x="19" y="52" width="5" height="2.5" rx="0.4"/>
          <rect x="48" y="24" width="6" height="2.5" rx="0.4"/>
          <rect x="68" y="24" width="5" height="2.5" rx="0.4"/>
          <rect x="48" y="42" width="6" height="2.5" rx="0.4"/>
          <rect x="68" y="42" width="5" height="2.5" rx="0.4"/>
        </g>
      </g>

      {/* ── EVACUATION ROUTES ── */}
      {/* If dynamic overlays exist, render them; otherwise keep decorative defaults; hidden in IDLE */}
      {!mapData.idle && (Array.isArray(mapData.routeOverlays) && mapData.routeOverlays.length > 0 ? (
        <g>
          {mapData.routeOverlays.map((r: any, idx: number) => {
            const color = r.color || (r.style === 'safe' ? '#4ADE80' : r.style === 'congested' ? '#F59E0B' : '#A78BFA');
            const dash = r.style === 'safe' ? '1.5 0.6' : '1.2 0.5';
            const d = r.points.map((pt: any) => `${pt.x},${pt.y}`).join(' ');
            return (
              <g key={idx} filter={r.style === 'safe' ? 'url(#glowStrong)' : 'url(#glow)'}>
                <polyline points={d} stroke={color} strokeWidth={r.style === 'safe' ? 0.9 : 0.8} fill="none" strokeDasharray={dash} opacity={0.95} strokeLinecap="round"/>
              </g>
            );
          })}
        </g>
      ) : (
        <>
          <g filter="url(#glowStrong)">
            <path d="M38 32 C38 25, 42 20, 45 13" stroke="#4ADE80" strokeWidth="0.9" fill="none" strokeDasharray="1.5 0.6" strokeLinecap="round" opacity="0.95"/>
            <path d="M55 35 Q65 30, 78 28" stroke="#4ADE80" strokeWidth="0.9" fill="none" strokeDasharray="1.5 0.6" strokeLinecap="round" opacity="0.95"/>
            <path d="M28 38 Q22 40, 13 45" stroke="#4ADE80" strokeWidth="0.9" fill="none" strokeDasharray="1.5 0.6" strokeLinecap="round" opacity="0.95"/>
            <path d="M42 55 L42 62 L46 74" stroke="#4ADE80" strokeWidth="0.9" fill="none" strokeDasharray="1.5 0.6" strokeLinecap="round" opacity="0.95"/>
          </g>
          <g filter="url(#glow)">
            {mapData.routes?.exitACongested && (
              <path d="M38 32 C38 25, 42 20, 45 13" stroke="#FBBF24" strokeWidth="0.7" fill="none" strokeDasharray="1.2 0.5" opacity="0.85"/>
            )}
            {mapData.routes?.exitBCongested && (
              <path d="M42 55 L42 62 L46 74" stroke="#F59E0B" strokeWidth="0.7" fill="none" strokeDasharray="1.2 0.5" opacity="0.85"/>
            )}
          </g>
          {mapData.routes?.alternateActive && (
            <g filter="url(#glow)">
              <path d="M35 48 Q25 55, 18 65" stroke="#A78BFA" strokeWidth="0.8" fill="none" strokeDasharray="1.2 0.5" opacity="0.9"/>
            </g>
          )}
        </>
      ))}
      
      {/* Route arrow indicators */}
      <g opacity="0.7">
        <polygon points="44,13 46.5,15 41.5,15" fill="#4ADE80"/>
        <polygon points="77,28 79.5,29.5 77,31" fill="#4ADE80"/>
        <polygon points="13,45 15.5,44 15.5,46" fill="#4ADE80"/>
        <polygon points="46,74 48.5,73 43.5,73" fill="#4ADE80"/>
      </g>
    </svg>

    {/* ── PEOPLE DOTS (Boundary Constrained) ── */}
    {!mapData.idle && mapData.people?.map((p: any, i: number) => {
      const jitterX = Math.sin(i * 45.2) * 1.2;
      const jitterY = Math.cos(i * 45.2) * 1.2;
      return (
        <div
          key={i}
          className={`people-dot ${p.color}`}
          style={{ left: `calc(${p.x}% + ${jitterX}px)`, top: `calc(${p.y}% + ${jitterY}px)`, animationDelay: `${(i * 123) % 1500}ms`, background: p.fill || undefined, boxShadow: p.shadow || undefined }}
        />
      );
    })}

    {/* ── BLOCKED MARKERS ── */}
    {!mapData.idle && mapData.mapBlocked?.map((m: any, i: number) => (
      <div key={i} className="blocked-marker" style={{left: `${m.x}%`, top: `${m.y}%`}}>✕</div>
    ))}

    {/* ── BLAST ZONE ── */}
    {!mapData.idle && (
    <div className="blast-zone" style={{ left: `${mapData.dangerX}%`, top: `${mapData.dangerY}%` }}>
      <div className="blast-ripple"></div>
      <div className="blast-ripple-outer"></div>
      <div className="blast-center">
        <div className="blast-icon-circle"><WarningTriangle /></div>
        <div className="blast-label">INCIDENT DETECTED</div>
      </div>
    </div>
    )}

    {/* ── EXIT MARKERS ── */}
    {!mapData.idle && Array.isArray(mapData.exits) && mapData.exits.map((e: any, i: number) => (
      <div key={i} className="exit-marker" style={{top: `${e.y}%`, left: `${e.x}%`, borderColor: e.color || 'var(--accent-green)'}}><div className="exit-title" style={{color: e.color || 'var(--accent-green)'}}>{e.label}</div></div>
    ))}

    {/* ── HEATMAP LEGEND ── */}
    <div className="heatmap-legend">
      <div className="heatmap-bar"></div>
      <div className="heatmap-range"><span>High Density</span><span>Low</span></div>
    </div>

    {/* ── MAP BOTTOM CONTROLS ── */}
    <div className="map-bottom-bar">
      <div className="map-legend">
        <div className="legend-item"><div className="legend-dot" style={{background:'var(--accent-blue)'}}></div> People</div>
        <div className="legend-item"><div className="legend-line" style={{background:'var(--accent-green)'}}></div> Route</div>
        <div className="legend-item"><div className="legend-dot" style={{background:'var(--accent-yellow)'}}></div> Traffic</div>
        <div className="legend-item"><span className="legend-x">✕</span> Blocked</div>
      </div>
      <div className="map-btns">
        <button className="map-btn">2D</button>
        <button className="map-btn active">3D</button>
        <div className="map-btn-icon"><TargetIcon /></div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════ */

export default function App() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation refs to avoid excessive renders
  type Agent = { userId: string; exitId: string; path: { x: number; y: number }[]; path_costs?: number[]; step: number; baseDelay: number; acc: number; style: 'safe'|'congested'|'alternate' };
  const _w = window as any;
  const simTimerRef = _w.NETRA_SIM_TIMER ?? { current: null as any };
  _w.NETRA_SIM_TIMER = simTimerRef; // ensure hot-reload safe
  const lastTickRef = _w.NETRA_LAST_TICK ?? { current: 0 };
  _w.NETRA_LAST_TICK = lastTickRef;
  const agentsRef = _w.NETRA_AGENTS ?? { current: [] as Agent[] };
  _w.NETRA_AGENTS = agentsRef;
  const completedRef = _w.NETRA_COMPLETED ?? { current: [] as Agent[] };
  _w.NETRA_COMPLETED = completedRef;
  const metaRef = _w.NETRA_META ?? { current: null as any };
  _w.NETRA_META = metaRef;

  const [data, setData] = useState({
    totalPeople: 50,
    evacuated: 12,
    blockedRoutes: 3,
    dangerX: 50,
    dangerY: 50,
    people: [] as any[],
    exits: [] as any[],
    exitA: 14, pctA: 28,
    exitB: 16, pctB: 32,
    exitC: 10, pctC: 20,
    exitD: 10, pctD: 20,
    alerts: [
      { id: 1, type: 'danger', icon: <AlertTriangleIcon />, title: 'Blast detected at 04:38 PM', desc: 'City Mall, Food Court Area', time: '00:02 ago' },
      { id: 2, type: 'warning', icon: <WarningTriangle />, title: 'Exit B Congested', desc: 'Rerouting in progress', time: '00:15 ago' },
      { id: 3, type: 'info', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>, title: 'Exit C Blocked', desc: 'Debris on pathway', time: '00:45 ago' }
    ],
    activity: [
      { id: 1, user: 'User 23', iconColor: '', text: <>Route assigned: <strong>Exit B</strong></>, time: '4:39 PM' },
      { id: 2, user: 'User 07', iconColor: 'var(--accent-green)', text: <>Evacuated via <strong>Exit A</strong></>, time: '4:38 PM' },
      { id: 3, user: 'User 11', iconColor: 'var(--accent-purple)', text: <>SMS sent (Exit C)</>, time: '4:38 PM' },
    ],
    routes: { exitACongested: false, exitBCongested: false, alternateActive: false },
    mapBlocked: [ {x: 62, y: 48}, {x: 35, y: 62} ],
    idle: true
  });

  useEffect(() => {
    // Start in IDLE state; do not auto-generate
  }, []);

  const updateScenario = () => {
    const { scenario, result, ui, spawnBatches } = generateScenarioAndRoute();

    // Build initial people state with IDs for stable tracking
    // State 0 → 1: clear map to IDLE-like then progressively show people spawn batches
    const ppl: any[] = [];

    const newAlerts = [
      { id: Math.random(), type: 'danger', icon: <AlertTriangleIcon />, title: `Blast detected near Sector ${Math.floor(Math.random()*5+1)}`, desc: 'City Mall, Level ' + Math.floor(Math.random()*3+1), time: '00:01 ago' },
      { id: Math.random(), type: 'info', icon: <ShieldCheckIcon />, title: 'Exits Nominal', desc: 'Balanced distribution', time: 'Now' },
      { id: Math.random(), type: 'info', icon: <ShieldCheckIcon />, title: `Routing Completed`, desc: `${result.computeMs} ms`, time: 'Just now' }
    ];

    const newActivity = [
      { id: Math.random(), user: 'System', iconColor: '', text: <>Assigned routes to <strong>{ui.totalPeople}</strong> users</>, time: 'Now' },
      { id: Math.random(), user: 'System', iconColor: 'var(--accent-green)', text: <>Simulation starting</>, time: 'Now' },
    ];

    const exitColor: Record<string, string> = { A: 'var(--accent-green)', B: 'var(--accent-blue)', C: 'var(--accent-yellow)', D: 'var(--accent-purple)', E: '#06b6d4', F: 'var(--accent-orange)' };

    setData({
      totalPeople: ui.totalPeople,
      evacuated: 0,
      blockedRoutes: ui.blockedRoutes,
      dangerX: ui.dangerX,
      dangerY: ui.dangerY,
      people: ppl,
      exits: (scenario.exits as any[]).map((e:any) => ({ label: e.label, x: scenario.building.nodes[e.node].pct.x, y: scenario.building.nodes[e.node].pct.y, color: exitColor[e.id] || 'var(--accent-blue)' })),
      exitA: ui.exitLoads.A, pctA: ui.exitPcts.A,
      exitB: ui.exitLoads.B, pctB: ui.exitPcts.B,
      exitC: ui.exitLoads.C, pctC: ui.exitPcts.C,
      exitD: ui.exitLoads.D, pctD: ui.exitPcts.D,
      alerts: newAlerts,
      activity: newActivity,
      routes: { exitACongested: false, exitBCongested: false, alternateActive: Object.values(result.exitLoad).filter((v:any)=>v>0).length>1 },
      mapBlocked: (scenario.blocked_edges as any[]).map((be:any) => scenario.building.nodes[be.a].pct),
      routeOverlays: ui.routeOverlays.map((r: any) => ({ ...r, points: r.points.slice(0, 1) })),
      idle: false,
    } as any);

    // Batch-spawn people clusters (200–400ms between clusters)
    const revealBatches = async () => {
      for (const batch of (spawnBatches as string[][])) {
        await new Promise(res => setTimeout(res, NETRA_PACING.spawn_delay_min + Math.floor(Math.random() * (NETRA_PACING.spawn_delay_max - NETRA_PACING.spawn_delay_min + 1))));
        setData(prev => {
          const current = new Set(prev.people.map((p:any)=>p.id));
          const additions = (ui.peopleDots as any[]).filter(pd => batch.includes(pd.id) && !current.has(pd.id));
          return { ...prev, people: [...prev.people, ...additions.map(a => ({ id: a.id, x: a.x, y: a.y, color: '', fill: a.color, shadow: `0 0 6px ${a.color}` }))] } as any;
        });
      }
    };
    void revealBatches();

    // Initialize simulation agents from routing result
    agentsRef.current = (result.routes as any[]).map((r: any) => ({
      userId: r.person_id,
      exitId: r.exit_id,
      path: (r.path_nodes as number[]).map((nid: number) => scenario.building.nodes[nid].pct),
      path_costs: r.path_costs,
      step: 0,
      baseDelay: NETRA_PACING.agent_step_ms_min + Math.floor(Math.random() * (NETRA_PACING.agent_step_ms_max - NETRA_PACING.agent_step_ms_min + 1)),
      acc: Math.floor(Math.random() * 1200), // 0–1200ms stagger start
      style: 'safe'
    }));
    completedRef.current = [];
    metaRef.current = { routes: result.routes, exits: scenario.exits, nodes: scenario.building.nodes };
    const thinkDelay = NETRA_PACING.think_delay_ms_min + Math.floor(Math.random() * (NETRA_PACING.think_delay_ms_max - NETRA_PACING.think_delay_ms_min + 1));
    setTimeout(() => startSimulation(), thinkDelay);
  };

  // Simulation controller
  const startSimulation = () => {
    setIsSimulating(true);
    if (simTimerRef.current) return; // already running
    lastTickRef.current = performance.now();
    simTimerRef.current = window.setInterval(() => {
      const now = performance.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!agentsRef.current.length) {
        // Nothing to simulate
        pauseSimulation();
        setIsSimulating(false);
        // Append completion summary to activity log
        const meta = metaRef.current;
        if (meta) {
          const avgDist = (() => {
            const rs = meta.routes as any[];
            if (!rs?.length) return 0;
            const sum = rs.reduce((a:number,r:any)=> a + (r.path_nodes?.length || 0), 0);
            return Math.round((sum / rs.length) * 10) / 10;
          })();
          const exitsUsed = (() => {
            const count: Record<string, number> = {};
            for (const r of meta.routes as any[]) count[r.exit_id] = (count[r.exit_id]||0)+1;
            return Object.entries(count).map(([k,v])=>`Exit ${k}: ${v}`).join('  ');
          })();
          setData(prev => ({
            ...prev,
            activity: [
              { id: Math.random(), user: 'System', iconColor: '', text: <>Simulation complete — <strong>{prev.evacuated}</strong> evacuated</>, time: 'Now' },
              { id: Math.random(), user: 'System', iconColor: '', text: <>Avg. route steps: <strong>{avgDist}</strong></>, time: 'Now' },
              { id: Math.random(), user: 'System', iconColor: '', text: <>{exitsUsed}</>, time: 'Now' },
              ...prev.activity
            ].slice(0, 12)
          } as any));
        }
        return;
      }

      // Advance agents with per-agent delays
      let evacuatedInc = 0;
      const exitDelta: Record<string, number> = {};
      const moved: { id: string; x: number; y: number }[] = [];
      const overlays: any[] = [];
      const remainingAgents: Agent[] = [];

      for (const a of agentsRef.current) {
        let step = a.step;
        let acc = a.acc + dt;
        while (step < a.path.length - 1) {
          // Calculate dynamic delay based on current node cost
          const localCost = (a.path_costs && a.path_costs[step]) ? a.path_costs[step] : 1;
          const currentDelay = a.baseDelay * Math.max(1, localCost * 0.4); // apply penalty constraint

          if (acc >= currentDelay) {
            acc -= currentDelay;
            step += 1;
            break; // advance max one node per render frame for smooth drawing
          } else {
            break;
          }
        }

        if (step >= a.path.length - 1) {
          // Arrived
          completedRef.current.push({ ...a, step: a.path.length - 1, acc });
          evacuatedInc += 1;
          exitDelta[a.exitId] = (exitDelta[a.exitId] || 0) + 1;
          // No overlay for completed (optional keep short marker)
          continue;
        }

        // Still active
        const cur = a.path[step];
        moved.push({ id: a.userId, x: cur.x, y: cur.y });
        overlays.push({ userId: a.userId, exitId: a.exitId, points: a.path.slice(0, step + 1), style: a.style });
        remainingAgents.push({ ...a, step, acc });
      }

      agentsRef.current = remainingAgents;

      if (evacuatedInc === 0 && moved.length === 0) return; // skip render if no change

      // Batch React state updates
      setData(prev => {
        // Update people positions and remove completed
        const idToPos = new Map(moved.map(m => [m.id, m] as const));
        const completedIds = new Set<string>(completedRef.current.map((c: any) => c.userId));
        const people = prev.people
          .filter((p: any) => !completedIds.has(p.id))
          .map((p: any) => {
            const m = idToPos.get(p.id);
            return m ? { ...p, x: m.x, y: m.y } : p;
          });

        // Update evacuated count
        const evacuated = prev.evacuated + evacuatedInc;

        // Update exit loads (remaining assigned to each exit)
        let { exitA, exitB, exitC, exitD } = prev as any;
        if (exitDelta['A']) exitA = Math.max(0, exitA - exitDelta['A']);
        if (exitDelta['B']) exitB = Math.max(0, exitB - exitDelta['B']);
        if (exitDelta['C']) exitC = Math.max(0, exitC - exitDelta['C']);
        if (exitDelta['D']) exitD = Math.max(0, exitD - exitDelta['D']);

        const pct = (n: number) => Math.round((n / prev.totalPeople) * 100);

        // Update overlays: merge moved segments, keep others, drop completed
        const prevOverlays = (prev as any).routeOverlays || [];
        const mapByUser = new Map<string, any>();
        for (const o of prevOverlays) mapByUser.set(o.userId, o);
        const completedIds2 = completedIds; // alias
        // remove completed
        for (const id of completedIds2) mapByUser.delete(id);
        // apply moved
        for (const o of overlays) mapByUser.set(o.userId, o);
        const routeOverlays = Array.from(mapByUser.values());

        // Activity: log evacuations
        let activity = prev.activity as any[];
        if (evacuatedInc > 0) {
          Object.entries(exitDelta).forEach(([k, count]) => {
            if (!count) return;
            activity = [
              { id: Math.random(), user: 'System', iconColor: 'var(--accent-green)', text: <>
                {count} evacuated via <strong>Exit {k}</strong>
              </>, time: 'Now' },
              ...activity
            ].slice(0, 10);
          });
        }

        return {
          ...prev,
          people,
          evacuated,
          exitA, pctA: pct(exitA),
          exitB, pctB: pct(exitB),
          exitC, pctC: pct(exitC),
          exitD, pctD: pct(exitD),
          routeOverlays,
          activity,
        } as any;
      });
    }, 90); // global tick ~90ms in 80–150ms band
  };

  const pauseSimulation = () => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
  };

  const resetSimulation = () => {
    pauseSimulation();
    agentsRef.current = [];
    completedRef.current = [];
    setIsSimulating(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup if component unmounts
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    };
  }, []);

  const handleRegenerate = () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    setProgress(0);
    resetSimulation();

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.floor(Math.random() * 5) + 3;
      });
    }, 50);

    setTimeout(() => {
      updateScenario();
      setIsRegenerating(false);
    }, 1200);
  };

  return (
    <div className="layout">
      
      {/* ═══ TOP NAVIGATION BAR ═══ */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-icon"><ShieldIcon /></div>
          <div className="logo-text">
            <div className="logo-title">NETRA CONTROL CENTER</div>
            <div className="logo-subtitle">AI EMERGENCY RESPONSE</div>
          </div>
        </div>

        <div className="topbar-center">
          <div className="alert-pill">
            <div className="alert-pill-icon"><WarningTriangle /></div>
            <div className="alert-text">
              <span className="alert-active">EMERGENCY ACTIVE</span>
              <span className="alert-desc-text">Blast detected &bull; City Mall, Pune</span>
            </div>
            <div className="alert-timer">00:02:45</div>
          </div>
        </div>

        <div className="topbar-right">
          <button 
            className={`regenerate-btn ${isRegenerating ? 'loading' : ''}`}
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshIcon />
            {isRegenerating ? 'REGENERATING...' : 'REGENERATE SCENARIO'}
          </button>
          <div className="weather-chip">
            <CloudIcon />
            <div className="weather-details">
              <span className="weather-temp">24&deg;C</span>
              <span className="weather-location">Pune, India</span>
            </div>
          </div>
          <div className="icon-btn"><BellIcon /></div>
          <div className="admin-chip">
            <div className="admin-avatar">AD</div>
            <div className="admin-details">
              <span className="admin-name">Admin</span>
              <span className="admin-role">Control Center</span>
            </div>
            <ChevronDown />
          </div>
        </div>
      </header>

      {/* ═══ MAIN BODY ═══ */}
      <div className="main-layout">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="sidebar">
          <div className="glass-panel nav-menu">
            <div className="nav-label">MAIN</div>
            <div className="nav-item active"><DashboardIcon /> Dashboard</div>
            <div className="nav-item"><MapIcon /> Live Map</div>
            <div className="nav-item"><PeopleIcon /> People</div>
            <div className="nav-item"><AlertsIcon /> Alerts</div>
            <div className="nav-item"><AnalyticsIcon /> Analytics</div>
            <div className="nav-item"><SettingsIcon /> Settings</div>
          </div>

          <div className="glass-panel crisis-panel">
            <div className="crisis-header">CRISIS CONTROL</div>
            <div className="crisis-field">
              <label>Emergency Type</label>
              <div className="crisis-value">Blast <ChevronDown /></div>
            </div>
            <div className="crisis-field">
              <label>Location</label>
              <div className="crisis-value">City Mall, Pune</div>
            </div>
            <div className="crisis-field">
              <label>People Detected</label>
              <div className="crisis-value">{data.totalPeople} <TrendingIcon /></div>
            </div>
            <button className="end-emergency-btn">END EMERGENCY</button>
          </div>
        </aside>

        {/* ── CONTENT (Map + Analytics + Bottom) ── */}
        <div className="content-wrapper">
          <div className="content-top">

            {/* ── LIVE MAP PANEL ── */}
            <div className="glass-panel map-panel">
              <div className="panel-title">LIVE MAP &ndash; REAL TIME OVERVIEW</div>
              <div className="map-container">
                <IsometricMap mapData={data} onGenerate={handleRegenerate} />
              </div>
            </div>

            {/* ── RIGHT ANALYTICS PANEL ── */}
            <div className="glass-panel analytics-panel">
              {/* Overview Stats */}
              <div className="analytics-section">
                <div className="panel-title" style={{marginBottom:0}}>OVERVIEW</div>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-icon blue"><UsersStatIcon /></div>
                    <div className="stat-content">
                      <span className="stat-val">{data.totalPeople}</span>
                      <span className="stat-label">Total People</span>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon green"><DoorIcon /></div>
                   <div className="stat-content">
                      <span className="stat-val">{(data as any).exits?.length || 0}</span>
                      <span className="stat-label">Exits Available</span>
                     </div>
                   </div>
                  <div className="stat-box">
                    <div className="stat-icon green"><ShieldCheckIcon /></div>
                    <div className="stat-content">
                      <span className="stat-val">{data.evacuated}</span>
                      <span className="stat-label">Evacuated</span>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon yellow"><AlertTriangleIcon /></div>
                    <div className="stat-content">
                      <span className="stat-val">{data.blockedRoutes}</span>
                      <span className="stat-label">Blocked Routes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exit Distribution */}
              <div className="analytics-section">
                <div className="panel-title">EXIT DISTRIBUTION</div>
                <div className="bar-container">
                  <div className="bar-row">
                    <div className="bar-exit-label a">Exit A</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${data.pctA}%`,background:'var(--accent-green)'}}></div></div>
                    <div className="bar-stats"><span>{data.exitA} People</span><span>{data.pctA}%</span></div>
                  </div>
                  <div className="bar-row">
                    <div className="bar-exit-label b">Exit B</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${data.pctB}%`,background:'var(--accent-blue)'}}></div></div>
                    <div className="bar-stats"><span>{data.exitB} People</span><span>{data.pctB}%</span></div>
                  </div>
                  <div className="bar-row">
                    <div className="bar-exit-label c">Exit C</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${data.pctC}%`,background:'var(--accent-purple)'}}></div></div>
                    <div className="bar-stats"><span>{data.exitC} People</span><span>{data.pctC}%</span></div>
                  </div>
                  <div className="bar-row">
                    <div className="bar-exit-label d">Exit D</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${data.pctD}%`,background:'var(--accent-orange)'}}></div></div>
                    <div className="bar-stats"><span>{data.exitD} People</span><span>{data.pctD}%</span></div>
                  </div>
                </div>
              </div>

              {/* AI Status */}
              <div className="analytics-section">
                <div className="panel-title">AI STATUS</div>
               {isRegenerating ? (
                 <div className="ai-status-subtitle pulse-text">Re-evaluating parameters...</div>
               ) : (
                  <div className="ai-status-subtitle">{isSimulating ? 'Simulating live evacuation...' : 'Analyzing routes...'}</div>
                )}
                <div className="status-row">
                   <div className="status-left"><CheckIcon /> CCTV Feed</div>
                   <div className="status-right active">Active</div>
                 </div>
                 <div className="status-row">
                   <div className="status-left"><CheckIcon /> Drone Feed</div>
                   <div className="status-right active">Active</div>
                 </div>
                 <div className="status-row">
                   <div className="status-left"><CheckIcon /> AI Routing</div>
                   <div className="status-right optimizing">{isRegenerating ? 'Recalculating' : (isSimulating ? 'Simulating' : 'Optimizing')}</div>
                  </div>
              </div>
            </div>
          </div>

          {/* ═══ BOTTOM PANELS ═══ */}
          <div className="content-bottom">

            {/* Live Alerts */}
            <div className="glass-panel bottom-card">
              <div className="panel-title">LIVE ALERTS</div>
              {data.alerts.map((alert, idx) => (
                <div key={alert.id || idx} className={`alert-row ${alert.type}`}>
                  <div className="alert-icon-box">{alert.icon}</div>
                  <div className="alert-content">
                    <div className="alert-row-title">{alert.title}</div>
                    <div className="alert-row-desc">{alert.desc}</div>
                  </div>
                  <div className="alert-row-time">{alert.time}</div>
                </div>
              ))}
            </div>

            {/* AI Routing */}
            <div className="glass-panel bottom-card">
              <div className="panel-title">AI ROUTING IN PROGRESS</div>
              <div className="routing-desc">
                {isRegenerating ? "Analyzing new scenario..." : (isSimulating ? "Simulating evacuation..." : "Calculating safest routes for all people...")}
              </div>
              <div className="routing-metrics">
                <div className="r-metric">
                  <span className="r-val" style={{color:'var(--accent-green)'}}>{4 - data.blockedRoutes}</span>
                  <span className="r-lbl">Safe Exits</span>
                </div>
                <div className="r-metric">
                  <span className="r-val">{isRegenerating ? '--' : (2.0 + Math.random() * 0.5).toFixed(1) + 's'}</span>
                  <span className="r-lbl">Avg. Response Time</span>
                </div>
                <div className="r-metric">
                  <span className="r-val">{isRegenerating ? '--' : (94 + Math.floor(Math.random() * 5)) + '%'}</span>
                  <span className="r-lbl">Accuracy</span>
                </div>
              </div>
              <div className="r-progress">
                <div className="rp-header">
                  <span>{isRegenerating ? "Analyzing routes..." : (isSimulating ? "Simulating..." : "Processing live data...")}</span>
                  <span className="rp-pct">{isRegenerating ? `${progress}%` : (isSimulating ? `${Math.max(5, Math.round((data.evacuated / data.totalPeople) * 100))}%` : "72%")}</span>
                </div>
                <div className="rp-track">
                  <div 
                    className="rp-fill" 
                    style={{
                      width: isRegenerating ? `${progress}%` : (isSimulating ? `${Math.max(5, Math.round((data.evacuated / data.totalPeople) * 100))}%` : '72%'), 
                      transition: 'width 0.2s ease'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* User Notification Preview */}
            <div className="glass-panel bottom-card">
              <div className="panel-title">USER NOTIFICATION PREVIEW</div>
              <div className="preview-split">
                <div className="preview-col">
                  <div className="preview-label"><strong>SMARTPHONE</strong> (WhatsApp)</div>
                  <div className="msg-bubble whatsapp">
                    <div className="wa-title">⚠️ Emergency Alert!</div>
                    <div>Please evacuate via <strong>Exit B</strong>.<br/>Tap to view your safe route.</div>
                    <a href="#" className="wa-link">View Route</a>
                    <div className="wa-url">maps.crisis.app/route/23</div>
                    <div className="wa-time">4:39 PM ✓✓</div>
                  </div>
                </div>
                <div className="preview-col">
                  <div className="preview-label"><strong>FEATURE PHONE</strong> (SMS)</div>
                  <div className="msg-bubble sms">
                    <div><strong>ALERT:</strong> Evacuate now.<br/>Use Exit C. Walk straight 20m, turn left.<br/>Stay calm. – Police</div>
                    <div className="sms-time">4:39 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-panel bottom-card">
              <div className="panel-title">RECENT ACTIVITY</div>
              <div className="activity-list">
                {data.activity.map((act, idx) => (
                  <div key={act.id || idx} className="activity-row">
                    <div className="activity-dot" style={act.iconColor ? {background: act.iconColor} : {}}></div>
                    <div className="activity-info">
                      <span className="activity-user">{act.user}</span>
                      <span className="activity-action">{act.text}</span>
                    </div>
                    <span className="activity-time">{act.time}</span>
                  </div>
                ))}
              </div>
              <button className="view-all-btn">View All Activity</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
