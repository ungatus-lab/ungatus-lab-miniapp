"use client";

import { useMemo, useRef, useState } from "react";

const MODULES = [
  { id: "device", label: "DEVICE", sub: "Emulator Hangar", icon: "▣", angle: -76, lane: -0.12, size: 118, color: "#38bdf8", kind: "hangar", depth: 0.92 },
  { id: "native", label: "NATIVE", sub: "Research Lab", icon: "◉", angle: -60, lane: 0.2, size: 132, color: "#22d3ee", kind: "lab", depth: 1.04 },
  { id: "collab", label: "COLLAB", sub: "Link Hub", icon: "◈", angle: -43, lane: -0.24, size: 108, color: "#a78bfa", kind: "hub", depth: 0.96 },
  { id: "market", label: "MARKET", sub: "Trade Dock", icon: "◍", angle: -27, lane: 0.24, size: 124, color: "#f472b6", kind: "dock", depth: 1.06 },
  { id: "allocation", label: "ALLOCATION", sub: "Crystal Reactor", icon: "◇", angle: -12, lane: -0.22, size: 140, color: "#34d399", kind: "crystal", depth: 1.0 },
  { id: "center", label: "CORE", sub: "Account Center", icon: "◎", angle: 4, lane: 0.04, size: 190, color: "#67e8f9", kind: "core", depth: 1.13 },
  { id: "wallet", label: "WALLET", sub: "UGT Vault", icon: "⇄", angle: 21, lane: 0.25, size: 120, color: "#fde68a", kind: "vault", depth: 1.05 },
  { id: "squad", label: "SQUAD", sub: "Relay Array", icon: "⬡", angle: 39, lane: -0.23, size: 124, color: "#c084fc", kind: "relay", depth: 0.98 },
  { id: "earn", label: "EARN", sub: "Mission Beacon", icon: "✦", angle: 57, lane: 0.22, size: 118, color: "#facc15", kind: "beacon", depth: 1.05 },
  { id: "game", label: "ARENA", sub: "PvP Gate", icon: "⚔", angle: 77, lane: -0.03, size: 176, color: "#fb7185", kind: "gate", depth: 1.12 },
];

const ALLOCATION_PACKS = [
  ["Starter", "25 000 UGT", "50 000 locked UGT"],
  ["Builder", "100 000 UGT", "200 000 locked UGT"],
  ["Pro", "400 000 UGT", "800 000 locked UGT"],
  ["Founder", "1 600 000 UGT", "3 200 000 locked UGT"],
];

const MARKET_ITEMS = [
  ["Project Scripts", "Projects", "Готовые macro-проекты и сценарии."],
  ["Emulator Mirrors", "Rentals", "Аренда LDPlayer и emulator-зеркал."],
  ["Premium Pixel Tools", "Premium", "Сканер, эталоны и плотность пикселей."],
];

