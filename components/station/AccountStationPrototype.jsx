"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MODULES = [
  { id: "device", title: "DEVICE", subtitle: "Emulator Hangar", x: 15.2, y: 56.5, color: "#5ee7ff", icon: "▣", shape: "hangar" },
  { id: "scanner", title: "SCANNER", subtitle: "Etalon Laboratory", x: 23.0, y: 34.5, color: "#53f5df", icon: "◉", shape: "dish" },
  { id: "collab", title: "COLLAB", subtitle: "Link Hub", x: 31.5, y: 67.5, color: "#b99cff", icon: "◈", shape: "relay" },
  { id: "market", title: "MARKET", subtitle: "Trade Dock", x: 79.5, y: 61.5, color: "#ff8bc8", icon: "◍", shape: "dock" },
  { id: "premium", title: "PREMIUM", subtitle: "Status Reactor", x: 67.7, y: 38.5, color: "#6df0ad", icon: "◇", shape: "reactor" },
  { id: "center", title: "CORE", subtitle: "Account Citadel", x: 50.0, y: 31.0, color: "#8cecff", icon: "◎", shape: "citadel" },
  { id: "wallet", title: "WALLET", subtitle: "UGT Vault", x: 43.5, y: 69.5, color: "#ffe693", icon: "⇄", shape: "vault" },
  { id: "squad", title: "SQUAD", subtitle: "Relay Array", x: 76.0, y: 34.0, color: "#ca9cff", icon: "⬡", shape: "relay" },
  { id: "earn", title: "EARN", subtitle: "Mission Beacon", x: 87.0, y: 50.0, color: "#ffe45c", icon: "✦", shape: "beacon" },
  { id: "game", title: "ARENA", subtitle: "PvP Rift", x: 77.5, y: 73.8, color: "#ff6f91", icon: "⚔", shape: "gate" },
];

const PREMIUM_TIERS = [
  ["Free", "Базовый доступ", "1% scanner"],
  ["Basic", "€9.99 / month", "Comparator trial"],
  ["Advanced", "€24.99 / month", "More tools and slots"],
  ["Pro", "€39.99 / month", "Extended scanner"],
  ["Pro Plus", "€79.99 / month", "Maximum profile tier"],
];

