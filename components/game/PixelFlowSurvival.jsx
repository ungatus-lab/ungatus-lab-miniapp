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

const MAX_BUILDING_LEVEL = 5;
const GUARD_CRYSTAL_COST = 1;

const TUTORIAL_HOUSE_TARGET = 3;
const TUTORIAL_CRYSTAL_TARGET = 4;
const TUTORIAL_BARRACKS_TARGET = 4;
const BUILD_TIME_SECONDS = {
  House: 2,
  CrystalPoint: 3,
  Barracks: 5,
};

const BUILDINGS = {
  CrystalPoint: {
    type: "CrystalPoint",
    w: 2,
    h: 2,
    cost: 0,
    workerCost: 5,
    color: "#22d3ee",
  },
  House: {
    type: "House",
    w: 1,
    h: 1,
    cost: 25,
    workerCost: 0,
    color: "#86efac",
  },
  Barracks: {
    type: "Barracks",
    w: 2,
    h: 2,
    cost: 30,
    workerCost: 0,
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

    workers: 5,
    workerCap: 5,

    guardsByLevel: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },

    guardCap: 10,

    xp: 0,
    level: 1,
    nextLevelXp: 100,

    maxAttackSplit: 1,
  };
}

function getTotalGuardsFromStats(stats) {
  return Object.values(stats.guardsByLevel || {}).reduce((sum, value) => sum + value, 0);
}

function getXpRequiredForLevel(level) {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  return Math.floor(100 * Math.pow(level - 1, 1.65));
}

function getNextLevelXp(level) {
  return getXpRequiredForLevel(level + 1);
}

function getMonsterTier(type) {
  if (type === "wild") return 2;
  if (type === "beast") return 3;
  if (type === "brute") return 4;
  if (type === "giant") return 5;
  return 1;
}

function getGuardVisual(level) {
  if (level >= 5) {
    return {
      fill: "rgba(168,85,247,0.96)",
      tail: "rgba(168,85,247,0.24)",
      glow: "#a855f7",
      core: "rgba(255,255,255,0.95)",
      size: 3.8,
    };
  }

  if (level === 4) {
    return {
      fill: "rgba(251,191,36,0.95)",
      tail: "rgba(251,191,36,0.24)",
      glow: "#fbbf24",
      core: "rgba(255,255,255,0.95)",
      size: 3.7,
    };
  }

  if (level === 3) {
    return {
      fill: "rgba(125,211,252,0.96)",
      tail: "rgba(125,211,252,0.24)",
      glow: "#7dd3fc",
      core: "rgba(255,255,255,0.9)",
      size: 3.6,
    };
  }

  if (level === 2) {
    return {
      fill: "rgba(165,243,252,0.96)",
      tail: "rgba(103,232,249,0.28)",
      glow: "#67e8f9",
      core: "rgba(255,255,255,0.82)",
      size: 3.5,
    };
  }

  return {
    fill: "rgba(191,246,255,0.92)",
    tail: "rgba(103,232,249,0.24)",
    glow: "#67e8f9",
    core: null,
    size: 3.4,
  };
}

function createMonster(index) {
  const roll = Math.random();

  let type = "small";
  let r = rand(16, 25);
  let hp = Math.round(rand(20, 50));
  let color = "#67e8f9";

  if (roll > 0.46 && roll <= 0.72) {
    type = "wild";
    r = rand(26, 36);
    hp = Math.round(rand(50, 150));
    color = "#86efac";
  }

  if (roll > 0.72 && roll <= 0.88) {
    type = "beast";
    r = rand(38, 54);
    hp = Math.round(rand(150, 300));
    color = "#facc15";
  }

  if (roll > 0.88 && roll <= 0.96) {
    type = "brute";
    r = rand(56, 76);
    hp = Math.round(rand(300, 700));
    color = "#f97316";
  }

  if (roll > 0.96) {
    type = "giant";
    r = rand(82, 120);
    hp = Math.round(rand(700, 1800));
    color = "#ef4444";
  }

  const armor = getMonsterTier(type);

  return {
    id: `monster-${index}-${Math.random()}`,
    x: rand(180, WORLD_WIDTH - 180),
    y: rand(180, WORLD_HEIGHT - 180),
    r,
    hp,
    maxHp: hp,
    armor,
    type,
    color,
    pulse: rand(0, Math.PI * 2),
  };
}

