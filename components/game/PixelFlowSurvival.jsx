"use client";

import { useEffect, useRef, useState } from "react";

const WORLD_WIDTH = 12800;
const WORLD_HEIGHT = 8800;
const MONSTER_COUNT = 180;

const TELEPORT_COOLDOWN_SECONDS = 15;
const TELEPORT_CAST_SECONDS = 1.2;
const TELEPORT_ARRIVAL_SECONDS = 1.1;

const MIN_ZOOM = 0.12;
const MAX_ZOOM = 1.45;

const GRID_STEP = 110;
const MAJOR_GRID_STEP = GRID_STEP * 2;
const CAMERA_OUTSIDE_PADDING = 950;

const CITY_WIDTH = 2200;
const CITY_HEIGHT = 1600;
const CITY_GRID_STEP = 100;
const CITY_OUTSIDE_PADDING = 280;
const CITY_MIN_ZOOM = 0.45;
const CITY_MAX_ZOOM = 1.55;

const ATTACK_MARCH_SPEED = 0.42;
const RETURN_MARCH_SPEED = 0.52;

const BUILDINGS = {
  CrystalPoint: {
    type: "CrystalPoint",
    label: "CRYSTAL POINT",
    shortLabel: "CRYSTAL",
    w: 2,
    h: 2,
    cost: 0,
    description: "+1 crystal/sec",
    color: "#22d3ee",
  },
  House: {
    type: "House",
    label: "HOUSE",
    shortLabel: "HOUSE",
    w: 1,
    h: 1,
    cost: 25,
    description: "+25 guard capacity",
    color: "#86efac",
  },
  Barracks: {
    type: "Barracks",
    label: "BARRACKS",
    shortLabel: "BARRACKS",
    w: 2,
    h: 2,
    cost: 30,
    description: "Produces Core Guards",
    color: "#f59e0b",
  },
};

const initialProfile = {
  operatorTier: 1,
  emulators: 1,
  bestScore: 0,
  bestLevel: 1,
};

function createCityStats() {
  return {
    crystals: 80,
    crystalRate: 0,
    workers: 0,
    workerCap: 5,
    guards: 0,
    guardCap: 10,
    guardTrainTimer: 0,
    xp: 0,
    level: 1,
  };
}

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
    x: rand(180, WORLD_WIDTH - 180),
    y: rand(180, WORLD_HEIGHT - 180),
    r,
    hp,
    maxHp: hp,
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

function createCityState() {
  const citadelX =
    Math.floor(CITY_WIDTH / 2 / CITY_GRID_STEP) * CITY_GRID_STEP - CITY_GRID_STEP;
  const citadelY =
    Math.floor(CITY_HEIGHT / 2 / CITY_GRID_STEP) * CITY_GRID_STEP - CITY_GRID_STEP;

  return {
    buildings: [
      {
        id: "citadel",
        type: "Citadel",
        x: citadelX,
        y: citadelY,
        w: 2,
        h: 2,
        color: "#38bdf8",
      },
    ],
  };
}

function snapPointToLandingGrid(point, radius = 30) {
  const snappedX =
    Math.floor(point.x / MAJOR_GRID_STEP) * MAJOR_GRID_STEP + MAJOR_GRID_STEP / 2;
  const snappedY =
    Math.floor(point.y / MAJOR_GRID_STEP) * MAJOR_GRID_STEP + MAJOR_GRID_STEP / 2;

  return {
    x: clamp(snappedX, radius, WORLD_WIDTH - radius),
    y: clamp(snappedY, radius, WORLD_HEIGHT - radius),
  };
}

function snapCityPointToGrid(point, w = 2, h = 2) {
  const x = Math.floor(point.x / CITY_GRID_STEP) * CITY_GRID_STEP;
  const y = Math.floor(point.y / CITY_GRID_STEP) * CITY_GRID_STEP;

  return {
    x: clamp(x, 0, CITY_WIDTH - w * CITY_GRID_STEP),
    y: clamp(y, 0, CITY_HEIGHT - h * CITY_GRID_STEP),
    w,
    h,
  };
}

