"use client";

import { useEffect, useMemo, useState } from "react";

const STAGE_WIDTH = 1720;
const STAGE_HEIGHT = 980;
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
    status: unlocked ? "Ready" : "Locked",
  };
}

const initialGame = {
  running: true,
  paused: false,
  time: 0,
  gold: 0,
  penalty: 0,
  carts: 0,
  selectedLineId: 1,
  message: "Drag the factory floor. Start Line 1 and inspect the resin process.",
  lines: Array.from({ length: LINE_COUNT }, (_, index) =>
    makeLine(index + 1, index === 0)
  ),
};

export default function PixelFlowSurvival({ open, onClose }) {
  const [game, setGame] = useState(initialGame);
  const [view, setView] = useState({ x: -260, y: -130, scale: 0.72 });
  const [drag, setDrag] = useState(null);

  const selectedLine = useMemo(() => {
    return game.lines.find((line) => line.id === game.selectedLineId) || game.lines[0];
  }, [game.lines, game.selectedLineId]);

  useEffect(() => {
    if (!open) return;

    setGame({
      ...initialGame,
      message: "Factory floor loaded. Drag around, then start Line 1.",
    });

    setView({ x: -260, y: -130, scale: 0.72 });
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
      message: `Line ${lineId} started. Watch resin width, bunker and cart.`,
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

        return {
          ...line,
          valve: clamp(line.valve + amount, 0, 100),
          status: amount > 0 ? "Valve opened" : "Valve closed",
        };
      }),
      message:
        amount > 0
          ? `Line ${lineId}: valve opened.`
          : `Line ${lineId}: valve closed.`,
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
          status: !line.gateOpen ? "Gate opened" : "Gate closed",
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
      message: `Line ${lineId}: cart is moving out. Gate closed.`,
    }));
  }

  function unlockNextLine() {
    setGame((current) => {
      const nextLocked = current.lines.find((line) => !line.unlocked);

      if (!nextLocked) {
        return {
          ...current,
          message: "All lines unlocked.",
        };
      }

      const cost = nextLocked.id * 300;

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

  function resetView() {
    setView({ x: -260, y: -130, scale: 0.72 });
  }

  function zoom(delta) {
    setView((current) => ({
      ...current,
      scale: clamp(current.scale + delta, 0.48, 1.05),
    }));
  }

  function pointerDown(event) {
    setDrag({
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    });
  }

  function pointerMove(event) {
    if (!drag) return;

    const nextX = drag.originX + (event.clientX - drag.startX);
    const nextY = drag.originY + (event.clientY - drag.startY);

    setView({
      ...view,
      x: clamp(nextX, -STAGE_WIDTH * view.scale + 180, 80),
      y: clamp(nextY, -STAGE_HEIGHT * view.scale + 220, 80),
    });
  }

  function pointerUp() {
    setDrag(null);
  }

  const gameOver = game.penalty >= 100;

  return (
    <div style={styles.overlay}>
      <style>
        {`
          @keyframes beltMove {
            from { transform: translateX(0); }
            to { transform: translateX(-64px); }
          }

          @keyframes resinPulse {
            0% { filter: brightness(0.95); }
            50% { filter: brightness(1.18); }
            100% { filter: brightness(0.95); }
          }

          @keyframes steamFloat {
            0% { transform: translateY(0) scale(1); opacity: .34; }
            50% { transform: translateY(-7px) scale(1.08); opacity: .52; }
            100% { transform: translateY(0) scale(1); opacity: .34; }
          }

          @keyframes chunkFall {
            0% { transform: translateY(-3px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(32px) rotate(95deg); opacity: .25; }
          }
        `}
      </style>

      <header style={styles.hud}>
        <div style={styles.titleBox}>
          <span>RESIN FACTORY</span>
          <strong>BIG FLOOR TEST</strong>
        </div>

        <Hud label="TIME" value={formatTime(game.time)} />
        <Hud label="GOLD" value={game.gold} />
        <Hud label="CARTS" value={game.carts} />
        <Hud label="PENALTY" value={`${game.penalty}%`} danger={game.penalty > 60} />

        <button style={styles.hudButton} onClick={() => zoom(0.08)}>
          Z+
        </button>
        <button style={styles.hudButton} onClick={() => zoom(-0.08)}>
          Z-
        </button>
        <button style={styles.hudButton} onClick={resetView}>
          VIEW
        </button>
        <button style={styles.hudButton} onClick={onClose}>
          EXIT
        </button>
      </header>

      <main
        style={styles.viewport}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        <section
          style={{
            ...styles.stage,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <div style={styles.backWall} />
          <div style={styles.ceilingLights}>
            <span />
            <span />
            <span />
            <span />
          </div>
          <div style={styles.floor} />
          <div style={styles.floorGrid} />

          <div style={styles.feedHeader}>
            <div style={styles.greenLamp} />
            <strong>HOT RESIN FEED</strong>
          </div>

          <div style={styles.mainPipe} />
          <div style={styles.cartRailTop} />
          <div style={styles.cartRailBottom} />

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
                    ? `Line ${line.id} selected.`
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

          <div style={styles.observationDeck}>
            <strong>CONTROL DECK</strong>
            <span>{game.message}</span>
            <button style={styles.deckButton} onClick={(event) => stopEvent(event, unlockNextLine)}>
              Unlock Next Line
            </button>
          </div>
        </section>
      </main>

      <footer style={styles.bottomPanel}>
        <div style={styles.selectedInfo}>
          <strong>LINE {selectedLine?.id}</strong>
          <span>{selectedLine?.unlocked ? selectedLine.status : "Locked"}</span>
          <span>Valve {Math.round(selectedLine?.valve || 0)}%</span>
          <span>Cart {Math.round(selectedLine?.cart || 0)}%</span>
        </div>

        <button
          style={styles.bigButton}
          onClick={() =>
            selectedLine?.running
              ? stopLine(selectedLine.id)
              : startLine(selectedLine.id)
          }
        >
          {selectedLine?.running ? "STOP LINE" : "START LINE"}
        </button>

        <button style={styles.bigButton} onClick={() => adjustValve(selectedLine.id, -5)}>
          − VALVE
        </button>

        <button style={styles.bigButton} onClick={() => adjustValve(selectedLine.id, 5)}>
          + VALVE
        </button>

        <button style={styles.bigButton} onClick={() => toggleGate(selectedLine.id)}>
          GATE
        </button>

        <button style={styles.bigButton} onClick={() => changeCart(selectedLine.id)}>
          CART
        </button>
      </footer>

      {gameOver && (
        <section style={styles.gameOver}>
          <h2>Production Failed</h2>
          <p>Penalty reached 100%. Factory needs restart.</p>
          <button
            style={styles.restartButton}
            onClick={() =>
              setGame({
                ...initialGame,
                message: "Factory restarted. Drag the floor and start Line 1.",
              })
            }
          >
            Restart Factory
          </button>
        </section>
      )}
    </div>
  );
}

function stepGame(current) {
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
        message = `Line ${next.id}: new cart arrived.`;
      }
    }

    if (!next.running) return next;

    const feed = clamp(next.valve - next.clog * 0.28, 0, 120);
    const heat = clamp(next.valve * 0.9 + feed * 0.16, 0, 120);
    const beltWidth = clamp(feed * 0.9 + next.valve * 0.15, 0, 120);

    next.heat = heat;
    next.beltWidth = beltWidth;

    next.clog = clamp(next.clog + 0.25 + Math.max(0, 42 - next.valve) * 0.012, 0, 100);

    if (next.valve > 62 && feed > 35) {
      next.clog = clamp(next.clog - (next.valve - 62) * 0.04, 0, 100);
    }

    const tooNarrow = beltWidth < 25;
    const tooWide = beltWidth > 88;
    const tooHot = heat > 78;
    const ideal = beltWidth >= 35 && beltWidth <= 74 && !tooHot;

    let product = 0;

    if (ideal) {
      product = 5.4;
      next.status = "Stable";
    } else if (tooNarrow) {
      product = 1.6;
      penaltyDelta += 0.3;
      next.status = "Weak stream";
    } else if (tooWide) {
      product = 2.0;
      penaltyDelta += 1.1;
      next.status = "Edge spill";
      message = `Line ${next.id}: resin is too wide.`;
    } else if (tooHot) {
      product = 2.1;
      penaltyDelta += 0.9;
      next.status = "Too hot";
      message = `Line ${next.id}: product is too hot near the bunker.`;
    } else {
      product = 2.7;
      penaltyDelta += 0.2;
      next.status = "Uneven";
    }

    next.hopper = clamp(next.hopper + product * 0.55, 0, 130);

    if (next.gateOpen && !next.changingCart) {
      const transfer = Math.min(next.hopper, 6);
      next.hopper = clamp(next.hopper - transfer, 0, 130);
      next.cart = clamp(next.cart + transfer * 0.86, 0, 130);
    }

    if (!next.gateOpen) {
      next.hopper = clamp(next.hopper + 0.7, 0, 130);
    }

    if (next.cart >= 100) {
      if (next.gateOpen) {
        penaltyDelta += 1.2;
        next.status = "Cart overflow";
        message = `Line ${next.id}: cart is full.`;
      } else {
        goldDelta += 160;
        cartsDelta += 1;
        next.cart = 0;
        next.status = "Cart secured";
        message = `Line ${next.id}: cart secured. +160 gold.`;
      }
    }

    if (next.hopper > 100) {
      penaltyDelta += 1.4;
      next.status = "Bunker overflow";
    }

    return next;
  });

  const nextPenalty = clamp(current.penalty + penaltyDelta, 0, 100);

  return {
    ...current,
    time: current.time + 1,
    gold: Math.floor(current.gold + goldDelta),
    carts: current.carts + cartsDelta,
    penalty: Math.floor(nextPenalty),
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
  const y = 190 + index * 132;
  const activeOpacity = line.unlocked ? 1 : 0.28;
  const resinColor = getResinColor(line.heat);
  const steamWidth = clamp(line.heat - 35, 0, 72);
  const productPieces = Math.max(4, Math.floor(line.beltWidth / 16));

  return (
    <div
      style={{
        ...styles.lineGroup,
        top: y,
        opacity: activeOpacity,
        ...(selected ? styles.selectedLine : {}),
      }}
      onClick={onSelect}
    >
      <div style={styles.lineBaseShadow} />

      <div style={styles.machine}>
        <div style={styles.machineTop} />
        <div style={styles.machineBody} />
        <div style={styles.valveWheel} />
        <div style={styles.lineLabel}>L{line.id}</div>

        {line.unlocked && (
          <div style={styles.localControls}>
            <button style={styles.tinyButton} onClick={(event) => stopEvent(event, onOpen)}>
              +
            </button>
            <button style={styles.tinyButton} onClick={(event) => stopEvent(event, onCloseValve)}>
              −
            </button>
          </div>
        )}

        {line.unlocked && <div style={styles.valveText}>{Math.round(line.valve)}%</div>}
      </div>

      <div style={styles.nozzle}>
        <div
          style={{
            ...styles.nozzleClog,
            width: `${line.clog}%`,
          }}
        />
        {line.running && <div style={styles.nozzleLight} />}
      </div>

      <div style={styles.belt}>
        <div style={styles.beltTexture} />

        {line.running && line.unlocked && (
          <>
            <div
              style={{
                ...styles.steam,
                width: `${steamWidth}%`,
              }}
            />
            <div
              style={{
                ...styles.resin,
                width: `${clamp(line.beltWidth, 8, 96)}%`,
                background: resinColor,
              }}
            />
            <div style={styles.dryingShade} />
            <div style={styles.breakZone}>
              {Array.from({ length: productPieces }).map((_, pieceIndex) => (
                <span
                  key={pieceIndex}
                  style={{
                    ...styles.chunk,
                    left: `${10 + pieceIndex * 13}px`,
                    animationDelay: `${pieceIndex * 0.09}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {!line.unlocked && <div style={styles.lockedText}>LOCKED</div>}
        {line.unlocked && !line.running && <div style={styles.readyText}>READY</div>}
      </div>

      <div style={styles.bunker}>
        <div style={styles.bunkerCone}>
          <div
            style={{
              ...styles.hopperFill,
              height: `${clamp(line.hopper, 0, 100)}%`,
            }}
          />
        </div>

        <div style={styles.bunkerStand} />

        {line.unlocked && (
          <button style={styles.gateButton} onClick={(event) => stopEvent(event, onGate)}>
            {line.gateOpen ? "GATE" : "CLOSED"}
          </button>
        )}

        <div style={styles.cartSlot}>
          <div
            style={{
              ...styles.cart,
              transform: line.changingCart ? "translateX(58px)" : "translateX(0)",
              opacity: line.changingCart ? 0.58 : 1,
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
          <button style={styles.cartButton} onClick={(event) => stopEvent(event, onCart)}>
            {line.changingCart ? `${line.changeTimer}` : "CART"}
          </button>
        )}
      </div>

      {line.unlocked && (
        <button
          style={{
            ...styles.startButton,
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
      "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.2), transparent 34%), linear-gradient(180deg, #090909 0%, #17120a 100%)",
    color: "#f8fafc",
    overflow: "hidden",
    touchAction: "none",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  hud: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 10,
    zIndex: 20,
    display: "grid",
    gridTemplateColumns: "170px repeat(4, 1fr) 44px 44px 54px 54px",
    gap: 6,
    height: 58,
  },

  titleBox: {
    borderRadius: 15,
    border: "1px solid rgba(251,191,36,0.36)",
    background: "rgba(15,23,42,0.88)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 12px",
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: 900,
    boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
  },

  hudBox: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.13)",
    background: "rgba(15,23,42,0.88)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    color: "rgba(255,255,255,0.68)",
    fontSize: 10,
    fontWeight: 900,
  },

  hudDanger: {
    border: "1px solid rgba(248,113,113,0.48)",
    color: "#fecaca",
  },

  hudButton: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: 13,
    background: "rgba(255,255,255,0.07)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  viewport: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    cursor: "grab",
  },

  stage: {
    position: "absolute",
    left: 0,
    top: 0,
    transformOrigin: "0 0",
    borderRadius: 0,
    background:
      "radial-gradient(circle at 22% 12%, rgba(251,191,36,0.18), transparent 28%), radial-gradient(circle at 82% 10%, rgba(34,211,238,0.12), transparent 28%), linear-gradient(180deg, #243041 0%, #111827 38%, #080808 100%)",
  },

  backWall: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 180,
    background:
      "linear-gradient(180deg, rgba(148,163,184,0.12), rgba(15,23,42,0)), repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px, transparent 2px, transparent 90px)",
  },

  ceilingLights: {
    position: "absolute",
    left: 290,
    right: 290,
    top: 28,
    height: 34,
    display: "flex",
    justifyContent: "space-between",
  },

  floor: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 150,
    bottom: 0,
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.2), rgba(0,0,0,0.82))",
  },

  floorGrid: {
    position: "absolute",
    left: -80,
    right: -80,
    top: 140,
    bottom: -80,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "110px 72px",
    transform: "perspective(800px) rotateX(58deg) translateY(40px)",
    transformOrigin: "50% 0%",
    opacity: 0.36,
  },

  feedHeader: {
    position: "absolute",
    left: 70,
    top: 92,
    width: 230,
    height: 54,
    borderRadius: 18,
    border: "1px solid rgba(251,191,36,0.35)",
    background: "rgba(15,23,42,0.82)",
    color: "#fbbf24",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 18px",
    boxSizing: "border-box",
    boxShadow: "0 12px 36px rgba(0,0,0,0.34)",
  },

  greenLamp: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 18px rgba(34,197,94,0.86)",
  },

  mainPipe: {
    position: "absolute",
    left: 120,
    top: 150,
    bottom: 160,
    width: 42,
    borderRadius: 999,
    background: "linear-gradient(90deg, #475569, #111827)",
    border: "1px solid rgba(255,255,255,0.12)",
    opacity: 0.9,
  },

  cartRailTop: {
    position: "absolute",
    left: 1360,
    top: 130,
    bottom: 80,
    width: 4,
    background: "rgba(148,163,184,0.28)",
  },

  cartRailBottom: {
    position: "absolute",
    left: 1510,
    top: 130,
    bottom: 80,
    width: 4,
    background: "rgba(148,163,184,0.28)",
  },

  lineGroup: {
    position: "absolute",
    left: 88,
    width: 1460,
    height: 104,
    cursor: "pointer",
  },

  selectedLine: {
    filter: "drop-shadow(0 0 18px rgba(251,191,36,0.48))",
  },

  lineBaseShadow: {
    position: "absolute",
    left: 220,
    right: 64,
    bottom: 5,
    height: 18,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.38)",
    filter: "blur(8px)",
  },

  machine: {
    position: "absolute",
    left: 0,
    top: 8,
    width: 170,
    height: 88,
  },

  machineTop: {
    position: "absolute",
    left: 35,
    top: -16,
    width: 92,
    height: 34,
    borderRadius: "15px 15px 6px 6px",
    background: "linear-gradient(180deg, #6b7280, #374151)",
    border: "1px solid rgba(255,255,255,0.16)",
  },

  machineBody: {
    position: "absolute",
    inset: 0,
    borderRadius: 26,
    background:
      "linear-gradient(145deg, rgba(100,116,139,0.95), rgba(30,41,59,0.98) 54%, rgba(15,23,42,0.98))",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 16px 36px rgba(0,0,0,0.36)",
  },

  valveWheel: {
    position: "absolute",
    left: 26,
    top: 28,
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "7px solid #b45309",
    boxShadow: "inset 0 0 0 7px rgba(0,0,0,0.24)",
  },

  lineLabel: {
    position: "absolute",
    right: 28,
    top: 24,
    color: "#fbbf24",
    fontWeight: 900,
    fontSize: 20,
  },

  valveText: {
    position: "absolute",
    right: 24,
    bottom: 20,
    color: "#fde68a",
    fontWeight: 900,
    fontSize: 15,
  },

  localControls: {
    position: "absolute",
    left: 104,
    top: 28,
    display: "grid",
    gap: 5,
  },

  tinyButton: {
    width: 28,
    height: 24,
    border: "1px solid rgba(251,191,36,0.45)",
    borderRadius: 9,
    background: "rgba(251,191,36,0.18)",
    color: "#fde68a",
    fontWeight: 900,
    cursor: "pointer",
  },

  nozzle: {
    position: "absolute",
    left: 168,
    top: 38,
    width: 170,
    height: 32,
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
      "linear-gradient(90deg, rgba(120,53,15,0.18), rgba(41,21,7,0.94))",
  },

  nozzleLight: {
    position: "absolute",
    right: -10,
    top: 8,
    width: 38,
    height: 15,
    borderRadius: 999,
    background: "#facc15",
    boxShadow: "0 0 24px rgba(250,204,21,0.86)",
  },

  belt: {
    position: "absolute",
    left: 330,
    top: 18,
    width: 880,
    height: 70,
    borderRadius: 18,
    overflow: "hidden",
    transform: "skewX(-7deg)",
    background:
      "linear-gradient(180deg, rgba(31,41,55,0.96), rgba(15,23,42,0.98))",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow:
      "inset 0 0 22px rgba(255,255,255,0.04), 0 14px 34px rgba(0,0,0,0.36)",
  },

  beltTexture: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 14px, transparent 14px, transparent 44px)",
    animation: "beltMove 1.4s linear infinite",
  },

  steam: {
    position: "absolute",
    left: "3%",
    top: "-18%",
    bottom: "-18%",
    background:
      "radial-gradient(circle at 20% 45%, rgba(255,255,255,0.36), transparent 28%), radial-gradient(circle at 48% 50%, rgba(255,255,255,0.26), transparent 34%), radial-gradient(circle at 78% 42%, rgba(255,255,255,0.18), transparent 36%)",
    opacity: 0.45,
    filter: "blur(7px)",
    animation: "steamFloat 2s ease-in-out infinite",
  },

  resin: {
    position: "absolute",
    left: "4%",
    top: "31%",
    height: "38%",
    borderRadius: 999,
    boxShadow: "0 0 24px rgba(245,158,11,0.48)",
    animation: "resinPulse 1.4s ease-in-out infinite",
  },

  dryingShade: {
    position: "absolute",
    right: 0,
    top: "31%",
    width: "42%",
    height: "38%",
    background:
      "linear-gradient(90deg, rgba(120,53,15,0), rgba(120,53,15,0.28), rgba(252,211,77,0.08))",
  },

  breakZone: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 110,
  },

  chunk: {
    position: "absolute",
    top: 26,
    width: 11,
    height: 11,
    borderRadius: 3,
    background: "#fbbf24",
    boxShadow: "0 0 12px rgba(251,191,36,0.5)",
    animation: "chunkFall 0.9s ease-in-out infinite",
  },

  lockedText: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.26)",
    fontWeight: 900,
    letterSpacing: "0.18em",
  },

  readyText: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.36)",
    fontWeight: 900,
    letterSpacing: "0.18em",
  },

  bunker: {
    position: "absolute",
    left: 1230,
    top: 0,
    width: 200,
    height: 112,
  },

  bunkerCone: {
    position: "absolute",
    left: 28,
    top: 0,
    width: 74,
    height: 76,
    overflow: "hidden",
    borderRadius: "16px 16px 8px 8px",
    background: "linear-gradient(180deg, #6b7280, #1f2937)",
    border: "1px solid rgba(255,255,255,0.18)",
    clipPath: "polygon(0 0, 100% 0, 84% 100%, 16% 100%)",
  },

  hopperFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #fbbf24, #92400e)",
  },

  bunkerStand: {
    position: "absolute",
    left: 42,
    top: 70,
    width: 44,
    height: 24,
    borderLeft: "4px solid rgba(148,163,184,0.48)",
    borderRight: "4px solid rgba(148,163,184,0.48)",
  },

  gateButton: {
    position: "absolute",
    left: 110,
    top: 10,
    width: 66,
    height: 30,
    border: 0,
    borderRadius: 10,
    background: "rgba(59,130,246,0.25)",
    color: "#bfdbfe",
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
  },

  cartSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 38,
    borderRadius: 11,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.46)), repeating-linear-gradient(90deg, rgba(148,163,184,0.32) 0px, rgba(148,163,184,0.32) 2px, transparent 2px, transparent 24px)",
    overflow: "hidden",
  },

  cart: {
    position: "absolute",
    left: 22,
    bottom: 4,
    width: 76,
    height: 28,
    overflow: "hidden",
    borderRadius: "6px 6px 12px 12px",
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

  cartButton: {
    position: "absolute",
    right: 12,
    bottom: 5,
    width: 62,
    height: 28,
    border: 0,
    borderRadius: 10,
    background: "rgba(251,191,36,0.2)",
    color: "#fde68a",
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
  },

  startButton: {
    position: "absolute",
    left: 242,
    top: 10,
    width: 78,
    height: 34,
    border: 0,
    borderRadius: 12,
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 26px rgba(0,0,0,0.28)",
  },

  stopButton: {
    background: "linear-gradient(135deg, #991b1b, #ef4444)",
  },

  observationDeck: {
    position: "absolute",
    right: 70,
    top: 86,
    width: 250,
    minHeight: 170,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(15,23,42,0.88)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    color: "rgba(255,255,255,0.68)",
    boxShadow: "0 18px 54px rgba(0,0,0,0.38)",
  },

  deckButton: {
    marginTop: 8,
    border: 0,
    borderRadius: 14,
    padding: "12px 10px",
    background: "linear-gradient(135deg, #7c3aed, #f59e0b)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  bottomPanel: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    zIndex: 22,
    display: "grid",
    gridTemplateColumns: "1.3fr repeat(5, 1fr)",
    gap: 6,
    height: 74,
  },

  selectedInfo: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.13)",
    background: "rgba(15,23,42,0.9)",
    padding: "9px 11px",
    display: "grid",
    gap: 2,
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    fontWeight: 800,
  },

  bigButton: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 16,
    background:
      "linear-gradient(180deg, rgba(31,41,55,0.95), rgba(15,23,42,0.95))",
    color: "#fbbf24",
    fontWeight: 900,
    cursor: "pointer",
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