const DETAILS = {
  center: {
    heading: "ACCOUNT CITADEL",
    text: "Постоянный профиль, уровень аккаунта и развитие всей орбитальной станции.",
    metrics: [["PROFILE", "LV 1"], ["PVP GAMES", "0"], ["STATUS", "FREE"], ["RATING", "—"]],
    rows: [["Station generation", "G1"], ["Unlocked systems", "10 / 10"], ["Profile experience", "0 XP"]],
  },
  device: {
    heading: "DEVICE & EMULATOR HANGAR",
    text: "Подключённые компьютеры, Android-устройства, эмуляторы и зеркала с данными от бэкенда.",
    metrics: [["PC", "0"], ["ANDROID", "0"], ["EMULATORS", "1"], ["ONLINE", "0"]],
    rows: [["Remote mirrors", "0"], ["Available slots", "1 / 1"], ["Backend sync", "Offline"]],
  },
  scanner: {
    heading: "SCANNER & ETALON LAB",
    text: "Эталоны сцен, ROI, плотность пикселей и премиальный формирователь уникальных эталонов.",
    metrics: [["PIXELS", "1%"], ["ETALONS", "0"], ["SCENES", "0"], ["COMPARATOR", "OFF"]],
    rows: [["Macro Recorder", "Native"], ["Unique etalons", "Premium"], ["Pixel density above 1%", "Premium"], ["Project Mindmap", "Native"]],
  },
  collab: {
    heading: "COLLABORATION HUB",
    text: "Общие проекты, права управления и совместное редактирование сценариев.",
    metrics: [["ROOMS", "0"], ["PROJECTS", "0"], ["MEMBERS", "0"], ["LINKS", "0"]],
    rows: [["Shared workspaces", "Soon"], ["Access control", "Soon"], ["Scenario co-edit", "Soon"]],
  },
  market: {
    heading: "PROJECT MARKET DOCK",
    text: "Внутренний рынок проектов автоматизации, сценариев, зеркал и цифровых инструментов.",
    metrics: [["PROJECTS", "0"], ["RENTALS", "0"], ["TOOLS", "0"], ["SALES", "0"]],
    rows: [["Project scripts", "Soon"], ["Emulator mirrors", "Soon"], ["Premium tools", "Soon"]],
  },
  premium: {
    heading: "PREMIUM STATUS REACTOR",
    text: "Статус аккаунта, срок инструментов, временные trial-возможности и будущий ежедневный бонус.",
    metrics: [["TIER", "FREE"], ["TOOLS", "BASE"], ["DROP", "INACTIVE"], ["TERM", "—"]],
    rows: [],
  },
  wallet: {
    heading: "UGT WALLET VAULT",
    text: "Подключённые кошельки, баланс UGT и будущий обмен внутри платформы.",
    metrics: [["UGT", "0"], ["PROMO", "0"], ["LOCKED", "0"], ["AVAILABLE", "0"]],
    rows: [["TON / Tonkeeper", "Not connected"], ["Solana / Phantom", "Not connected"], ["Swap", "Soon"]],
  },
  squad: {
    heading: "SQUAD RELAY ARRAY",
    text: "Реферальная сеть, игровые отряды и будущие кланы.",
    metrics: [["SQUAD", "0"], ["INVITED", "0"], ["ACTIVITY", "0"], ["REWARD", "0"]],
    rows: [["Referral code", "PGM-SCENE"], ["Clan channel", "Offline"], ["Shared arena queue", "Soon"]],
  },
  earn: {
    heading: "MISSION BEACON",
    text: "Задания, rewarded ads, активность аккаунта и временный доступ к отдельным Premium-функциям.",
    metrics: [["MISSIONS", "1 / 4"], ["ADS", "0"], ["PROMO", "0"], ["STREAK", "1"]],
    rows: [["Open Mini App", "DONE"], ["Watch rewarded ad", "SOON"], ["Start PvP arena", "0 / 1"], ["Comparator trial", "Inactive"]],
  },
  game: {
    heading: "MACRO SWARM ARENA",
    text: "Вылет в PvP с развитым Core, легионами, игровыми эмуляторами и серверной эволюцией.",
    metrics: [["CORE", "G1"], ["LEGIONS", "1"], ["EMULATORS", "1"], ["SERVER", "1–5"]],
    rows: [["Starter legion", "Core Guard"], ["Sensor profile", "1% pixels"], ["Arena evolution", "Enabled"]],
  },
};

