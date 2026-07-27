"use client";

import { useEffect, useRef, useState } from "react";

const WORLD_WIDTH = 2600;
const WORLD_HEIGHT = 1800;
const FOOD_COUNT = 220;
const WILD_COUNT = 28;

const initialProfile = {
  operatorTier: 1,
  emulators: 1,
  bestMass: 26,
  bestScore: 0,
};

function createFood(index) {
  return {
    id: `food-${index}-${Math.random()}`,
    x: rand(60, WORLD_WIDTH - 60),
    y: rand(60, WORLD_HEIGHT - 60),
    r: rand(3, 7),
    color: randomFrom(["#67e8f9", "#a7f3d0", "#fde68a", "#c4b5fd", "#f9a8d4"]),
  };
}

function createWild(index) {
  const size = rand(15, 56);

  return {
    id: `wild-${index}-${Math.random()}`,
    x: rand(130, WORLD_WIDTH - 130),
    y: rand(130, WORLD_HEIGHT - 130),
    r: size,
    vx: rand(-0.55, 0.55),
    vy: rand(-0.55, 0.55),
    hue: rand(0, 360),
  };
}

function createWorld() {
  return {
    food: Array.from({ length: FOOD_COUNT }, (_, index) => createFood(index)),
    wilds: Array.from({ length: WILD_COUNT }, (_, index) => createWild(index)),
  };
}

