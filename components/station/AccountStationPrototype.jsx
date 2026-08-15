"use client";

import { useMemo, useState } from "react";
import StationThreeView from "./StationThreeView";
import {
  MODULES,
  MODULE_DETAILS,
  PREMIUM_TIERS,
} from "./stationConfig";

export default function AccountStationPrototype({
  open = true,
  onClose,
  onLaunchGame,
  telegramUser,
}) {
  const [activeId, setActiveId] = useState(null);
  const [generation, setGeneration] = useState(1);

  const active = useMemo(
    () => MODULES.find((module) => module.id === activeId) || null,
    [activeId]
  );

  const accountName =
    telegramUser?.first_name || telegramUser?.username || "SceneAgent";

  if (!open) return null;

  return (
    <main style={styles.root}>
      <style>{css}</style>

      <section style={styles.viewport}>
        <StationThreeView onSelectModule={setActiveId} />
      </section>

      <header style={styles.header}>
        <button style={styles.backButton} onClick={onClose} aria-label="Назад">
          ‹
        </button>

        <div style={styles.identity}>
          <small>PIXELGRID // ORBITAL ACCOUNT</small>
          <strong>{accountName}</strong>
        </div>

        <button
          style={styles.generation}
          onClick={() =>
            setGeneration((value) => (value === 10 ? 1 : value + 1))
          }
        >
          <small>GENERATION</small>
          <b>G{generation}</b>
        </button>
      </header>

      <div style={styles.stats}>
        <Stat label="UGT" value="0" />
        <Stat label="STATUS" value="FREE" />
        <Stat label="EMULATORS" value="1 / 1" />
      </div>

      {!active && (
        <div style={styles.cameraHint}>
          КОСМОГОРОД · СВАЙП ИЛИ НАЖМИТЕ ЗДАНИЕ
        </div>
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
  const data = MODULE_DETAILS[module.id];
  if (!data) return null;

  return (
    <div
      style={styles.panelShade}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section style={{ ...styles.panel, borderColor: `${module.color}66` }}>
        <header style={styles.panelHeader}>
          <button style={styles.backButton} onClick={onClose} aria-label="Закрыть">
            ‹
          </button>
          <span style={{ ...styles.panelIcon, color: module.color }}>
            {module.icon}
          </span>
          <div>
            <small>{module.subtitle}</small>
            <b>{module.title}</b>
          </div>
          <em>G{generation}</em>
        </header>

        <div style={styles.hero}>
          <small>SELECTED STATION SYSTEM</small>
          <h2>{data.heading}</h2>
          <p>{data.text}</p>
        </div>

        <div style={styles.metricGrid}>
          {data.metrics.map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <b>{value}</b>
            </div>
          ))}
        </div>

        {module.id === "premium" ? (
          <div style={styles.packGrid}>
            {PREMIUM_TIERS.map(([tier, price, feature]) => (
              <div key={tier} style={styles.pack}>
                <b>{tier}</b>
                <span>{price}</span>
                <small>{feature}</small>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.detailRows}>
            {data.rows.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        )}

        {module.id === "game" && (
          <button style={styles.launchButton} onClick={onLaunchGame}>
            ENTER PVP RIFT
          </button>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

const css = `
button { touch-action: manipulation; }
@keyframes panelOpen {
  from { opacity: 0; transform: translateY(24px) scale(.98); }
  to { opacity: 1; transform: none; }
}
.identity small,
.generation small,
.stats small,
.panelHeader small,
.hero small,
.metricGrid small,
.pack small {
  font-size: 7px;
  letter-spacing: .1em;
  color: rgba(203,213,225,.62);
  font-weight: 900;
}
.identity strong { font-size: 14px; }
.generation b { font-size: 13px; }
.stats > div {
  min-width: 59px;
  padding: 6px 8px;
  border-radius: 11px;
  background: rgba(2,10,23,.72);
  border: 1px solid rgba(255,255,255,.09);
  backdrop-filter: blur(15px);
  display: flex;
  flex-direction: column;
}
.stats b { font-size: 12px; }
.panelHeader > div { display: flex; flex-direction: column; }
.panelHeader em {
  font-style: normal;
  padding: 7px 9px;
  border-radius: 10px;
  background: rgba(255,255,255,.05);
  font-size: 9px;
}
.hero h2 { margin: 5px 0 6px; font-size: 20px; }
.hero p {
  margin: 0;
  color: rgba(226,232,240,.66);
  font-size: 12px;
  line-height: 1.5;
}
.metricGrid > div {
  min-height: 52px;
  padding: 8px;
  border-radius: 13px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.metricGrid b { font-size: 11px; }
.detailRows > div {
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,.055);
  font-size: 10px;
}
.detailRows span { color: #94a3b8; }
.pack b { font-size: 11px; }
.pack span { font-size: 10px; color: #d1fae5; }
`;

const styles = {
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 180,
    overflow: "hidden",
    background: "#010207",
    color: "#f2fbff",
    fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif",
  },
  viewport: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    touchAction: "none",
    userSelect: "none",
    background: "#010207",
  },
  header: {
    position: "absolute",
    zIndex: 70,
    top: "max(10px, env(safe-area-inset-top))",
    left: 10,
    right: 10,
    height: 54,
    display: "grid",
    gridTemplateColumns: "42px 1fr auto",
    gap: 10,
    alignItems: "center",
    padding: "0 10px",
    borderRadius: 18,
    background: "linear-gradient(135deg,rgba(2,10,23,.78),rgba(11,8,30,.64))",
    border: "1px solid rgba(175,232,255,.16)",
    backdropFilter: "blur(22px)",
    boxShadow: "0 18px 55px rgba(0,0,0,.3)",
  },
  backButton: {
    width: 36,
    height: 36,
    padding: 0,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.055)",
    color: "white",
    fontSize: 27,
    cursor: "pointer",
  },
  identity: { minWidth: 0, display: "flex", flexDirection: "column" },
  generation: {
    minWidth: 66,
    height: 39,
    borderRadius: 12,
    border: "1px solid rgba(103,232,249,.2)",
    background: "rgba(4,31,46,.5)",
    color: "#e0fbff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  stats: {
    position: "absolute",
    zIndex: 75,
    top: "calc(max(10px, env(safe-area-inset-top)) + 64px)",
    left: 10,
    display: "flex",
    gap: 5,
  },
  cameraHint: {
    position: "absolute",
    zIndex: 60,
    left: "50%",
    bottom: "max(18px, env(safe-area-inset-bottom))",
    transform: "translateX(-50%)",
    padding: "7px 11px",
    borderRadius: 10,
    background: "rgba(2,10,23,.62)",
    border: "1px solid rgba(103,232,249,.13)",
    color: "rgba(226,232,240,.58)",
    fontSize: 7,
    letterSpacing: ".1em",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
  panelShade: {
    position: "absolute",
    inset: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
    padding: 10,
    boxSizing: "border-box",
    background: "linear-gradient(180deg,transparent 10%,rgba(0,2,8,.25) 42%,rgba(0,2,8,.96))",
  },
  panel: {
    width: "100%",
    maxHeight: "68vh",
    overflowY: "auto",
    padding: 12,
    boxSizing: "border-box",
    borderRadius: "24px 24px 16px 16px",
    background: "linear-gradient(180deg,rgba(7,22,42,.97),rgba(2,7,17,.99))",
    border: "1px solid",
    boxShadow: "0 -28px 90px rgba(0,0,0,.8)",
    animation: "panelOpen .38s ease-out",
  },
  panelHeader: {
    display: "grid",
    gridTemplateColumns: "38px 40px 1fr auto",
    gap: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  panelIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.05)",
    fontSize: 20,
  },
  hero: {
    padding: 14,
    borderRadius: 17,
    background: "radial-gradient(circle at 100% 0,rgba(103,232,249,.15),transparent 38%),rgba(255,255,255,.035)",
    border: "1px solid rgba(255,255,255,.075)",
    marginBottom: 9,
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 6,
  },
  detailRows: {
    marginTop: 9,
    padding: "4px 12px",
    borderRadius: 15,
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.07)",
  },
  packGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: 7,
    marginTop: 9,
  },
  pack: {
    padding: 11,
    borderRadius: 14,
    background: "rgba(52,211,153,.06)",
    border: "1px solid rgba(52,211,153,.17)",
    display: "flex",
    flexDirection: "column",
  },
  launchButton: {
    width: "100%",
    height: 50,
    marginTop: 10,
    border: 0,
    borderRadius: 15,
    background: "linear-gradient(135deg,#e11d48,#7c3aed,#0891b2)",
    color: "white",
    fontWeight: 950,
    letterSpacing: ".08em",
    boxShadow: "0 0 34px rgba(225,29,72,.25)",
  },
};
