"use client";

import { useEffect, useMemo, useState } from "react";

const LINE_COUNT = 5;

function makeLine(id, unlocked = false) {
  return {
    id,
    unlocked,
    running: false,
    valve: 50,
    clog: 18,
    beltWidth: 42,
    heat: 52,
    hopper: 0,
    cart: 0,
    gateOpen: true,
    changingCart: false,
    changeTimer: 0,
    wetJam: 0,
    spill: 0,
    produced: 0,
    status: unlocked ? "Ready" : "Locked",
  };
}

const initialGame = {
  running: true,
  paused: false,
  time: 0,
  gold: 0,
  penalties: 0,
  cartsFilled: 0,
  selectedLineId: 1,
  message: "Manual operator mode. Start Line 1 and keep production stable.",
  lines: Array.from({ length: LINE_COUNT }, (_, index) => makeLine(index + 1, index === 0)),
};

export default function PixelFlowSurvival({ open, onClose }) {
  const [game, setGame] = useState(initialGame);

  const selectedLine = useMemo(() => {
    return game.lines.find((line) => line.id === game.selectedLineId) || game.lines[0];
  }, [game.lines, game.selectedLineId]);

  useEffect(() => {
    if (!open) return;

    setGame({
      ...initialGame,
      message: "Operator room started. Start Line 1 and watch the camera feeds.",
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!game.running) return;
    if (game.paused) return;

    const timer = window.setInterval(() => {
      setGame((current) => stepGame(current));
    }, 700);

    return () => window.clearInterval(timer);
  }, [open, game.running, game.paused]);

  if (!open) return null;

  function startLine(lineId) {
    setGame((current) => ({
      ...current,
      lines: current.lines.map((line) => {
        if (line.id !== lineId || !line.unlocked) return line;

        return {
          ...line,
          running: true,
          status: "Running",
        };
      }),
      selectedLineId: lineId,
      message: `Line ${lineId} started. Keep resin centered and change carts on time.`,
    }));
  }

  function stopLine(lineId) {
    setGame((current) => ({
      ...current,
      lines: current.lines.map((line) => {
        if (line.id !== lineId) return line;

        return {
          ...line,
          running: false,
          status: "Stopped",
        };
      }),
      message: `Line ${lineId} stopped. Production pauses, but hopper risks remain.`,
    }));
  }

  function adjustValve(lineId, amount) {
    setGame((current) => ({
      ...current,
      selectedLineId: lineId,
      lines: current.lines.map((line) => {
        if (line.id !== lineId || !line.unlocked) return line;

        const nextValve = clamp(line.valve + amount, 0, 100);

        return {
          ...line,
          valve: nextValve,
          status: amount > 0 ? "Valve opened" : "Valve closed",
        };
      }),
      message:
        amount > 0
          ? `Line ${lineId}: valve opened by 5%.`
          : `Line ${lineId}: valve closed by 5%.`,
    }));
  }

  function toggleGate(lineId) {
    setGame((current) => ({
      ...current,
      selectedLineId: lineId,
      lines: current.lines.map((line) => {
        if (line.id !== lineId || !line.unlocked) return line;

        return {
          ...line,
          gateOpen: !line.gateOpen,
          status: !line.gateOpen ? "Gate open" : "Gate closed",
        };
      }),
      message: `Line ${lineId}: bunker gate toggled.`,
    }));
  }

  function changeCart(lineId) {
    setGame((current) => ({
      ...current,
      selectedLineId: lineId,
      lines: current.lines.map((line) => {
        if (line.id !== lineId || !line.unlocked) return line;
        if (line.changingCart) return line;

        return {
          ...line,
          gateOpen: false,
          changingCart: true,
          changeTimer: 5,
          status: "Changing cart",
        };
      }),
      message: `Line ${lineId}: cart change started. Gate closed while cart moves out.`,
    }));
  }

  function unlockNextLine() {
    setGame((current) => {
      const nextLocked = current.lines.find((line) => !line.unlocked);
      if (!nextLocked) {
        return {
          ...current,
          message: "All lines are already unlocked.",
        };
      }

      const cost = nextLocked.id * 450;
      if (current.gold < cost) {
        return {
          ...current,
          message: `Need ${cost} gold to unlock Line ${nextLocked.id}.`,
        };
      }

      return {
        ...current,
        gold: current.gold - cost,
        selectedLineId: nextLocked.id,
        lines: current.lines.map((line) => {
          if (line.id !== nextLocked.id) return line;
          return makeLine(line.id, true);
        }),
        message: `Line ${nextLocked.id} unlocked. Manual load increased.`,
      };
    });
  }

  function togglePause() {
    setGame((current) => ({
      ...current,
      paused: !current.paused,
      message: !current.paused ? "Paused." : "Production resumed.",
    }));
  }

  function restartGame() {
    setGame({
      ...initialGame,
      message: "Operator room restarted. Start Line 1 again.",
    });
  }

  const gameOver = game.penalties >= 100;
  const activeLines = game.lines.filter((line) => line.unlocked).length;
  const nextLineCost = (activeLines + 1) * 450;

  return (
    <div style={styles.overlay}>
      <section style={styles.landscapeShell}>
        <header style={styles.topHud}>
          <div style={styles.modeBadge}>
            <span>OPERATOR MODE</span>
            <strong>MANUAL CONTROL</strong>
          </div>

          <Hud label="TIME" value={formatTime(game.time)} />
          <Hud label="GOLD" value={game.gold} />
          <Hud label="CARTS" value={game.cartsFilled} />
          <Hud label="PENALTY" value={`${game.penalties}%`} danger={game.penalties > 60} />

          <button style={styles.topButton} onClick={togglePause}>
            {game.paused ? "RESUME" : "PAUSE"}
          </button>

          <button style={styles.topButton} onClick={onClose}>
            EXIT
          </button>
        </header>

        <main style={styles.factoryRoom}>
          <section style={styles.linesArea}>
            {game.lines.map((line) => (
              <ProductionLine
                key={line.id}
                line={line}
                selected={line.id === game.selectedLineId}
                onSelect={() =>
                  setGame((current) => ({
                    ...current,
                    selectedLineId: line.id,
                    message: line.unlocked
                      ? `Line ${line.id} selected. Cameras switched.`
                      : `Line ${line.id} is locked.`,
                  }))
                }
                onStart={() => startLine(line.id)}
                onStop={() => stopLine(line.id)}
                onOpen={() => adjustValve(line.id, 5)}
                onCloseValve={() => adjustValve(line.id, -5)}
                onGate={() => toggleGate(line.id)}
                onCart={() => changeCart(line.id)}
              />
            ))}
          </section>

          <aside style={styles.rightPanel}>
            <section style={styles.messageBox}>
              <strong>STATUS</strong>
              <span>{game.message}</span>
            </section>

            <section style={styles.taskBox}>
              <strong>GOALS</strong>
              <span>Keep resin centered</span>
              <span>Dry before bunker</span>
              <span>Change carts on time</span>
              <span>Unlock more lines</span>
            </section>

            <button style={styles.unlockButton} onClick={unlockNextLine}>
              Unlock Next Line
              <small>{activeLines < LINE_COUNT ? `${nextLineCost} gold` : "complete"}</small>
            </button>
          </aside>
        </main>

        <section style={styles.cameraDock}>
          <CameraCard title="CAM 1 / PIPE" unlocked={selectedLine?.unlocked}>
            <PipeCamera line={selectedLine} />
          </CameraCard>

          <CameraCard title="CAM 2 / BELT TOP VIEW" unlocked={selectedLine?.unlocked}>
            <BeltCamera line={selectedLine} />
          </CameraCard>

          <CameraCard title="CAM 3 / BUNKER + CART" unlocked={selectedLine?.unlocked}>
            <BunkerCamera line={selectedLine} />
          </CameraCard>
        </section>

        {gameOver && (
          <section style={styles.gameOver}>
            <h2>Production Failed</h2>
            <p>
              Penalties reached 100%. Carts filled: <strong>{game.cartsFilled}</strong>.
            </p>
            <button style={styles.restartButton} onClick={restartGame}>
              Restart Factory
            </button>
          </section>
        )}
      </section>
    </div>
  );
}

function stepGame(current) {
  if (!current.running || current.paused) return current;

  let goldDelta = 0;
  let penaltyDelta = 0;
  let cartsDelta = 0;
  let message = current.message;

  const nextLines = current.lines.map((line) => {
    if (!line.unlocked) return line;

    let next = { ...line };

    if (next.changingCart) {
      next.changeTimer -= 1;

      if (next.changeTimer <= 0) {
        next.changingCart = false;
        next.cart = 0;
        next.gateOpen = true;
        next.status = "New cart ready";
        message = `Line ${next.id}: new empty cart arrived.`;
      }
    }

    if (!next.running) {
      if (next.hopper > 0 && !next.gateOpen) {
        next.hopper = clamp(next.hopper + 0.4, 0, 120);
      }

      if (next.hopper > 100) {
        penaltyDelta += 1;
        next.status = "Idle overflow risk";
      }

      return next;
    }

    const feed = clamp(next.valve - next.clog * 0.33, 0, 120);
    const heat = clamp(next.valve * 0.92 + feed * 0.18, 0, 120);
    const beltWidth = clamp(feed * 0.9 + next.valve * 0.16, 0, 120);

    next.beltWidth = beltWidth;
    next.heat = heat;

    next.clog = clamp(next.clog + 0.35 + Math.max(0, 42 - next.valve) * 0.015, 0, 100);

    if (next.valve > 60 && feed > 35) {
      next.clog = clamp(next.clog - (next.valve - 60) * 0.04, 0, 100);
    }

    const tooNarrow = beltWidth < 25;
    const idealWidth = beltWidth >= 35 && beltWidth <= 72;
    const tooWide = beltWidth > 88;
    const tooHot = heat > 76;
    const tooCold = heat < 34;

    let product = 0;

    if (idealWidth && !tooHot && !tooCold) {
      product = 4.5 + beltWidth * 0.035;
      next.status = "Stable product";
    } else if (tooNarrow) {
      product = 1.4;
      penaltyDelta += 0.4;
      next.status = "Weak stream";
    } else if (tooWide) {
      product = 2.0;
      next.spill = clamp(next.spill + 4, 0, 100);
      penaltyDelta += 1.2;
      next.status = "Belt edge spill";
      message = `Line ${next.id}: valve too open, resin is reaching belt edges.`;
    } else if (tooHot) {
      product = 2.2;
      next.wetJam = clamp(next.wetJam + 5, 0, 100);
      penaltyDelta += 1;
      next.status = "Wet bunker risk";
      message = `Line ${next.id}: product is too hot near bunker.`;
    } else {
      product = 2.4;
      penaltyDelta += 0.3;
      next.status = "Uneven drying";
    }

    next.hopper = clamp(next.hopper + product * 0.55, 0, 130);
    next.produced += product;

    if (next.gateOpen && !next.changingCart) {
      const transfer = Math.min(next.hopper, 6);
      next.hopper = clamp(next.hopper - transfer, 0, 130);
      next.cart = clamp(next.cart + transfer * 0.85, 0, 130);
    }

    if (!next.gateOpen && next.running) {
      next.hopper = clamp(next.hopper + 0.8, 0, 130);
    }

    if (next.cart >= 100) {
      if (next.gateOpen) {
        penaltyDelta += 1.4;
        next.status = "Cart overflow";
        message = `Line ${next.id}: cart is full. Close gate and change cart.`;
      } else {
        goldDelta += 160;
        cartsDelta += 1;
        next.cart = 0;
        next.status = "Cart counted";
        message = `Line ${next.id}: full cart secured. +160 gold.`;
      }
    }

    if (next.hopper > 100) {
      penaltyDelta += 1.8;
      next.status = "Bunker overflow";
      message = `Line ${next.id}: bunker is overflowing.`;
    }

    if (next.wetJam > 80) {
      penaltyDelta += 1.6;
      next.status = "Wet jam";
    }

    next.wetJam = clamp(next.wetJam - 1.1, 0, 100);
    next.spill = clamp(next.spill - 1.4, 0, 100);

    return next;
  });

  const nextPenalty = clamp(current.penalties + penaltyDelta, 0, 100);

  return {
    ...current,
    time: current.time + 1,
    gold: Math.floor(current.gold + goldDelta),
    penalties: Math.floor(nextPenalty),
    cartsFilled: current.cartsFilled + cartsDelta,
    lines: nextLines,
    message,
    running: nextPenalty < 100,
  };
}

function ProductionLine({
  line,
  selected,
  onSelect,
  onStart,
  onStop,
  onOpen,
  onCloseValve,
  onGate,
  onCart,
}) {
  const resinColor = getResinColor(line.heat);
  const steamWidth = clamp(line.heat - 35, 0, 65);
  const dryZone = clamp(100 - line.heat * 0.75, 12, 70);
  const productPieces = Math.max(2, Math.floor(line.beltWidth / 18));

  if (!line.unlocked) {
    return (
      <div style={{ ...styles.lineRow, ...styles.lockedLine }} onClick={onSelect}>
        <div style={styles.lockedValve}>LOCKED</div>
        <div style={styles.lockedBelt}>NO PRODUCT LINE</div>
        <div style={styles.lockedBunker}>NO CART</div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.lineRow,
        ...(selected ? styles.selectedLine : {}),
      }}
      onClick={onSelect}
    >
      <div style={styles.valvePanel}>
        <strong>LINE {line.id}</strong>
        <div style={styles.valveWheel}>◉</div>
        <span>VALVE {Math.round(line.valve)}%</span>

        <div style={styles.valveButtons}>
          <button style={styles.smallControl} onClick={(event) => stopEvent(event, onOpen)}>
            +
          </button>
          <button style={styles.smallControl} onClick={(event) => stopEvent(event, onCloseValve)}>
            −
          </button>
        </div>

        {!line.running ? (
          <button style={styles.lineStart} onClick={(event) => stopEvent(event, onStart)}>
            START
          </button>
        ) : (
          <button style={styles.lineStop} onClick={(event) => stopEvent(event, onStop)}>
            STOP
          </button>
        )}
      </div>

      <div style={styles.pipeNozzle}>
        <div style={styles.pipeBody}>
          <div
            style={{
              ...styles.pipeClog,
              width: `${line.clog}%`,
            }}
          />
          <div style={styles.pipeStream} />
        </div>
      </div>

      <div style={styles.belt}>
        <div
          style={{
            ...styles.steam,
            width: `${steamWidth}%`,
          }}
        />
        <div
          style={{
            ...styles.resinStrip,
            width: `${clamp(line.beltWidth, 8, 96)}%`,
            background: resinColor,
          }}
        />
        <div
          style={{
            ...styles.dryLayer,
            width: `${dryZone}%`,
          }}
        />
        <div style={styles.crackZone}>
          {Array.from({ length: productPieces }).map((_, index) => (
            <span key={index} style={styles.fallingPiece} />
          ))}
        </div>
      </div>

      <div style={styles.bunkerArea}>
        <div style={styles.bunkerTop}>
          <div
            style={{
              ...styles.hopperFill,
              height: `${clamp(line.hopper, 0, 100)}%`,
            }}
          />
        </div>

        <div style={styles.gateRow}>
          <button style={styles.gateButton} onClick={(event) => stopEvent(event, onGate)}>
            {line.gateOpen ? "CLOSE GATE" : "OPEN GATE"}
          </button>
        </div>

        <div style={styles.cartTrack}>
          <div
            style={{
              ...styles.cart,
              transform: line.changingCart ? "translateX(26px)" : "translateX(0)",
              opacity: line.changingCart ? 0.55 : 1,
            }}
          >
            <div
              style={{
                ...styles.cartFill,
                height: `${clamp(line.cart, 0, 100)}%`,
              }}
            />
          </div>
        </div>

        <button style={styles.cartButton} onClick={(event) => stopEvent(event, onCart)}>
          {line.changingCart ? `CHANGING ${line.changeTimer}` : "CHANGE CART"}
        </button>
      </div>
    </div>
  );
}