export default function AccountStationPrototype({
  open = true,
  onClose,
  onLaunchGame,
  telegramUser,
  t,
}) {
  const [activeModule, setActiveModule] = useState(null);
  const [stationLevel, setStationLevel] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [cameraYaw, setCameraYaw] = useState(48);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, startX: 0, startYaw: 48, moved: 0, width: 1 });
  const suppressClickRef = useRef(false);

  const profileName = telegramUser?.first_name || telegramUser?.username || "SceneAgent";
  const active = useMemo(
    () => MODULES.find((module) => module.id === activeModule) || null,
    [activeModule]
  );

  if (!open) return null;

  function localize(key, fallback) {
    if (typeof t !== "function") return fallback;
    const value = t(key);
    return value === key ? fallback : value;
  }

  function selectModule(id) {
    if (suppressClickRef.current) return;
    const module = MODULES.find((item) => item.id === id);
    if (module) setCameraYaw(module.angle);
    setActiveModule(id);
  }

  function closeModule() {
    setActiveModule(null);
  }

  function launchArena() {
    if (typeof onLaunchGame === "function") onLaunchGame();
  }

  const yawProgress = (cameraYaw + 88) / 176;
  const yawRadians = cameraYaw * Math.PI / 180;
  const horizonShift = Math.sin(yawRadians) * 7;

  function projectModule(module) {
    const delta = (module.angle - cameraYaw) * Math.PI / 180;
    const forward = Math.cos(delta);
    const visible = forward > 0.16;
    const screenX = 50 + Math.sin(delta) * 69;
    const edgeCompression = Math.max(0.48, forward);
    const perspectiveScale = module.depth * (0.62 + forward * 0.55);
    const y = 48 + module.lane * 72 + (1 - forward) * 8;
    return {
      visible,
      x: screenX,
      y,
      scale: perspectiveScale,
      opacity: visible ? Math.max(0.18, Math.min(1, forward * 1.4)) : 0,
      rotate: -Math.sin(delta) * 12,
      blur: Math.max(0, (1 - forward) * 1.2),
      z: Math.round(100 + forward * 100 + y),
      side: Math.sin(delta),
    };
  }

  function beginPan(event) {
    if (active) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { active: true, startX: event.clientX, startYaw: cameraYaw, moved: 0, width: event.currentTarget.clientWidth || 1 };
    setDragging(true);
  }
  function movePan(event) {
    if (!dragRef.current.active || active) return;
    const delta = event.clientX - dragRef.current.startX;
    dragRef.current.moved = Math.max(dragRef.current.moved, Math.abs(delta));
    const next = dragRef.current.startYaw - (delta / dragRef.current.width) * 112;
    setCameraYaw(Math.max(-88, Math.min(88, next)));
  }
  function endPan() {
    if (!dragRef.current.active) return;
    if (dragRef.current.moved > 7) {
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 80);
    }
    dragRef.current.active = false;
    setDragging(false);
  }
  return (
    <main style={styles.root}>
      <style>{`
        @keyframes stationStars { from { transform: translate3d(0,0,0); } to { transform: translate3d(-42px,32px,0); } }
        @keyframes stationPulse { 0%,100% { opacity:.48; transform:scale(.92); } 50% { opacity:1; transform:scale(1.06); } }
        @keyframes stationOrbit { to { transform:rotate(360deg); } }
        @keyframes stationFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
        @keyframes stationPanelIn { from { opacity:0; transform:translateY(22px) scale(.965); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes stationScan { from { transform:translateY(-160%); } to { transform:translateY(500%); } }
        @keyframes auroraDrift { 0%,100% { transform:translate3d(-3%,0,0) scale(1); } 50% { transform:translate3d(3%,-2%,0) scale(1.08); } }
        @keyframes energyFlow { to { background-position:120px 0; } }
        .station-module:hover { filter:brightness(1.24); }
        .station-module:active { filter:brightness(1.38) !important; }
        .station-scroll::-webkit-scrollbar { width:5px; }
        .station-scroll::-webkit-scrollbar-thumb { background:rgba(103,232,249,.28); border-radius:999px; }
      `}</style>

      <div style={styles.spaceBackdrop} />
      <div style={styles.nebulaOne} />
      <div style={styles.nebulaTwo} />
      <div style={{ ...styles.starLayer, backgroundPosition: `${-cameraYaw * 2.2}px 0, ${-cameraYaw * 3.4 + 27}px 31px`, transform: `scale(${1.04 + Math.abs(cameraYaw) / 900})` }} />
      <div style={{ ...styles.deepNebula, transform: `translate3d(${-cameraYaw * 0.22}vw,0,0) skewX(${cameraYaw * -0.035}deg)` }} />
      <div style={{ ...styles.distantArchitecture, transform: `translate3d(${-cameraYaw * 0.32}vw,0,0) rotateY(${cameraYaw * -0.18}deg)` }} />

      <header style={styles.topHud}>
        <button style={styles.exitButton} onClick={onClose} title="Back to current Mini App">‹</button>
        <div style={styles.brandBlock}>
          <small style={styles.eyebrow}>PIXELGRIDMACRO · ACCOUNT STATION</small>
          <strong style={styles.brandTitle}>{profileName}</strong>
        </div>
        <div style={styles.levelBadge}><small>STATION</small><b>LV {stationLevel}</b></div>
      </header>

      <section
        style={styles.sceneViewport}
        onPointerDown={beginPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <div style={{ ...styles.horizonGlow, transform: `translateX(${horizonShift}vw) rotate(${cameraYaw * -0.035}deg)` }} />
        <div style={{ ...styles.stationShadow, transform: `translateX(${horizonShift * 0.5}vw) rotateX(66deg) rotateZ(${cameraYaw * -0.045}deg)` }} />
        <div style={{ ...styles.stationScene, transform: `perspective(900px) rotateY(${cameraYaw * -0.18}deg) rotateX(1.5deg)`, transition: dragging ? "none" : styles.stationScene.transition }}>
          <div style={styles.stationDeck}>
            <div style={styles.deckGrid} />
            <div style={styles.deckRingOuter} />
            <div style={styles.deckRingMiddle} />
            <div style={styles.deckRingInner} />
            <div style={styles.deckArcNorth} />
            <div style={styles.deckArcSouth} />
          </div>
          <div style={styles.energySpine} />
          <div style={styles.skyBridgeOne} />
          <div style={styles.skyBridgeTwo} />

          {MODULES.map((module) => (
            <StationModule
              key={module.id}
              module={module}
              projection={projectModule(module)}
              active={activeModule === module.id}
              dimmed={Boolean(activeModule && activeModule !== module.id)}
              showLabels={showLabels}
              stationLevel={stationLevel}
              onSelect={selectModule}
            />
          ))}
        </div>

        {!active && (
          <>
            <div style={styles.panoramaTitle}>
              <small>PIXELGRID ORBITAL HABITAT</small>
              <b>{cameraYaw < -30 ? "NATIVE QUARTER" : cameraYaw > 34 ? "ARENA QUARTER" : "ACCOUNT CITADEL"}</b>
              <span>Свободный обзор станции · удерживай и веди пальцем</span>
            </div>
            <div style={styles.panoramaRail}>
              <div style={{ ...styles.panoramaRailFill, width: `${yawProgress * 100}%` }} />
              <span style={{ ...styles.panoramaThumb, left: `${yawProgress * 100}%` }} />
            </div>
            <div style={styles.swipeHint}><span>‹</span><b>DRAG THE CAMERA</b><span>›</span></div>
          </>
        )}
      </section>

      <aside style={styles.leftStats}>
        <HudStat label="UGT" value="0" color="#fde68a" />
        <HudStat label="ALLOCATION" value="0" color="#86efac" />
        <HudStat label="EMULATORS" value="1 / 1" color="#7dd3fc" />
      </aside>

      <div style={styles.utilityControls}>
        <button style={styles.utilityButton} onClick={() => setShowLabels((value) => !value)}>{showLabels ? "LABELS ON" : "LABELS OFF"}</button>
        <button style={styles.utilityButton} onClick={() => setStationLevel((level) => (level >= 5 ? 1 : level + 1))}>DEV LEVEL +</button>
      </div>

      {active && (
        <ModulePanel
          module={active}
          profileName={profileName}
          stationLevel={stationLevel}
          closeModule={closeModule}
          launchArena={launchArena}
          localize={localize}
        />
      )}
    </main>
  );
}