export default function PixelFlowSurvival({ open, onClose }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const worldRef = useRef(createWorld());
  const playerRef = useRef(null);
  const cityRef = useRef(createCityState());
  const cityStatsRef = useRef(createCityStats());
  const cityStatsUiTimerRef = useRef(0);

  const marchesRef = useRef([]);
  const selectedMonsterRef = useRef(null);

  const cameraRef = useRef({
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    zoom: 0.72,
  });

  const cityCameraRef = useRef({
    x: CITY_WIDTH / 2,
    y: CITY_HEIGHT / 2,
    zoom: 0.85,
  });

  const pointerRef = useRef({
    pointers: new Map(),
    dragging: false,
    draggingLanding: false,
    landingPointerId: null,
    pinching: false,
    suppressPanUntilAllUp: false,
    lastX: 0,
    lastY: 0,
    downX: 0,
    downY: 0,
    lastPinchDistance: 0,
  });

  const cityPointerRef = useRef({
    pointers: new Map(),
    dragging: false,
    draggingBuildPreview: false,
    buildPointerId: null,
    pinching: false,
    suppressPanUntilAllUp: false,
    lastX: 0,
    lastY: 0,
    downX: 0,
    downY: 0,
    lastPinchDistance: 0,
  });

  const cooldownRef = useRef(0);
  const teleportModeRef = useRef(false);
  const teleportEffectRef = useRef(null);
  const landingPreviewRef = useRef(null);

  const buildModeRef = useRef(false);
  const buildPreviewRef = useRef(null);
  const selectedBuildingTypeRef = useRef(null);

  const lastTimeRef = useRef(0);

  const [screen, setScreen] = useState("menu");
  const [profile, setProfile] = useState(initialProfile);
  const [landingPreview, setLandingPreviewState] = useState(null);
  const [buildPreview, setBuildPreviewState] = useState(null);
  const [buildMode, setBuildModeState] = useState(false);
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  const [selectedBuildingType, setSelectedBuildingTypeState] = useState(null);
  const [enterCoreVisible, setEnterCoreVisible] = useState(false);
  const [selectedMonster, setSelectedMonsterState] = useState(null);
  const [cityStats, setCityStats] = useState(createCityStats());
  const [viewport, setViewport] = useState({ width: 390, height: 720 });

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
    if (screen !== "arena" && screen !== "city") return;

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

      setViewport({ width, height });

      if (screen === "arena") {
        clampCameraToWorld();
        forceLandingPreviewRender();
      }

      if (screen === "city") {
        clampCityCameraToWorld();
        forceBuildPreviewRender();
      }
    }

    resize();
    window.addEventListener("resize", resize);

    lastTimeRef.current = performance.now();

    function loop(time) {
      const dt = Math.min(40, time - lastTimeRef.current);
      lastTimeRef.current = time;

      updateCity(dt / 1000);

      if (screen === "arena") {
        updateArena(dt / 1000);
        drawArena();
      }

      if (screen === "city") {
        drawCity();
      }

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

  const landingScreen = landingPreview ? worldToScreen(landingPreview.x, landingPreview.y) : null;

  const enterScreen =
    enterCoreVisible && playerRef.current
      ? worldToScreen(playerRef.current.x, playerRef.current.y)
      : null;

  const buildScreen = buildPreview
    ? cityWorldToScreen(
        buildPreview.x + (buildPreview.w * CITY_GRID_STEP) / 2,
        buildPreview.y + (buildPreview.h * CITY_GRID_STEP) / 2
      )
    : null;

  const selectedMonsterScreen = selectedMonster
    ? worldToScreen(selectedMonster.x, selectedMonster.y)
    : null;

  function updateLandingPreview(nextPreview) {
    landingPreviewRef.current = nextPreview;
    setLandingPreviewState(nextPreview);
  }

  function updateBuildPreview(nextPreview) {
    buildPreviewRef.current = nextPreview;
    setBuildPreviewState(nextPreview);
  }

  function updateSelectedMonster(nextMonster) {
    selectedMonsterRef.current = nextMonster;
    setSelectedMonsterState(nextMonster);
  }

  function setBuildMode(nextValue) {
    buildModeRef.current = nextValue;
    setBuildModeState(nextValue);
  }

  function setSelectedBuildingType(nextType) {
    selectedBuildingTypeRef.current = nextType;
    setSelectedBuildingTypeState(nextType);
  }

  function resetArena() {
    worldRef.current = createWorld();
    cityRef.current = createCityState();
    cityStatsRef.current = createCityStats();
    cityStatsUiTimerRef.current = 0;
    marchesRef.current = [];
    updateSelectedMonster(null);

    const spawn = snapPointToLandingGrid({
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
    });

    playerRef.current = {
      x: spawn.x,
      y: spawn.y,
      r: 30,
      level: 1,
      score: 0,
      shield: 180,
      alive: true,
    };

    cameraRef.current = {
      x: spawn.x,
      y: spawn.y,
      zoom: 0.72,
    };

    cityCameraRef.current = {
      x: CITY_WIDTH / 2,
      y: CITY_HEIGHT / 2,
      zoom: 0.85,
    };

    pointerRef.current = {
      pointers: new Map(),
      dragging: false,
      draggingLanding: false,
      landingPointerId: null,
      pinching: false,
      suppressPanUntilAllUp: false,
      lastX: 0,
      lastY: 0,
      downX: 0,
      downY: 0,
      lastPinchDistance: 0,
    };

    cityPointerRef.current = {
      pointers: new Map(),
      dragging: false,
      draggingBuildPreview: false,
      buildPointerId: null,
      pinching: false,
      suppressPanUntilAllUp: false,
      lastX: 0,
      lastY: 0,
      downX: 0,
      downY: 0,
      lastPinchDistance: 0,
    };

    cooldownRef.current = 0;
    teleportModeRef.current = false;
    teleportEffectRef.current = null;

    updateLandingPreview(null);
    updateBuildPreview(null);
    setBuildMode(false);
    setBuildMenuOpen(false);
    setSelectedBuildingType(null);
    setEnterCoreVisible(false);
    setCityStats({ ...cityStatsRef.current });
  }

  function startGame() {
    resetArena();

    setHud({
      level: 1,
      score: 0,
      cooldown: 0,
      teleportMode: false,
      status: "Start inside your city. Build a Crystal Point first.",
    });

    setScreen("city");
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
      status: "Respawned. Return to city or use TELEPORT.",
    });
  }

  function centerCamera() {
    const player = playerRef.current;
    if (!player) return;

    cameraRef.current.x = player.x;
    cameraRef.current.y = player.y;
    clampCameraToWorld();
    forceLandingPreviewRender();
  }

  function activateTeleport() {
    if (teleportEffectRef.current?.active) {
      setHud((current) => ({
        ...current,
        status: "Teleport is already in progress.",
      }));
      return;
    }

    if (cooldownRef.current > 0) {
      setHud((current) => ({
        ...current,
        status: `Teleport cooldown: ${Math.ceil(cooldownRef.current)}s`,
      }));
      return;
    }

    setEnterCoreVisible(false);
    updateSelectedMonster(null);
    teleportModeRef.current = true;

    setHud((current) => ({
      ...current,
      teleportMode: true,
      status: landingPreviewRef.current
        ? "Tap another point or drag the landing hologram."
        : "Teleport armed. Tap the map to choose landing point.",
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

    updateTeleportEffect(dt);
    updateMarches(dt);

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

  function updateCity(dt) {
    const stats = cityStatsRef.current;
    const buildings = cityRef.current.buildings;

    const crystalPoints = buildings.filter((building) => building.type === "CrystalPoint").length;
    const barracksCount = buildings.filter((building) => building.type === "Barracks").length;

    stats.crystalRate = crystalPoints;
    stats.crystals += stats.crystalRate * dt;

    if (barracksCount > 0) {
      stats.guardTrainTimer += dt * barracksCount;

      while (
        stats.guardTrainTimer >= 1 &&
        getTotalGuards() < stats.guardCap &&
        stats.crystals >= 1
      ) {
        stats.guardTrainTimer -= 1;
        stats.crystals -= 1;
        stats.guards += 1;
      }
    }

    cityStatsUiTimerRef.current += dt;

    if (cityStatsUiTimerRef.current >= 0.2) {
      cityStatsUiTimerRef.current = 0;
      setCityStats({ ...stats });
    }
  }

  function getTotalGuards() {
    const stats = cityStatsRef.current;
    const marchGuards = marchesRef.current.reduce((sum, march) => sum + march.count, 0);

    return stats.guards + marchGuards;
  }

  function updateTeleportEffect(dt) {
    const effect = teleportEffectRef.current;
    const player = playerRef.current;

    if (!effect || !effect.active || !player) return;

    effect.timer += dt;

    if (effect.phase === "cast" && effect.timer >= TELEPORT_CAST_SECONDS) {
      player.x = effect.target.x;
      player.y = effect.target.y;
      player.score += 1;

      cameraRef.current.x = player.x;
      cameraRef.current.y = player.y;
      clampCameraToWorld();

      cooldownRef.current = TELEPORT_COOLDOWN_SECONDS;

      effect.phase = "arrival";
      effect.timer = 0;

      setHud((current) => ({
        ...current,
        score: Math.round(player.score),
        cooldown: TELEPORT_COOLDOWN_SECONDS,
        teleportMode: false,
        status: "Teleport complete. Tap CORE to enter city.",
      }));

      return;
    }

    if (effect.phase === "arrival" && effect.timer >= TELEPORT_ARRIVAL_SECONDS) {
      teleportEffectRef.current = null;
    }
  }

  function updateMarches(dt) {
    const player = playerRef.current;
    const world = worldRef.current;
    const stats = cityStatsRef.current;

    if (!player) return;

    const nextMarches = [];

    for (const march of marchesRef.current) {
      const speed = march.type === "return" ? RETURN_MARCH_SPEED : ATTACK_MARCH_SPEED;
      const nextProgress = Math.min(1, march.progress + dt * speed);
      const nextMarch = {
        ...march,
        progress: nextProgress,
      };

      if (nextProgress < 1) {
        nextMarches.push(nextMarch);
        continue;
      }

      if (march.type === "attack") {
        const monster = world.monsters.find((item) => item.id === march.targetMonsterId);

        if (!monster) {
          continue;
        }

        const damage = Math.min(march.count, monster.hp);
        monster.hp = Math.max(0, monster.hp - damage);

        const returnCount = Math.max(0, march.count - damage);

        if (monster.hp <= 0) {
          const rewardCrystals = monster.type === "giant" ? 90 : monster.type === "beast" ? 45 : 18;
          const rewardXp = monster.type === "giant" ? 60 : monster.type === "beast" ? 28 : 10;

          stats.crystals += rewardCrystals;
          stats.xp += rewardXp;

          if (player) {
            player.score += rewardXp;
          }

          world.monsters = world.monsters.filter((item) => item.id !== monster.id);

          if (selectedMonsterRef.current?.id === monster.id) {
            updateSelectedMonster(null);
          }
        } else if (selectedMonsterRef.current?.id === monster.id) {
          updateSelectedMonster({ ...monster });
        }

        if (returnCount > 0) {
          nextMarches.push({
            id: `return-${Date.now()}-${Math.random()}`,
            type: "return",
            count: returnCount,
            fromX: march.toX,
            fromY: march.toY,
            toX: player.x,
            toY: player.y,
            progress: 0,
          });
        }

        continue;
      }

      if (march.type === "return") {
        stats.guards += march.count;
      }
    }

    marchesRef.current = nextMarches;
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

    drawSpaceBackground(ctx, width, height);

    ctx.save();
    applyWorldTransform(ctx, width, height, camera);

    drawOutsideWorldShadow(ctx);
    drawWorldGrid(ctx);
    drawWorldBorder(ctx);
    drawMonsters(ctx, world.monsters, selectedMonsterRef.current?.id);
    drawLandingPreview(ctx, landingPreviewRef.current);
    drawTeleportEffectRings(ctx, teleportEffectRef.current);
    drawMarches(ctx, marchesRef.current);
    drawOrbitGuards(ctx, player, cityStatsRef.current.guards);
    drawPlayer(ctx, player);

    ctx.restore();
  }

  function drawCity() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const camera = cityCameraRef.current;

    if (!canvas || !ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    drawCityBackground(ctx, width, height);

    ctx.save();
    applyCityTransform(ctx, width, height, camera);

    drawCityOutsideShadow(ctx);
    drawCityGrid(ctx);
    drawCityBorder(ctx);
    drawCityBuildings(ctx, cityRef.current.buildings);
    drawBuildPreview(ctx, buildPreviewRef.current);

    ctx.restore();
  }

  function applyWorldTransform(ctx, width, height, camera) {
    ctx.translate(width / 2, height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
  }

  function applyCityTransform(ctx, width, height, camera) {
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

  function cityScreenToWorld(clientX, clientY) {
    const canvas = canvasRef.current;
    const camera = cityCameraRef.current;

    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;

    return {
      x: clamp((sx - canvas.clientWidth / 2) / camera.zoom + camera.x, 0, CITY_WIDTH),
      y: clamp((sy - canvas.clientHeight / 2) / camera.zoom + camera.y, 0, CITY_HEIGHT),
    };
  }

  function worldToScreen(x, y) {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;

    if (!canvas) return null;

    return {
      x: (x - camera.x) * camera.zoom + canvas.clientWidth / 2,
      y: (y - camera.y) * camera.zoom + canvas.clientHeight / 2,
    };
  }

  function cityWorldToScreen(x, y) {
    const canvas = canvasRef.current;
    const camera = cityCameraRef.current;

    if (!canvas) return null;

    return {
      x: (x - camera.x) * camera.zoom + canvas.clientWidth / 2,
      y: (y - camera.y) * camera.zoom + canvas.clientHeight / 2,
    };
  }

  function getLandingBlock(point) {
    const blockX = Math.floor(point.x / MAJOR_GRID_STEP) * MAJOR_GRID_STEP;
    const blockY = Math.floor(point.y / MAJOR_GRID_STEP) * MAJOR_GRID_STEP;

    return {
      x: blockX,
      y: blockY,
      centerX: blockX + MAJOR_GRID_STEP / 2,
      centerY: blockY + MAJOR_GRID_STEP / 2,
    };
  }

  function pointInsideLandingBlock(worldPoint, landingPoint) {
    if (!landingPoint) return false;

    const block = getLandingBlock(landingPoint);

    return (
      worldPoint.x >= block.x &&
      worldPoint.x <= block.x + MAJOR_GRID_STEP &&
      worldPoint.y >= block.y &&
      worldPoint.y <= block.y + MAJOR_GRID_STEP
    );
  }

  function snapToLandingGrid(point) {
    const player = playerRef.current;
    const radius = player?.r || 30;
    const block = getLandingBlock(point);

    return {
      x: clamp(block.centerX, radius, WORLD_WIDTH - radius),
      y: clamp(block.centerY, radius, WORLD_HEIGHT - radius),
    };
  }

  function selectLandingPoint(clientX, clientY) {
    if (cooldownRef.current > 0) return;
    if (teleportEffectRef.current?.active) return;

    const rawPoint = screenToWorld(clientX, clientY);
    const snappedPoint = snapToLandingGrid(rawPoint);

    teleportModeRef.current = false;
    updateLandingPreview(snappedPoint);

    setHud((current) => ({
      ...current,
      teleportMode: false,
      status: "Landing selected. Press LAND, tap elsewhere, or drag hologram.",
    }));
  }

  function beginTeleportToLanding() {
    const player = playerRef.current;
    const currentLanding = landingPreviewRef.current;

    if (!player || !currentLanding) return;
    if (cooldownRef.current > 0) return;
    if (teleportEffectRef.current?.active) return;

    teleportEffectRef.current = {
      active: true,
      phase: "cast",
      timer: 0,
      origin: {
        x: player.x,
        y: player.y,
      },
      target: {
        x: currentLanding.x,
        y: currentLanding.y,
      },
    };

    setEnterCoreVisible(false);
    updateSelectedMonster(null);
    updateLandingPreview(null);

    setHud((current) => ({
      ...current,
      teleportMode: false,
      status: "Teleport charging...",
    }));
  }

  function cancelLandingPreview() {
    updateLandingPreview(null);
    teleportModeRef.current = false;

    setHud((current) => ({
      ...current,
      teleportMode: false,
      status: "Landing canceled.",
    }));
  }

  function enterCity() {
    updateLandingPreview(null);
    updateSelectedMonster(null);
    teleportModeRef.current = false;
    setEnterCoreVisible(false);
    setBuildMode(false);
    updateBuildPreview(null);
    setBuildMenuOpen(false);
    setScreen("city");
  }

  function backToMap() {
    setBuildMode(false);
    updateBuildPreview(null);
    setBuildMenuOpen(false);
    setScreen("arena");

    setHud((current) => ({
      ...current,
      status: "World map opened. Tap a monster to attack.",
    }));
  }

  function centerCityCamera() {
    cityCameraRef.current.x = CITY_WIDTH / 2;
    cityCameraRef.current.y = CITY_HEIGHT / 2;
    clampCityCameraToWorld();
    forceBuildPreviewRender();
  }

  function openBuildMenu() {
    setBuildMenuOpen((current) => !current);
    setBuildMode(false);
    updateBuildPreview(null);
    setSelectedBuildingType(null);
  }

  function chooseBuilding(type) {
    setSelectedBuildingType(type);
    setBuildMenuOpen(false);
    setBuildMode(true);
    updateBuildPreview(null);
  }

  function resetCityBuildings() {
    cityRef.current = createCityState();
    cityStatsRef.current = createCityStats();
    marchesRef.current = [];
    setBuildMode(false);
    updateBuildPreview(null);
    setBuildMenuOpen(false);
    setSelectedBuildingType(null);
    setCityStats({ ...cityStatsRef.current });
  }

  function makeBuildPreviewFromPoint(point) {
    const type = selectedBuildingTypeRef.current || "Barracks";
    const definition = BUILDINGS[type] || BUILDINGS.Barracks;
    const snapped = snapCityPointToGrid(point, definition.w, definition.h);

    const preview = {
      type: definition.type,
      x: snapped.x,
      y: snapped.y,
      w: definition.w,
      h: definition.h,
      cost: definition.cost,
      valid: true,
    };

    preview.valid = canPlaceBuilding(preview);

    return preview;
  }

  function canPlaceBuilding(preview) {
    if (!preview) return false;

    const stats = cityStatsRef.current;
    const left = preview.x;
    const top = preview.y;
    const right = preview.x + preview.w * CITY_GRID_STEP;
    const bottom = preview.y + preview.h * CITY_GRID_STEP;

    if (stats.crystals < preview.cost) {
      return false;
    }

    if (left < 0 || top < 0 || right > CITY_WIDTH || bottom > CITY_HEIGHT) {
      return false;
    }

    for (const building of cityRef.current.buildings) {
      const bLeft = building.x;
      const bTop = building.y;
      const bRight = building.x + building.w * CITY_GRID_STEP;
      const bBottom = building.y + building.h * CITY_GRID_STEP;

      const separated =
        right <= bLeft || left >= bRight || bottom <= bTop || top >= bBottom;

      if (!separated) {
        return false;
      }
    }

    return true;
  }

  function selectBuildPoint(clientX, clientY) {
    if (!buildModeRef.current && !buildPreviewRef.current) return;

    const worldPoint = cityScreenToWorld(clientX, clientY);
    const preview = makeBuildPreviewFromPoint(worldPoint);
    updateBuildPreview(preview);
  }

  function placeBuilding() {
    const preview = buildPreviewRef.current;

    if (!preview || !preview.valid) return;

    const definition = BUILDINGS[preview.type] || BUILDINGS.Barracks;
    const stats = cityStatsRef.current;

    stats.crystals = Math.max(0, stats.crystals - definition.cost);

    cityRef.current = {
      ...cityRef.current,
      buildings: [
        ...cityRef.current.buildings,
        {
          id: `${preview.type}-${Date.now()}`,
          type: preview.type,
          x: preview.x,
          y: preview.y,
          w: preview.w,
          h: preview.h,
          color: definition.color,
        },
      ],
    };

    if (preview.type === "House") {
      stats.guardCap += 25;
      stats.workerCap += 5;
    }

    setBuildMode(false);
    updateBuildPreview(null);
    setSelectedBuildingType(null);
    setCityStats({ ...stats });
  }

  function cancelBuildPreview() {
    updateBuildPreview(null);
    setBuildMode(false);
    setSelectedBuildingType(null);
  }

  function pointInsideBuildPreview(cityPoint, preview) {
    if (!preview) return false;

    return (
      cityPoint.x >= preview.x &&
      cityPoint.x <= preview.x + preview.w * CITY_GRID_STEP &&
      cityPoint.y >= preview.y &&
      cityPoint.y <= preview.y + preview.h * CITY_GRID_STEP
    );
  }

  function beginAttackSelectedMonster() {
    const monster = selectedMonsterRef.current;
    const player = playerRef.current;
    const stats = cityStatsRef.current;

    if (!monster || !player) return;

    const sendCount = Math.floor(stats.guards);

    if (sendCount <= 0) {
      setHud((current) => ({
        ...current,
        status: "No Core Guards at home. Build Barracks and wait.",
      }));
      return;
    }

    stats.guards = 0;

    marchesRef.current.push({
      id: `attack-${Date.now()}-${Math.random()}`,
      type: "attack",
      count: sendCount,
      fromX: player.x,
      fromY: player.y,
      toX: monster.x,
      toY: monster.y,
      progress: 0,
      targetMonsterId: monster.id,
    });

    setCityStats({ ...stats });

    setHud((current) => ({
      ...current,
      status: `Attack launched: ${sendCount} Core Guards.`,
    }));
  }

  function onArenaPointerDown(event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const pointers = pointerRef.current.pointers;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    pointerRef.current.dragging = false;
    pointerRef.current.draggingLanding = false;
    pointerRef.current.landingPointerId = null;
    pointerRef.current.lastX = event.clientX;
    pointerRef.current.lastY = event.clientY;
    pointerRef.current.downX = event.clientX;
    pointerRef.current.downY = event.clientY;

    const currentLanding = landingPreviewRef.current;

    if (currentLanding && pointers.size === 1) {
      const worldPoint = screenToWorld(event.clientX, event.clientY);

      if (pointInsideLandingBlock(worldPoint, currentLanding)) {
        pointerRef.current.draggingLanding = true;
        pointerRef.current.landingPointerId = event.pointerId;
        pointerRef.current.dragging = true;
      }
    }

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      pointerRef.current.lastPinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      pointerRef.current.pinching = true;
      pointerRef.current.suppressPanUntilAllUp = true;
      pointerRef.current.dragging = true;
    }
  }

  function onArenaPointerMove(event) {
    const pointerState = pointerRef.current;
    const pointers = pointerState.pointers;

    if (!pointers.has(event.pointerId)) return;

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (
      pointerState.draggingLanding &&
      pointerState.landingPointerId === event.pointerId &&
      landingPreviewRef.current
    ) {
      const worldPoint = screenToWorld(event.clientX, event.clientY);
      const snappedPoint = snapToLandingGrid(worldPoint);
      updateLandingPreview(snappedPoint);
      pointerState.dragging = true;
      return;
    }

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (pointerState.lastPinchDistance > 0) {
        const ratio = distance / pointerState.lastPinchDistance;
        zoomCamera(ratio);
      }

      pointerState.lastPinchDistance = distance;
      pointerState.pinching = true;
      pointerState.suppressPanUntilAllUp = true;
      pointerState.dragging = true;
      return;
    }

    if (pointers.size === 1) {
      if (pointerState.suppressPanUntilAllUp) {
        pointerState.dragging = true;
        return;
      }

      const dx = event.clientX - pointerState.lastX;
      const dy = event.clientY - pointerState.lastY;
      const totalMove = Math.hypot(
        event.clientX - pointerState.downX,
        event.clientY - pointerState.downY
      );

      if (totalMove > 6) {
        pointerState.dragging = true;
        setEnterCoreVisible(false);
        updateSelectedMonster(null);
      }

      panCamera(dx, dy);

      pointerState.lastX = event.clientX;
      pointerState.lastY = event.clientY;
    }
  }

  function onArenaPointerUp(event) {
    const pointerState = pointerRef.current;
    const wasTap = !pointerState.dragging;

    const wasDraggingLanding =
      pointerState.draggingLanding && pointerState.landingPointerId === event.pointerId;

    pointerState.pointers.delete(event.pointerId);
    pointerState.lastPinchDistance = 0;

    if (pointerState.pointers.size === 0) {
      pointerState.pinching = false;
      pointerState.suppressPanUntilAllUp = false;
      pointerState.dragging = false;
      pointerState.draggingLanding = false;
      pointerState.landingPointerId = null;
    }

    if (wasDraggingLanding) {
      return;
    }

    if (
      wasTap &&
      cooldownRef.current <= 0 &&
      !teleportEffectRef.current?.active &&
      (teleportModeRef.current || landingPreviewRef.current)
    ) {
      selectLandingPoint(event.clientX, event.clientY);
      return;
    }

    if (wasTap && !teleportModeRef.current && !landingPreviewRef.current) {
      const worldPoint = screenToWorld(event.clientX, event.clientY);
      const player = playerRef.current;

      if (player) {
        const dist = Math.hypot(worldPoint.x - player.x, worldPoint.y - player.y);

        if (dist <= player.r + 42) {
          setEnterCoreVisible(true);
          updateSelectedMonster(null);
          setHud((current) => ({
            ...current,
            status: "Core selected. Press ENTER.",
          }));
          return;
        }
      }

      const monster = findMonsterAt(worldPoint);

      if (monster) {
        updateSelectedMonster({ ...monster });
        setEnterCoreVisible(false);
        setHud((current) => ({
          ...current,
          status: `Monster selected. Power ${monster.hp}. Attack sends 1/1.`,
        }));
      } else {
        updateSelectedMonster(null);
        setEnterCoreVisible(false);
      }
    }
  }

  function findMonsterAt(worldPoint) {
    let best = null;
    let bestDistance = Infinity;

    for (const monster of worldRef.current.monsters) {
      const distance = Math.hypot(worldPoint.x - monster.x, worldPoint.y - monster.y);

      if (distance <= monster.r + 32 && distance < bestDistance) {
        best = monster;
        bestDistance = distance;
      }
    }

    return best;
  }

  function onCityPointerDown(event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const pointers = cityPointerRef.current.pointers;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    cityPointerRef.current.dragging = false;
    cityPointerRef.current.draggingBuildPreview = false;
    cityPointerRef.current.buildPointerId = null;
    cityPointerRef.current.lastX = event.clientX;
    cityPointerRef.current.lastY = event.clientY;
    cityPointerRef.current.downX = event.clientX;
    cityPointerRef.current.downY = event.clientY;

    const currentPreview = buildPreviewRef.current;

    if (currentPreview && pointers.size === 1) {
      const cityPoint = cityScreenToWorld(event.clientX, event.clientY);

      if (pointInsideBuildPreview(cityPoint, currentPreview)) {
        cityPointerRef.current.draggingBuildPreview = true;
        cityPointerRef.current.buildPointerId = event.pointerId;
        cityPointerRef.current.dragging = true;
      }
    }

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      cityPointerRef.current.lastPinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      cityPointerRef.current.pinching = true;
      cityPointerRef.current.suppressPanUntilAllUp = true;
      cityPointerRef.current.dragging = true;
    }
  }

  function onCityPointerMove(event) {
    const pointerState = cityPointerRef.current;
    const pointers = pointerState.pointers;

    if (!pointers.has(event.pointerId)) return;

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (
      pointerState.draggingBuildPreview &&
      pointerState.buildPointerId === event.pointerId &&
      buildPreviewRef.current
    ) {
      const cityPoint = cityScreenToWorld(event.clientX, event.clientY);
      updateBuildPreview(makeBuildPreviewFromPoint(cityPoint));
      pointerState.dragging = true;
      return;
    }

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (pointerState.lastPinchDistance > 0) {
        const ratio = distance / pointerState.lastPinchDistance;
        zoomCityCamera(ratio);
      }

      pointerState.lastPinchDistance = distance;
      pointerState.pinching = true;
      pointerState.suppressPanUntilAllUp = true;
      pointerState.dragging = true;
      return;
    }

    if (pointers.size === 1) {
      if (pointerState.suppressPanUntilAllUp) {
        pointerState.dragging = true;
        return;
      }

      const dx = event.clientX - pointerState.lastX;
      const dy = event.clientY - pointerState.lastY;
      const totalMove = Math.hypot(
        event.clientX - pointerState.downX,
        event.clientY - pointerState.downY
      );

      if (totalMove > 6) {
        pointerState.dragging = true;
      }

      panCityCamera(dx, dy);

      pointerState.lastX = event.clientX;
      pointerState.lastY = event.clientY;
    }
  }

  function onCityPointerUp(event) {
    const pointerState = cityPointerRef.current;
    const wasTap = !pointerState.dragging;

    const wasDraggingPreview =
      pointerState.draggingBuildPreview && pointerState.buildPointerId === event.pointerId;

    pointerState.pointers.delete(event.pointerId);
    pointerState.lastPinchDistance = 0;

    if (pointerState.pointers.size === 0) {
      pointerState.pinching = false;
      pointerState.suppressPanUntilAllUp = false;
      pointerState.dragging = false;
      pointerState.draggingBuildPreview = false;
      pointerState.buildPointerId = null;
    }

    if (wasDraggingPreview) {
      return;
    }

    if (wasTap && (buildModeRef.current || buildPreviewRef.current)) {
      selectBuildPoint(event.clientX, event.clientY);
    }
  }

  function onCanvasPointerDown(event) {
    if (screen === "arena") {
      onArenaPointerDown(event);
      return;
    }

    if (screen === "city") {
      onCityPointerDown(event);
    }
  }

  function onCanvasPointerMove(event) {
    if (screen === "arena") {
      onArenaPointerMove(event);
      return;
    }

    if (screen === "city") {
      onCityPointerMove(event);
    }
  }

  function onCanvasPointerUp(event) {
    if (screen === "arena") {
      onArenaPointerUp(event);
      return;
    }

    if (screen === "city") {
      onCityPointerUp(event);
    }
  }

  function onCanvasWheel(event) {
    event.preventDefault();

    const ratio = event.deltaY < 0 ? 1.08 : 0.92;

    if (screen === "arena") {
      zoomCamera(ratio);
    }

    if (screen === "city") {
      zoomCityCamera(ratio);
    }
  }

  function panCamera(dx, dy) {
    const camera = cameraRef.current;

    camera.x -= dx / camera.zoom;
    camera.y -= dy / camera.zoom;
    clampCameraToWorld();
    forceLandingPreviewRender();
  }

  function panCityCamera(dx, dy) {
    const camera = cityCameraRef.current;

    camera.x -= dx / camera.zoom;
    camera.y -= dy / camera.zoom;
    clampCityCameraToWorld();
    forceBuildPreviewRender();
  }

  function zoomCamera(ratio) {
    const camera = cameraRef.current;

    camera.zoom = clamp(camera.zoom * ratio, MIN_ZOOM, MAX_ZOOM);
    clampCameraToWorld();
    forceLandingPreviewRender();
  }

  function zoomCityCamera(ratio) {
    const camera = cityCameraRef.current;

    camera.zoom = clamp(camera.zoom * ratio, CITY_MIN_ZOOM, CITY_MAX_ZOOM);
    clampCityCameraToWorld();
    forceBuildPreviewRender();
  }

  function forceLandingPreviewRender() {
    const currentLanding = landingPreviewRef.current;
    setLandingPreviewState(currentLanding ? { ...currentLanding } : null);
  }

  function forceBuildPreviewRender() {
    const currentPreview = buildPreviewRef.current;
    setBuildPreviewState(currentPreview ? { ...currentPreview } : null);
  }

  function clampCameraToWorld() {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;

    const minX = -CAMERA_OUTSIDE_PADDING;
    const maxX = WORLD_WIDTH + CAMERA_OUTSIDE_PADDING;
    const minY = -CAMERA_OUTSIDE_PADDING;
    const maxY = WORLD_HEIGHT + CAMERA_OUTSIDE_PADDING;

    if (!canvas) {
      camera.x = clamp(camera.x, minX, maxX);
      camera.y = clamp(camera.y, minY, maxY);
      return;
    }

    const halfW = canvas.clientWidth / (2 * camera.zoom);
    const halfH = canvas.clientHeight / (2 * camera.zoom);

    camera.x = clamp(camera.x, minX + halfW, maxX - halfW);
    camera.y = clamp(camera.y, minY + halfH, maxY - halfH);
  }

  function clampCityCameraToWorld() {
    const canvas = canvasRef.current;
    const camera = cityCameraRef.current;

    const minX = -CITY_OUTSIDE_PADDING;
    const maxX = CITY_WIDTH + CITY_OUTSIDE_PADDING;
    const minY = -CITY_OUTSIDE_PADDING;
    const maxY = CITY_HEIGHT + CITY_OUTSIDE_PADDING;

    if (!canvas) {
      camera.x = clamp(camera.x, minX, maxX);
      camera.y = clamp(camera.y, minY, maxY);
      return;
    }

    const halfW = canvas.clientWidth / (2 * camera.zoom);
    const halfH = canvas.clientHeight / (2 * camera.zoom);

    camera.x = clamp(camera.x, minX + halfW, maxX - halfW);
    camera.y = clamp(camera.y, minY + halfH, maxY - halfH);
  }

  function getCityStatusText() {
    const buildings = cityRef.current.buildings;

    if (!buildings.some((building) => building.type === "CrystalPoint")) {
      return "Step 1: BUILD -> Crystal Point. It gives +1 crystal/sec.";
    }

    if (!buildings.some((building) => building.type === "House")) {
      return "Step 2: BUILD -> House. It increases Guard capacity.";
    }

    if (!buildings.some((building) => building.type === "Barracks")) {
      return "Step 3: BUILD -> Barracks. It produces Core Guards.";
    }

    if (Math.floor(cityStats.guards) <= 0) {
      return "Barracks online. Wait while Core Guards are produced.";
    }

    return "Core Guards ready. Open WORLD MAP and tap a monster.";
  }

  return (
    <div style={styles.overlay}>
      {screen === "menu" && (
        <section style={styles.menuScreen}>
          <div style={styles.menuCard}>
            <p style={styles.kicker}>Core Field Prototype</p>
            <h1 style={styles.title}>Macro Swarm</h1>
            <p style={styles.menuText}>
              Start inside your city, build resource production, create Core Guards,
              then send the swarm to attack monsters on the world map.
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

      {(screen === "arena" || screen === "city") && (
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

          {screen === "arena" && (
            <>
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

              {enterCoreVisible && enterScreen && (
                <div
                  style={{
                    ...styles.enterCoreActions,
                    left: clamp(enterScreen.x + 28, 12, viewport.width - 104),
                    top: clamp(enterScreen.y - 58, 86, viewport.height - 150),
                  }}
                >
                  <button style={styles.enterButton} onClick={enterCity}>
                    ENTER
                  </button>
                </div>
              )}

              {selectedMonster && selectedMonsterScreen && (
                <div
                  style={{
                    ...styles.monsterActions,
                    left: clamp(selectedMonsterScreen.x + 28, 12, viewport.width - 118),
                    top: clamp(selectedMonsterScreen.y + 32, 86, viewport.height - 154),
                  }}
                >
                  <button style={styles.attackButton} onClick={beginAttackSelectedMonster}>
                    ATTACK 1/1
                  </button>
                  <button style={styles.cancelButton} onClick={() => updateSelectedMonster(null)}>
                    ×
                  </button>
                </div>
              )}

              {landingPreview && landingScreen && (
                <div
                  style={{
                    ...styles.landingActions,
                    left: clamp(landingScreen.x + 26, 12, viewport.width - 104),
                    top: clamp(landingScreen.y + 30, 86, viewport.height - 154),
                  }}
                >
                  <button style={styles.landButton} onClick={beginTeleportToLanding}>
                    LAND
                  </button>
                  <button style={styles.cancelButton} onClick={cancelLandingPreview}>
                    ×
                  </button>
                </div>
              )}

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

                <button style={styles.controlButton} onClick={enterCity}>
                  CITY
                </button>

                <button style={styles.controlButton} onClick={endRun}>
                  END RUN
                </button>

                <button style={styles.controlButton} onClick={onClose}>
                  EXIT
                </button>
              </footer>
            </>
          )}

          {screen === "city" && (
            <>
              <header style={styles.cityHud}>
                <div style={styles.cityTitleBox}>
                  <span>INNER CITY</span>
                  <strong>LV {cityStats.level} CORE BASE</strong>
                </div>

                <div style={styles.cityStatusBox}>
                  <span>
                    💎 {Math.floor(cityStats.crystals)} | +{cityStats.crystalRate}/s &nbsp; | &nbsp;
                    GUARDS {Math.floor(cityStats.guards)}/{cityStats.guardCap} &nbsp; | &nbsp;
                    XP {Math.floor(cityStats.xp)}
                  </span>
                </div>
              </header>

              <div style={styles.cityHint}>
                {selectedBuildingType
                  ? `Selected: ${BUILDINGS[selectedBuildingType]?.label || selectedBuildingType}. Tap grid to place.`
                  : getCityStatusText()}
              </div>

              {buildMenuOpen && (
                <div style={styles.buildMenu}>
                  <div style={styles.buildMenuHeader}>
                    <strong>BUILD MENU</strong>
                    <button style={styles.buildMenuClose} onClick={() => setBuildMenuOpen(false)}>
                      ×
                    </button>
                  </div>

                  <div style={styles.buildCardGrid}>
                    <button style={styles.buildCard} onClick={() => chooseBuilding("CrystalPoint")}>
                      <span style={styles.buildCardIconCrystal}>◆</span>
                      <strong>Crystal Point</strong>
                      <small>Cost 0 · +1/s</small>
                    </button>

                    <button style={styles.buildCard} onClick={() => chooseBuilding("House")}>
                      <span style={styles.buildCardIconHouse}>■</span>
                      <strong>House</strong>
                      <small>Cost 25 · +25 cap</small>
                    </button>

                    <button style={styles.buildCard} onClick={() => chooseBuilding("Barracks")}>
                      <span style={styles.buildCardIconBarracks}>▲</span>
                      <strong>Barracks</strong>
                      <small>Cost 30 · Guards</small>
                    </button>

                    <button style={{ ...styles.buildCard, ...styles.buildCardLocked }} disabled>
                      <span>◎</span>
                      <strong>Command</strong>
                      <small>Locked</small>
                    </button>
                  </div>
                </div>
              )}

              {buildPreview && buildScreen && (
                <div
                  style={{
                    ...styles.buildActions,
                    left: clamp(buildScreen.x + 28, 12, viewport.width - 120),
                    top: clamp(buildScreen.y + 36, 90, viewport.height - 156),
                  }}
                >
                  <button
                    style={{
                      ...styles.placeButton,
                      ...(buildPreview.valid ? {} : styles.placeButtonDisabled),
                    }}
                    onClick={placeBuilding}
                    disabled={!buildPreview.valid}
                  >
                    PLACE
                  </button>
                  <button style={styles.cancelButton} onClick={cancelBuildPreview}>
                    ×
                  </button>
                </div>
              )}

              <footer style={styles.cityControls}>
                <button style={styles.controlButton} onClick={backToMap}>
                  WORLD MAP
                </button>

                <button
                  style={{
                    ...styles.controlButton,
                    ...(buildMode || buildMenuOpen ? styles.controlButtonActive : {}),
                  }}
                  onClick={openBuildMenu}
                >
                  BUILD
                </button>

                <button style={styles.controlButton} onClick={centerCityCamera}>
                  CENTER
                </button>

                <button style={styles.controlButton} onClick={resetCityBuildings}>
                  RESET
                </button>

                <button style={styles.controlButton} onClick={onClose}>
                  EXIT
                </button>
              </footer>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function drawSpaceBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#050816");
  gradient.addColorStop(0.55, "#07111f");
  gradient.addColorStop(1, "#020617");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawCityBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#07111f");
  gradient.addColorStop(0.58, "#061220");
  gradient.addColorStop(1, "#020617");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawOutsideWorldShadow(ctx) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(
    -CAMERA_OUTSIDE_PADDING,
    -CAMERA_OUTSIDE_PADDING,
    WORLD_WIDTH + CAMERA_OUTSIDE_PADDING * 2,
    CAMERA_OUTSIDE_PADDING
  );
  ctx.fillRect(
    -CAMERA_OUTSIDE_PADDING,
    WORLD_HEIGHT,
    WORLD_WIDTH + CAMERA_OUTSIDE_PADDING * 2,
    CAMERA_OUTSIDE_PADDING
  );
  ctx.fillRect(-CAMERA_OUTSIDE_PADDING, 0, CAMERA_OUTSIDE_PADDING, WORLD_HEIGHT);
  ctx.fillRect(WORLD_WIDTH, 0, CAMERA_OUTSIDE_PADDING, WORLD_HEIGHT);

  ctx.restore();
}

function drawWorldGrid(ctx) {
  ctx.lineWidth = 1;

  for (let x = 0; x <= WORLD_WIDTH; x += GRID_STEP) {
    const major = x % MAJOR_GRID_STEP === 0;

    ctx.beginPath();
    ctx.strokeStyle = major
      ? "rgba(103,232,249,0.16)"
      : "rgba(103,232,249,0.065)";
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_HEIGHT);
    ctx.stroke();
  }

  for (let y = 0; y <= WORLD_HEIGHT; y += GRID_STEP) {
    const major = y % MAJOR_GRID_STEP === 0;

    ctx.beginPath();
    ctx.strokeStyle = major
      ? "rgba(103,232,249,0.16)"
      : "rgba(103,232,249,0.065)";
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_WIDTH, y);
    ctx.stroke();
  }
}

function drawWorldBorder(ctx) {
  ctx.save();

  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = 34;
  ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.strokeStyle = "rgba(103,232,249,0.18)";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.restore();
}

function drawMonsters(ctx, monsters, selectedMonsterId) {
  const now = Date.now();

  for (const monster of monsters) {
    const selected = selectedMonsterId === monster.id;
    const pulse = 1 + Math.sin(now / 480 + monster.pulse) * 0.035;

    if (selected) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(34,211,238,0.78)";
      ctx.lineWidth = 5;
      ctx.arc(monster.x, monster.y, monster.r + 16, 0, Math.PI * 2);
      ctx.stroke();
    }

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
    ctx.fillText(`${Math.ceil(monster.hp)}`, monster.x, monster.y + 10);
  }
}

function drawLandingPreview(ctx, landingPreview) {
  if (!landingPreview) return;

  const blockX = Math.floor(landingPreview.x / MAJOR_GRID_STEP) * MAJOR_GRID_STEP;
  const blockY = Math.floor(landingPreview.y / MAJOR_GRID_STEP) * MAJOR_GRID_STEP;
  const t = Date.now() / 260;
  const pulse = 1 + Math.sin(t) * 0.04;

  ctx.save();

  ctx.fillStyle = "rgba(34,211,238,0.18)";
  ctx.fillRect(blockX, blockY, MAJOR_GRID_STEP, MAJOR_GRID_STEP);

  ctx.strokeStyle = "rgba(34,211,238,0.95)";
  ctx.lineWidth = 5;
  ctx.strokeRect(blockX, blockY, MAJOR_GRID_STEP, MAJOR_GRID_STEP);

  ctx.strokeStyle = "rgba(251,191,36,0.62)";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(blockX + GRID_STEP, blockY);
  ctx.lineTo(blockX + GRID_STEP, blockY + MAJOR_GRID_STEP);
  ctx.moveTo(blockX, blockY + GRID_STEP);
  ctx.lineTo(blockX + MAJOR_GRID_STEP, blockY + GRID_STEP);
  ctx.stroke();

  ctx.globalAlpha = 0.95;

  ctx.beginPath();
  ctx.fillStyle = "rgba(34,211,238,0.16)";
  ctx.arc(landingPreview.x, landingPreview.y, 58 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = "rgba(34,211,238,0.9)";
  ctx.lineWidth = 4;
  ctx.arc(landingPreview.x, landingPreview.y, 50 * pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "rgba(251,191,36,0.82)";
  ctx.lineWidth = 3;
  ctx.arc(landingPreview.x, landingPreview.y, 31, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = "rgba(103,232,249,0.32)";
  ctx.arc(landingPreview.x, landingPreview.y, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "900 9px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CORE", landingPreview.x, landingPreview.y);

  ctx.restore();
}

function drawTeleportEffectRings(ctx, effect) {
  if (!effect || !effect.active) return;

  const origin = effect.origin;
  const target = effect.target;

  if (effect.phase === "cast") {
    const progress = Math.min(1, effect.timer / TELEPORT_CAST_SECONDS);
    const originRadius = 34 + progress * 92;
    const targetRadius = 30 + Math.sin(Date.now() / 90) * 5;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(251,191,36,${0.7 - progress * 0.45})`;
    ctx.lineWidth = 4;
    ctx.arc(origin.x, origin.y, originRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(251,191,36,0.72)";
    ctx.lineWidth = 3;
    ctx.arc(target.x, target.y, targetRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(251,191,36,0.25)";
    ctx.lineWidth = 2;
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
  }

  if (effect.phase === "arrival") {
    const progress = Math.min(1, effect.timer / TELEPORT_ARRIVAL_SECONDS);
    const radius = 38 + progress * 120;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(34,211,238,${0.75 - progress * 0.65})`;
    ctx.lineWidth = 5;
    ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = `rgba(251,191,36,${0.45 - progress * 0.35})`;
    ctx.lineWidth = 2;
    ctx.arc(target.x, target.y, radius * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawOrbitGuards(ctx, player, guardCount) {
  const count = Math.max(0, Math.floor(guardCount));
  if (!player || count <= 0) return;

  const now = Date.now() / 1000;
  const layerSize = 42;

  ctx.save();

  for (let i = 0; i < count; i += 1) {
    const layer = Math.floor(i / layerSize);
    const indexInLayer = i % layerSize;
    const itemsInLayer = Math.min(layerSize, count - layer * layerSize);

    const radius = player.r + 34 + layer * 16;
    const speed = 1.25 - layer * 0.12;
    const angle =
      now * speed +
      (indexInLayer / Math.max(1, itemsInLayer)) * Math.PI * 2 +
      layer * 0.8;

    const x = player.x + Math.cos(angle) * radius;
    const y = player.y + Math.sin(angle) * radius;

    const tailX = player.x + Math.cos(angle - 0.08) * radius;
    const tailY = player.y + Math.sin(angle - 0.08) * radius;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(103,232,249,0.24)";
    ctx.lineWidth = 2;
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "rgba(191,246,255,0.92)";
    ctx.shadowColor = "#67e8f9";
    ctx.shadowBlur = 10;
    ctx.arc(x, y, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "900 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${count}`, player.x, player.y + player.r + 54);

  ctx.restore();
}

function drawMarches(ctx, marches) {
  const now = Date.now() / 1000;

  for (const march of marches) {
    const progress = march.progress;
    const count = Math.max(1, Math.floor(march.count));
    const dx = march.toX - march.fromX;
    const dy = march.toY - march.fromY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / distance;
    const ny = dx / distance;

    ctx.save();

    ctx.beginPath();
    ctx.strokeStyle =
      march.type === "return" ? "rgba(34,197,94,0.24)" : "rgba(103,232,249,0.24)";
    ctx.lineWidth = 3;
    ctx.moveTo(march.fromX, march.fromY);
    ctx.lineTo(march.toX, march.toY);
    ctx.stroke();

    for (let i = 0; i < count; i += 1) {
      const wave = Math.sin(now * 7 + i * 0.37) * 8;
      const streamOffset = (i / Math.max(1, count - 1)) * 0.18;
      const p = clamp(progress - streamOffset, 0, 1);

      const x = march.fromX + dx * p + nx * wave;
      const y = march.fromY + dy * p + ny * wave;

      ctx.beginPath();
      ctx.fillStyle =
        march.type === "return" ? "rgba(134,239,172,0.92)" : "rgba(191,246,255,0.92)";
      ctx.shadowColor = march.type === "return" ? "#22c55e" : "#67e8f9";
      ctx.shadowBlur = 11;
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    const headX = march.fromX + dx * progress;
    const headY = march.fromY + dy * progress;

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${count}`, headX, headY - 18);

    ctx.restore();
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
    const pulse = 1 + Math.sin(Date.now() / 240) * 0.035;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(134,239,172,0.72)";
    ctx.lineWidth = 3;
    ctx.arc(player.x, player.y, (player.r + 22) * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CORE", player.x, player.y);
}

function drawCityOutsideShadow(ctx) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(-CITY_OUTSIDE_PADDING, -CITY_OUTSIDE_PADDING, CITY_WIDTH + CITY_OUTSIDE_PADDING * 2, CITY_OUTSIDE_PADDING);
  ctx.fillRect(-CITY_OUTSIDE_PADDING, CITY_HEIGHT, CITY_WIDTH + CITY_OUTSIDE_PADDING * 2, CITY_OUTSIDE_PADDING);
  ctx.fillRect(-CITY_OUTSIDE_PADDING, 0, CITY_OUTSIDE_PADDING, CITY_HEIGHT);
  ctx.fillRect(CITY_WIDTH, 0, CITY_OUTSIDE_PADDING, CITY_HEIGHT);

  ctx.restore();
}

function drawCityGrid(ctx) {
  ctx.lineWidth = 1;

  for (let x = 0; x <= CITY_WIDTH; x += CITY_GRID_STEP) {
    const major = x % (CITY_GRID_STEP * 2) === 0;

    ctx.beginPath();
    ctx.strokeStyle = major
      ? "rgba(103,232,249,0.18)"
      : "rgba(103,232,249,0.075)";
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CITY_HEIGHT);
    ctx.stroke();
  }

  for (let y = 0; y <= CITY_HEIGHT; y += CITY_GRID_STEP) {
    const major = y % (CITY_GRID_STEP * 2) === 0;

    ctx.beginPath();
    ctx.strokeStyle = major
      ? "rgba(103,232,249,0.18)"
      : "rgba(103,232,249,0.075)";
    ctx.moveTo(0, y);
    ctx.lineTo(CITY_WIDTH, y);
    ctx.stroke();
  }
}

function drawCityBorder(ctx) {
  ctx.save();

  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = 28;
  ctx.strokeRect(0, 0, CITY_WIDTH, CITY_HEIGHT);

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, CITY_WIDTH, CITY_HEIGHT);

  ctx.strokeStyle = "rgba(103,232,249,0.2)";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, CITY_WIDTH, CITY_HEIGHT);

  ctx.restore();
}

function drawCityBuildings(ctx, buildings) {
  for (const building of buildings) {
    const width = building.w * CITY_GRID_STEP;
    const height = building.h * CITY_GRID_STEP;
    const cx = building.x + width / 2;
    const cy = building.y + height / 2;

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    roundedRect(ctx, building.x + 8, building.y + 10, width, height, 22);
    ctx.fill();

    if (building.type === "CrystalPoint") {
      drawCrystalPointBuilding(ctx, building, width, height, cx, cy);
    } else if (building.type === "House") {
      drawHouseBuilding(ctx, building, width, height, cx, cy);
    } else if (building.type === "Barracks") {
      drawBarracksBuilding(ctx, building, width, height, cx, cy);
    } else {
      drawCitadelBuilding(ctx, building, width, height, cx, cy);
    }

    ctx.restore();
  }
}

function drawCitadelBuilding(ctx, building, width, height, cx, cy) {
  const gradient = ctx.createLinearGradient(building.x, building.y, building.x, building.y + height);
  gradient.addColorStop(0, "#67e8f9");
  gradient.addColorStop(1, "#2563eb");

  ctx.fillStyle = gradient;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 20;
  roundedRect(ctx, building.x, building.y, width, height, 22);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(255,255,255,0.38)";
  ctx.lineWidth = 3;
  roundedRect(ctx, building.x + 10, building.y + 10, width - 20, height - 20, 16);
  ctx.stroke();

  drawCitadelCrown(ctx, building.x, building.y, width);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 16px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CITADEL", cx, cy);
}

function drawCrystalPointBuilding(ctx, building, width, height, cx, cy) {
  ctx.fillStyle = "rgba(8,47,73,0.92)";
  roundedRect(ctx, building.x, building.y, width, height, 22);
  ctx.fill();

  ctx.strokeStyle = "rgba(34,211,238,0.48)";
  ctx.lineWidth = 4;
  roundedRect(ctx, building.x + 8, building.y + 8, width - 16, height - 16, 18);
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = "#67e8f9";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 24;
  ctx.moveTo(cx, cy - 48);
  ctx.lineTo(cx + 38, cy);
  ctx.lineTo(cx, cy + 48);
  ctx.lineTo(cx - 38, cy);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CRYSTAL", cx, cy + 68);
}

function drawHouseBuilding(ctx, building, width, height, cx, cy) {
  const gradient = ctx.createLinearGradient(building.x, building.y, building.x, building.y + height);
  gradient.addColorStop(0, "#bbf7d0");
  gradient.addColorStop(1, "#15803d");

  ctx.fillStyle = gradient;
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = 12;
  roundedRect(ctx, building.x, building.y, width, height, 18);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(15,23,42,0.52)";
  roundedRect(ctx, building.x + 23, building.y + 34, width - 46, height - 50, 12);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "900 10px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HOME", cx, cy);
}

function drawBarracksBuilding(ctx, building, width, height, cx, cy) {
  const gradient = ctx.createLinearGradient(building.x, building.y, building.x, building.y + height);
  gradient.addColorStop(0, "#fbbf24");
  gradient.addColorStop(1, "#b45309");

  ctx.fillStyle = gradient;
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 16;
  roundedRect(ctx, building.x + 10, building.y + 18, width - 20, height - 26, 20);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(15,23,42,0.56)";
  roundedRect(ctx, building.x + 62, building.y + 94, width - 124, height - 112, 12);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  roundedRect(ctx, building.x + 28, building.y + 4, 28, 42, 8);
  ctx.fill();
  roundedRect(ctx, building.x + width - 56, building.y + 4, 28, 42, 8);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.34)";
  ctx.lineWidth = 3;
  roundedRect(ctx, building.x + 24, building.y + 30, width - 48, height - 52, 16);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BARRACKS", cx, cy - 4);
}

function drawBuildPreview(ctx, preview) {
  if (!preview) return;

  const width = preview.w * CITY_GRID_STEP;
  const height = preview.h * CITY_GRID_STEP;
  const valid = preview.valid;
  const t = Date.now() / 250;
  const pulse = 1 + Math.sin(t) * 0.04;
  const label = BUILDINGS[preview.type]?.shortLabel || preview.type;

  ctx.save();

  ctx.fillStyle = valid ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)";
  ctx.fillRect(preview.x, preview.y, width, height);

  ctx.strokeStyle = valid ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)";
  ctx.lineWidth = 5;
  ctx.strokeRect(preview.x, preview.y, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 2;

  for (let x = preview.x + CITY_GRID_STEP; x < preview.x + width; x += CITY_GRID_STEP) {
    ctx.beginPath();
    ctx.moveTo(x, preview.y);
    ctx.lineTo(x, preview.y + height);
    ctx.stroke();
  }

  for (let y = preview.y + CITY_GRID_STEP; y < preview.y + height; y += CITY_GRID_STEP) {
    ctx.beginPath();
    ctx.moveTo(preview.x, y);
    ctx.lineTo(preview.x + width, y);
    ctx.stroke();
  }

  const cx = preview.x + width / 2;
  const cy = preview.y + height / 2;

  ctx.beginPath();
  ctx.fillStyle = valid ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)";
  ctx.arc(cx, cy, 68 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = valid ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)";
  ctx.lineWidth = 4;
  ctx.arc(cx, cy, 58 * pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "900 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(valid ? label : "BLOCKED", cx, cy);

  ctx.restore();
}

function drawCitadelCrown(ctx, x, y, width) {
  ctx.save();

  ctx.fillStyle = "rgba(255,255,255,0.28)";

  const towerW = 22;
  const towerH = 20;
  const topY = y - 10;

  roundedRect(ctx, x + 22, topY, towerW, towerH, 6);
  ctx.fill();

  roundedRect(ctx, x + width / 2 - towerW / 2, topY - 8, towerW, towerH + 8, 6);
  ctx.fill();

  roundedRect(ctx, x + width - 44, topY, towerW, towerH, 6);
  ctx.fill();

  ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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

  cityHud: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 10,
    display: "grid",
    gridTemplateColumns: "116px 1fr",
    gap: 8,
    zIndex: 3,
    pointerEvents: "none",
  },

  cityTitleBox: {
    height: 54,
    borderRadius: 16,
    background: "rgba(15,23,42,0.84)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 12px",
    boxSizing: "border-box",
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: 900,
  },

  cityStatusBox: {
    height: 54,
    borderRadius: 16,
    background: "rgba(15,23,42,0.84)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    boxSizing: "border-box",
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: 800,
  },

  cityHint: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 72,
    minHeight: 38,
    borderRadius: 14,
    background: "rgba(15,23,42,0.74)",
    border: "1px solid rgba(103,232,249,0.16)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    zIndex: 3,
    pointerEvents: "none",
  },

  enterCoreActions: {
    position: "absolute",
    zIndex: 6,
    padding: 5,
    borderRadius: 999,
    background: "rgba(15,23,42,0.92)",
    border: "1px solid rgba(103,232,249,0.34)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
  },

  enterButton: {
    minWidth: 68,
    height: 34,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #22d3ee, #2563eb)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  },

  monsterActions: {
    position: "absolute",
    zIndex: 6,
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: 5,
    borderRadius: 999,
    background: "rgba(15,23,42,0.92)",
    border: "1px solid rgba(239,68,68,0.34)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
  },

  attackButton: {
    minWidth: 82,
    height: 30,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #ef4444, #f59e0b)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  },

  landingActions: {
    position: "absolute",
    zIndex: 6,
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: 5,
    borderRadius: 999,
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(103,232,249,0.34)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
  },

  buildActions: {
    position: "absolute",
    zIndex: 6,
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: 5,
    borderRadius: 999,
    background: "rgba(15,23,42,0.92)",
    border: "1px solid rgba(34,197,94,0.36)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
  },

  buildMenu: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 78,
    zIndex: 7,
    borderRadius: 22,
    padding: 12,
    background: "rgba(15,23,42,0.94)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.48)",
  },

  buildMenuHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: 900,
  },

  buildMenuClose: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  buildCardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
  },

  buildCard: {
    minHeight: 82,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
    padding: 6,
  },

  buildCardLocked: {
    opacity: 0.42,
    cursor: "not-allowed",
  },

  buildCardIconCrystal: {
    color: "#67e8f9",
    fontSize: 20,
  },

  buildCardIconHouse: {
    color: "#86efac",
    fontSize: 18,
  },

  buildCardIconBarracks: {
    color: "#fbbf24",
    fontSize: 18,
  },

  landButton: {
    minWidth: 52,
    height: 30,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #22d3ee, #2563eb)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  },

  placeButton: {
    minWidth: 58,
    height: 30,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #22c55e, #15803d)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  },

  placeButtonDisabled: {
    opacity: 0.48,
    cursor: "not-allowed",
    background: "linear-gradient(135deg, #991b1b, #ef4444)",
  },

  cancelButton: {
    width: 28,
    height: 28,
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
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

  cityControls: {
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
    fontSize: 11,
  },

  controlButtonActive: {
    border: "1px solid rgba(251,191,36,0.55)",
    background: "rgba(251,191,36,0.22)",
    color: "#fde68a",
  },
};
