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
  message: "Start Line 1. Keep resin centered, dry it before the bunker, and change carts on time.",
  lines: Array.from({ length: LINE_COUNT }, (_, index) =>
    makeLine(index + 1, index === 0)
  ),
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
      message: "Factory room started. Start Line 1 and watch the camera feeds.",
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
      selectedLineId: lineId,
      lines: current.lines.map((line) => {
        if (line.id !== lineId || !line.unlocked) return line;

        return {
          ...line,
          running: true,
          status: "Running",
        };
      }),
      message: `Line ${lineId} started. Watch the belt edges and the cart.`,
    }));
  }

  function stopLine(lineId) {
    setGame((current) => ({
      ...current,
      selectedLineId: lineId,
      lines: current.lines.map((line) => {
        if (line.id !== lineId) return line;

        return {
          ...line,
          running: false,
          status: "Stopped",
        };
      }),
      message: `Line ${lineId} stopped.`,
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
      message: `Line ${lineId}: cart change started. Gate is closed while cart moves.`,
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
        message: `Line ${nextLocked.id} unlocked.`,
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
      message: "Factory restarted. Start Line 1 again.",
    });
  }

  const gameOver = game.penalties >= 100;
  const activeLines = game.lines.filter((line) => line.unlocked).length;
  const nextLineCost = (activeLines + 1) * 450;

  return (
    <div style={styles.overlay}>
      <section style={styles.shell}>
        <header style={styles.topHud}>
          <div style={styles.brandPanel}>
            <span>RESIN FACTORY</span>
            <strong>MANUAL OPERATOR</strong>
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

        <main style={styles.stageWrap}>
          <section style={styles.factoryStage}>
            <div style={styles.backWall} />
            <div style={styles.floorGrid} />
            <div style={styles.lightConeLeft} />
            <div style={styles.lightConeRight} />

            <div style={styles.pipeHeader}>
              <div style={styles.pipeHeaderLight} />
              <span>HOT RESIN FEED</span>
            </div>

            <div style={styles.cartRail} />

            {game.lines.map((line, index) => (
              <FactoryLine
                key={line.id}
                line={line}
                index={index}
                selected={line.id === game.selectedLineId}
                onSelect={() =>
                  setGame((current) => ({
                    ...current,
                    selectedLineId: line.id,
                    message: line.unlocked
                      ? `Line ${line.id} selected. Camera deck switched.`
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

            <aside style={styles.sideConsole}>
              <section style={styles.messageBox}>
                <strong>STATUS</strong>
                <span>{game.message}</span>
              </section>

              <button style={styles.unlockButton} onClick={unlockNextLine}>
                Unlock Next Line
                <small>{activeLines < LINE_COUNT ? `${nextLineCost} gold` : "complete"}</small>
              </button>

              <section style={styles.tipBox}>
                <strong>Manual rules</strong>
                <span>Too narrow: open valve.</span>
                <span>Too wide: close valve.</span>
                <span>Cart full: close gate, change cart.</span>
              </section>
            </aside>
          </section>
        </main>

        <section style={styles.cameraDock}>
          <CameraCard title="CAM 1 / PIPE CUT" unlocked={selectedLine?.unlocked}>
            <PipeCamera line={selectedLine} />
          </CameraCard>

          <CameraCard title="CAM 2 / BELT TOP VIEW" unlocked={selectedLine?.unlocked}>
            <BeltCamera line={selectedLine} />
          </CameraCard>

          <CameraCard title="CAM 3 / BUNKER RAIL" unlocked={selectedLine?.unlocked}>
            <BunkerCamera line={selectedLine} />
          </CameraCard>
        </section>

        {gameOver && (
          <section style={styles.gameOver}>
            <h2>Production Failed</h2>
            <p>
              Penalty reached 100%. Carts filled: <strong>{game.cartsFilled}</strong>.
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

    const next = { ...line };

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
      if (next.hopper > 100) {
        penaltyDelta += 0.8;
        next.status = "Idle overflow";
      }

      return next;
    }

    const feed = clamp(next.valve - next.clog * 0.33, 0, 120);
    const heat = clamp(next.valve * 0.92 + feed * 0.18, 0, 120);
    const beltWidth = clamp(feed * 0.9 + next.valve * 0.16, 0, 120);

    next.beltWidth = beltWidth;
    next.heat = heat;

    next.clog = clamp(
      next.clog + 0.35 + Math.max(0, 42 - next.valve) * 0.015,
      0,
      100
    );

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
      next.status = "Belt spill";
      message = `Line ${next.id}: resin is reaching the belt edge.`;
    } else if (tooHot) {
      product = 2.2;
      next.wetJam = clamp(next.wetJam + 5, 0, 100);
      penaltyDelta += 1;
      next.status = "Wet bunker risk";
      message = `Line ${next.id}: product is too hot near the bunker.`;
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

function FactoryLine({
  line,
  index,
  selected,
  onSelect,
  onStart,
  onStop,
  onOpen,
  onCloseValve,
  onGate,
  onCart,
}) {
  const top = 94 + index * 72;
  const resinColor = getResinColor(line.heat);
  const steamWidth = clamp(line.heat - 35, 0, 72);
  const dryWidth = clamp(100 - line.heat * 0.74, 12, 70);
  const productPieces = Math.max(3, Math.floor(line.beltWidth / 17));
  const activeOpacity = line.unlocked ? 1 : 0.27;

  return (
    <div
      style={{
        ...styles.factoryLine,
        top,
        opacity: activeOpacity,
        ...(selected ? styles.selectedFactoryLine : {}),
      }}
      onClick={onSelect}
    >
      <div style={styles.lineShadow} />

      <div style={styles.machineBase}>
        <div style={styles.machineCap} />
        <div style={styles.valveWheelLarge} />
        <div style={styles.valveLabel}>L{line.id}</div>

        {line.unlocked && (
          <div style={styles.valveControls}>
            <button style={styles.roundControl} onClick={(event) => stopEvent(event, onOpen)}>
              +
            </button>
            <button
              style={styles.roundControl}
              onClick={(event) => stopEvent(event, onCloseValve)}
            >
              -
            </button>
          </div>
        )}

        {line.unlocked && (
          <div style={styles.valvePercent}>{Math.round(line.valve)}%</div>
        )}
      </div>

      <div style={styles.nozzleBlock}>
        <div style={styles.nozzlePipe}>
          <div
            style={{
              ...styles.nozzleClog,
              width: `${line.clog}%`,
            }}
          />
          {line.running && <div style={styles.nozzleGlow} />}
        </div>
      </div>

      <div style={styles.longBelt}>
        <div style={styles.beltRails} />
        <div style={styles.beltMotion} />

        {line.unlocked && line.running && (
          <>
            <div
              style={{
                ...styles.steamCloud,
                width: `${steamWidth}%`,
              }}
            />
            <div
              style={{
                ...styles.resinRibbon,
                width: `${clamp(line.beltWidth, 8, 96)}%`,
                background: resinColor,
              }}
            />
            <div
              style={{
                ...styles.dryOverlay,
                width: `${dryWidth}%`,
              }}
            />
            <div style={styles.endCrackArea}>
              {Array.from({ length: productPieces }).map((_, pieceIndex) => (
                <span
                  key={pieceIndex}
                  style={{
                    ...styles.fallingChunk,
                    left: `${12 + pieceIndex * 10}px`,
                    animationDelay: `${pieceIndex * 0.12}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {!line.running && line.unlocked && (
          <div style={styles.idleBeltText}>READY</div>
        )}

        {!line.unlocked && <div style={styles.lockedText}>LOCKED LINE</div>}
      </div>

      <div style={styles.bunkerCluster}>
        <div style={styles.bunkerBody}>
          <div
            style={{
              ...styles.bunkerFill,
              height: `${clamp(line.hopper, 0, 100)}%`,
            }}
          />
        </div>

        <div style={styles.bunkerLegs} />

        {line.unlocked && (
          <button style={styles.gateSwitch} onClick={(event) => stopEvent(event, onGate)}>
            {line.gateOpen ? "GATE" : "CLOSED"}
          </button>
        )}

        <div style={styles.cartRails}>
          <div
            style={{
              ...styles.cartCar,
              transform: line.changingCart ? "translateX(42px)" : "translateX(0)",
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

        {line.unlocked && (
          <button style={styles.cartSwitch} onClick={(event) => stopEvent(event, onCart)}>
            {line.changingCart ? `CART ${line.changeTimer}` : "CHANGE"}
          </button>
        )}
      </div>

      {line.unlocked && (
        <button
          style={{
            ...styles.runButton,
            ...(line.running ? styles.stopButton : {}),
          }}
          onClick={(event) => stopEvent(event, line.running ? onStop : onStart)}
        >
          {line.running ? "STOP" : "START"}
        </button>
      )}
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
      <div style={styles.cameraGlow} />
      <div style={styles.pipeCutTitle}>VALVE {Math.round(line.valve)}%</div>
      <div style={styles.pipeCutView}>
        <div
          style={{
            ...styles.pipeCutClog,
            width: `${line.clog}%`,
          }}
        />
        <div
          style={{
            ...styles.pipeCutResin,
            background: resinColor,
          }}
        />
      </div>
      <div style={styles.cameraStats}>
        <span>CLOG {Math.round(line.clog)}%</span>
        <span>HEAT {Math.round(line.heat)}%</span>
      </div>
    </div>
  );
}

function BeltCamera({ line }) {
  const resinColor = getResinColor(line.heat);
  const steamLength = clamp(line.heat - 30, 5, 86);
  const width = clamp(line.beltWidth, 8, 96);

  return (
    <div style={styles.beltCam}>
      <div style={styles.cameraGlow} />
      <div style={styles.topBeltView}>
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
        <div style={styles.topEdgeGuardLeft} />
        <div style={styles.topEdgeGuardRight} />
        <div style={styles.topCracks}>
          <span />
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
      <div style={styles.cameraGlow} />
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
    return "linear-gradient(90deg, #fff7ad, #facc15, #f97316)";
  }

  if (heat < 35) {
    return "linear-gradient(90deg, #8a5a13, #b7791f, #6b3f0c)";
  }

  return "linear-gradient(90deg, #fde047, #f59e0b, #d97706)";
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
      "radial-gradient(circle at 45% 0%, rgba(245,158,11,0.22), transparent 34%), linear-gradient(180deg, #070707 0%, #15100a 100%)",
    color: "#f8fafc",
    overflow: "hidden",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  shell: {
    width: "100vw",
    height: "100vh",
    minHeight: 620,
    display: "grid",
    gridTemplateRows: "62px 1fr 168px",
    gap: 8,
    padding: 8,
    boxSizing: "border-box",
  },

  topHud: {
    display: "grid",
    gridTemplateColumns: "180px repeat(4, 1fr) 88px 72px",
    gap: 8,
  },

  brandPanel: {
    borderRadius: 14,
    border: "1px solid rgba(251,191,36,0.34)",
    background:
      "linear-gradient(180deg, rgba(31,41,55,0.92), rgba(15,23,42,0.88))",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 14px",
    color: "#fbbf24",
    fontWeight: 900,
    fontSize: 12,
    boxShadow: "inset 0 0 24px rgba(245,158,11,0.07)",
  },

  hudBox: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15,23,42,0.82)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    color: "rgba(255,255,255,0.64)",
    fontSize: 11,
    fontWeight: 900,
    boxShadow: "0 10px 30px rgba(0,0,0,0.24)",
  },

  hudDanger: {
    border: "1px solid rgba(248,113,113,0.46)",
    color: "#fecaca",
  },

  topButton: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.055)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  stageWrap: {
    minHeight: 0,
    overflow: "hidden",
  },

  factoryStage: {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: 380,
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "radial-gradient(circle at 22% 8%, rgba(251,191,36,0.16), transparent 26%), radial-gradient(circle at 82% 10%, rgba(34,211,238,0.1), transparent 28%), linear-gradient(180deg, #1f2937 0%, #111827 36%, #090909 100%)",
    boxShadow: "0 22px 70px rgba(0,0,0,0.54)",
  },

  backWall: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 96,
    background:
      "linear-gradient(180deg, rgba(148,163,184,0.12), rgba(15,23,42,0)), repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px, transparent 2px, transparent 72px)",
  },

  floorGrid: {
    position: "absolute",
    left: -40,
    right: -40,
    top: 86,
    bottom: 0,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "86px 54px",
    transform: "perspective(700px) rotateX(58deg) translateY(20px)",
    transformOrigin: "50% 0%",
    opacity: 0.36,
  },

  lightConeLeft: {
    position: "absolute",
    left: 120,
    top: 0,
    width: 260,
    height: 330,
    background:
      "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.18), transparent 66%)",
    filter: "blur(4px)",
    opacity: 0.75,
  },

  lightConeRight: {
    position: "absolute",
    right: 210,
    top: 0,
    width: 280,
    height: 340,
    background:
      "radial-gradient(circle at 50% 0%, rgba(56,189,248,0.12), transparent 66%)",
    filter: "blur(4px)",
    opacity: 0.7,
  },

  pipeHeader: {
    position: "absolute",
    left: 34,
    top: 34,
    width: 132,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(251,191,36,0.28)",
    background: "rgba(15,23,42,0.78)",
    color: "#fbbf24",
    fontSize: 10,
    fontWeight: 900,
    display: "grid",
    placeItems: "center",
    boxShadow: "0 10px 34px rgba(0,0,0,0.28)",
  },

  pipeHeaderLight: {
    position: "absolute",
    left: 12,
    top: 12,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 14px rgba(34,197,94,0.8)",
  },

  cartRail: {
    position: "absolute",
    right: 80,
    top: 78,
    bottom: 26,
    width: 190,
    borderLeft: "2px solid rgba(148,163,184,0.2)",
    borderRight: "2px solid rgba(148,163,184,0.2)",
    background:
      "repeating-linear-gradient(180deg, transparent 0px, transparent 34px, rgba(148,163,184,0.16) 34px, rgba(148,163,184,0.16) 38px)",
    opacity: 0.65,
  },

  factoryLine: {
    position: "absolute",
    left: 38,
    right: 288,
    height: 62,
    cursor: "pointer",
  },

  selectedFactoryLine: {
    filter: "drop-shadow(0 0 14px rgba(251,191,36,0.38))",
  },

  lineShadow: {
    position: "absolute",
    left: 150,
    right: -12,
    bottom: -10,
    height: 16,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.34)",
    filter: "blur(8px)",
  },

  machineBase: {
    position: "absolute",
    left: 0,
    top: 2,
    width: 104,
    height: 58,
    borderRadius: 18,
    background:
      "linear-gradient(145deg, #4b5563 0%, #1f2937 52%, #111827 100%)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow:
      "inset 0 0 18px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.34)",
  },

  machineCap: {
    position: "absolute",
    left: 12,
    top: -12,
    width: 64,
    height: 24,
    borderRadius: "12px 12px 4px 4px",
    background: "linear-gradient(180deg, #6b7280, #374151)",
    border: "1px solid rgba(255,255,255,0.14)",
  },

  valveWheelLarge: {
    position: "absolute",
    left: 14,
    top: 16,
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "4px solid #b45309",
    boxShadow: "inset 0 0 0 4px rgba(0,0,0,0.22)",
  },

  valveLabel: {
    position: "absolute",
    right: 12,
    top: 10,
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: 900,
  },

  valvePercent: {
    position: "absolute",
    right: 10,
    bottom: 10,
    color: "#fde68a",
    fontSize: 11,
    fontWeight: 900,
  },

  valveControls: {
    position: "absolute",
    left: 58,
    top: 15,
    display: "grid",
    gridTemplateRows: "1fr 1fr",
    gap: 4,
  },

  roundControl: {
    width: 24,
    height: 18,
    border: "1px solid rgba(251,191,36,0.45)",
    borderRadius: 8,
    background: "rgba(251,191,36,0.16)",
    color: "#fde68a",
    fontWeight: 900,
    cursor: "pointer",
    lineHeight: 1,
  },

  nozzleBlock: {
    position: "absolute",
    left: 104,
    top: 18,
    width: 90,
    height: 26,
  },

  nozzlePipe: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: "0 999px 999px 0",
    overflow: "hidden",
    background: "linear-gradient(180deg, #6b7280, #1f2937)",
    border: "1px solid rgba(255,255,255,0.16)",
  },

  nozzleClog: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    background:
      "linear-gradient(90deg, rgba(120,53,15,0.2), rgba(41,21,7,0.96))",
  },

  nozzleGlow: {
    position: "absolute",
    right: -8,
    top: 6,
    width: 28,
    height: 12,
    borderRadius: 999,
    background: "#facc15",
    boxShadow: "0 0 20px rgba(250,204,21,0.8)",
  },

  longBelt: {
    position: "absolute",
    left: 190,
    right: 132,
    top: 8,
    height: 46,
    borderRadius: 12,
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(31,41,55,0.95), rgba(15,23,42,0.98))",
    border: "1px solid rgba(255,255,255,0.14)",
    transform: "skewX(-7deg)",
    boxShadow:
      "inset 0 0 18px rgba(255,255,255,0.035), 0 10px 26px rgba(0,0,0,0.36)",
  },

  beltRails: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(148,163,184,0.22) 0px, transparent 7px, transparent calc(100% - 7px), rgba(148,163,184,0.22) 100%)",
  },

  beltMotion: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 12px, transparent 12px, transparent 32px)",
    animation: "none",
  },

  steamCloud: {
    position: "absolute",
    left: "3%",
    top: "-14%",
    bottom: "-14%",
    background:
      "radial-gradient(circle at 20% 45%, rgba(255,255,255,0.38), transparent 28%), radial-gradient(circle at 48% 50%, rgba(255,255,255,0.28), transparent 32%), radial-gradient(circle at 78% 42%, rgba(255,255,255,0.2), transparent 34%)",
    opacity: 0.48,
    filter: "blur(6px)",
  },

  resinRibbon: {
    position: "absolute",
    left: "4%",
    top: "31%",
    height: "38%",
    borderRadius: 999,
    boxShadow: "0 0 20px rgba(245,158,11,0.46)",
  },

  dryOverlay: {
    position: "absolute",
    right: 0,
    top: "31%",
    height: "38%",
    background:
      "linear-gradient(90deg, rgba(120,53,15,0), rgba(120,53,15,0.28), rgba(252,211,77,0.08))",
  },

  endCrackArea: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 78,
  },

  fallingChunk: {
    position: "absolute",
    top: 18,
    width: 9,
    height: 9,
    borderRadius: 3,
    background: "#fbbf24",
    transform: "rotate(18deg)",
    boxShadow: "0 0 10px rgba(251,191,36,0.45)",
  },

  idleBeltText: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.36)",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.16em",
  },

  lockedText: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.24)",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.16em",
  },

  bunkerCluster: {
    position: "absolute",
    right: 0,
    top: -8,
    width: 130,
    height: 82,
  },

  bunkerBody: {
    position: "absolute",
    left: 18,
    top: 0,
    width: 54,
    height: 56,
    borderRadius: "12px 12px 8px 8px",
    overflow: "hidden",
    background: "linear-gradient(180deg, #6b7280, #1f2937)",
    border: "1px solid rgba(255,255,255,0.18)",
    clipPath: "polygon(0 0, 100% 0, 86% 100%, 14% 100%)",
  },

  bunkerFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #fbbf24, #92400e)",
  },

  bunkerLegs: {
    position: "absolute",
    left: 24,
    top: 53,
    width: 42,
    height: 18,
    borderLeft: "3px solid rgba(148,163,184,0.5)",
    borderRight: "3px solid rgba(148,163,184,0.5)",
  },

  gateSwitch: {
    position: "absolute",
    left: 78,
    top: 5,
    width: 48,
    height: 25,
    border: 0,
    borderRadius: 8,
    background: "rgba(59,130,246,0.22)",
    color: "#bfdbfe",
    fontSize: 8,
    fontWeight: 900,
    cursor: "pointer",
  },

  cartRails: {
    position: "absolute",
    left: 4,
    right: 10,
    bottom: 0,
    height: 30,
    borderRadius: 8,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.42)), repeating-linear-gradient(90deg, rgba(148,163,184,0.3) 0px, rgba(148,163,184,0.3) 2px, transparent 2px, transparent 22px)",
    overflow: "hidden",
  },

  cartCar: {
    position: "absolute",
    left: 18,
    bottom: 3,
    width: 58,
    height: 23,
    borderRadius: "5px 5px 10px 10px",
    overflow: "hidden",
    background: "#475569",
    border: "1px solid rgba(255,255,255,0.22)",
    transition: "0.35s ease",
  },

  cartFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #fbbf24, #a16207)",
  },

  cartSwitch: {
    position: "absolute",
    right: 8,
    bottom: 3,
    width: 48,
    height: 24,
    border: 0,
    borderRadius: 8,
    background: "rgba(251,191,36,0.18)",
    color: "#fde68a",
    fontSize: 8,
    fontWeight: 900,
    cursor: "pointer",
  },

  runButton: {
    position: "absolute",
    left: 112,
    top: -2,
    width: 54,
    height: 22,
    border: 0,
    borderRadius: 8,
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 900,
    cursor: "pointer",
  },

  stopButton: {
    background: "linear-gradient(135deg, #991b1b, #ef4444)",
  },

  sideConsole: {
    position: "absolute",
    right: 16,
    top: 22,
    width: 246,
    bottom: 22,
    display: "grid",
    gridTemplateRows: "112px 62px 1fr",
    gap: 10,
  },

  messageBox: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15,23,42,0.84)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    boxShadow: "0 12px 36px rgba(0,0,0,0.28)",
  },

  unlockButton: {
    border: 0,
    borderRadius: 16,
    background: "linear-gradient(135deg, #7c3aed, #f59e0b)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },

  tipBox: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15,23,42,0.72)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 9,
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
  },

  cameraDock: {
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },

  cameraCard: {
    minHeight: 0,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.13)",
    background: "rgba(15,23,42,0.88)",
    overflow: "hidden",
    boxShadow: "0 14px 38px rgba(0,0,0,0.34)",
  },

  cameraTitle: {
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    background: "rgba(0,0,0,0.36)",
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.04em",
  },

  cameraScreen: {
    position: "relative",
    height: 130,
    overflow: "hidden",
    background:
      "radial-gradient(circle at 50% 20%, rgba(34,211,238,0.08), transparent 45%), #050505",
  },

  cameraGlow: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(34,211,238,0.08), transparent 34%), repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)",
    pointerEvents: "none",
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
    position: "relative",
    height: "100%",
    padding: 12,
    boxSizing: "border-box",
    display: "grid",
    gridTemplateRows: "20px 1fr 22px",
    gap: 8,
  },

  pipeCutTitle: {
    color: "#fbbf24",
    fontWeight: 900,
    fontSize: 12,
  },

  pipeCutView: {
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
    background:
      "linear-gradient(90deg, rgba(120,53,15,0.22), rgba(41,21,7,0.96))",
  },

  pipeCutResin: {
    position: "absolute",
    left: "7%",
    right: "7%",
    top: "37%",
    height: "26%",
    borderRadius: 999,
    boxShadow: "0 0 18px rgba(245,158,11,0.42)",
  },

  cameraStats: {
    display: "flex",
    justifyContent: "space-between",
    color: "rgba(255,255,255,0.64)",
    fontSize: 11,
    fontWeight: 800,
  },

  beltCam: {
    position: "relative",
    height: "100%",
    padding: 10,
    boxSizing: "border-box",
  },

  topBeltView: {
    position: "relative",
    height: "100%",
    borderRadius: 14,
    background:
      "linear-gradient(90deg, #111827 0%, #334155 11%, #111827 12%, #111827 88%, #334155 89%, #111827 100%)",
    border: "1px solid rgba(255,255,255,0.14)",
    overflow: "hidden",
  },

  topSteam: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    background:
      "radial-gradient(circle at 50% 16%, rgba(255,255,255,0.3), transparent 62%)",
    filter: "blur(6px)",
    opacity: 0.56,
  },

  topResin: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    transform: "translateX(-50%)",
    borderRadius: 999,
    opacity: 0.96,
    boxShadow: "0 0 18px rgba(245,158,11,0.3)",
  },

  topEdgeGuardLeft: {
    position: "absolute",
    left: "12%",
    top: 0,
    bottom: 0,
    width: 3,
    background: "rgba(34,197,94,0.44)",
  },

  topEdgeGuardRight: {
    position: "absolute",
    right: "12%",
    top: 0,
    bottom: 0,
    width: 3,
    background: "rgba(34,197,94,0.44)",
  },

  topCracks: {
    position: "absolute",
    left: "22%",
    right: "22%",
    bottom: 10,
    height: 18,
    display: "flex",
    justifyContent: "space-around",
  },

  bunkerCam: {
    position: "relative",
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
    borderRadius: 10,
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
    borderRadius: "10px 10px 5px 5px",
    background: "#475569",
    border: "1px solid rgba(255,255,255,0.16)",
    clipPath: "polygon(0 0, 100% 0, 86% 100%, 14% 100%)",
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
    borderRadius: 10,
    background: "#475569",
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
    borderRadius: 24,
    padding: 22,
    background: "rgba(15,23,42,0.97)",
    border: "1px solid rgba(248,113,113,0.42)",
    textAlign: "center",
    boxShadow: "0 30px 100px rgba(0,0,0,0.7)",
  },

  restartButton: {
    width: "100%",
    border: 0,
    borderRadius: 16,
    padding: "13px 16px",
    background: "linear-gradient(135deg, #7c3aed, #f59e0b)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
};
