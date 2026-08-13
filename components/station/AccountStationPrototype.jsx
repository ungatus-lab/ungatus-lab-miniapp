"use client";

import { useMemo, useRef, useState } from "react";

const MODULES = [
  { id: "device", title: "DEVICE", subtitle: "Emulator Hangar", x: 13, y: 56, color: "#5ee7ff", icon: "▣" },
  { id: "scanner", title: "SCANNER", subtitle: "Etalon Laboratory", x: 22, y: 38, color: "#53f5df", icon: "◉" },
  { id: "collab", title: "COLLAB", subtitle: "Link Hub", x: 31, y: 61, color: "#b99cff", icon: "◈" },
  { id: "market", title: "MARKET", subtitle: "Trade Dock", x: 40, y: 43, color: "#ff8bc8", icon: "◍" },
  { id: "premium", title: "PREMIUM", subtitle: "Status Reactor", x: 49, y: 63, color: "#6df0ad", icon: "◇" },
  { id: "center", title: "CORE", subtitle: "Account Citadel", x: 57, y: 43, color: "#8cecff", icon: "◎" },
  { id: "wallet", title: "WALLET", subtitle: "UGT Vault", x: 65, y: 64, color: "#ffe693", icon: "⇄" },
  { id: "squad", title: "SQUAD", subtitle: "Relay Array", x: 73, y: 42, color: "#ca9cff", icon: "⬡" },
  { id: "earn", title: "EARN", subtitle: "Mission Beacon", x: 82, y: 65, color: "#ffe45c", icon: "✦" },
  { id: "game", title: "ARENA", subtitle: "PvP Rift", x: 91, y: 44, color: "#ff6f91", icon: "⚔" },
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
  const [camera, setCamera] = useState(52);
  const [activeId, setActiveId] = useState(null);
  const [showTargets, setShowTargets] = useState(true);
  const [generation, setGeneration] = useState(1);
  const drag = useRef({ down: false, startX: 0, startCamera: 52, moved: 0 });
  const active = useMemo(() => MODULES.find((module) => module.id === activeId), [activeId]);
  const accountName = telegramUser?.first_name || telegramUser?.username || "SceneAgent";

  if (!open) return null;

  function beginCamera(event) {
    if (active) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { down: true, startX: event.clientX, startCamera: camera, moved: 0 };
  }

  function moveCamera(event) {
    if (!drag.current.down || active) return;
    const delta = event.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
    setCamera(clamp(drag.current.startCamera - delta * 0.09, 0, 100));
  }

  function endCamera() {
    drag.current.down = false;
  }

  function openModule(module) {
    if (drag.current.moved > 8) return;
    setCamera(module.x);
    window.setTimeout(() => setActiveId(module.id), 220);
  }

  const backgroundX = 12 + camera * 0.76;
  const cameraAngle = (camera - 50) * 0.06;

  return (
    <main style={styles.root}>
      <style>{css}</style>

      <div
        style={{
          ...styles.panorama,
          backgroundPosition: `${backgroundX}% center`,
          transform: `scale(1.22) perspective(1200px) rotateY(${cameraAngle}deg)`,
        }}
      />
      <div style={{ ...styles.shuttleGlass, transform: `translateX(${(camera - 50) * -0.08}vw)` }} />
      <div style={styles.vignette} />
      <div style={styles.grain} />

      <header style={styles.header}>
        <button style={styles.backButton} onClick={onClose}>‹</button>
        <div style={styles.identity}>
          <small>PIXELGRID // ORBITAL ACCOUNT</small>
          <strong>{accountName}</strong>
        </div>
        <button style={styles.generation} onClick={() => setGeneration((value) => value === 10 ? 1 : value + 1)}>
          <small>GENERATION</small>
          <b>G{generation}</b>
        </button>
      </header>

      <section
        style={styles.cameraSurface}
        onPointerDown={beginCamera}
        onPointerMove={moveCamera}
        onPointerUp={endCamera}
        onPointerCancel={endCamera}
      >
        {MODULES.map((module) => {
          const projection = project(module, camera);
          if (!projection.visible) return null;

          return (
            <button
              key={module.id}
              className="station-hotspot"
              style={{
                ...styles.hotspot,
                left: `${projection.x}%`,
                top: `${projection.y}%`,
                opacity: projection.opacity,
                transform: `translate(-50%,-50%) scale(${projection.scale})`,
                zIndex: projection.z,
              }}
              onClick={() => openModule(module)}
            >
              <span
                style={{
                  ...styles.target,
                  color: module.color,
                  borderColor: `${module.color}99`,
                  boxShadow: `0 0 28px ${module.color}55, inset 0 0 19px ${module.color}2b`,
                }}
              >
                <i>{module.icon}</i>
              </span>
              {showTargets && (
                <span style={styles.tag}>
                  <b>{module.title}</b>
                  <small>{module.subtitle}</small>
                </span>
              )}
            </button>
          );
        })}
      </section>

      <div style={styles.stats}>
        <Stat label="UGT" value="0" />
        <Stat label="STATUS" value="FREE" />
        <Stat label="EMULATORS" value="1 / 1" />
      </div>

      <button style={styles.targetsButton} onClick={() => setShowTargets((value) => !value)}>
        {showTargets ? "HIDE TARGETS" : "SHOW TARGETS"}
      </button>

      {!active && (
        <>
          <div style={styles.caption}>
            <small>{camera < 32 ? "TOOLS HEMISPHERE" : camera > 69 ? "ARENA HEMISPHERE" : "ACCOUNT CITADEL"}</small>
            <b>ORBITAL CITY</b>
            <span>Удерживай экран и поворачивай обзор шатла вокруг станции</span>
          </div>
          <div style={styles.cameraRail}>
            <span>TOOLS</span>
            <div><i style={{ left: `${camera}%` }} /></div>
            <span>ARENA</span>
          </div>
        </>
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

function project(module, camera) {
  const delta = (module.x - camera) / 100 * Math.PI * 0.92;
  const forward = Math.cos(delta);
  const side = Math.sin(delta);
  return {
    visible: forward > 0.1,
    x: 50 + side * 49,
    y: module.y + (1 - forward) * 8,
    scale: 0.55 + forward * 0.72,
    opacity: clamp(forward * 1.55, 0.12, 1),
    z: Math.round(100 + forward * 100),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const css = `
@keyframes targetPulse { 50% { opacity:.72; transform:translate(-50%,-50%) scale(1.08); } }
@keyframes panelOpen { from { opacity:0; transform:translateY(28px) scale(.97); } to { opacity:1; transform:none; } }
.station-hotspot { transition:left .09s linear, top .09s linear, opacity .14s ease, transform .14s ease; }
.identity small,.generation small,.stats small,.caption small,.panelHeader small,.hero small,.metricGrid small,.pack small{font-size:7px;letter-spacing:.1em;color:rgba(203,213,225,.62);font-weight:900}
.identity strong{font-size:14px}.generation b{font-size:13px}
.stats>div{min-width:59px;padding:6px 8px;border-radius:11px;background:rgba(2,10,23,.64);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(15px);display:flex;flex-direction:column}
.stats b{font-size:12px}.target i{font-style:normal;font-size:20px;text-shadow:0 0 16px currentColor}
.tag b{font-size:9px}.tag small{font-size:7px;color:rgba(226,232,240,.68)}
.caption b{font-size:17px;letter-spacing:.06em}.caption span{font-size:9px;color:rgba(226,232,240,.64)}
.cameraRail>div{height:3px;position:relative;border-radius:99px;background:linear-gradient(90deg,rgba(34,211,238,.5),rgba(167,139,250,.6),rgba(251,113,133,.5))}
.cameraRail i{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:#e0f2fe;box-shadow:0 0 14px #67e8f9}
.panelHeader>div{display:flex;flex-direction:column}.panelHeader em{font-style:normal;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.05);font-size:9px}
.hero h2{margin:5px 0 6px;font-size:20px}.hero p{margin:0;color:rgba(226,232,240,.66);font-size:12px;line-height:1.5}
.metricGrid>div{min-height:52px;padding:8px;border-radius:13px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;justify-content:center}
.metricGrid b{font-size:11px}.detailRows>div{min-height:35px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,.055);font-size:10px}
.detailRows span{color:#94a3b8}.pack b{font-size:11px}.pack span{font-size:10px;color:#d1fae5}
`;

const styles = {
  root: { position: "fixed", inset: 0, zIndex: 180, overflow: "hidden", background: "#010207", color: "#f2fbff", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" },
  panorama: { position: "absolute", inset: "-8%", backgroundImage: "url('/account-station-panorama.png')", backgroundRepeat: "no-repeat", backgroundSize: "cover", transition: "background-position .08s linear, transform .16s linear", willChange: "background-position,transform" },
  shuttleGlass: { position: "absolute", left: -50, bottom: -24, width: "43%", height: "27%", borderRadius: "50% 55% 0 0", background: "linear-gradient(135deg,rgba(155,230,255,.12),rgba(2,7,18,.5) 42%,rgba(0,0,0,.86))", borderTop: "1px solid rgba(180,238,255,.22)", boxShadow: "0 -18px 70px rgba(0,0,0,.45)", pointerEvents: "none", transition: "transform .08s linear" },
  vignette: { position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 46%,transparent 38%,rgba(0,2,10,.18) 70%,rgba(0,2,10,.78) 120%)" },
  grain: { position: "absolute", inset: -50, opacity: .035, pointerEvents: "none", backgroundImage: "radial-gradient(rgba(255,255,255,.5) .5px, transparent .7px)", backgroundSize: "3px 3px" },
  header: { position: "absolute", zIndex: 70, top: 10, left: 10, right: 10, height: 54, display: "grid", gridTemplateColumns: "42px 1fr auto", gap: 10, alignItems: "center", padding: "0 10px", borderRadius: 18, background: "linear-gradient(135deg,rgba(2,10,23,.72),rgba(11,8,30,.56))", border: "1px solid rgba(175,232,255,.16)", backdropFilter: "blur(22px)", boxShadow: "0 18px 55px rgba(0,0,0,.3)" },
  backButton: { width: 36, height: 36, padding: 0, borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.055)", color: "white", fontSize: 27, cursor: "pointer" },
  identity: { minWidth: 0, display: "flex", flexDirection: "column" },
  generation: { minWidth: 66, height: 39, borderRadius: 12, border: "1px solid rgba(103,232,249,.2)", background: "rgba(4,31,46,.5)", color: "#e0fbff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  cameraSurface: { position: "absolute", inset: "64px 0 0", touchAction: "none", userSelect: "none" },
  hotspot: { position: "absolute", width: 92, height: 92, padding: 0, border: 0, background: "transparent", color: "white", cursor: "pointer", transformOrigin: "center" },
  target: { position: "absolute", left: "50%", top: "42%", width: 49, height: 49, transform: "translate(-50%,-50%)", border: "1px solid", borderRadius: "50%", background: "rgba(2,8,18,.2)", backdropFilter: "blur(2px)", display: "grid", placeItems: "center", animation: "targetPulse 2.3s ease-in-out infinite" },
  tag: { position: "absolute", left: "50%", top: "73%", transform: "translateX(-50%)", minWidth: 102, padding: "6px 10px", borderRadius: 10, background: "rgba(1,6,15,.67)", border: "1px solid rgba(255,255,255,.11)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", pointerEvents: "none" },
  stats: { position: "absolute", zIndex: 75, top: 73, left: 10, display: "flex", gap: 5 },
  targetsButton: { position: "absolute", zIndex: 75, top: 73, right: 10, height: 31, padding: "0 11px", borderRadius: 10, border: "1px solid rgba(103,232,249,.17)", background: "rgba(2,10,23,.65)", color: "#e0fbff", fontSize: 8, fontWeight: 900, backdropFilter: "blur(15px)" },
  caption: { position: "absolute", zIndex: 60, left: 15, bottom: 67, maxWidth: "72%", padding: "11px 13px", borderRadius: 16, background: "linear-gradient(135deg,rgba(2,12,27,.73),rgba(16,9,39,.55))", border: "1px solid rgba(103,232,249,.16)", backdropFilter: "blur(19px)", display: "flex", flexDirection: "column" },
  cameraRail: { position: "absolute", zIndex: 60, left: 20, right: 20, bottom: 28, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 9, alignItems: "center", color: "rgba(226,232,240,.58)", fontSize: 7 },
  panelShade: { position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", padding: 10, background: "linear-gradient(180deg,transparent 10%,rgba(0,2,8,.25) 42%,rgba(0,2,8,.96))" },
  panel: { width: "100%", maxHeight: "68vh", overflowY: "auto", padding: 12, borderRadius: "24px 24px 16px 16px", background: "linear-gradient(180deg,rgba(7,22,42,.97),rgba(2,7,17,.99))", border: "1px solid", boxShadow: "0 -28px 90px rgba(0,0,0,.8)", animation: "panelOpen .38s ease-out" },
  panelHeader: { display: "grid", gridTemplateColumns: "38px 40px 1fr auto", gap: 8, alignItems: "center", marginBottom: 10 },
  panelIcon: { width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(255,255,255,.05)", fontSize: 20 },
  hero: { padding: 14, borderRadius: 17, background: "radial-gradient(circle at 100% 0,rgba(103,232,249,.15),transparent 38%),rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.075)", marginBottom: 9 },
  metricGrid: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6 },
  detailRows: { marginTop: 9, padding: "4px 12px", borderRadius: 15, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" },
  packGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7, marginTop: 9 },
  pack: { padding: 11, borderRadius: 14, background: "rgba(52,211,153,.06)", border: "1px solid rgba(52,211,153,.17)", display: "flex", flexDirection: "column" },
  launchButton: { width: "100%", height: 50, marginTop: 10, border: 0, borderRadius: 15, background: "linear-gradient(135deg,#e11d48,#7c3aed,#0891b2)", color: "white", fontWeight: 950, letterSpacing: ".08em", boxShadow: "0 0 34px rgba(225,29,72,.25)" },
};
