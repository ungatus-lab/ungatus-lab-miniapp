"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getProgressSummary,
  loadStationProgress,
  subscribeStationProgress,
  xpRequiredForLevel,
} from "./stationProgress";

const COMPLEXES = [
  {
    id: "nativeLab",
    title: "NATIVE LAB",
    subtitle: "Scanner · Recorder · Multi-device",
    icon: "◉",
    color: "#55e7ff",
  },
  {
    id: "projectVault",
    title: "PROJECT VAULT",
    subtitle: "Blueprints · Scenarios · Catalog",
    icon: "▣",
    color: "#b99cff",
  },
  {
    id: "communityRelay",
    title: "NETWORK HUB",
    subtitle: "Squad · Collab · Referrals",
    icon: "⬡",
    color: "#78f0bd",
  },
  {
    id: "economyDock",
    title: "ECONOMY DOCK",
    subtitle: "UGT · Market · Allocation",
    icon: "◇",
    color: "#ffd36e",
  },
];

export default function StationHomeHUD({
  telegramUser,
  onOpenProfile,
  onOpenModule,
  onLaunchTraining,
  onLaunchArena,
  compact = false,
}) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProgress(loadStationProgress());
    return subscribeStationProgress(setProgress);
  }, []);

  const profileName =
    telegramUser?.first_name || telegramUser?.username || "SceneAgent";

  const summary = useMemo(
    () => (progress ? getProgressSummary(progress) : null),
    [progress]
  );

  if (!progress || !summary) return null;

  const xpRequired = xpRequiredForLevel(progress.operator.level);
  const xpPercent = Math.min(
    100,
    Math.round((progress.operator.xp / Math.max(1, xpRequired)) * 100)
  );

  const trainingFinished = progress.missions.completedTraining;
  const primaryLabel = trainingFinished ? "ПРОДОЛЖИТЬ ОБУЧЕНИЕ" : "НАЧАТЬ ОБУЧЕНИЕ";

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <header style={styles.topBar}>
        <button
          type="button"
          style={styles.profileButton}
          onClick={onOpenProfile}
          aria-label="Открыть профиль"
        >
          <span style={styles.avatar}>PG</span>
          <span style={styles.profileText}>
            <b>{profileName}</b>
            <small>
              {progress.operator.title} · LV {progress.operator.level}
            </small>
          </span>
        </button>

        <div style={styles.generationBadge}>
          <small>STATION</small>
          <b>G{progress.station.generation}</b>
        </div>
      </header>

      <section style={styles.progressCard}>
        <div style={styles.progressTop}>
          <span>OPERATOR XP</span>
          <b>
            {progress.operator.xp} / {xpRequired}
          </b>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${xpPercent}%` }} />
        </div>
        <div style={styles.quickStats}>
          <Metric label="UGT" value={summary.gameUgt} />
          <Metric label="STREAK" value={`${progress.operator.streak}D`} />
          <Metric label="RATING" value={progress.game.rating || "—"} />
        </div>
      </section>

      {!compact && (
        <section style={styles.moduleRail} aria-label="Системы станции">
          {COMPLEXES.map((complex) => {
            const unlocked = progress.unlocks[complex.id] !== false;
            return (
              <button
                key={complex.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onOpenModule?.(complex.id)}
                style={{
                  ...styles.moduleCard,
                  borderColor: `${complex.color}42`,
                  opacity: unlocked ? 1 : 0.5,
                }}
              >
                <span
                  style={{
                    ...styles.moduleIcon,
                    color: complex.color,
                    boxShadow: `0 0 22px ${complex.color}22`,
                  }}
                >
                  {complex.icon}
                </span>
                <span style={styles.moduleText}>
                  <b>{complex.title}</b>
                  <small>{unlocked ? complex.subtitle : "LOCKED"}</small>
                </span>
              </button>
            );
          })}
        </section>
      )}

      <section style={styles.bottomDock}>
        <div style={styles.missionCard}>
          <span style={styles.missionPulse} />
          <div>
            <small>CURRENT MISSION</small>
            <b>
              {trainingFinished
                ? "Проверь системы станции"
                : "Заверши первое обучение"}
            </b>
          </div>
          <span style={styles.reward}>+XP</span>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.trainingButton}
            onClick={onLaunchTraining}
          >
            <span>◎</span>
            <span>
              <small>NATIVE TRAINING</small>
              <b>{primaryLabel}</b>
            </span>
          </button>

          <button
            type="button"
            style={styles.arenaButton}
            onClick={onLaunchArena}
          >
            <span style={styles.arenaIcon}>⚔</span>
            <span>
              <small>PVP SIGNAL ONLINE</small>
              <b>В БОЙ</b>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={styles.metric}>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

const css = `
@keyframes stationHudPulse {
  0%,100% { opacity:.55; transform:scale(.9); }
  50% { opacity:1; transform:scale(1.15); }
}
@keyframes arenaGlow {
  0%,100% { box-shadow:0 0 22px rgba(244,63,94,.22); }
  50% { box-shadow:0 0 42px rgba(139,92,246,.34); }
}
`;

const glass = {
  background: "linear-gradient(145deg,rgba(5,12,27,.82),rgba(5,5,18,.68))",
  border: "1px solid rgba(155,225,255,.14)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const styles = {
  root: {
    position: "absolute",
    inset: 0,
    zIndex: 90,
    pointerEvents: "none",
    color: "#f4fbff",
    fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif",
  },
  topBar: {
    position: "absolute",
    top: "max(10px, env(safe-area-inset-top))",
    left: 10,
    right: 10,
    minHeight: 58,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "8px 9px",
    borderRadius: 20,
    boxSizing: "border-box",
    pointerEvents: "auto",
    ...glass,
  },
  profileButton: {
    minWidth: 0,
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 0,
    border: 0,
    background: "transparent",
    color: "white",
    textAlign: "left",
    cursor: "pointer",
  },
  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 13,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#0891b2,#7c3aed,#ec4899)",
    boxShadow: "0 0 24px rgba(34,211,238,.22)",
    fontSize: 11,
    fontWeight: 950,
  },
  profileText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  generationBadge: {
    minWidth: 66,
    height: 40,
    borderRadius: 13,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,211,238,.08)",
    border: "1px solid rgba(103,232,249,.2)",
  },
  progressCard: {
    position: "absolute",
    top: "calc(max(10px, env(safe-area-inset-top)) + 68px)",
    left: 10,
    right: 10,
    padding: "9px 11px",
    borderRadius: 17,
    pointerEvents: "none",
    ...glass,
  },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 8,
    letterSpacing: ".1em",
    color: "rgba(220,240,255,.68)",
  },
  progressTrack: {
    height: 5,
    margin: "7px 0 8px",
    overflow: "hidden",
    borderRadius: 99,
    background: "rgba(255,255,255,.08)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    background: "linear-gradient(90deg,#22d3ee,#8b5cf6,#ec4899)",
    boxShadow: "0 0 14px rgba(34,211,238,.45)",
    transition: "width .35s ease",
  },
  quickStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 6,
  },
  metric: {
    display: "flex",
    justifyContent: "space-between",
    gap: 5,
    fontSize: 10,
  },
  moduleRail: {
    position: "absolute",
    left: 10,
    right: 10,
    top: "calc(max(10px, env(safe-area-inset-top)) + 126px)",
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: 7,
    pointerEvents: "auto",
  },
  moduleCard: {
    minWidth: 0,
    minHeight: 49,
    padding: "7px 8px",
    borderRadius: 15,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "white",
    cursor: "pointer",
    ...glass,
  },
  moduleIcon: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: 10,
    background: "rgba(255,255,255,.045)",
    fontSize: 17,
  },
  moduleText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
  },
  bottomDock: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: "max(12px, env(safe-area-inset-bottom))",
    display: "grid",
    gap: 7,
    pointerEvents: "auto",
  },
  missionCard: {
    minHeight: 42,
    padding: "7px 10px",
    borderRadius: 15,
    display: "grid",
    gridTemplateColumns: "12px 1fr auto",
    gap: 8,
    alignItems: "center",
    ...glass,
  },
  missionPulse: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#67e8f9",
    boxShadow: "0 0 14px #22d3ee",
    animation: "stationHudPulse 1.8s infinite",
  },
  reward: {
    color: "#fde68a",
    fontSize: 10,
    fontWeight: 900,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1.08fr",
    gap: 7,
  },
  trainingButton: {
    minHeight: 58,
    padding: "8px 10px",
    borderRadius: 17,
    border: "1px solid rgba(103,232,249,.22)",
    display: "flex",
    alignItems: "center",
    gap: 9,
    background: "linear-gradient(135deg,rgba(6,78,99,.92),rgba(49,46,129,.88))",
    color: "white",
    textAlign: "left",
    cursor: "pointer",
  },
  arenaButton: {
    minHeight: 58,
    padding: "8px 11px",
    borderRadius: 17,
    border: "1px solid rgba(251,113,133,.28)",
    display: "flex",
    alignItems: "center",
    gap: 9,
    background: "linear-gradient(135deg,#be123c,#7c3aed 58%,#0369a1)",
    color: "white",
    textAlign: "left",
    cursor: "pointer",
    animation: "arenaGlow 2.2s infinite",
  },
  arenaIcon: {
    fontSize: 22,
    filter: "drop-shadow(0 0 8px rgba(255,255,255,.35))",
  },
  profileTextSmall: {},
};

