"use client";

import { useEffect, useRef, useState } from "react";

const WORLD_WIDTH = 12800;
const WORLD_HEIGHT = 8800;
const MONSTER_COUNT = 180;

const TELEPORT_COOLDOWN_SECONDS = 15;
const TELEPORT_CAST_SECONDS = 1.2;
const TELEPORT_ARRIVAL_SECONDS = 1.1;

const MIN_ZOOM = 0.12;
const MAX_ZOOM = 0.95;

const GRID_STEP = 110;
const MAJOR_GRID_STEP = GRID_STEP * 2;
const CAMERA_OUTSIDE_PADDING = 950;

const CITY_WIDTH = 2200;
const CITY_HEIGHT = 1600;
const CITY_GRID_STEP = 100;
const CITY_OUTSIDE_PADDING = 280;
const CITY_MIN_ZOOM = 0.45;
const CITY_MAX_ZOOM = 1.1;

const ATTACK_MARCH_WORLD_SPEED = 154;
const RETURN_MARCH_WORLD_SPEED = 191;

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
function getTotalGuardsInMarches(marches) {
  return (marches || []).reduce(
    (sum, march) => sum + Math.max(0, Math.floor(march.count || 0)),
    0
  );
}
function getTotalOwnedGuards(stats, marches) {
  return getTotalGuardsFromStats(stats) + getTotalGuardsInMarches(marches);
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
  const expeditionRef = useRef(null);
  const constructionQueueRef = useRef([]);
  const tutorialConstructionRef = useRef({ housesCommitted: false, crystalsCommitted: false, barracksCommitted: false });
  const tutorialFlowRef = useRef({ phase: "buildEconomy", timer: 0 });
  const tutorialLandingTargetRef = useRef(null);
  const selectedMonsterRef = useRef(null);
  const mapTutorialSeenRef = useRef(false);
  const mapTutorialTargetRef = useRef(null);
  const tutorialSearchMonsterIdRef = useRef(null);
  const mapTutorialZoomRef = useRef({ active: false, targetZoom: 0.3, mode: "tutorialMonster", targetX: null, targetY: null });
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
    pinchFocusX: null,
    pinchFocusY: null,
    pinchStartZoom: 0,
    pinchStartCameraX: 0,
    pinchStartCameraY: 0,
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
    pinchFocusX: null,
    pinchFocusY: null,
    pinchStartZoom: 0,
    pinchStartCameraX: 0,
    pinchStartCameraY: 0,
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
  const buildCardDragRef = useRef({ pointerId: null, type: null, active: false, startX: 0, startY: 0 });
  const buildCardReturnTimerRef = useRef(null);

  const lastTimeRef = useRef(0);

  const [screen, setScreen] = useState("menu");
  const [trainingIntroPhase, setTrainingIntroPhase] = useState("off");
  const [cityTutorialReady, setCityTutorialReady] = useState(false);
    const [buildMenuTutorialReady, setBuildMenuTutorialReady] = useState(false);
  const buildMenuTutorialTimerRef = useRef(null);
const trainingIntroTimerRef = useRef(null);
  const cityTutorialTimerRef = useRef(null);
  const [profile, setProfile] = useState(initialProfile);
  const [landingPreview, setLandingPreviewState] = useState(null);
  const [buildPreview, setBuildPreviewState] = useState(null);
  const [buildBatchPreview, setBuildBatchPreviewState] = useState([]);
  const [buildMode, setBuildModeState] = useState(false);
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  const [buildCardDrag, setBuildCardDrag] = useState(null);
  const [buildCardReturn, setBuildCardReturn] = useState(null);
  const [selectedBuildingType, setSelectedBuildingTypeState] = useState(null);
  const [selectedBuilding, setSelectedBuildingState] = useState(null);
  const [enterCoreVisible, setEnterCoreVisible] = useState(false);
  const [selectedMonster, setSelectedMonsterState] = useState(null);
  const [expedition, setExpedition] = useState(null);
  const [utilityMenuOpen, setUtilityMenuOpen] = useState(false);
  const [monsterSearchOpen, setMonsterSearchOpen] = useState(false);
  const [monsterSearchTier, setMonsterSearchTier] = useState(1);
  const monsterSearchIndexRef = useRef({ tier: 1, index: -1 });
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
    setTrainingIntroPhase("off");
    setCityTutorialReady(false);
        setBuildMenuTutorialReady(false);
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
    return () => {
      if (trainingIntroTimerRef.current) clearTimeout(trainingIntroTimerRef.current);
      if (cityTutorialTimerRef.current) clearTimeout(cityTutorialTimerRef.current);
      if (buildMenuTutorialTimerRef.current) clearTimeout(buildMenuTutorialTimerRef.current);
      if (buildCardReturnTimerRef.current) clearTimeout(buildCardReturnTimerRef.current);
    };
  }, []);

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
  const tutorialStep = getTutorialStep();
  const tutorialDragType =
    tutorialStep === "houses"
      ? "House"
      : tutorialStep === "crystals"
        ? "CrystalPoint"
        : tutorialStep === "barracks"
          ? "Barracks"
          : null;
  const tutorialDragDefinition = tutorialDragType ? BUILDINGS[tutorialDragType] : null;
  const tutorialDragDropGrid = tutorialDragType ? getTutorialPlacement(tutorialDragType) : null;
  const tutorialDragDropScreen =
    tutorialDragDropGrid && tutorialDragDefinition
      ? cityWorldToScreen(
          tutorialDragDropGrid.x + (tutorialDragDefinition.w * CITY_GRID_STEP) / 2,
          tutorialDragDropGrid.y + (tutorialDragDefinition.h * CITY_GRID_STEP) / 2
        )
      : null;
  const tutorialDragDropWidth = tutorialDragDefinition
    ? tutorialDragDefinition.w * CITY_GRID_STEP * cityCameraRef.current.zoom
    : 0;
  const tutorialDragDropHeight = tutorialDragDefinition
    ? tutorialDragDefinition.h * CITY_GRID_STEP * cityCameraRef.current.zoom
    : 0;
  const tutorialDragSymbol =
    tutorialDragType === "CrystalPoint" ? "◆" : tutorialDragType === "Barracks" ? "▲" : "■";
  const tutorialDragColor =
    tutorialDragType === "CrystalPoint" ? "#67e8f9" : tutorialDragType === "Barracks" ? "#fbbf24" : "#86efac";

  const homeGuards = getTotalGuardsFromStats(cityStats);
  const totalGuards = getTotalOwnedGuards(cityStats, marchesRef.current);
  const armyCap = cityStats.guardCap;
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
        const army = homeGuards;
        if (army <= 0) {
          return {
            key: "impossible",
            label: "NO ARMY READY",
            icon: "⚠",
            color: "#ef4444",
            background: "rgba(127,29,29,0.72)",
          };
        }
        const effectiveArmy = Object.entries(cityStats.guardsByLevel || {}).reduce(
          (sum, [level, count]) =>
            sum + count * (Number(level) >= selectedMonster.armor ? Number(level) : 0.25),
          0
        );
        const ratio = effectiveArmy / Math.max(1, selectedMonster.hp);
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
      cityTutorialReady &&
      screen === "city" &&
      (tutorialStep === "houses" || tutorialStep === "crystals" || tutorialStep === "barracks") &&
      !isTutorialConstructionWaiting() &&
      !buildMenuOpen &&
      !buildMode &&
      !buildPreview
    );
  }

  function shouldShowCrystalMenuHint() {
    return buildMenuTutorialReady && screen === "city" && buildMenuOpen && tutorialStep === "crystals" && !isTutorialConstructionWaiting();
  }

  function shouldShowHouseMenuHint() {
    return buildMenuTutorialReady && screen === "city" && buildMenuOpen && tutorialStep === "houses" && !isTutorialConstructionWaiting();
  }
  function shouldShowBarracksMenuHint() {
    return buildMenuTutorialReady && screen === "city" && buildMenuOpen && tutorialStep === "barracks" && !isTutorialConstructionWaiting();
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
    expeditionRef.current = null;
    setExpedition(null);
    constructionQueueRef.current = [];
    tutorialConstructionRef.current = { housesCommitted: false, crystalsCommitted: false, barracksCommitted: false };
    mapTutorialSeenRef.current = false;
    tutorialFlowRef.current = { phase: "buildEconomy", timer: 0 };
    tutorialLandingTargetRef.current = null;
    setTutorialFlowPhase("buildEconomy");
    mapTutorialTargetRef.current = null;
    tutorialSearchMonsterIdRef.current = null;
    mapTutorialZoomRef.current = { active: false, targetZoom: 0.3, mode: "tutorialMonster", targetX: null, targetY: null };
    mapTutorialGuideRef.current = { phase: "off", timer: 0, zoomStart: 0.3 };
    updateMapTutorialPhase("off");
    setMapTutorialTarget(null);
    setTutorialThreatCardVisible(false);
    setUtilityMenuOpen(false);
    setMonsterSearchOpen(false);
    monsterSearchIndexRef.current = { tier: 1, index: -1 };
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
      pinchFocusX: null,
      pinchFocusY: null,
      pinchStartZoom: 0,
      pinchStartCameraX: 0,
      pinchStartCameraY: 0,
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
      pinchFocusX: null,
      pinchFocusY: null,
      pinchStartZoom: 0,
      pinchStartCameraX: 0,
      pinchStartCameraY: 0,
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
    setBuildCardDrag(null);
    setBuildCardReturn(null);
    buildCardDragRef.current = { pointerId: null, type: null, active: false, startX: 0, startY: 0 };
    setSelectedBuildingType(null);
    setEnterCoreVisible(false);
    setCityStats({ ...cityStatsRef.current });
  }

  function beginTrainingStageOne() {
    if (trainingIntroTimerRef.current) clearTimeout(trainingIntroTimerRef.current);
    if (cityTutorialTimerRef.current) clearTimeout(cityTutorialTimerRef.current);
    setTrainingIntroPhase("boot");
    trainingIntroTimerRef.current = setTimeout(() => {
      setTrainingIntroPhase("launch");
      trainingIntroTimerRef.current = setTimeout(startGame, 520);
    }, 1450);
  }

  function startGame() {
    resetArena();
    setCityTutorialReady(false);
    setHud({ level: 1, score: 0, cooldown: 0, teleportMode: false, status: "Ready" });
    setScreen("city");
    setTrainingIntroPhase("off");
    cityTutorialTimerRef.current = setTimeout(() => setCityTutorialReady(true), 1000);
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

  function toggleUtilityMenu() { setMonsterSearchOpen(false); setUtilityMenuOpen((v) => !v); }
  function toggleMonsterSearch() { setUtilityMenuOpen(false); setMonsterSearchOpen((v) => { const next=!v; if(next && tutorialFlowRef.current.phase==="searchButton"){ setMonsterSearchTier(1); monsterSearchIndexRef.current={tier:1,index:-1}; updateTutorialFlowPhase("searchTier"); } return next; }); }
  function selectMonsterSearchTier(tier) { if(tutorialFlowRef.current.phase==="searchTier" && tier!==1)return; setMonsterSearchTier(tier); monsterSearchIndexRef.current={tier,index:-1}; if(tutorialFlowRef.current.phase==="searchTier")updateTutorialFlowPhase("searchGo"); }
  function findNextMonsterByTier() {
    const player = playerRef.current;
    if (!player) return;
    const candidates = worldRef.current.monsters.filter((monster) => monster.armor === monsterSearchTier).sort((a, b) =>
      Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y));
    if (!candidates.length) return;
    const state = monsterSearchIndexRef.current;
    const nextIndex = state.tier === monsterSearchTier ? (state.index + 1) % candidates.length : 0;
    monsterSearchIndexRef.current = { tier: monsterSearchTier, index: nextIndex };
    const monster = candidates[nextIndex];
    cameraRef.current.x = monster.x; cameraRef.current.y = monster.y;
    cameraRef.current.zoom = Math.max(cameraRef.current.zoom, 0.48);
    clampCameraToWorld(); forceLandingPreviewRender(); setEnterCoreVisible(false);
    if(tutorialFlowRef.current.phase==="searchGo"){ tutorialSearchMonsterIdRef.current=monster.id; mapTutorialTargetRef.current=monster; setMapTutorialTarget({...monster}); updateSelectedMonster(null); updateTutorialFlowPhase("searchMonster"); updateMapTutorialPhase("monsterPointerFinal"); } else updateSelectedMonster({...monster});
  }
  function runCityServiceAction() { resetCityBuildings(); }
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
      const zoomEffect = mapTutorialZoomRef.current;
      const targetZoom = zoomEffect.targetZoom;
      camera.zoom = Math.max(targetZoom, camera.zoom - dt * 0.24);

      if (zoomEffect.mode === "freeOverview") {
        const follow = Math.min(1, dt * 2.8);
        if (Number.isFinite(zoomEffect.targetX)) camera.x += (zoomEffect.targetX - camera.x) * follow;
        if (Number.isFinite(zoomEffect.targetY)) camera.y += (zoomEffect.targetY - camera.y) * follow;
        clampCameraToWorld();
        forceLandingPreviewRender();
        const centered =
          (!Number.isFinite(zoomEffect.targetX) || Math.abs(camera.x - zoomEffect.targetX) < 6) &&
          (!Number.isFinite(zoomEffect.targetY) || Math.abs(camera.y - zoomEffect.targetY) < 6);
        if (camera.zoom > targetZoom + 0.002 || !centered) return;
        camera.zoom = targetZoom;
        if (Number.isFinite(zoomEffect.targetX)) camera.x = zoomEffect.targetX;
        if (Number.isFinite(zoomEffect.targetY)) camera.y = zoomEffect.targetY;
        clampCameraToWorld();
        mapTutorialZoomRef.current.active = false;
        updateMapTutorialPhase("off");
        return;
      }

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
      const monster = mapTutorialTargetRef.current || findTutorialMonster();
      const canvas = canvasRef.current;
      const monsterScreen = monster ? worldToScreen(monster.x, monster.y) : null;
      const requiredZoom = MAX_ZOOM - 0.002;
      const centeredEnough =
        canvas &&
        monsterScreen &&
        Math.abs(monsterScreen.x - canvas.clientWidth / 2) <= canvas.clientWidth * 0.1 &&
        Math.abs(monsterScreen.y - canvas.clientHeight / 2) <= canvas.clientHeight * 0.1;

      if (camera.zoom >= requiredZoom && centeredEnough) {
        updateMapTutorialPhase("monsterZoomPause");
      }
      return;
    }
    if (guide.phase === "monsterZoomPause") {
      guide.timer += dt;
      if (guide.timer >= 1) {
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
      const ownedArmyTotal = getTotalOwnedGuards(stats, marchesRef.current);
      if (ownedArmyTotal >= stats.guardCap) {
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
        getTotalOwnedGuards(stats, marchesRef.current) < stats.guardCap &&
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

  function formatMarchTime(seconds) {
    const safe = Math.max(0, Math.ceil(seconds || 0));
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  }
  function getMarchDuration(fromX, fromY, toX, toY, type = "attack") {
    const speed = type === "return" ? RETURN_MARCH_WORLD_SPEED : ATTACK_MARCH_WORLD_SPEED;
    return Math.max(0.1, Math.hypot(toX - fromX, toY - fromY) / speed);
  }
  function getSelectedMonsterTravelSeconds(monster) {
    const player = playerRef.current;
    return monster && player ? getMarchDuration(player.x, player.y, monster.x, monster.y, "attack") : 0;
  }
  function publishExpedition(next) {
    expeditionRef.current = next;
    setExpedition(next ? { ...next } : null);
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
      const durationSeconds = march.durationSeconds || getMarchDuration(march.fromX, march.fromY, march.toX, march.toY, march.type);
      const nextProgress = Math.min(1, march.progress + dt / durationSeconds);
      const remainingSeconds = Math.max(0, durationSeconds * (1 - nextProgress));
      const nextMarch = { ...march, durationSeconds, progress: nextProgress };
      if (expeditionRef.current?.marchId === march.id) {
        const shownSeconds = Math.ceil(remainingSeconds);
        if (expeditionRef.current.remainingSeconds !== shownSeconds) {
          publishExpedition({ ...expeditionRef.current, phase: march.type, count: march.count, remainingSeconds: shownSeconds });
        }
      }

      if (nextProgress < 1) {
        nextMarches.push(nextMarch);
        continue;
      }

      if (march.type === "attack") {
        const monster = world.monsters.find((item) => item.id === march.targetMonsterId);
        if (!monster) { if (expeditionRef.current?.marchId === march.id) publishExpedition(null); continue; }

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
          const returnId = `return-${Date.now()}-${Math.random()}`;
          const returnDuration = getMarchDuration(march.toX, march.toY, player.x, player.y, "return");
          nextMarches.push({ id: returnId, type: "return", count: returnCount, guardsByLevel: result.returnGuardsByLevel,
            fromX: march.toX, fromY: march.toY, toX: player.x, toY: player.y, progress: 0,
            durationSeconds: returnDuration, targetMonsterId: march.targetMonsterId, targetArmor: march.targetArmor, targetColor: march.targetColor });
          publishExpedition({ marchId: returnId, phase: "return", count: returnCount,
            remainingSeconds: Math.ceil(returnDuration), targetMonsterId: march.targetMonsterId,
            targetArmor: march.targetArmor, targetColor: march.targetColor });
        }

        continue;
      }

      if (march.type === "return") {
        for (const [level, count] of Object.entries(march.guardsByLevel || {})) {
          const numericLevel = Number(level);
          stats.guardsByLevel[numericLevel] =
            (stats.guardsByLevel[numericLevel] || 0) + count;
        }
        if (expeditionRef.current?.marchId === march.id) publishExpedition(null);
        if(tutorialFlowRef.current.phase==="attackLaunched"){ setMonsterSearchOpen(false); updateTutorialFlowPhase("searchButton"); }
        else if(tutorialFlowRef.current.phase==="searchAttackLaunched"){ setMonsterSearchOpen(false); updateTutorialFlowPhase("levelProgress"); }
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
    globalThis.__macroSwarmCityStatsVisual = cityStatsRef.current;
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
    setUtilityMenuOpen(false); setMonsterSearchOpen(false);
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
    setUtilityMenuOpen(false); setMonsterSearchOpen(false);
    if (tutorialStep === "map") {
      mapTutorialZoomRef.current = { active: true, targetZoom: 0.3, mode: "tutorialMonster", targetX: null, targetY: null };
      mapTutorialTargetRef.current = null;
      setMapTutorialTarget(null);
      updateMapTutorialPhase("zoomout");
    }

    if (tutorialStep === "mapAfterBarracks") {
      const monster = findTutorialMonster();
      if (monster) {
        mapTutorialTargetRef.current = monster;
        setMapTutorialTarget({ ...monster });
        updateTutorialFlowPhase("attackMonster");
        updateMapTutorialPhase("monsterPointerFinal");
      }
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
    if (buildMenuTutorialTimerRef.current) {
      clearTimeout(buildMenuTutorialTimerRef.current);
      buildMenuTutorialTimerRef.current = null;
    }
    setBuildMenuOpen((current) => {
      const nextOpen = !current;
      if (nextOpen) {
        if (isTutorialBuildStep()) {
          setBuildMenuTutorialReady(true);
        } else {
          setBuildMenuTutorialReady(false);
          buildMenuTutorialTimerRef.current = setTimeout(() => {
            setBuildMenuTutorialReady(true);
            buildMenuTutorialTimerRef.current = null;
          }, 1000);
        }
      } else {
        setBuildMenuTutorialReady(false);
      }
      return nextOpen;
    });
    setBuildMode(false);
    updateBuildPreview(null);
    setSelectedBuildingType(null);
    updateSelectedBuilding(null);
  }

  function isTutorialBuildStep() {
    return tutorialStep === "houses" || tutorialStep === "crystals" || tutorialStep === "barracks";
  }
  function isTutorialBuildingAllowed(type) {
    return !isTutorialBuildStep() || tutorialDragType === type;
  }
  function isPointInsideTutorialDropTarget(type, clientX, clientY) {
    const definition = BUILDINGS[type];
    if (!definition) return false;
    const point = cityScreenToWorld(clientX, clientY);
    const target = getTutorialPlacement(type);
    return point.x >= target.x && point.x <= target.x + definition.w * CITY_GRID_STEP &&
      point.y >= target.y && point.y <= target.y + definition.h * CITY_GRID_STEP;
  }
  function animateBuildCardReturn(type, fromX, fromY, toX, toY) {
    if (buildCardReturnTimerRef.current) clearTimeout(buildCardReturnTimerRef.current);
    setBuildCardReturn({ type, x: fromX, y: fromY, toX, toY, returning: false });
    requestAnimationFrame(() => requestAnimationFrame(() =>
      setBuildCardReturn({ type, x: fromX, y: fromY, toX, toY, returning: true })
    ));
    buildCardReturnTimerRef.current = setTimeout(() => {
      setBuildCardReturn(null);
      setBuildMenuTutorialReady(true);
      buildCardReturnTimerRef.current = null;
    }, 360);
  }
  function beginBuildCardDrag(type, event) {
    const expectedType =
      tutorialStep === "houses"
        ? "House"
        : tutorialStep === "crystals"
          ? "CrystalPoint"
          : tutorialStep === "barracks"
            ? "Barracks"
            : null;
    const restricted = isTutorialBuildStep();
    if (restricted && type !== expectedType) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    if (buildMenuTutorialTimerRef.current) {
      clearTimeout(buildMenuTutorialTimerRef.current);
      buildMenuTutorialTimerRef.current = null;
    }
    const cardRect = event.currentTarget.getBoundingClientRect();
    const startX = cardRect.left + cardRect.width / 2;
    const startY = cardRect.top + cardRect.height / 2;
    buildCardDragRef.current = { pointerId: event.pointerId, type, active: true, startX, startY };
    setBuildCardDrag({ type, x: event.clientX, y: event.clientY });
    if (!restricted) {
      setSelectedBuildingType(type);
      setBuildMode(true);
      updateSelectedBuilding(null);
      updateBuildPreview(makeBuildPreviewFromPoint(cityScreenToWorld(event.clientX, event.clientY)));
    }
  }

  function moveBuildCardDrag(event) {
    const drag = buildCardDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    setBuildCardDrag({ type: drag.type, x: event.clientX, y: event.clientY });
    if (!isTutorialBuildStep()) {
      setSelectedBuildingType(drag.type);
      updateBuildPreview(makeBuildPreviewFromPoint(cityScreenToWorld(event.clientX, event.clientY)));
    }
  }

  function endBuildCardDrag(event) {
    const drag = buildCardDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const { type, startX, startY } = drag;
    buildCardDragRef.current = { pointerId: null, type: null, active: false, startX: 0, startY: 0 };
    setBuildCardDrag(null);
    const canvas = canvasRef.current;
    if (!canvas || !BUILDINGS[type]) return;
    const rect = canvas.getBoundingClientRect();
    const insideCanvas = event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top + 58 && event.clientY <= rect.bottom - 76;
    const restricted = isTutorialBuildStep();
    const accepted = restricted && isTutorialBuildingAllowed(type) &&
      isPointInsideTutorialDropTarget(type, event.clientX, event.clientY);
    if (!insideCanvas || (restricted && !accepted)) {
      animateBuildCardReturn(type, event.clientX, event.clientY, startX, startY);
      return;
    }
    setSelectedBuildingType(type);
    setBuildMenuOpen(false);
    setBuildMode(true);
    updateSelectedBuilding(null);
    if (restricted) {
      updateBuildPreview(makeBuildPreviewFromGrid(getTutorialPlacement(type), type));
    } else {
      const droppedPreview = makeBuildPreviewFromPoint(cityScreenToWorld(event.clientX, event.clientY));
      updateBuildPreview(droppedPreview);
    }
  }

  function chooseBuilding(type) {
    if (!isTutorialBuildingAllowed(type)) return;
    if (buildMenuTutorialTimerRef.current) {
      clearTimeout(buildMenuTutorialTimerRef.current);
      buildMenuTutorialTimerRef.current = null;
    }
    setBuildMenuTutorialReady(false);
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
      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      const centerX = rect ? rect.left + canvas.clientWidth / 2 : viewport.width / 2;
      const centerY = rect ? rect.top + canvas.clientHeight / 2 : viewport.height / 2;
      updateBuildPreview(makeBuildPreviewFromPoint(cityScreenToWorld(centerX, centerY)));
    }
  }

  function resetCityBuildings() {
    cityRef.current = createCityState();
    cityStatsRef.current = createCityStats();
    marchesRef.current = [];
    expeditionRef.current = null;
    setExpedition(null);
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
    const target = snapCityPointToGrid(cityScreenToWorld(clientX, clientY), definition.w, definition.h);
    const stepX = definition.w * CITY_GRID_STEP;
    const stepY = definition.h * CITY_GRID_STEP;
    const step = getTutorialStep();
    if (step === "houses" && type === "House") {
      const cells = [{ x: anchorPreview.x, y: anchorPreview.y }];
      if (target.x - anchorPreview.x >= stepX * 0.45) cells.push({ x: anchorPreview.x + stepX, y: anchorPreview.y });
      if (target.x - anchorPreview.x >= stepX * 0.45 && target.y - anchorPreview.y >= stepY * 0.45) {
        cells.push({ x: anchorPreview.x + stepX, y: anchorPreview.y + stepY });
      }
      return makeValidatedBuildBatch(type, cells);
    }
    if ((step === "crystals" && type === "CrystalPoint") || (step === "barracks" && type === "Barracks")) {
      const maximum = type === "Barracks" ? TUTORIAL_BARRACKS_TARGET : TUTORIAL_CRYSTAL_TARGET;
      const count = Math.min(maximum, Math.max(1, Math.max(0, Math.round((target.y - anchorPreview.y) / stepY)) + 1));
      return makeValidatedBuildBatch(type, Array.from({ length: count }, (_, index) => ({
        x: anchorPreview.x, y: anchorPreview.y + index * stepY,
      })));
    }
    const cells = [{ x: anchorPreview.x, y: anchorPreview.y }];
    const dxSteps = Math.round((target.x - anchorPreview.x) / Math.max(1, stepX));
    const dySteps = Math.round((target.y - anchorPreview.y) / Math.max(1, stepY));
    const sx = dxSteps === 0 ? 0 : dxSteps > 0 ? 1 : -1;
    const sy = dySteps === 0 ? 0 : dySteps > 0 ? 1 : -1;
    for (let ix = 1; ix <= Math.abs(dxSteps); ix += 1) cells.push({ x: anchorPreview.x + ix * sx * stepX, y: anchorPreview.y });
    const cornerX = anchorPreview.x + dxSteps * stepX;
    for (let iy = 1; iy <= Math.abs(dySteps); iy += 1) cells.push({ x: cornerX, y: anchorPreview.y + iy * sy * stepY });
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
    if (isTutorialBuildStep() && tutorialDragType) {
      updateBuildPreview(makeBuildPreviewFromGrid(getTutorialPlacement(tutorialDragType), tutorialDragType));
      return;
    }
    updateBuildPreview(makeBuildPreviewFromPoint(cityScreenToWorld(clientX, clientY)));
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
    if (tutorialFlowRef.current.phase === "attackButton") {
      updateTutorialFlowPhase("attackLaunched");
      setTutorialThreatCardVisible(false);
    } else if (tutorialFlowRef.current.phase === "searchAttackButton") {
      updateTutorialFlowPhase("searchAttackLaunched");
      setTutorialThreatCardVisible(false);
      const player = playerRef.current;
      const searchedMonster = selectedMonsterRef.current;
      if (player && searchedMonster) {
        mapTutorialZoomRef.current = {
          active: true,
          targetZoom: 0.3,
          mode: "freeOverview",
          targetX: (player.x + searchedMonster.x) / 2,
          targetY: (player.y + searchedMonster.y) / 2,
        };
        updateMapTutorialPhase("freeOverviewZoom");
      }
    }

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

    const marchId = `attack-${Date.now()}-${Math.random()}`;
    const durationSeconds = getMarchDuration(player.x, player.y, monster.x, monster.y, "attack");
    marchesRef.current.push({ id: marchId, type: "attack", count: sendCount, guardsByLevel: sentGuardsByLevel,
      fromX: player.x, fromY: player.y, toX: monster.x, toY: monster.y, progress: 0, durationSeconds,
      targetMonsterId: monster.id, targetArmor: monster.armor, targetColor: monster.color });
    publishExpedition({ marchId, phase: "attack", count: sendCount, remainingSeconds: Math.ceil(durationSeconds),
      targetMonsterId: monster.id, targetArmor: monster.armor, targetColor: monster.color });
    setTutorialThreatCardVisible(false);
    updateSelectedMonster(null);
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
      const pinchClientX = (a.x + b.x) / 2;
      const pinchClientY = (a.y + b.y) / 2;
      const focus = screenToWorld(pinchClientX, pinchClientY);
      const camera = cameraRef.current;
      pointerRef.current.lastPinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      pointerRef.current.pinchFocusX = focus.x;
      pointerRef.current.pinchFocusY = focus.y;
      pointerRef.current.pinchStartZoom = camera.zoom;
      pointerRef.current.pinchStartCameraX = camera.x;
      pointerRef.current.pinchStartCameraY = camera.y;
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
        const camera = cameraRef.current;
        camera.zoom = clamp(camera.zoom * ratio, MIN_ZOOM, MAX_ZOOM);

        const zoomRange = Math.max(0.0001, MAX_ZOOM - pointerState.pinchStartZoom);
        const centerProgress = clamp(
          (camera.zoom - pointerState.pinchStartZoom) / zoomRange,
          0,
          1
        );
        const initialScreenOffsetX =
          (pointerState.pinchFocusX - pointerState.pinchStartCameraX) *
          pointerState.pinchStartZoom;
        const initialScreenOffsetY =
          (pointerState.pinchFocusY - pointerState.pinchStartCameraY) *
          pointerState.pinchStartZoom;
        const remainingOffset = 1 - centerProgress;

        camera.x =
          pointerState.pinchFocusX -
          (initialScreenOffsetX * remainingOffset) / camera.zoom;
        camera.y =
          pointerState.pinchFocusY -
          (initialScreenOffsetY * remainingOffset) / camera.zoom;

        clampCameraToWorld();
        forceLandingPreviewRender();
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
          const attackStage = tutorialFlowRef.current.phase === "attackMonster";
          const searchStage = tutorialFlowRef.current.phase === "searchMonster" && tutorialSearchMonsterIdRef.current === monster.id;
          mapTutorialSeenRef.current = true;
          mapTutorialTargetRef.current = null;
          setMapTutorialTarget(null);
          setTutorialThreatCardVisible(true);
          updateTutorialFlowPhase(searchStage ? "searchAttackButton" : attackStage ? "attackButton" : "inspectMonster");
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

    if (currentPreview && pointers.size === 1 && !isTutorialBuildStep()) {
      const cityPoint = cityScreenToWorld(event.clientX, event.clientY);

      if (pointInsideBuildPreview(cityPoint, currentPreview)) {
        cityPointerRef.current.draggingBuildPreview = true;
        cityPointerRef.current.buildPointerId = event.pointerId;
        cityPointerRef.current.dragging = true;
      }
    }

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const pinchClientX = (a.x + b.x) / 2;
      const pinchClientY = (a.y + b.y) / 2;
      const focus = cityScreenToWorld(pinchClientX, pinchClientY);
      const camera = cityCameraRef.current;
      cityPointerRef.current.lastPinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      cityPointerRef.current.pinchFocusX = focus.x;
      cityPointerRef.current.pinchFocusY = focus.y;
      cityPointerRef.current.pinchStartZoom = camera.zoom;
      cityPointerRef.current.pinchStartCameraX = camera.x;
      cityPointerRef.current.pinchStartCameraY = camera.y;
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
        const camera = cityCameraRef.current;
        camera.zoom = clamp(camera.zoom * ratio, CITY_MIN_ZOOM, CITY_MAX_ZOOM);

        const zoomRange = Math.max(0.0001, CITY_MAX_ZOOM - pointerState.pinchStartZoom);
        const centerProgress = clamp(
          (camera.zoom - pointerState.pinchStartZoom) / zoomRange,
          0,
          1
        );
        const initialScreenOffsetX =
          (pointerState.pinchFocusX - pointerState.pinchStartCameraX) *
          pointerState.pinchStartZoom;
        const initialScreenOffsetY =
          (pointerState.pinchFocusY - pointerState.pinchStartCameraY) *
          pointerState.pinchStartZoom;
        const remainingOffset = 1 - centerProgress;

        camera.x =
          pointerState.pinchFocusX -
          (initialScreenOffsetX * remainingOffset) / camera.zoom;
        camera.y =
          pointerState.pinchFocusY -
          (initialScreenOffsetY * remainingOffset) / camera.zoom;

        clampCityCameraToWorld();
        forceBuildPreviewRender();
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
          @keyframes trainingIntroReveal { 0% { opacity: 0; transform: scale(0.82); filter: blur(10px); } 60% { opacity: 1; transform: scale(1.04); filter: blur(0); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } }
          @keyframes trainingIntroOrbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes trainingIntroPulse { 0%, 100% { box-shadow: 0 0 24px rgba(34,211,238,.38), inset 0 0 18px rgba(59,130,246,.46); } 50% { box-shadow: 0 0 56px rgba(103,232,249,.88), inset 0 0 28px rgba(37,99,235,.78); } }
          @keyframes trainingIntroDot { 0%, 100% { opacity: .42; transform: scale(.76); } 50% { opacity: 1; transform: scale(1); } }
          @keyframes trainingCityFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes tutorialHouseDropPulse {
            0%, 100% { opacity: 0.58; box-shadow: 0 0 0 0 rgba(34,197,94,0.18), inset 0 0 18px rgba(34,197,94,0.12); }
            50% { opacity: 1; box-shadow: 0 0 0 10px rgba(34,197,94,0), 0 0 28px rgba(34,197,94,0.72), inset 0 0 24px rgba(34,197,94,0.28); }
          }
          @keyframes tutorialHouseBeaconPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(0.72); opacity: 0.48; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          }
          @keyframes tutorialHouseDragGuide {
            0%, 10% { transform: translate(0, 0) scale(1); opacity: 0; }
            18%, 34% { transform: translate(0, 0) scale(0.94); opacity: 1; }
            72% { transform: translate(var(--tutorial-drag-x), var(--tutorial-drag-y)) scale(0.94); opacity: 1; }
            88%, 100% { transform: translate(var(--tutorial-drag-x), var(--tutorial-drag-y)) scale(1); opacity: 0; }
          }
          @keyframes tutorialHouseGhostGuide {
            0%, 10% { transform: translate(0, 0); opacity: 0; }
            18%, 34% { transform: translate(0, 0); opacity: 0.72; }
            72% { transform: translate(var(--tutorial-drag-x), var(--tutorial-drag-y)); opacity: 0.72; }
            88%, 100% { transform: translate(var(--tutorial-drag-x), var(--tutorial-drag-y)); opacity: 0; }
          }
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

            <div style={styles.menuActionGrid}>
              <button style={{ ...styles.menuActionButton, ...styles.menuActionLocked }} disabled>
                <span style={styles.menuActionIcon}>▶</span><strong>START</strong><small>LOCKED · COMPLETE TRAINING</small>
              </button>
              <button style={{ ...styles.menuActionButton, ...styles.trainingMenuButton }} onClick={() => setScreen("training")}>
                <span style={styles.menuActionIcon}>◇</span><strong>TRAINING</strong><small>0 / 5 STAGES</small>
              </button>
              <button style={{ ...styles.menuActionButton, ...styles.menuActionLocked }} disabled>
                <span style={styles.menuActionIcon}>⌘</span><strong>DEPLOYMENT</strong><small>LOCKED</small>
              </button>
              <button style={{ ...styles.menuActionButton, ...styles.menuActionLocked }} disabled>
                <span style={styles.menuActionIcon}>▦</span><strong>PROJECTS</strong><small>COMING SOON</small>
              </button>
            </div>
            <button style={styles.secondaryButton} onClick={onClose}>EXIT</button>
          </div>
        </section>
      )}

      {screen === "training" && (
        <section style={styles.trainingScreen}>
          <div style={styles.trainingHeader}>
            <button style={styles.trainingBackButton} onClick={() => setScreen("menu")}>←</button>
            <div><p style={styles.kicker}>Operator Program</p><h2 style={styles.trainingTitle}>Training</h2></div>
            <div style={styles.trainingProgress}>0 / 5</div>
          </div>
          <div style={styles.trainingTrack}>
            <button style={{ ...styles.trainingStage, ...styles.trainingStageActive }} onClick={beginTrainingStageOne}>
              <div style={styles.trainingStageNumber}>01</div>
              <div style={styles.trainingStageInfo}><strong>CORE FOUNDATION</strong><small>Build the city, inspect the map, teleport and defeat the first monster.</small><span style={styles.trainingStageStatus}>AVAILABLE</span></div>
              <div style={styles.trainingStageArrow}>›</div>
            </button>
            {[
              ["02", "CORE DEVELOPMENT", "Building upgrades, armor and penetration."],
              ["03", "FIRST EMULATOR", "Play through the Core mirror and learn device control."],
              ["04", "MACRO SCENARIO", "Record and launch the first reusable scenario."],
              ["05", "SWARM ORCHESTRATION", "Run two Cores and branch their actions."],
            ].map(([number, title, description]) => (
              <div key={number} style={{ ...styles.trainingStage, ...styles.trainingStageLocked }}>
                <div style={styles.trainingStageNumber}>{number}</div>
                <div style={styles.trainingStageInfo}><strong>{title}</strong><small>{description}</small><span style={styles.trainingStageLockedText}>LOCKED</span></div>
                <div style={styles.trainingLock}>⌁</div>
              </div>
            ))}
          </div>
          <div style={styles.trainingRewardCard}><span>◇</span><div><strong>PROGRAM REWARD</strong><small>Complete all stages to unlock free deployment.</small></div></div>
        </section>
      )}

      {trainingIntroPhase !== "off" && (
        <section style={{ ...styles.trainingIntroOverlay, ...(trainingIntroPhase === "launch" ? styles.trainingIntroOverlayLaunch : {}) }}>
          <div style={styles.trainingIntroOrbit}>
            <span style={{ ...styles.trainingIntroSatellite, ...styles.trainingIntroSatelliteOne }} />
            <span style={{ ...styles.trainingIntroSatellite, ...styles.trainingIntroSatelliteTwo }} />
            <span style={{ ...styles.trainingIntroSatellite, ...styles.trainingIntroSatelliteThree }} />
            <div style={styles.trainingIntroEye}><div style={styles.trainingIntroIris}><div style={styles.trainingIntroPupil} /></div></div>
          </div>
          <div style={styles.trainingIntroBrand}>UNGATUS <span>LAB</span></div>
          <div style={styles.trainingIntroDivider} />
          <div style={styles.trainingIntroStage}>TRAINING 01</div>
          <h2 style={styles.trainingIntroTitle}>CORE FOUNDATION</h2>
          <div style={styles.trainingIntroStatus}><span style={styles.trainingIntroStatusDot} /> INITIALIZING CORE</div>
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

          {expedition && (
            <button style={{ ...styles.expeditionTracker, ...(expedition.phase === "return" ? styles.expeditionTrackerReturn : styles.expeditionTrackerAttack) }}
              onClick={() => { if (screen !== "arena") return; const march = marchesRef.current.find((item) => item.id === expedition.marchId); if (!march) return;
                cameraRef.current.x = march.fromX + (march.toX - march.fromX) * march.progress;
                cameraRef.current.y = march.fromY + (march.toY - march.fromY) * march.progress; clampCameraToWorld(); forceLandingPreviewRender(); }}>
              <div style={{ ...styles.expeditionPortrait, borderColor: expedition.targetColor || "#67e8f9", boxShadow: `0 0 18px ${expedition.targetColor || "#67e8f9"}88` }}>
                <span style={{ ...styles.expeditionCreature, background: expedition.targetColor || "#67e8f9" }} /><strong>A{expedition.targetArmor || 1}</strong>
              </div>
              <div style={styles.expeditionTimerBlock}><span>{expedition.phase === "return" ? "←" : "→"}</span><strong>{formatMarchTime(expedition.remainingSeconds)}</strong><small>{expedition.phase === "return" ? "RETURN" : "MARCH"}</small></div>
            </button>
          )}
          {screen === "arena" && (
            <>
              <div style={styles.topInterfacePanel} />
              <div style={styles.bottomInterfacePanel} />
              <header style={styles.cityTopBar}>
                <div style={{...styles.topResourceChip,...(tutorialFlowPhase==="levelProgress"?styles.tutorialLevelChipGlow:{})}} title="Level">
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
                mapTutorialPhase === "monsterZoomPause" ||
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
                      <strong>{homeGuards}/{armyCap}</strong>
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
                    <small>RALLY {formatMarchTime(getSelectedMonsterTravelSeconds(selectedMonster))}</small>
                  </div>

                  <button
                    style={{
                      ...styles.monsterIntelAttack,
                      ...(homeGuards <= 0 ? styles.monsterIntelAttackDisabled : {}),
                    }}
                    disabled={homeGuards <= 0}
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
              {(tutorialFlowPhase === "attackButton" || tutorialFlowPhase === "searchAttackButton") && selectedMonster && (
                <div style={styles.tutorialAttackPointer}>
                  <div style={styles.macroPointerUp}>☝︎</div>
                </div>
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

              {monsterSearchOpen && (
                <div style={styles.monsterSearchPanel}>
                  <div style={styles.monsterSearchTiers}>{[1,2,3,4,5].map((tier) => { const colors=["#67e8f9","#86efac","#facc15","#f97316","#ef4444"]; return (
                    <button key={tier} disabled={tutorialFlowPhase==="searchTier"&&tier!==1} style={{...styles.monsterSearchTier,borderColor:colors[tier-1],color:colors[tier-1],...(monsterSearchTier===tier?styles.monsterSearchTierActive:{}),...(tutorialFlowPhase==="searchTier"&&tier!==1?styles.monsterSearchTierLocked:{})}} onClick={() => selectMonsterSearchTier(tier)}>
                      <span style={{...styles.monsterSearchOrb,background:colors[tier-1],boxShadow:`0 0 14px ${colors[tier-1]}`}}/><strong>A{tier}</strong>
                    </button>);})}</div>
                  <button style={{...styles.monsterSearchGo,...(tutorialFlowPhase==="searchGo"?styles.tutorialSearchControlGlow:{})}} disabled={tutorialFlowPhase==="searchTier"} onClick={findNextMonsterByTier}>⌕</button>
                  {tutorialFlowPhase==="searchTier"&&<div style={styles.tutorialSearchTierPointer}><div style={styles.macroPointer}>☟︎</div></div>}
                  {tutorialFlowPhase==="searchGo"&&<div style={styles.tutorialSearchGoPointer}><div style={styles.macroPointer}>☟︎</div></div>}
                </div>)}
              {tutorialFlowPhase==="searchButton"&&<div style={styles.tutorialSearchButtonPointer}><div style={styles.macroPointer}>☟︎</div></div>}
              {utilityMenuOpen && <div style={styles.utilityMenuPanel}><button style={styles.utilityMenuButton} onClick={endRun}><span>◼</span><small>END</small></button><button style={styles.utilityMenuButton} onClick={onClose}><span>×</span><small>EXIT</small></button></div>}
              <footer style={styles.arenaControls}>
                <button style={{...styles.iconControlButton,...(monsterSearchOpen?styles.controlButtonActive:{})}} onClick={toggleMonsterSearch} title="Monster Search"><span style={styles.controlIcon}>⌕</span></button>
                <button style={{...styles.iconControlButton,...styles.teleportControlButton,...(hud.teleportMode?styles.controlButtonActive:{}),...(hud.cooldown>0?styles.teleportControlButtonCooldown:{})}} onClick={activateTeleport} disabled={hud.cooldown>0} title="Teleport"><span style={styles.teleportIcon}><span style={styles.teleportIconTopRing}/><span style={styles.teleportIconBeam}/><span style={styles.teleportIconBottomRing}/></span>{hud.cooldown>0&&<span style={styles.teleportCooldownText}>{hud.cooldown}</span>}</button>
                <button style={styles.iconControlButton} onClick={enterCity} title="City"><span style={styles.controlIcon}>⌂</span></button>
                <button style={styles.iconControlButton} onClick={centerCamera} title="Center"><span style={styles.controlIcon}>◎</span></button>
                <button style={{...styles.iconControlButton,...(utilityMenuOpen?styles.controlButtonActive:{})}} onClick={toggleUtilityMenu} title="Menu"><span style={styles.controlIcon}>☰</span></button>
              </footer>
            </>
          )}

          {screen === "city" && (
            <>
              <div style={styles.topInterfacePanel} />
              <div style={styles.bottomInterfacePanel} />
              <header style={styles.cityTopBar}>
                <div style={{...styles.topResourceChip,...(tutorialFlowPhase==="levelProgress"?styles.tutorialLevelChipGlow:{})}} title="Level">
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

              {tutorialDragType && buildMenuTutorialReady && tutorialDragDropScreen && (
                <>
                  <div
                    style={{
                      ...styles.tutorialHouseDropTarget,
                      left: tutorialDragDropScreen.x,
                      top: tutorialDragDropScreen.y,
                      width: tutorialDragDropWidth,
                      height: tutorialDragDropHeight,
                      color: tutorialDragColor,
                      borderColor: tutorialDragColor,
                    }}
                  >
                    <span>{tutorialDragSymbol}</span>
                  </div>
                  <div
                    style={{
                      ...styles.tutorialHouseDropBeacon,
                      left: tutorialDragDropScreen.x,
                      top: tutorialDragDropScreen.y,
                      borderColor: tutorialDragColor,
                      boxShadow: `0 0 18px ${tutorialDragColor}`,
                    }}
                  />
                </>
              )}
              {buildMenuOpen && (
                <div style={styles.buildMenu}>
                  {tutorialDragType && buildMenuTutorialReady && !buildCardDrag && tutorialDragDropScreen && (
                    <div
                      style={{
                        ...styles.tutorialHouseDragGuide,
                        left:
                          tutorialDragType === "CrystalPoint"
                            ? "12.5%"
                            : tutorialDragType === "Barracks"
                              ? "62.5%"
                              : "37.5%",
                        "--tutorial-drag-x": `${
                          tutorialDragDropScreen.x -
                          viewport.width *
                            (tutorialDragType === "CrystalPoint"
                              ? 0.125
                              : tutorialDragType === "Barracks"
                                ? 0.625
                                : 0.375)
                        }px`,
                        "--tutorial-drag-y": `${tutorialDragDropScreen.y - (viewport.height - 128)}px`,
                        "--tutorial-drag-color": tutorialDragColor,
                      }}
                    >
                      <div
                        style={{
                          ...styles.tutorialHouseDragGhost,
                          color: tutorialDragColor,
                          borderColor: tutorialDragColor,
                          boxShadow: `0 0 20px ${tutorialDragColor}`,
                        }}
                      >
                        {tutorialDragSymbol}
                      </div>
                      <div style={styles.tutorialHouseDragHand}>☝︎</div>
                    </div>
                  )}

                  <div style={styles.buildCardGrid}>
                    <button
                      style={{
                        ...styles.buildCard,
                        ...(shouldShowCrystalMenuHint() ? styles.buildCardTutorial : {}),
                        ...(isTutorialBuildStep() && tutorialDragType !== "CrystalPoint" ? styles.buildCardTutorialLocked : {}),
                      }}
                      onClick={() => {
                        if (tutorialStep !== "crystals") chooseBuilding("CrystalPoint");
                      }}
                      onPointerDown={(event) => beginBuildCardDrag("CrystalPoint", event)}
                      onPointerMove={moveBuildCardDrag}
                      onPointerUp={endBuildCardDrag}
                      onPointerCancel={endBuildCardDrag}
                      title={tutorialStep === "crystals" ? "Drag Crystal Point to the city grid" : "Crystal Point"}
                      disabled={isTutorialBuildStep() && tutorialDragType !== "CrystalPoint"}
                    >
                      <span style={styles.buildCardIconCrystal}>◆</span>
                      <small>👥5</small>
                    </button>

                    <button
                      style={{
                        ...styles.buildCard,
                        ...(shouldShowHouseMenuHint() ? styles.buildCardTutorial : {}),
                        ...(isTutorialBuildStep() && tutorialDragType !== "House" ? styles.buildCardTutorialLocked : {}),
                      }}
                      onClick={() => {
                        if (tutorialStep !== "houses") chooseBuilding("House");
                      }}
                      onPointerDown={(event) => beginBuildCardDrag("House", event)}
                      onPointerMove={moveBuildCardDrag}
                      onPointerUp={endBuildCardDrag}
                      onPointerCancel={endBuildCardDrag}
                      title={tutorialStep === "houses" ? "Drag House to the city grid" : "House"}
                      disabled={isTutorialBuildStep() && tutorialDragType !== "House"}
                    >
                      <span style={styles.buildCardIconHouse}>■</span>
                      <small>💎25</small>
                    </button>

                    <button
                      style={{ ...styles.buildCard, ...(shouldShowBarracksMenuHint() ? styles.buildCardTutorial : {}), ...(isTutorialBuildStep() && tutorialDragType !== "Barracks" ? styles.buildCardTutorialLocked : {}) }}
                      onClick={() => {
                        if (tutorialStep !== "barracks") chooseBuilding("Barracks");
                      }}
                      onPointerDown={(event) => beginBuildCardDrag("Barracks", event)}
                      onPointerMove={moveBuildCardDrag}
                      onPointerUp={endBuildCardDrag}
                      onPointerCancel={endBuildCardDrag}
                      title={tutorialStep === "barracks" ? "Drag Barracks to the city grid" : "Barracks"}
                      disabled={isTutorialBuildStep() && tutorialDragType !== "Barracks"}
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

              {buildCardReturn && (
                <div style={{ ...styles.buildCardDragGhost, ...styles.buildCardReturnGhost,
                  left: buildCardReturn.returning ? buildCardReturn.toX : buildCardReturn.x,
                  top: buildCardReturn.returning ? buildCardReturn.toY : buildCardReturn.y }}>
                  <span style={{ color: buildCardReturn.type === "CrystalPoint" ? "#67e8f9" : buildCardReturn.type === "Barracks" ? "#fbbf24" : "#86efac" }}>
                    {buildCardReturn.type === "CrystalPoint" ? "◆" : buildCardReturn.type === "Barracks" ? "▲" : "■"}
                  </span>
                </div>
              )}
              {buildCardDrag && (
                <div
                  style={{
                    ...styles.buildCardDragGhost,
                    left: buildCardDrag.x,
                    top: buildCardDrag.y,
                  }}
                >
                  <span style={{ color: buildCardDrag.type === "CrystalPoint" ? "#67e8f9" : buildCardDrag.type === "Barracks" ? "#fbbf24" : "#86efac" }}>
                    {buildCardDrag.type === "CrystalPoint" ? "◆" : buildCardDrag.type === "Barracks" ? "▲" : "■"}
                  </span>
                  <small>
                    {buildCardDrag.type === "CrystalPoint" ? "CRYSTAL" : buildCardDrag.type === "Barracks" ? "BARRACKS" : "HOUSE"}
                  </small>
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

              {utilityMenuOpen && <div style={styles.utilityMenuPanel}><button style={styles.utilityMenuButton} onClick={endRun}><span>◼</span><small>END</small></button><button style={styles.utilityMenuButton} onClick={onClose}><span>×</span><small>EXIT</small></button></div>}
              <footer style={styles.cityControls}>
                <button style={styles.iconControlButton} onClick={runCityServiceAction} title="Service"><span style={styles.controlIcon}>↺</span></button>
                <button style={{...styles.iconControlButton,...(buildMode||buildMenuOpen?styles.controlButtonActive:{})}} onClick={openBuildMenu} title="Build"><span style={styles.controlIcon}>🔨</span></button>
                <button style={styles.iconControlButton} onClick={backToMap} title="World Map"><span style={styles.controlIcon}>🗺</span></button>
                <button style={styles.iconControlButton} onClick={centerCityCamera} title="Center"><span style={styles.controlIcon}>◎</span></button>
                <button style={{...styles.iconControlButton,...(utilityMenuOpen?styles.controlButtonActive:{})}} onClick={toggleUtilityMenu} title="Menu"><span style={styles.controlIcon}>☰</span></button>
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
    const ux = dx / distance;
    const uy = dy / distance;
    const nx = -uy;
    const ny = ux;
    const centerX = march.fromX + dx * progress;
    const centerY = march.fromY + dy * progress;
    const returning = march.type === "return";
    const baseGlow = returning ? "#22c55e" : "#67e8f9";
    const pathColor = returning ? "rgba(34,197,94,0.12)" : "rgba(103,232,249,0.12)";
    const visibleCount = Math.min(count, 110);
    const layers = Math.max(1, Math.ceil(visibleCount / 28));

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = pathColor;
    ctx.lineWidth = 2;
    ctx.moveTo(march.fromX, march.fromY);
    ctx.lineTo(march.toX, march.toY);
    ctx.stroke();

    for (let i = 0; i < visibleCount; i += 1) {
      const level = getMarchGuardLevel(march.guardsByLevel, i, visibleCount);
      const visual = getGuardVisual(level);
      const layer = i % layers;
      const angleIndex = Math.floor(i / layers);
      const itemsInLayer = Math.ceil(visibleCount / layers);
      const phase =
        now * (1.55 - layer * 0.12) +
        (angleIndex / Math.max(1, itemsInLayer)) * Math.PI * 2 +
        layer * 1.35;
      const radius = 15 + layer * 10 + Math.min(18, Math.sqrt(count) * 1.25);
      const forwardCrescent = Math.cos(phase) * radius * 0.5;
      const sideOrbit = Math.sin(phase) * radius;
      const breathing = 1 + Math.sin(now * 2.1 + i * 0.43) * 0.09;
      const localForward = forwardCrescent * breathing - radius * 0.12;
      const localSide = sideOrbit * breathing;
      const driftForward = Math.sin(now * 1.8 + i * 0.71) * 2.4;
      const driftSide = Math.cos(now * 2.4 + i * 0.57) * 2.1;
      const x = centerX + ux * (localForward + driftForward) + nx * (localSide + driftSide);
      const y = centerY + uy * (localForward + driftForward) + ny * (localSide + driftSide);
      const tailX = x - ux * (5 + level * 0.35);
      const tailY = y - uy * (5 + level * 0.35);

      ctx.beginPath();
      ctx.strokeStyle = returning ? "rgba(34,197,94,0.25)" : visual.tail;
      ctx.lineWidth = 1.6;
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = returning ? mixMarchReturnColor(visual.fill) : visual.fill;
      ctx.shadowColor = returning ? baseGlow : visual.glow;
      ctx.shadowBlur = 9;
      ctx.arc(x, y, Math.max(2.6, visual.size * 0.9), 0, Math.PI * 2);
      ctx.fill();
      if (visual.core) {
        ctx.beginPath();
        ctx.fillStyle = visual.core;
        ctx.arc(x, y, visual.size * 0.34, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.strokeStyle = returning ? "rgba(134,239,172,0.3)" : "rgba(191,246,255,0.28)";
    ctx.lineWidth = 2;
    ctx.arc(centerX, centerY, 14 + Math.min(16, Math.sqrt(count)), 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${count}`, centerX + nx * 4, centerY + ny * 4 - 25);
    ctx.restore();
  }
}
function getMarchGuardLevel(guardsByLevel, index, visibleCount) {
  const levels = [];
  for (const [level, amount] of Object.entries(guardsByLevel || {})) {
    const share = Math.max(0, Math.floor((amount / Math.max(1, Object.values(guardsByLevel || {}).reduce((sum, value) => sum + value, 0))) * visibleCount));
    for (let i = 0; i < share; i += 1) levels.push(Number(level));
  }
  return levels[index % Math.max(1, levels.length)] || 1;
}
function mixMarchReturnColor(fill) {
  if (fill.includes("168,85,247")) return "rgba(196,181,253,0.96)";
  if (fill.includes("251,191,36")) return "rgba(190,242,100,0.96)";
  if (fill.includes("125,211,252")) return "rgba(110,231,183,0.96)";
  if (fill.includes("165,243,252")) return "rgba(134,239,172,0.96)";
  return "rgba(134,239,172,0.92)";
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
  const now = Date.now() / 1000;
  const level = building.level || 1;
  const pulse = 1 + Math.sin(now * 1.8) * 0.035;
  const bodyRadius = Math.min(width, height) * 0.36;

  drawModulePad(ctx, cx, cy + 18, width * 0.72, height * 0.47, "#38bdf8");
  drawModuleLegs(ctx, cx, cy + 30, width * 0.29, height * 0.24, "#0ea5e9");

  ctx.save();
  ctx.translate(cx, cy - 3);
  ctx.scale(1, 0.76);
  const shell = ctx.createRadialGradient(-26, -28, 8, 0, 0, bodyRadius);
  shell.addColorStop(0, "rgba(255,255,255,0.96)");
  shell.addColorStop(0.2, "rgba(103,232,249,0.96)");
  shell.addColorStop(0.68, "rgba(37,99,235,0.96)");
  shell.addColorStop(1, "rgba(30,27,75,0.98)");
  ctx.beginPath();
  ctx.fillStyle = shell;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 30;
  ctx.arc(0, 0, bodyRadius * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(207,250,254,0.72)";
  ctx.lineWidth = 5;
  ctx.arc(0, 0, bodyRadius * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawOrbitRing(ctx, cx, cy - 3, bodyRadius + 15, bodyRadius * 0.48, now * 0.7, "rgba(103,232,249,0.68)");
  if (level >= 2) drawOrbitRing(ctx, cx, cy - 3, bodyRadius + 27, bodyRadius * 0.62, -now * 0.48, "rgba(196,181,253,0.52)");

  ctx.save();
  ctx.translate(cx, cy - 3);
  ctx.rotate(-0.12);
  ctx.beginPath();
  ctx.fillStyle = "rgba(2,6,23,0.92)";
  ctx.ellipse(0, 0, bodyRadius * 0.48, bodyRadius * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "#dffcff";
  ctx.shadowColor = "#67e8f9";
  ctx.shadowBlur = 18;
  ctx.arc(0, 0, 14 + level * 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  const visibleWorkers = Math.min(5, Math.max(0, cityStatsWorkerVisual(building)));
  for (let i = 0; i < visibleWorkers; i += 1) {
    const angle = now * (0.85 + i * 0.035) + (i / Math.max(1, visibleWorkers)) * Math.PI * 2;
    const radius = bodyRadius * 0.55 + (i % 2) * 10;
    drawWorkerOrb(ctx, cx + Math.cos(angle) * radius, cy - 3 + Math.sin(angle) * radius * 0.48, i);
  }

  if (level >= 3) {
    for (let i = 0; i < Math.min(3, level - 1); i += 1) {
      const angle = now * 0.32 + (i / 3) * Math.PI * 2;
      drawSatellite(ctx, cx + Math.cos(angle) * (bodyRadius + 35), cy - 3 + Math.sin(angle) * (bodyRadius + 35) * 0.55, "#c4b5fd");
    }
  }
}
function drawCrystalPointBuilding(ctx, building, width, height, cx, cy) {
  const now = Date.now() / 1000;
  const level = building.level || 1;
  const crystalH = Math.min(width, height) * (0.25 + level * 0.012);

  drawModulePad(ctx, cx, cy + 28, width * 0.72, height * 0.34, "#22d3ee");
  drawModuleLegs(ctx, cx, cy + 34, width * 0.3, height * 0.19, "#0891b2");

  ctx.save();
  ctx.translate(cx, cy - 8);
  ctx.rotate(Math.sin(now * 0.75) * 0.06);
  const crystal = ctx.createLinearGradient(0, -crystalH, 0, crystalH);
  crystal.addColorStop(0, "#ecfeff");
  crystal.addColorStop(0.35, "#67e8f9");
  crystal.addColorStop(0.72, "#06b6d4");
  crystal.addColorStop(1, "#164e63");
  ctx.beginPath();
  ctx.fillStyle = crystal;
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 28;
  ctx.moveTo(0, -crystalH);
  ctx.lineTo(crystalH * 0.62, 0);
  ctx.lineTo(0, crystalH);
  ctx.lineTo(-crystalH * 0.62, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.58)";
  ctx.lineWidth = 3;
  ctx.moveTo(0, -crystalH * 0.84);
  ctx.lineTo(crystalH * 0.26, 0);
  ctx.lineTo(0, crystalH * 0.76);
  ctx.stroke();
  ctx.restore();

  drawOrbitRing(ctx, cx, cy - 8, crystalH * 1.12, crystalH * 0.38, now * 1.15, "rgba(103,232,249,0.72)");
  drawOrbitRing(ctx, cx, cy - 8, crystalH * 0.86, crystalH * 0.58, -now * 0.82, "rgba(165,243,252,0.42)");

  const particles = 5 + Math.min(4, level);
  for (let i = 0; i < particles; i += 1) {
    const phase = (now * 0.22 + i / particles) % 1;
    const px = cx + Math.sin(i * 2.35 + now) * (18 + i * 3);
    const py = cy + 48 - phase * 105;
    ctx.beginPath();
    ctx.fillStyle = `rgba(103,232,249,${0.2 + phase * 0.65})`;
    ctx.arc(px, py, 2.4 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}
function drawHouseBuilding(ctx, building, width, height) {
  const now = Date.now() / 1000;
  const level = building.level || 1;
  const cx = building.x + width / 2;
  const cy = building.y + height / 2;
  const r = Math.min(width, height) * 0.29;

  drawModulePad(ctx, cx, cy + 16, width * 0.7, height * 0.33, "#22c55e");
  drawModuleLegs(ctx, cx, cy + 23, width * 0.27, height * 0.18, "#15803d");

  const dome = ctx.createRadialGradient(cx - 13, cy - 18, 4, cx, cy, r * 1.2);
  dome.addColorStop(0, "#f0fdf4");
  dome.addColorStop(0.22, "#86efac");
  dome.addColorStop(0.72, "#16a34a");
  dome.addColorStop(1, "#14532d");
  ctx.beginPath();
  ctx.fillStyle = dome;
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = 16;
  ctx.arc(cx, cy - 4, r, Math.PI, Math.PI * 2);
  ctx.lineTo(cx + r, cy + 18);
  ctx.quadraticCurveTo(cx, cy + 33, cx - r, cy + 18);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  const windows = Math.min(5, 2 + level);
  for (let i = 0; i < windows; i += 1) {
    const angle = Math.PI + ((i + 1) / (windows + 1)) * Math.PI;
    const wx = cx + Math.cos(angle) * r * 0.58;
    const wy = cy - 4 + Math.sin(angle) * r * 0.42;
    ctx.beginPath();
    ctx.fillStyle = `rgba(220,252,231,${0.65 + Math.sin(now * 1.2 + i) * 0.18})`;
    ctx.shadowColor = "#bbf7d0";
    ctx.shadowBlur = 8;
    ctx.arc(wx, wy, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.strokeStyle = "rgba(187,247,208,0.54)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r - 10);
  ctx.lineTo(cx, cy - r + 5);
  ctx.stroke();
  drawSatellite(ctx, cx, cy - r - 13, "#86efac", 4);

  if (level >= 3) drawOrbitRing(ctx, cx, cy - 4, r + 10, r * 0.32, now * 0.45, "rgba(134,239,172,0.42)");
}
function drawBarracksBuilding(ctx, building, width, height) {
  const now = Date.now() / 1000;
  const level = building.level || 1;
  const cx = building.x + width / 2;
  const cy = building.y + height / 2;
  const r = Math.min(width, height) * 0.3;

  drawModulePad(ctx, cx, cy + 30, width * 0.76, height * 0.38, "#f59e0b");
  drawModuleLegs(ctx, cx, cy + 38, width * 0.32, height * 0.2, "#b45309");

  const body = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  body.addColorStop(0, "#fde68a");
  body.addColorStop(0.25, "#fbbf24");
  body.addColorStop(0.78, "#d97706");
  body.addColorStop(1, "#78350f");
  ctx.beginPath();
  ctx.fillStyle = body;
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 22;
  ctx.arc(cx, cy - 3, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.fillStyle = "rgba(2,6,23,0.84)";
  ctx.ellipse(cx, cy + 13, r * 0.46, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(254,243,199,0.68)";
  ctx.lineWidth = 4;
  ctx.arc(cx, cy - 3, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  const trainPulse = 0.55 + Math.sin(now * 4 + (building.trainTimer || 0) * 2) * 0.28;
  ctx.beginPath();
  ctx.fillStyle = `rgba(255,255,255,${trainPulse})`;
  ctx.shadowColor = "#fef3c7";
  ctx.shadowBlur = 14;
  ctx.arc(cx, cy + 13, 8 + level, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawOrbitRing(ctx, cx, cy - 3, r + 13, r * 0.36, -now * 0.9, "rgba(251,191,36,0.66)");
  const pylons = 2 + Math.min(2, Math.floor(level / 2));
  for (let i = 0; i < pylons; i += 1) {
    const angle = (i / pylons) * Math.PI * 2 + Math.PI / 4;
    drawSatellite(ctx, cx + Math.cos(angle) * (r + 8), cy - 3 + Math.sin(angle) * (r + 8) * 0.55, "#fde68a", 5);
  }
}
function drawModulePad(ctx, cx, cy, width, height, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.48);
  ctx.beginPath();
  ctx.fillStyle = "rgba(2,6,23,0.9)";
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.arc(0, 0, width * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 5;
  ctx.arc(0, 0, width * 0.38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
function drawModuleLegs(ctx, cx, cy, halfWidth, legHeight, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * halfWidth, cy - legHeight * 0.35);
    ctx.lineTo(cx + side * halfWidth * 1.1, cy + legHeight * 0.55);
    ctx.stroke();
  }
  ctx.restore();
}
function drawOrbitRing(ctx, cx, cy, rx, ry, rotation, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.arc(rx, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function drawSatellite(ctx, x, y, color, size = 5) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
function drawWorkerOrb(ctx, x, y, index) {
  const colors = ["#fef08a", "#fde68a", "#bbf7d0", "#a5f3fc", "#ddd6fe"];
  drawSatellite(ctx, x, y, colors[index % colors.length], 4.2);
}
function cityStatsWorkerVisual() {
  const stats = globalThis.__macroSwarmCityStatsVisual;
  if (!stats) return 5;
  if (stats.workerCap <= 0) return 0;
  return Math.ceil(clamp(stats.workers / stats.workerCap, 0, 1) * 5);
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

  menuActionGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 10 },
  menuActionButton: { minHeight: 76, borderRadius: 18, border: "1px solid rgba(255,255,255,0.11)", background: "linear-gradient(180deg, rgba(31,47,76,0.92), rgba(12,23,43,0.96))", color: "#fff", padding: 10, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 3, textAlign: "left", cursor: "pointer" },
  menuActionIcon: { color: "#67e8f9", fontSize: 17, lineHeight: 1 },
  menuActionLocked: { opacity: 0.42, cursor: "not-allowed" },
  trainingMenuButton: { border: "1px solid rgba(103,232,249,0.72)", background: "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(6,182,212,0.88))", boxShadow: "0 0 24px rgba(34,211,238,0.28)" },
  trainingScreen: { minHeight: "100vh", padding: "22px 16px 28px", boxSizing: "border-box", overflowY: "auto", background: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.24), transparent 34%), linear-gradient(180deg, #07111f 0%, #020617 100%)" },
  trainingHeader: { width: "min(520px, 100%)", margin: "0 auto 18px", display: "grid", gridTemplateColumns: "46px 1fr auto", alignItems: "center", gap: 10 },
  trainingBackButton: { width: 42, height: 42, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 22, cursor: "pointer" },
  trainingTitle: { margin: "2px 0 0", fontSize: 31, lineHeight: 1 },
  trainingProgress: { minWidth: 60, height: 38, padding: "0 12px", borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(103,232,249,0.12)", border: "1px solid rgba(103,232,249,0.32)", color: "#a5f3fc", fontWeight: 900 },
  trainingTrack: { width: "min(520px, 100%)", margin: "0 auto", display: "grid", gap: 10 },
  trainingStage: { width: "100%", minHeight: 94, borderRadius: 21, padding: 12, boxSizing: "border-box", display: "grid", gridTemplateColumns: "52px 1fr 28px", gap: 10, alignItems: "center", textAlign: "left", color: "#fff" },
  trainingStageActive: { border: "1px solid rgba(103,232,249,0.74)", background: "linear-gradient(135deg, rgba(37,99,235,0.50), rgba(8,145,178,0.28)), rgba(15,23,42,0.94)", boxShadow: "0 16px 44px rgba(0,0,0,0.32), 0 0 26px rgba(34,211,238,0.18)", cursor: "pointer" },
  trainingStageLocked: { border: "1px solid rgba(255,255,255,0.09)", background: "rgba(15,23,42,0.78)", opacity: 0.48 },
  trainingStageNumber: { width: 48, height: 48, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(103,232,249,0.11)", border: "1px solid rgba(103,232,249,0.22)", color: "#a5f3fc", fontWeight: 950 },
  trainingStageInfo: { minWidth: 0, display: "flex", flexDirection: "column", gap: 4 },
  trainingStageStatus: { width: "fit-content", marginTop: 2, color: "#67e8f9", fontSize: 9, fontWeight: 950, letterSpacing: "0.12em" },
  trainingStageLockedText: { width: "fit-content", marginTop: 2, color: "rgba(255,255,255,0.46)", fontSize: 9, fontWeight: 950, letterSpacing: "0.12em" },
  trainingStageArrow: { color: "#67e8f9", fontSize: 30, textAlign: "center" },
  trainingLock: { color: "rgba(255,255,255,0.46)", fontSize: 22, textAlign: "center" },
  trainingRewardCard: { width: "min(520px, 100%)", margin: "14px auto 0", minHeight: 66, borderRadius: 20, padding: "12px 16px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 12, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.22)", color: "#fde68a" },
  trainingIntroOverlay: { position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box", background: "radial-gradient(circle at 50% 42%, rgba(14,116,144,.32), transparent 28%), linear-gradient(180deg, #020617, #00040c)", opacity: 1, transition: "opacity .52s ease, transform .52s ease", animation: "trainingIntroReveal .7s ease-out both", pointerEvents: "none" },
  trainingIntroOverlayLaunch: { opacity: 0, transform: "scale(1.08)" },
  trainingIntroOrbit: { position: "relative", width: 178, height: 122, display: "grid", placeItems: "center", animation: "trainingIntroOrbitSpin 7s linear infinite" },
  trainingIntroEye: { width: 132, height: 78, borderRadius: "64% 36% 64% 36% / 58% 58% 42% 42%", transform: "rotate(-8deg)", border: "4px solid rgba(191,246,255,.9)", background: "linear-gradient(135deg, rgba(15,23,42,.98), rgba(8,47,73,.94))", boxShadow: "0 0 34px rgba(56,189,248,.64)", display: "grid", placeItems: "center" },
  trainingIntroIris: { width: 62, height: 62, borderRadius: "50%", border: "5px solid #67e8f9", background: "radial-gradient(circle, #dffcff 0 10%, #0ea5e9 14% 42%, #1d4ed8 62%, #020617 70%)", display: "grid", placeItems: "center", animation: "trainingIntroPulse 1.15s ease-in-out infinite" },
  trainingIntroPupil: { width: 20, height: 20, borderRadius: "50%", background: "#020617", border: "3px solid rgba(255,255,255,.84)" },
  trainingIntroSatellite: { position: "absolute", width: 15, height: 15, borderRadius: "50%", background: "#dffcff", border: "3px solid #38bdf8", boxShadow: "0 0 18px #38bdf8" },
  trainingIntroSatelliteOne: { left: 4, top: 50 }, trainingIntroSatelliteTwo: { right: 7, top: 18 }, trainingIntroSatelliteThree: { right: 18, bottom: 4 },
  trainingIntroBrand: { marginTop: 18, color: "#fff", fontSize: 30, fontWeight: 950, letterSpacing: ".08em", textShadow: "0 0 20px rgba(56,189,248,.82)" },
  trainingIntroDivider: { width: 180, height: 2, margin: "12px 0 16px", background: "linear-gradient(90deg, transparent, #67e8f9, transparent)", boxShadow: "0 0 14px #22d3ee" },
  trainingIntroStage: { color: "#67e8f9", fontSize: 12, fontWeight: 950, letterSpacing: ".22em" },
  trainingIntroTitle: { margin: "8px 0 12px", color: "#fff", fontSize: 27, letterSpacing: ".04em" },
  trainingIntroStatus: { display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.58)", fontSize: 10, fontWeight: 900, letterSpacing: ".16em" },
  trainingIntroStatusDot: { width: 8, height: 8, borderRadius: "50%", background: "#67e8f9", boxShadow: "0 0 12px #22d3ee", animation: "trainingIntroDot .85s ease-in-out infinite" },
  arena: {
    position: "fixed",
    animation: "trainingCityFadeIn .52s ease-out both",
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

  topInterfacePanel: {
    position: "absolute", left: 0, right: 0, top: 0, height: 59, zIndex: 2,
    background: "linear-gradient(180deg, rgba(5,12,25,0.97), rgba(8,18,35,0.9))",
    borderBottom: "1px solid rgba(103,232,249,0.38)",
    boxShadow: "0 10px 28px rgba(0,0,0,0.38), inset 0 -1px 0 rgba(255,255,255,0.05)",
    backdropFilter: "blur(14px)", pointerEvents: "none",
  },
  bottomInterfacePanel: {
    position: "absolute", left: 0, right: 0, bottom: 0, height: 75, zIndex: 3,
    background: "linear-gradient(180deg, rgba(8,18,35,0.9), rgba(5,12,25,0.98))",
    borderTop: "1px solid rgba(103,232,249,0.38)",
    boxShadow: "0 -12px 30px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.05)",
    backdropFilter: "blur(14px)", pointerEvents: "none",
  },
  cityTopBar: {
    position: "absolute", left: 7, right: 7, top: 7, height: 44, zIndex: 4,
    display: "grid", gridTemplateColumns: "1.25fr 1fr 1.25fr 1.35fr", gap: 3,
    padding: 3, boxSizing: "border-box", borderRadius: 17,
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)",
    pointerEvents: "none",
  },

  topResourceChip: {
    minWidth: 0,
    height: 36,
    borderRadius: 12,
    background: "linear-gradient(180deg, rgba(22,34,57,0.8), rgba(10,20,38,0.84))",
    border: "1px solid rgba(255,255,255,0.085)",
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

  tutorialChipGlow: { animation:"chipGlow 1.15s ease-in-out infinite" },
  tutorialLevelChipGlow: { animation:"chipGlow 1.05s ease-in-out infinite",color:"#fef08a",borderColor:"#facc15" },

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
    left: "50%",
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
  tutorialHouseDropTarget: {
    position: "absolute", zIndex: 6, transform: "translate(-50%, -50%)", boxSizing: "border-box",
    border: "3px dashed rgba(134,239,172,0.96)", borderRadius: 14, background: "rgba(34,197,94,0.13)",
    color: "rgba(134,239,172,0.34)", display: "grid", placeItems: "center", fontSize: 24,
    pointerEvents: "none", animation: "tutorialHouseDropPulse 1.25s ease-in-out infinite",
  },
  tutorialHouseDropBeacon: {
    position: "absolute", zIndex: 7, width: 14, height: 14, borderRadius: "50%", transform: "translate(-50%, -50%)",
    background: "#dcfce7", border: "3px solid #22c55e", boxShadow: "0 0 18px rgba(34,197,94,0.95)",
    pointerEvents: "none", animation: "tutorialHouseBeaconPulse 1.25s ease-in-out infinite",
  },
  tutorialHouseDragGuide: {
    position: "absolute", left: "37.5%", top: 16, zIndex: 12,
    width: 58, height: 58, transform: "translateX(-50%)", pointerEvents: "none",
  },
  tutorialHouseDragGhost: {
    position: "absolute", inset: 8, borderRadius: 12, display: "grid", placeItems: "center",
    color: "#86efac", fontSize: 24, background: "rgba(34,197,94,0.22)",
    border: "2px solid rgba(134,239,172,0.9)", boxShadow: "0 0 20px rgba(34,197,94,0.6)",
    animation: "tutorialHouseGhostGuide 2.4s ease-in-out infinite",
  },
  tutorialHouseDragHand: {
    position: "absolute", left: 16, top: 24, color: "rgba(255,255,255,0.94)", fontSize: 38,
    textShadow: "0 0 15px rgba(103,232,249,0.95)",
    animation: "tutorialHouseDragGuide 2.4s ease-in-out infinite",
  },
  buildCardDragGhost: {
    position: "fixed", zIndex: 40, width: 64, height: 64, transform: "translate(-50%, -50%)",
    borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    color: "#ffffff", background: "rgba(15,23,42,0.9)", border: "2px solid rgba(255,255,255,0.42)",
    boxShadow: "0 0 26px rgba(103,232,249,0.46)", pointerEvents: "none", fontWeight: 900,
  },
  buildCardReturnGhost: { transition: "left .34s cubic-bezier(.34,1.56,.64,1), top .34s cubic-bezier(.34,1.56,.64,1)", transform: "translate(-50%, -50%) scale(.82)", opacity: .78 },
  tutorialBarracksMenuArrow: { left: "62.5%" },
  tutorialTeleportPointer: { position: "absolute", left: "30%", bottom: 68, zIndex: 13, width: 56, height: 64, transform: "translateX(-50%)", display: "grid", placeItems: "center", pointerEvents: "none" },
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
  buildCardTutorialLocked: { opacity: 0.2, filter: "grayscale(1)", cursor: "not-allowed" },
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

  expeditionTracker: { position:"absolute",left:9,top:61,zIndex:13,width:118,height:72,padding:6,borderRadius:19,color:"#fff",display:"grid",gridTemplateColumns:"56px 1fr",gap:5,alignItems:"center",backdropFilter:"blur(12px)",cursor:"pointer",boxShadow:"0 14px 38px rgba(0,0,0,.38)" },
  expeditionTrackerAttack: { background:"linear-gradient(135deg,rgba(7,89,133,.94),rgba(15,23,42,.96))",border:"1px solid rgba(56,189,248,.72)" },
  expeditionTrackerReturn: { background:"linear-gradient(135deg,rgba(21,128,61,.9),rgba(15,23,42,.96))",border:"1px solid rgba(134,239,172,.72)" },
  expeditionPortrait: { width:52,height:56,borderRadius:16,border:"2px solid #67e8f9",background:"radial-gradient(circle,rgba(255,255,255,.12),rgba(2,6,23,.9))",position:"relative",display:"grid",placeItems:"center",overflow:"hidden",fontSize:13 },
  expeditionCreature: { position:"absolute",width:20,height:20,borderRadius:7,transform:"rotate(45deg)",opacity:.72 },
  expeditionTimerBlock: { minWidth:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,lineHeight:1 },
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
  tutorialAttackPointer: {
    position: "absolute",
    left: "80.5%",
    top: 146,
    zIndex: 14,
    width: 56,
    height: 64,
    transform: "translateX(-50%)",
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  },
  macroPointerUp: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 42,
    lineHeight: 1,
    textShadow: "0 0 15px rgba(251,146,60,0.96)",
    animation: "tutorialBounce 1.05s ease-in-out infinite",
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

  monsterSearchPanel: { position:"absolute",left:7,right:7,bottom:72,zIndex:15,minHeight:68,padding:7,borderRadius:20,background:"rgba(8,18,35,.97)",border:"1px solid rgba(103,232,249,.28)",display:"grid",gridTemplateColumns:"1fr 54px",gap:6 },
  monsterSearchTiers: { display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:4 },
  monsterSearchTier: { minWidth:0,borderRadius:14,border:"1px solid",background:"rgba(255,255,255,.045)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,fontSize:10,fontWeight:950,color:"#fff" },
  monsterSearchTierActive: { background:"rgba(103,232,249,.13)",boxShadow:"inset 0 0 18px rgba(103,232,249,.16)" },
  monsterSearchTierLocked: { opacity:.22,filter:"grayscale(1)" },
  tutorialSearchControlGlow: { animation:"tutorialGlow 1.05s ease-in-out infinite" },
  tutorialSearchButtonPointer: { position:"absolute",left:"10%",bottom:68,zIndex:18,width:56,height:64,transform:"translateX(-50%)",display:"grid",placeItems:"center",pointerEvents:"none" },
  tutorialSearchTierPointer: { position:"absolute",left:"10%",bottom:58,zIndex:19,width:56,height:64,transform:"translateX(-50%)",display:"grid",placeItems:"center",pointerEvents:"none" },
  tutorialSearchGoPointer: { position:"absolute",right:6,bottom:58,zIndex:19,width:56,height:64,display:"grid",placeItems:"center",pointerEvents:"none" },
  monsterSearchOrb: { width:16,height:16,borderRadius:"50%",display:"block" },
  monsterSearchGo: { border:"1px solid rgba(103,232,249,.42)",borderRadius:15,background:"linear-gradient(135deg,#0e7490,#2563eb)",color:"#fff",fontSize:28,fontWeight:950 },
  utilityMenuPanel: { position:"absolute",right:7,bottom:72,zIndex:16,width:130,minHeight:62,padding:6,borderRadius:18,background:"rgba(8,18,35,.97)",border:"1px solid rgba(255,255,255,.13)",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:5 },
  utilityMenuButton: { minHeight:50,borderRadius:14,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.055)",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,fontWeight:950,fontSize:19 },
  arenaControls: {
    position: "absolute", left: 7, right: 7, bottom: 7,
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3,
    padding: 3, boxSizing: "border-box", borderRadius: 20,
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)", zIndex: 4,
  },
  cityControls: {
    position: "absolute", left: 7, right: 7, bottom: 7,
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3,
    padding: 3, boxSizing: "border-box", borderRadius: 20,
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)", zIndex: 4,
  },

  iconControlButton: {
    minHeight: 52,
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 16,
    background: "linear-gradient(180deg, rgba(23,35,58,0.88), rgba(11,21,40,0.92))",
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
