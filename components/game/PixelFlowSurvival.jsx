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

const CITY_GRID_STEP = 100;
const CITY_BASE_MODULES = 4;
const CITY_MODULE_SIZE = 2;
const CITY_LEVEL_ONE_CELLS = CITY_BASE_MODULES * CITY_MODULE_SIZE;
const CITY_LEVEL_ONE_SIZE = CITY_LEVEL_ONE_CELLS * CITY_GRID_STEP;
let CITY_WIDTH = CITY_LEVEL_ONE_SIZE;
let CITY_HEIGHT = CITY_LEVEL_ONE_SIZE;
const CITY_EXPANSION_PER_SIDE = CITY_MODULE_SIZE * CITY_GRID_STEP;
const CITY_DECADE_TEMPLATE_CELLS = [8, 12, 16, 20, 24, 24, 26, 28, 30, 32];
const CITY_OUTSIDE_PADDING = 900;
const CITY_MIN_ZOOM = 0.32;
const CITY_MAX_ZOOM = 1.1;

const ATTACK_MARCH_WORLD_SPEED = 154;
const RETURN_MARCH_WORLD_SPEED = 191;

const MAX_BUILDING_LEVEL = 100;
const GUARD_CRYSTAL_COST = 1;

const TUTORIAL_HOUSE_TARGET = 3;
const TUTORIAL_CRYSTAL_TARGET = 4;
const TUTORIAL_BARRACKS_TARGET = 4;
const BUILD_TIME_SECONDS = {
  House: 2,
  CrystalPoint: 3,
  Barracks: 5,
  Citadel: 8,
};
const UPGRADE_TIME_MULTIPLIER = 1.45;

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

function getBuildingModuleCount(level) {
  const safeLevel = Math.max(1, Math.round(level || 1));
  const generation = Math.floor((safeLevel - 1) / 5);
  const cycleStep = ((safeLevel - 1) % 5) + 1;
  const stageModules = cycleStep === 1 ? 1 : cycleStep === 2 ? 2 : 4;
  return Math.pow(4, generation) * stageModules;
}

function getBuildingOutputScale(level) {
  const safeLevel = Math.max(1, Math.round(level || 1));
  let output = 1;
  let enhancementBase = 1;

  for (let current = 2; current <= safeLevel; current += 1) {
    const cycleStep = ((current - 2) % 5 + 5) % 5;
    const isMergeLevel = cycleStep === 0 || cycleStep === 1;
    if (isMergeLevel) {
      output *= 2;
      enhancementBase = output;
    } else if (current >= 4) {
      output += enhancementBase * 0.25;
    }
  }
  return output;
}

function getBuildingEfficiency(level) {
  const modules = getBuildingModuleCount(level);
  return getBuildingOutputScale(level) / Math.max(1, modules);
}

function getBuildingEconomy(type, level) {
  const safeLevel = Math.max(1, Math.round(level || 1));
  const definition = BUILDINGS[type] || BUILDINGS.House;
  const modules = getBuildingModuleCount(safeLevel);
  const outputScale = getBuildingOutputScale(safeLevel);
  const efficiency = outputScale / Math.max(1, modules);
  const crystalCost = type === "CrystalPoint" ? 0 : Math.ceil((definition.cost || 0) * outputScale);
  const workerCost = type === "CrystalPoint" ? Math.ceil((definition.workerCost || 0) * outputScale) : 0;
  const buildTime = Math.max(1, (BUILD_TIME_SECONDS[type] || 3) * Math.sqrt(modules) * (1 + (safeLevel - 1) * 0.035));
  return {
    level: safeLevel,
    modules,
    outputScale,
    efficiency,
    crystalCost,
    workerCost,
    buildTime,
    workerCapacity: type === "House" ? Math.round(5 * outputScale) : 0,
    guardCapacity: type === "House" ? Math.round(25 * outputScale) : 0,
    crystalRate: type === "CrystalPoint" ? outputScale : 0,
    barracksBatch: type === "Barracks" ? outputScale : 0,
  };
}