function StationModule({ module, projection, active, dimmed, showLabels, stationLevel, onSelect }) {
  const scale = 1 + Math.min(4, stationLevel - 1) * 0.035;
  return (
    <button
      className="station-module"
      onClick={() => onSelect(module.id)}
      style={{
        ...styles.moduleButton,
        left: `${projection.x}%`,
        top: `${projection.y}%`,
        width: module.size,
        height: module.size * 0.82,
        display: projection.visible ? "block" : "none",
        opacity: dimmed ? 0.16 : projection.opacity,
        filter: `blur(${projection.blur}px) saturate(${0.72 + projection.opacity * 0.48})`,
        transform: `translate(-50%,-50%) scale(${projection.scale * scale * (active ? 1.12 : 1)}) rotateY(${projection.rotate}deg)`,
        zIndex: active ? 400 : projection.z,
        "--module-color": module.color,
      }}
      title={`${module.label} · ${module.sub}`}
    >
      <span style={{ ...styles.moduleGroundGlow, background: module.color }} />
      <span style={{ ...styles.moduleBase, borderColor: `${module.color}88` }} />
      <span style={{ ...styles.moduleTower, background: `linear-gradient(145deg, ${module.color}8a, #0b1530 55%, #030711)` }}>
        <span style={{ ...styles.moduleDome, borderColor: `${module.color}cc`, boxShadow: `0 0 18px ${module.color}66, inset 0 0 13px ${module.color}42` }} />
        <span style={{ ...styles.moduleIcon, color: module.color }}>{module.icon}</span>
        {module.kind === "crystal" && <span style={{ ...styles.crystalSpire, borderBottomColor: module.color }} />}
        {module.kind === "gate" && <span style={{ ...styles.gateRing, borderColor: module.color }} />}
        {module.kind === "core" && <><span style={{ ...styles.coreOrbit, borderColor: `${module.color}88` }} /><span style={{ ...styles.coreOrbitSecond, borderColor: `${module.color}55` }} /></>}
      </span>
      <span style={{ ...styles.moduleLight, background: module.color }} />
      {showLabels && (
        <span style={styles.moduleLabel}>
          <b>{module.label}</b>
          <small>{module.sub}</small>
        </span>
      )}
    </button>
  );
}

function ModulePanel({ module, profileName, stationLevel, closeModule, launchArena, localize }) {
  return (
    <div style={styles.panelBackdrop} onPointerDown={(event) => { if (event.target === event.currentTarget) closeModule(); }}>
      <section className="station-scroll" style={{ ...styles.panel, borderColor: `${module.color}66` }}>
        <div style={{ ...styles.panelAccent, background: module.color }} />
        <header style={styles.panelHeader}>
          <button style={styles.panelBack} onClick={closeModule}>‹</button>
          <div style={styles.panelIdentity}>
            <span style={{ ...styles.panelIcon, color: module.color, borderColor: `${module.color}77` }}>{module.icon}</span>
            <div><small>{module.sub}</small><h2>{module.label}</h2></div>
          </div>
          <span style={styles.panelLevel}>LV {stationLevel}</span>
        </header>
        <div style={{ ...styles.scanLine, background: module.color }} />
        <ModuleContent id={module.id} profileName={profileName} launchArena={launchArena} localize={localize} />
      </section>
    </div>
  );
}