export default function AccountStationPrototype({ open = true, onClose, onLaunchGame, telegramUser }) {
  const viewportRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [generation, setGeneration] = useState(1);
  const [panX, setPanX] = useState(0);
  const [metrics, setMetrics] = useState({ viewportWidth: 1, worldWidth: 1 });
  const drag = useRef({ down: false, startX: 0, startPan: 0, moved: 0 });
  const active = useMemo(() => MODULES.find((module) => module.id === activeId), [activeId]);
  const accountName = telegramUser?.first_name || telegramUser?.username || "SceneAgent";

  useEffect(() => {
    if (customElements.get("model-viewer")) return;
    const existing = document.querySelector('script[data-model-viewer="true"]');
    if (existing) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!open || !viewportRef.current) return;
    const node = viewportRef.current;
    const update = () => {
      const viewportWidth = node.clientWidth || 1;
      const viewportHeight = node.clientHeight || 1;
      const worldWidth = viewportHeight * 1.5;
      setMetrics({ viewportWidth, worldWidth });
      setPanX((value) => clamp(value, 0, Math.max(0, worldWidth - viewportWidth)));
    };
    update();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(update);
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  if (!open) return null;

  const maxPan = Math.max(0, metrics.worldWidth - metrics.viewportWidth);
  const progress = maxPan ? panX / maxPan : 0;

  function beginCamera(event) {
    if (active) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { down: true, startX: event.clientX, startPan: panX, moved: 0 };
  }

  function moveCamera(event) {
    if (!drag.current.down || active) return;
    const delta = event.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
    setPanX(clamp(drag.current.startPan - delta, 0, maxPan));
  }

  function endCamera() {
    drag.current.down = false;
  }

  function openModule(module) {
    if (drag.current.moved > 8) return;
    const target = clamp((module.x / 100) * metrics.worldWidth - metrics.viewportWidth / 2, 0, maxPan);
    setPanX(target);
    window.setTimeout(() => setActiveId(module.id), 180);
  }

  return (
    <main style={styles.root}>
      <style>{css}</style>

      <section
        ref={viewportRef}
        style={styles.viewport}
      >
        <div
          style={{
            ...styles.world,
            width: "100%",
            transform: "none",
          }}
        >
          <model-viewer
            src="/orbital_station_edge_view.glb"
            poster="/account-station-panorama.png"
            alt="Интерактивная 3D-модель орбитальной станции"
            interaction-prompt="none"
            loading="eager"
            reveal="auto"
            orientation="0deg -90deg 0deg"
            camera-orbit="-18deg 67deg 29m"
            camera-target="10.5m 0.8m 0m"
            field-of-view="24deg"
            shadow-intensity="0.25"
            exposure="0.85"
            style={styles.stationModel}
          />

          {MODULES.map((module) => (
            <button
              key={module.id}
              className={`station-sector sector-${module.shape}`}
              style={{
                ...styles.sector,
                left: `${module.x}%`,
                top: `${module.y}%`,
                color: module.color,
                borderColor: `${module.color}88`,
                boxShadow: `0 0 22px ${module.color}33, inset 0 0 18px ${module.color}1f`,
              }}
              onClick={() => openModule(module)}
              aria-label={`${module.title}: ${module.subtitle}`}
            >
              <span className="sector-building"><i>{module.icon}</i></span>
              <span className="sector-name"><b>{module.title}</b><small>{module.subtitle}</small></span>
            </button>
          ))}
        </div>
      </section>

      <header style={styles.header}>
        <button style={styles.backButton} onClick={onClose}>‹</button>
        <div style={styles.identity}>
          <small>PIXELGRID // ORBITAL ACCOUNT</small>
          <strong>{accountName}</strong>
        </div>
        <button style={styles.generation} onClick={() => setGeneration((value) => value === 10 ? 1 : value + 1)}>
          <small>GENERATION</small><b>G{generation}</b>
        </button>
      </header>

      <div style={styles.stats}>
        <Stat label="UGT" value="0" />
        <Stat label="STATUS" value="FREE" />
        <Stat label="EMULATORS" value="1 / 1" />
      </div>

      {!active && (
        <div style={styles.cameraHint}>ПРОВЕРКА: ЛЕГКОЕ ПРИБЛИЖЕНИЕ К КРАЮ</div>
      )}

      {active && (
        <ModulePanel
          module={active}
          generation={generation}
          onClose={() => setActiveId(null)}
          onLaunchGame={onLaunchGame}
        />
      )}
    </main>
  );
}

function ModulePanel({ module, generation, onClose, onLaunchGame }) {
  const data = DETAILS[module.id];

  return (
    <div style={styles.panelShade} onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <section style={{ ...styles.panel, borderColor: `${module.color}66` }}>
        <header style={styles.panelHeader}>
          <button style={styles.backButton} onClick={onClose}>‹</button>
          <span style={{ ...styles.panelIcon, color: module.color }}>{module.icon}</span>
          <div><small>{module.subtitle}</small><b>{module.title}</b></div>
          <em>G{generation}</em>
        </header>

        <div style={styles.hero}>
          <small>SELECTED STATION SYSTEM</small>
          <h2>{data.heading}</h2>
          <p>{data.text}</p>
        </div>

        <div style={styles.metricGrid}>
          {data.metrics.map(([label, value]) => (
            <div key={label}><small>{label}</small><b>{value}</b></div>
          ))}
        </div>

        {module.id === "premium" ? (
          <div style={styles.packGrid}>
            {PREMIUM_TIERS.map(([tier, price, feature]) => (
              <div key={tier} style={styles.pack}>
                <b>{tier}</b><span>{price}</span><small>{feature}</small>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.detailRows}>
            {data.rows.map(([label, value]) => (
              <div key={label}><span>{label}</span><b>{value}</b></div>
            ))}
          </div>
        )}

        {module.id === "game" && (
          <button style={styles.launchButton} onClick={onLaunchGame}>ENTER PVP RIFT</button>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return <div><small>{label}</small><b>{value}</b></div>;
}


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const css = `
@keyframes sectorPulse { 50% { filter:brightness(1.25); } }
@keyframes panelOpen { from { opacity:0; transform:translateY(24px) scale(.98); } to { opacity:1; transform:none; } }
.station-sector { transition:filter .2s ease, transform .2s ease, border-color .2s ease; }
.station-sector:active { transform:translate(-50%,-50%) scale(.95); }
.station-sector .sector-name { opacity:0; transform:translate(-50%,8px); transition:.2s ease; }
.station-sector:hover .sector-name,.station-sector:focus .sector-name { opacity:1; transform:translate(-50%,0); }
.sector-building { position:absolute; inset:13%; border-radius:50%; display:grid; place-items:center; border:1px solid currentColor; background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.18),rgba(2,8,18,.54) 55%,rgba(1,4,12,.82)); box-shadow:0 0 18px currentColor; animation:sectorPulse 2.8s ease-in-out infinite; }
.sector-building:before,.sector-building:after { content:""; position:absolute; border:1px solid currentColor; border-radius:50%; opacity:.38; }
.sector-building:before { inset:-8px; border-style:dashed; }
.sector-building:after { inset:6px; border-left-color:transparent; border-right-color:transparent; }
.sector-building i { font-style:normal; font-size:18px; text-shadow:0 0 13px currentColor; }
.sector-name { position:absolute; left:50%; top:96%; min-width:108px; padding:7px 9px; border-radius:11px; background:rgba(2,7,17,.84); border:1px solid rgba(255,255,255,.12); backdrop-filter:blur(12px); display:flex; flex-direction:column; pointer-events:none; z-index:4; }
.sector-name b { font-size:10px; }.sector-name small { font-size:7px; color:rgba(226,232,240,.66); }
.sector-hangar { border-radius:25% 25% 40% 40% !important; }
.sector-gate .sector-building { border-width:3px; }
.sector-citadel .sector-building { transform:scale(1.18); }
.identity small,.generation small,.stats small,.panelHeader small,.hero small,.metricGrid small,.pack small{font-size:7px;letter-spacing:.1em;color:rgba(203,213,225,.62);font-weight:900}
.identity strong{font-size:14px}.generation b{font-size:13px}
.stats>div{min-width:59px;padding:6px 8px;border-radius:11px;background:rgba(2,10,23,.72);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(15px);display:flex;flex-direction:column}.stats b{font-size:12px}
.cameraRail>div{height:3px;position:relative;border-radius:99px;background:linear-gradient(90deg,rgba(34,211,238,.5),rgba(167,139,250,.6),rgba(251,113,133,.5))}.cameraRail i{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:#e0f2fe;box-shadow:0 0 14px #67e8f9}
.panelHeader>div{display:flex;flex-direction:column}.panelHeader em{font-style:normal;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.05);font-size:9px}.hero h2{margin:5px 0 6px;font-size:20px}.hero p{margin:0;color:rgba(226,232,240,.66);font-size:12px;line-height:1.5}.metricGrid>div{min-height:52px;padding:8px;border-radius:13px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;justify-content:center}.metricGrid b{font-size:11px}.detailRows>div{min-height:35px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,.055);font-size:10px}.detailRows span{color:#94a3b8}.pack b{font-size:11px}.pack span{font-size:10px;color:#d1fae5}
`;

const styles = {
  root:{ position:"fixed", inset:0, zIndex:180, overflow:"hidden", background:"#010207", color:"#f2fbff", fontFamily:"Inter,system-ui,-apple-system,'Segoe UI',sans-serif" },
  viewport:{ position:"absolute", inset:0, overflow:"hidden", touchAction:"none", userSelect:"none", background:"#010207" },
  world:{ position:"absolute", top:0, bottom:0, left:0, height:"100%", transformOrigin:"left center", transition:"transform .08s linear", willChange:"transform" },
  stationModel:{ position:"absolute", inset:0, width:"100%", height:"100%", background:"radial-gradient(circle at 48% 42%,#07152b 0,#020713 42%,#010207 76%)", touchAction:"none" },
  sector:{ position:"absolute", width:68, height:68, transform:"translate(-50%,-50%)", padding:0, border:"1px solid", borderRadius:"50%", background:"rgba(2,8,18,.08)", color:"white", cursor:"pointer" },
  header:{ position:"absolute", zIndex:70, top:"max(10px, env(safe-area-inset-top))", left:10, right:10, height:54, display:"grid", gridTemplateColumns:"42px 1fr auto", gap:10, alignItems:"center", padding:"0 10px", borderRadius:18, background:"linear-gradient(135deg,rgba(2,10,23,.78),rgba(11,8,30,.64))", border:"1px solid rgba(175,232,255,.16)", backdropFilter:"blur(22px)", boxShadow:"0 18px 55px rgba(0,0,0,.3)" },
  backButton:{ width:36, height:36, padding:0, borderRadius:12, border:"1px solid rgba(255,255,255,.14)", background:"rgba(255,255,255,.055)", color:"white", fontSize:27, cursor:"pointer" },
  identity:{ minWidth:0, display:"flex", flexDirection:"column" },
  generation:{ minWidth:66, height:39, borderRadius:12, border:"1px solid rgba(103,232,249,.2)", background:"rgba(4,31,46,.5)", color:"#e0fbff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer" },
  stats:{ position:"absolute", zIndex:75, top:"calc(max(10px, env(safe-area-inset-top)) + 64px)", left:10, display:"flex", gap:5 },
  cameraHint:{ position:"absolute", zIndex:60, left:"50%", bottom:"max(18px, env(safe-area-inset-bottom))", transform:"translateX(-50%)", padding:"7px 11px", borderRadius:10, background:"rgba(2,10,23,.62)", border:"1px solid rgba(103,232,249,.13)", color:"rgba(226,232,240,.58)", fontSize:7, letterSpacing:".1em", pointerEvents:"none" },
  panelShade:{ position:"absolute", inset:0, zIndex:100, display:"flex", alignItems:"flex-end", padding:10, background:"linear-gradient(180deg,transparent 10%,rgba(0,2,8,.25) 42%,rgba(0,2,8,.96))" },
  panel:{ width:"100%", maxHeight:"68vh", overflowY:"auto", padding:12, borderRadius:"24px 24px 16px 16px", background:"linear-gradient(180deg,rgba(7,22,42,.97),rgba(2,7,17,.99))", border:"1px solid", boxShadow:"0 -28px 90px rgba(0,0,0,.8)", animation:"panelOpen .38s ease-out" },
  panelHeader:{ display:"grid", gridTemplateColumns:"38px 40px 1fr auto", gap:8, alignItems:"center", marginBottom:10 },
  panelIcon:{ width:38, height:38, borderRadius:12, display:"grid", placeItems:"center", background:"rgba(255,255,255,.05)", fontSize:20 },
  hero:{ padding:14, borderRadius:17, background:"radial-gradient(circle at 100% 0,rgba(103,232,249,.15),transparent 38%),rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.075)", marginBottom:9 },
  metricGrid:{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:6 },
  detailRows:{ marginTop:9, padding:"4px 12px", borderRadius:15, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)" },
  packGrid:{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:7, marginTop:9 },
  pack:{ padding:11, borderRadius:14, background:"rgba(52,211,153,.06)", border:"1px solid rgba(52,211,153,.17)", display:"flex", flexDirection:"column" },
  launchButton:{ width:"100%", height:50, marginTop:10, border:0, borderRadius:15, background:"linear-gradient(135deg,#e11d48,#7c3aed,#0891b2)", color:"white", fontWeight:950, letterSpacing:".08em", boxShadow:"0 0 34px rgba(225,29,72,.25)" },
};