function createWorld() {
  const spawn = snapPointToLandingGrid({
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
  });
  const tutorialMonster = {
    id: "tutorial-monster",
    x: spawn.x + MAJOR_GRID_STEP * 4,
    y: spawn.y - MAJOR_GRID_STEP * 3,
    r: 22,
    hp: 24,
    maxHp: 24,
    armor: 1,
    type: "small",
    color: "#67e8f9",
    pulse: 0,
    tutorial: true,
  };
  const exclusionRadius = MAJOR_GRID_STEP * 1.35;
  const randomMonsters = Array.from(
    { length: MONSTER_COUNT - 1 },
    (_, index) => createMonster(index)
  ).filter(
    (monster) =>
      Math.hypot(monster.x - tutorialMonster.x, monster.y - tutorialMonster.y) >=
      exclusionRadius
  );

  return {
    monsters: [tutorialMonster, ...randomMonsters],
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
        level: 1,
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
  const constructionQueueRef = useRef([]);
  const tutorialConstructionRef = useRef({ housesCommitted: false, crystalsCommitted: false, barracksCommitted: false });
  const tutorialFlowRef = useRef({ phase: "buildEconomy", timer: 0 });
  const tutorialLandingTargetRef = useRef(null);
  const selectedMonsterRef = useRef(null);
  const mapTutorialSeenRef = useRef(false);
  const mapTutorialTargetRef = useRef(null);
  const mapTutorialZoomRef = useRef({ active: false, targetZoom: 0.3 });
  const mapTutorialGuideRef = useRef({ phase: "off", timer: 0, zoomStart: 0.3 });

  const cameraRef = useRef({
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    zoom: 0.72,
  });

  const cityCameraRef = useRef({
    x: CITY_WIDTH / 2,
    y: CITY_HEIGHT / 2,
    zoom: CITY_MIN_ZOOM,
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
  const buildBatchPreviewRef = useRef([]);
  const selectedBuildingTypeRef = useRef(null);
  const selectedBuildingRef = useRef(null);

  const massBuildRef = useRef({
    pointerId: null,
    active: false,
    downX: 0,
    downY: 0,
    suppressClick: false,
  });

  const lastTimeRef = useRef(0);

  const [screen, setScreen] = useState("menu");
  const [profile, setProfile] = useState(initialProfile);
  const [landingPreview, setLandingPreviewState] = useState(null);
  const [buildPreview, setBuildPreviewState] = useState(null);
  const [buildBatchPreview, setBuildBatchPreviewState] = useState([]);
  const [buildMode, setBuildModeState] = useState(false);
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  const [selectedBuildingType, setSelectedBuildingTypeState] = useState(null);
  const [selectedBuilding, setSelectedBuildingState] = useState(null);
  const [enterCoreVisible, setEnterCoreVisible] = useState(false);
  const [selectedMonster, setSelectedMonsterState] = useState(null);
  const [mapTutorialPhase, setMapTutorialPhase] = useState("off");
  const [mapTutorialTarget, setMapTutorialTarget] = useState(null);
  const [tutorialThreatCardVisible, setTutorialThreatCardVisible] = useState(false);
  const [tutorialFlowPhase, setTutorialFlowPhase] = useState("buildEconomy");

  function updateTutorialFlowPhase(phase) {
    tutorialFlowRef.current.phase = phase;
    tutorialFlowRef.current.timer = 0;
    setTutorialFlowPhase(phase);
  }

  function updateMapTutorialPhase(nextPhase) {
    mapTutorialGuideRef.current.phase = nextPhase;
    mapTutorialGuideRef.current.timer = 0;
    setMapTutorialPhase(nextPhase);
  }
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

  const buildControlPreview =
    [...buildBatchPreview].reverse().find((preview) => preview?.valid) || buildPreview;
  const buildScreen = buildControlPreview
    ? cityWorldToScreen(
        buildControlPreview.x + (buildControlPreview.w * CITY_GRID_STEP) / 2,
        buildControlPreview.y + (buildControlPreview.h * CITY_GRID_STEP) / 2
      )
    : null;
  const buildPanelOnRight = buildScreen ? buildScreen.x < 150 : false;

  const selectedMonsterScreen = selectedMonster
    ? worldToScreen(selectedMonster.x, selectedMonster.y)
    : null;
  const mapTutorialTargetScreen = mapTutorialTarget
    ? worldToScreen(mapTutorialTarget.x, mapTutorialTarget.y)
    : null;
  const tutorialLandingTargetScreen =
    tutorialFlowPhase === "selectLanding" && tutorialLandingTargetRef.current
      ? worldToScreen(tutorialLandingTargetRef.current.x, tutorialLandingTargetRef.current.y)
      : null;

  const totalGuards = getTotalGuardsFromStats(cityStats);
  const armyCap = cityStats.guardCap;
  const tutorialStep = getTutorialStep();
  const batchSummary = getBuildBatchSummary(buildBatchPreview);
  const tutorialBuildTarget =
    tutorialStep === "houses"
      ? TUTORIAL_HOUSE_TARGET
      : tutorialStep === "crystals"
        ? TUTORIAL_CRYSTAL_TARGET
        : tutorialStep === "barracks"
          ? TUTORIAL_BARRACKS_TARGET
          : 1;
  const tutorialBatchReady =
    tutorialStep === "done" || tutorialStep === "map" || tutorialStep === "mapAfterBarracks" || batchSummary.valid >= tutorialBuildTarget;
  const selectedMonsterThreat = selectedMonster
    ? (() => {
        const army = totalGuards;
        const compatibleArmy = Object.entries(cityStats.guardsByLevel || {}).reduce(
          (sum, [level, count]) => sum + (Number(level) >= selectedMonster.armor ? count : 0),
          0
        );
        if (army <= 0 || compatibleArmy <= 0) {
          return {
            key: "impossible",
            label: "IMPOSSIBLE",
            icon: "⚠",
            color: "#ef4444",
            background: "rgba(127,29,29,0.72)",
          };
        }
        const ratio = compatibleArmy / Math.max(1, selectedMonster.hp);
        if (ratio < 0.75) {
          return {
            key: "danger",
            label: "HEAVY LOSSES",
            icon: "⚠",
            color: "#facc15",
            background: "rgba(113,63,18,0.72)",
          };
        }
        if (ratio < 1.35) {
          return {
            key: "even",
            label: "EVEN FIGHT",
            icon: "◆",
            color: "#e5e7eb",
            background: "rgba(55,65,81,0.78)",
          };
        }
        return {
          key: "easy",
          label: "EASY TARGET",
          icon: "✓",
          color: "#38bdf8",
          background: "rgba(7,89,133,0.72)",
        };
      })()
    : null;

  function updateLandingPreview(nextPreview) {
    landingPreviewRef.current = nextPreview;
    setLandingPreviewState(nextPreview);
  }

  function updateBuildBatchPreview(nextBatch) {
    buildBatchPreviewRef.current = nextBatch || [];
    setBuildBatchPreviewState(nextBatch || []);
  }

  function updateBuildPreview(nextPreview) {
    buildPreviewRef.current = nextPreview;
    setBuildPreviewState(nextPreview);
    updateBuildBatchPreview(nextPreview ? [nextPreview] : []);
  }

  function updateSelectedMonster(nextMonster) {
    selectedMonsterRef.current = nextMonster;
    setSelectedMonsterState(nextMonster);
  }

  function updateSelectedBuilding(nextBuilding) {
    selectedBuildingRef.current = nextBuilding;
    setSelectedBuildingState(nextBuilding ? { ...nextBuilding } : null);
  }

  function setBuildMode(nextValue) {
    buildModeRef.current = nextValue;
    setBuildModeState(nextValue);
  }

  function setSelectedBuildingType(nextType) {
    selectedBuildingTypeRef.current = nextType;
    setSelectedBuildingTypeState(nextType);
  }

  function getCityBuildingCount(type) {
    return cityRef.current.buildings.filter(
      (building) => building.type === type && !building.underConstruction
    ).length;
  }

  function getTutorialStep() {
    const houseCount = getCityBuildingCount("House");
    const crystalCount = getCityBuildingCount("CrystalPoint");
    const barracksCount = getCityBuildingCount("Barracks");
    if (houseCount < TUTORIAL_HOUSE_TARGET) {
      return tutorialConstructionRef.current.housesCommitted ? "housesBuilding" : "houses";
    }
    if (crystalCount < TUTORIAL_CRYSTAL_TARGET) {
      return tutorialConstructionRef.current.crystalsCommitted ? "crystalsBuilding" : "crystals";
    }
    if (!mapTutorialSeenRef.current) return "map";
    if (tutorialFlowPhase === "cityBarracks" || tutorialFlowPhase === "barracksBuilding") {
      if (barracksCount < TUTORIAL_BARRACKS_TARGET) {
        return tutorialConstructionRef.current.barracksCommitted ? "barracksBuilding" : "barracks";
      }
      return "mapAfterBarracks";
    }
    return "done";
  }
  function isTutorialConstructionWaiting() {
    return tutorialStep === "housesBuilding" || tutorialStep === "crystalsBuilding" || tutorialStep === "barracksBuilding";
  }

  function shouldShowBuildTutorialArrow() {
    return (
      screen === "city" &&
      (tutorialStep === "houses" || tutorialStep === "crystals" || tutorialStep === "barracks") &&
      !isTutorialConstructionWaiting() &&
      !buildMenuOpen &&
      !buildMode &&
      !buildPreview
    );
  }

  function shouldShowCrystalMenuHint() {
    return screen === "city" && buildMenuOpen && tutorialStep === "crystals" && !isTutorialConstructionWaiting();
  }

  function shouldShowHouseMenuHint() {
    return screen === "city" && buildMenuOpen && tutorialStep === "houses" && !isTutorialConstructionWaiting();
  }
  function shouldShowBarracksMenuHint() {
    return screen === "city" && buildMenuOpen && tutorialStep === "barracks" && !isTutorialConstructionWaiting();
  }

  function shouldShowMapTutorialArrow() {
    return (
      screen === "city" &&
      (tutorialStep === "map" || tutorialStep === "mapAfterBarracks") &&
      !buildMenuOpen &&
      !buildMode &&
      !buildPreview &&
      !selectedBuilding
    );
  }

  function getCitadelBuilding() {
    return cityRef.current.buildings.find((building) => building.id === "citadel");
  }

  function getTutorialPlacement(type) {
    const citadel = getCitadelBuilding();
    const definition = BUILDINGS[type] || BUILDINGS.House;

    if (!citadel) {
      return snapCityPointToGrid(
        { x: CITY_WIDTH / 2, y: CITY_HEIGHT / 2 },
        definition.w,
        definition.h
      );
    }

    if (type === "House") {
      return snapCityPointToGrid(
        {
          x: citadel.x,
          y: citadel.y + citadel.h * CITY_GRID_STEP,
        },
        definition.w,
        definition.h
      );
    }

    if (type === "CrystalPoint") {
      return snapCityPointToGrid(
        {
          x: citadel.x - definition.w * CITY_GRID_STEP,
          y: citadel.y - definition.h * CITY_GRID_STEP - CITY_GRID_STEP,
        },
        definition.w,
        definition.h
      );
    }

    return snapCityPointToGrid(
      {
        x: citadel.x + citadel.w * CITY_GRID_STEP,
        y: citadel.y - definition.h * CITY_GRID_STEP - CITY_GRID_STEP,
      },
      definition.w,
      definition.h
    );
  }

  function resetArena() {
    worldRef.current = createWorld();
    cityRef.current = createCityState();
    cityStatsRef.current = createCityStats();
    cityStatsUiTimerRef.current = 0;
    marchesRef.current = [];
    constructionQueueRef.current = [];
    tutorialConstructionRef.current = { housesCommitted: false, crystalsCommitted: false, barracksCommitted: false };
    mapTutorialSeenRef.current = false;
    tutorialFlowRef.current = { phase: "buildEconomy", timer: 0 };
    tutorialLandingTargetRef.current = null;
    setTutorialFlowPhase("buildEconomy");
    mapTutorialTargetRef.current = null;
    mapTutorialZoomRef.current = { active: false, targetZoom: 0.3 };
    mapTutorialGuideRef.current = { phase: "off", timer: 0, zoomStart: 0.3 };
    updateMapTutorialPhase("off");
    setMapTutorialTarget(null);
    setTutorialThreatCardVisible(false);
    updateSelectedMonster(null);
    updateSelectedBuilding(null);

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
      zoom: CITY_MIN_ZOOM,
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

    massBuildRef.current = {
      pointerId: null,
      active: false,
      downX: 0,
      downY: 0,
      suppressClick: false,
    };

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
      status: "Ready",
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

  function centerCamera() {
    const player = playerRef.current;
    if (!player) return;

    cameraRef.current.x = player.x;
    cameraRef.current.y = player.y;
    clampCameraToWorld();
    forceLandingPreviewRender();
  }

  function activateTeleport() {
    if (teleportEffectRef.current?.active) return;
    if (cooldownRef.current > 0) return;

    setEnterCoreVisible(false);
    updateSelectedMonster(null);
    teleportModeRef.current = true;

    if (tutorialFlowRef.current.phase === "teleportButton") {
      tutorialLandingTargetRef.current = getTutorialLandingTarget();
      setTutorialThreatCardVisible(false);
      updateSelectedMonster(null);
      updateTutorialFlowPhase("selectLanding");
    }
    setHud((current) => ({
      ...current,
      teleportMode: true,
      status: "Teleport armed.",
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
    updateMapTutorial(dt);

    const flow = tutorialFlowRef.current;
    if (flow.phase === "inspectMonster") {
      flow.timer += dt;
      if (flow.timer >= 1.8) updateTutorialFlowPhase("teleportButton");
    }
    if (flow.phase === "teleporting" && !teleportEffectRef.current && cooldownRef.current > 0) {
      setEnterCoreVisible(true);
      updateTutorialFlowPhase("enterCity");
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

  function findTutorialMonster() {
    return (
      worldRef.current.monsters.find((monster) => monster.id === "tutorial-monster") ||
      null
    );
  }

  function getTutorialLandingTarget() {
    const monster = findTutorialMonster();
    if (!monster) return null;
    const block = getLandingBlock(monster);
    return snapToLandingGrid({
      x: block.centerX,
      y: block.centerY + MAJOR_GRID_STEP,
    });
  }

  function updateMapTutorial(dt) {
    if (screen !== "arena") return;

    const guide = mapTutorialGuideRef.current;
    const camera = cameraRef.current;

    if (mapTutorialZoomRef.current.active) {
      const targetZoom = mapTutorialZoomRef.current.targetZoom;
      camera.zoom = Math.max(targetZoom, camera.zoom - dt * 0.24);
      clampCameraToWorld();

      if (camera.zoom > targetZoom + 0.002) return;

      camera.zoom = targetZoom;
      mapTutorialZoomRef.current.active = false;

      const monster = findTutorialMonster();
      if (!monster) {
        mapTutorialSeenRef.current = true;
        updateMapTutorialPhase("off");
        return;
      }

      const player = playerRef.current;
      camera.x = (player.x + monster.x) / 2;
      camera.y = (player.y + monster.y) / 2;
      clampCameraToWorld();

      mapTutorialTargetRef.current = monster;
      setMapTutorialTarget({ ...monster });
      guide.zoomStart = camera.zoom;
      updateMapTutorialPhase("monsterPointer");
      return;
    }

    if (guide.phase === "monsterPointer") {
      guide.timer += dt;
      if (guide.timer >= 1.25) {
        guide.zoomStart = camera.zoom;
        updateMapTutorialPhase("monsterZoom");
      }
      return;
    }

    if (guide.phase === "monsterZoom") {
      if (camera.zoom >= guide.zoomStart + 0.08) {
        updateMapTutorialPhase("monsterPointerFinal");
      }
    }
  }

  function updateCity(dt) {
    const stats = cityStatsRef.current;
    const buildings = cityRef.current.buildings;

    const activeConstructionId = constructionQueueRef.current[0];
    if (activeConstructionId) {
      const building = buildings.find((item) => item.id === activeConstructionId);
      if (!building) {
        constructionQueueRef.current.shift();
      } else {
        building.buildElapsed = Math.min(
          building.buildDuration,
          (building.buildElapsed || 0) + dt
        );
        if (building.buildElapsed >= building.buildDuration) {
          building.underConstruction = false;
          constructionQueueRef.current.shift();

          if (building.type === "House") {
            stats.workerCap += 5;
            stats.workers += 5;
            stats.guardCap += 25;
          }
        }
      }
    }

    if (!Number.isFinite(stats.crystals)) {
      stats.crystals = 0;
    }

    stats.crystalRate = buildings
      .filter(
        (building) => building.type === "CrystalPoint" && !building.underConstruction
      )
      .reduce((sum, building) => sum + (building.level || 1), 0);

    stats.crystals += stats.crystalRate * dt;

    for (const building of buildings) {
      if (building.type !== "Barracks" || building.underConstruction) continue;

      const buildingLevel = building.level || 1;
      const homeArmyTotal = getTotalGuardsFromStats(stats);

      if (homeArmyTotal >= stats.guardCap) {
        building.trainTimer = 0;
        continue;
      }

      if (stats.crystals < GUARD_CRYSTAL_COST) {
        building.trainTimer = 0;
        continue;
      }

      const productionTime = Math.pow(1.5, buildingLevel - 1);
      building.trainTimer = (building.trainTimer || 0) + dt;

      if (
        building.trainTimer >= productionTime &&
        getTotalGuardsFromStats(stats) < stats.guardCap &&
        stats.crystals >= GUARD_CRYSTAL_COST
      ) {
        building.trainTimer = 0;
        stats.crystals -= GUARD_CRYSTAL_COST;
        stats.guardsByLevel[buildingLevel] =
          (stats.guardsByLevel[buildingLevel] || 0) + 1;
      }
    }

    cityStatsUiTimerRef.current += dt;

    if (cityStatsUiTimerRef.current >= 0.2) {
      cityStatsUiTimerRef.current = 0;
      setCityStats({ ...stats });
    }
  }

  function recalculateCityEconomy() {
    const stats = cityStatsRef.current;

    if (!Number.isFinite(stats.crystals)) {
      stats.crystals = 0;
    }

    stats.crystalRate = cityRef.current.buildings
      .filter(
        (building) => building.type === "CrystalPoint" && !building.underConstruction
      )
      .reduce((sum, building) => sum + (building.level || 1), 0);

    setCityStats({ ...stats });
  }

  function applyCityLevelProgression() {
    const stats = cityStatsRef.current;
    let changed = false;

    while (stats.level < 100 && stats.xp >= getNextLevelXp(stats.level)) {
      stats.level += 1;
      stats.nextLevelXp = getNextLevelXp(stats.level);
      stats.guardCap += 5;
      changed = true;

      if (stats.level >= 10) {
        stats.maxAttackSplit = Math.min(10, Math.floor(stats.level / 10) + 1);
      }

      if (stats.level === 5) {
        stats.guardCap += 10;
      }

      if (stats.level === 10) {
        stats.guardCap += 25;
      }

      if (stats.level === 20) {
        stats.guardCap += 50;
      }
    }

    if (changed && playerRef.current) {
      playerRef.current.level = stats.level;

      setHud((current) => ({
        ...current,
        level: stats.level,
        status: `Level ${stats.level}`,
      }));
    }

    setCityStats({ ...stats });
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
        status: "Teleport complete.",
      }));

      return;
    }

    if (effect.phase === "arrival" && effect.timer >= TELEPORT_ARRIVAL_SECONDS) {
      teleportEffectRef.current = null;
    }
  }

  function calculateDamageAndReturn(guardsByLevel, monster) {
    const nextReturn = {};
    let remainingHp = monster.hp;

    const levels = Object.keys(guardsByLevel)
      .map((level) => Number(level))
      .sort((a, b) => b - a);

    for (const level of levels) {
      const count = Math.floor(guardsByLevel[level] || 0);
      if (count <= 0) continue;

      const fullDamage = level >= monster.armor;
      const damagePerUnit = fullDamage ? level : 0.25;

      const needed = Math.ceil(remainingHp / damagePerUnit);
      const used = Math.min(count, needed);
      const damage = used * damagePerUnit;

      remainingHp = Math.max(0, remainingHp - damage);

      const returned = count - used;

      if (returned > 0) {
        nextReturn[level] = (nextReturn[level] || 0) + returned;
      }

      if (remainingHp <= 0) break;
    }

    return {
      damage: monster.hp - remainingHp,
      returnGuardsByLevel: nextReturn,
      monsterRemainingHp: remainingHp,
    };
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
      const nextMarch = { ...march, progress: nextProgress };

      if (nextProgress < 1) {
        nextMarches.push(nextMarch);
        continue;
      }

      if (march.type === "attack") {
        const monster = world.monsters.find((item) => item.id === march.targetMonsterId);
        if (!monster) continue;

        const result = calculateDamageAndReturn(march.guardsByLevel, monster);
        monster.hp = Math.max(0, result.monsterRemainingHp);

        if (monster.hp <= 0) {
          const rewardCrystals =
            monster.type === "giant"
              ? 120
              : monster.type === "brute"
                ? 70
                : monster.type === "beast"
                  ? 42
                  : monster.type === "wild"
                    ? 24
                    : 14;

          const rewardXp =
            monster.type === "giant"
              ? 130
              : monster.type === "brute"
                ? 70
                : monster.type === "beast"
                  ? 35
                  : monster.type === "wild"
                    ? 18
                    : 10;

          stats.crystals += rewardCrystals;
          stats.xp += rewardXp;

          applyCityLevelProgression();

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

        const returnCount = getTotalGuardsFromStats({
          guardsByLevel: result.returnGuardsByLevel,
        });

        if (returnCount > 0) {
          nextMarches.push({
            id: `return-${Date.now()}-${Math.random()}`,
            type: "return",
            count: returnCount,
            guardsByLevel: result.returnGuardsByLevel,
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
        for (const [level, count] of Object.entries(march.guardsByLevel || {})) {
          const numericLevel = Number(level);
          stats.guardsByLevel[numericLevel] =
            (stats.guardsByLevel[numericLevel] || 0) + count;
        }
      }
    }

    marchesRef.current = nextMarches;
  }

  function getLevelUpgradeMultiplier(nextLevel) {
    return nextLevel * (nextLevel - 1);
  }

  function getUpgradeCrystalCost(building) {
    if (!building || building.type === "Citadel") return 0;

    const currentLevel = building.level || 1;
    const nextLevel = currentLevel + 1;

    if (building.type === "CrystalPoint") return 0;

    const definition = BUILDINGS[building.type];
    const baseCost = definition?.cost || 0;

    return baseCost * getLevelUpgradeMultiplier(nextLevel);
  }

  function getUpgradeWorkerCost(building) {
    if (!building || building.type === "Citadel") return 0;

    const currentLevel = building.level || 1;
    const nextLevel = currentLevel + 1;

    if (building.type === "CrystalPoint") {
      return BUILDINGS.CrystalPoint.workerCost * getLevelUpgradeMultiplier(nextLevel);
    }

    return 0;
  }

  function getUpgradeCostLabel(building) {
    if (!building || building.type === "Citadel") return "";

    const crystalCost = getUpgradeCrystalCost(building);
    const workerCost = getUpgradeWorkerCost(building);

    if (workerCost > 0) return `👥${workerCost}`;
    return `💎${crystalCost}`;
  }

  function canUpgradeBuilding(building) {
    if (!building) return false;
    if (building.type === "Citadel") return false;

    const currentLevel = building.level || 1;
    const nextLevel = currentLevel + 1;

    if (currentLevel >= MAX_BUILDING_LEVEL) return false;
    if (cityStatsRef.current.level < nextLevel) return false;

    const crystalCost = getUpgradeCrystalCost(building);
    const workerCost = getUpgradeWorkerCost(building);

    if (cityStatsRef.current.crystals < crystalCost) return false;
    if (cityStatsRef.current.workers < workerCost) return false;

    return true;
  }

  function upgradeSelectedBuilding() {
    const selected = selectedBuildingRef.current;
    if (!selected) return;

    const building = cityRef.current.buildings.find((item) => item.id === selected.id);
    if (!building) return;
    if (!canUpgradeBuilding(building)) return;

    const stats = cityStatsRef.current;

    const crystalCost = getUpgradeCrystalCost(building);
    const workerCost = getUpgradeWorkerCost(building);

    stats.crystals = Math.max(0, stats.crystals - crystalCost);
    stats.workers = Math.max(0, stats.workers - workerCost);

    const oldLevel = building.level || 1;
    building.level = oldLevel + 1;

    if (building.type === "House") {
      const oldWorkerBonus = oldLevel * 5;
      const newWorkerBonus = building.level * 5;
      const oldGuardBonus = oldLevel * 25;
      const newGuardBonus = building.level * 25;

      const workerGain = newWorkerBonus - oldWorkerBonus;
      const guardGain = newGuardBonus - oldGuardBonus;

      stats.workerCap += workerGain;
      stats.workers += workerGain;
      stats.guardCap += guardGain;
    }

    recalculateCityEconomy();
    updateSelectedBuilding(building);
    setCityStats({ ...stats });
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
    drawOrbitGuards(ctx, player, cityStatsRef.current.guardsByLevel);
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
    drawCityBuildings(ctx, cityRef.current.buildings, selectedBuilding?.id);

    const activePreviews =
      buildBatchPreviewRef.current.length > 0
        ? buildBatchPreviewRef.current
        : buildPreviewRef.current
          ? [buildPreviewRef.current]
          : [];

    const tutorialDemoPreviews = getTutorialDemoPreviews(activePreviews);

    drawBuildPreviews(ctx, tutorialDemoPreviews);
    drawBuildPreviews(ctx, activePreviews);

    ctx.restore();
  }

  function getTutorialDemoPreviews(activePreviews) {
    if (!buildPreviewRef.current) return [];
    if ((activePreviews || []).length > 1) return [];

    const preview = buildPreviewRef.current;
    const step = getTutorialStep();

    if (step === "houses" && preview.type === "House") {
      return makeTutorialDemoBatch(preview, [
        [0, 0],
        [1, 0],
        [1, 1],
      ]);
    }

    if (step === "crystals" && preview.type === "CrystalPoint") {
      return makeTutorialDemoBatch(preview, [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ]);
    }
    if (step === "barracks" && preview.type === "Barracks") {
      return makeTutorialDemoBatch(preview, [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ]);
    }

    return [];
  }

  function makeTutorialDemoBatch(anchorPreview, offsets) {
    const definition = BUILDINGS[anchorPreview.type] || BUILDINGS.Barracks;
    const stepX = definition.w * CITY_GRID_STEP;
    const stepY = definition.h * CITY_GRID_STEP;

    return makeValidatedBuildBatch(
      anchorPreview.type,
      offsets.map(([ox, oy]) => ({
        x: anchorPreview.x + ox * stepX,
        y: anchorPreview.y + oy * stepY,
      }))
    ).map((preview) => ({
      ...preview,
      tutorialDemo: true,
    }));
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
    const snappedPoint =
      tutorialFlowRef.current.phase === "selectLanding" && tutorialLandingTargetRef.current
        ? tutorialLandingTargetRef.current
        : snapToLandingGrid(rawPoint);

    teleportModeRef.current = false;
    updateLandingPreview(snappedPoint);
    if (tutorialFlowRef.current.phase === "selectLanding") {
      updateTutorialFlowPhase("confirmLanding");
    }
  }

  function beginTeleportToLanding() {
    const player = playerRef.current;
    const currentLanding = landingPreviewRef.current;

    if (!player || !currentLanding) return;
    if (cooldownRef.current > 0) return;
    if (teleportEffectRef.current?.active) return;
    if (tutorialFlowRef.current.phase === "confirmLanding") {
      updateTutorialFlowPhase("teleporting");
    }
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
  }

  function cancelLandingPreview() {
    updateLandingPreview(null);
    teleportModeRef.current = false;
  }

  function enterCity() {
    if (tutorialFlowRef.current.phase === "enterCity") {
      updateTutorialFlowPhase("cityBarracks");
    }
    updateLandingPreview(null);
    setTutorialThreatCardVisible(false);
    updateSelectedMonster(null);
    teleportModeRef.current = false;
    setEnterCoreVisible(false);
    setBuildMode(false);
    updateBuildPreview(null);
    setBuildMenuOpen(false);
    cityCameraRef.current.x = CITY_WIDTH / 2;
    cityCameraRef.current.y = CITY_HEIGHT / 2;
    cityCameraRef.current.zoom = CITY_MIN_ZOOM;
    recalculateCityEconomy();
    setScreen("city");
  }

  function backToMap() {
    if (tutorialStep === "map") {
      mapTutorialZoomRef.current = { active: true, targetZoom: 0.3 };
      mapTutorialTargetRef.current = null;
      setMapTutorialTarget(null);
      updateMapTutorialPhase("zoomout");
    }

    setBuildMode(false);
    updateBuildPreview(null);
    setBuildMenuOpen(false);
    updateSelectedBuilding(null);
    recalculateCityEconomy();
    setScreen("arena");
  }

  function centerCityCamera() {
    cityCameraRef.current.x = CITY_WIDTH / 2;
    cityCameraRef.current.y = CITY_HEIGHT / 2;
    cityCameraRef.current.zoom = CITY_MIN_ZOOM;
    clampCityCameraToWorld();
    forceBuildPreviewRender();
  }

  function openBuildMenu() {
    setBuildMenuOpen((current) => !current);
    setBuildMode(false);
    updateBuildPreview(null);
    setSelectedBuildingType(null);
    updateSelectedBuilding(null);
  }

  function chooseBuilding(type) {
    setSelectedBuildingType(type);
    setBuildMenuOpen(false);
    setBuildMode(true);
    updateSelectedBuilding(null);

    const shouldAutoPlace =
      (type === "House" && tutorialStep === "houses") ||
      (type === "CrystalPoint" && tutorialStep === "crystals") ||
      (type === "Barracks" && tutorialStep === "barracks");

    if (shouldAutoPlace) {
      const suggested = getTutorialPlacement(type);
      updateBuildPreview(makeBuildPreviewFromGrid(suggested, type));
    } else {
      updateBuildPreview(null);
    }
  }

  function resetCityBuildings() {
    cityRef.current = createCityState();
    cityStatsRef.current = createCityStats();
    marchesRef.current = [];
    constructionQueueRef.current = [];
    tutorialConstructionRef.current = { housesCommitted: false, crystalsCommitted: false, barracksCommitted: false };
    setBuildMode(false);
    updateBuildPreview(null);
    setBuildMenuOpen(false);
    setSelectedBuildingType(null);
    updateSelectedBuilding(null);
    cityCameraRef.current.x = CITY_WIDTH / 2;
    cityCameraRef.current.y = CITY_HEIGHT / 2;
    cityCameraRef.current.zoom = CITY_MIN_ZOOM;
    clampCityCameraToWorld();
    forceBuildPreviewRender();
    setCityStats({ ...cityStatsRef.current });
  }

  function makeBuildPreviewFromPoint(point) {
    const type = selectedBuildingTypeRef.current || "Barracks";
    const definition = BUILDINGS[type] || BUILDINGS.Barracks;
    const snapped = snapCityPointToGrid(point, definition.w, definition.h);

    return makeBuildPreviewFromGrid(snapped, type);
  }

  function makeBuildPreviewFromGrid(snapped, type) {
    const definition = BUILDINGS[type] || BUILDINGS.Barracks;

    const preview = {
      type: definition.type,
      x: snapped.x,
      y: snapped.y,
      w: definition.w,
      h: definition.h,
      cost: definition.cost,
      workerCost: definition.workerCost || 0,
      valid: true,
      affordable: true,
    };

    preview.valid = canPlaceBuilding(preview);

    return preview;
  }

  function canPlaceBuilding(preview, buildings = cityRef.current.buildings, stats = cityStatsRef.current) {
    if (!preview) return false;

    const left = preview.x;
    const top = preview.y;
    const right = preview.x + preview.w * CITY_GRID_STEP;
    const bottom = preview.y + preview.h * CITY_GRID_STEP;

    if (stats.crystals < preview.cost) return false;
    if (stats.workers < (preview.workerCost || 0)) return false;

    if (left < 0 || top < 0 || right > CITY_WIDTH || bottom > CITY_HEIGHT) {
      return false;
    }

    for (const building of buildings) {
      const bLeft = building.x;
      const bTop = building.y;
      const bRight = building.x + building.w * CITY_GRID_STEP;
      const bBottom = building.y + building.h * CITY_GRID_STEP;

      const separated =
        right <= bLeft || left >= bRight || bottom <= bTop || top >= bBottom;

      if (!separated) return false;
    }

    return true;
  }

  function buildBatchFromDrag(anchorPreview, clientX, clientY) {
    if (!anchorPreview) return [];

    const type = anchorPreview.type;
    const definition = BUILDINGS[type] || BUILDINGS.Barracks;
    const worldPoint = cityScreenToWorld(clientX, clientY);
    const target = snapCityPointToGrid(worldPoint, definition.w, definition.h);

    const stepX = definition.w * CITY_GRID_STEP;
    const stepY = definition.h * CITY_GRID_STEP;

    const cells = [{ x: anchorPreview.x, y: anchorPreview.y }];

    if ((type === "CrystalPoint" && getTutorialStep() === "crystals") || (type === "Barracks" && getTutorialStep() === "barracks")) {
      const rawDySteps = Math.round((target.y - anchorPreview.y) / Math.max(1, stepY));
      const directionY = rawDySteps < 0 ? -1 : 1;
      const count = Math.min(
        (type === "Barracks" ? TUTORIAL_BARRACKS_TARGET : TUTORIAL_CRYSTAL_TARGET),
        Math.max(1, Math.abs(rawDySteps) + 1)
      );

      for (let i = 1; i < count; i += 1) {
        cells.push({
          x: anchorPreview.x,
          y: anchorPreview.y + i * directionY * stepY,
        });
      }

      return makeValidatedBuildBatch(type, cells);
    }

    const dxSteps = Math.round((target.x - anchorPreview.x) / Math.max(1, stepX));
    const dySteps = Math.round((target.y - anchorPreview.y) / Math.max(1, stepY));

    const sx = dxSteps === 0 ? 0 : dxSteps > 0 ? 1 : -1;
    const sy = dySteps === 0 ? 0 : dySteps > 0 ? 1 : -1;

    for (let ix = 1; ix <= Math.abs(dxSteps); ix += 1) {
      cells.push({
        x: anchorPreview.x + ix * sx * stepX,
        y: anchorPreview.y,
      });
    }

    const cornerX = anchorPreview.x + dxSteps * stepX;

    for (let iy = 1; iy <= Math.abs(dySteps); iy += 1) {
      cells.push({
        x: cornerX,
        y: anchorPreview.y + iy * sy * stepY,
      });
    }

    return makeValidatedBuildBatch(type, cells);
  }

  function makeValidatedBuildBatch(type, cells) {
    const definition = BUILDINGS[type] || BUILDINGS.Barracks;
    const virtualBuildings = [...cityRef.current.buildings];
    const budget = {
      crystals: cityStatsRef.current.crystals,
      workers: cityStatsRef.current.workers,
    };

    return cells.map((cell) => {
      const snapped = snapCityPointToGrid(cell, definition.w, definition.h);
      const preview = makeBuildPreviewFromGrid(snapped, type);

      const geometryValid = canPlaceBuilding(
        { ...preview, cost: 0, workerCost: 0 },
        virtualBuildings,
        { crystals: Infinity, workers: Infinity }
      );

      const affordable =
        budget.crystals >= preview.cost && budget.workers >= (preview.workerCost || 0);

      preview.valid = geometryValid && affordable;
      preview.affordable = affordable;

      if (preview.valid) {
        budget.crystals -= preview.cost;
        budget.workers -= preview.workerCost || 0;

        virtualBuildings.push({
          id: `virtual-${virtualBuildings.length}`,
          type: preview.type,
          x: preview.x,
          y: preview.y,
          w: preview.w,
          h: preview.h,
        });
      }

      return preview;
    });
  }

  function getBuildBatchSummary(batch) {
    const items = batch || [];
    const validItems = items.filter((item) => item.valid);

    return {
      total: items.length,
      valid: validItems.length,
      crystalCost: validItems.reduce((sum, item) => sum + (item.cost || 0), 0),
      workerCost: validItems.reduce((sum, item) => sum + (item.workerCost || 0), 0),
    };
  }

  function selectBuildPoint(clientX, clientY) {
    if (!buildModeRef.current && !buildPreviewRef.current) return;

    const worldPoint = cityScreenToWorld(clientX, clientY);
    const preview = makeBuildPreviewFromPoint(worldPoint);
    updateBuildPreview(preview);
  }

  function applyBuildings(previews) {
    const validPreviews = (previews || []).filter((preview) => preview && preview.valid);
    if (validPreviews.length <= 0) return;

    const stats = cityStatsRef.current;
    let crystalCost = 0;
    let workerCost = 0;
    const newBuildings = [];

    for (const preview of validPreviews) {
      const definition = BUILDINGS[preview.type] || BUILDINGS.Barracks;
      crystalCost += definition.cost;
      workerCost += definition.workerCost || 0;
      const buildDuration = BUILD_TIME_SECONDS[preview.type] || 3;
      newBuildings.push({
        id: `${preview.type}-${Date.now()}-${Math.random()}`,
        type: preview.type,
        level: 1,
        trainTimer: 0,
        x: preview.x,
        y: preview.y,
        w: preview.w,
        h: preview.h,
        color: definition.color,
        underConstruction: true,
        buildElapsed: 0,
        buildDuration,
      });
    }

    stats.crystals = Math.max(0, stats.crystals - crystalCost);
    stats.workers = Math.max(0, stats.workers - workerCost);

    cityRef.current = {
      ...cityRef.current,
      buildings: [...cityRef.current.buildings, ...newBuildings],
    };
    constructionQueueRef.current.push(...newBuildings.map((building) => building.id));

    setBuildMode(false);
    updateBuildPreview(null);
    setSelectedBuildingType(null);
    recalculateCityEconomy();
    setCityStats({ ...stats });
  }

  function placeBuilding() {
    if (massBuildRef.current.suppressClick) {
      massBuildRef.current.suppressClick = false;
      return;
    }

    const preview = buildPreviewRef.current;

    if (!preview || !preview.valid) return;

    const step = getTutorialStep();
    if (step === "houses" || step === "crystals") return;

    applyBuildings([preview]);
  }

  function beginPlaceButtonPointer(event) {
    const preview = buildPreviewRef.current;

    if (!preview || !preview.valid) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);

    massBuildRef.current = {
      pointerId: event.pointerId,
      active: false,
      downX: event.clientX,
      downY: event.clientY,
      suppressClick: false,
    };

    updateBuildBatchPreview([preview]);
  }

  function movePlaceButtonPointer(event) {
    const state = massBuildRef.current;

    if (state.pointerId !== event.pointerId) return;

    const distance = Math.hypot(event.clientX - state.downX, event.clientY - state.downY);

    if (distance > 8) {
      state.active = true;
    }

    if (!state.active) return;

    const batch = buildBatchFromDrag(buildPreviewRef.current, event.clientX, event.clientY);
    updateBuildBatchPreview(batch);
  }

  function endPlaceButtonPointer(event) {
    const state = massBuildRef.current;

    if (state.pointerId !== event.pointerId) return;

    if (state.active) {
      state.suppressClick = true;

      const step = getTutorialStep();
      const requiredCount =
        step === "houses"
          ? TUTORIAL_HOUSE_TARGET
          : step === "crystals"
            ? TUTORIAL_CRYSTAL_TARGET
            : step === "barracks"
              ? TUTORIAL_BARRACKS_TARGET
              : 1;
      const validCount = getBuildBatchSummary(buildBatchPreviewRef.current).valid;

      if ((step !== "houses" && step !== "crystals" && step !== "barracks") || validCount >= requiredCount) {
        if (step === "houses") tutorialConstructionRef.current.housesCommitted = true;
        if (step === "crystals") tutorialConstructionRef.current.crystalsCommitted = true;
        if (step === "barracks") { tutorialConstructionRef.current.barracksCommitted = true; updateTutorialFlowPhase("barracksBuilding"); }
        applyBuildings(buildBatchPreviewRef.current);
      } else {
        const anchor = buildPreviewRef.current;
        updateBuildBatchPreview(anchor ? [anchor] : []);
      }
    }

    massBuildRef.current.pointerId = null;
    massBuildRef.current.active = false;
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

  function findCityBuildingAt(cityPoint) {
    for (let i = cityRef.current.buildings.length - 1; i >= 0; i -= 1) {
      const building = cityRef.current.buildings[i];

      if (
        cityPoint.x >= building.x &&
        cityPoint.x <= building.x + building.w * CITY_GRID_STEP &&
        cityPoint.y >= building.y &&
        cityPoint.y <= building.y + building.h * CITY_GRID_STEP
      ) {
        return building;
      }
    }

    return null;
  }

  function beginAttackSelectedMonster() {
    const monster = selectedMonsterRef.current;
    const player = playerRef.current;
    const stats = cityStatsRef.current;

    if (!monster || !player) return;

    const sendCount = getTotalGuardsFromStats(stats);

    if (sendCount <= 0) return;

    const sentGuardsByLevel = { ...stats.guardsByLevel };

    stats.guardsByLevel = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const building of cityRef.current.buildings) {
      if (building.type === "Barracks") {
        building.trainTimer = 0;
      }
    }

    marchesRef.current.push({
      id: `attack-${Date.now()}-${Math.random()}`,
      type: "attack",
      count: sendCount,
      guardsByLevel: sentGuardsByLevel,
      fromX: player.x,
      fromY: player.y,
      toX: monster.x,
      toY: monster.y,
      progress: 0,
      targetMonsterId: monster.id,
    });

    setCityStats({ ...stats });
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
        const pinchClientX = (a.x + b.x) / 2;
        const pinchClientY = (a.y + b.y) / 2;
        zoomCameraAt(ratio, pinchClientX, pinchClientY);
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

    if (wasDraggingLanding) return;

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
          return;
        }
      }

      const monster = findMonsterAt(worldPoint);

      if (monster) {
        updateSelectedMonster({ ...monster });
        setEnterCoreVisible(false);

        if (mapTutorialTargetRef.current?.id === monster.id) {
          mapTutorialSeenRef.current = true;
          mapTutorialTargetRef.current = null;
          setMapTutorialTarget(null);
          setTutorialThreatCardVisible(true);
          updateTutorialFlowPhase("inspectMonster");
          updateMapTutorialPhase("off");
        }
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

    if (wasDraggingPreview) return;

    if (wasTap && (buildModeRef.current || buildPreviewRef.current)) {
      selectBuildPoint(event.clientX, event.clientY);
      return;
    }

    if (wasTap && !buildModeRef.current && !buildPreviewRef.current) {
      const cityPoint = cityScreenToWorld(event.clientX, event.clientY);
      const building = findCityBuildingAt(cityPoint);
      updateSelectedBuilding(building);
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

  function zoomCameraAt(ratio, clientX, clientY) {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const worldX = (screenX - canvas.clientWidth / 2) / camera.zoom + camera.x;
    const worldY = (screenY - canvas.clientHeight / 2) / camera.zoom + camera.y;

    camera.zoom = clamp(camera.zoom * ratio, MIN_ZOOM, MAX_ZOOM);
    camera.x = worldX - (screenX - canvas.clientWidth / 2) / camera.zoom;
    camera.y = worldY - (screenY - canvas.clientHeight / 2) / camera.zoom;

    clampCameraToWorld();
    forceLandingPreviewRender();
  }

  function zoomCamera(ratio) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    zoomCameraAt(
      ratio,
      rect.left + canvas.clientWidth / 2,
      rect.top + canvas.clientHeight / 2
    );
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
    setBuildBatchPreviewState(buildBatchPreviewRef.current ? [...buildBatchPreviewRef.current] : []);
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

  return (
    <div style={styles.overlay}>
      <style>
        {`
          @keyframes tutorialBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @keyframes tutorialGlow {
            0%, 100% { box-shadow: 0 0 0 rgba(34,211,238,0.0); }
            50% { box-shadow: 0 0 28px rgba(34,211,238,0.58); }
          }

          @keyframes chipGlow {
            0%, 100% { box-shadow: 0 0 0 rgba(251,191,36,0); }
            50% { box-shadow: 0 0 24px rgba(251,191,36,0.5); }
          }

          @keyframes tutorialFingerDragHouse {
            0%, 12% { transform: translate(0, 0) scale(1); opacity: 0; }
            22%, 38% { transform: translate(0, 0) scale(0.9); opacity: 0.9; }
            58% { transform: translate(58px, 0) scale(0.9); opacity: 0.9; }
            82% { transform: translate(58px, 58px) scale(0.9); opacity: 0.9; }
            100% { transform: translate(58px, 58px) scale(1); opacity: 0; }
          }

          @keyframes tutorialFingerDragCrystal {
            0%, 12% { transform: translate(0, 0) scale(1); opacity: 0; }
            22%, 38% { transform: translate(0, 0) scale(0.9); opacity: 0.9; }
            58% { transform: translate(0, 72px) scale(0.9); opacity: 0.9; }
            78% { transform: translate(0, 144px) scale(0.9); opacity: 0.9; }
            100% { transform: translate(0, 216px) scale(1); opacity: 0; }
          }

          @keyframes tutorialGhostButtonHouse {
            0%, 12% { transform: translate(0, 0); opacity: 0; }
            22%, 38% { transform: translate(0, 0); opacity: 0.48; }
            58% { transform: translate(58px, 0); opacity: 0.48; }
            82% { transform: translate(58px, 58px); opacity: 0.48; }
            100% { transform: translate(58px, 58px); opacity: 0; }
          }

          @keyframes tutorialGhostButtonCrystal {
            0%, 12% { transform: translate(0, 0); opacity: 0; }
            22%, 38% { transform: translate(0, 0); opacity: 0.48; }
            58% { transform: translate(0, 72px); opacity: 0.48; }
            78% { transform: translate(0, 144px); opacity: 0.48; }
            100% { transform: translate(0, 216px); opacity: 0; }
          }

          @keyframes tutorialPlaceDotPulse {
            0%, 100% {
              transform: scale(0.72);
              opacity: 0.58;
              box-shadow: 0 0 0 0 rgba(255,255,255,0.34);
            }
            50% {
              transform: scale(1);
              opacity: 1;
              box-shadow: 0 0 0 8px rgba(255,255,255,0);
            }
          }

          @keyframes tutorialPlaceButtonPulse {
            0%, 100% { box-shadow: 0 0 10px rgba(34,197,94,0.34); }
            50% { box-shadow: 0 0 24px rgba(34,197,94,0.88); }
          }

          @keyframes tutorialPinchOut {
            0%, 15% { transform: translateY(0); opacity: 0; }
            28%, 55% { transform: translateY(0); opacity: 1; }
            85% { transform: translateY(var(--spread-y)); opacity: 1; }
            100% { transform: translateY(var(--spread-y)); opacity: 0; }
          }

          @keyframes tutorialPinchIn {
            0%, 15% { transform: translateY(var(--spread-y)); opacity: 0; }
            28%, 55% { transform: translateY(var(--spread-y)); opacity: 1; }
            85% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(0); opacity: 0; }
          }
          @keyframes monsterIntelPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.18); }
            50% { box-shadow: 0 0 0 6px rgba(239,68,68,0.34); }
          }
        `}
      </style>

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
              <header style={styles.cityTopBar}>
                <div style={styles.topResourceChip} title="Level">
                  <span>★</span>
                  <strong>{cityStats.level}</strong>
                  <small>
                    {Math.floor(cityStats.xp)}/{getNextLevelXp(cityStats.level)}
                  </small>
                </div>

                <div style={styles.topResourceChip} title="Army">
                  <span>⚔</span>
                  <strong>
                    {totalGuards}/{armyCap}
                  </strong>
                </div>

                <div
                  style={{
                    ...styles.topResourceChip,
                    ...(tutorialStep === "houses" ? styles.tutorialChipGlow : {}),
                  }}
                  title="Workers"
                >
                  <span>👥</span>
                  <strong>
                    {cityStats.workers}/{cityStats.workerCap}
                  </strong>
                </div>

                <div
                  style={{
                    ...styles.topResourceChip,
                    ...(tutorialStep === "crystals" ? styles.tutorialChipGlow : {}),
                  }}
                  title="Crystals"
                >
                  <span>💎</span>
                  <strong>{Math.floor(cityStats.crystals)}</strong>
                  <small>+{cityStats.crystalRate}/s</small>
                </div>
              </header>

              {mapTutorialPhase === "zoomout" && (
                <div style={styles.mapTutorialGesture}>
                  <div style={styles.mapTutorialGestureLabel}>ZOOM OUT</div>
                  <span
                    style={{
                      ...styles.mapTutorialFingerDot,
                      ...styles.mapTutorialFingerTop,
                      animationName: "tutorialPinchIn",
                    }}
                  />
                  <span
                    style={{
                      ...styles.mapTutorialFingerDot,
                      ...styles.mapTutorialFingerBottom,
                      animationName: "tutorialPinchIn",
                    }}
                  />
                </div>
              )}

              {(mapTutorialPhase === "monsterPointer" ||
                mapTutorialPhase === "monsterZoom" ||
                mapTutorialPhase === "monsterPointerFinal") &&
                mapTutorialTargetScreen && (
                  <>
                    {(mapTutorialPhase === "monsterPointer" ||
                      mapTutorialPhase === "monsterPointerFinal") && (
                      <div
                        style={{
                          ...styles.mapTutorialMonsterPointerGuide,
                          left: mapTutorialTargetScreen.x,
                          top:
                            mapTutorialTargetScreen.y -
                            mapTutorialTarget.r * cameraRef.current.zoom -
                            8,
                        }}
                      >
                        <div style={styles.mapTutorialMonsterArrow}>☟︎</div>
                      </div>
                    )}
                    {mapTutorialPhase === "monsterZoom" && (
                      <div
                        style={{
                          ...styles.mapTutorialZoomGesture,
                          left: mapTutorialTargetScreen.x,
                          top: mapTutorialTargetScreen.y,
                        }}
                      >
                        <span
                          style={{
                            ...styles.mapTutorialFingerDot,
                            ...styles.mapTutorialFingerTop,
                            animationName: "tutorialPinchOut",
                          }}
                        />
                        <span
                          style={{
                            ...styles.mapTutorialFingerDot,
                            ...styles.mapTutorialFingerBottom,
                            animationName: "tutorialPinchOut",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}

              {enterCoreVisible && enterScreen && tutorialFlowPhase !== "enterCity" && (
                <div
                  style={{
                    ...styles.enterCoreActions,
                    left: clamp(enterScreen.x + 28, 12, viewport.width - 104),
                    top: clamp(enterScreen.y - 58, 86, viewport.height - 150),
                  }}
                >
                  <button style={styles.enterButton} onClick={enterCity}>
                    ⌂
                  </button>
                </div>
              )}

              {selectedMonster && selectedMonsterThreat && (
                <div
                  style={{
                    ...styles.monsterIntelCard,
                    borderColor: selectedMonsterThreat.color,
                    boxShadow: `0 18px 54px ${selectedMonsterThreat.color}33`,
                  }}
                >
                  <div
                    style={{
                      ...styles.monsterIntelPortrait,
                      borderColor: selectedMonster.color,
                      boxShadow: `0 0 20px ${selectedMonster.color}88`,
                    }}
                  >
                    <div
                      style={{
                        ...styles.monsterIntelCreature,
                        background: selectedMonster.color,
                        boxShadow: `0 0 18px ${selectedMonster.color}`,
                        transform:
                          selectedMonster.type === "giant"
                            ? "rotate(45deg) scale(1.08)"
                            : selectedMonster.type === "brute"
                              ? "rotate(45deg)"
                              : selectedMonster.type === "beast"
                                ? "rotate(30deg)"
                                : "rotate(45deg) scale(0.78)",
                      }}
                    />
                    <strong>A{selectedMonster.armor}</strong>
                  </div>

                  <div style={styles.monsterIntelStats}>
                    <div
                      style={{
                        ...styles.monsterIntelStat,
                        ...(tutorialThreatCardVisible ? styles.monsterIntelPulse : {}),
                      }}
                    >
                      <small>ENEMY</small>
                      <strong>{Math.ceil(selectedMonster.hp)}</strong>
                    </div>
                    <div
                      style={{
                        ...styles.monsterIntelStat,
                        ...(tutorialThreatCardVisible ? styles.monsterIntelPulse : {}),
                      }}
                    >
                      <small>YOUR ARMY</small>
                      <strong>{totalGuards}/{armyCap}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.monsterThreatState,
                      color: selectedMonsterThreat.color,
                      background: selectedMonsterThreat.background,
                      ...(tutorialThreatCardVisible ? styles.monsterIntelPulse : {}),
                    }}
                  >
                    <span>{selectedMonsterThreat.icon}</span>
                    <strong>{selectedMonsterThreat.label}</strong>
                    <small>RALLY 00:00</small>
                  </div>

                  <button
                    style={{
                      ...styles.monsterIntelAttack,
                      ...(selectedMonsterThreat.key === "impossible"
                        ? styles.monsterIntelAttackDisabled
                        : {}),
                    }}
                    disabled={selectedMonsterThreat.key === "impossible"}
                    onClick={beginAttackSelectedMonster}
                  >
                    ⚔
                  </button>
                  <button
                    style={styles.monsterIntelClose}
                    onClick={() => {
                      setTutorialThreatCardVisible(false);
                      updateSelectedMonster(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {tutorialThreatCardVisible && selectedMonster?.tutorial && (
                <div style={styles.tutorialArmyHighlight} />
              )}
              {tutorialFlowPhase === "teleportButton" && (
                <div style={styles.tutorialTeleportPointer}><div style={styles.macroPointer}>☟︎</div></div>
              )}
              {tutorialFlowPhase === "selectLanding" && tutorialLandingTargetScreen && (
                <>
                  <div
                    style={{
                      ...styles.tutorialLandingZone,
                      left: tutorialLandingTargetScreen.x,
                      top: tutorialLandingTargetScreen.y,
                      width: MAJOR_GRID_STEP * cameraRef.current.zoom,
                      height: MAJOR_GRID_STEP * cameraRef.current.zoom,
                    }}
                  />
                  <div
                    style={{
                      ...styles.tutorialLandingPointer,
                      left: tutorialLandingTargetScreen.x,
                      top: tutorialLandingTargetScreen.y,
                    }}
                  >
                    <div style={styles.macroPointer}>☟︎</div>
                  </div>
                </>
              )}
              {tutorialFlowPhase === "confirmLanding" && landingScreen && (
                <div
                  style={{
                    ...styles.tutorialConfirmPointer,
                    left: clamp(landingScreen.x + 47, 46, viewport.width - 58),
                    top: clamp(landingScreen.y + 30, 92, viewport.height - 112),
                  }}
                >
                  <div style={styles.macroPointer}>☟︎</div>
                </div>
              )}
              {tutorialFlowPhase === "enterCity" && (
                <div style={styles.tutorialCityPointer}><div style={styles.macroPointer}>☟︎</div></div>
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
                    ⬇
                  </button>
                  <button style={styles.cancelButton} onClick={cancelLandingPreview}>
                    ×
                  </button>
                </div>
              )}

              <footer style={styles.arenaControls}>
                <button
                  style={{
                    ...styles.iconControlButton,
                    ...styles.teleportControlButton,
                    ...(hud.teleportMode ? styles.controlButtonActive : {}),
                    ...(hud.cooldown > 0 ? styles.teleportControlButtonCooldown : {}),
                  }}
                  onClick={activateTeleport}
                  disabled={hud.cooldown > 0}
                  title={hud.cooldown > 0 ? `Teleport ready in ${hud.cooldown}s` : "Teleport"}
                >
                  <span style={styles.teleportIcon} aria-hidden="true">
                    <span style={styles.teleportIconTopRing} />
                    <span style={styles.teleportIconBeam} />
                    <span style={styles.teleportIconBottomRing} />
                  </span>
                  {hud.cooldown > 0 && (
                    <span style={styles.teleportCooldownText}>{hud.cooldown}</span>
                  )}
                </button>

                <button style={styles.iconControlButton} onClick={centerCamera} title="Center">
                  <span style={styles.controlIcon}>◎</span>
                </button>

                <button style={styles.iconControlButton} onClick={enterCity} title="City">
                  <span style={styles.controlIcon}>⌂</span>
                </button>

                <button style={styles.iconControlButton} onClick={endRun} title="End Run">
                  <span style={styles.controlIcon}>◼</span>
                </button>

                <button style={styles.iconControlButton} onClick={onClose} title="Exit">
                  <span style={styles.controlIcon}>×</span>
                </button>
              </footer>
            </>
          )}

          {screen === "city" && (
            <>
              <header style={styles.cityTopBar}>
                <div style={styles.topResourceChip} title="Level">
                  <span>★</span>
                  <strong>{cityStats.level}</strong>
                  <small>
                    {Math.floor(cityStats.xp)}/{getNextLevelXp(cityStats.level)}
                  </small>
                </div>
                <div style={styles.topResourceChip} title="Army">
                  <span>⚔</span>
                  <strong>
                    {totalGuards}/{armyCap}
                  </strong>
                </div>
                <div
                  style={{
                    ...styles.topResourceChip,
                    ...(tutorialStep === "houses" ? styles.tutorialChipGlow : {}),
                  }}
                  title="Workers"
                >
                  <span>👥</span>
                  <strong>
                    {cityStats.workers}/{cityStats.workerCap}
                  </strong>
                </div>
                <div
                  style={{
                    ...styles.topResourceChip,
                    ...(tutorialStep === "crystals" ? styles.tutorialChipGlow : {}),
                  }}
                  title="Crystals"
                >
                  <span>💎</span>
                  <strong>{Math.floor(cityStats.crystals)}</strong>
                  <small>+{cityStats.crystalRate}/s</small>
                </div>
              </header>

              {shouldShowBuildTutorialArrow() && (
                <div style={styles.tutorialBuildArrow}>
                  <div style={styles.macroPointer}>☟︎</div>
                </div>
              )}

              {buildMenuOpen && (
                <div style={styles.buildMenu}>
                  {(shouldShowCrystalMenuHint() || shouldShowHouseMenuHint() || shouldShowBarracksMenuHint()) && (
                    <div
                      style={{
                        ...styles.tutorialMenuArrow,
                        ...(shouldShowHouseMenuHint() ? styles.tutorialHouseMenuArrow : {}),
                        ...(shouldShowBarracksMenuHint() ? styles.tutorialBarracksMenuArrow : {}),
                      }}
                    >
                      <div style={styles.macroPointer}>☟︎</div>
                    </div>
                  )}

                  <div style={styles.buildCardGrid}>
                    <button
                      style={{
                        ...styles.buildCard,
                        ...(shouldShowCrystalMenuHint() ? styles.buildCardTutorial : {}),
                      }}
                      onClick={() => chooseBuilding("CrystalPoint")}
                      title="Crystal Point"
                    >
                      <span style={styles.buildCardIconCrystal}>◆</span>
                      <small>👥5</small>
                    </button>

                    <button
                      style={{
                        ...styles.buildCard,
                        ...(shouldShowHouseMenuHint() ? styles.buildCardTutorial : {}),
                      }}
                      onClick={() => chooseBuilding("House")}
                      title="House"
                    >
                      <span style={styles.buildCardIconHouse}>■</span>
                      <small>💎25</small>
                    </button>

                    <button
                      style={{ ...styles.buildCard, ...(shouldShowBarracksMenuHint() ? styles.buildCardTutorial : {}) }}
                      onClick={() => chooseBuilding("Barracks")}
                      title="Barracks"
                    >
                      <span style={styles.buildCardIconBarracks}>▲</span>
                      <small>💎30</small>
                    </button>

                    <button style={{ ...styles.buildCard, ...styles.buildCardLocked }} disabled title="Locked">
                      <span>◎</span>
                      <small>—</small>
                    </button>
                  </div>
                </div>
              )}

              {buildPreview && buildScreen && (
                <div
                  style={{
                    ...styles.buildControlAnchor,
                    left: buildScreen.x,
                    top: buildScreen.y,
                  }}
                >
                  <button
                    style={{
                      ...styles.placeButton,
                      ...(batchSummary.valid > 0 ? {} : styles.placeButtonDisabled),
                      ...(!tutorialBatchReady ? styles.placeButtonTutorialPending : {}),
                    }}
                    onClick={placeBuilding}
                    onPointerDown={beginPlaceButtonPointer}
                    onPointerMove={movePlaceButtonPointer}
                    onPointerUp={endPlaceButtonPointer}
                    onPointerCancel={endPlaceButtonPointer}
                    disabled={batchSummary.valid <= 0}
                    title="Place"
                  >
                    {tutorialBatchReady ? "✓" : <span style={styles.tutorialPlaceDot} />}
                  </button>

                  <div
                    style={{
                      ...styles.buildControlConnector,
                      ...(buildPanelOnRight
                        ? styles.buildControlConnectorRight
                        : styles.buildControlConnectorLeft),
                    }}
                  />

                  <div
                    style={{
                      ...styles.buildControlPanel,
                      ...(buildPanelOnRight
                        ? styles.buildControlPanelRight
                        : styles.buildControlPanelLeft),
                    }}
                  >
                    <button style={styles.cancelButton} onClick={cancelBuildPreview}>
                      ×
                    </button>
                    <div style={styles.buildCostBadge}>
                      {batchSummary.workerCost > 0
                        ? `👥${batchSummary.workerCost}`
                        : `💎${batchSummary.crystalCost}`}
                      {batchSummary.valid > 1 ? ` x${batchSummary.valid}` : ""}
                    </div>
                  </div>

                  {!isTutorialConstructionWaiting() && tutorialStep !== "done" && buildBatchPreview.length <= 1 && (
                    <>
                      <div
                        style={{
                          ...styles.tutorialGhostPlace,
                          ...((tutorialStep === "crystals" || tutorialStep === "barracks")
                            ? styles.tutorialGhostPlaceCrystal
                            : styles.tutorialGhostPlaceHouse),
                        }}
                      >
                        ✓
                      </div>
                      <div
                        style={{
                          ...styles.tutorialFinger,
                          ...((tutorialStep === "crystals" || tutorialStep === "barracks")
                            ? styles.tutorialFingerCrystal
                            : styles.tutorialFingerHouse),
                        }}
                      >
                        ●
                      </div>
                    </>
                  )}
                </div>
              )}
              {selectedBuilding && (
                <div style={styles.buildingPanel}>
                  <button style={styles.panelClose} onClick={() => updateSelectedBuilding(null)}>
                    ×
                  </button>

                  <div style={styles.panelIcon}>
                    {selectedBuilding.type === "CrystalPoint"
                      ? "◆"
                      : selectedBuilding.type === "House"
                        ? "■"
                        : selectedBuilding.type === "Barracks"
                          ? "▲"
                          : "⌂"}
                  </div>

                  <div style={styles.panelInfo}>
                    <strong>Lv {selectedBuilding.level || 1}</strong>
                    <small>
                      {selectedBuilding.type === "CrystalPoint"
                        ? `+${selectedBuilding.level || 1}/s`
                        : selectedBuilding.type === "House"
                          ? `+${(selectedBuilding.level || 1) * 5}👥 +${(selectedBuilding.level || 1) * 25}⚔`
                          : selectedBuilding.type === "Barracks"
                            ? `Guard Lv${selectedBuilding.level || 1}`
                            : `City Lv${cityStats.level}`}
                    </small>
                  </div>

                  {selectedBuilding.type !== "Citadel" && (
                    <button
                      style={{
                        ...styles.upgradeButton,
                        ...(canUpgradeBuilding(selectedBuilding) ? {} : styles.upgradeButtonDisabled),
                      }}
                      disabled={!canUpgradeBuilding(selectedBuilding)}
                      onClick={upgradeSelectedBuilding}
                      title="Upgrade"
                    >
                      ⇧ {getUpgradeCostLabel(selectedBuilding)}
                    </button>
                  )}
                </div>
              )}

              {shouldShowMapTutorialArrow() && (
                <div style={styles.tutorialMapArrow}>
                  <div style={styles.macroPointer}>☟︎</div>
                </div>
              )}

              <footer style={styles.cityControls}>
                <button style={styles.iconControlButton} onClick={backToMap} title="World Map">
                  <span style={styles.controlIcon}>🗺</span>
                </button>

                <button
                  style={{
                    ...styles.iconControlButton,
                    ...(buildMode || buildMenuOpen ? styles.controlButtonActive : {}),
                  }}
                  onClick={openBuildMenu}
                  title="Build"
                >
                  <span style={styles.controlIcon}>🔨</span>
                </button>

                <button style={styles.iconControlButton} onClick={centerCityCamera} title="Center">
                  <span style={styles.controlIcon}>◎</span>
                </button>

                <button style={styles.iconControlButton} onClick={resetCityBuildings} title="Reset">
                  <span style={styles.controlIcon}>↺</span>
                </button>

                <button style={styles.iconControlButton} onClick={onClose} title="Exit">
                  <span style={styles.controlIcon}>×</span>
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
    ctx.font =
      monster.type === "giant"
        ? "900 13px Inter, system-ui, sans-serif"
        : "800 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(`A${monster.armor}`, monster.x, monster.y - 6);

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

function drawOrbitGuards(ctx, player, guardsByLevel) {
  if (!player || !guardsByLevel) return;

  const expanded = [];

  for (const [level, count] of Object.entries(guardsByLevel)) {
    for (let i = 0; i < Math.floor(count); i += 1) {
      expanded.push(Number(level));
    }
  }

  const count = expanded.length;
  if (count <= 0) return;

  const now = Date.now() / 1000;
  const layerSize = 42;

  ctx.save();

  for (let i = 0; i < count; i += 1) {
    const troopLevel = expanded[i];
    const visual = getGuardVisual(troopLevel);

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
    ctx.strokeStyle = visual.tail;
    ctx.lineWidth = 2;
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = visual.fill;
    ctx.shadowColor = visual.glow;
    ctx.shadowBlur = 10;
    ctx.arc(x, y, visual.size, 0, Math.PI * 2);
    ctx.fill();

    if (visual.core) {
      ctx.beginPath();
      ctx.fillStyle = visual.core;
      ctx.arc(x, y, visual.size * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }

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
  const cityLevel = player.level || 1;

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

  if (cityLevel >= 5) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(34,211,238,0.32)";
    ctx.lineWidth = 4;
    ctx.arc(player.x, player.y, player.r + 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (cityLevel >= 10) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(251,191,36,0.42)";
    ctx.lineWidth = 3;
    ctx.arc(player.x, player.y, player.r + 24, 0, Math.PI * 2);
    ctx.stroke();
  }

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
  ctx.fillRect(
    -CITY_OUTSIDE_PADDING,
    -CITY_OUTSIDE_PADDING,
    CITY_WIDTH + CITY_OUTSIDE_PADDING * 2,
    CITY_OUTSIDE_PADDING
  );
  ctx.fillRect(
    -CITY_OUTSIDE_PADDING,
    CITY_HEIGHT,
    CITY_WIDTH + CITY_OUTSIDE_PADDING * 2,
    CITY_OUTSIDE_PADDING
  );
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

function drawCityBuildings(ctx, buildings, selectedBuildingId) {
  for (const building of buildings) {
    const width = building.w * CITY_GRID_STEP;
    const height = building.h * CITY_GRID_STEP;
    const cx = building.x + width / 2;
    const cy = building.y + height / 2;

    ctx.save();

    if (selectedBuildingId === building.id) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(251,191,36,0.78)";
      ctx.lineWidth = 7;
      roundedRect(ctx, building.x - 8, building.y - 8, width + 16, height + 16, 26);
      ctx.stroke();
    }

    if (building.underConstruction) {
      drawConstructionBuilding(ctx, building, width, height, cx, cy);
      ctx.restore();
      continue;
    }

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    roundedRect(ctx, building.x + 8, building.y + 10, width, height, 22);
    ctx.fill();
    if (building.type === "CrystalPoint") {
      drawCrystalPointBuilding(ctx, building, width, height, cx, cy);
    } else if (building.type === "House") {
      drawHouseBuilding(ctx, building, width, height);
    } else if (building.type === "Barracks") {
      drawBarracksBuilding(ctx, building, width, height);
    } else {
      drawCitadelBuilding(ctx, building, width, height, cx, cy);
    }

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "900 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`L${building.level || 1}`, building.x + width - 22, building.y + 22);

    ctx.restore();
  }
}

function drawConstructionBuilding(ctx, building, width, height, cx, cy) {
  const active = building.id === constructionQueueRefSafe(building);
  const progress = active
    ? clamp((building.buildElapsed || 0) / Math.max(0.01, building.buildDuration || 1), 0, 1)
    : 0;
  const remaining = Math.max(0, Math.ceil((building.buildDuration || 0) - (building.buildElapsed || 0)));

  ctx.fillStyle = "rgba(15,23,42,0.72)";
  roundedRect(ctx, building.x + 4, building.y + 4, width - 8, height - 8, 20);
  ctx.fill();
  ctx.setLineDash([12, 8]);
  ctx.strokeStyle = active ? "rgba(251,191,36,0.92)" : "rgba(148,163,184,0.46)";
  ctx.lineWidth = 5;
  roundedRect(ctx, building.x + 7, building.y + 7, width - 14, height - 14, 18);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 12;
  ctx.arc(cx, cy, Math.min(width, height) * 0.25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = active ? "#fbbf24" : "rgba(148,163,184,0.5)";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.arc(
    cx,
    cy,
    Math.min(width, height) * 0.25,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * progress
  );
  ctx.stroke();
  ctx.lineCap = "butt";

  ctx.fillStyle = active ? "#ffffff" : "rgba(255,255,255,0.52)";
  ctx.font = "900 18px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(active ? `${remaining}s` : "…", cx, cy);
}

function constructionQueueRefSafe(building) {
  return building.underConstruction && building.buildElapsed > 0 ? building.id : null;
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
}

function drawHouseBuilding(ctx, building, width, height) {
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
}

function drawBarracksBuilding(ctx, building, width, height) {
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
}

function drawBuildPreviews(ctx, previews) {
  for (const preview of previews || []) {
    drawSingleBuildPreview(ctx, preview);
  }
}

function drawSingleBuildPreview(ctx, preview) {
  if (!preview) return;

  const width = preview.w * CITY_GRID_STEP;
  const height = preview.h * CITY_GRID_STEP;
  const valid = preview.valid;
  const t = Date.now() / 250;
  const pulse = 1 + Math.sin(t) * 0.04;

  ctx.save();

  if (preview.tutorialDemo) {
    ctx.globalAlpha = 0.42;
    ctx.setLineDash([12, 8]);
  }

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

  if (preview.tutorialDemo) {
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

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
    gridTemplateColumns: "62px 62px 1fr",
    gap: 8,
    zIndex: 3,
    pointerEvents: "none",
  },

  hudPill: {
    height: 44,
    borderRadius: 14,
    background: "rgba(15,23,42,0.72)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    fontSize: 9,
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
  },

  hudWide: {
    height: 44,
    borderRadius: 14,
    background: "rgba(15,23,42,0.72)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    boxSizing: "border-box",
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: 800,
  },

  cityTopBar: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 8,
    height: 42,
    zIndex: 3,
    display: "grid",
    gridTemplateColumns: "1.25fr 1fr 1.25fr 1.35fr",
    gap: 6,
    pointerEvents: "none",
  },

  topResourceChip: {
    minWidth: 0,
    height: 42,
    borderRadius: 14,
    background: "rgba(15,23,42,0.72)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    color: "rgba(255,255,255,0.86)",
    fontSize: 10,
    fontWeight: 900,
    boxSizing: "border-box",
    padding: "0 5px",
  },

  tutorialChipGlow: {
    animation: "chipGlow 1.15s ease-in-out infinite",
  },

  mapTutorialGesture: {
    position: "absolute",
    left: "50%",
    top: "42%",
    width: 86,
    height: 150,
    transform: "translate(-50%, -50%)",
    zIndex: 9,
    pointerEvents: "none",
  },
  mapTutorialGestureLabel: {
    position: "absolute",
    left: -28,
    right: -28,
    top: 0,
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.12em",
    textShadow: "0 0 14px rgba(103,232,249,0.9)",
  },
  mapTutorialFingerDot: {
    position: "absolute",
    left: 30,
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.25)",
    border: "2px solid rgba(255,255,255,0.94)",
    boxShadow: "0 0 18px rgba(103,232,249,0.82)",
    animationDuration: "1.8s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  mapTutorialFingerTop: {
    top: 35,
    "--spread-y": "-30px",
  },
  mapTutorialFingerBottom: {
    top: 59,
    "--spread-y": "30px",
  },
  mapTutorialMonsterPointerGuide: {
    position: "absolute",
    width: 88,
    height: 82,
    transform: "translate(-50%, -100%)",
    zIndex: 9,
    pointerEvents: "none",
  },
  mapTutorialMonsterArrow: {
    position: "absolute",
    left: "50%",
    bottom: 0,
    marginLeft: -20,
    transform: "translateX(-50%)",
    color: "rgba(255,255,255,0.88)",
    fontSize: 42,
    lineHeight: 1,
    textShadow: "0 0 15px rgba(103,232,249,0.95)",
    animation: "tutorialBounce 1.05s ease-in-out infinite",
  },
  mapTutorialZoomGesture: {
    position: "absolute",
    width: 86,
    height: 120,
    transform: "translate(-50%, -50%)",
    zIndex: 9,
    pointerEvents: "none",
  },
  tutorialBuildArrow: {
    position: "absolute",
    left: "30%",
    bottom: 68,
    zIndex: 8,
    width: 56,
    height: 64,
    transform: "translateX(-50%)",
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  },
  tutorialMapArrow: {
    position: "absolute",
    left: "10%",
    bottom: 68,
    zIndex: 8,
    width: 56,
    height: 64,
    transform: "translateX(-50%)",
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  },
  tutorialMenuArrow: {
    position: "absolute",
    left: "12.5%",
    top: -54,
    zIndex: 9,
    width: 56,
    height: 64,
    transform: "translateX(-50%)",
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  },
  tutorialHouseMenuArrow: {
    left: "37.5%",
  },
  tutorialBarracksMenuArrow: { left: "62.5%" },
  tutorialTeleportPointer: { position: "absolute", left: "10%", bottom: 68, zIndex: 13, width: 56, height: 64, transform: "translateX(-50%)", display: "grid", placeItems: "center", pointerEvents: "none" },
  tutorialLandingZone: { position: "absolute", zIndex: 8, transform: "translate(-50%, -50%)", border: "3px solid rgba(34,211,238,0.95)", background: "rgba(34,211,238,0.14)", boxShadow: "0 0 22px rgba(34,211,238,0.46)", pointerEvents: "none", boxSizing: "border-box" },
  tutorialLandingPointer: { position: "absolute", zIndex: 13, width: 56, height: 64, transform: "translate(-50%, -100%)", display: "grid", placeItems: "center", pointerEvents: "none" },
  tutorialConfirmPointer: { position: "absolute", zIndex: 13, width: 56, height: 64, transform: "translate(-50%, -100%)", display: "grid", placeItems: "center", pointerEvents: "none" },
  macroPointer: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 42,
    lineHeight: 1,
    transform: "none",
    textShadow: "0 0 15px rgba(103,232,249,0.95)",
    animation: "tutorialBounce 1.05s ease-in-out infinite",
  },
  buildCardTutorial: {
    border: "1px solid rgba(34,211,238,0.72)",
    background: "rgba(34,211,238,0.16)",
    animation: "tutorialGlow 1.2s ease-in-out infinite",
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
    minWidth: 42,
    height: 34,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #22d3ee, #2563eb)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 18,
    cursor: "pointer",
  },

  monsterIntelCard: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 60,
    minHeight: 86,
    zIndex: 12,
    padding: 8,
    boxSizing: "border-box",
    borderRadius: 20,
    border: "1px solid #ef4444",
    background: "rgba(15,23,42,0.96)",
    display: "grid",
    gridTemplateColumns: "66px 1fr 104px 38px 30px",
    gap: 7,
    alignItems: "center",
    backdropFilter: "blur(12px)",
  },
  monsterIntelPortrait: {
    width: 60,
    height: 60,
    borderRadius: 18,
    border: "2px solid #67e8f9",
    background: "radial-gradient(circle, rgba(255,255,255,0.12), rgba(2,6,23,0.9))",
    position: "relative",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
  },
  monsterIntelCreature: {
    width: 27,
    height: 27,
    borderRadius: 8,
    opacity: 0.96,
  },
  monsterIntelStats: {
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 5,
  },
  monsterIntelStat: {
    minWidth: 0,
    height: 52,
    borderRadius: 13,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.055)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  monsterThreatState: {
    height: 54,
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 9,
    lineHeight: 1.05,
  },
  monsterIntelPulse: {
    animation: "monsterIntelPulse 1.05s ease-in-out infinite",
  },
  monsterIntelAttack: {
    width: 36,
    height: 36,
    border: 0,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ef4444, #f59e0b)",
    color: "#fff",
    fontWeight: 900,
  },
  monsterIntelAttackDisabled: {
    opacity: 0.34,
    cursor: "not-allowed",
  },
  monsterIntelClose: {
    width: 28,
    height: 28,
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 900,
  },
  tutorialArmyHighlight: {
    position: "absolute",
    left: "25.8%",
    top: 5,
    width: "23.6%",
    height: 48,
    zIndex: 11,
    borderRadius: 16,
    border: "2px solid rgba(239,68,68,0.9)",
    boxShadow: "0 0 22px rgba(239,68,68,0.72)",
    pointerEvents: "none",
    animation: "monsterIntelPulse 1.05s ease-in-out infinite",
  },
  tutorialCityPointer: {
    position: "absolute",
    left: "50%",
    bottom: 68,
    zIndex: 13,
    width: 56,
    height: 64,
    transform: "translateX(-50%)",
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
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
    minWidth: 70,
    height: 30,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #ef4444, #f59e0b)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 13,
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

  buildControlAnchor: {
    position: "absolute",
    zIndex: 10,
    width: 54,
    height: 54,
    transform: "translate(-50%, -50%)",
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  },
  buildControlPanel: {
    position: "absolute",
    top: "50%",
    minWidth: 104,
    height: 40,
    transform: "translateY(-50%)",
    padding: "5px 7px",
    boxSizing: "border-box",
    borderRadius: 999,
    background: "rgba(15,23,42,0.94)",
    border: "1px solid rgba(34,197,94,0.36)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    pointerEvents: "auto",
  },
  buildControlPanelLeft: {
    right: 76,
  },
  buildControlPanelRight: {
    left: 76,
  },
  buildControlConnector: {
    position: "absolute",
    top: "50%",
    width: 28,
    height: 2,
    marginTop: -1,
    background: "rgba(34,197,94,0.72)",
    boxShadow: "0 0 8px rgba(34,197,94,0.5)",
    pointerEvents: "none",
  },
  buildControlConnectorLeft: {
    right: 48,
  },
  buildControlConnectorRight: {
    left: 48,
  },

  buildCostBadge: {
    minWidth: 42,
    height: 24,
    padding: "0 8px",
    borderRadius: 999,
    background: "rgba(15,23,42,0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 900,
    display: "grid",
    placeItems: "center",
  },

  tutorialFinger: {
    position: "absolute",
    left: 22,
    top: -10,
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.78)",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.32)",
    boxShadow: "0 0 18px rgba(255,255,255,0.28)",
    pointerEvents: "none",
  },

  tutorialFingerHouse: {
    animation: "tutorialFingerDragHouse 2.2s ease-in-out infinite",
  },

  tutorialFingerCrystal: {
    animation: "tutorialFingerDragCrystal 2.35s ease-in-out infinite",
  },

  tutorialGhostPlace: {
    position: "absolute",
    left: 5,
    top: 5,
    minWidth: 42,
    height: 30,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, rgba(34,197,94,0.42), rgba(21,128,61,0.42))",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 900,
    fontSize: 15,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
    opacity: 0,
  },

  tutorialGhostPlaceHouse: {
    animation: "tutorialGhostButtonHouse 2.2s ease-in-out infinite",
  },

  tutorialGhostPlaceCrystal: {
    animation: "tutorialGhostButtonCrystal 2.35s ease-in-out infinite",
  },

  buildMenu: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 76,
    zIndex: 7,
    borderRadius: 22,
    padding: 10,
    background: "rgba(15,23,42,0.94)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.48)",
  },

  buildCardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
  },

  buildCard: {
    minHeight: 72,
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
    fontSize: 24,
  },

  buildCardIconHouse: {
    color: "#86efac",
    fontSize: 22,
  },

  buildCardIconBarracks: {
    color: "#fbbf24",
    fontSize: 22,
  },

  landButton: {
    minWidth: 42,
    height: 30,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #22d3ee, #2563eb)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
  },

  placeButton: {
    width: 50,
    minWidth: 50,
    height: 50,
    border: "2px solid rgba(255,255,255,0.28)",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #22c55e, #15803d)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
    touchAction: "none",
    pointerEvents: "auto",
    boxShadow: "0 0 18px rgba(34,197,94,0.62)",
  },

  placeButtonTutorialPending: {
    position: "relative",
    animation: "tutorialPlaceButtonPulse 1.05s ease-in-out infinite",
  },

  tutorialPlaceDot: {
    display: "block",
    width: 11,
    height: 11,
    margin: "0 auto",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.96)",
    pointerEvents: "none",
    animation: "tutorialPlaceDotPulse 1.05s ease-in-out infinite",
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

  buildingPanel: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 76,
    minHeight: 62,
    borderRadius: 22,
    padding: 10,
    zIndex: 8,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(251,191,36,0.22)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.48)",
    display: "grid",
    gridTemplateColumns: "48px 1fr 96px 32px",
    gap: 8,
    alignItems: "center",
  },

  panelIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.07)",
    color: "#fbbf24",
    fontSize: 22,
    fontWeight: 900,
  },

  panelInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 900,
  },

  upgradeButton: {
    minHeight: 38,
    border: 0,
    borderRadius: 14,
    background: "linear-gradient(135deg, #f59e0b, #22c55e)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  upgradeButtonDisabled: {
    opacity: 0.42,
    cursor: "not-allowed",
    background: "rgba(255,255,255,0.08)",
  },

  panelClose: {
    width: 30,
    height: 30,
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
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    zIndex: 4,
  },

  cityControls: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    zIndex: 4,
  },

  iconControlButton: {
    minHeight: 52,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    background: "rgba(15,23,42,0.88)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  controlIcon: {
    fontSize: 21,
    lineHeight: "22px",
  },

  teleportControlButton: {
    position: "relative",
    overflow: "hidden",
  },

  teleportControlButtonCooldown: {
    opacity: 0.72,
    cursor: "not-allowed",
  },

  teleportIcon: {
    position: "relative",
    width: 34,
    height: 30,
    display: "block",
  },

  teleportIconTopRing: {
    position: "absolute",
    left: 8,
    top: 2,
    width: 18,
    height: 7,
    border: "2px solid #67e8f9",
    borderRadius: "50%",
    boxSizing: "border-box",
    boxShadow: "0 0 8px rgba(103,232,249,0.72)",
  },

  teleportIconBeam: {
    position: "absolute",
    left: 10,
    top: 7,
    width: 14,
    height: 15,
    borderLeft: "2px solid rgba(103,232,249,0.72)",
    borderRight: "2px solid rgba(103,232,249,0.72)",
    boxSizing: "border-box",
    background: "linear-gradient(90deg, transparent, rgba(103,232,249,0.26), transparent)",
  },

  teleportIconBottomRing: {
    position: "absolute",
    left: 3,
    bottom: 1,
    width: 28,
    height: 9,
    border: "2px solid #ffffff",
    borderRadius: "50%",
    boxSizing: "border-box",
    boxShadow: "0 0 10px rgba(103,232,249,0.62)",
  },

  teleportCooldownText: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 1,
    fontWeight: 950,
    textShadow: "0 1px 4px #020617, 0 0 8px #020617",
    zIndex: 2,
  },

  controlButtonActive: {
    border: "1px solid rgba(251,191,36,0.55)",
    background: "rgba(251,191,36,0.22)",
    color: "#fde68a",
  },
};