function ModuleContent({ id, profileName, launchArena, localize }) {
  if (id === "center") return <>
    <PanelHero title={`Добро пожаловать, ${profileName}`} text="Центральный Core отражает уровень профиля, статус аккаунта и развитие всей станции." />
    <MetricGrid items={[["PROFILE", "LV 1"], ["PVP GAMES", "0"], ["STATUS", "FREE"], ["RATING", "UNRANKED"]]} />
    <PanelSection title="Account evolution"><Row label="Station generation" value="G1" /><Row label="Unlocked modules" value="10 / 10" /><Row label="Premium status" value="Inactive" /></PanelSection>
  </>;

  if (id === "game") return <>
    <PanelHero title="Macro Swarm Arena" text="Вылет из станции с выбранным Core, легионами, игровыми эмуляторами и стартовыми ресурсами." />
    <MetricGrid items={[["CORE", "G1"], ["LEGIONS", "1"], ["EMULATORS", "1"], ["SERVER", "1–5"]]} />
    <PanelSection title="Launch configuration"><Row label="Starter legion" value="Core Guard" /><Row label="Sensor profile" value="1% pixels" /><Row label="Arena evolution" value="Enabled" /></PanelSection>
    <button style={styles.launchButton} onClick={launchArena}>ENTER PVP ARENA</button>
  </>;

  if (id === "squad") return <>
    <PanelHero title="Squad Relay Array" text="Реферальная сеть, игровые группы, будущие кланы и координация нескольких Core." />
    <MetricGrid items={[["SQUAD", "0"], ["INVITED", "0"], ["ACTIVITY", "0"], ["REWARD", "0"]]} />
    <PanelSection title="Relay branches"><Row label="Referral code" value="PGM-SCENE" /><Row label="Clan channel" value="Offline" /><Row label="Shared arena queue" value="Soon" /></PanelSection>
  </>;

  if (id === "earn") return <>
    <PanelHero title="Mission Beacon" text="Ежедневные задания, rewarded ads, игровая активность и получение базовой аллокации." />
    <PanelSection title="Today missions"><Row label="Open Mini App" value="DONE" /><Row label="Watch rewarded ad" value="SOON" /><Row label="Start PvP arena" value="0 / 1" /><Row label="Open Allocation Reactor" value="0 / 1" /></PanelSection>
    <PanelSection title="Ad Vault"><Row label="Pending ad UGT" value="0" /><Row label="Confirmed promo UGT" value="0" /></PanelSection>
  </>;

  if (id === "allocation") return <>
    <PanelHero title="Crystal Allocation Reactor" text="Аллокация аккаунта одновременно отражается как вычислительная энергия станции и стартовый ресурс PvP." />
    <MetricGrid items={[["ACQUIRED", "0 UGT"], ["LOCKED", "0 UGT"], ["ADS", "0 UGT"], ["ROUND", "R1"]]} />
    <div style={styles.packList}>{ALLOCATION_PACKS.map(([name, entry, bonus]) => <div key={name} style={styles.pack}><b>{name}</b><span>{entry}</span><small>Bonus · {bonus}</small></div>)}</div>
  </>;

  if (id === "wallet") return <>
    <PanelHero title="UGT Energy Vault" text="Подключённые кошельки, backed UGT, promo UGT, locked allocation и будущий обмен." />
    <PanelSection title="Connected wallets"><Row label="TON / Tonkeeper" value="Not connected" /><Row label="Solana / Phantom" value="Not connected" /></PanelSection>
    <MetricGrid items={[["BACKED", "0"], ["PROMO", "0"], ["LOCKED", "0"], ["AVAILABLE", "0"]]} />
    <PanelSection title="Swap preview"><Row label="You send" value="25 USDC" /><Row label="You receive" value="24 250 UGT" /></PanelSection>
  </>;

  if (id === "device") return <>
    <PanelHero title="Device & Emulator Hangar" text="LDPlayer, PC и Android зеркала. В нативке здесь работают Remote Scanner, жесты и multi-device control." />
    <MetricGrid items={[["LDPLAYER", "0"], ["PC", "0"], ["ANDROID", "0"], ["SLOTS", "1"]]} />
    <PanelSection title="Native systems"><Row label="Remote Scanner" value="Native" /><Row label="Macro Recorder" value="Native" /><Row label="Device Emulator" value="Preview" /><Row label="Raw frames" value="Native only" /></PanelSection>
  </>;

  if (id === "collab") return <>
    <PanelHero title="Collaboration Link Hub" text="Общие проекты, права управления, совместное редактирование сценариев и рабочие пространства." />
    <MetricGrid items={[["ROOMS", "0"], ["PROJECTS", "0"], ["MEMBERS", "0"], ["LINKS", "0"]]} />
    <PanelSection title="Native collaboration"><Row label="Shared workspaces" value="Soon" /><Row label="Access control" value="Soon" /><Row label="Scenario co-edit" value="Soon" /></PanelSection>
  </>;

  if (id === "market") return <>
    <PanelHero title="PixelGrid Trade Dock" text="Рынок сценариев, зеркал, проектов автоматизации и premium-инструментов." />
    <MetricGrid items={[["PROJECTS", "0"], ["RENTALS", "0"], ["TOOLS", "0"], ["STATUS", "SOON"]]} />
    <div style={styles.marketList}>{MARKET_ITEMS.map(([title, tag, text]) => <div key={title} style={styles.marketItem}><div><b>{title}</b><small>{text}</small></div><span>{tag}</span></div>)}</div>
  </>;

  return <>
    <PanelHero title="Native Research Laboratory" text="Scenario Constructor, эталоны, плотность пикселей, сравнитель, scanner и project mindmap." />
    <MetricGrid items={[["PIXELS", "1%"], ["ETALONS", "0"], ["PROJECTS", "0"], ["PREMIUM", "OFF"]]} />
    <PanelSection title="Research systems"><Row label="Scenario Constructor" value="Soon" /><Row label="Pixel Comparator" value="Premium" /><Row label="Density above 1%" value="Premium" /><Row label="Project Mindmap" value="Native" /></PanelSection>
  </>;
}