export default function PixelFlowSurvival({ open, onClose }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const worldRef = useRef(createWorld());
  const playerRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0 });
  const inputRef = useRef({ x: 0, y: 0, active: false });
  const lastTimeRef = useRef(0);

  const [screen, setScreen] = useState("menu");
  const [profile, setProfile] = useState(initialProfile);
  const [hud, setHud] = useState({
    mass: 26,
    score: 0,
    eaten: 0,
    status: "Ready",
  });
  const [stick, setStick] = useState({
    active: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!open) return;

    setScreen("menu");
    resetArena();

    setHud({
      mass: 26,
      score: 0,
      eaten: 0,
      status: "Ready",
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (screen !== "arena") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    resize();
    window.addEventListener("resize", resize);

    lastTimeRef.current = performance.now();

    function loop(time) {
      const dt = Math.min(32, time - lastTimeRef.current);
      lastTimeRef.current = time;

      updateArena(dt / 16.67);
      drawArena();

      rafRef.current = window.requestAnimationFrame(loop);
    }

    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [open, screen]);

  if (!open) return null;

  function resetArena() {
    worldRef.current = createWorld();

    playerRef.current = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      r: 26,
      mass: 26,
      score: 0,
      eaten: 0,
      shield: 210,
      alive: true,
      angle: 0,
    };

    const viewWidth = typeof window !== "undefined" ? window.innerWidth : 390;
    const viewHeight = typeof window !== "undefined" ? window.innerHeight : 720;

    cameraRef.current = {
      x: WORLD_WIDTH / 2 - viewWidth / 2,
      y: WORLD_HEIGHT / 2 - viewHeight / 2,
    };

    inputRef.current = {
      x: 0,
      y: 0,
      active: false,
    };

    setStick({
      active: false,
      x: 0,
      y: 0,
    });
  }

  function startGame() {
    resetArena();

    setHud({
      mass: 26,
      score: 0,
      eaten: 0,
      status: "Fresh core spawned. Use joystick to move.",
    });

    setScreen("arena");
  }

  function respawn() {
    resetArena();

    setHud({
      mass: 26,
      score: 0,
      eaten: 0,
      status: "Respawned with fresh shield.",
    });
  }

  function endRun() {
    const player = playerRef.current;

    if (player) {
      setProfile((current) => ({
        ...current,
        bestMass: Math.max(current.bestMass, Math.round(player.mass)),
        bestScore: Math.max(current.bestScore, Math.round(player.score)),
      }));
    }

    setScreen("menu");
  }

  function updateArena(speedScale) {
    const player = playerRef.current;
    const world = worldRef.current;

    if (!player || !player.alive) return;

    const input = inputRef.current;
    const inputPower = Math.hypot(input.x, input.y);
    const playerSpeed = clamp(4.45 - player.r * 0.019, 1.55, 4.45);

    if (inputPower > 0.05) {
      player.x += input.x * playerSpeed * speedScale;
      player.y += input.y * playerSpeed * speedScale;
      player.angle = Math.atan2(input.y, input.x);
    }

    player.x = clamp(player.x, player.r, WORLD_WIDTH - player.r);
    player.y = clamp(player.y, player.r, WORLD_HEIGHT - player.r);

    if (player.shield > 0) {
      player.shield -= speedScale;
    }

    for (const wild of world.wilds) {
      wild.x += wild.vx * speedScale;
      wild.y += wild.vy * speedScale;

      if (wild.x < wild.r || wild.x > WORLD_WIDTH - wild.r) {
        wild.vx *= -1;
      }

      if (wild.y < wild.r || wild.y > WORLD_HEIGHT - wild.r) {
        wild.vy *= -1;
      }
    }

    const remainingFood = [];

    for (const food of world.food) {
      const hit = Math.hypot(player.x - food.x, player.y - food.y) < player.r + food.r;

      if (hit) {
        player.mass += food.r * 0.22;
        player.r = Math.sqrt(player.mass) * 5.1;
        player.score += Math.round(food.r * 2);
        player.eaten += 1;
      } else {
        remainingFood.push(food);
      }
    }

    while (remainingFood.length < FOOD_COUNT) {
      remainingFood.push(createFood(remainingFood.length));
    }

    world.food = remainingFood;

    const nextWilds = [];

    for (const wild of world.wilds) {
      const hit = Math.hypot(player.x - wild.x, player.y - wild.y) < player.r + wild.r * 0.75;

      if (!hit) {
        nextWilds.push(wild);
        continue;
      }

      if (player.r > wild.r * 1.12) {
        player.mass += wild.r * 1.5;
        player.r = Math.sqrt(player.mass) * 5.1;
        player.score += Math.round(wild.r * 10);
        player.eaten += 1;
      } else if (player.shield <= 0) {
        player.alive = false;

        setHud((current) => ({
          ...current,
          status: "Core broken. Respawn or exit.",
        }));

        setProfile((current) => ({
          ...current,
          bestMass: Math.max(current.bestMass, Math.round(player.mass)),
          bestScore: Math.max(current.bestScore, Math.round(player.score)),
        }));

        nextWilds.push(wild);
      } else {
        nextWilds.push(wild);
      }
    }

    while (nextWilds.length < WILD_COUNT) {
      nextWilds.push(createWild(nextWilds.length));
    }

    world.wilds = nextWilds;

    const camera = cameraRef.current;
    const canvas = canvasRef.current;
    const viewWidth = canvas ? canvas.clientWidth : window.innerWidth;
    const viewHeight = canvas ? canvas.clientHeight : window.innerHeight;

    camera.x += (player.x - viewWidth / 2 - camera.x) * 0.085;
    camera.y += (player.y - viewHeight / 2 - camera.y) * 0.085;
    camera.x = clamp(camera.x, 0, WORLD_WIDTH - viewWidth);
    camera.y = clamp(camera.y, 0, WORLD_HEIGHT - viewHeight);

    setHud((current) => {
      const nextMass = Math.round(player.mass);
      const nextScore = Math.round(player.score);

      if (
        current.mass === nextMass &&
        current.score === nextScore &&
        current.eaten === player.eaten
      ) {
        return current;
      }

      return {
        mass: nextMass,
        score: nextScore,
        eaten: player.eaten,
        status:
          player.shield > 0
            ? `Fresh shield ${Math.ceil(player.shield / 60)}s`
            : "Eat small cores. Avoid larger wild cores.",
      };
    });
  }

  function drawArena() {
    const canvas = canvasRef.current;
    const player = playerRef.current;
    const world = worldRef.current;
    const camera = cameraRef.current;

    if (!canvas || !player) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    drawBackground(ctx, width, height, camera);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    drawWorldBorder(ctx);
    drawFood(ctx, world.food);
    drawWilds(ctx, world.wilds);
    drawPlayer(ctx, player);

    ctx.restore();
  }

  function startJoystick(event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    moveJoystick(event, centerX, centerY);
  }

  function moveJoystick(event, forcedCenterX, forcedCenterY) {
    const joystick = document.getElementById("macro-swarm-joystick");
    if (!joystick) return;

    const rect = joystick.getBoundingClientRect();
    const centerX = forcedCenterX ?? rect.left + rect.width / 2;
    const centerY = forcedCenterY ?? rect.top + rect.height / 2;

    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const max = 38;
    const limited = Math.min(max, dist);
    const nx = dist > 0 ? dx / dist : 0;
    const ny = dist > 0 ? dy / dist : 0;

    inputRef.current = {
      x: nx * (limited / max),
      y: ny * (limited / max),
      active: true,
    };

    setStick({
      active: true,
      x: nx * limited,
      y: ny * limited,
    });
  }

  function stopJoystick() {
    inputRef.current = {
      x: 0,
      y: 0,
      active: false,
    };

    setStick({
      active: false,
      x: 0,
      y: 0,
    });
  }

  return (
    <div style={styles.overlay}>
      {screen === "menu" && (
        <section style={styles.menuScreen}>
          <div style={styles.menuCard}>
            <p style={styles.kicker}>Core Field Prototype</p>
            <h1 style={styles.title}>Macro Swarm</h1>
            <p style={styles.menuText}>
              Minimal io-style field test. Start as a core, move with the temporary joystick,
              eat smaller targets and avoid bigger wild cores.
            </p>

            <div style={styles.profileGrid}>
              <ProfileStat label="Operator Tier" value={profile.operatorTier} />
              <ProfileStat label="Emulators" value={`${profile.emulators} / 3`} />
              <ProfileStat label="Best Mass" value={profile.bestMass} />
              <ProfileStat label="Best Score" value={profile.bestScore} />
            </div>

            <button style={styles.primaryButton} onClick={startGame}>
              START GAME
            </button>

            <button style={styles.secondaryButton} onClick={onClose}>
              EXIT
            </button>
          </div>
        </section>
      )}

      {screen === "arena" && (
        <section style={styles.arena}>
          <canvas ref={canvasRef} style={styles.canvas} />

          <header style={styles.arenaHud}>
            <div style={styles.hudPill}>
              <span>MASS</span>
              <strong>{hud.mass}</strong>
            </div>

            <div style={styles.hudPill}>
              <span>SCORE</span>
              <strong>{hud.score}</strong>
            </div>

            <div style={styles.hudWide}>
              <span>{hud.status}</span>
            </div>
          </header>

          <div
            id="macro-swarm-joystick"
            style={styles.joystick}
            onPointerDown={startJoystick}
            onPointerMove={(event) => {
              if (inputRef.current.active) {
                moveJoystick(event);
              }
            }}
            onPointerUp={stopJoystick}
            onPointerCancel={stopJoystick}
            onPointerLeave={stopJoystick}
          >
            <div
              style={{
                ...styles.joystickThumb,
                transform: `translate(${stick.x}px, ${stick.y}px)`,
              }}
            />
          </div>

          <footer style={styles.arenaControls}>
            <button style={styles.controlButton} onClick={respawn}>
              RESPAWN
            </button>

            <button style={styles.controlButton} onClick={endRun}>
              END RUN
            </button>

            <button style={styles.controlButton} onClick={onClose}>
              EXIT
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}

function drawBackground(ctx, width, height, camera) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#050816");
  gradient.addColorStop(0.55, "#07111f");
  gradient.addColorStop(1, "#020617");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(103,232,249,0.07)";
  ctx.lineWidth = 1;

  const grid = 72;
  const offsetX = -camera.x % grid;
  const offsetY = -camera.y % grid;

  for (let x = offsetX; x < width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(Math.floor(x), 0);
    ctx.lineTo(Math.floor(x), height);
    ctx.stroke();
  }

  for (let y = offsetY; y < height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, Math.floor(y));
    ctx.lineTo(width, Math.floor(y));
    ctx.stroke();
  }
}

function drawWorldBorder(ctx) {
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}

function drawFood(ctx, food) {
  for (const item of food) {
    ctx.beginPath();
    ctx.fillStyle = item.color;
    ctx.shadowColor = item.color;
    ctx.shadowBlur = 10;
    ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
}

function drawWilds(ctx, wilds) {
  for (const wild of wilds) {
    const color = `hsl(${wild.hue}, 78%, 58%)`;

    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.arc(wild.x + 5, wild.y + 6, wild.r * 1.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.arc(wild.x, wild.y, wild.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.34)";
    ctx.lineWidth = 2;
    ctx.arc(wild.x, wild.y, wild.r * 0.74, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(wild.r), wild.x, wild.y);
  }
}

function drawPlayer(ctx, player) {
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.arc(player.x + 7, player.y + 8, player.r * 1.04, 0, Math.PI * 2);
  ctx.fill();

  const gradient = ctx.createRadialGradient(
    player.x - player.r * 0.28,
    player.y - player.r * 0.28,
    player.r * 0.12,
    player.x,
    player.y,
    player.r
  );

  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.18, "#67e8f9");
  gradient.addColorStop(0.72, "#2563eb");
  gradient.addColorStop(1, "#1e1b4b");

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 24;
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  ctx.beginPath();
  ctx.fillStyle = "#bfdbfe";
  ctx.fillRect(player.r * 0.38, -player.r * 0.12, player.r * 0.72, player.r * 0.24);
  ctx.fill();

  ctx.restore();

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.44)";
  ctx.lineWidth = 3;
  ctx.arc(player.x, player.y, player.r * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  if (player.shield > 0) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(134,239,172,0.76)";
    ctx.lineWidth = 3;
    ctx.arc(player.x, player.y, player.r + 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CORE", player.x, player.y);
}

function ProfileStat({ label, value }) {
  return (
    <div style={styles.profileStat}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
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
      "radial-gradient(circle at 50% 0%, rgba(56,189,248,0.18), transparent 34%), linear-gradient(180deg, #020617 0%, #050816 100%)",
    color: "#ffffff",
    overflow: "hidden",
    touchAction: "none",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  menuScreen: {
    minHeight: "100vh",
    padding: 18,
    boxSizing: "border-box",
    display: "grid",
    placeItems: "center",
  },

  menuCard: {
    width: "min(430px, 100%)",
    borderRadius: 28,
    padding: 22,
    boxSizing: "border-box",
    background: "rgba(15,23,42,0.86)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.56)",
  },

  kicker: {
    margin: 0,
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },

  title: {
    margin: "6px 0 8px",
    fontSize: 38,
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },

  menuText: {
    margin: "0 0 18px",
    color: "rgba(255,255,255,0.64)",
    lineHeight: 1.45,
    fontSize: 14,
  },

  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    marginBottom: 16,
  },

  profileStat: {
    minHeight: 62,
    borderRadius: 16,
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 10,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
  },

  primaryButton: {
    width: "100%",
    minHeight: 54,
    border: 0,
    borderRadius: 18,
    background: "linear-gradient(135deg, #2563eb, #06b6d4)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    marginBottom: 8,
  },

  secondaryButton: {
    width: "100%",
    minHeight: 48,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    background: "rgba(255,255,255,0.055)",
    color: "rgba(255,255,255,0.82)",
    fontWeight: 900,
    cursor: "pointer",
  },

  arena: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    background: "#020617",
  },

  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    touchAction: "none",
  },

  arenaHud: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 10,
    display: "grid",
    gridTemplateColumns: "82px 82px 1fr",
    gap: 8,
    zIndex: 3,
    pointerEvents: "none",
  },

  hudPill: {
    height: 50,
    borderRadius: 16,
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    fontSize: 10,
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
  },

  hudWide: {
    height: 50,
    borderRadius: 16,
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    boxSizing: "border-box",
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: 800,
  },

  joystick: {
    position: "absolute",
    left: 18,
    bottom: 92,
    width: 112,
    height: 112,
    borderRadius: "50%",
    background: "rgba(15,23,42,0.58)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
    display: "grid",
    placeItems: "center",
    zIndex: 5,
    touchAction: "none",
  },

  joystickThumb: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #67e8f9, #2563eb)",
    boxShadow: "0 0 24px rgba(103,232,249,0.52)",
    transition: "transform 0.04s linear",
  },

  arenaControls: {
    position: "absolute",
    left: 142,
    right: 10,
    bottom: 10,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    zIndex: 4,
  },

  controlButton: {
    minHeight: 54,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    background: "rgba(15,23,42,0.88)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },
};