function getUpgradeEconomy(type, currentLevel) {
  const current = getBuildingEconomy(type, currentLevel);
  const target = getBuildingEconomy(type, current.level + 1);
  return {
    target,
    crystalCost: type === "CrystalPoint" ? 0 : Math.max(1, Math.ceil((target.crystalCost - current.crystalCost) + target.crystalCost * 0.15)),
    workerCost: type === "CrystalPoint" ? Math.max(1, Math.ceil((target.workerCost - current.workerCost) + target.workerCost * 0.15)) : 0,
    upgradeTime: Math.max(1, target.buildTime * 0.70),
  };
}

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
  if (level <= 1) return 100;
  if (level === 2) return 300;
  if (level === 3) return 750;
  if (level === 4) return 1500;
  if (level === 5) return 3000;
  return Math.round(3000 * Math.pow(1.65, level - 5));
}
function getNextLevelXp(level) { return getXpRequiredForLevel(level); }
function getMonsterXpMultiplier(coreLevel, monsterLevel) {
  const difference = monsterLevel - coreLevel;
  return difference >= 0 ? Math.pow(1.2, difference) : Math.pow(0.8, Math.abs(difference));
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

function getCityDecade(level) {
  return Math.floor(Math.max(0, level - 1) / 10);
}

function getCityGeneration(level) {
  return Math.floor(Math.max(0, level - 1) / 5);
}

function getCityCellsForLevel(level) {
  const safeLevel = Math.max(1, Math.round(level || 1));
  const decade = getCityDecade(safeLevel);
  const decadeStep = (safeLevel - 1) % 10;
  return CITY_DECADE_TEMPLATE_CELLS[decadeStep] * Math.pow(4, decade);
}

function getCitySizeForLevel(level) {
  return getCityCellsForLevel(level) * CITY_GRID_STEP;
}

function createCityState() {
  const citadelSize = 4;
  const citadelX = CITY_WIDTH / 2 - (citadelSize * CITY_GRID_STEP) / 2;
  const citadelY = CITY_HEIGHT / 2 - (citadelSize * CITY_GRID_STEP) / 2;
  return { buildings: [{ id: "citadel", type: "Citadel", level: 1, x: citadelX, y: citadelY, w: citadelSize, h: citadelSize, color: "#38bdf8" }] };
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

function getCityFitMinZoom(canvas, extraMargin = 120) {
  if (!canvas) return CITY_MIN_ZOOM;
  const sideChrome = 24;
  const topSafeArea = 190;
  const bottomSafeArea = 190;
  const territoryMarginFactor = 1.2;
  const usableWidth = Math.max(120, canvas.clientWidth - sideChrome);
  const usableHeight = Math.max(120, canvas.clientHeight - topSafeArea - bottomSafeArea);
  const fitWidth = usableWidth / ((CITY_WIDTH + extraMargin * 2) * territoryMarginFactor);
  const fitHeight = usableHeight / ((CITY_HEIGHT + extraMargin * 2) * territoryMarginFactor);
  return clamp(Math.min(CITY_MIN_ZOOM, fitWidth, fitHeight), 0.00000005, CITY_MIN_ZOOM);
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
  const tutorialKillsRef = useRef(0);
  const [tutorialKills, setTutorialKills] = useState(0);
  const tutorialFreeTargetIdsRef = useRef([]);
  const tutorialFreeTargetTimerRef = useRef(null);
  const levelUpTimerRef = useRef(null);
  const cityReturnPointerTimerRef = useRef(null);
  const [levelUpCelebration, setLevelUpCelebration] = useState(null);
  const [cityReturnPointerReady, setCityReturnPointerReady] = useState(false);
  const citadelPointerTimerRef = useRef(null);
  const citadelUpgradePointerTimerRef = useRef(null);
  const [citadelPointerReady, setCitadelPointerReady] = useState(false);
  const [citadelUpgradePointerReady, setCitadelUpgradePointerReady] = useState(false);
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
  const movingBuildingRef = useRef(null);
  const cityDoubleTapRef = useRef({ buildingId: null, time: 0 });
  const groupSelectionRef = useRef({ active: false, ids: [], bounds: null, phase: "off", anchor: null });
  const groupDialogRef = useRef(null);
  const groupGestureRef = useRef({ timer: null, pointerId: null, downClientX: 0, downClientY: 0, downWorld: null, building: null, longPressed: false, dragging: false, moveOrigin: null, originalPositions: null });
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
  const tutorialMissionTimerRef = useRef(null);
  const postTeleportCityTimerRef = useRef(null);
  const [tutorialMissionComplete, setTutorialMissionComplete] = useState(null);
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
  const [buildingPanelVersion, setBuildingPanelVersion] = useState(0);
  const [groupSelection, setGroupSelection] = useState({ active: false, ids: [], bounds: null, phase: "off" });
  const [groupDialog, setGroupDialog] = useState(null);
  const [movingBuilding, setMovingBuilding] = useState(null);
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
  const devLabRef = useRef(false);
  const [devLab, setDevLab] = useState(false);
  const devRebuildTimerRef = useRef(null);
  const [devRebuildReport, setDevRebuildReport] = useState(null);
  const tutorialTeleportPointerTimerRef = useRef(null);
  const [tutorialTeleportPointerReady, setTutorialTeleportPointerReady] = useState(false);

  function updateTutorialFlowPhase(phase) {
    // Reset the previous phase pointer in the same event that changes phase.
    // Waiting for useEffect allowed the old ready=true value to render for one
    // frame, which caused the landing highlight to flash before its delay.
    if (tutorialTeleportPointerTimerRef.current) {
      clearTimeout(tutorialTeleportPointerTimerRef.current);
      tutorialTeleportPointerTimerRef.current = null;
    }
    setTutorialTeleportPointerReady(false);
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
      if (groupGestureRef.current.timer) clearTimeout(groupGestureRef.current.timer);
      if (tutorialMissionTimerRef.current) clearTimeout(tutorialMissionTimerRef.current);
      if (postTeleportCityTimerRef.current) clearTimeout(postTeleportCityTimerRef.current);
      if (tutorialTeleportPointerTimerRef.current) clearTimeout(tutorialTeleportPointerTimerRef.current);
      if (tutorialFreeTargetTimerRef.current) clearTimeout(tutorialFreeTargetTimerRef.current);
      if (devRebuildTimerRef.current) clearTimeout(devRebuildTimerRef.current);
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
      if (cityReturnPointerTimerRef.current) clearTimeout(cityReturnPointerTimerRef.current);
      if (citadelPointerTimerRef.current) clearTimeout(citadelPointerTimerRef.current);
      if (citadelUpgradePointerTimerRef.current) clearTimeout(citadelUpgradePointerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (tutorialTeleportPointerTimerRef.current) {
      clearTimeout(tutorialTeleportPointerTimerRef.current);
      tutorialTeleportPointerTimerRef.current = null;
    }

    const delayedPointerPhases = ["teleportButton", "selectLanding", "confirmLanding"];
    if (!delayedPointerPhases.includes(tutorialFlowPhase)) {
      setTutorialTeleportPointerReady(false);
      return;
    }

    setTutorialTeleportPointerReady(false);
    tutorialTeleportPointerTimerRef.current = setTimeout(() => {
      setTutorialTeleportPointerReady(true);
      tutorialTeleportPointerTimerRef.current = null;
    }, 1000);

    return () => {
      if (tutorialTeleportPointerTimerRef.current) {
        clearTimeout(tutorialTeleportPointerTimerRef.current);
        tutorialTeleportPointerTimerRef.current = null;
      }
    };
  }, [tutorialFlowPhase]);

  useEffect(() => {
    if (citadelUpgradePointerTimerRef.current) {
      clearTimeout(citadelUpgradePointerTimerRef.current);
      citadelUpgradePointerTimerRef.current = null;
    }
    setCitadelUpgradePointerReady(false);
    if (tutorialFlowPhase === "citadelUpgrade" && selectedBuilding?.type === "Citadel") {
      citadelUpgradePointerTimerRef.current = setTimeout(() => {
        setCitadelUpgradePointerReady(true);
        citadelUpgradePointerTimerRef.current = null;
      }, 1000);
    }
    return () => {
      if (citadelUpgradePointerTimerRef.current) clearTimeout(citadelUpgradePointerTimerRef.current);
    };
  }, [tutorialFlowPhase, selectedBuilding?.id]);

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
  const citadelBuildingForTutorial = getCitadelBuilding();
  const citadelTutorialScreen = citadelBuildingForTutorial
    ? cityWorldToScreen(
        citadelBuildingForTutorial.x + (citadelBuildingForTutorial.w * CITY_GRID_STEP) / 2,
        citadelBuildingForTutorial.y + (citadelBuildingForTutorial.h * CITY_GRID_STEP) / 2
      )
    : null;
  const tutorialStep = getTutorialStep();
  const tutorialMission = getTutorialMission(tutorialStep);
  const tutorialMissionProgress = tutorialMission
    ? Math.min(tutorialMission.target, getCityBuildingCount(tutorialMission.type))
    : 0;
  const arenaTutorialMission = getArenaTutorialMission();
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
    const previousId = selectedBuildingRef.current?.id ?? null;
    const nextId = nextBuilding?.id ?? null;
    selectedBuildingRef.current = nextBuilding;
    setSelectedBuildingState(nextBuilding ? { ...nextBuilding } : null);
    // Remount the card whenever another building is selected. This makes even
    // identical buildings feel like a new, deliberate selection.
    if (nextId && nextId !== previousId) {
      setBuildingPanelVersion((version) => version + 1);
    }
  }

  function publishGroupSelection(next) {
    groupSelectionRef.current = next;
    setGroupSelection({ ...next, ids: [...(next.ids || [])], bounds: next.bounds ? { ...next.bounds } : null });
  }
  function clearGroupSelection() {
    if (groupGestureRef.current.timer) clearTimeout(groupGestureRef.current.timer);
    groupGestureRef.current = { timer: null, pointerId: null, downClientX: 0, downClientY: 0, downWorld: null, building: null, longPressed: false, dragging: false, moveOrigin: null, originalPositions: null };
    publishGroupSelection({ active: false, ids: [], bounds: null, phase: "off", anchor: null });
    publishGroupDialog(null);
  }
  function getGroupBuildings(ids = groupSelectionRef.current.ids) {
    const set = new Set(ids || []);
    return cityRef.current.buildings.filter((b) => set.has(b.id) && b.type !== "Citadel");
  }
  function boundsForBuildings(buildings) {
    if (!buildings.length) return null;
    return {
      left: Math.min(...buildings.map((b) => b.x)), top: Math.min(...buildings.map((b) => b.y)),
      right: Math.max(...buildings.map((b) => b.x + b.w * CITY_GRID_STEP)),
      bottom: Math.max(...buildings.map((b) => b.y + b.h * CITY_GRID_STEP)),
    };
  }
  function buildingsInsideRect(a, b) {
    const left = Math.min(a.x, b.x), right = Math.max(a.x, b.x);
    const top = Math.min(a.y, b.y), bottom = Math.max(a.y, b.y);
    return cityRef.current.buildings.filter((item) => item.type !== "Citadel" &&
      item.x < right && item.x + item.w * CITY_GRID_STEP > left && item.y < bottom && item.y + item.h * CITY_GRID_STEP > top);
  }
  function startGroupFromBuilding(building) {
    if (!building || building.type === "Citadel") return;
    updateSelectedBuilding(null);
    const bounds = boundsForBuildings([building]);
    // Keep the complete first-building rectangle as the fixed selection origin.
    // A single top-left point made upward and leftward dragging start inside the
    // building, so adjacent buildings in those directions could be missed.
    publishGroupSelection({
      active: true,
      ids: [building.id],
      bounds,
      phase: "armed",
      anchor: { ...bounds },
    });
  }
  function getGroupUpgradePlan() {
    let crystals = cityStatsRef.current.crystals, workers = cityStatsRef.current.workers;
    return getGroupBuildings().map((building) => {
      const crystalCost = getUpgradeCrystalCost(building), workerCost = getUpgradeWorkerCost(building);
      const citadelLevel = getCitadelBuilding()?.level || 1;
      const levelAllowed = (building.level || 1) < MAX_BUILDING_LEVEL && citadelLevel >= (building.level || 1) + 1;
      const affordable = levelAllowed && crystals >= crystalCost && workers >= workerCost;
      if (affordable) { crystals -= crystalCost; workers -= workerCost; }
      return { id: building.id, affordable, crystalCost, workerCost };
    });
  }
  function publishGroupDialog(next) { groupDialogRef.current = next; setGroupDialog(next); }
  function openGroupUpgrade() { publishGroupDialog({ type: "upgrade", plan: getGroupUpgradePlan() }); }
  function confirmGroupUpgrade() {
    const plan = groupDialog?.plan || getGroupUpgradePlan();
    const ok = new Set(plan.filter((x) => x.affordable).map((x) => x.id));
    for (const building of getGroupBuildings()) {
      if (!ok.has(building.id)) continue;
      cityStatsRef.current.crystals -= getUpgradeCrystalCost(building);
      cityStatsRef.current.workers -= getUpgradeWorkerCost(building);
      const oldLevel = building.level || 1; building.level = oldLevel + 1;
      if (building.type === "House") { cityStatsRef.current.workerCap += 5; cityStatsRef.current.workers += 5; cityStatsRef.current.guardCap += 25; }
    }
    setGroupDialog(null); recalculateCityEconomy(); setCityStats({ ...cityStatsRef.current });
  }
  function confirmGroupDelete() {
    const ids = new Set(groupSelectionRef.current.ids); const stats = cityStatsRef.current;
    for (const building of getGroupBuildings()) {
      if (!building.underConstruction && building.type === "House") { const level=building.level||1; stats.workerCap=Math.max(5,stats.workerCap-level*5); stats.workers=Math.min(stats.workers,stats.workerCap); stats.guardCap=Math.max(10,stats.guardCap-level*25); }
      if (building.type === "CrystalPoint") stats.workers=Math.min(stats.workerCap,stats.workers+(building.level||1)*BUILDINGS.CrystalPoint.workerCost);
    }
    cityRef.current.buildings=cityRef.current.buildings.filter((b)=>!ids.has(b.id));
    constructionQueueRef.current=constructionQueueRef.current.filter((id)=>!ids.has(id));
    clearGroupSelection(); recalculateCityEconomy(); setCityStats({ ...stats });
  }
  function armGroupMove() {
    const buildings=getGroupBuildings(); if(!buildings.length)return;
    publishGroupSelection({ ...groupSelectionRef.current, phase:"move", bounds:boundsForBuildings(buildings) });
  }
  function isGroupMoveValid(positions) {
    const selected=new Set(groupSelectionRef.current.ids);
    for(const pos of positions){
      if(pos.x<0||pos.y<0||pos.x+pos.w*CITY_GRID_STEP>CITY_WIDTH||pos.y+pos.h*CITY_GRID_STEP>CITY_HEIGHT)return false;
      for(const other of cityRef.current.buildings){ if(selected.has(other.id))continue;
        if(!(pos.x+pos.w*CITY_GRID_STEP<=other.x||pos.x>=other.x+other.w*CITY_GRID_STEP||pos.y+pos.h*CITY_GRID_STEP<=other.y||pos.y>=other.y+other.h*CITY_GRID_STEP))return false;
      }
    } return true;
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
    if (devLabRef.current) return "done";
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
  function getTutorialMission(step) {
    if (step === "houses" || step === "housesBuilding") return { key: "houses", index: 1, total: 7, type: "House", target: TUTORIAL_HOUSE_TARGET, icon: "■", title: "BUILD 3 HOUSES", detail: "Expand worker and army capacity" };
    if (step === "crystals" || step === "crystalsBuilding") return { key: "crystals", index: 2, total: 7, type: "CrystalPoint", target: TUTORIAL_CRYSTAL_TARGET, icon: "◆", title: "BUILD 4 CRYSTAL POINTS", detail: "Establish crystal production" };
    if (step === "map") return { key: "camera", index: 3, total: 7, type: null, target: 2, icon: "⌖", title: "MASTER WORLD CAMERA", detail: "Open the map, zoom out, then zoom in" };
    if (step === "barracks" || step === "barracksBuilding") return { key: "barracks", index: 5, total: 7, type: "Barracks", target: TUTORIAL_BARRACKS_TARGET, icon: "▲", title: "BUILD 4 BARRACKS", detail: "Prepare the first Core Guards" };
    if (tutorialFlowPhase === "citadelUpgrade") return { key: "citadel", index: 7, total: 7, type: null, target: 1, icon: "⌂", title: "UPGRADE CITADEL TO LV2", detail: "Expand the city territory" };
    return null;
  }
  function getArenaTutorialMission() {
    if (screen !== "arena") return null;
    if (["zoomout","monsterPointer","monsterZoom","monsterZoomPause"].includes(mapTutorialPhase)) {
      const half = mapTutorialPhase === "zoomout" ? 0 : 1;
      return { index:3,total:7,icon:"⌖",title:"MASTER WORLD CAMERA",detail:mapTutorialPhase === "zoomout" ? "ZOOM OUT TO MAXIMUM" : "ZOOM IN ON THE MARKED TARGET",progress:half,target:2 };
    }
    if (["teleportButton","selectLanding","confirmLanding","teleporting"].includes(tutorialFlowPhase)) return { index:4,total:7,icon:"◎",title:"USE TELEPORT",detail:"Select the marked landing sector",progress:tutorialFlowPhase === "teleporting" ? 1 : 0,target:1 };
    if (["attackMonster","attackButton","attackLaunched","searchButton","searchTier","searchGo","searchMonster","searchAttackButton","searchAttackLaunched","levelProgress"].includes(tutorialFlowPhase)) return { index:6,total:7,icon:"⚔",title:"DEFEAT 4 MONSTERS",detail:tutorialKills < 2 ? "Follow the combat tutorial" : "Find and defeat the remaining targets",progress:tutorialKills,target:4 };
    return null;
  }
  function isTutorialConstructionWaiting() {
    return tutorialStep === "housesBuilding" || tutorialStep === "crystalsBuilding" || tutorialStep === "barracksBuilding";
  }

  function shouldShowBuildTutorialArrow() {
    if (devLabRef.current) return false;
    return (
      cityTutorialReady &&
      !tutorialMissionComplete &&
      screen === "city" &&
      (tutorialStep === "houses" || tutorialStep === "crystals" || tutorialStep === "barracks") &&
      !isTutorialConstructionWaiting() &&
      !buildMenuOpen &&
      !buildMode &&
      !buildPreview
    );
  }

  function shouldShowCrystalMenuHint() {
    if (devLabRef.current) return false;
    return buildMenuTutorialReady && screen === "city" && buildMenuOpen && tutorialStep === "crystals" && !isTutorialConstructionWaiting();
  }

  function shouldShowHouseMenuHint() {
    if (devLabRef.current) return false;
    return buildMenuTutorialReady && screen === "city" && buildMenuOpen && tutorialStep === "houses" && !isTutorialConstructionWaiting();
  }
  function shouldShowBarracksMenuHint() {
    if (devLabRef.current) return false;
    return buildMenuTutorialReady && screen === "city" && buildMenuOpen && tutorialStep === "barracks" && !isTutorialConstructionWaiting();
  }

  function shouldShowMapTutorialArrow() {
    if (devLabRef.current) return false;
    return (
      !tutorialMissionComplete &&
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
    if (!citadel) return snapCityPointToGrid({ x: CITY_WIDTH / 2, y: CITY_HEIGHT / 2 }, definition.w, definition.h);
    if (type === "House") return snapCityPointToGrid({ x: citadel.x + CITY_GRID_STEP, y: citadel.y + citadel.h * CITY_GRID_STEP }, definition.w, definition.h);
    if (type === "CrystalPoint") return snapCityPointToGrid({
      x: citadel.x - definition.w * CITY_GRID_STEP,
      y: citadel.y - definition.h * CITY_GRID_STEP,
    }, definition.w, definition.h);
    return snapCityPointToGrid({
      x: citadel.x + citadel.w * CITY_GRID_STEP,
      y: citadel.y - definition.h * CITY_GRID_STEP,
    }, definition.w, definition.h);
  }
  function resetArena() {
    worldRef.current = createWorld();
    CITY_WIDTH = CITY_LEVEL_ONE_SIZE;
    CITY_HEIGHT = CITY_LEVEL_ONE_SIZE;
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
    tutorialKillsRef.current = 0;
    setTutorialKills(0);
    tutorialFreeTargetIdsRef.current = [];
    if (tutorialFreeTargetTimerRef.current) clearTimeout(tutorialFreeTargetTimerRef.current);
    tutorialFreeTargetTimerRef.current = null;
    if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
    if (cityReturnPointerTimerRef.current) clearTimeout(cityReturnPointerTimerRef.current);
    levelUpTimerRef.current = null;
    cityReturnPointerTimerRef.current = null;
    setLevelUpCelebration(null);
    setCityReturnPointerReady(false);
    setCitadelPointerReady(false);
    setCitadelUpgradePointerReady(false);
    if (citadelPointerTimerRef.current) clearTimeout(citadelPointerTimerRef.current);
    if (citadelUpgradePointerTimerRef.current) clearTimeout(citadelUpgradePointerTimerRef.current);
    citadelPointerTimerRef.current = null;
    citadelUpgradePointerTimerRef.current = null;
    mapTutorialZoomRef.current = { active: false, targetZoom: 0.3, mode: "tutorialMonster", targetX: null, targetY: null };
    mapTutorialGuideRef.current = { phase: "off", timer: 0, zoomStart: 0.3 };
    updateMapTutorialPhase("off");
    setMapTutorialTarget(null);
    setTutorialThreatCardVisible(false);
    setTutorialMissionComplete(null);
    if (postTeleportCityTimerRef.current) clearTimeout(postTeleportCityTimerRef.current);
    postTeleportCityTimerRef.current = null;
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
      path: [],
      pathType: null,
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

  function startDeveloperLab() {
    resetArena();
    devLabRef.current = true;
    setDevLab(true);
    tutorialFlowRef.current = { phase: "done", timer: 0 };
    setTutorialFlowPhase("done");
    mapTutorialSeenRef.current = true;
    updateMapTutorialPhase("off");
    setTrainingIntroPhase("off");
    setCityTutorialReady(false);
    setBuildMenuTutorialReady(false);
    tutorialConstructionRef.current = { housesCommitted: true, crystalsCommitted: true, barracksCommitted: true };
    setTutorialMissionComplete(null);
    setTutorialThreatCardVisible(false);

    const stats = cityStatsRef.current;
    stats.crystals = 5000;
    stats.workers = stats.workerCap;
    stats.guardsByLevel = { 1: 85 };
    stats.guardCap = Math.max(stats.guardCap, 100);
    stats.nextLevelXp = getNextLevelXp(stats.level);
    setCityStats({ ...stats });
    setHud({ level: stats.level, score: 0, cooldown: 0, teleportMode: false, status: "DEV LAB" });
    setScreen("city");
  }

  function getCitadelFootprint(level) {
    return 4 * Math.pow(2, getCityGeneration(level));
  }

  function rectanglesOverlap(a, b) {
    return !(
      a.x + a.w * CITY_GRID_STEP <= b.x ||
      a.x >= b.x + b.w * CITY_GRID_STEP ||
      a.y + a.h * CITY_GRID_STEP <= b.y ||
      a.y >= b.y + b.h * CITY_GRID_STEP
    );
  }

  function findNearestFreeCitySlot(building, blockedBuilding) {
    const originalGridX = Math.round(building.x / CITY_GRID_STEP);
    const originalGridY = Math.round(building.y / CITY_GRID_STEP);
    const maxGridX = Math.max(0, Math.floor(CITY_WIDTH / CITY_GRID_STEP) - building.w);
    const maxGridY = Math.max(0, Math.floor(CITY_HEIGHT / CITY_GRID_STEP) - building.h);
    const occupied = cityRef.current.buildings.filter((item) => item.id !== building.id && item.id !== blockedBuilding.id);

    for (let radius = 0; radius <= Math.max(maxGridX, maxGridY); radius += 1) {
      const candidates = [];
      for (let dx = -radius; dx <= radius; dx += 1) {
        candidates.push({ gx: originalGridX + dx, gy: originalGridY - radius });
        candidates.push({ gx: originalGridX + dx, gy: originalGridY + radius });
      }
      for (let dy = -radius + 1; dy < radius; dy += 1) {
        candidates.push({ gx: originalGridX - radius, gy: originalGridY + dy });
        candidates.push({ gx: originalGridX + radius, gy: originalGridY + dy });
      }
      for (const candidate of candidates) {
        if (candidate.gx < 0 || candidate.gy < 0 || candidate.gx > maxGridX || candidate.gy > maxGridY) continue;
        const preview = {
          ...building,
          x: candidate.gx * CITY_GRID_STEP,
          y: candidate.gy * CITY_GRID_STEP,
        };
        if (rectanglesOverlap(preview, blockedBuilding)) continue;
        if (occupied.some((item) => rectanglesOverlap(preview, item))) continue;
        return { x: preview.x, y: preview.y };
      }
    }
    return null;
  }

  function resizeCitadelForLevel(citadel, targetLevel) {
    const targetSize = getCitadelFootprint(targetLevel);
    if (!citadel || (citadel.w === targetSize && citadel.h === targetSize)) return [];

    const centerX = citadel.x + citadel.w * CITY_GRID_STEP / 2;
    const centerY = citadel.y + citadel.h * CITY_GRID_STEP / 2;
    const nextCitadel = {
      ...citadel,
      w: targetSize,
      h: targetSize,
      x: centerX - targetSize * CITY_GRID_STEP / 2,
      y: centerY - targetSize * CITY_GRID_STEP / 2,
    };
    const collisions = cityRef.current.buildings
      .filter((building) => building.id !== citadel.id && rectanglesOverlap(building, nextCitadel))
      .sort((left, right) => (right.w * right.h) - (left.w * left.h));
    const collisionIds = new Set(collisions.map((building) => building.id));
    const fixed = cityRef.current.buildings.filter((building) =>
      building.id !== citadel.id && !collisionIds.has(building.id)
    );
    const placed = [];
    const moved = [];
    const cityCellsX = Math.floor(CITY_WIDTH / CITY_GRID_STEP);
    const cityCellsY = Math.floor(CITY_HEIGHT / CITY_GRID_STEP);

    for (const building of collisions) {
      const originGX = Math.round(building.x / CITY_GRID_STEP);
      const originGY = Math.round(building.y / CITY_GRID_STEP);
      const maxRadius = Math.max(cityCellsX, cityCellsY);
      let destination = null;

      for (let radius = 0; radius <= maxRadius && !destination; radius += 1) {
        const candidates = [];
        for (let dx = -radius; dx <= radius; dx += 1) {
          candidates.push({ gx: originGX + dx, gy: originGY - radius });
          candidates.push({ gx: originGX + dx, gy: originGY + radius });
        }
        for (let dy = -radius + 1; dy < radius; dy += 1) {
          candidates.push({ gx: originGX - radius, gy: originGY + dy });
          candidates.push({ gx: originGX + radius, gy: originGY + dy });
        }
        for (const candidate of candidates) {
          if (candidate.gx < 0 || candidate.gy < 0 || candidate.gx + building.w > cityCellsX || candidate.gy + building.h > cityCellsY) continue;
          const preview = { ...building, x: candidate.gx * CITY_GRID_STEP, y: candidate.gy * CITY_GRID_STEP };
          if (rectanglesOverlap(preview, nextCitadel)) continue;
          if (fixed.some((item) => rectanglesOverlap(preview, item))) continue;
          if (placed.some((item) => rectanglesOverlap(preview, item))) continue;
          destination = preview;
          break;
        }
      }

      if (destination) {
        moved.push({ id: building.id, fromX: building.x, fromY: building.y, toX: destination.x, toY: destination.y });
        building.x = destination.x;
        building.y = destination.y;
        placed.push(building);
      }
    }

    citadel.w = nextCitadel.w;
    citadel.h = nextCitadel.h;
    citadel.x = nextCitadel.x;
    citadel.y = nextCitadel.y;
    citadel.citadelGeneration = Math.floor(Math.max(0, targetLevel - 1) / 5);
    return moved;
  }

  function getAutoFitFootprint(type, level) {
    const definition = BUILDINGS[type] || BUILDINGS.House;
    let w = definition.w;
    let h = definition.h;
    for (let current = 2; current <= level; current += 1) {
      const cycleStep = ((current - 2) % 5 + 5) % 5;
      if (cycleStep === 0) w *= 2;
      if (cycleStep === 1) h *= 2;
    }
    return { w, h };
  }

  function isAutoFitMergeLevel(level) {
    if (level < 2) return false;
    const cycleStep = ((level - 2) % 5 + 5) % 5;
    return cycleStep === 0 || cycleStep === 1;
  }

  function getBuildingRect(building) {
    return {
      left: building.x,
      top: building.y,
      right: building.x + building.w * CITY_GRID_STEP,
      bottom: building.y + building.h * CITY_GRID_STEP,
    };
  }

  function getRectUnion(a, b) {
    const ar = getBuildingRect(a);
    const br = getBuildingRect(b);
    return {
      left: Math.min(ar.left, br.left),
      top: Math.min(ar.top, br.top),
      right: Math.max(ar.right, br.right),
      bottom: Math.max(ar.bottom, br.bottom),
    };
  }

  function canMergeOnOccupiedCells(a, b, level) {
    if (a.w !== b.w || a.h !== b.h) return false;
    const ar = getBuildingRect(a);
    const br = getBuildingRect(b);
    const union = getRectUnion(a, b);
    const horizontalTouch = (Math.abs(ar.right - br.left) < 1 || Math.abs(br.right - ar.left) < 1) && ar.top === br.top && ar.bottom === br.bottom;
    const verticalTouch = (Math.abs(ar.bottom - br.top) < 1 || Math.abs(br.bottom - ar.top) < 1) && ar.left === br.left && ar.right === br.right;
    const occupiedArea = a.w * a.h + b.w * b.h;
    const unionArea = ((union.right - union.left) / CITY_GRID_STEP) * ((union.bottom - union.top) / CITY_GRID_STEP);
    if (Math.abs(occupiedArea - unionArea) >= 0.001) return false;

    // Level 2 preserves the successful v81 behavior: any genuinely adjacent
    // pair merges in the direction in which the original cells already stand.
    if (level === 2) return horizontalTouch || verticalTouch;

    // From level 3 onward two strips must join across their long side:
    // vertical + vertical => side by side; horizontal + horizontal => stacked.
    if (a.h > a.w) return horizontalTouch;
    if (a.w > a.h) return verticalTouch;
    return horizontalTouch || verticalTouch;
  }

  function rectIsFree(x, y, w, h, ignoredIds = new Set()) {
    const right = x + w * CITY_GRID_STEP;
    const bottom = y + h * CITY_GRID_STEP;
    if (x < 0 || y < 0 || right > CITY_WIDTH || bottom > CITY_HEIGHT) return false;
    return !cityRef.current.buildings.some((other) => {
      if (ignoredIds.has(other.id)) return false;
      const otherRight = other.x + other.w * CITY_GRID_STEP;
      const otherBottom = other.y + other.h * CITY_GRID_STEP;
      return !(right <= other.x || x >= otherRight || bottom <= other.y || y >= otherBottom);
    });
  }

  function getTwinCandidates(building, level) {
    if (level === 2) {
      return [
        { x: building.x + building.w * CITY_GRID_STEP, y: building.y },
        { x: building.x - building.w * CITY_GRID_STEP, y: building.y },
        { x: building.x, y: building.y + building.h * CITY_GRID_STEP },
        { x: building.x, y: building.y - building.h * CITY_GRID_STEP },
      ];
    }
    if (building.h > building.w) {
      return [
        { x: building.x + building.w * CITY_GRID_STEP, y: building.y },
        { x: building.x - building.w * CITY_GRID_STEP, y: building.y },
      ];
    }
    if (building.w > building.h) {
      return [
        { x: building.x, y: building.y + building.h * CITY_GRID_STEP },
        { x: building.x, y: building.y - building.h * CITY_GRID_STEP },
      ];
    }
    return [
      { x: building.x + building.w * CITY_GRID_STEP, y: building.y },
      { x: building.x - building.w * CITY_GRID_STEP, y: building.y },
      { x: building.x, y: building.y + building.h * CITY_GRID_STEP },
      { x: building.x, y: building.y - building.h * CITY_GRID_STEP },
    ];
  }

  function makeTwinAt(building, placement, level) {
    return {
      ...building,
      id: `${building.id}-auto-twin-${level}`,
      x: placement.x,
      y: placement.y,
    };
  }

  function findSyntheticTwinPlacement(building, level, completedPairs = []) {
    const ignored = new Set([building.id]);
    const candidates = getTwinCandidates(building, level).filter((candidate) =>
      rectIsFree(candidate.x, candidate.y, building.w, building.h, ignored)
    );

    // For an odd level-1 remainder, prefer the missing cell that makes the new
    // double align with an already produced double and therefore form a clean
    // square on level 3. This handles the tutorial L-shaped three-house layout.
    if (level === 2 && completedPairs.length > 0) {
      const futureReady = candidates.find((candidate) => {
        const twin = makeTwinAt(building, candidate, level);
        const merged = mergeAutoFitPair({ ...building }, twin, level, true);
        return completedPairs.some((pair) => canMergeOnOccupiedCells(pair, merged, level + 1));
      });
      if (futureReady) return futureReady;
    }
    return candidates[0] || null;
  }

  function movePartnerNextToPrimary(primary, partner, level, completedPairs = []) {
    const ignored = new Set([primary.id, partner.id]);
    const candidates = getTwinCandidates(primary, level).filter((candidate) =>
      rectIsFree(candidate.x, candidate.y, primary.w, primary.h, ignored)
    );
    let placement = candidates[0] || null;
    if (level === 2 && completedPairs.length > 0) {
      placement = candidates.find((candidate) => {
        const moved = { ...partner, x: candidate.x, y: candidate.y, w: primary.w, h: primary.h };
        const merged = mergeAutoFitPair({ ...primary }, moved, level, false);
        return completedPairs.some((pair) => canMergeOnOccupiedCells(pair, merged, level + 1));
      }) || placement;
    }
    if (!placement) return false;
    partner.x = placement.x;
    partner.y = placement.y;
    partner.w = primary.w;
    partner.h = primary.h;
    return true;
  }

  function mergeAutoFitPair(primary, partner, targetLevel, syntheticTwin = false) {
    const union = getRectUnion(primary, partner);
    primary.x = union.left;
    primary.y = union.top;
    primary.w = Math.round((union.right - union.left) / CITY_GRID_STEP);
    primary.h = Math.round((union.bottom - union.top) / CITY_GRID_STEP);
    primary.level = targetLevel;
    primary.mergedModules = (primary.mergedModules || 1) + (partner.mergedModules || 1);
    primary.autoFitGeneration = Math.floor((targetLevel - 1) / 5);
    primary.syntheticTwin = syntheticTwin;
    primary.underConstruction = false;
    primary.upgrading = false;
    primary.pendingLevel = null;
    return primary;
  }

  function findFreePairPlacement(primary, partner, level) {
    const ignoredIds = new Set([primary.id, partner.id]);
    const occupied = cityRef.current.buildings.filter((item) => !ignoredIds.has(item.id));
    const cityCellsX = Math.floor(CITY_WIDTH / CITY_GRID_STEP);
    const cityCellsY = Math.floor(CITY_HEIGHT / CITY_GRID_STEP);
    const originGX = Math.round(primary.x / CITY_GRID_STEP);
    const originGY = Math.round(primary.y / CITY_GRID_STEP);

    for (let radius = 0; radius <= Math.max(cityCellsX, cityCellsY); radius += 1) {
      for (let gy = Math.max(0, originGY - radius); gy <= Math.min(cityCellsY - primary.h, originGY + radius); gy += 1) {
        for (let gx = Math.max(0, originGX - radius); gx <= Math.min(cityCellsX - primary.w, originGX + radius); gx += 1) {
          if (Math.max(Math.abs(gx - originGX), Math.abs(gy - originGY)) !== radius) continue;
          const base = { ...primary, x: gx * CITY_GRID_STEP, y: gy * CITY_GRID_STEP };
          for (const twin of getTwinCandidates(base, level)) {
            const candidatePartner = { ...partner, x: twin.x, y: twin.y, w: primary.w, h: primary.h };
            const bothInside = candidatePartner.x >= 0 && candidatePartner.y >= 0 &&
              candidatePartner.x + candidatePartner.w * CITY_GRID_STEP <= CITY_WIDTH &&
              candidatePartner.y + candidatePartner.h * CITY_GRID_STEP <= CITY_HEIGHT;
            if (!bothInside) continue;
            if (occupied.some((item) => rectanglesOverlap(base, item) || rectanglesOverlap(candidatePartner, item))) continue;
            return { primary: base, partner: candidatePartner };
          }
        }
      }
    }
    return null;
  }

  function pickCellAccuratePartner(pool, index, used, level, completedPairs) {
    for (let candidate = index + 1; candidate < pool.length; candidate += 1) {
      if (!used.has(candidate) && canMergeOnOccupiedCells(pool[index], pool[candidate], level)) return candidate;
    }
    let nearest = -1;
    let nearestDistance = Infinity;
    for (let candidate = index + 1; candidate < pool.length; candidate += 1) {
      if (used.has(candidate)) continue;
      const distance = Math.hypot(pool[index].x - pool[candidate].x, pool[index].y - pool[candidate].y);
      if (distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    }
    if (nearest >= 0 && movePartnerNextToPrimary(pool[index], pool[nearest], level, completedPairs)) return nearest;
    return -1;
  }

  function autoFitDeveloperCity(previousLevel, targetLevel) {
    const source = cityRef.current.buildings;
    const citadel = source.find((building) => building.type === "Citadel");
    const result = citadel ? [citadel] : [];
    const report = [];
    const processedTypes = new Set();

    const allOtherBuildings = (activeType) => source.filter((building) =>
      building.type !== "Citadel" && building.type !== activeType && !processedTypes.has(building.type)
    );

    const findVirtualPairLayout = (primary, partner, level, occupied) => {
      const cityCellsX = Math.floor(CITY_WIDTH / CITY_GRID_STEP);
      const cityCellsY = Math.floor(CITY_HEIGHT / CITY_GRID_STEP);
      const originGX = Math.max(0, Math.round(primary.x / CITY_GRID_STEP));
      const originGY = Math.max(0, Math.round(primary.y / CITY_GRID_STEP));
      const maxRadius = Math.max(cityCellsX, cityCellsY);
      for (let radius = 0; radius <= maxRadius; radius += 1) {
        const minGX = Math.max(0, originGX - radius);
        const maxGX = Math.min(cityCellsX - primary.w, originGX + radius);
        const minGY = Math.max(0, originGY - radius);
        const maxGY = Math.min(cityCellsY - primary.h, originGY + radius);
        for (let gy = minGY; gy <= maxGY; gy += 1) {
          for (let gx = minGX; gx <= maxGX; gx += 1) {
            if (Math.max(Math.abs(gx - originGX), Math.abs(gy - originGY)) !== radius) continue;
            const first = { ...primary, x: gx * CITY_GRID_STEP, y: gy * CITY_GRID_STEP };
            for (const twinPosition of getTwinCandidates(first, level)) {
              const second = { ...partner, x: twinPosition.x, y: twinPosition.y, w: first.w, h: first.h };
              const inside = second.x >= 0 && second.y >= 0 &&
                second.x + second.w * CITY_GRID_STEP <= CITY_WIDTH &&
                second.y + second.h * CITY_GRID_STEP <= CITY_HEIGHT;
              if (!inside) continue;
              if (citadel && (rectanglesOverlap(first, citadel) || rectanglesOverlap(second, citadel))) continue;
              if (occupied.some((item) => rectanglesOverlap(first, item) || rectanglesOverlap(second, item))) continue;
              return { first, second };
            }
          }
        }
      }
      return null;
    };

    for (const type of ["House", "CrystalPoint", "Barracks"]) {
      let pool = source
        .filter((building) => building.type === type)
        .map((building) => ({
          ...building,
          level: previousLevel,
          mergedModules: building.mergedModules || 1,
          underConstruction: false,
          upgrading: false,
          pendingLevel: null,
        }));
      const beforeCount = pool.length;
      let synthetic = 0;
      let moved = 0;

      for (let level = previousLevel + 1; level <= targetLevel; level += 1) {
        if (!isAutoFitMergeLevel(level)) {
          pool = pool.map((building) => ({ ...building, level, autoFitGeneration: getCityGeneration(level) }));
          continue;
        }

        const nextPool = [];
        const used = new Set();
        const fixedOccupancy = [
          ...(citadel ? [citadel] : []),
          ...result.filter((building) => building.type !== type && building.type !== "Citadel"),
          ...allOtherBuildings(type),
        ];
        pool.sort((left, right) => left.y - right.y || left.x - right.x);

        // First lock every valid adjacent pair of this building type.
        for (let index = 0; index < pool.length; index += 1) {
          if (used.has(index)) continue;
          for (let candidate = index + 1; candidate < pool.length; candidate += 1) {
            if (used.has(candidate)) continue;
            if (!canMergeOnOccupiedCells(pool[index], pool[candidate], level)) continue;
            used.add(index);
            used.add(candidate);
            nextPool.push(mergeAutoFitPair(pool[index], pool[candidate], level, false));
            break;
          }
        }

        // Then pair every remaining object, independently for each type.
        const leftovers = pool.filter((_, index) => !used.has(index));
        for (let index = 0; index < leftovers.length; index += 2) {
          const primary = leftovers[index];
          let partner = leftovers[index + 1] || null;
          let syntheticTwin = false;
          if (!partner) {
            partner = {
              ...primary,
              id: `${primary.id}-auto-twin-${level}-${type}`,
            };
            synthetic += 1;
            syntheticTwin = true;
          }
          const occupied = [...fixedOccupancy, ...nextPool];
          const layout = findVirtualPairLayout(primary, partner, level, occupied);
          if (!layout) {
            // The world formula guarantees capacity; keep a diagnostic debt only
            // if a future custom building blocks every mathematically valid slot.
            primary.level = level;
            primary.reconstructionDebt = true;
            nextPool.push(primary);
            continue;
          }
          if (layout.first.x !== primary.x || layout.first.y !== primary.y ||
              layout.second.x !== partner.x || layout.second.y !== partner.y) moved += syntheticTwin ? 1 : 2;
          primary.x = layout.first.x;
          primary.y = layout.first.y;
          partner.x = layout.second.x;
          partner.y = layout.second.y;
          partner.w = primary.w;
          partner.h = primary.h;
          const merged = mergeAutoFitPair(primary, partner, level, syntheticTwin);
          merged.reconstructionDebt = false;
          nextPool.push(merged);
        }
        pool = nextPool;
      }

      result.push(...pool);
      processedTypes.add(type);
      if (beforeCount > 0) {
        report.push({ type, before: beforeCount, complexes: pool.length, reserve: 0, synthetic, moved });
      }
    }

    cityRef.current = { ...cityRef.current, buildings: result };
    constructionQueueRef.current = [];
    updateSelectedBuilding(null);
    clearGroupSelection();
    recalculateCityEconomy();
    return report;
  }

  function showDeveloperRebuildReport(targetLevel, report) {
    setDevRebuildReport({ level: targetLevel, items: report });
    if (devRebuildTimerRef.current) clearTimeout(devRebuildTimerRef.current);
    devRebuildTimerRef.current = setTimeout(() => {
      setDevRebuildReport(null);
      devRebuildTimerRef.current = null;
    }, 2400);
  }

  function resizeDeveloperCityWorld(targetLevel) {
    const desiredSize = getCitySizeForLevel(targetLevel);
    const delta = desiredSize - CITY_WIDTH;
    const shift = delta / 2;
    for (const building of cityRef.current.buildings) {
      building.x += shift;
      building.y += shift;
    }
    CITY_WIDTH = desiredSize;
    CITY_HEIGHT = desiredSize;
  }

  function setDeveloperLevel(nextLevel) {
    if (!devLabRef.current) return;
    const target = clamp(Math.round(nextLevel), 1, MAX_BUILDING_LEVEL);
    const stats = cityStatsRef.current;
    const previousLevel = stats.level;
    const citadel = getCitadelBuilding();
    if (!citadel || target === previousLevel) return;

    resizeDeveloperCityWorld(target);

    const citadelMoves = resizeCitadelForLevel(citadel, target);

    stats.level = target;
    stats.xp = 0;
    stats.nextLevelXp = getNextLevelXp(target);
    stats.guardCap = Math.max(stats.guardCap, 20 + target * 5);
    citadel.level = target;
    citadel.pendingLevel = null;
    citadel.upgrading = false;
    citadel.underConstruction = false;
    constructionQueueRef.current = constructionQueueRef.current.filter((id) => id !== citadel.id);
    const rebuildReport = target > previousLevel ? autoFitDeveloperCity(previousLevel, target) : [];
    if (citadelMoves.length > 0) {
      rebuildReport.unshift({ type: "Citadel ring", before: citadelMoves.length, complexes: citadelMoves.length, reserve: 0, synthetic: 0, moved: citadelMoves.length });
    }
    if (rebuildReport.length > 0) showDeveloperRebuildReport(target, rebuildReport);
    if (playerRef.current) playerRef.current.level = target;
    cityCameraRef.current.x = CITY_WIDTH / 2;
    cityCameraRef.current.y = CITY_HEIGHT / 2;
    const cityCanvas = canvasRef.current;
    cityCameraRef.current.zoom = getCityFitMinZoom(cityCanvas, 140);
    clampCityCameraToWorld();
    forceBuildPreviewRender();
    cameraRef.current.zoom = clamp(cameraRef.current.zoom, MIN_ZOOM, MAX_ZOOM);
    setHud((current) => ({ ...current, level: target, status: `DEV LEVEL ${target}` }));
    setCityStats({ ...stats });
  }

  function addDeveloperResources() {
    if (!devLabRef.current) return;
    const stats = cityStatsRef.current;
    stats.crystals += 10000;
    stats.workers = stats.workerCap;
    stats.guardsByLevel[stats.level] = (stats.guardsByLevel[stats.level] || 0) + 100;
    stats.guardCap = Math.max(stats.guardCap, getTotalGuardsFromStats(stats));
    setCityStats({ ...stats });
  }

  function exitDeveloperLab() {
    devLabRef.current = false;
    setDevLab(false);
    setScreen("menu");
  }

  function beginTrainingStageOne() {
    devLabRef.current = false;
    setDevLab(false);
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
      const monster = findTutorialMonster();
      setTutorialMissionComplete({ icon:"✓", title:"OBJECTIVE COMPLETE", detail:"TELEPORT COMPLETE" });
      if (monster) {
        mapTutorialTargetRef.current = monster;
        setMapTutorialTarget({ ...monster });
        updateMapTutorialPhase("monsterPointerFinal");
      }
      setEnterCoreVisible(false);
      updateTutorialFlowPhase("inspectAfterTeleport");
      if (tutorialMissionTimerRef.current) clearTimeout(tutorialMissionTimerRef.current);
      tutorialMissionTimerRef.current = setTimeout(() => setTutorialMissionComplete(null), 1100);
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

    if (guide.phase === "zoomout") {
      if (camera.zoom <= MIN_ZOOM + 0.006) {
        const monster = findTutorialMonster();
        const player = playerRef.current;
        if (!monster || !player) {
          mapTutorialSeenRef.current = true;
          updateMapTutorialPhase("off");
          return;
        }
        camera.zoom = MIN_ZOOM;
        camera.x = (player.x + monster.x) / 2;
        camera.y = (player.y + monster.y) / 2;
        clampCameraToWorld();
        forceLandingPreviewRender();
        mapTutorialTargetRef.current = monster;
        setMapTutorialTarget({ ...monster });
        guide.zoomStart = camera.zoom;
        updateMapTutorialPhase("monsterPointer");
      }
      return;
    }

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
      const requiredZoom = MIN_ZOOM + (MAX_ZOOM - MIN_ZOOM) * 0.82;
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
      if (guide.timer >= 0.7) {
        mapTutorialSeenRef.current = true;
        mapTutorialTargetRef.current = null;
        setMapTutorialTarget(null);
        updateMapTutorialPhase("off");
        setTutorialMissionComplete({ icon:"✓", title:"OBJECTIVE COMPLETE", detail:"WORLD CAMERA ONLINE" });
        if (tutorialMissionTimerRef.current) clearTimeout(tutorialMissionTimerRef.current);
        tutorialMissionTimerRef.current = setTimeout(() => {
          setTutorialMissionComplete(null);
          updateTutorialFlowPhase("teleportButton");
        }, 1050);
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
          const wasUpgrade = Boolean(building.upgrading);
          if (wasUpgrade) completeBuildingUpgrade(building);
          const completedType = building.type;
          const completedCount = buildings.filter((item) => item.type === completedType && !item.underConstruction).length;
          const completedTarget = completedType === "House" ? TUTORIAL_HOUSE_TARGET : completedType === "CrystalPoint" ? TUTORIAL_CRYSTAL_TARGET : completedType === "Barracks" ? TUTORIAL_BARRACKS_TARGET : 0;
          if (!wasUpgrade && completedTarget > 0 && completedCount >= completedTarget && !tutorialMissionComplete) {
            const labels = { House: "HOUSING ONLINE", CrystalPoint: "CRYSTAL NETWORK ONLINE", Barracks: "DEFENSE GRID ONLINE" };
            setTutorialMissionComplete({ icon: "✓", title: "OBJECTIVE COMPLETE", detail: labels[completedType] });
            if (tutorialMissionTimerRef.current) clearTimeout(tutorialMissionTimerRef.current);
            setBuildMenuTutorialReady(false);
            tutorialMissionTimerRef.current = setTimeout(() => setTutorialMissionComplete(null), 1250);
          }

          if (building.type === "House") {
            const economy = getBuildingEconomy("House", building.level || 1);
            stats.workers = Math.min(stats.workerCap + economy.workerCapacity, stats.workers + economy.workerCapacity);
          }
          recalculateCityEconomy();
        }
      }
    }

    if (!Number.isFinite(stats.crystals)) {
      stats.crystals = 0;
    }

    stats.crystalRate = buildings
      .filter((building) => building.type === "CrystalPoint" && !building.underConstruction)
      .reduce((sum, building) => sum + getBuildingEconomy("CrystalPoint", building.level || 1).crystalRate, 0);

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

      const barracksEconomy = getBuildingEconomy("Barracks", buildingLevel);
      const productionTime = 1;
      building.trainTimer = (building.trainTimer || 0) + dt;

      if (building.trainTimer >= productionTime) {
        building.trainTimer -= productionTime;
        const exactBatch = barracksEconomy.barracksBatch + (building.trainCarry || 0);
        const requestedBatch = Math.max(1, Math.floor(exactBatch));
        building.trainCarry = exactBatch - requestedBatch;
        const availableCapacity = Math.max(0, stats.guardCap - getTotalOwnedGuards(stats, marchesRef.current));
        const affordableBatch = Math.floor(stats.crystals / GUARD_CRYSTAL_COST);
        const producedBatch = Math.min(requestedBatch, availableCapacity, affordableBatch);
        if (producedBatch > 0) {
          stats.crystals -= producedBatch * GUARD_CRYSTAL_COST;
          stats.guardsByLevel[buildingLevel] =
            (stats.guardsByLevel[buildingLevel] || 0) + producedBatch;
        }
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

    const completedBuildings = cityRef.current.buildings.filter((building) => !building.underConstruction);
    stats.crystalRate = completedBuildings
      .filter((building) => building.type === "CrystalPoint")
      .reduce((sum, building) => sum + getBuildingEconomy("CrystalPoint", building.level || 1).crystalRate, 0);

    const houseEconomy = completedBuildings
      .filter((building) => building.type === "House")
      .reduce((totals, building) => {
        const economy = getBuildingEconomy("House", building.level || 1);
        totals.workers += economy.workerCapacity;
        totals.guards += economy.guardCapacity;
        return totals;
      }, { workers: 0, guards: 0 });
    stats.workerCap = 5 + houseEconomy.workers;
    stats.workers = Math.min(stats.workers, stats.workerCap);
    const levelGuardBonus = Math.max(0, stats.level - 1) * 5 + (stats.level >= 5 ? 10 : 0) + (stats.level >= 10 ? 25 : 0) + (stats.level >= 20 ? 50 : 0);
    stats.guardCap = 10 + houseEconomy.guards + levelGuardBonus;

    setCityStats({ ...stats });
  }

  function applyLevelUpEffects() {
    const stats = cityStatsRef.current;
    stats.nextLevelXp = getNextLevelXp(stats.level);
    stats.guardCap += 5;
    if (stats.level >= 10) stats.maxAttackSplit = Math.min(10, Math.floor(stats.level / 10) + 1);
    if (stats.level === 5) stats.guardCap += 10;
    if (stats.level === 10) stats.guardCap += 25;
    if (stats.level === 20) stats.guardCap += 50;
  }
  function awardMonsterVictoryXp(monster) {
    const stats = cityStatsRef.current;
    const player = playerRef.current;
    const startingLevel = stats.level;
    let remainingEnemyUnits = Math.max(0, Number(monster.maxHp || monster.hp || 0));
    let totalAwarded = 0;
    while (remainingEnemyUnits > 0.000001 && stats.level < 100) {
      const required = getNextLevelXp(stats.level);
      const room = Math.max(0, required - stats.xp);
      const multiplier = getMonsterXpMultiplier(stats.level, monster.armor || 1);
      const consumedUnits = Math.min(remainingEnemyUnits, room / Math.max(0.000001, multiplier));
      const awardedNow = consumedUnits * multiplier;
      stats.xp += awardedNow;
      totalAwarded += awardedNow;
      remainingEnemyUnits -= consumedUnits;
      if (stats.xp + 0.000001 >= required) {
        stats.xp = Math.max(0, stats.xp - required);
        stats.level += 1;
        applyLevelUpEffects();
      } else break;
    }
    if (stats.level >= 100) stats.xp = 0;
    if (stats.level > startingLevel) {
      setLevelUpCelebration({ from: startingLevel, to: stats.level });
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
      levelUpTimerRef.current = setTimeout(() => {
        setLevelUpCelebration(null);
        levelUpTimerRef.current = null;
      }, 1650);
    }
    stats.nextLevelXp = getNextLevelXp(stats.level);
    if (player) { player.level = stats.level; player.score += totalAwarded; }
    setHud((current) => ({ ...current, level: stats.level, score: Math.round(player?.score || current.score), status: `+${totalAwarded.toFixed(2)} XP` }));
    setCityStats({ ...stats });
    return totalAwarded;
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

          stats.crystals += rewardCrystals;
          awardMonsterVictoryXp(monster);
          if (["attackLaunched","searchAttackLaunched","levelProgress"].includes(tutorialFlowRef.current.phase)) {
            tutorialKillsRef.current = Math.min(4, tutorialKillsRef.current + 1);
            setTutorialKills(tutorialKillsRef.current);
            if (tutorialKillsRef.current === 2) {
              const player = playerRef.current;
              const weakTargets = world.monsters
                .filter((item) => item.id !== monster.id && item.armor === 1 && item.hp > 0)
                .sort((a, b) => {
                  if (!player) return a.hp - b.hp;
                  return Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y);
                })
                .slice(0, 3);
              tutorialFreeTargetIdsRef.current = weakTargets.map((item) => item.id);
              setTutorialMissionComplete({
                icon: "⚔",
                title: "INDEPENDENT HUNT",
                detail: "FIND AND DEFEAT 2 MORE MONSTERS",
              });
              if (player) {
                mapTutorialZoomRef.current = {
                  active: true,
                  targetZoom: MIN_ZOOM,
                  mode: "freeOverview",
                  targetX: player.x,
                  targetY: player.y,
                };
                updateMapTutorialPhase("freeOverviewZoom");
              }
              if (tutorialMissionTimerRef.current) clearTimeout(tutorialMissionTimerRef.current);
              tutorialMissionTimerRef.current = setTimeout(() => setTutorialMissionComplete(null), 1800);
              if (tutorialFreeTargetTimerRef.current) clearTimeout(tutorialFreeTargetTimerRef.current);
              tutorialFreeTargetTimerRef.current = setTimeout(() => {
                tutorialFreeTargetIdsRef.current = [];
                tutorialFreeTargetTimerRef.current = null;
              }, 4200);
            }
            if (tutorialKillsRef.current >= 4) {
              setTutorialMissionComplete({ icon:"✓", title:"OBJECTIVE COMPLETE", detail:"4 MONSTERS DEFEATED" });
              setEnterCoreVisible(false);
              setCityReturnPointerReady(false);
              updateTutorialFlowPhase("citadelUpgrade");
              if (tutorialMissionTimerRef.current) clearTimeout(tutorialMissionTimerRef.current);
              tutorialMissionTimerRef.current = setTimeout(() => setTutorialMissionComplete(null), 1200);
              if (cityReturnPointerTimerRef.current) clearTimeout(cityReturnPointerTimerRef.current);
              cityReturnPointerTimerRef.current = setTimeout(() => {
                setCityReturnPointerReady(true);
                cityReturnPointerTimerRef.current = null;
              }, 2200);
            }
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
    return getBuildingEfficiency(nextLevel);
  }

  function getUpgradeCrystalCost(building) {
    if (!building || building.type === "Citadel") return 0;
    return getUpgradeEconomy(building.type, building.level || 1).crystalCost;
  }

  function getUpgradeWorkerCost(building) {
    if (!building || building.type === "Citadel") return 0;
    return getUpgradeEconomy(building.type, building.level || 1).workerCost;
  }

  function getUpgradeCostLabel(building) {
    if (!building) return "";
    if (building.type === "Citadel") return `LEVEL UP`;

    const crystalCost = getUpgradeCrystalCost(building);
    const workerCost = getUpgradeWorkerCost(building);

    if (workerCost > 0) return `👥${workerCost}`;
    return `💎${crystalCost}`;
  }

  function canUpgradeBuilding(building) {
    if (!building || building.underConstruction) return false;
    const currentLevel = building.level || 1;
    const nextLevel = currentLevel + 1;
    if (currentLevel >= MAX_BUILDING_LEVEL) return false;
    const citadelLevel = getCitadelBuilding()?.level || 1;
    if (building.type === "Citadel") return cityStatsRef.current.level >= nextLevel;
    if (citadelLevel < nextLevel) return false;

    const crystalCost = getUpgradeCrystalCost(building);
    const workerCost = getUpgradeWorkerCost(building);

    if (cityStatsRef.current.crystals < crystalCost) return false;
    if (cityStatsRef.current.workers < workerCost) return false;

    return true;
  }

  function completeBuildingUpgrade(building) {
    const stats = cityStatsRef.current;
    const oldLevel = building.level || 1;
    building.level = building.pendingLevel || oldLevel + 1;
    building.pendingLevel = null;
    building.upgrading = false;

    if (building.type === "Citadel") {
      const desiredSize = getCitySizeForLevel(building.level);
      const shift = (desiredSize - CITY_WIDTH) / 2;
      for (const cityBuilding of cityRef.current.buildings) {
        cityBuilding.x += shift;
        cityBuilding.y += shift;
      }
      CITY_WIDTH = desiredSize;
      CITY_HEIGHT = desiredSize;
      cityCameraRef.current.x = CITY_WIDTH / 2;
      cityCameraRef.current.y = CITY_HEIGHT / 2;
      const canvas = canvasRef.current;
      if (canvas) {
        const fitZoom = Math.min((canvas.clientWidth - 34) / CITY_WIDTH, (canvas.clientHeight - 154) / CITY_HEIGHT);
        cityCameraRef.current.zoom = clamp(fitZoom, CITY_MIN_ZOOM, CITY_MAX_ZOOM);
      }
      clampCityCameraToWorld();
      if (tutorialFlowRef.current.phase === "citadelUpgrade" && building.level >= 2) {
        setTutorialMissionComplete({ icon:"✓", title:"TRAINING COMPLETE", detail:"CORE FOUNDATION ONLINE" });
        updateTutorialFlowPhase("done");
      }
    }

    if (building.type === "House") {
      const before = getBuildingEconomy("House", oldLevel);
      const after = getBuildingEconomy("House", building.level);
      stats.workers += Math.max(0, after.workerCapacity - before.workerCapacity);
    }
    recalculateCityEconomy();
  }

  function upgradeSelectedBuilding() {
    const selected = selectedBuildingRef.current;
    if (!selected) return;
    const building = cityRef.current.buildings.find((item) => item.id === selected.id);
    if (!building || !canUpgradeBuilding(building)) return;

    const stats = cityStatsRef.current;
    stats.crystals = Math.max(0, stats.crystals - getUpgradeCrystalCost(building));
    stats.workers = Math.max(0, stats.workers - getUpgradeWorkerCost(building));

    building.pendingLevel = (building.level || 1) + 1;
    building.upgrading = true;
    building.underConstruction = true;
    building.buildElapsed = 0;
    building.buildDuration = getUpgradeEconomy(building.type, building.level || 1).upgradeTime;
    if (!constructionQueueRef.current.includes(building.id)) constructionQueueRef.current.push(building.id);

    updateSelectedBuilding(null);
    setCitadelUpgradePointerReady(false);
    recalculateCityEconomy();
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
    drawMonsters(ctx, world.monsters, selectedMonsterRef.current?.id, tutorialFreeTargetIdsRef.current);
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
    drawCityGrid(ctx, cityStatsRef.current.level);
    drawCityBorder(ctx);
    globalThis.__macroSwarmCityStatsVisual = cityStatsRef.current;
    const upgradePlan = groupDialogRef.current?.type === "upgrade" ? groupDialogRef.current.plan : null;
    drawCityBuildings(ctx, cityRef.current.buildings, selectedBuildingRef.current?.id, groupSelectionRef.current, upgradePlan);
    drawGroupSelection(ctx, groupSelectionRef.current);

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
    if (devLabRef.current) return [];
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

  function cityScreenToWorldRaw(clientX, clientY) {
    const canvas = canvasRef.current;
    const camera = cityCameraRef.current;

    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;

    return {
      x: (sx - canvas.clientWidth / 2) / camera.zoom + camera.x,
      y: (sy - canvas.clientHeight / 2) / camera.zoom + camera.y,
    };
  }

  function isInsideCityTerritory(point) {
    return point.x >= 0 && point.x <= CITY_WIDTH && point.y >= 0 && point.y <= CITY_HEIGHT;
  }

  function cityScreenToWorld(clientX, clientY) {
    const raw = cityScreenToWorldRaw(clientX, clientY);
    return {
      x: clamp(raw.x, 0, CITY_WIDTH),
      y: clamp(raw.y, 0, CITY_HEIGHT),
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
      // Give the city screen one calm second before pointing at construction.
      if (cityTutorialTimerRef.current) clearTimeout(cityTutorialTimerRef.current);
      setCityTutorialReady(false);
      cityTutorialTimerRef.current = setTimeout(() => {
        setCityTutorialReady(true);
        cityTutorialTimerRef.current = null;
      }, 1000);
      updateTutorialFlowPhase("cityBarracks");
    } else if (tutorialFlowRef.current.phase === "citadelUpgrade") {
      updateSelectedBuilding(null);
      setCitadelPointerReady(false);
      if (citadelPointerTimerRef.current) clearTimeout(citadelPointerTimerRef.current);
      citadelPointerTimerRef.current = setTimeout(() => {
        setCitadelPointerReady(true);
        citadelPointerTimerRef.current = null;
      }, 1000);
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
    cityCameraRef.current.zoom = devLabRef.current
      ? getCityFitMinZoom(canvasRef.current, 140)
      : CITY_MIN_ZOOM;
    clampCityCameraToWorld();
    recalculateCityEconomy();
    setScreen("city");
  }

  function backToMap() {
    setUtilityMenuOpen(false); setMonsterSearchOpen(false);
    if (tutorialStep === "map") {
      mapTutorialZoomRef.current = { active: false, targetZoom: MIN_ZOOM, mode: "tutorialMonster", targetX: null, targetY: null };
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
    clearGroupSelection();
    recalculateCityEconomy();
    setScreen("arena");
  }

  function centerCityCamera() {
    cityCameraRef.current.x = CITY_WIDTH / 2;
    cityCameraRef.current.y = CITY_HEIGHT / 2;
    cityCameraRef.current.zoom = devLabRef.current
      ? getCityFitMinZoom(canvasRef.current, 140)
      : CITY_MIN_ZOOM;
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
        setBuildMenuTutorialReady(false);
        if (!devLabRef.current) {
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
    if (devLabRef.current) return false;
    return tutorialStep === "houses" || tutorialStep === "crystals" || tutorialStep === "barracks";
  }
  function isTutorialBuildingAllowed(type) {
    if (devLabRef.current) return true;
    return !isTutorialBuildStep() || tutorialDragType === type;
  }
  function isPointInsideTutorialDropTarget(type, clientX, clientY) {
    if (devLabRef.current) return true;
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
    CITY_WIDTH = CITY_LEVEL_ONE_SIZE;
    CITY_HEIGHT = CITY_LEVEL_ONE_SIZE;
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

  function getCurrentBuildFootprints(type) {
    const definition = BUILDINGS[type] || BUILDINGS.Barracks;
    if (cityStatsRef.current.level <= 1) {
      return [{ w: definition.w, h: definition.h }];
    }
    const footprint = getAutoFitFootprint(type, cityStatsRef.current.level);
    const variants = [{ w: footprint.w, h: footprint.h }];
    if (footprint.w !== footprint.h) variants.push({ w: footprint.h, h: footprint.w });
    return variants;
  }

  function makeBuildPreviewWithFootprint(snapped, type, footprint) {
    const definition = BUILDINGS[type] || BUILDINGS.Barracks;
    const buildLevel = cityStatsRef.current.level;
    const economy = getBuildingEconomy(type, buildLevel);
    const preview = {
      type: definition.type,
      x: snapped.x,
      y: snapped.y,
      w: footprint.w,
      h: footprint.h,
      cost: economy.crystalCost,
      workerCost: economy.workerCost,
      valid: true,
      affordable: true,
    };
    preview.valid = canPlaceBuilding(preview);
    return preview;
  }

  function makeBuildPreviewFromPoint(point) {
    const type = selectedBuildingTypeRef.current || "Barracks";
    const variants = getCurrentBuildFootprints(type);
    const candidates = variants.map((footprint) => {
      const snapped = snapCityPointToGrid(point, footprint.w, footprint.h);
      return makeBuildPreviewWithFootprint(snapped, type, footprint);
    });
    return candidates.find((preview) => preview.valid) || candidates[0];
  }

  function makeBuildPreviewFromGrid(snapped, type, forcedFootprint = null) {
    const footprint = forcedFootprint || getCurrentBuildFootprints(type)[0];
    const aligned = snapCityPointToGrid(snapped, footprint.w, footprint.h);
    return makeBuildPreviewWithFootprint(aligned, type, footprint);
  }

  function canPlaceBuilding(preview, buildings = cityRef.current.buildings, stats = cityStatsRef.current) {
    if (!preview) return false;

    const left = preview.x;
    const top = preview.y;
    const right = preview.x + preview.w * CITY_GRID_STEP;
    const bottom = preview.y + preview.h * CITY_GRID_STEP;

    if (!preview.movingBuildingId && stats.crystals < preview.cost) return false;
    if (!preview.movingBuildingId && stats.workers < (preview.workerCost || 0)) return false;

    if (left < 0 || top < 0 || right > CITY_WIDTH || bottom > CITY_HEIGHT) {
      return false;
    }

    for (const building of buildings) {
      if (preview.movingBuildingId && building.id === preview.movingBuildingId) continue;
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
    const batchFootprint = devLabRef.current ? { w: anchorPreview.w, h: anchorPreview.h } : { w: definition.w, h: definition.h };
    const target = snapCityPointToGrid(cityScreenToWorld(clientX, clientY), batchFootprint.w, batchFootprint.h);
    const stepX = batchFootprint.w * CITY_GRID_STEP;
    const stepY = batchFootprint.h * CITY_GRID_STEP;
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
    // In free mode the batch follows the route actually traced by the finger.
    // The tutorial keeps its deliberate fixed routes above.
    const state = massBuildRef.current;
    const snappedTarget = {
      x: anchorPreview.x + Math.round((target.x - anchorPreview.x) / Math.max(1, stepX)) * stepX,
      y: anchorPreview.y + Math.round((target.y - anchorPreview.y) / Math.max(1, stepY)) * stepY,
    };
    if (!Array.isArray(state.path) || state.pathType !== type || state.path.length === 0) {
      state.path = [{ x: anchorPreview.x, y: anchorPreview.y }];
      state.pathType = type;
    }
    const sameCell = (a, b) => a.x === b.x && a.y === b.y;
    const appendOrBacktrack = (cell) => {
      const existingIndex = state.path.findIndex((item) => sameCell(item, cell));
      if (existingIndex >= 0) state.path = state.path.slice(0, existingIndex + 1);
      else state.path.push(cell);
    };
    let current = state.path[state.path.length - 1];
    let guard = 0;
    while (!sameCell(current, snappedTarget) && guard < 80) {
      guard += 1;
      const remainingX = snappedTarget.x - current.x;
      const remainingY = snappedTarget.y - current.y;
      const moveX = Math.abs(remainingX) > Math.abs(remainingY);
      const next = moveX
        ? { x: current.x + Math.sign(remainingX) * stepX, y: current.y }
        : { x: current.x, y: current.y + Math.sign(remainingY) * stepY };
      appendOrBacktrack(next);
      current = state.path[state.path.length - 1];
    }
    return makeValidatedBuildBatch(type, state.path, batchFootprint);
  }

  function makeValidatedBuildBatch(type, cells, forcedFootprint = null) {
    const definition = BUILDINGS[type] || BUILDINGS.Barracks;
    const footprint = forcedFootprint || { w: definition.w, h: definition.h };
    const virtualBuildings = [...cityRef.current.buildings];
    const budget = {
      crystals: cityStatsRef.current.crystals,
      workers: cityStatsRef.current.workers,
    };

    return cells.map((cell) => {
      const snapped = snapCityPointToGrid(cell, footprint.w, footprint.h);
      const preview = makeBuildPreviewFromGrid(snapped, type, footprint);

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

  function isFreeCityEditMode() {
    return devLabRef.current || (!isTutorialBuildStep() && tutorialFlowRef.current.phase === "levelProgress");
  }
  function beginMovingBuilding(building) {
    if (!isFreeCityEditMode() || !building || building.type === "Citadel") return;
    movingBuildingRef.current = building;
    setMovingBuilding({ ...building });
    setSelectedBuildingType(building.type);
    setBuildMode(true);
    setBuildMenuOpen(false);
    updateSelectedBuilding(null);
    const preview = makeBuildPreviewFromGrid(
      { x: building.x, y: building.y },
      building.type,
      { w: building.w, h: building.h }
    );
    preview.movingBuildingId = building.id;
    preview.cost = 0;
    preview.workerCost = 0;
    preview.valid = true;
    updateBuildPreview(preview);
  }
  function makeMovingPreview(point) {
    const building = movingBuildingRef.current;
    if (!building) return null;
    const snapped = snapCityPointToGrid(point, building.w, building.h);
    const preview = makeBuildPreviewFromGrid(snapped, building.type, { w: building.w, h: building.h });
    preview.movingBuildingId = building.id;
    preview.cost = 0;
    preview.workerCost = 0;
    preview.valid = canPlaceBuilding(preview);
    return preview;
  }
  function canRotateBuilding(building) {
    if (!building || building.type === "Citadel" || building.w === building.h) return false;
    const rotated = {
      type: building.type,
      x: building.x,
      y: building.y,
      w: building.h,
      h: building.w,
      cost: 0,
      workerCost: 0,
      movingBuildingId: building.id,
    };
    return canPlaceBuilding(rotated);
  }

  function rotateSelectedBuilding() {
    const selected = selectedBuildingRef.current;
    if (!selected || !canRotateBuilding(selected)) return;
    const building = cityRef.current.buildings.find((item) => item.id === selected.id);
    if (!building) return;
    const previousWidth = building.w;
    building.w = building.h;
    building.h = previousWidth;
    updateSelectedBuilding(building);
    forceBuildPreviewRender();
  }

  function finishMovingBuilding() {
    const moving = movingBuildingRef.current;
    const preview = buildPreviewRef.current;
    if (!moving || !preview || !preview.valid) return;
    const building = cityRef.current.buildings.find((item) => item.id === moving.id);
    if (!building) return;
    building.x = preview.x;
    building.y = preview.y;
    movingBuildingRef.current = null;
    setMovingBuilding(null);
    setBuildMode(false);
    updateBuildPreview(null);
    setSelectedBuildingType(null);
    updateSelectedBuilding(building);
  }
  function deleteSelectedBuilding() {
    if (!isFreeCityEditMode()) return;
    const selected = selectedBuildingRef.current;
    if (!selected || selected.type === "Citadel") return;
    const building = cityRef.current.buildings.find((item) => item.id === selected.id);
    if (!building) return;
    const stats = cityStatsRef.current;
    if (!building.underConstruction) {
      if (building.type === "House") {
        const level = building.level || 1;
        stats.workerCap = Math.max(5, stats.workerCap - level * 5);
        stats.workers = Math.min(stats.workers, stats.workerCap);
        stats.guardCap = Math.max(10, stats.guardCap - level * 25);
      }
      if (building.type === "CrystalPoint") {
        stats.workers = Math.min(stats.workerCap, stats.workers + (building.level || 1) * BUILDINGS.CrystalPoint.workerCost);
      }
    } else if (building.type === "CrystalPoint") {
      stats.workers = Math.min(stats.workerCap, stats.workers + BUILDINGS.CrystalPoint.workerCost);
    }
    cityRef.current.buildings = cityRef.current.buildings.filter((item) => item.id !== building.id);
    constructionQueueRef.current = constructionQueueRef.current.filter((id) => id !== building.id);
    updateSelectedBuilding(null);
    recalculateCityEconomy();
    setCityStats({ ...stats });
  }
  function cancelBuildOrMove() {
    movingBuildingRef.current = null;
    setMovingBuilding(null);
    cancelBuildPreview();
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
      const buildLevel = cityStatsRef.current.level;
      const economy = getBuildingEconomy(preview.type, buildLevel);
      crystalCost += economy.crystalCost;
      workerCost += economy.workerCost;
      const buildDuration = economy.buildTime;
      const currentFootprint = { w: preview.w, h: preview.h };
      newBuildings.push({
        id: `${preview.type}-${Date.now()}-${Math.random()}`,
        type: preview.type,
        level: buildLevel,
        mergedModules: economy.modules,
        autoFitGeneration: devLabRef.current ? Math.floor((cityStatsRef.current.level - 1) / 5) : 0,
        trainTimer: 0,
        trainCarry: 0,
        x: preview.x,
        y: preview.y,
        w: currentFootprint.w,
        h: currentFootprint.h,
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

  function rotateCurrentBuildPreview() {
    if (!devLabRef.current) return;
    const anchor = buildPreviewRef.current;
    if (!anchor || anchor.w === anchor.h) return;
    const footprint = { w: anchor.h, h: anchor.w };
    const snapped = snapCityPointToGrid({ x: anchor.x, y: anchor.y }, footprint.w, footprint.h);
    const rotated = makeBuildPreviewFromGrid(snapped, anchor.type, footprint);
    updateBuildPreview(rotated);
    massBuildRef.current.path = [{ x: rotated.x, y: rotated.y }];
    massBuildRef.current.pathType = rotated.type;
  }

  function placeBuilding() {
    if (movingBuildingRef.current) {
      finishMovingBuilding();
      return;
    }
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
    if (movingBuildingRef.current) return;
    const preview = buildPreviewRef.current;

    if (!preview || !preview.valid) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);

    massBuildRef.current = {
      pointerId: event.pointerId,
      active: false,
      downX: event.clientX,
      downY: event.clientY,
      suppressClick: false,
      path: [{ x: preview.x, y: preview.y }],
      pathType: preview.type,
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
    massBuildRef.current.path = [];
    massBuildRef.current.pathType = null;
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
      const cameraTutorialLocksMonsters = [
        "zoomout",
        "monsterPointer",
        "monsterZoom",
        "monsterZoomPause",
      ].includes(mapTutorialGuideRef.current.phase);

      if (monster && cameraTutorialLocksMonsters) {
        // The marker is a zoom target during the camera lesson, not a tap target.
        updateSelectedMonster(null);
        setTutorialThreatCardVisible(false);
        setEnterCoreVisible(false);
        return;
      }

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
          // After the first teleport the monster is shown only to explain why
          // an army is needed. Do not return to the old teleport tutorial.
          // Keep the flow on enterCity so the next pointer leads to the city
          // button and then to construction of the four barracks.
          const postTeleportInspection = tutorialFlowRef.current.phase === "inspectAfterTeleport";
          if (postTeleportInspection) {
            if (postTeleportCityTimerRef.current) clearTimeout(postTeleportCityTimerRef.current);
            postTeleportCityTimerRef.current = setTimeout(() => {
              setEnterCoreVisible(true);
              updateTutorialFlowPhase("enterCity");
              postTeleportCityTimerRef.current = null;
            }, 1000);
          } else {
            updateTutorialFlowPhase(searchStage ? "searchAttackButton" : attackStage ? "attackButton" : "inspectMonster");
          }
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
    const downWorld = cityScreenToWorldRaw(event.clientX, event.clientY);
    const downInsideTerritory = isInsideCityTerritory(downWorld);
    const downBuilding = downInsideTerritory ? findCityBuildingAt(downWorld) : null;
    const group = groupSelectionRef.current;
    if (!buildModeRef.current && !buildPreviewRef.current && pointers.size === 1) {
      const insideGroup = group.active && group.bounds && downWorld.x >= group.bounds.left && downWorld.x <= group.bounds.right && downWorld.y >= group.bounds.top && downWorld.y <= group.bounds.bottom;
      groupGestureRef.current = { timer:null, pointerId:event.pointerId, downClientX:event.clientX, downClientY:event.clientY, downWorld, building:downBuilding, longPressed:false, dragging:false, moveOrigin:null, originalPositions:null };
      if (group.active && group.phase === "move" && insideGroup) {
        groupGestureRef.current.longPressed=true; groupGestureRef.current.moveOrigin=downWorld;
        groupGestureRef.current.originalPositions=getGroupBuildings().map((b)=>({id:b.id,x:b.x,y:b.y,w:b.w,h:b.h}));
      } else if (group.active && insideGroup) {
        groupGestureRef.current.longPressed=true;
      } else if (downBuilding && downBuilding.type !== "Citadel" && isFreeCityEditMode()) {
        groupGestureRef.current.timer=setTimeout(()=>{ groupGestureRef.current.longPressed=true; startGroupFromBuilding(downBuilding); }, 480);
      }
    }
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
      updateBuildPreview(movingBuildingRef.current ? makeMovingPreview(cityPoint) : makeBuildPreviewFromPoint(cityPoint));
      pointerState.dragging = true;
      return;
    }

    const gesture = groupGestureRef.current;
    if (gesture.pointerId === event.pointerId && gesture.longPressed && groupSelectionRef.current.active) {
      const point=cityScreenToWorld(event.clientX,event.clientY);
      const distance=Math.hypot(event.clientX-gesture.downClientX,event.clientY-gesture.downClientY);
      if(distance>7) gesture.dragging=true;
      if(groupSelectionRef.current.phase === "move" && gesture.moveOrigin && gesture.originalPositions){
        const dx=Math.round((point.x-gesture.moveOrigin.x)/CITY_GRID_STEP)*CITY_GRID_STEP;
        const dy=Math.round((point.y-gesture.moveOrigin.y)/CITY_GRID_STEP)*CITY_GRID_STEP;
        const next=gesture.originalPositions.map((p)=>({...p,x:p.x+dx,y:p.y+dy}));
        const valid=isGroupMoveValid(next);
        for(const pos of next){ const building=cityRef.current.buildings.find((b)=>b.id===pos.id); if(building){building.x=pos.x;building.y=pos.y;} }
        publishGroupSelection({...groupSelectionRef.current,bounds:boundsForBuildings(getGroupBuildings()),moveValid:valid});
      } else if(groupSelectionRef.current.phase === "armed" && gesture.dragging){
        const anchor = groupSelectionRef.current.anchor;
        const seedBounds = anchor && Number.isFinite(anchor.left)
          ? anchor
          : groupSelectionRef.current.bounds;
        if (seedBounds) {
          // Expand from the nearest edge of the originally selected building.
          // This keeps the seed building fully enclosed and makes all four drag
          // directions symmetrical: up, down, left and right.
          const selectionBounds = {
            left: point.x < seedBounds.left ? point.x : seedBounds.left,
            top: point.y < seedBounds.top ? point.y : seedBounds.top,
            right: point.x > seedBounds.right ? point.x : seedBounds.right,
            bottom: point.y > seedBounds.bottom ? point.y : seedBounds.bottom,
          };
          const picked = buildingsInsideRect(
            { x: selectionBounds.left, y: selectionBounds.top },
            { x: selectionBounds.right, y: selectionBounds.bottom }
          );
          const ids = picked.map((b) => b.id);
          publishGroupSelection({
            active: true,
            ids,
            bounds: selectionBounds,
            phase: "armed",
            anchor: seedBounds,
          });
        }
      }
      pointerState.dragging=true; return;
    }
    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (pointerState.lastPinchDistance > 0) {
        const ratio = distance / pointerState.lastPinchDistance;
        const camera = cityCameraRef.current;
        camera.zoom = clamp(camera.zoom * ratio, devLabRef.current ? getCityFitMinZoom(canvasRef.current, 140) : CITY_MIN_ZOOM, CITY_MAX_ZOOM);

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

    const gesture = groupGestureRef.current;
    if (gesture.pointerId === event.pointerId) {
      if (gesture.timer) clearTimeout(gesture.timer);
      if (gesture.longPressed) {
        if (groupSelectionRef.current.phase === "move") {
          if (groupSelectionRef.current.moveValid === false && gesture.originalPositions) {
            for(const pos of gesture.originalPositions){const b=cityRef.current.buildings.find((x)=>x.id===pos.id);if(b){b.x=pos.x;b.y=pos.y;}}
          }
          publishGroupSelection({...groupSelectionRef.current,phase:"armed",bounds:boundsForBuildings(getGroupBuildings()),moveValid:undefined});
        } else if (gesture.dragging) {
          publishGroupSelection({...groupSelectionRef.current,phase:"ready",bounds:boundsForBuildings(getGroupBuildings())});
        }
        groupGestureRef.current={timer:null,pointerId:null,downClientX:0,downClientY:0,downWorld:null,building:null,longPressed:false,dragging:false,moveOrigin:null,originalPositions:null};
        return;
      }
    }
    if (wasDraggingPreview) return;

    if (wasTap && (buildModeRef.current || buildPreviewRef.current)) {
      selectBuildPoint(event.clientX, event.clientY);
      return;
    }

    if (wasTap && !buildModeRef.current && !buildPreviewRef.current) {
      if (groupSelectionRef.current.active) return;
      const cityPoint = cityScreenToWorldRaw(event.clientX, event.clientY);
      if (!isInsideCityTerritory(cityPoint)) {
        updateSelectedBuilding(null);
        return;
      }
      const building = findCityBuildingAt(cityPoint);
      if (building && isFreeCityEditMode() && building.type !== "Citadel") {
        const now = Date.now();
        const previous = cityDoubleTapRef.current;
        if (previous.buildingId === building.id && now - previous.time <= 360) {
          cityDoubleTapRef.current = { buildingId: null, time: 0 };
          beginMovingBuilding(building);
          return;
        }
        cityDoubleTapRef.current = { buildingId: building.id, time: now };
      }
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

    camera.zoom = clamp(camera.zoom * ratio, devLabRef.current ? getCityFitMinZoom(canvasRef.current, 140) : CITY_MIN_ZOOM, CITY_MAX_ZOOM);
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

  function getDeveloperLabPanelStyle() {
    const canvas = canvasRef.current;
    if (!canvas || screen !== "city") return styles.devLabPanel;

    const panelWidth = 148;
    const panelHeight = 126;
    const edge = 10;
    const safeTop = 74;
    const safeBottom = 168;
    const camera = cityCameraRef.current;
    const mapWidth = CITY_WIDTH * camera.zoom;
    const mapHeight = CITY_HEIGHT * camera.zoom;
    const mapLeft = canvas.clientWidth / 2 - mapWidth / 2;
    const mapRight = canvas.clientWidth / 2 + mapWidth / 2;
    const mapTop = canvas.clientHeight / 2 - mapHeight / 2;
    const mapBottom = canvas.clientHeight / 2 + mapHeight / 2;
    const rightGap = canvas.clientWidth - mapRight;
    const leftGap = mapLeft;
    const topGap = mapTop - safeTop;
    const bottomGap = canvas.clientHeight - safeBottom - mapBottom;

    if (rightGap >= panelWidth + edge * 2) {
      return { ...styles.devLabPanel, left: Math.min(canvas.clientWidth - panelWidth - edge, mapRight + edge), right: "auto", top: Math.max(safeTop, mapTop) };
    }
    if (leftGap >= panelWidth + edge * 2) {
      return { ...styles.devLabPanel, left: Math.max(edge, mapLeft - panelWidth - edge), right: "auto", top: Math.max(safeTop, mapTop) };
    }
    if (topGap >= panelHeight + edge) {
      return { ...styles.devLabPanel, left: canvas.clientWidth - panelWidth - edge, right: "auto", top: Math.max(safeTop, mapTop - panelHeight - edge) };
    }
    if (bottomGap >= panelHeight + edge) {
      return { ...styles.devLabPanel, left: canvas.clientWidth - panelWidth - edge, right: "auto", top: mapBottom + edge };
    }
    return { ...styles.devLabPanel, left: canvas.clientWidth - panelWidth - edge, right: "auto", top: safeTop };
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
          @keyframes levelUpReveal { 0% { opacity:0; transform:scale(.72); } 38% { opacity:1; transform:scale(1.08); } 100% { opacity:1; transform:scale(1); } }
          @keyframes levelUpRayLeft { 0% { opacity:0; transform:scaleX(.05); } 45% { opacity:1; } 100% { opacity:0; transform:scaleX(1); } }
          @keyframes levelUpRayRight { 0% { opacity:0; transform:scaleX(.05); } 45% { opacity:1; } 100% { opacity:0; transform:scaleX(1); } }

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
          @keyframes buildingPanelSwap {
            0% { opacity: 0; transform: translateY(22px) scale(0.975); filter: blur(5px); }
            55% { opacity: 1; transform: translateY(-2px) scale(1.006); filter: blur(0); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
          @keyframes buildingPanelAccentSweep {
            0% { transform: translateX(-130%); opacity: 0; }
            28% { opacity: 0.9; }
            100% { transform: translateX(130%); opacity: 0; }
          }
          @keyframes tutorialMissionEnter { from { opacity:0; transform:translateY(-14px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
          @keyframes tutorialMissionComplete { 0% { opacity:0; transform:translate(-50%,-50%) scale(.78); } 55% { opacity:1; transform:translate(-50%,-50%) scale(1.05); } 100% { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        `}
      </style>

      {devLab && devRebuildReport && (screen === "arena" || screen === "city") && (
        <div style={styles.devRebuildReport}>
          <strong>AUTO FIT · LEVEL {devRebuildReport.level}</strong>
          {devRebuildReport.items.map((item) => (
            <small key={item.type}>{item.type}: {item.before} → {item.complexes} complexes{item.synthetic ? ` · +${item.synthetic} auto twins` : ""}{item.moved ? ` · ${item.moved} relocated` : ""}</small>
          ))}
        </div>
      )}
      {devLab && (screen === "arena" || screen === "city") && (
        <div style={getDeveloperLabPanelStyle()}>
          <div style={styles.devLabHeader}><span>DEV LAB</span><b>LV {cityStats.level}</b></div>
          <div style={styles.devLabControls}>
            <button onClick={() => setDeveloperLevel(cityStats.level - 1)} disabled={cityStats.level <= 1}>−</button>
            <button onClick={() => setDeveloperLevel(cityStats.level + 1)} disabled={cityStats.level >= MAX_BUILDING_LEVEL}>＋</button>
            <button onClick={addDeveloperResources}>∞</button>
            <button onClick={exitDeveloperLab}>×</button>
          </div>
          <small>{CITY_WIDTH / CITY_GRID_STEP}×{CITY_HEIGHT / CITY_GRID_STEP} CITY</small>
        </div>
      )}

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
              <button style={{ ...styles.menuActionButton, ...styles.devLabMenuButton }} onClick={startDeveloperLab}>
                <span style={styles.menuActionIcon}>▦</span><strong>DEV LAB</strong><small>FREE TEST SERVER</small>
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
            <div><p style={styles.kicker}>Operator Program</p><h2 style={styles.trainingTitle}>Training Route</h2></div>
            <div style={styles.trainingProgress}>0 / 5</div>
          </div>

          <div style={styles.trainingRouteViewport}>
            <div style={styles.trainingRouteLine} />
            {[
              ["01", "CORE", "FOUNDATION", "◉", true],
              ["02", "CORE", "DEVELOPMENT", "⌬", false],
              ["03", "FIRST", "EMULATOR", "▣", false],
              ["04", "MACRO", "SCENARIO", "⌁", false],
              ["05", "SWARM", "CONTROL", "✣", false],
            ].map(([number, top, bottom, icon, active], index) => (
              <div key={number} style={styles.trainingRouteStage}>
                <button
                  style={{
                    ...styles.trainingRouteNode,
                    ...(active ? styles.trainingRouteNodeActive : styles.trainingRouteNodeLocked),
                  }}
                  onClick={active ? beginTrainingStageOne : undefined}
                  disabled={!active}
                  title={`${top} ${bottom}`}
                >
                  <span style={styles.trainingRouteOrbit} />
                  <span style={styles.trainingRouteIcon}>{icon}</span>
                  <strong>{number}</strong>
                  {!active && <span style={styles.trainingRouteLock}>⌁</span>}
                </button>
                <small style={{ ...styles.trainingRouteLabel, ...(active ? styles.trainingRouteLabelActive : {}) }}>
                  {top}<br />{bottom}
                </small>
                {index < 4 && <span style={styles.trainingRouteArrow}>›</span>}
              </div>
            ))}
          </div>

          <div style={styles.trainingStageFocus}>
            <div style={styles.trainingStageFocusGlow} />
            <div style={styles.trainingStageFocusNumber}>01</div>
            <div style={styles.trainingStageFocusContent}>
              <p>ACTIVE STAGE</p>
              <h3>CORE FOUNDATION</h3>
              <span>Build the city, inspect the world map, test teleportation and complete the first combat route.</span>
            </div>
            <button style={styles.trainingStageLaunch} onClick={beginTrainingStageOne}>START ›</button>
          </div>

          <div style={styles.trainingLockedPreview}>
            <span>02</span>
            <div><strong>NEXT: CORE DEVELOPMENT</strong><small>Building upgrades, armor, penetration and technology systems.</small></div>
            <b>LOCKED</b>
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
                    {cityStats.xp < 10 && cityStats.xp % 1 !== 0 ? cityStats.xp.toFixed(2) : Math.floor(cityStats.xp)}/{getNextLevelXp(cityStats.level)}
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

              {levelUpCelebration && (
                <div style={styles.levelUpCelebration}>
                  <i style={styles.levelUpRayLeft} />
                  <div style={styles.levelUpText}>LEVEL UP <b>{levelUpCelebration.to}</b></div>
                  <i style={styles.levelUpRayRight} />
                </div>
              )}
              {!devLab && arenaTutorialMission && !tutorialMissionComplete && (
                <div style={styles.tutorialMissionCard}>
                  <div style={styles.tutorialMissionIcon}>{arenaTutorialMission.icon}</div>
                  <div style={styles.tutorialMissionBody}>
                    <div style={styles.tutorialMissionTop}><span>CORE FOUNDATION · {arenaTutorialMission.index}/{arenaTutorialMission.total}</span><b>{arenaTutorialMission.progress}/{arenaTutorialMission.target}</b></div>
                    <strong>{arenaTutorialMission.title}</strong><small>{arenaTutorialMission.detail}</small>
                    <div style={styles.tutorialMissionTrack}><i style={{...styles.tutorialMissionFill,width:`${(arenaTutorialMission.progress/arenaTutorialMission.target)*100}%`}} /></div>
                  </div>
                </div>
              )}
              {!devLab && tutorialMissionComplete && screen === "arena" && (
                <div style={styles.tutorialMissionCompleteToast}><span>{tutorialMissionComplete.icon}</span><div><strong>{tutorialMissionComplete.title}</strong><small>{tutorialMissionComplete.detail}</small></div></div>
              )}
              {false && (
                <div style={styles.mapZoomMissionCard}>
                  <span>{mapTutorialPhase === "zoomout" ? "↘↖" : "↗↙"}</span>
                  <div><small>WORLD CONTROL</small><strong>{mapTutorialPhase === "zoomout" ? "ZOOM OUT TO MAXIMUM" : "ZOOM IN ON THE TARGET"}</strong></div>
                  <b>{mapTutorialPhase === "zoomout" ? `${Math.round(((MAX_ZOOM-cameraRef.current.zoom)/(MAX_ZOOM-MIN_ZOOM))*100)}%` : `${Math.round(((cameraRef.current.zoom-MIN_ZOOM)/(MAX_ZOOM-MIN_ZOOM))*100)}%`}</b>
                </div>
              )}
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

              {enterCoreVisible && enterScreen && tutorialFlowPhase !== "enterCity" && tutorialFlowPhase !== "citadelUpgrade" && (
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
              {tutorialFlowPhase === "teleportButton" && tutorialTeleportPointerReady && (
                <div style={styles.tutorialTeleportPointer}><div style={styles.macroPointer}>☟︎</div></div>
              )}
              {tutorialFlowPhase === "selectLanding" && tutorialTeleportPointerReady && tutorialLandingTargetScreen && (
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
              {tutorialFlowPhase === "confirmLanding" && tutorialTeleportPointerReady && landingScreen && (
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
              {(tutorialFlowPhase === "enterCity" || (tutorialFlowPhase === "citadelUpgrade" && cityReturnPointerReady)) && (
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
                    {cityStats.xp < 10 && cityStats.xp % 1 !== 0 ? cityStats.xp.toFixed(2) : Math.floor(cityStats.xp)}/{getNextLevelXp(cityStats.level)}
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

              {!devLab && tutorialMission && cityTutorialReady && !tutorialMissionComplete && (
                <div style={styles.tutorialMissionCard}>
                  <div style={styles.tutorialMissionIcon}>{tutorialMission.icon}</div>
                  <div style={styles.tutorialMissionBody}>
                    <div style={styles.tutorialMissionTop}><span>CORE FOUNDATION · {tutorialMission.index}/{tutorialMission.total}</span><b>{tutorialMission.type ? `${tutorialMissionProgress}/${tutorialMission.target}` : "ACTIVE"}</b></div>
                    <strong>{tutorialMission.title}</strong>
                    <small>{isTutorialConstructionWaiting() ? "CONSTRUCTION IN PROGRESS" : tutorialMission.detail}</small>
                    <div style={styles.tutorialMissionTrack}><i style={{...styles.tutorialMissionFill,width:`${tutorialMission.type ? (tutorialMissionProgress/tutorialMission.target)*100 : 18}%`}} /></div>
                  </div>
                </div>
              )}
              {!devLab && tutorialMissionComplete && (
                <div style={styles.tutorialMissionCompleteToast}>
                  <span>{tutorialMissionComplete.icon}</span><div><strong>{tutorialMissionComplete.title}</strong><small>{tutorialMissionComplete.detail}</small></div>
                </div>
              )}
              {shouldShowBuildTutorialArrow() && (
                <div style={styles.tutorialBuildArrow}>
                  <div style={styles.macroPointer}>☟︎</div>
                </div>
              )}

              {buildMenuOpen && tutorialDragType && buildMenuTutorialReady && tutorialDragDropScreen && (
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
                    <button style={styles.cancelButton} onClick={cancelBuildOrMove}>×</button>
                    {devLab && buildControlPreview.w !== buildControlPreview.h && (
                      <button style={styles.buildRotateButton} onClick={rotateCurrentBuildPreview} title="Rotate">↻</button>
                    )}
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
              {tutorialFlowPhase === "citadelUpgrade" && citadelPointerReady && !selectedBuilding && citadelTutorialScreen && (
                <div style={{...styles.tutorialCitadelPointer,left:citadelTutorialScreen.x,top:citadelTutorialScreen.y}}>
                  <div style={styles.macroPointer}>☟︎</div>
                </div>
              )}
              {groupSelection.active && groupSelection.ids.length > 0 && (
                <div style={{...styles.buildingPanel,...styles.groupBuildingPanel}}>
                  <button style={styles.panelClose} onClick={clearGroupSelection}>×</button>
                  <div style={{...styles.panelIcon,...styles.groupPanelIcon}}>▦</div>
                  <div style={styles.panelInfo}><strong>GROUP · {groupSelection.ids.length}</strong><small>{groupSelection.phase === "armed" ? "Drag from selection to expand" : groupSelection.phase === "move" ? "Drag the selected area" : "Selected buildings"}</small></div>
                  <div style={styles.buildingActionGroup}>
                    <button style={styles.moveBuildingButton} onClick={armGroupMove} title="Move group">✥</button>
                    <button style={styles.upgradeButton} onClick={openGroupUpgrade} title="Upgrade group">⇧ CHECK</button>
                    <button style={styles.deleteBuildingButton} onClick={()=>publishGroupDialog({type:"delete"})} title="Delete group">⌫</button>
                  </div>
                </div>
              )}
              {groupDialog && (
                <div style={styles.groupDialogBackdrop}>
                  <div style={{...styles.groupDialog,...(groupDialog.type === "delete" ? styles.groupDialogDanger : {})}}>
                    <div style={styles.groupDialogIcon}>{groupDialog.type === "delete" ? "!" : "⇧"}</div>
                    <strong>{groupDialog.type === "delete" ? `DELETE ${groupSelection.ids.length} BUILDINGS?` : "GROUP UPGRADE"}</strong>
                    <small>{groupDialog.type === "delete" ? "This action cannot be undone." : `${(groupDialog.plan||[]).filter(x=>x.affordable).length} of ${groupSelection.ids.length} can be upgraded now.`}</small>
                    <div style={styles.groupDialogActions}><button onClick={()=>publishGroupDialog(null)}>CANCEL</button><button onClick={groupDialog.type === "delete" ? confirmGroupDelete : confirmGroupUpgrade}>{groupDialog.type === "delete" ? "DELETE" : "UPGRADE"}</button></div>
                  </div>
                </div>
              )}
              {!groupSelection.active && selectedBuilding && (
                <div
                  key={`${selectedBuilding.id}-${buildingPanelVersion}`}
                  style={{...styles.buildingPanel,...(selectedBuilding.type === "Citadel" ? styles.citadelBuildingPanel : {})}}
                >
                  <div style={styles.buildingPanelAccent} />
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
                            : `Territory ${CITY_WIDTH / CITY_GRID_STEP}×${CITY_HEIGHT / CITY_GRID_STEP}`}
                    </small>
                  </div>

                  {selectedBuilding.type === "Citadel" && (
                    <div style={styles.citadelUpgradeBenefits}>
                      <span>NEW TERRITORY RING <b>+2×2</b></span>
                      <span>UNLOCK PREVIEW <b>TECHNOLOGY CENTER</b></span>
                    </div>
                  )}
                  <div style={styles.buildingActionGroup}>
                    {selectedBuilding.type === "Citadel" ? (
                      <>
                        <div style={styles.citadelLevelGate}>★ {cityStats.level} / {Math.min(MAX_BUILDING_LEVEL, (selectedBuilding.level || 1) + 1)}</div>
                        <button style={{ ...styles.upgradeButton, ...(canUpgradeBuilding(selectedBuilding) ? {} : styles.upgradeButtonDisabled), position:"relative" }} disabled={!canUpgradeBuilding(selectedBuilding)} onClick={upgradeSelectedBuilding} title="Level up Citadel">
                          ⇧ {getUpgradeCostLabel(selectedBuilding)}
                          {tutorialFlowPhase === "citadelUpgrade" && citadelUpgradePointerReady && <span style={styles.upgradeButtonTutorialPointer}>☟︎</span>}
                        </button>
                        <div style={styles.citadelLevelGate}>MAX {cityStats.level}</div>
                      </>
                    ) : (
                      <>
                        <button style={styles.moveBuildingButton} disabled={!isFreeCityEditMode()} onClick={() => beginMovingBuilding(selectedBuilding)} title="Move">✥</button>
                        {devLab && selectedBuilding.w !== selectedBuilding.h && (
                          <button style={{...styles.rotateBuildingButton,...(!canRotateBuilding(selectedBuilding)?styles.upgradeButtonDisabled:{})}} disabled={!canRotateBuilding(selectedBuilding)} onClick={rotateSelectedBuilding} title="Rotate">↻</button>
                        )}
                        <button style={{ ...styles.upgradeButton, ...(canUpgradeBuilding(selectedBuilding) ? {} : styles.upgradeButtonDisabled) }} disabled={!canUpgradeBuilding(selectedBuilding)} onClick={upgradeSelectedBuilding} title="Upgrade">⇧ {getUpgradeCostLabel(selectedBuilding)}</button>
                        <button style={styles.deleteBuildingButton} disabled={!isFreeCityEditMode()} onClick={deleteSelectedBuilding} title="Delete">⌫</button>
                      </>
                    )}
                  </div>
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

function drawMonsters(ctx, monsters, selectedMonsterId, tutorialFreeTargetIds = []) {
  const now = Date.now();
  const highlightedTargets = new Set(tutorialFreeTargetIds);

  for (const monster of monsters) {
    const selected = selectedMonsterId === monster.id;
    const tutorialHighlighted = highlightedTargets.has(monster.id);
    const pulse = 1 + Math.sin(now / 480 + monster.pulse) * 0.035;

    if (tutorialHighlighted) {
      const guidePulse = 1 + Math.sin(now / 180) * 0.12;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(134,239,172,0.95)";
      ctx.lineWidth = 7;
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 24;
      ctx.arc(monster.x, monster.y, (monster.r + 22) * guidePulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

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

function drawCityGrid(ctx, level = 1) {
  const generation = getCityGeneration(level);
  const oldestVisible = Math.max(0, generation - 3);

  for (let gridGeneration = oldestVisible; gridGeneration <= generation; gridGeneration += 1) {
    const age = generation - gridGeneration;
    const visibility = Math.max(0, 1 - age * 0.25);
    if (visibility <= 0) continue;
    const cellScale = Math.pow(2, gridGeneration);
    const step = CITY_GRID_STEP * cellScale;
    const alpha = (gridGeneration === generation ? 0.22 : 0.10) * visibility;
    const lineWidth = Math.max(1, 1 + (gridGeneration === generation ? 1.2 : 0));

    ctx.lineWidth = lineWidth;
    for (let x = 0; x <= CITY_WIDTH; x += step) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(103,232,249,${alpha})`;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CITY_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CITY_HEIGHT; y += step) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(103,232,249,${alpha})`;
      ctx.moveTo(0, y);
      ctx.lineTo(CITY_WIDTH, y);
      ctx.stroke();
    }
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

function drawCityBuildings(ctx, buildings, selectedBuildingId, groupSelection, upgradePlan) {
  for (const building of buildings) {
    const width = building.w * CITY_GRID_STEP;
    const height = building.h * CITY_GRID_STEP;
    const cx = building.x + width / 2;
    const cy = building.y + height / 2;

    ctx.save();

    const groupSelected = groupSelection?.active && groupSelection.ids?.includes(building.id);
    const planItem = upgradePlan?.find((item) => item.id === building.id);
    if (selectedBuildingId === building.id || groupSelected) {
      ctx.beginPath();
      ctx.strokeStyle = planItem ? (planItem.affordable ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)") : groupSelected ? "rgba(34,211,238,0.95)" : "rgba(251,191,36,0.78)";
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
    if (building.type !== "Citadel" && (building.level || 1) > 1) {
      drawAutoFitEvolution(ctx, building, width, height, cx, cy);
    }

    ctx.restore();
  }
}

function drawEvolutionNode(ctx, x, y, radius, depth, colors, pulse, branch = 0) {
  if (radius < 2.4) return;
  if (depth > 0) {
    const offset = radius * 1.85;
    const childRadius = radius * 0.43;
    const childDepth = depth - 1;
    for (const [dx, dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
      const childX = x + dx * offset;
      const childY = y + dy * offset * 0.72;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${0.16 + depth * 0.055})`;
      ctx.lineWidth = Math.max(1, radius * 0.11);
      ctx.moveTo(x, y);
      ctx.lineTo(childX, childY);
      ctx.stroke();
      drawEvolutionNode(ctx, childX, childY, childRadius, childDepth, colors, pulse, branch + 1);
    }
  }

  const gradient = ctx.createRadialGradient(x - radius * 0.32, y - radius * 0.42, 1, x, y, radius);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.32, colors[0]);
  gradient.addColorStop(0.72, colors[1]);
  gradient.addColorStop(1, colors[2]);
  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = Math.max(5, radius * 0.8);
  ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
  ctx.fill();
}

function drawAutoFitEvolution(ctx, building, width, height, cx, cy) {
  const level = building.level || 1;
  const cycleStep = ((level - 1) % 5) + 1;
  const generation = Math.floor((level - 1) / 5);
  const colors = building.type === "House"
    ? ["#dcfce7", "#22c55e", "#14532d"]
    : building.type === "CrystalPoint"
      ? ["#ecfeff", "#22d3ee", "#155e75"]
      : ["#fff7d6", "#f59e0b", "#92400e"];
  const now = Date.now() / 1000;
  const minSide = Math.min(width, height);
  const centerY = cy - Math.min(18, height * 0.075);
  const pulse = 1 + Math.sin(now * 2.1 + generation) * 0.035;
  const depth = Math.min(3, generation + (cycleStep >= 3 ? 1 : 0));
  const mainRadius = Math.max(7, minSide * (0.075 + Math.min(6, generation) * 0.007));

  ctx.save();

  // Inherited orbital shells remain visible across generations.
  for (let shell = 0; shell <= generation; shell += 1) {
    const scale = 1 + shell * 0.18;
    ctx.beginPath();
    ctx.strokeStyle = shell === generation ? colors[0] : `rgba(255,255,255,${0.13 + shell * 0.035})`;
    ctx.lineWidth = Math.max(1.5, 4 - shell * 0.22);
    ctx.shadowColor = colors[1];
    ctx.shadowBlur = shell === generation ? 13 : 4;
    ctx.ellipse(cx, centerY, minSide * 0.20 * scale, minSide * 0.12 * scale, now * (shell % 2 ? -0.045 : 0.045), 0, Math.PI * 2);
    ctx.stroke();
  }

  drawEvolutionNode(ctx, cx, centerY, mainRadius, depth, colors, pulse);

  // Steps 4 and 5 grow the current central structure while all recursive
  // children from earlier generations remain in place.
  const inheritedFloors = generation * 2;
  const newFloors = cycleStep >= 4 ? 1 + (cycleStep === 5 ? 1 : 0) : 0;
  const floors = Math.min(18, inheritedFloors + newFloors);
  if (floors > 0) {
    const towerWidth = Math.max(12, mainRadius * 1.4);
    const towerHeight = Math.min(height * 0.43, 16 + floors * 7);
    ctx.fillStyle = colors[2];
    ctx.shadowColor = colors[1];
    ctx.shadowBlur = 16;
    roundedRect(ctx, cx - towerWidth / 2, centerY - towerHeight - mainRadius * 0.55, towerWidth, towerHeight, towerWidth * 0.28);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    for (let floor = 0; floor < floors; floor += 1) {
      ctx.fillRect(cx - towerWidth * 0.27, centerY - mainRadius * 0.55 - 6 - floor * 7, towerWidth * 0.54, 2);
    }
  }

  // Pair levels retain the clear a-A-a bridge while inheriting prior detail.
  if (cycleStep === 2) {
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 5 + Math.min(5, generation);
    ctx.shadowColor = colors[1];
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(building.x + width * 0.13, centerY);
    ctx.lineTo(building.x + width * 0.87, centerY);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGroupSelection(ctx, selection) {
  if (!selection?.active || !selection.bounds) return;
  const b=selection.bounds; ctx.save();
  ctx.fillStyle=selection.moveValid===false?"rgba(239,68,68,0.10)":"rgba(34,211,238,0.08)";
  ctx.strokeStyle=selection.moveValid===false?"rgba(239,68,68,0.96)":"rgba(34,211,238,0.92)";
  ctx.lineWidth=6; ctx.setLineDash([18,10]); roundedRect(ctx,b.left-14,b.top-14,b.right-b.left+28,b.bottom-b.top+28,28); ctx.fill(); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
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
  const bodyRadius = Math.min(width, height) * 0.27;
  const moduleOffsetX = width * 0.235;
  const moduleOffsetY = height * 0.19;
  for (const sideX of [-1, 1]) {
    for (const sideY of [-1, 1]) drawModulePad(ctx, cx + sideX * moduleOffsetX, cy + sideY * moduleOffsetY + 18, width * 0.36, height * 0.22, "#38bdf8");
  }
  drawModulePad(ctx, cx, cy + 24, width * 0.58, height * 0.34, "#38bdf8");
  drawModuleLegs(ctx, cx, cy + 42, width * 0.34, height * 0.2, "#0ea5e9");

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

  const citadelGeneration = Math.floor(Math.max(0, level - 1) / 5);
  if (citadelGeneration > 0) {
    for (let ring = 1; ring <= citadelGeneration; ring += 1) {
      const pad = Math.min(width, height) * (0.06 + ring * 0.025);
      ctx.save();
      ctx.strokeStyle = `rgba(167,139,250,${Math.min(0.82, 0.30 + ring * 0.07)})`;
      ctx.lineWidth = 3 + Math.min(5, ring);
      ctx.shadowColor = "#8b5cf6";
      ctx.shadowBlur = 12 + ring * 2;
      roundedRect(ctx, building.x + pad, building.y + pad, width - pad * 2, height - pad * 2, Math.max(18, 36 - ring * 2));
      ctx.stroke();
      ctx.restore();
    }
    const spireCount = Math.min(8, 4 + citadelGeneration);
    for (let i = 0; i < spireCount; i += 1) {
      const angle = (i / spireCount) * Math.PI * 2 + now * 0.08;
      const distance = bodyRadius * (1.02 + Math.min(0.45, citadelGeneration * 0.06));
      drawSatellite(ctx, cx + Math.cos(angle) * distance, cy - 3 + Math.sin(angle) * distance * 0.58, i % 2 ? "#a78bfa" : "#67e8f9");
    }
  }

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

  devLabMenuButton: { background:"linear-gradient(135deg,rgba(88,28,135,.92),rgba(14,116,144,.92))",border:"1px solid rgba(103,232,249,.62)",boxShadow:"0 0 28px rgba(34,211,238,.14)" },
  devRebuildReport: { position:"absolute",left:"50%",top:76,zIndex:46,width:"min(330px,calc(100% - 34px))",transform:"translateX(-50%)",padding:12,borderRadius:18,display:"flex",flexDirection:"column",gap:4,color:"#e0f2fe",background:"linear-gradient(135deg,rgba(30,41,59,.98),rgba(49,46,129,.96))",border:"1px solid rgba(129,140,248,.7)",boxShadow:"0 18px 52px rgba(0,0,0,.52),0 0 30px rgba(99,102,241,.22)",pointerEvents:"none" },
  devLabPanel: { position:"absolute",right:10,top:78,zIndex:45,width:148,padding:8,borderRadius:16,boxSizing:"border-box",background:"rgba(12,18,34,.94)",border:"1px solid rgba(192,132,252,.72)",boxShadow:"0 12px 38px rgba(0,0,0,.48),0 0 22px rgba(168,85,247,.18)",backdropFilter:"blur(10px)" },
  devLabHeader: { display:"flex",justifyContent:"space-between",alignItems:"center",color:"#e9d5ff",fontSize:9,fontWeight:950,letterSpacing:".08em" },
  devLabControls: { display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,margin:"7px 0 4px" },
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
  trainingScreen: {
    minHeight: "100vh", padding: "22px 0 30px", boxSizing: "border-box", overflowY: "auto",
    background: "radial-gradient(circle at 50% 3%, rgba(14,165,233,0.26), transparent 30%), radial-gradient(circle at 92% 42%, rgba(124,58,237,0.14), transparent 34%), linear-gradient(180deg, #071528 0%, #020617 100%)",
  },
  trainingHeader: { width: "min(660px, calc(100% - 28px))", margin: "0 auto 26px", display: "grid", gridTemplateColumns: "46px 1fr auto", alignItems: "center", gap: 10 },
  trainingBackButton: { width: 42, height: 42, borderRadius: 14, border: "1px solid rgba(103,232,249,0.25)", background: "rgba(15,23,42,0.78)", color: "#fff", fontSize: 22, cursor: "pointer", boxShadow: "inset 0 0 18px rgba(56,189,248,0.08)" },
  trainingTitle: { margin: "2px 0 0", fontSize: 31, lineHeight: 1 },
  trainingProgress: { minWidth: 60, height: 38, padding: "0 12px", borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(103,232,249,0.12)", border: "1px solid rgba(103,232,249,0.36)", color: "#a5f3fc", fontWeight: 900, boxShadow: "0 0 22px rgba(34,211,238,0.12)" },
  trainingRouteViewport: {
    position: "relative", width: "100%", minHeight: 152, padding: "18px 22px 10px", boxSizing: "border-box",
    display: "grid", gridTemplateColumns: "repeat(5, minmax(92px, 1fr))", gap: 12,
    overflowX: "auto", scrollbarWidth: "none",
  },
  trainingRouteLine: {
    position: "absolute", left: 74, right: 74, top: 62, height: 4, borderRadius: 999,
    background: "linear-gradient(90deg, #22d3ee 0 10%, rgba(71,85,105,0.48) 18% 100%)",
    boxShadow: "0 0 16px rgba(34,211,238,0.42)",
  },
  trainingRouteStage: { position: "relative", minWidth: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  trainingRouteNode: {
    position: "relative", width: 86, height: 86, borderRadius: "50%", display: "grid", placeItems: "center",
    color: "#fff", fontWeight: 950, fontSize: 13, zIndex: 2, overflow: "visible",
  },
  trainingRouteNodeActive: {
    border: "2px solid #67e8f9", background: "radial-gradient(circle at 36% 30%, #dffcff 0 5%, #0ea5e9 16%, #1d4ed8 55%, #111827 100%)",
    boxShadow: "0 0 0 7px rgba(34,211,238,0.11), 0 0 34px rgba(34,211,238,0.68), inset 0 0 22px rgba(255,255,255,0.24)", cursor: "pointer",
  },
  trainingRouteNodeLocked: {
    border: "2px solid rgba(100,116,139,0.42)", background: "radial-gradient(circle at 35% 30%, #334155, #0f172a 68%)",
    boxShadow: "0 0 0 6px rgba(51,65,85,0.16), inset 0 0 20px rgba(2,6,23,0.7)", opacity: 0.62,
  },
  trainingRouteOrbit: { position: "absolute", inset: -8, border: "1px solid currentColor", borderRadius: "50%", opacity: 0.32, transform: "rotate(-18deg) scaleY(.58)" },
  trainingRouteIcon: { position: "absolute", top: 16, fontSize: 22, color: "#dffcff", textShadow: "0 0 12px #22d3ee" },
  trainingRouteNodeLocked: { border: "2px solid rgba(100,116,139,0.42)", background: "radial-gradient(circle at 35% 30%, #334155, #0f172a 68%)", boxShadow: "0 0 0 6px rgba(51,65,85,0.16), inset 0 0 20px rgba(2,6,23,0.7)", opacity: 0.62 },
  trainingRouteLock: { position: "absolute", right: -3, bottom: 5, width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", background: "#0f172a", border: "1px solid #475569", color: "#64748b" },
  trainingRouteLabel: { color: "rgba(148,163,184,0.7)", textAlign: "center", fontSize: 9, fontWeight: 950, letterSpacing: ".09em", lineHeight: 1.35 },
  trainingRouteLabelActive: { color: "#a5f3fc", textShadow: "0 0 10px rgba(34,211,238,0.55)" },
  trainingRouteArrow: { position: "absolute", top: 30, right: -15, color: "rgba(103,232,249,0.42)", fontSize: 28, zIndex: 3 },
  trainingStageFocus: {
    position: "relative", width: "min(620px, calc(100% - 28px))", minHeight: 154, margin: "10px auto 0", padding: 16,
    boxSizing: "border-box", borderRadius: 25, display: "grid", gridTemplateColumns: "58px minmax(0,1fr) auto", gap: 12, alignItems: "center",
    background: "linear-gradient(135deg, rgba(29,78,216,0.48), rgba(8,145,178,0.22)), rgba(15,23,42,0.94)",
    border: "1px solid rgba(103,232,249,0.72)", boxShadow: "0 20px 54px rgba(0,0,0,0.4), 0 0 30px rgba(34,211,238,0.18)", overflow: "hidden",
  },
  trainingStageFocusGlow: { position: "absolute", width: 170, height: 170, right: -58, top: -72, borderRadius: "50%", background: "rgba(34,211,238,0.16)", filter: "blur(10px)" },
  trainingStageFocusNumber: { width: 54, height: 54, borderRadius: 18, display: "grid", placeItems: "center", background: "rgba(103,232,249,0.14)", border: "1px solid rgba(103,232,249,0.48)", color: "#dffcff", fontWeight: 950, fontSize: 18 },
  trainingStageFocusContent: { minWidth: 0, display: "flex", flexDirection: "column", gap: 5 },
  trainingStageLaunch: { minWidth: 82, height: 44, border: 0, borderRadius: 14, color: "#fff", fontWeight: 950, background: "linear-gradient(135deg,#2563eb,#06b6d4)", boxShadow: "0 0 20px rgba(34,211,238,.34)", cursor: "pointer", zIndex: 1 },
  trainingLockedPreview: { width: "min(620px, calc(100% - 28px))", minHeight: 72, margin: "10px auto 0", padding: "10px 14px", boxSizing: "border-box", borderRadius: 20, display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 10, alignItems: "center", background: "rgba(15,23,42,.72)", border: "1px solid rgba(148,163,184,.13)", color: "rgba(148,163,184,.58)" },
  trainingRewardCard: { width: "min(620px, calc(100% - 28px))", margin: "12px auto 0", minHeight: 66, borderRadius: 20, padding: "12px 16px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 12, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.22)", color: "#fde68a" },
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
  levelUpCelebration: { position:"absolute",left:"50%",top:16,zIndex:40,width:"min(620px,96%)",height:54,transform:"translateX(-50%)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" },
  levelUpText: { position:"relative",zIndex:2,padding:"0 16px",color:"#fff7b2",fontSize:20,fontWeight:950,letterSpacing:".16em",whiteSpace:"nowrap",textShadow:"0 0 8px #fff,0 0 18px #facc15,0 0 34px #f59e0b",animation:"levelUpReveal .42s cubic-bezier(.22,.9,.3,1) both" },
  levelUpRayLeft: { width:"34%",height:3,marginRight:-4,transformOrigin:"right center",background:"linear-gradient(90deg,transparent,#38bdf8,#fde047)",boxShadow:"0 0 16px #38bdf8",animation:"levelUpRayLeft 1.25s ease-out both" },
  levelUpRayRight: { width:"34%",height:3,marginLeft:-4,transformOrigin:"left center",background:"linear-gradient(90deg,#fde047,#38bdf8,transparent)",boxShadow:"0 0 16px #38bdf8",animation:"levelUpRayRight 1.25s ease-out both" },
  tutorialLevelChipGlow: { animation:"chipGlow 1.05s ease-in-out infinite",color:"#fef08a",borderColor:"#facc15" },

  tutorialMissionCard: { position:"absolute",left:10,right:10,top:60,zIndex:7,minHeight:74,padding:9,boxSizing:"border-box",borderRadius:19,display:"grid",gridTemplateColumns:"48px 1fr",gap:9,alignItems:"center",background:"linear-gradient(135deg,rgba(8,47,73,.96),rgba(15,23,42,.97))",border:"1px solid rgba(103,232,249,.48)",boxShadow:"0 16px 42px rgba(0,0,0,.4),0 0 24px rgba(34,211,238,.12)",backdropFilter:"blur(12px)",pointerEvents:"none",animation:"tutorialMissionEnter .34s cubic-bezier(.22,.9,.3,1) both" },
  tutorialMissionIcon: { width:46,height:46,borderRadius:15,display:"grid",placeItems:"center",fontSize:21,fontWeight:950,color:"#dffcff",background:"rgba(34,211,238,.13)",border:"1px solid rgba(103,232,249,.38)",boxShadow:"inset 0 0 18px rgba(34,211,238,.1)" },
  tutorialMissionBody: { minWidth:0,display:"flex",flexDirection:"column",gap:2 },
  tutorialMissionTop: { display:"flex",justifyContent:"space-between",gap:6,color:"#67e8f9",fontSize:8,fontWeight:950,letterSpacing:".1em" },
  tutorialMissionTrack: { height:4,borderRadius:999,overflow:"hidden",marginTop:4,background:"rgba(255,255,255,.09)" },
  tutorialMissionFill: { display:"block",height:"100%",borderRadius:999,background:"linear-gradient(90deg,#22d3ee,#22c55e)",boxShadow:"0 0 10px rgba(34,211,238,.8)",transition:"width .28s ease" },
  tutorialMissionCompleteToast: { position:"absolute",left:"50%",top:"28%",zIndex:22,width:"min(310px,calc(100% - 38px))",minHeight:92,transform:"translate(-50%,-50%)",padding:14,boxSizing:"border-box",borderRadius:24,display:"grid",gridTemplateColumns:"54px 1fr",gap:12,alignItems:"center",background:"linear-gradient(135deg,rgba(20,83,45,.98),rgba(6,78,59,.98))",border:"1px solid rgba(134,239,172,.75)",boxShadow:"0 24px 80px rgba(0,0,0,.58),0 0 38px rgba(34,197,94,.32)",pointerEvents:"none",animation:"tutorialMissionComplete .36s cubic-bezier(.22,.9,.3,1) both" },
  mapZoomMissionCard: { position:"absolute",left:10,right:10,top:60,zIndex:12,minHeight:62,padding:"8px 12px",boxSizing:"border-box",borderRadius:18,display:"grid",gridTemplateColumns:"42px 1fr auto",gap:9,alignItems:"center",background:"linear-gradient(135deg,rgba(8,47,73,.96),rgba(15,23,42,.97))",border:"1px solid rgba(103,232,249,.52)",boxShadow:"0 16px 42px rgba(0,0,0,.4),0 0 24px rgba(34,211,238,.16)",pointerEvents:"none",animation:"tutorialMissionEnter .34s cubic-bezier(.22,.9,.3,1) both" },
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

  buildRotateButton: { width:38,height:38,flex:"0 0 38px",border:0,borderRadius:11,background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",fontSize:20,fontWeight:950 },
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
    minHeight: 112,
    borderRadius: 20,
    padding: 8,
    zIndex: 8,
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(251,191,36,0.22)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.46)",
    display: "grid",
    gridTemplateColumns: "36px 46px minmax(0, 1fr)",
    gridTemplateRows: "46px 44px",
    gridTemplateAreas: `"close icon info" "actions actions actions"`,
    gap: 6,
    alignItems: "center",
    boxSizing: "border-box",
    overflow: "hidden",
    animation: "buildingPanelSwap 220ms cubic-bezier(.22,.9,.3,1) both",
    transformOrigin: "50% 100%",
    willChange: "transform, opacity, filter",
  },

  buildingPanelAccent: {
    position: "absolute",
    left: -90,
    top: 0,
    width: 120,
    height: 2,
    borderRadius: 999,
    background: "linear-gradient(90deg, transparent, rgba(103,232,249,0.95), rgba(251,191,36,0.95), transparent)",
    boxShadow: "0 0 14px rgba(103,232,249,0.72)",
    pointerEvents: "none",
    animation: "buildingPanelAccentSweep 360ms ease-out both",
  },

  tutorialCitadelPointer: { position:"absolute",zIndex:16,width:64,height:74,transform:"translate(-50%,-96%)",display:"grid",placeItems:"center",pointerEvents:"none" },
  citadelBuildingPanel: { minHeight:150,gridTemplateRows:"46px 30px 44px",gridTemplateAreas:`"close icon info" "benefits benefits benefits" "actions actions actions"` },
  citadelUpgradeBenefits: { gridArea:"benefits",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,padding:"2px 4px",fontSize:8,fontWeight:900,color:"#bae6fd" },
  upgradeButtonTutorialPointer: { position:"absolute",left:"50%",top:-54,transform:"translateX(-50%)",fontSize:34,color:"#fff",filter:"drop-shadow(0 0 8px #facc15)",pointerEvents:"none" },
  groupBuildingPanel: { border: "1px solid rgba(34,211,238,0.62)", boxShadow: "0 18px 54px rgba(0,0,0,.5), 0 0 24px rgba(34,211,238,.18)" },
  groupPanelIcon: { color: "#67e8f9", background: "rgba(34,211,238,.13)", border: "1px solid rgba(103,232,249,.35)" },
  groupDialogBackdrop: { position:"absolute",inset:0,zIndex:30,display:"grid",placeItems:"center",padding:22,background:"rgba(2,6,23,.72)",backdropFilter:"blur(8px)" },
  groupDialog: { width:"min(330px,100%)",minHeight:190,borderRadius:26,padding:20,boxSizing:"border-box",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,textAlign:"center",background:"linear-gradient(180deg,rgba(15,23,42,.99),rgba(7,16,32,.99))",border:"1px solid rgba(34,211,238,.58)",boxShadow:"0 28px 90px rgba(0,0,0,.65),0 0 35px rgba(34,211,238,.18)" },
  groupDialogDanger: { border:"1px solid rgba(239,68,68,.72)",boxShadow:"0 28px 90px rgba(0,0,0,.65),0 0 35px rgba(239,68,68,.22)" },
  groupDialogIcon: { width:54,height:54,borderRadius:"50%",display:"grid",placeItems:"center",fontSize:27,fontWeight:950,color:"#fff",background:"linear-gradient(135deg,#0e7490,#2563eb)" },
  groupDialogActions: { width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6 },
  panelIcon: {
    gridArea: "icon",
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
    gridArea: "info",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 900,
  },

  buildingActionGroup: {
    gridArea: "actions",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "44px minmax(0, 1fr) 44px",
    gap: 6,
    alignItems: "center",
  },
  citadelLevelGate: { height:42,borderRadius:12,display:"grid",placeItems:"center",background:"rgba(251,191,36,.1)",border:"1px solid rgba(251,191,36,.24)",color:"#fde68a",fontSize:9,fontWeight:950 },
  moveBuildingButton: { width: 44, height: 42, flex:"0 0 44px", border: 0, borderRadius: 12, background: "linear-gradient(135deg,#0e7490,#2563eb)", color: "#fff", fontWeight: 900, fontSize: 18 },
  rotateBuildingButton: { width:44,height:42,flex:"0 0 44px",border:0,borderRadius:12,background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",fontWeight:950,fontSize:20 },
  deleteBuildingButton: { width: 44, height: 42, border: 0, borderRadius: 12, background: "linear-gradient(135deg,#991b1b,#ef4444)", color: "#fff", fontWeight: 900, fontSize: 20 },
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
    gridArea: "close",
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