function CameraCard({ title, unlocked, children }) {
  return (
    <section style={styles.cameraCard}>
      <div style={styles.cameraTitle}>
        <span>{title}</span>
        <strong>{unlocked ? "LIVE" : "NO SIGNAL"}</strong>
      </div>
      <div style={styles.cameraScreen}>{unlocked ? children : <NoSignal />}</div>
    </section>
  );
}

function PipeCamera({ line }) {
  const resinColor = getResinColor(line.heat);

  return (
    <div style={styles.pipeCam}>
      <div style={styles.camValve}>VALVE {Math.round(line.valve)}%</div>
      <div style={styles.pipeCut}>
        <div
          style={{
            ...styles.pipeCutClog,
            width: `${line.clog}%`,
          }}
        />
        <div style={{ ...styles.pipeCutResin, background: resinColor }} />
      </div>
      <div style={styles.camInfo}>
        <span>CLOG {Math.round(line.clog)}%</span>
        <span>HEAT {Math.round(line.heat)}%</span>
      </div>
    </div>
  );
}

function BeltCamera({ line }) {
  const resinColor = getResinColor(line.heat);
  const steamLength = clamp(line.heat - 30, 5, 85);
  const width = clamp(line.beltWidth, 8, 96);

  return (
    <div style={styles.beltCam}>
      <div style={styles.topBeltRails}>
        <div
          style={{
            ...styles.topSteam,
            height: `${steamLength}%`,
          }}
        />
        <div
          style={{
            ...styles.topResin,
            width: `${width}%`,
            background: resinColor,
          }}
        />
        <div style={styles.topCracks}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function BunkerCamera({ line }) {
  return (
    <div style={styles.bunkerCam}>
      <div style={styles.camBeltEnd}>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div style={styles.camBunker}>
        <div
          style={{
            ...styles.camHopperFill,
            height: `${clamp(line.hopper, 0, 100)}%`,
          }}
        />
      </div>
      <div style={styles.camGate}>{line.gateOpen ? "GATE OPEN" : "GATE CLOSED"}</div>
      <div style={styles.camCart}>
        <div
          style={{
            ...styles.camCartFill,
            height: `${clamp(line.cart, 0, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function NoSignal() {
  return (
    <div style={styles.noSignal}>
      <span>NO SIGNAL</span>
    </div>
  );
}

function Hud({ label, value, danger }) {
  return (
    <div style={{ ...styles.hudBox, ...(danger ? styles.hudDanger : {}) }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function stopEvent(event, callback) {
  event.stopPropagation();
  callback();
}

function getResinColor(heat) {
  if (heat > 78) {
    return "linear-gradient(90deg, #fff1a8, #f59e0b, #f97316)";
  }

  if (heat < 35) {
    return "linear-gradient(90deg, #9a6a1f, #b7791f, #7c4a12)";
  }

  return "linear-gradient(90deg, #facc15, #f59e0b, #d97706)";
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 120,
    background:
      "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.16), transparent 32%), linear-gradient(180deg, #090909 0%, #17120a 100%)",
    color: "#f8fafc",
    overflow: "hidden",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  landscapeShell: {
    width: "100vw",
    height: "100vh",
    minHeight: 620,
    display: "grid",
    gridTemplateRows: "68px 1fr 170px",
    gap: 8,
    padding: 8,
    boxSizing: "border-box",
  },

  topHud: {
    display: "grid",
    gridTemplateColumns: "170px repeat(4, 1fr) 92px 72px",
    gap: 8,
  },

  modeBadge: {
    borderRadius: 8,
    border: "1px solid rgba(245,158,11,0.36)",
    background: "rgba(15,23,42,0.78)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 12px",
    color: "#fbbf24",
    fontWeight: 900,
    fontSize: 12,
  },

  hudBox: {
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.13)",
    background: "rgba(15,23,42,0.78)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: 900,
  },

  hudDanger: {
    border: "1px solid rgba(248,113,113,0.45)",
    color: "#fecaca",
  },

  topButton: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: 8,
    background: "rgba(255,255,255,0.055)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  factoryRoom: {
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "1fr 190px",
    gap: 8,
  },

  linesArea: {
    display: "grid",
    gridTemplateRows: "repeat(5, 1fr)",
    gap: 7,
    minHeight: 0,
  },

  lineRow: {
    position: "relative",
    minHeight: 76,
    display: "grid",
    gridTemplateColumns: "116px 84px 1fr 170px",
    gap: 8,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background:
      "linear-gradient(180deg, rgba(31,41,55,0.86), rgba(17,24,39,0.92))",
    padding: 6,
    boxSizing: "border-box",
    cursor: "pointer",
    overflow: "hidden",
  },

  selectedLine: {
    border: "1px solid rgba(251,191,36,0.55)",
    boxShadow: "0 0 22px rgba(251,191,36,0.12)",
  },

  lockedLine: {
    opacity: 0.42,
    gridTemplateColumns: "116px 1fr 150px",
  },

  lockedValve: {
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    background: "rgba(0,0,0,0.28)",
    color: "rgba(255,255,255,0.48)",
    fontWeight: 900,
  },

  lockedBelt: {
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    border: "1px dashed rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.35)",
    fontWeight: 900,
  },

  lockedBunker: {
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    background: "rgba(0,0,0,0.24)",
    color: "rgba(255,255,255,0.35)",
    fontWeight: 900,
  },

  valvePanel: {
    display: "grid",
    gridTemplateColumns: "1fr 30px",
    gridTemplateRows: "18px 1fr 18px 24px",
    gap: 4,
    alignItems: "center",
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: 900,
  },

  valveWheel: {
    gridColumn: "1 / 2",
    gridRow: "2 / 3",
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "3px solid #b45309",
    display: "grid",
    placeItems: "center",
    color: "#fbbf24",
    boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.42)",
  },

  valveButtons: {
    gridColumn: "2 / 3",
    gridRow: "1 / 5",
    display: "grid",
    gap: 4,
  },

  smallControl: {
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 6,
    background: "rgba(251,191,36,0.14)",
    color: "#fef3c7",
    fontWeight: 900,
    cursor: "pointer",
  },

  lineStart: {
    gridColumn: "1 / 3",
    border: 0,
    borderRadius: 6,
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 10,
  },

  lineStop: {
    gridColumn: "1 / 3",
    border: 0,
    borderRadius: 6,
    background: "linear-gradient(135deg, #991b1b, #ef4444)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 10,
  },

  pipeNozzle: {
    display: "flex",
    alignItems: "center",
  },

  pipeBody: {
    position: "relative",
    width: "100%",
    height: 34,
    borderRadius: 999,
    overflow: "hidden",
    background: "linear-gradient(180deg, #4b5563, #111827)",
    border: "1px solid rgba(255,255,255,0.16)",
  },

  pipeClog: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    background: "linear-gradient(90deg, rgba(92,38,8,0.4), rgba(41,21,7,0.95))",
  },

  pipeStream: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 12,
    height: 10,
    borderRadius: 999,
    background: "linear-gradient(90deg, #facc15, #f59e0b)",
    boxShadow: "0 0 12px rgba(245,158,11,0.4)",
  },

  belt: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    background:
      "repeating-linear-gradient(90deg, #111827 0px, #111827 22px, #1f2937 22px, #1f2937 44px)",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  resinStrip: {
    position: "absolute",
    left: "2%",
    top: "35%",
    height: "28%",
    borderRadius: 999,
    boxShadow: "0 0 18px rgba(245,158,11,0.28)",
  },

  steam: {
    position: "absolute",
    left: "4%",
    top: "4%",
    bottom: "4%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.3), transparent 62%)",
    opacity: 0.45,
    filter: "blur(5px)",
  },

  dryLayer: {
    position: "absolute",
    right: 0,
    top: "35%",
    height: "28%",
    background:
      "linear-gradient(90deg, rgba(120,53,15,0), rgba(120,53,15,0.35), rgba(250,204,21,0.15))",
  },

  crackZone: {
    position: "absolute",
    right: 0,
    top: "18%",
    bottom: "18%",
    width: 54,
  },

  fallingPiece: {
    position: "relative",
    display: "inline-block",
    width: 8,
    height: 8,
    margin: 2,
    borderRadius: 2,
    background: "#fbbf24",
    transform: "rotate(20deg)",
  },

  bunkerArea: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "70px 1fr",
    gridTemplateRows: "1fr 24px 34px",
    gap: 4,
  },

  bunkerTop: {
    gridRow: "1 / 3",
    position: "relative",
    overflow: "hidden",
    borderRadius: "8px 8px 4px 4px",
    background: "linear-gradient(180deg, #374151, #111827)",
    border: "1px solid rgba(255,255,255,0.14)",
  },

  hopperFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #fbbf24, #92400e)",
  },

  gateRow: {
    display: "grid",
  },

  gateButton: {
    border: 0,
    borderRadius: 6,
    background: "rgba(59,130,246,0.22)",
    color: "#bfdbfe",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 9,
  },

  cartTrack: {
    gridColumn: "1 / 2",
    gridRow: "3 / 4",
    position: "relative",
    overflow: "hidden",
    borderRadius: 5,
    background: "rgba(0,0,0,0.35)",
  },

  cart: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 2,
    height: 28,
    borderRadius: "4px 4px 8px 8px",
    background: "#4b5563",
    border: "1px solid rgba(255,255,255,0.2)",
    overflow: "hidden",
    transition: "0.35s ease",
  },

  cartFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #fbbf24, #a16207)",
  },

  cartButton: {
    gridColumn: "2 / 3",
    gridRow: "3 / 4",
    border: 0,
    borderRadius: 6,
    background: "rgba(251,191,36,0.18)",
    color: "#fde68a",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 9,
  },

  rightPanel: {
    display: "grid",
    gridTemplateRows: "92px 1fr 70px",
    gap: 8,
  },

  messageBox: {
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15,23,42,0.78)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },

  taskBox: {
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15,23,42,0.78)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },

  unlockButton: {
    border: 0,
    borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #f59e0b)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  cameraDock: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },

  cameraCard: {
    minHeight: 0,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15,23,42,0.82)",
    overflow: "hidden",
  },

  cameraTitle: {
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px",
    background: "rgba(0,0,0,0.35)",
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: 900,
  },

  cameraScreen: {
    position: "relative",
    height: 132,
    overflow: "hidden",
    background: "#050505",
  },

  noSignal: {
    height: "100%",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.28)",
    fontWeight: 900,
    letterSpacing: "0.16em",
  },

  pipeCam: {
    height: "100%",
    padding: 12,
    boxSizing: "border-box",
    display: "grid",
    gridTemplateRows: "24px 1fr 24px",
    gap: 8,
  },

  camValve: {
    color: "#fbbf24",
    fontWeight: 900,
    fontSize: 12,
  },

  pipeCut: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "linear-gradient(180deg, #6b7280, #111827)",
  },

  pipeCutClog: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    background: "linear-gradient(90deg, rgba(120,53,15,0.32), rgba(41,21,7,0.96))",
  },

  pipeCutResin: {
    position: "absolute",
    left: "8%",
    right: "8%",
    top: "38%",
    height: "24%",
    borderRadius: 999,
  },

  camInfo: {
    display: "flex",
    justifyContent: "space-between",
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
  },

  beltCam: {
    height: "100%",
    padding: 12,
    boxSizing: "border-box",
  },

  topBeltRails: {
    position: "relative",
    height: "100%",
    borderRadius: 10,
    background:
      "linear-gradient(90deg, #111827 0%, #1f2937 12%, #111827 12%, #111827 88%, #1f2937 88%, #111827 100%)",
    border: "1px solid rgba(255,255,255,0.14)",
    overflow: "hidden",
  },

  topSteam: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    background:
      "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.28), transparent 64%)",
    filter: "blur(6px)",
    opacity: 0.55,
  },

  topResin: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    transform: "translateX(-50%)",
    borderRadius: 999,
    opacity: 0.96,
  },

  topCracks: {
    position: "absolute",
    left: "18%",
    right: "18%",
    bottom: 8,
    height: 18,
    display: "flex",
    justifyContent: "space-around",
  },

  bunkerCam: {
    height: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 90px 1fr",
    gridTemplateRows: "42px 20px 1fr",
    gap: 6,
    padding: 10,
    boxSizing: "border-box",
  },

  camBeltEnd: {
    gridColumn: "1 / 2",
    gridRow: "1 / 4",
    borderRadius: 8,
    background: "rgba(31,41,55,0.92)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  camBunker: {
    gridColumn: "2 / 3",
    gridRow: "1 / 3",
    position: "relative",
    overflow: "hidden",
    borderRadius: "8px 8px 4px 4px",
    background: "#374151",
    border: "1px solid rgba(255,255,255,0.16)",
  },

  camHopperFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #fbbf24, #92400e)",
  },

  camGate: {
    gridColumn: "2 / 3",
    gridRow: "3 / 4",
    display: "grid",
    placeItems: "center",
    color: "#bfdbfe",
    fontSize: 10,
    fontWeight: 900,
  },

  camCart: {
    gridColumn: "3 / 4",
    gridRow: "2 / 4",
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    background: "#4b5563",
    border: "1px solid rgba(255,255,255,0.16)",
  },

  camCartFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #fbbf24, #a16207)",
  },

  gameOver: {
    position: "fixed",
    left: "50%",
    top: "50%",
    width: "min(420px, calc(100% - 28px))",
    transform: "translate(-50%, -50%)",
    zIndex: 150,
    borderRadius: 22,
    padding: 22,
    background: "rgba(15,23,42,0.97)",
    border: "1px solid rgba(248,113,113,0.42)",
    textAlign: "center",
    boxShadow: "0 30px 100px rgba(0,0,0,0.7)",
  },

  restartButton: {
    width: "100%",
    border: 0,
    borderRadius: 14,
    padding: "13px 16px",
    background: "linear-gradient(135deg, #7c3aed, #f59e0b)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};
