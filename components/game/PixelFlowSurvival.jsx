"use client";

import { useEffect, useRef, useState } from "react";

const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 2200;
const MONSTER_COUNT = 38;
const TELEPORT_COOLDOWN_SECONDS = 15; // для теста; потом можно поставить 60
const MIN_ZOOM = 0.42;
const MAX_ZOOM = 1.45;

const initialProfile = {
  operatorTier: 1,
  emulators: 1,
  bestScore: 0,
  bestLevel: 1,
};

function createMonster(index) {
  const roll = Math.random();
  let type = "small";
  let r = rand(16, 28);
  let hp = Math.round(r * 6);
  let color = "#67e8f9";

  if (roll > 0.62 && roll <= 0.88) {
    type = "beast";
    r = rand(34, 54);
    hp = Math.round(r * 10);
    color = "#f59e0b";
  }

  if (roll > 0.88) {
    type = "giant";
    r = rand(68, 105);
    hp = Math.round(r * 18);
    color = "#ef4444";
  }

  return {
    id: `monster-${index}-${Math.random()}`,
    x: rand(140, WORLD_WIDTH - 140),
    y: rand(140, WORLD_HEIGHT - 140),
    r,
    hp,
    type,
    color,
    pulse: rand(0, Math.PI * 2),
  };
}

function createWorld() {
  return {
    monsters: Array.from({ length: MONSTER_COUNT }, (_, index) => createMonster(index)),
  };
}