function PanelHero({ title, text }) { return <section style={styles.panelHero}><h3>{title}</h3><p>{text}</p></section>; }
function PanelSection({ title, children }) { return <section style={styles.panelSection}><h3>{title}</h3>{children}</section>; }
function Row({ label, value }) { return <div style={styles.row}><span>{label}</span><b>{value}</b></div>; }
function MetricGrid({ items }) { return <div style={styles.metricGrid}>{items.map(([label, value]) => <div key={label} style={styles.metric}><small>{label}</small><b>{value}</b></div>)}</div>; }
function HudStat({ label, value, color }) { return <div style={styles.hudStat}><small>{label}</small><b style={{ color }}>{value}</b></div>; }

function connectorStyle(module) {
  const dx = module.x - 50;
  const dy = module.y - 49;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return {
    position: "absolute", left: "50%", top: "49%", width: `${length}%`, height: 2,
    transformOrigin: "0 50%", transform: `rotate(${angle}deg)`,
    background: "linear-gradient(90deg, rgba(103,232,249,.62), rgba(129,140,248,.12))",
    boxShadow: "0 0 10px rgba(34,211,238,.2)", opacity: .58,
  };
}

const styles = {
  root: { position: "fixed", inset: 0, overflow: "hidden", background: "#02040c", color: "#eefcff", fontFamily: "Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", zIndex: 180 },
  spaceBackdrop: { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%,rgba(14,116,144,.24),transparent 26%),radial-gradient(circle at 18% 15%,rgba(124,58,237,.21),transparent 30%),linear-gradient(180deg,#071426,#030619 48%,#010107)" },
  nebulaOne: { position: "absolute", width: "58vw", height: "58vw", left: "-28vw", top: "10vh", borderRadius: "50%", background: "rgba(14,165,233,.12)", filter: "blur(70px)" },
  nebulaTwo: { position: "absolute", width: "52vw", height: "52vw", right: "-25vw", bottom: "-20vh", borderRadius: "50%", background: "rgba(168,85,247,.12)", filter: "blur(74px)" },
  starLayer: { position: "absolute", inset: -80, transition:"transform .16s linear", opacity: .55, backgroundImage: "radial-gradient(circle,#fff 0 1px,transparent 1.3px),radial-gradient(circle,#67e8f9 0 1px,transparent 1.4px)", backgroundPosition: "0 0,27px 31px", backgroundSize: "71px 71px,103px 103px", animation: "stationStars 28s linear infinite" },
  topHud: { position: "absolute", left: 10, right: 10, top: 9, height: 52, zIndex: 80, display: "grid", gridTemplateColumns: "42px 1fr auto", alignItems: "center", gap: 9, padding: "0 9px", borderRadius: 17, background: "rgba(5,12,28,.74)", border: "1px solid rgba(103,232,249,.18)", backdropFilter: "blur(16px)", boxShadow: "0 12px 38px rgba(0,0,0,.35)" },
  exitButton: { width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.055)", color: "#fff", fontSize: 28, lineHeight: 1, cursor: "pointer" },
  brandBlock: { minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  eyebrow: { color: "#67e8f9", fontSize: 7, fontWeight: 900, letterSpacing: ".12em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  brandTitle: { fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  levelBadge: { minWidth: 58, height: 35, padding: "0 10px", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(103,232,249,.08)", border: "1px solid rgba(103,232,249,.22)" },
  sceneViewport: { position: "absolute", inset: "58px 0 0", overflow: "hidden", perspective: 1200, touchAction: "pan-y", userSelect: "none" },
  horizonGlow: { position: "absolute", left: "8%", right: "8%", top: "42%", height: 2, background: "linear-gradient(90deg,transparent,#22d3ee,transparent)", boxShadow: "0 0 55px 17px rgba(34,211,238,.12)", opacity: .5 },
  stationShadow: { position: "absolute", width: "72vw", height: "30vw", left: "14vw", top: "46%", borderRadius: "50%", background: "rgba(0,0,0,.68)", filter: "blur(28px)", transform: "rotateX(66deg)" },
  stationScene: { position: "absolute", left: "-8%", top: "5%", width: "116%", height: "84%", transformOrigin: "50% 48%", transition: "transform .3s cubic-bezier(.2,.72,.22,1)", transformStyle:"preserve-3d", willChange: "transform" },
  stationDeck: { position: "absolute", left:"-32%", width:"164%", top:"4%", bottom:"-5%", transform: "rotateX(61deg) rotateZ(-1deg)", borderRadius: "48% 48% 42% 42% / 60% 60% 38% 38%", background: "radial-gradient(ellipse at 50% 44%,rgba(22,74,98,.96),rgba(4,19,40,.96) 43%,rgba(2,6,18,.12) 74%)", border: "1px solid rgba(103,232,249,.18)", boxShadow: "inset 0 0 70px rgba(34,211,238,.08),0 0 65px rgba(0,0,0,.58)" },
  deckGrid: { position: "absolute", inset: "8%", borderRadius: "50%", opacity: .34, backgroundImage: "linear-gradient(rgba(103,232,249,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(103,232,249,.11) 1px,transparent 1px)", backgroundSize: "24px 24px", maskImage: "radial-gradient(circle,#000 38%,transparent 74%)" },
  deckRingOuter: { position: "absolute", inset: "4%", borderRadius: "50%", border: "2px solid rgba(103,232,249,.18)" },
  deckRingMiddle: { position: "absolute", inset: "23%", borderRadius: "50%", border: "1px dashed rgba(167,139,250,.28)", animation: "stationOrbit 30s linear infinite" },
  deckRingInner: { position: "absolute", inset: "38%", borderRadius: "50%", border: "2px solid rgba(103,232,249,.24)", boxShadow: "0 0 28px rgba(34,211,238,.12)" },
  moduleButton: { position: "absolute", padding: 0, border: 0, background: "transparent", color: "#fff", cursor: "pointer", transition: "opacity .55s ease,transform .35s ease,filter .25s ease", animation: "stationFloat 4.2s ease-in-out infinite", transformOrigin: "50% 70%" },
  moduleGroundGlow: { position: "absolute", left: "7%", right: "7%", bottom: "4%", height: "25%", borderRadius: "50%", opacity: .19, filter: "blur(8px)" },
  moduleBase: { position: "absolute", left: "8%", right: "8%", bottom: "7%", height: "30%", transform: "skewX(-12deg)", borderRadius: "50% 50% 32% 32%", background: "linear-gradient(180deg,#1e3351,#07101f)", border: "1px solid", boxShadow: "0 10px 18px rgba(0,0,0,.55),inset 0 3px 5px rgba(255,255,255,.08)" },
  moduleTower: { position: "absolute", width: "54%", height: "58%", left: "23%", top: "12%", borderRadius: "46% 46% 22% 22% / 35% 35% 18% 18%", border: "1px solid rgba(255,255,255,.13)", boxShadow: "inset -9px -12px 18px rgba(0,0,0,.45),0 10px 18px rgba(0,0,0,.38)", display: "grid", placeItems: "center" },
  moduleDome: { position: "absolute", width: "68%", height: "42%", top: "-8%", left: "16%", borderRadius: "50% 50% 28% 28%", border: "1px solid", background: "linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.025))" },
  moduleIcon: { position: "relative", zIndex: 3, fontSize: 22, fontWeight: 900, textShadow: "0 0 14px currentColor" },
  moduleLight: { position: "absolute", width: 6, height: 6, borderRadius: "50%", left: "48%", bottom: "17%", boxShadow: "0 0 14px currentColor", animation: "stationPulse 1.5s ease-in-out infinite" },
  moduleLabel: { position: "absolute", left: "50%", bottom: -24, transform: "translateX(-50%)", minWidth: 86, padding: "5px 7px", borderRadius: 9, background: "rgba(2,8,20,.75)", border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(7px)", display: "flex", flexDirection: "column", gap: 1, pointerEvents: "none" },
  crystalSpire: { position: "absolute", width: 0, height: 0, top: "-25%", left: "37%", borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderBottom: "34px solid", filter: "drop-shadow(0 0 7px currentColor)" },
  gateRing: { position: "absolute", width: "92%", height: "92%", left: "4%", top: "-34%", borderRadius: "50%", border: "4px solid", boxShadow: "0 0 16px currentColor,inset 0 0 12px currentColor", animation: "stationOrbit 9s linear infinite" },
  coreOrbit: { position: "absolute", width: "145%", height: "62%", left: "-23%", top: "18%", borderRadius: "50%", border: "1px solid", transform: "rotate(-14deg)", animation: "stationOrbit 11s linear infinite" },
  coreOrbitSecond: { position: "absolute", width: "128%", height: "72%", left: "-14%", top: "13%", borderRadius: "50%", border: "1px dashed", transform: "rotate(22deg)", animation: "stationOrbit 15s linear infinite reverse" },
  sceneHint: { position: "absolute", left: "50%", bottom: 27, transform: "translateX(-50%)", width: "min(340px,calc(100% - 34px))", padding: "9px 12px", borderRadius: 14, background: "rgba(5,12,28,.72)", border: "1px solid rgba(103,232,249,.18)", backdropFilter: "blur(13px)", display: "flex", flexDirection: "column", gap: 3, textAlign: "center", fontSize: 9 },
  leftStats: { position: "absolute", left: 10, top: 72, zIndex: 60, display: "flex", gap: 5 },
  hudStat: { minWidth: 62, padding: "6px 8px", borderRadius: 10, background: "rgba(5,12,28,.72)", border: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(9px)", display: "flex", flexDirection: "column", gap: 1 },
  utilityControls: { position: "absolute", right: 10, top: 72, zIndex: 60, display: "grid", gap: 5 },
  utilityButton: { minWidth: 76, height: 28, borderRadius: 9, border: "1px solid rgba(167,139,250,.25)", background: "rgba(20,16,43,.74)", color: "#ddd6fe", fontSize: 8, fontWeight: 900, cursor: "pointer", backdropFilter: "blur(9px)" },
  distantArchitecture: { position:"absolute",left:"-12%",right:"-12%",bottom:"11%",height:"32%",opacity:.26,background:"repeating-linear-gradient(118deg,transparent 0 8%,rgba(34,211,238,.11) 8.2% 8.5%,transparent 8.7% 16%)",filter:"blur(.4px)",transition:"transform .18s linear" },
  energySpine: { position:"absolute",left:"3%",right:"3%",top:"53%",height:3,background:"repeating-linear-gradient(90deg,#22d3ee 0 24px,transparent 24px 42px)",backgroundSize:"120px 3px",boxShadow:"0 0 18px rgba(34,211,238,.58)",opacity:.66,animation:"energyFlow 2.5s linear infinite" },
  sectorMonolith: { position:"absolute",left:"49%",top:"8%",width:2,height:"84%",background:"linear-gradient(transparent,rgba(103,232,249,.2),transparent)",boxShadow:"0 0 25px rgba(34,211,238,.16)" },
  sectorCaption: { position:"absolute",left:18,right:18,bottom:72,zIndex:55,padding:"13px 15px",borderRadius:18,background:"linear-gradient(135deg,rgba(5,14,34,.82),rgba(22,12,52,.68))",border:"1px solid rgba(103,232,249,.2)",backdropFilter:"blur(18px)",boxShadow:"0 18px 45px rgba(0,0,0,.4)",display:"flex",flexDirection:"column",gap:3,pointerEvents:"none" },
  viewDots: { position:"absolute",left:"50%",bottom:49,transform:"translateX(-50%)",zIndex:58,display:"flex",gap:8 },
  viewDot: { width:7,height:7,borderRadius:999,border:0,padding:0,background:"rgba(255,255,255,.25)",cursor:"pointer",transition:"all .3s ease" },
  viewDotActive: { width:27,background:"linear-gradient(90deg,#67e8f9,#a78bfa)",boxShadow:"0 0 12px rgba(103,232,249,.55)" },
  swipeHint: { position:"absolute",left:"50%",bottom:20,transform:"translateX(-50%)",zIndex:55,display:"flex",alignItems:"center",gap:13,color:"rgba(226,232,240,.62)",fontSize:8,letterSpacing:".15em",pointerEvents:"none" },
  deepNebula: { position:"absolute",left:"-20%",top:"8%",width:"180%",height:"68%",background:"radial-gradient(ellipse at 28% 35%,rgba(14,165,233,.15),transparent 25%),radial-gradient(ellipse at 67% 28%,rgba(168,85,247,.17),transparent 28%),radial-gradient(ellipse at 88% 62%,rgba(244,63,94,.1),transparent 23%)",filter:"blur(22px)",transition:"transform .12s linear",pointerEvents:"none" },
  deckArcNorth: { position:"absolute",left:"6%",right:"6%",top:"8%",height:"23%",borderRadius:"50%",borderTop:"5px solid rgba(103,232,249,.22)",boxShadow:"0 -8px 30px rgba(34,211,238,.08)" },
  deckArcSouth: { position:"absolute",left:"3%",right:"3%",bottom:"8%",height:"28%",borderRadius:"50%",borderBottom:"6px solid rgba(167,139,250,.2)",boxShadow:"0 10px 34px rgba(139,92,246,.09)" },
  skyBridgeOne: { position:"absolute",left:"18%",top:"30%",width:"31%",height:3,transform:"rotate(-5deg)",background:"linear-gradient(90deg,transparent,#67e8f9,transparent)",boxShadow:"0 0 16px rgba(103,232,249,.55)",opacity:.6 },
  skyBridgeTwo: { position:"absolute",left:"52%",top:"68%",width:"32%",height:3,transform:"rotate(4deg)",background:"linear-gradient(90deg,transparent,#c084fc,transparent)",boxShadow:"0 0 16px rgba(192,132,252,.48)",opacity:.55 },
  panoramaTitle: { position:"absolute",left:16,bottom:68,zIndex:55,maxWidth:"72%",padding:"11px 13px",borderRadius:16,background:"linear-gradient(135deg,rgba(4,15,35,.72),rgba(18,12,45,.55))",border:"1px solid rgba(103,232,249,.17)",backdropFilter:"blur(18px)",display:"flex",flexDirection:"column",gap:2,pointerEvents:"none" },
  panoramaRail: { position:"absolute",left:22,right:22,bottom:45,height:3,zIndex:57,borderRadius:99,background:"rgba(255,255,255,.12)",overflow:"visible" },
  panoramaRailFill: { height:"100%",borderRadius:99,background:"linear-gradient(90deg,#22d3ee,#a78bfa,#fb7185)",boxShadow:"0 0 12px rgba(103,232,249,.45)" },
  panoramaThumb: { position:"absolute",top:"50%",width:11,height:11,borderRadius:"50%",transform:"translate(-50%,-50%)",background:"#e0f2fe",boxShadow:"0 0 12px #67e8f9" },
  lensVignette: { position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 45%,rgba(0,2,10,.2) 72%,rgba(0,2,10,.68) 112%)",zIndex:40 },
  curvedHUDLeft: { position:"absolute",left:-34,top:"18%",width:76,height:"55%",borderRadius:"50%",borderRight:"1px solid rgba(103,232,249,.18)",boxShadow:"12px 0 35px rgba(34,211,238,.06)",pointerEvents:"none",zIndex:41 },
  curvedHUDRight: { position:"absolute",right:-34,top:"18%",width:76,height:"55%",borderRadius:"50%",borderLeft:"1px solid rgba(167,139,250,.18)",boxShadow:"-12px 0 35px rgba(139,92,246,.06)",pointerEvents:"none",zIndex:41 },
  panelBackdrop: { position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "72px 10px 10px", boxSizing: "border-box", background: "linear-gradient(180deg,transparent 18%,rgba(0,3,12,.38) 47%,rgba(0,3,12,.9))" },
  panel: { position: "relative", width: "min(620px,100%)", maxHeight: "64vh", overflowY: "auto", padding: "12px", boxSizing: "border-box", borderRadius: "22px 22px 16px 16px", background: "linear-gradient(180deg,rgba(12,25,49,.97),rgba(3,8,20,.985))", border: "1px solid", boxShadow: "0 -18px 60px rgba(0,0,0,.58)", animation: "stationPanelIn .38s ease-out both" },
  panelAccent: { position: "absolute", left: "18%", right: "18%", top: 0, height: 2, boxShadow: "0 0 18px currentColor" },
  panelHeader: { position: "sticky", top: -12, zIndex: 5, margin: "-12px -12px 10px", padding: "12px", display: "grid", gridTemplateColumns: "38px 1fr auto", alignItems: "center", gap: 9, background: "rgba(5,13,29,.94)", borderBottom: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(12px)" },
  panelBack: { width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 27, cursor: "pointer" },
  panelIdentity: { minWidth: 0, display: "flex", alignItems: "center", gap: 9 },
  panelIcon: { width: 37, height: 37, borderRadius: 12, border: "1px solid", display: "grid", placeItems: "center", background: "rgba(255,255,255,.04)", fontSize: 18, flexShrink: 0 },
  panelLevel: { padding: "7px 9px", borderRadius: 10, background: "rgba(255,255,255,.055)", color: "#cbd5e1", fontSize: 9, fontWeight: 900 },
  scanLine: { position: "absolute", left: 14, right: 14, top: 60, height: 1, opacity: .35, boxShadow: "0 0 12px currentColor", animation: "stationScan 5s linear infinite", pointerEvents: "none" },
  panelHero: { padding: 13, borderRadius: 16, background: "radial-gradient(circle at 100% 0%,rgba(34,211,238,.12),transparent 36%),rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.075)", marginBottom: 9 },
  metricGrid: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6, marginBottom: 9 },
  metric: { minHeight: 54, padding: 8, borderRadius: 13, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 },
  panelSection: { padding: 12, borderRadius: 16, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)", marginBottom: 9 },
  row: { minHeight: 35, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderBottom: "1px solid rgba(255,255,255,.055)", color: "#94a3b8", fontSize: 11 },
  launchButton: { width: "100%", minHeight: 48, border: 0, borderRadius: 15, background: "linear-gradient(135deg,#e11d48,#7c3aed,#0891b2)", color: "#fff", fontWeight: 950, letterSpacing: ".08em", cursor: "pointer", boxShadow: "0 0 25px rgba(244,63,94,.22)" },
  packList: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 },
  pack: { minHeight: 76, padding: 10, borderRadius: 14, background: "radial-gradient(circle at 0 0,rgba(52,211,153,.16),transparent 42%),rgba(255,255,255,.035)", border: "1px solid rgba(52,211,153,.16)", display: "flex", flexDirection: "column", gap: 4 },
  marketList: { display: "grid", gap: 7 },
  marketItem: { minHeight: 60, padding: 10, borderRadius: 14, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
};
