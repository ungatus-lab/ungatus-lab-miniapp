"use client";

import { useEffect, useMemo, useState } from "react";
import StationThreeView from "./StationThreeView";
import StationHomeHUD from "./StationHomeHUD";
import {
  MODULES,
  MODULE_DETAILS,
  PREMIUM_TIERS,
} from "./stationConfig";
import {
  completeMission,
  loadStationProgress,
  subscribeStationProgress,
} from "./stationProgress";

const COMPLEX_TO_MODULE = {
  nativeLab: "scanner",
  projectVault: "market",
  communityRelay: "collab",
  economyDock: "wallet",
};

export default function AccountStationPrototype({
  open = true,
  onClose,
  onOpenProfile,
  onLaunchGame,
  onLaunchTraining,
  telegramUser,
}) {
  const [activeId, setActiveId] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    setProgress(loadStationProgress());
    completeMission("openedStation");
    return subscribeStationProgress(setProgress);
  }, [open]);

  const active = useMemo(
    () => MODULES.find((module) => module.id === activeId) || null,
    [activeId]
  );

  if (!open) return null;

  function openComplex(complexId) {
    const moduleId = COMPLEX_TO_MODULE[complexId];
    if (!moduleId) return;

    if (complexId === "nativeLab") completeMission("viewedNativeLab");
    if (complexId === "projectVault") completeMission("viewedProjectVault");

    setActiveId(moduleId);
  }

  function launchTraining() {
    completeMission("viewedNativeLab");
    if (typeof onLaunchTraining === "function") {
      onLaunchTraining();
      return;
    }
    setActiveId("scanner");
  }

  function launchArena() {
    completeMission("playedArena");
    if (typeof onLaunchGame === "function") onLaunchGame();
  }

  return (
    <main style={styles.root}>
      <style>{css}</style>

      <section style={styles.viewport}>
        <StationThreeView onSelectModule={setActiveId} />
      </section>

      <StationHomeHUD
        telegramUser={telegramUser}
        onOpenProfile={onOpenProfile}
        onOpenModule={openComplex}
        onLaunchTraining={launchTraining}
        onLaunchArena={launchArena}
        compact={Boolean(active)}
      />

      {typeof onClose === "function" && !active && (
        <button
          type="button"
          style={styles.exitButton}
          onClick={onClose}
          aria-label="Закрыть станцию"
        >
          ×
        </button>
      )}

      {active && (
        <ModulePanel
          module={active}
          generation={progress?.station?.generation || 1}
          onClose={() => setActiveId(null)}
          onLaunchGame={launchArena}
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
      <section style={{ ...styles.panel, borderColor: `${module.color}55` }}>
        <div style={styles.sheetHandle} />

        <header style={styles.panelHeader}>
          <button
            type="button"
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть раздел"
          >
            ×
          </button>

          <span style={{ ...styles.panelIcon, color: module.color }}>
            {module.icon}
          </span>

          <div style={styles.panelIdentity}>
            <small>{module.subtitle}</small>
            <b>{module.title}</b>
          </div>

          <em>G{generation}</em>
        </header>

        <div style={styles.hero}>
          <small>STATION SYSTEM</small>
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
          <button type="button" style={styles.launchButton} onClick={onLaunchGame}>
            ENTER PVP RIFT
          </button>
        )}
      </section>
    </div>
  );
}

const css = `
button { touch-action: manipulation; }
@keyframes stationSheetOpen {
  from { opacity:0; transform:translateY(34px) scale(.985); }
  to { opacity:1; transform:none; }
}
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
  exitButton: {
    position: "absolute",
    zIndex: 96,
    top: "calc(max(10px, env(safe-area-inset-top)) + 9px)",
    right: 88,
    width: 38,
    height: 38,
    padding: 0,
    borderRadius: 13,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(3,9,22,.74)",
    backdropFilter: "blur(15px)",
    color: "rgba(255,255,255,.8)",
    fontSize: 22,
    cursor: "pointer",
  },
  panelShade: {
    position: "absolute",
    inset: 0,
    zIndex: 120,
    display: "flex",
    alignItems: "flex-end",
    padding: "12px 10px max(12px, env(safe-area-inset-bottom))",
    boxSizing: "border-box",
    background:
      "linear-gradient(180deg,transparent 5%,rgba(0,2,8,.22) 34%,rgba(0,2,8,.94) 76%)",
    backdropFilter: "blur(2px)",
  },
  panel: {
    width: "100%",
    maxHeight: "72vh",
    overflowY: "auto",
    padding: "8px 12px 14px",
    boxSizing: "border-box",
    borderRadius: "26px 26px 17px 17px",
    background:
      "radial-gradient(circle at 100% 0,rgba(34,211,238,.11),transparent 34%),linear-gradient(180deg,rgba(7,22,42,.98),rgba(2,7,17,.995))",
    border: "1px solid",
    boxShadow: "0 -30px 100px rgba(0,0,0,.82)",
    animation: "stationSheetOpen .34s ease-out",
  },
  sheetHandle: {
    width: 42,
    height: 4,
    margin: "0 auto 9px",
    borderRadius: 99,
    background: "rgba(255,255,255,.18)",
  },
  panelHeader: {
    display: "grid",
    gridTemplateColumns: "38px 40px 1fr auto",
    gap: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    padding: 0,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.05)",
    color: "white",
    fontSize: 20,
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
  panelIdentity: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  hero: {
    padding: 14,
    borderRadius: 17,
    background: "rgba(255,255,255,.035)",
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
    minHeight: 50,
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