export default function PixelFlowSurvival({ open, onClose }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const worldRef = useRef(createWorld());
  const playerRef = useRef(null);
  const cameraRef = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 0.82 });
  const pointerRef = useRef({
    pointers: new Map(),
    dragging: false,
    lastX: 0,
    lastY: 0,
    downX: 0,
    downY: 0,
    lastPinchDistance: 0,
  });
  const cooldownRef = useRef(0);
  const teleportModeRef = useRef(false);
  const lastTimeRef = useRef(0);

  const [screen, setScreen] = useState("menu");
  const [profile, setProfile] = useState(initialProfile);
  const [hud, setHud] = useState({
    level: 1,
    score: 0,
    cooldown: 0,
    teleportMode: false,
    status: "Ready",
  });

  useEffect(() => {
    if (!open) return;

    setScreen("menu");
    resetArena();
    setHud({
      level: 1,
      score: 0,
      cooldown: 0,
      teleportMode: false,
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
      const dt = Math.min(40, time - lastTimeRef.current);
      lastTimeRef.current = time;

      updateArena(dt / 1000);
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
      r: 30,
      level: 1,
      score: 0,
      shield: 180,
      alive: true,
    };

    cameraRef.current = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      zoom: 0.82,
    };

    pointerRef.current = {
      pointers: new Map(),
      dragging: false,
      lastX: 0,
      lastY: 0,
      downX: 0,
      downY: 0,
      lastPinchDistance: 0,
    };

    cooldownRef.current = 0;
    teleportModeRef.current = false;
  }

  function startGame() {
    resetArena();

    setHud({
      level: 1,
      score: 0,
      cooldown: 0,
      teleportMode: false,
      status: "Core spawned. Use TELEPORT, then tap the map.",
    });

    setScreen("arena");
  }

  function endRun() {
    const player = playerRef.current;

    if (player) {
      setProfile((current) => ({
        ...current,
        bestScore: Math.max(current.bestScore, Math.round(player.score)),
        bestLevel: Math.max(current.bestLevel, Math.round(player.level)),
      }));
    }

    setScreen("menu");
  }

  function respawn() {
    resetArena();

    setHud({
      level: 1,
      score: 0,
      cooldown: 0,
      teleportMode: false,
      status: "Respawned. Teleport is ready.",
    });
  }

  function centerCamera() {
    const player = playerRef.current;
    if (!player) return;

    cameraRef.current.x = player.x;
    cameraRef.current.y = player.y;
  }

  function activateTeleport() {
    if (cooldownRef.current > 0) {
      setHud((current) => ({
        ...current,
        status: `Teleport cooldown: ${Math.ceil(cooldownRef.current)}s`,
      }));
      return;
    }

    teleportModeRef.current = true;

    setHud((current) => ({
      ...current,
      teleportMode: true,
      status: "Teleport armed. Tap any point on the map.",
    }));
  }

  function updateArena(dt) {
    const player = playerRef.current;

    if (!player || !player.alive) return;

    if (cooldownRef.current > 0) {
      cooldownRef.current = Math.max(0, cooldownRef.current - dt);
    }

    if (player.shield > 0) {
      player.shield = Math.max(0, player.shield - dt * 60);
    }

    setHud((current) => {
      const nextCooldown = Math.ceil(cooldownRef.current);
      const nextLevel = Math.round(player.level);
      const nextScore = Math.round(player.score);

      if (
        current.cooldown === nextCooldown &&
        current.level === nextLevel &&
        current.score === nextScore &&
        current.teleportMode === teleportModeRef.current
      ) {
        return current;
      }

      return {
        ...current,
        level: nextLevel,
        score: nextScore,
        cooldown: nextCooldown,
        teleportMode: teleportModeRef.current,
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
    applyWorldTransform(ctx, width, height, camera);

    drawWorldBorder(ctx);
    drawMonsters(ctx, world.monsters);
    drawPlayer(ctx, player);
    drawTeleportPreview(ctx, player);

    ctx.restore();
  }

  function applyWorldTransform(ctx, width, height, camera) {
    ctx.translate(width / 2, height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
  }

  function screenToWorld(clientX, clientY) {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;

    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;

    return {
      x: clamp((sx - canvas.clientWidth / 2) / camera.zoom + camera.x, 0, WORLD_WIDTH),
      y: clamp((sy - canvas.clientHeight / 2) / camera.zoom + camera.y, 0, WORLD_HEIGHT),
    };
  }

  function teleportTo(clientX, clientY) {
    const player = playerRef.current;
    if (!player) return;
    if (cooldownRef.current > 0) return;

    const point = screenToWorld(clientX, clientY);

    player.x = clamp(point.x, player.r, WORLD_WIDTH - player.r);
    player.y = clamp(point.y, player.r, WORLD_HEIGHT - player.r);
    player.score += 1;

    cameraRef.current.x = player.x;
    cameraRef.current.y = player.y;

    cooldownRef.current = TELEPORT_COOLDOWN_SECONDS;
    teleportModeRef.current = false;

    setHud((current) => ({
      ...current,
      score: Math.round(player.score),
      cooldown: TELEPORT_COOLDOWN_SECONDS,
      teleportMode: false,
      status: "Teleport complete. Cooldown started.",
    }));
  }

  function onCanvasPointerDown(event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const pointers = pointerRef.current.pointers;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    pointerRef.current.dragging = false;
    pointerRef.current.lastX = event.clientX;
    pointerRef.current.lastY = event.clientY;
    pointerRef.current.downX = event.clientX;
    pointerRef.current.downY = event.clientY;

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      pointerRef.current.lastPinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function onCanvasPointerMove(event) {
    const pointerState = pointerRef.current;
    const pointers = pointerState.pointers;

    if (!pointers.has(event.pointerId)) return;

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (pointerState.lastPinchDistance > 0) {
        const ratio = distance / pointerState.lastPinchDistance;
        zoomCamera(ratio);
      }

      pointerState.lastPinchDistance = distance;
      pointerState.dragging = true;
      return;
    }

    if (pointers.size === 1) {
      const dx = event.clientX - pointerState.lastX;
      const dy = event.clientY - pointerState.lastY;
      const totalMove = Math.hypot(event.clientX - pointerState.downX, event.clientY - pointerState.downY);

      if (totalMove > 6) {
        pointerState.dragging = true;
      }

      panCamera(dx, dy);

      pointerState.lastX = event.clientX;
      pointerState.lastY = event.clientY;
    }
  }

  function onCanvasPointerUp(event) {
    const pointerState = pointerRef.current;
    const wasTap = !pointerState.dragging;

    pointerState.pointers.delete(event.pointerId);
    pointerState.lastPinchDistance = 0;

    if (wasTap && teleportModeRef.current && cooldownRef.current <= 0) {
      teleportTo(event.clientX, event.clientY);
    }
  }

  function onCanvasWheel(event) {
    event.preventDefault();

    const ratio = event.deltaY < 0 ? 1.08 : 0.92;
    zoomCamera(ratio);
  }

  function panCamera(dx, dy) {
    const camera = cameraRef.current;

    camera.x = clamp(camera.x - dx / camera.zoom, 0, WORLD_WIDTH);
    camera.y = clamp(camera.y - dy / camera.zoom, 0, WORLD_HEIGHT);
  }

  function zoomCamera(ratio) {
    const camera = cameraRef.current;
    camera.zoom = clamp(camera.zoom * ratio, MIN_ZOOM, MAX_ZOOM);
  }

  return (
    <div style={styles.overlay}>
      {screen === "menu" && (
        <section style={styles.menuScreen}>
          <div style={styles.menuCard}>
            <p style={styles.kicker}>Core Field Prototype</p>
            <h1 style={styles.title}>Macro Swarm</h1>
            <p style={styles.menuText}>
              Minimal server-field test. Your core is mostly stationary. Use teleport,
              zoom out, inspect the field, and choose a landing point.
            </p>

            <div style={styles.profileGrid}>
              <ProfileStat label="Operator Tier" value={profile.operatorTier} />
              <ProfileStat label="Emulators" value={`${profile.emulators} / 3`} />
              <ProfileStat label="Best Level" value={profile.bestLevel} />
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
          <canvas
            ref={canvasRef}
            style={styles.canvas}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerCancel={onCanvasPointerUp}
            onWheel={onCanvasWheel}
          />

          <header style={styles.arenaHud}>
            <div style={styles.hudPill}>
              <span>LEVEL</span>
              <strong>{hud.level}</strong>
            </div>

            <div style={styles.hudPill}>
              <span>SCORE</span>
              <strong>{hud.score}</strong>
            </div>

            <div style={styles.hudWide}>
              <span>{hud.status}</span>
            </div>
          </header>

          <footer style={styles.arenaControls}>
            <button
              style={{
                ...styles.controlButton,
                ...(hud.teleportMode ? styles.controlButtonActive : {}),
              }}
              onClick={activateTeleport}
            >
              {hud.cooldown > 0 ? `TP ${hud.cooldown}s` : hud.teleportMode ? "TAP MAP" : "TELEPORT"}
            </button>

            <button style={styles.controlButton} onClick={centerCamera}>
              CENTER
            </button>

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

  const grid = 80 * camera.zoom;
  const offsetX = -(camera.x * camera.zoom) % grid;
  const offsetY = -(camera.y * camera.zoom) % grid;

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

function drawMonsters(ctx, monsters) {
  for (const monster of monsters) {
    const pulse = 1 + Math.sin(Date.now() / 480 + monster.pulse) * 0.035;

    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.arc(monster.x + 6, monster.y + 8, monster.r * 1.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = monster.color;
    ctx.shadowColor = monster.color;
    ctx.shadowBlur = monster.type === "giant" ? 28 : 16;
    ctx.arc(monster.x, monster.y, monster.r * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.34)";
    ctx.lineWidth = monster.type === "giant" ? 3 : 2;
    ctx.arc(monster.x, monster.y, monster.r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = monster.type === "giant"
      ? "900 13px Inter, system-ui, sans-serif"
      : "800 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const label = monster.type === "giant" ? "GIANT" : monster.type.toUpperCase();
    ctx.fillText(label, monster.x, monster.y - 5);

    ctx.font = "800 10px Inter, system-ui, sans-serif";
    ctx.fillText(`${monster.hp}`, monster.x, monster.y + 10);
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

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.44)";
  ctx.lineWidth = 3;
  ctx.arc(player.x, player.y, player.r * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  if (player.shield > 0) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(134,239,172,0.76)";
    ctx.lineWidth = 3;
    ctx.arc(player.x, player.y, player.r + 13, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CORE", player.x, player.y);
}

function drawTeleportPreview(ctx, player) {
  if (!player) return;

  ctx.beginPath();
  ctx.strokeStyle = "rgba(251,191,36,0.22)";
  ctx.lineWidth = 2;
  ctx.arc(player.x, player.y, 180, 0, Math.PI * 2);
  ctx.stroke();
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

  arenaControls: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    display: "grid",
    gridTemplateColumns: "1.25fr repeat(4, 1fr)",
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

  controlButtonActive: {
    border: "1px solid rgba(251,191,36,0.55)",
    background: "rgba(251,191,36,0.22)",
    color: "#fde68a",
  },
};
