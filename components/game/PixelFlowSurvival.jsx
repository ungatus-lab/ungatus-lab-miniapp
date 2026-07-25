"use client";

import { useEffect, useMemo, useState } from "react";

const initialGame = {
  running: true,
  time: 0,
  score: 0,
  loss: 0,
  flow: 72,
  clog: 4,
  collector: 0,
  stability: 100,
  round: 1,
  scanSaved: false,
  autoEnabled: false,
  recordMode: false,
  learnedFixes: {
    narrow: false,
    overflow: false,
    jam: false,
  },
  status: "Virtual emulator feed started.",
  lastIssue: "normal",
};

export default function PixelFlowSurvival({ open, onClose }) {
  const [game, setGame] = useState(initialGame);

  const effectiveFlow = Math.max(0, Math.min(110, game.flow - game.clog * 0.62));
  const issue = getIssue(effectiveFlow, game.collector, game.loss);

  const pixelCells = useMemo(() => {
    return buildPixelCells(effectiveFlow, game.collector, issue, game.time);
  }, [effectiveFlow, game.collector, issue, game.time]);

  useEffect(() => {
    if (!open) return;

    setGame({
      ...initialGame,
      status: "Round 1 started. Keep the virtual process stable.",
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!game.running) return;

    const timer = window.setInterval(() => {
      setGame((current) => {
        if (!current.running) return current;

        const nextTime = current.time + 1;
        const round = 1 + Math.floor(nextTime / 45);

        let nextFlow = current.flow;
        let nextClog = current.clog + 0.18 + round * 0.035;
        let nextCollector = current.collector;
        let nextScore = current.score;
        let nextLoss = current.loss;
        let nextStatus = current.status;

        const effective = Math.max(0, Math.min(110, nextFlow - nextClog * 0.62));
        const currentIssue = getIssue(effective, current.collector, current.loss);

        if (current.autoEnabled) {
          if (currentIssue === "narrow" && current.learnedFixes.narrow) {
            nextFlow += 2.6;
            nextStatus = "Auto scenario: narrow-flow fix executed.";
          }

          if (currentIssue === "overflow" && current.learnedFixes.overflow) {
            nextFlow -= 3.2;
            nextStatus = "Auto scenario: overflow fix executed.";
          }

          if (currentIssue === "jam" && current.learnedFixes.jam) {
            nextCollector = Math.max(0, nextCollector - 7);
            nextFlow = Math.max(25, nextFlow - 1.2);
            nextStatus = "Auto scenario: collector-jam fix executed.";
          }
        }

        const adjustedEffective = Math.max(
          0,
          Math.min(110, nextFlow - nextClog * 0.62)
        );

        if (adjustedEffective >= 58 && adjustedEffective <= 82 && nextCollector < 62) {
          nextScore += 9 + round * 2;
          nextLoss = Math.max(0, nextLoss - 1.2);
          nextCollector = Math.max(0, nextCollector - 0.55);
        } else if (adjustedEffective < 42) {
          nextScore += 1;
          nextLoss += 2.2 + round * 0.25;
          nextStatus = "Warning: flow is too narrow. Process is losing output.";
        } else if (adjustedEffective > 90) {
          nextLoss += 3.5 + round * 0.32;
          nextCollector += 2.8 + round * 0.24;
          nextScore = Math.max(0, nextScore - 5);
          nextStatus = "Alarm: overflow detected near the channel edge.";
        } else {
          nextScore += 3;
          nextLoss += 0.8 + round * 0.12;
        }

        if (adjustedEffective > 78) {
          nextCollector += 0.8 + round * 0.08;
        }

        if (nextCollector > 78) {
          nextLoss += 2.4;
          nextStatus = "Alarm: collector jam is forming.";
        }

        nextFlow += Math.sin(nextTime / 5) * 0.45;
        nextFlow = Math.max(10, Math.min(105, nextFlow));
        nextClog = Math.max(0, Math.min(88, nextClog));
        nextCollector = Math.max(0, Math.min(100, nextCollector));
        nextLoss = Math.max(0, Math.min(100, nextLoss));

        const stability = Math.max(0, Math.min(100, 100 - nextLoss));

        if (nextLoss >= 100) {
          return {
            ...current,
            running: false,
            time: nextTime,
            score: Math.floor(nextScore),
            loss: 100,
            flow: nextFlow,
            clog: nextClog,
            collector: nextCollector,
            stability: 0,
            round,
            status: "Game Over. The virtual process collapsed.",
            lastIssue: "gameover",
          };
        }

        return {
          ...current,
          time: nextTime,
          score: Math.floor(nextScore),
          loss: nextLoss,
          flow: nextFlow,
          clog: nextClog,
          collector: nextCollector,
          stability,
          round,
          status: nextStatus,
          lastIssue: currentIssue,
        };
      });
    }, 700);

    return () => window.clearInterval(timer);
  }, [open, game.running, game.autoEnabled]);

  if (!open) return null;

  function adjustFlow(amount) {
    setGame((current) => {
      const nextFlow = Math.max(10, Math.min(105, current.flow + amount));
      const fixType = amount > 0 ? "narrow" : "overflow";
      const fixed = maybeRecordFix(current, fixType);

      return {
        ...current,
        ...fixed,
        flow: nextFlow,
        status:
          fixed.status ||
          (amount > 0 ? "Manual action: flow opened." : "Manual action: flow reduced."),
      };
    });
  }

  function cleanChannel() {
    setGame((current) => {
      const fixType = current.lastIssue === "jam" ? "jam" : "narrow";
      const fixed = maybeRecordFix(current, fixType);

      return {
        ...current,
        ...fixed,
        clog: Math.max(0, current.clog - 12),
        collector: Math.max(0, current.collector - 8),
        status: fixed.status || "Manual action: channel cleaned.",
      };
    });
  }

  function scanEtalon() {
    setGame((current) => ({
      ...current,
      scanSaved: true,
      status: "Etalon saved: 15-frame virtual buffer captured.",
    }));
  }

  function startRecordFix() {
    setGame((current) => ({
      ...current,
      recordMode: true,
      status: "Record Fix armed. Press the corrective action now.",
    }));
  }

  function toggleAuto() {
    setGame((current) => {
      const canAuto =
        current.learnedFixes.narrow ||
        current.learnedFixes.overflow ||
        current.learnedFixes.jam;

      if (!canAuto) {
        return {
          ...current,
          status: "Record at least one fix before enabling Auto Scenario.",
        };
      }

      return {
        ...current,
        autoEnabled: !current.autoEnabled,
        status: !current.autoEnabled
          ? "Auto Scenario enabled."
          : "Auto Scenario disabled.",
      };
    });
  }

  function restartGame() {
    setGame({
      ...initialGame,
      status: "Round restarted. Virtual emulator feed started.",
    });
  }

  const timeText = formatTime(game.time);
  const normal = issue === "normal";

  return (
    <div style={styles.overlay}>
      <section style={styles.gameShell}>
        <header style={styles.topBar}>
          <div>
            <p style={styles.kicker}>Scenario Survival</p>
            <h1 style={styles.title}>Pixel Flow</h1>
          </div>

          <button style={styles.exitButton} onClick={onClose}>
            Exit
          </button>
        </header>

        <section style={styles.hudGrid}>
          <Hud label="Round" value={game.round} />
          <Hud label="Time" value={timeText} />
          <Hud label="Score" value={game.score} />
          <Hud label="Stability" value={`${Math.floor(game.stability)}%`} />
        </section>

        <section
          style={{
            ...styles.feedFrame,
            ...(game.loss > 65 ? styles.feedFrameAlarm : {}),
          }}
        >
          <div style={styles.feedHeader}>
            <span>VIRTUAL EMULATOR / CAM-01</span>
            <strong>{normal ? "MATCH OK" : issue.toUpperCase()}</strong>
          </div>

          <div style={styles.pixelWorld}>
            <div style={styles.pipeBlock}>
              <div style={styles.pipeGlow} />
              <span>ENCODER</span>
            </div>

            <div style={styles.gateTrack}>
              <div
                style={{
                  ...styles.gateFill,
                  width: `${Math.max(8, Math.min(92, effectiveFlow))}%`,
                }}
              />
              <div style={styles.gateLabel}>FLOW {Math.floor(effectiveFlow)}%</div>
            </div>

            <div style={styles.scanGrid}>
              {pixelCells.map((cell, index) => (
                <span
                  key={`${cell}-${index}`}
                  style={{
                    ...styles.pixelCell,
                    ...(cell === "flow" ? styles.pixelFlow : {}),
                    ...(cell === "edge" ? styles.pixelEdge : {}),
                    ...(cell === "jam" ? styles.pixelJam : {}),
                    ...(cell === "scan" ? styles.pixelScan : {}),
                  }}
                />
              ))}
            </div>

            <div style={styles.collectorBox}>
              <span>COLLECTOR</span>
              <div style={styles.collectorTrack}>
                <div
                  style={{
                    ...styles.collectorFill,
                    height: `${game.collector}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={styles.scanLine} />
        </section>

        <section style={styles.metricsPanel}>
          <Metric label="Flow" value={Math.floor(game.flow)} danger={game.flow > 92} />
          <Metric label="Clog" value={Math.floor(game.clog)} danger={game.clog > 54} />
          <Metric
            label="Collector"
            value={Math.floor(game.collector)}
            danger={game.collector > 70}
          />
          <Metric label="Loss" value={Math.floor(game.loss)} danger={game.loss > 55} />
        </section>

        <section style={styles.statusBox}>
          <span style={styles.statusDot} />
          <p>{game.status}</p>
        </section>

        <section style={styles.toolPanel}>
          <button style={styles.actionButton} onClick={() => adjustFlow(-5)}>
            − Flow
          </button>

          <button style={styles.actionButton} onClick={() => adjustFlow(5)}>
            + Flow
          </button>

          <button style={styles.actionButton} onClick={cleanChannel}>
            Clean
          </button>

          <button
            style={{
              ...styles.actionButton,
              ...(game.scanSaved ? styles.actionButtonActive : {}),
            }}
            onClick={scanEtalon}
          >
            Scan
          </button>

          <button
            style={{
              ...styles.actionButton,
              ...(game.recordMode ? styles.actionButtonRecord : {}),
            }}
            onClick={startRecordFix}
          >
            Record Fix
          </button>

          <button
            style={{
              ...styles.actionButton,
              ...(game.autoEnabled ? styles.actionButtonActive : {}),
            }}
            onClick={toggleAuto}
          >
            Auto
          </button>
        </section>

        <section style={styles.learnedPanel}>
          <Badge active={game.scanSaved} label="Etalon" />
          <Badge active={game.learnedFixes.narrow} label="Narrow Fix" />
          <Badge active={game.learnedFixes.overflow} label="Overflow Fix" />
          <Badge active={game.learnedFixes.jam} label="Jam Fix" />
        </section>

        {!game.running && (
          <section style={styles.gameOver}>
            <h2>Game Over</h2>
            <p>
              Score: <strong>{game.score}</strong> · Time:{" "}
              <strong>{timeText}</strong>
            </p>
            <button style={styles.restartButton} onClick={restartGame}>
              Restart Round
            </button>
          </section>
        )}
      </section>
    </div>
  );
}

function maybeRecordFix(current, fixType) {
  if (!current.recordMode) return {};

  return {
    recordMode: false,
    learnedFixes: {
      ...current.learnedFixes,
      true,
    },
    status: `Fix recorded: ${fixType}. Auto Scenario can now use it.`,
  };
}

function getIssue(effectiveFlow, collector, loss) {
  if (loss >= 100) return "gameover";
  if (collector > 74) return "jam";
  if (effectiveFlow > 88) return "overflow";
  if (effectiveFlow < 44) return "narrow";
  return "normal";
}

function buildPixelCells(effectiveFlow, collector, issue, time) {
  const cells = [];
  const width = 14;
  const height = 8;
  const flowWidth = Math.max(2, Math.min(width, Math.round((effectiveFlow / 100) * width)));
  const start = Math.floor((width - flowWidth) / 2);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const scanPulse = (x + y + time) % 13 === 0;
      const inFlow = x >= start && x <= start + flowWidth;

      if (scanPulse) {
        cells.push("scan");
      } else if (collector > 72 && y > 5 && x > 8) {
        cells.push("jam");
      } else if (issue === "overflow" && (x === 0 || x === width - 1) && y > 1) {
        cells.push("edge");
      } else if (inFlow && y > 1 && y < 7) {
        cells.push("flow");
      } else {
        cells.push("empty");
      }
    }
  }

  return cells;
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function Hud({ label, value }) {
  return (
    <div style={styles.hudItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value, danger }) {
  return (
    <div style={styles.metricItem}>
      <span>{label}</span>
      <strong style={danger ? styles.metricDanger : undefined}>{value}%</strong>
    </div>
  );
}

function Badge({ active, label }) {
  return (
    <span
      style={{
        ...styles.badge,
        ...(active ? styles.badgeActive : {}),
      }}
    >
      {active ? "✓" : "○"} {label}
    </span>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 120,
    background:
      "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.16), transparent 34%), linear-gradient(180deg, #050505 0%, #111827 100%)",
    color: "#ffffff",
    overflowY: "auto",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  gameShell: {
    minHeight: "100vh",
    padding: "16px 14px 24px",
    boxSizing: "border-box",
  },

  topBar: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  kicker: {
    margin: 0,
    color: "#67e8f9",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  title: {
    margin: "3px 0 0",
    fontSize: 28,
    letterSpacing: "-0.04em",
  },

  exitButton: {
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: 999,
    padding: "10px 14px",
    color: "rgba(255,255,255,0.76)",
    background: "rgba(255,255,255,0.055)",
    cursor: "pointer",
    fontWeight: 800,
  },

  hudGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 7,
    marginBottom: 10,
  },

  hudItem: {
    minHeight: 54,
    borderRadius: 16,
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    padding: 9,
    boxSizing: "border-box",
    fontSize: 10,
    color: "rgba(255,255,255,0.52)",
  },

  feedFrame: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    background:
      "radial-gradient(circle at 20% 0%, rgba(139,92,246,0.22), transparent 30%), rgba(12,12,12,0.94)",
    border: "1px solid rgba(34,211,238,0.18)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    marginBottom: 10,
  },

  feedFrameAlarm: {
    border: "1px solid rgba(248,113,113,0.46)",
    boxShadow:
      "0 0 28px rgba(248,113,113,0.18), 0 20px 60px rgba(0,0,0,0.45)",
  },

  feedHeader: {
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    background: "rgba(0,0,0,0.42)",
    color: "rgba(255,255,255,0.56)",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.08em",
  },

  pixelWorld: {
    position: "relative",
    minHeight: 310,
    padding: 16,
    boxSizing: "border-box",
    display: "grid",
    gridTemplateRows: "52px 42px 1fr 52px",
    gap: 12,
  },

  pipeBlock: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 18,
    background: "linear-gradient(135deg, #1f2937, #111827)",
    border: "1px solid rgba(255,255,255,0.09)",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.64)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.1em",
  },

  pipeGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "rgba(34,211,238,0.18)",
    filter: "blur(16px)",
  },

  gateTrack: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 999,
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  gateFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #22d3ee, #8b5cf6, #ec4899)",
    transition: "width 0.22s ease",
  },

  gateLabel: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 900,
    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
  },

  scanGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(14, 1fr)",
    gap: 5,
    padding: 12,
    borderRadius: 18,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))",
    border: "1px solid rgba(255,255,255,0.07)",
  },

  pixelCell: {
    aspectRatio: "1 / 1",
    borderRadius: 5,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.03)",
  },

  pixelFlow: {
    background: "linear-gradient(135deg, #a855f7, #22d3ee)",
    boxShadow: "0 0 10px rgba(34,211,238,0.25)",
  },

  pixelEdge: {
    background: "#ef4444",
    boxShadow: "0 0 12px rgba(239,68,68,0.55)",
  },

  pixelJam: {
    background: "#f97316",
    boxShadow: "0 0 12px rgba(249,115,22,0.5)",
  },

  pixelScan: {
    background: "#86efac",
    boxShadow: "0 0 12px rgba(134,239,172,0.45)",
  },

  collectorBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 18,
    padding: "9px 12px",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
  },

  collectorTrack: {
    position: "relative",
    width: 42,
    height: 34,
    borderRadius: 10,
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
  },

  collectorFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #f97316, #ef4444)",
  },

  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "48%",
    height: 1,
    background: "rgba(134,239,172,0.52)",
    boxShadow: "0 0 14px rgba(134,239,172,0.42)",
  },

  metricsPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 7,
    marginBottom: 10,
  },

  metricItem: {
    borderRadius: 15,
    padding: 9,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
  },

  metricDanger: {
    color: "#fecaca",
  },

  statusBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    padding: "10px 12px",
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.07)",
    marginBottom: 10,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#22d3ee",
    boxShadow: "0 0 10px rgba(34,211,238,0.55)",
    flexShrink: 0,
  },

  toolPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 10,
  },

  actionButton: {
    minHeight: 48,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    background: "rgba(255,255,255,0.055)",
    color: "rgba(255,255,255,0.82)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
  },

  actionButtonActive: {
    background: "rgba(76,175,80,0.2)",
    border: "1px solid rgba(76,175,80,0.38)",
    color: "#ffffff",
  },

  actionButtonRecord: {
    background: "rgba(236,72,153,0.2)",
    border: "1px solid rgba(236,72,153,0.4)",
    color: "#ffffff",
  },

  learnedPanel: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 10,
  },

  badge: {
    padding: "7px 9px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: 800,
  },

  badgeActive: {
    color: "#bbf7d0",
    background: "rgba(76,175,80,0.14)",
    border: "1px solid rgba(76,175,80,0.3)",
  },

  gameOver: {
    position: "fixed",
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 130,
    borderRadius: 24,
    padding: 18,
    background: "rgba(18,18,18,0.96)",
    border: "1px solid rgba(248,113,113,0.3)",
    boxShadow: "0 -20px 60px rgba(0,0,0,0.56)",
    textAlign: "center",
  },

  restartButton: {
    width: "100%",
    border: 0,
    borderRadius: 16,
    padding: "13px 16px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
    cursor: "pointer",
    fontWeight: 900,
  },
};
