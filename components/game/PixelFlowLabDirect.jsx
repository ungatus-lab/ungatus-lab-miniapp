"use client";

import { useEffect, useRef, useState } from "react";

const WORLD_WIDTH = 25600;
const WORLD_HEIGHT = 17600;
const MONSTER_COUNT = 720;
const MONSTER_RESPAWN_SECONDS = 120;
const MONSTER_RESPAWN_AREA_RADIUS = 650;

const TELEPORT_COOLDOWN_SECONDS = 15;
const TELEPORT_CAST_SECONDS = 1.2;
const TELEPORT_ARRIVAL_SECONDS = 1.1;

const MIN_ZOOM = 0.06;
const MAX_ZOOM = 0.95;

const GRID_STEP = 110;
const MAJOR_GRID_STEP = GRID_STEP * 2;
const CORE_FOOTPRINT_CELLS = 2;
const CORE_FOOTPRINT_SIZE = GRID_STEP * CORE_FOOTPRINT_CELLS;
const CAMERA_OUTSIDE_PADDING = 950;

const CITY_GRID_STEP = 100;
const CITY_BASE_MODULES = 4;
const CITY_MODULE_SIZE = 2;
const CITY_LEVEL_ONE_CELLS = CITY_BASE_MODULES * CITY_MODULE_SIZE;
const CITY_LEVEL_ONE_SIZE = CITY_LEVEL_ONE_CELLS * CITY_GRID_STEP;
let CITY_WIDTH = CITY_LEVEL_ONE_SIZE;
let CITY_HEIGHT = CITY_LEVEL_ONE_SIZE;
const CITY_EXPANSION_PER_SIDE = CITY_MODULE_SIZE * CITY_GRID_STEP;
const CITY_DECADE_TEMPLATE_CELLS = [8, 12, 16, 20, 24, 32, 40, 48, 56, 64];
const CITY_OUTSIDE_PADDING = 900;
const CITY_MIN_ZOOM = 0.32;
const CITY_MAX_ZOOM = 1.1;

const ATTACK_MARCH_WORLD_SPEED = 154;
const RETURN_MARCH_WORLD_SPEED = 191;
const BOT_RALLY_MIN_SECONDS = 10;
const BOT_RALLY_MAX_SECONDS = 60;
const BOT_DIFFICULTY_MIN_LEVEL = 1;
const BOT_DIFFICULTY_MAX_LEVEL = 5;
const BOT_ECONOMIC_MAX_WAIT_SECONDS = 15;
const BOT_ECONOMIC_PLAN_DEPTH = 3;
const BOT_TELEPORT_ZONE_TARGET_DEPTH = 4;
const BOT_TELEPORT_ZONE_RADIUS = 1500;
const BOT_PLAN_SWITCH_GAIN = 1.15;
const CORE_DURABILITY_REGEN_SECONDS = 240;
const CORE_BASE_DURABILITY = 1000;
const BOT_CORE_RESPAWN_SECONDS = 120;
const BOT_CORE_RESPAWN_AREA_RADIUS = 650;
const CORE_NAMEPLATE_GAP = 14;
const CORE_NAMEPLATE_VISUAL_PADDING = 9;
const CORE_STATUS_BAR_WIDTH = 112;
const CORE_STATUS_BAR_HEIGHT = 4;
const CORE_STATUS_BAR_GAP = 2;
const BOT_RALLY_RANGE_SECONDS_BY_DIFFICULTY = {
  1: { min: 10, max: 60 },
  2: { min: 10, max: 20 },
  3: { min: 0, max: 5 },
  4: { min: 0, max: 2 },
  5: { min: 0, max: 2 },
};

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
let armyGenerationTurnState = { level: 1, startedAt: 0 };
let armyGenerationEntryState = { fromLevel: 1, level: 1, startedAt: 0 };
let armyLevelColorTransitionState = { fromLevel: 1, toLevel: 1, startedAt: 0 };
let armyLevelAxisDiveState = { fromLevel: 1, toLevel: 1, startedAt: 0 };

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
  let generationBase = 1;
  for (let current = 2; current <= safeLevel; current += 1) {
    const cycleStep = ((current - 2) % 5 + 5) % 5;
    if (cycleStep === 0 || cycleStep === 1) {
      output *= 2;
      generationBase = output;
    } else {
      output += generationBase * 0.25;
    }
  }
  return output;
}

function getBuildingEfficiency(level) {
  return getBuildingOutputScale(level) / Math.max(1, getBuildingModuleCount(level));
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
    level: safeLevel, modules, outputScale, efficiency, crystalCost, workerCost, buildTime,
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

    workers: 0,
    workerCap: 0,

    guardsByLevel: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },

    guardCap: 100,

    xp: 0,
    level: 1,
    nextLevelXp: 100,

    maxAttackSplit: 1,
  };
}

function getGuardUnitWeight(level) {
  // T3(8): one visible guard representative carries a first-level-equivalent
  // weight equal to its army level. L1=1, L2=2, L3=3 ... L100=100.
  return Math.max(1, Math.round(Number(level) || 1));
}

function getGuardEntryRealCount(level, count) {
  return Math.max(0, Math.floor(count || 0)) * getGuardUnitWeight(level);
}

function getTotalGuardElementsFromMap(guardsByLevel) {
  return Object.values(guardsByLevel || {}).reduce(
    (sum, value) => sum + Math.max(0, Math.floor(value || 0)),
    0
  );
}

function getTotalGuardsFromStats(stats) {
  return Object.entries(stats.guardsByLevel || {}).reduce(
    (sum, [level, count]) => sum + getGuardEntryRealCount(level, count),
    0
  );
}

function getTotalGuardElementsFromStats(stats) {
  return getTotalGuardElementsFromMap(stats.guardsByLevel || {});
}

function formatCompactNumber(value) {
  const safe = Math.max(0, Number(value) || 0);
  if (safe < 10000) return Math.floor(safe).toLocaleString("en-US").replaceAll(",", " ");
  const scales = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" },
  ];
  const scale = scales.find((item) => safe >= item.value) || scales[scales.length - 1];
  const compact = safe / scale.value;
  const digits = compact >= 100 ? 0 : compact >= 10 ? 1 : 2;
  return `${Number(compact.toFixed(digits))}${scale.suffix}`;
}

function formatCompactXp(value) {
  const safe = Math.max(0, Number(value) || 0);
  if (safe < 10 && safe % 1 !== 0) return safe.toFixed(2);
  return formatCompactNumber(safe);
}
function getTotalGuardsInMarches(marches) {
  return (marches || []).reduce(
    (sum, march) => sum + Math.max(0, Math.floor(march.count || 0)),
    0
  );
}
function getTotalGuardElementsInMarches(marches) {
  return (marches || []).reduce(
    (sum, march) => sum + getTotalGuardElementsFromMap(march.guardsByLevel || {}),
    0
  );
}
function getTotalOwnedGuards(stats, marches) {
  return getTotalGuardsFromStats(stats) + getTotalGuardsInMarches(marches);
}
function getTotalOwnedGuardElements(stats, marches) {
  return getTotalGuardElementsFromStats(stats) + getTotalGuardElementsInMarches(marches);
}
function getCoreArmyPresence({ core, guardCap, marches, ownerId = null }) {
  const homeArmy = getTotalGuardsFromStats({ guardsByLevel: core?.guardsByLevel || {} });
  const awayArmy = (marches || []).reduce((sum, march) => {
    if (ownerId && march.botId !== ownerId) return sum;
    return sum + getTotalGuardsFromStats({ guardsByLevel: march.guardsByLevel || {} });
  }, 0);
  const capacity = Math.max(1, Number(guardCap) || 1);
  const homeClamped = Math.min(capacity, homeArmy);
  const awayClamped = Math.min(Math.max(0, capacity - homeClamped), awayArmy);
  return {
    homeArmy,
    awayArmy,
    guardCap: capacity,
    homeRatio: homeClamped / capacity,
    awayRatio: awayClamped / capacity,
    durability: Math.max(0, Number(core?.durability) || 0),
    maxDurability: Math.max(1, Number(core?.maxDurability) || CORE_BASE_DURABILITY),
  };
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
  // A Core occupies a sliding 2x2 footprint. Its center can move by one base
  // world cell instead of jumping only between fixed 2x2 macro blocks.
  const snappedX = Math.round(point.x / GRID_STEP) * GRID_STEP;
  const snappedY = Math.round(point.y / GRID_STEP) * GRID_STEP;
  const edge = Math.max(GRID_STEP, radius);
  return {
    x: clamp(snappedX, edge, WORLD_WIDTH - edge),
    y: clamp(snappedY, edge, WORLD_HEIGHT - edge),
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

function getCityViewportMetrics(canvas) {
  const top = 190;
  const bottom = 190;
  const left = 24;
  const right = 24;
  const width = Math.max(120, canvas.clientWidth - left - right);
  const height = Math.max(120, canvas.clientHeight - top - bottom);
  return { top, bottom, left, right, width, height, centerX: left + width / 2, centerY: top + height / 2 };
}

function getCityFitMinZoom(canvas, extraMargin = 180) {
  if (!canvas) return CITY_MIN_ZOOM;
  const viewport = getCityViewportMetrics(canvas);
  const territoryMarginFactor = 1.24;
  const fitWidth = viewport.width / ((CITY_WIDTH + extraMargin * 2) * territoryMarginFactor);
  const fitHeight = viewport.height / ((CITY_HEIGHT + extraMargin * 2) * territoryMarginFactor);
  return clamp(Math.min(CITY_MIN_ZOOM, fitWidth, fitHeight), 0.00000005, CITY_MIN_ZOOM);
}

export default function PixelFlowLabDirect({ open, onClose }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const worldRef = useRef(createWorld());
  const monsterRespawnQueueRef = useRef([]);
  const playerRef = useRef(null);
  const cityRef = useRef(createCityState());
  const cityStatsRef = useRef(createCityStats());
  const botsRef = useRef([]);
  const [botCount, setBotCount] = useState(0);
  const botDifficultyRef = useRef(BOT_DIFFICULTY_MIN_LEVEL);
  const [botDifficulty, setBotDifficulty] = useState(BOT_DIFFICULTY_MIN_LEVEL);
  // One invisible Barracks now lives inside the map Core. Its output still uses
  // the proven auto-fit/output-scale formula, but it no longer occupies city cells.
  const coreBarracksRef = useRef({ level: 1, trainTimer: 0, trainCarry: 0, productionQueue: 0 });
  const productionSpawnsRef = useRef([]);
  const productionSpawnIdRef = useRef(1);
  const cityStatsUiTimerRef = useRef(0);

  const marchesRef = useRef([]);
  const botMarchesRef = useRef([]);
  const botTeleportEffectsRef = useRef([]);
  const expeditionRef = useRef(null);
  const constructionQueueRef = useRef([]);
  const tutorialConstructionRef = useRef({ housesCommitted: false, crystalsCommitted: false, barracksCommitted: false });
  const tutorialFlowRef = useRef({ phase: "buildEconomy", timer: 0 });
  const tutorialLandingTargetRef = useRef(null);
  const selectedMonsterRef = useRef(null);
  const selectedCoreRef = useRef(null);
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
  const [selectedCore, setSelectedCoreState] = useState(null);
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
  const [devLabPanelPosition, setDevLabPanelPosition] = useState(null);
  const devLabPanelDragRef = useRef({ pointerId: null, offsetX: 0, offsetY: 0 });
  const devRebuildTimerRef = useRef(null);
  const [devRebuildReport, setDevRebuildReport] = useState(null);
  const [cityGridReportOpen, setCityGridReportOpen] = useState(false);
  const diagnosticHistoryRef = useRef([]);
  const [diagnosticHistoryVersion, setDiagnosticHistoryVersion] = useState(0);
  const [diagnosticCopyStatus, setDiagnosticCopyStatus] = useState("");
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

    // Direct laboratory boot. This intentionally reuses the proven DEV LAB
    // initializer from the original game instead of duplicating its setup.
    startDeveloperLab();
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

      setViewport({ width, height });

      if (screen === "arena") {
        clampCameraToWorld();
        forceLandingPreviewRender();
      }

    }

    resize();
    window.addEventListener("resize", resize);

    lastTimeRef.current = performance.now();

    function loop(time) {
      const dt = Math.min(40, time - lastTimeRef.current);
      lastTimeRef.current = time;

      updateCoreProduction(dt / 1000);

      if (screen === "arena") {
        updateArena(dt / 1000);
        drawArena();
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
          (sum, [level, count]) => {
            const realCount = getGuardEntryRealCount(level, count);
            return sum + realCount * (Number(level) >= selectedMonster.armor ? Number(level) : 0.25);
          },
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
    if (nextMonster) updateSelectedCore(null);
  }
  function updateSelectedCore(nextCore) {
    selectedCoreRef.current = nextCore;
    setSelectedCoreState(nextCore ? { ...nextCore, guardsByLevel: { ...(nextCore.guardsByLevel || {}) } } : null);
    if (nextCore) {
      selectedMonsterRef.current = null;
      setSelectedMonsterState(null);
    }
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
    monsterRespawnQueueRef.current = [];
    CITY_WIDTH = CITY_LEVEL_ONE_SIZE;
    CITY_HEIGHT = CITY_LEVEL_ONE_SIZE;
    cityRef.current = createCityState();
    cityStatsRef.current = createCityStats();
    botsRef.current = [];
    setBotCount(0);
    botDifficultyRef.current = BOT_DIFFICULTY_MIN_LEVEL;
    setBotDifficulty(BOT_DIFFICULTY_MIN_LEVEL);
    botMarchesRef.current = [];
    botTeleportEffectsRef.current = [];
    coreBarracksRef.current = { level: 1, trainTimer: 0, trainCarry: 0, productionQueue: 0 };
    productionSpawnsRef.current = [];
    productionSpawnIdRef.current = 1;
    armyGenerationTurnState = { level: 1, startedAt: 0 };
    armyGenerationEntryState = { fromLevel: 1, level: 1, startedAt: 0 };
    armyLevelColorTransitionState = { fromLevel: 1, toLevel: 1, startedAt: 0 };
    armyLevelAxisDiveState = { fromLevel: 1, toLevel: 1, startedAt: 0 };
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
    updateSelectedCore(null);
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
      shield: 0,
      name: "Admin",
      durabilityLevel: 1,
      maxDurability: CORE_BASE_DURABILITY,
      durability: CORE_BASE_DURABILITY,
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
    stats.workers = 0; stats.workerCap = 0;
    // T3(18): DEV LAB starts with the full level-1 visual cap around Core.
    // L1 visual cap is 100, so the initial orbit should be complete immediately.
    stats.guardsByLevel = { 1: 100 };
    stats.guardCap = getCoreArmyCapacity(stats.level);
    stats.nextLevelXp = getNextLevelXp(stats.level);
    setCityStats({ ...stats });
    setHud({ level: stats.level, score: 0, cooldown: 0, teleportMode: false, status: "DEV LAB" });
    setScreen("arena");
  }


  function getCoreFootprintAt(point) {
    return {
      left: point.x - GRID_STEP,
      top: point.y - GRID_STEP,
      right: point.x + GRID_STEP,
      bottom: point.y + GRID_STEP,
    };
  }

  function getLandingCellStates(point, exceptCoreId = null) {
    const footprint = getCoreFootprintAt(point);
    const cores = [
      ...(playerRef.current ? [{ ...playerRef.current, id: "player-core" }] : []),
      ...(botsRef.current || []),
    ].filter((core) => core.alive !== false && core.id !== exceptCoreId);
    const reservedTargets = [
      ...(teleportEffectRef.current?.active ? [{ ...teleportEffectRef.current.target, id: "player-teleport-target" }] : []),
      ...(botTeleportEffectsRef.current || []).map((effect) => ({ ...effect.target, id: effect.botId })),
    ].filter((target) => target.id !== exceptCoreId);
    const cells = [];
    for (let row = 0; row < CORE_FOOTPRINT_CELLS; row += 1) {
      for (let column = 0; column < CORE_FOOTPRINT_CELLS; column += 1) {
        const left = footprint.left + column * GRID_STEP;
        const top = footprint.top + row * GRID_STEP;
        const right = left + GRID_STEP;
        const bottom = top + GRID_STEP;
        const occupiedByCore = [...cores, ...reservedTargets].some((core) => {
          const other = getCoreFootprintAt(core);
          return !(right <= other.left || left >= other.right || bottom <= other.top || top >= other.bottom);
        });
        const occupiedByMonster = (worldRef.current.monsters || []).some((monster) => {
          if (!monster || monster.hp <= 0) return false;
          const nearestX = clamp(monster.x, left, right);
          const nearestY = clamp(monster.y, top, bottom);
          return Math.hypot(monster.x - nearestX, monster.y - nearestY) < Math.max(1, monster.r || 1);
        });
        cells.push({ column, row, left, top, occupied: occupiedByCore || occupiedByMonster });
      }
    }
    return cells;
  }

  function buildLandingPreview(point, exceptCoreId = null) {
    const snapped = snapPointToLandingGrid(point);
    const cells = getLandingCellStates(snapped, exceptCoreId);
    return { ...snapped, cells, valid: cells.every((cell) => !cell.occupied) };
  }

  function findNearestFreeCoreLanding(point, exceptCoreId = null) {
    const origin = snapPointToLandingGrid(point);
    const originGX = Math.round(origin.x / GRID_STEP);
    const originGY = Math.round(origin.y / GRID_STEP);
    const maxRadius = Math.max(Math.ceil(WORLD_WIDTH / GRID_STEP), Math.ceil(WORLD_HEIGHT / GRID_STEP));
    for (let radius = 0; radius <= maxRadius; radius += 1) {
      const candidates = [];
      for (let dx = -radius; dx <= radius; dx += 1) {
        candidates.push({ gx: originGX + dx, gy: originGY - radius });
        if (radius > 0) candidates.push({ gx: originGX + dx, gy: originGY + radius });
      }
      for (let dy = -radius + 1; dy < radius; dy += 1) {
        candidates.push({ gx: originGX - radius, gy: originGY + dy });
        if (radius > 0) candidates.push({ gx: originGX + radius, gy: originGY + dy });
      }
      for (const candidate of candidates) {
        const snapped = snapPointToLandingGrid({ x: candidate.gx * GRID_STEP, y: candidate.gy * GRID_STEP });
        if (Math.round(snapped.x / GRID_STEP) !== candidate.gx || Math.round(snapped.y / GRID_STEP) !== candidate.gy) continue;
        const preview = buildLandingPreview(snapped, exceptCoreId);
        if (preview.valid) return preview;
      }
    }
    return null;
  }

  function spawnBotCoreForDevLab() {
    if (!devLabRef.current) return;
    const spawn = findNearestFreeCoreLanding({
      x: rand(200, WORLD_WIDTH - 200),
      y: rand(200, WORLD_HEIGHT - 200),
    });
    if (!spawn) return;

    const botIndex = botsRef.current.length + 1;
    const nextBot = {
      id: `bot-${Date.now()}-${Math.random()}`,
      name: `Bot_${botIndex}`,
      x: spawn.x,
      y: spawn.y,
      r: 30,
      level: 1,
      xp: 0,
      nextLevelXp: getNextLevelXp(1),
      guardCap: getCoreArmyCapacity(1),
      score: 0,
      crystals: 0,
      shield: 0,
      durabilityLevel: 1,
      maxDurability: CORE_BASE_DURABILITY,
      durability: CORE_BASE_DURABILITY,
      alive: true,
      isBot: true,
      state: "waiting",
      rallyTimer: getRandomBotRallySeconds(),
      activeMarchId: null,
      targetMonsterId: null,
      guardsByLevel: { 1: 100 },
      trainTimer: 0,
      trainCarry: 0,
      productionQueue: 0,
      productionSpawnTimer: 0,
      plannedMonsterIds: [],
      plannedWaitSeconds: 0,
      teleportCooldown: 0,
      teleportEffectId: null,
      pendingTeleportTargetId: null,
      plannedAction: null,
      plannedZoneMonsterIds: [],
    };

    botsRef.current = [...botsRef.current, nextBot];
    setBotCount(botsRef.current.length);
    setHud((current) => ({ ...current, status: `BOT CORE ${botsRef.current.length}` }));
  }

  function removeBotCoreForDevLab() {
    if (!devLabRef.current || botsRef.current.length <= 0) return;
    const removedBot = botsRef.current[botsRef.current.length - 1];
    botsRef.current = botsRef.current.slice(0, -1);
    if (removedBot?.id) {
      botMarchesRef.current = (botMarchesRef.current || []).filter((march) => march.botId !== removedBot.id);
    }
    setBotCount(botsRef.current.length);
    setHud((current) => ({ ...current, status: botsRef.current.length > 0 ? `BOT CORE ${botsRef.current.length}` : "DEV LAB" }));
  }

  function setBotDifficultyLevel(nextLevel) {
    if (!devLabRef.current) return;
    const level = clamp(
      Math.round(nextLevel || BOT_DIFFICULTY_MIN_LEVEL),
      BOT_DIFFICULTY_MIN_LEVEL,
      BOT_DIFFICULTY_MAX_LEVEL
    );
    botDifficultyRef.current = level;
    setBotDifficulty(level);
    setHud((current) => ({ ...current, status: `BOT DIFFICULTY ${level}` }));
  }

  function getRandomBotRallySeconds() {
    const difficulty = clamp(
      Math.round(botDifficultyRef.current || BOT_DIFFICULTY_MIN_LEVEL),
      BOT_DIFFICULTY_MIN_LEVEL,
      BOT_DIFFICULTY_MAX_LEVEL
    );
    const range = BOT_RALLY_RANGE_SECONDS_BY_DIFFICULTY[difficulty] || {
      min: BOT_RALLY_MIN_SECONDS,
      max: BOT_RALLY_MAX_SECONDS,
    };
    return rand(range.min, range.max);
  }

  function getBotSearchTiers(bot) {
    const topTier = Math.min(Math.max(1, Math.round(bot?.level || 1)), 5);
    const tiers = [];
    for (let tier = topTier; tier >= 1; tier -= 1) tiers.push(tier);
    return tiers;
  }

  function canBotDefeatMonster(bot, monster, guardsByLevel = bot?.guardsByLevel || {}) {
    if (!bot || !monster || monster.hp <= 0) return false;
    return calculateDamageAndReturn(guardsByLevel, monster).monsterRemainingHp <= 0;
  }

  function getReservedMonsterIdsForBots(exceptBotId = null) {
    const reserved = new Set();
    for (const march of botMarchesRef.current || []) {
      if (march.botId !== exceptBotId && march.type === "attack" && march.targetMonsterId) {
        reserved.add(march.targetMonsterId);
      }
    }
    for (const march of marchesRef.current || []) {
      if (march.type === "attack" && march.targetMonsterId) reserved.add(march.targetMonsterId);
    }
    return reserved;
  }

  function estimateBotProductionWait(bot, monster) {
    const level = Math.min(MAX_BUILDING_LEVEL, Math.max(1, Math.round(bot?.level || 1)));
    const visualCap = getCoreArmyVisualCapacity(level);
    const current = getTotalGuardElementsFromMap(bot?.guardsByLevel || {});
    if (canBotDefeatMonster(bot, monster)) return { waitSeconds: 0, guardsByLevel: { ...(bot.guardsByLevel || {}) } };
    const projected = { ...(bot?.guardsByLevel || {}) };
    const maximumExtra = Math.max(0, visualCap - current);
    for (let extra = 1; extra <= maximumExtra; extra += 1) {
      projected[level] = (projected[level] || 0) + 1;
      const waitSeconds = 1 + (extra - 1) * ARMY_PRODUCTION_SPAWN_SECONDS;
      if (waitSeconds > BOT_ECONOMIC_MAX_WAIT_SECONDS) break;
      if (canBotDefeatMonster(bot, monster, projected)) return { waitSeconds, guardsByLevel: { ...projected } };
    }
    return null;
  }

  function getBotTeleportLanding(bot, monster) {
    const dx = bot.x - monster.x;
    const dy = bot.y - monster.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    return findNearestFreeCoreLanding({
      x: monster.x + (dx / length) * MAJOR_GRID_STEP,
      y: monster.y + (dy / length) * MAJOR_GRID_STEP,
    }, bot.id);
  }

  function getBotCombatEconomy(bot, monster, guardsByLevel) {
    const result = calculateDamageAndReturn(guardsByLevel, monster);
    if (result.monsterRemainingHp > 0) return null;
    const sentElements = getTotalGuardElementsFromMap(guardsByLevel);
    const returnedElements = getTotalGuardElementsFromMap(result.returnGuardsByLevel);
    const lostElements = Math.max(0, sentElements - returnedElements);
    return {
      lostElements,
      replacementSeconds: lostElements * ARMY_PRODUCTION_SPAWN_SECONDS,
      xpValue: Math.max(0.0001, Number(monster.maxHp || monster.hp || 0) * getMonsterXpMultiplier(bot.level, monster.armor || 1)),
    };
  }

  function getBotDirectMonsterOption(bot, monster, production) {
    const combat = getBotCombatEconomy(bot, monster, production.guardsByLevel);
    if (!combat) return null;
    const attackSeconds = getMarchDuration(bot.x, bot.y, monster.x, monster.y, "attack");
    const returnSeconds = getMarchDuration(monster.x, monster.y, bot.x, bot.y, "return");
    const totalSeconds = Math.max(0.1, production.waitSeconds + attackSeconds + returnSeconds + combat.replacementSeconds);
    return {
      kind: "direct",
      monster,
      waitSeconds: production.waitSeconds,
      guardsByLevel: production.guardsByLevel,
      attackSeconds,
      returnSeconds,
      lostElements: combat.lostElements,
      xpValue: combat.xpValue,
      teleport: false,
      score: combat.xpValue / totalSeconds,
    };
  }

  function getBotTeleportZoneOption(bot, anchorMonster, reserved) {
    const landing = getBotTeleportLanding(bot, anchorMonster);
    if (!landing) return null;
    const candidates = (worldRef.current.monsters || [])
      .filter((monster) => monster && monster.hp > 0 && !reserved.has(monster.id) && Math.hypot(monster.x - landing.x, monster.y - landing.y) <= BOT_TELEPORT_ZONE_RADIUS)
      .map((monster) => {
        const production = estimateBotProductionWait(bot, monster);
        if (!production) return null;
        const combat = getBotCombatEconomy(bot, monster, production.guardsByLevel);
        if (!combat) return null;
        const attackSeconds = getMarchDuration(landing.x, landing.y, monster.x, monster.y, "attack");
        const returnSeconds = getMarchDuration(monster.x, monster.y, landing.x, landing.y, "return");
        return { monster, production, combat, cycleSeconds: attackSeconds + returnSeconds + combat.replacementSeconds };
      })
      .filter(Boolean)
      .sort((left, right) => (right.combat.xpValue / Math.max(0.1, right.cycleSeconds)) - (left.combat.xpValue / Math.max(0.1, left.cycleSeconds)));
    if (!candidates.length) return null;
    const route = candidates.slice(0, BOT_TELEPORT_ZONE_TARGET_DEPTH);
    const first = route[0];
    const cooldownWait = Math.max(0, Number(bot.teleportCooldown || 0));
    const readinessWait = Math.max(cooldownWait, first.production.waitSeconds);
    const routeXp = route.reduce((sum, item) => sum + item.combat.xpValue, 0);
    const routeCycles = route.reduce((sum, item) => sum + item.cycleSeconds, 0);
    const totalSeconds = Math.max(0.1, readinessWait + TELEPORT_CAST_SECONDS + TELEPORT_ARRIVAL_SECONDS + routeCycles);
    return {
      kind: cooldownWait > 0 ? "waitTeleport" : "teleport",
      monster: first.monster,
      guardsByLevel: first.production.guardsByLevel,
      waitSeconds: readinessWait,
      armyWaitSeconds: first.production.waitSeconds,
      cooldownWaitSeconds: cooldownWait,
      teleport: true,
      teleportLanding: landing,
      zoneMonsterIds: route.map((item) => item.monster.id),
      xpValue: routeXp,
      score: routeXp / totalSeconds,
    };
  }

  function planEconomicBotTargets(bot, allowTeleport = false) {
    const reserved = getReservedMonsterIdsForBots(bot.id);
    const directOptions = [];
    const teleportOptions = [];
    for (const monster of worldRef.current.monsters || []) {
      if (!monster || monster.hp <= 0 || reserved.has(monster.id)) continue;
      const production = estimateBotProductionWait(bot, monster);
      if (production) {
        const direct = getBotDirectMonsterOption(bot, monster, production);
        if (direct) directOptions.push(direct);
      }
      if (allowTeleport) {
        const zone = getBotTeleportZoneOption(bot, monster, reserved);
        if (zone) teleportOptions.push(zone);
      }
    }
    directOptions.sort((left, right) => right.score - left.score || left.attackSeconds - right.attackSeconds);
    teleportOptions.sort((left, right) => right.score - left.score);
    const bestDirect = directOptions[0] || null;
    const bestTeleport = teleportOptions[0] || null;
    let decision = bestDirect;
    if (bestTeleport && (!bestDirect || bestTeleport.score >= bestDirect.score * BOT_PLAN_SWITCH_GAIN)) decision = bestTeleport;
    const fallbackPlan = [...directOptions.slice(0, BOT_ECONOMIC_PLAN_DEPTH), ...teleportOptions.slice(0, BOT_ECONOMIC_PLAN_DEPTH)]
      .sort((left, right) => right.score - left.score)
      .slice(0, BOT_ECONOMIC_PLAN_DEPTH);
    bot.plannedMonsterIds = decision?.zoneMonsterIds?.length ? [...decision.zoneMonsterIds] : fallbackPlan.map((item) => item.monster.id);
    bot.plannedWaitSeconds = decision?.waitSeconds || 0;
    bot.plannedAction = decision?.kind || null;
    return decision;
  }

  function findNearestMonsterForBot(bot) {
    const monsters = worldRef.current.monsters || [];
    for (const tier of getBotSearchTiers(bot)) {
      const candidates = monsters
        .filter((monster) => monster && monster.hp > 0 && monster.armor === tier && canBotDefeatMonster(bot, monster))
        .sort((a, b) => Math.hypot(a.x - bot.x, a.y - bot.y) - Math.hypot(b.x - bot.x, b.y - bot.y));
      if (candidates.length > 0) return candidates[0];
    }
    return null;
  }

  function getBotOwnedGuardElements(bot) {
    const home = getTotalGuardElementsFromMap(bot?.guardsByLevel || {});
    const marching = (botMarchesRef.current || []).reduce((sum, march) =>
      march.botId === bot?.id ? sum + getTotalGuardElementsFromMap(march.guardsByLevel || {}) : sum, 0);
    return home + marching;
  }

  function updateBotArmyProduction(bot, dt) {
    if (!bot || !bot.alive || bot.level >= MAX_BUILDING_LEVEL) return;
    const level = Math.min(MAX_BUILDING_LEVEL, Math.max(1, Math.round(bot.level || 1)));
    const visualCap = getCoreArmyVisualCapacity(level);
    const economy = getBuildingEconomy("Barracks", level);
    bot.guardsByLevel = { ...(bot.guardsByLevel || {}) };
    bot.trainTimer = Number(bot.trainTimer || 0);
    bot.trainCarry = Number(bot.trainCarry || 0);
    bot.productionQueue = Math.max(0, Math.floor(bot.productionQueue || 0));
    bot.productionSpawnTimer = Math.max(0, Number(bot.productionSpawnTimer || 0) - dt);
    const freeCapacity = Math.max(0, visualCap - getBotOwnedGuardElements(bot));
    bot.productionQueue = Math.min(bot.productionQueue, freeCapacity);
    if (freeCapacity <= 0) { bot.trainTimer = 0; bot.productionQueue = 0; return; }
    if (bot.productionQueue > 0 && bot.productionSpawnTimer <= 0) {
      bot.productionQueue -= 1;
      bot.guardsByLevel[level] = (bot.guardsByLevel[level] || 0) + 1;
      bot.productionSpawnTimer = ARMY_PRODUCTION_SPAWN_SECONDS;
      return;
    }
    if (bot.productionQueue <= 0 && bot.productionSpawnTimer <= 0) {
      bot.trainTimer += dt;
      if (bot.trainTimer >= 1) {
        bot.trainTimer -= 1;
        const exactBatch = economy.barracksBatch + bot.trainCarry;
        const requestedBatch = Math.max(1, Math.floor(exactBatch));
        bot.trainCarry = exactBatch - requestedBatch;
        bot.productionQueue = Math.min(requestedBatch, Math.max(0, visualCap - getBotOwnedGuardElements(bot)));
        if (bot.productionQueue > 0) {
          bot.productionQueue -= 1;
          bot.guardsByLevel[level] = (bot.guardsByLevel[level] || 0) + 1;
          bot.productionSpawnTimer = ARMY_PRODUCTION_SPAWN_SECONDS;
        }
      }
    }
  }

  function getBotById(botId) {
    return (botsRef.current || []).find((bot) => bot.id === botId) || null;
  }

  function queueMonsterRespawn(monster) {
    if (!monster) return;
    monsterRespawnQueueRef.current.push({
      monster: {
        ...monster,
        hp: monster.maxHp,
      },
      deathX: monster.x,
      deathY: monster.y,
      respawnAt: Date.now() / 1000 + MONSTER_RESPAWN_SECONDS,
    });
  }

  function updateMonsterRespawns() {
    const now = Date.now() / 1000;
    const world = worldRef.current;
    const waiting = [];

    for (const entry of monsterRespawnQueueRef.current || []) {
      if (!entry || entry.respawnAt > now) {
        if (entry) waiting.push(entry);
        continue;
      }

      const angle = rand(0, Math.PI * 2);
      const distance = Math.sqrt(Math.random()) * MONSTER_RESPAWN_AREA_RADIUS;
      const source = entry.monster;
      const radius = Math.max(1, Number(source.r) || 20);
      const x = clamp(entry.deathX + Math.cos(angle) * distance, radius, WORLD_WIDTH - radius);
      const y = clamp(entry.deathY + Math.sin(angle) * distance, radius, WORLD_HEIGHT - radius);

      world.monsters.push({
        ...source,
        id: source.tutorial
          ? "tutorial-monster"
          : `monster-respawn-${Date.now()}-${Math.random()}`,
        x,
        y,
        hp: source.maxHp,
        pulse: rand(0, Math.PI * 2),
      });
    }

    monsterRespawnQueueRef.current = waiting;
  }

  function getMonsterCrystalReward(monster) {
    return monster.type === "giant"
      ? 120
      : monster.type === "brute"
        ? 70
        : monster.type === "beast"
          ? 42
          : monster.type === "wild"
            ? 24
            : 14;
  }

  function awardBotMonsterVictoryXp(bot, monster) {
    if (!bot || !monster) return 0;
    const startingLevel = Math.max(1, Math.round(bot.level || 1));
    let remainingEnemyUnits = Math.max(0, Number(monster.maxHp || monster.hp || 0));
    let totalAwarded = 0;
    bot.xp = Number(bot.xp || 0);
    while (remainingEnemyUnits > 0.000001 && bot.level < MAX_BUILDING_LEVEL) {
      const required = getNextLevelXp(bot.level);
      const room = Math.max(0, required - bot.xp);
      const multiplier = getMonsterXpMultiplier(bot.level, monster.armor || 1);
      const consumedUnits = Math.min(remainingEnemyUnits, room / Math.max(0.000001, multiplier));
      const awardedNow = consumedUnits * multiplier;
      bot.xp += awardedNow;
      bot.score = (bot.score || 0) + awardedNow;
      totalAwarded += awardedNow;
      remainingEnemyUnits -= consumedUnits;
      if (bot.xp + 0.000001 >= required) {
        bot.xp = Math.max(0, bot.xp - required);
        bot.level = Math.min(MAX_BUILDING_LEVEL, (bot.level || 1) + 1);
        bot.nextLevelXp = getNextLevelXp(bot.level);
        bot.guardCap = getCoreArmyCapacity(bot.level);
      } else break;
    }
    if (bot.level >= MAX_BUILDING_LEVEL) bot.xp = 0;
    if (bot.level > startingLevel) {
      bot.guardsByLevel = { [bot.level]: getTotalGuardElementsFromMap(bot.guardsByLevel || {}) };
      bot.productionQueue = 0;
      bot.productionSpawnTimer = 0;
      bot.trainTimer = 0;
    }
    return totalAwarded;
  }

  function resetBotRally(bot) {
    if (!bot) return;
    bot.activeMarchId = null;
    bot.targetMonsterId = null;
    bot.state = bot.level >= MAX_BUILDING_LEVEL ? "complete" : "waiting";
    bot.rallyTimer = bot.level >= MAX_BUILDING_LEVEL ? 0 : getRandomBotRallySeconds();
    bot.plannedMonsterIds = [];
    bot.plannedWaitSeconds = 0;
    bot.plannedAction = null;
    bot.plannedZoneMonsterIds = [];
  }

  function launchBotMarch(bot, monster) {
    if (!bot || !monster || bot.activeMarchId || bot.level >= MAX_BUILDING_LEVEL) return;
    const sendCount = getTotalGuardsFromStats({ guardsByLevel: bot.guardsByLevel || {} });
    if (sendCount <= 0) {
      bot.rallyTimer = getRandomBotRallySeconds();
      bot.state = "waiting";
      return;
    }
    const sentGuardsByLevel = { ...(bot.guardsByLevel || {}) };
    bot.guardsByLevel = {};
    const marchId = `bot-attack-${Date.now()}-${Math.random()}`;
    const durationSeconds = getMarchDuration(bot.x, bot.y, monster.x, monster.y, "attack");
    bot.activeMarchId = marchId;
    bot.targetMonsterId = monster.id;
    bot.state = "marching";
    botMarchesRef.current.push({
      id: marchId,
      botId: bot.id,
      type: "attack",
      count: sendCount,
      guardsByLevel: sentGuardsByLevel,
      fromX: bot.x,
      fromY: bot.y,
      toX: monster.x,
      toY: monster.y,
      progress: 0,
      durationSeconds,
      targetMonsterId: monster.id,
      targetArmor: monster.armor,
      targetColor: monster.color,
    });
  }

  function updateBotMarches(dt) {
    const world = worldRef.current;
    const nextMarches = [];
    for (const march of botMarchesRef.current || []) {
      const bot = getBotById(march.botId);
      if (!bot || !bot.alive) continue;
      const durationSeconds = march.durationSeconds || getMarchDuration(march.fromX, march.fromY, march.toX, march.toY, march.type);
      const nextProgress = Math.min(1, (march.progress || 0) + dt / durationSeconds);
      const nextMarch = { ...march, durationSeconds, progress: nextProgress };
      if (nextProgress < 1) {
        nextMarches.push(nextMarch);
        continue;
      }
      if (march.type === "attack") {
        const monster = world.monsters.find((item) => item.id === march.targetMonsterId);
        if (!monster) {
          const returnDuration = getMarchDuration(march.toX, march.toY, bot.x, bot.y, "return");
          nextMarches.push({ ...march, id: `bot-return-${Date.now()}-${Math.random()}`, type: "return", fromX: march.toX, fromY: march.toY, toX: bot.x, toY: bot.y, progress: 0, durationSeconds: returnDuration });
          continue;
        }
        const result = calculateDamageAndReturn(march.guardsByLevel, monster);
        monster.hp = Math.max(0, result.monsterRemainingHp);
        if (monster.hp <= 0) {
          bot.crystals = (bot.crystals || 0) + getMonsterCrystalReward(monster);
          awardBotMonsterVictoryXp(bot, monster);
          queueMonsterRespawn(monster);
          world.monsters = world.monsters.filter((item) => item.id !== monster.id);
          if (selectedMonsterRef.current?.id === monster.id) updateSelectedMonster(null);
        } else if (selectedMonsterRef.current?.id === monster.id) {
          updateSelectedMonster({ ...monster });
        }
        const returnCount = getTotalGuardsFromStats({ guardsByLevel: result.returnGuardsByLevel });
        if (returnCount > 0) {
          const returnDuration = getMarchDuration(march.toX, march.toY, bot.x, bot.y, "return");
          nextMarches.push({
            id: `bot-return-${Date.now()}-${Math.random()}`,
            botId: bot.id,
            type: "return",
            count: returnCount,
            guardsByLevel: result.returnGuardsByLevel,
            fromX: march.toX,
            fromY: march.toY,
            toX: bot.x,
            toY: bot.y,
            progress: 0,
            durationSeconds: returnDuration,
            targetMonsterId: march.targetMonsterId,
            targetArmor: march.targetArmor,
            targetColor: march.targetColor,
          });
        } else {
          resetBotRally(bot);
        }
        continue;
      }
      if (march.type === "return") {
        const level = Math.min(MAX_BUILDING_LEVEL, Math.max(1, Math.round(bot.level || 1)));
        bot.guardsByLevel = { ...(bot.guardsByLevel || {}) };
        for (const count of Object.values(march.guardsByLevel || {})) {
          bot.guardsByLevel[level] = (bot.guardsByLevel[level] || 0) + Math.max(0, Math.floor(count || 0));
        }
        resetBotRally(bot);
      }
    }
    botMarchesRef.current = nextMarches;
  }

  function startBotTeleport(bot, decision) {
    if (!bot || !decision?.teleportLanding || bot.activeMarchId || bot.teleportEffectId) return false;
    const safeLanding = findNearestFreeCoreLanding(decision.teleportLanding, bot.id);
    if (!safeLanding) return false;
    const effect = {
      id: `bot-teleport-${Date.now()}-${Math.random()}`,
      botId: bot.id,
      active: true,
      phase: "cast",
      timer: 0,
      origin: { x: bot.x, y: bot.y },
      target: { x: safeLanding.x, y: safeLanding.y },
      targetMonsterId: decision.monster.id,
      zoneMonsterIds: [...(decision.zoneMonsterIds || [decision.monster.id])],
    };
    bot.teleportEffectId = effect.id;
    bot.pendingTeleportTargetId = decision.monster.id;
    bot.plannedZoneMonsterIds = [...(decision.zoneMonsterIds || [decision.monster.id])];
    bot.state = "teleporting";
    botTeleportEffectsRef.current.push(effect);
    return true;
  }

  function updateBotTeleports(dt) {
    const nextEffects = [];
    for (const effect of botTeleportEffectsRef.current || []) {
      const bot = getBotById(effect.botId);
      if (!bot || !bot.alive) continue;
      effect.timer += dt;
      if (effect.phase === "cast" && effect.timer >= TELEPORT_CAST_SECONDS) {
        const safeLanding = findNearestFreeCoreLanding(effect.target, bot.id);
        if (!safeLanding) {
          bot.teleportEffectId = null;
          bot.state = "waiting";
          bot.rallyTimer = 0;
          continue;
        }
        effect.target = { x: safeLanding.x, y: safeLanding.y };
        bot.x = effect.target.x;
        bot.y = effect.target.y;
        bot.teleportCooldown = TELEPORT_COOLDOWN_SECONDS;
        effect.phase = "arrival";
        effect.timer = 0;
      }
      if (effect.phase === "arrival" && effect.timer >= TELEPORT_ARRIVAL_SECONDS) {
        bot.teleportEffectId = null;
        const reserved = getReservedMonsterIdsForBots(bot.id);
        const target = (effect.zoneMonsterIds || [effect.targetMonsterId])
          .map((id) => (worldRef.current.monsters || []).find((monster) => monster.id === id))
          .find((monster) => monster && canBotDefeatMonster(bot, monster) && !reserved.has(monster.id));
        bot.pendingTeleportTargetId = null;
        if (target) {
          launchBotMarch(bot, target);
        } else {
          bot.state = "waiting";
          bot.rallyTimer = 0;
        }
        continue;
      }
      nextEffects.push(effect);
    }
    botTeleportEffectsRef.current = nextEffects;
  }

  function updateBotCoreRespawns() {
    const now = Date.now() / 1000;
    for (const bot of botsRef.current || []) {
      if (bot.alive || !bot.respawnAt || bot.respawnAt > now) continue;
      const angle = rand(0, Math.PI * 2);
      const distance = Math.sqrt(Math.random()) * BOT_CORE_RESPAWN_AREA_RADIUS;
      const origin = {
        x: Number(bot.deathX ?? bot.x) + Math.cos(angle) * distance,
        y: Number(bot.deathY ?? bot.y) + Math.sin(angle) * distance,
      };
      const landing = findNearestFreeCoreLanding(origin, bot.id);
      if (!landing) {
        bot.respawnAt = now + 1;
        continue;
      }
      bot.x = landing.x;
      bot.y = landing.y;
      bot.level = 1;
      bot.xp = 0;
      bot.nextLevelXp = getNextLevelXp(1);
      bot.guardCap = getCoreArmyCapacity(1);
      bot.crystals = 0;
      bot.shield = 0;
      bot.durabilityLevel = 1;
      bot.maxDurability = CORE_BASE_DURABILITY;
      bot.durability = CORE_BASE_DURABILITY;
      bot.alive = true;
      bot.state = "waiting";
      bot.rallyTimer = getRandomBotRallySeconds();
      bot.activeMarchId = null;
      bot.targetMonsterId = null;
      bot.guardsByLevel = { 1: 100 };
      bot.trainTimer = 0;
      bot.trainCarry = 0;
      bot.productionQueue = 0;
      bot.productionSpawnTimer = 0;
      bot.plannedMonsterIds = [];
      bot.plannedWaitSeconds = 0;
      bot.teleportCooldown = 0;
      bot.teleportEffectId = null;
      bot.pendingTeleportTargetId = null;
      bot.plannedAction = null;
      bot.plannedZoneMonsterIds = [];
      bot.respawnAt = null;
      bot.deathX = null;
      bot.deathY = null;
      setHud((current) => ({ ...current, status: `${bot.name} RESPAWNED` }));
    }
  }

  function updateBots(dt) {
    for (const bot of botsRef.current || []) {
      if (!bot.alive || bot.level >= MAX_BUILDING_LEVEL) continue;
      updateCoreDurability(bot, dt);
      updateBotArmyProduction(bot, dt);
      bot.teleportCooldown = Math.max(0, Number(bot.teleportCooldown || 0) - dt);
      if (bot.activeMarchId || bot.teleportEffectId) continue;
      bot.rallyTimer = Math.max(0, (bot.rallyTimer || 0) - dt);
      if (bot.rallyTimer > 0) continue;
      const difficulty = Math.round(botDifficultyRef.current || BOT_DIFFICULTY_MIN_LEVEL);
      if (difficulty >= 4) {
        const decision = planEconomicBotTargets(bot, difficulty >= 5);
        if (!decision) {
          bot.rallyTimer = getRandomBotRallySeconds();
          bot.state = "waiting";
          continue;
        }
        if (difficulty >= 5 && decision.kind === "waitTeleport") {
          bot.rallyTimer = Math.max(0.25, decision.waitSeconds);
          bot.state = "waitingForTeleportPlan";
          bot.plannedZoneMonsterIds = [...(decision.zoneMonsterIds || [])];
          continue;
        }
        if (decision.waitSeconds > 0) {
          bot.rallyTimer = Math.max(0.25, decision.waitSeconds);
          bot.state = "waitingForArmy";
          continue;
        }
        if (difficulty >= 5 && decision.kind === "teleport") {
          startBotTeleport(bot, decision);
          continue;
        }
        launchBotMarch(bot, decision.monster);
        continue;
      }
      const monster = findNearestMonsterForBot(bot);
      if (!monster) {
        bot.rallyTimer = getRandomBotRallySeconds();
        bot.state = "waiting";
        continue;
      }
      launchBotMarch(bot, monster);
    }
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

  function getExpectedBuildingFootprint(type, level) {
    if (type === "Citadel") {
      const generation = getCityGeneration(level);
      const side = 4 * Math.pow(2, generation);
      return { w: side, h: side };
    }
    const definition = BUILDINGS[type] || BUILDINGS.House;
    const primaryCells = definition.w * definition.h * getBuildingModuleCount(level);
    const footprint = getAutoFitFootprint(type, level);
    return { w: footprint.w, h: footprint.h, primaryCells };
  }

  function getActualBuildingFootprint(type, level) {
    if (type === "Citadel") {
      const side = getCitadelFootprint(level);
      return { w: side, h: side };
    }
    return getAutoFitFootprint(type, level);
  }

  function getTheoreticalPrimaryCells(type, level) {
    if (type === "City") {
      const side = getCityCellsForLevel(level);
      return side * side;
    }
    if (type === "Citadel") return 16 * Math.pow(4, getCityGeneration(level));
    const definition = BUILDINGS[type] || BUILDINGS.House;
    return definition.w * definition.h * getBuildingModuleCount(level);
  }

  function getActualPrimaryCells(type, level, currentLevel) {
    if (type === "City") {
      if (level === currentLevel) {
        return Math.round(CITY_WIDTH / CITY_GRID_STEP) * Math.round(CITY_HEIGHT / CITY_GRID_STEP);
      }
      const side = getCityCellsForLevel(level);
      return side * side;
    }
    const footprint = getActualBuildingFootprint(type, level);
    return footprint.w * footprint.h;
  }

  function getTheoryGenerationTransparency(level, generation) {
    const startLevel = 1 + (generation - 1) * 5;
    return clamp((level - startLevel) * 5, 0, 100);
  }

  function getActualGenerationTransparency(level, generation) {
    // Mirrors drawCityGrid exactly. Future layers are not rendered yet, so their
    // internal primary lines are still treated as 0% transparent in diagnostics.
    const gridGeneration = generation - 1;
    if (gridGeneration > getCityGeneration(level)) return 0;
    const startLevel = 1 + gridGeneration * 5;
    return clamp((level - startLevel) * 5, 0, 100);
  }

  function findFirstLevelForGeneration(type, generation, actual, currentLevel) {
    const divisor = Math.pow(4, generation - 1);
    for (let level = 1; level <= MAX_BUILDING_LEVEL; level += 1) {
      const primaryCells = actual
        ? getActualPrimaryCells(type, level, currentLevel)
        : getTheoreticalPrimaryCells(type, level);
      if (Math.floor(primaryCells / divisor) >= 1) return level;
    }
    return null;
  }

  function getCityGridReport(forcedLevel = cityStatsRef.current.level) {
    const level = Math.max(1, Math.round(forcedLevel || 1));
    const labels = {
      City: "CITY MAP",
      Citadel: "CITADEL",
      Barracks: "BARRACKS",
      CrystalPoint: "CRYSTAL MINE",
      House: "HOUSE",
    };
    const types = ["City", "Citadel", "Barracks", "CrystalPoint", "House"];
    const objects = types.map((type) => {
      const theoryPrimary = getTheoreticalPrimaryCells(type, level);
      const actualPrimary = getActualPrimaryCells(type, level, level);
      const theoryFootprint = type === "City"
        ? { w: getCityCellsForLevel(level), h: getCityCellsForLevel(level) }
        : getExpectedBuildingFootprint(type, level);
      const actualFootprint = type === "City"
        ? { w: Math.round(CITY_WIDTH / CITY_GRID_STEP), h: Math.round(CITY_HEIGHT / CITY_GRID_STEP) }
        : getActualBuildingFootprint(type, level);
      const generations = Array.from({ length: 20 }, (_, index) => {
        const generation = index + 1;
        const divisor = Math.pow(4, index);
        const theoryCells = Math.floor(theoryPrimary / divisor);
        const actualCells = Math.floor(actualPrimary / divisor);
        const theoryTransparency = getTheoryGenerationTransparency(level, generation);
        const actualTransparency = getActualGenerationTransparency(level, generation);
        return {
          generation,
          cellScale: Math.pow(2, index),
          theoryCells,
          actualCells,
          theoryTransparency,
          actualTransparency,
          theoryFirstLevel: findFirstLevelForGeneration(type, generation, false, level),
          actualFirstLevel: findFirstLevelForGeneration(type, generation, true, level),
          active: generation <= getCityGeneration(level) + 1,
          ok: theoryCells === actualCells && theoryTransparency === actualTransparency,
        };
      });
      return {
        type,
        label: labels[type],
        theoryPrimary,
        actualPrimary,
        theoryFootprint: `${theoryFootprint.w}×${theoryFootprint.h}`,
        actualFootprint: `${actualFootprint.w}×${actualFootprint.h}`,
        generations,
        ok: generations.every((item) => item.ok),
      };
    });
    return { level, objects, ok: objects.every((item) => item.ok) };
  }

  function roundDiagnostic(value, digits = 3) {
    const power = Math.pow(10, digits);
    return Math.round((Number(value) || 0) * power) / power;
  }

  function buildDiagnosticSnapshot(forcedLevel = cityStatsRef.current.level) {
    const level = Math.max(1, Math.round(forcedLevel || 1));
    const stats = cityStatsRef.current;
    const buildings = cityRef.current.buildings || [];
    const mapWidth = Math.round(CITY_WIDTH / CITY_GRID_STEP);
    const mapHeight = Math.round(CITY_HEIGHT / CITY_GRID_STEP);
    const mapCells = mapWidth * mapHeight;
    const definitions = [
      ["Citadel", "CITADEL"], ["House", "HOUSE"],
      ["CrystalPoint", "CRYSTAL MINE"], ["Barracks", "BARRACKS"],
    ];
    const buildingSummary = definitions.map(([type, label]) => {
      const matching = buildings.filter((building) => building.type === type);
      const oneFootprint = getActualBuildingFootprint(type, level);
      const oneCells = oneFootprint.w * oneFootprint.h;
      const totalCells = matching.reduce((sum, building) => sum + building.w * building.h, 0);
      const oneEconomy = type === "Citadel" ? null : getBuildingEconomy(type, level);
      const totalEffects = matching.reduce((total, building) => {
        if (type === "Citadel") return total;
        const economy = getBuildingEconomy(type, building.level || level);
        total.crystalRate += economy.crystalRate || 0;
        total.workerCapacity += economy.workerCapacity || 0;
        total.guardCapacity += economy.guardCapacity || 0;
        total.barracksBatch += economy.barracksBatch || 0;
        return total;
      }, { crystalRate: 0, workerCapacity: 0, guardCapacity: 0, barracksBatch: 0 });
      return {
        type, label, built: matching.length,
        one: {
          footprint: `${oneFootprint.w}x${oneFootprint.h}`,
          primaryCells: oneCells,
          mapPercent: roundDiagnostic(mapCells ? oneCells / mapCells * 100 : 0),
          effects: oneEconomy ? {
            crystalRate: oneEconomy.crystalRate || 0,
            workerCapacity: oneEconomy.workerCapacity || 0,
            guardCapacity: oneEconomy.guardCapacity || 0,
            barracksBatch: oneEconomy.barracksBatch || 0,
          } : {},
        },
        allBuilt: {
          primaryCells: totalCells,
          mapPercent: roundDiagnostic(mapCells ? totalCells / mapCells * 100 : 0),
          effects: totalEffects,
        },
      };
    });
    const occupiedCells = buildingSummary.reduce((sum, item) => sum + item.allBuilt.primaryCells, 0);
    const report = getCityGridReport(level);
    return {
      level,
      city: {
        width: mapWidth, height: mapHeight, primaryCells: mapCells,
        occupiedCells, occupiedPercent: roundDiagnostic(mapCells ? occupiedCells / mapCells * 100 : 0),
        freeCells: Math.max(0, mapCells - occupiedCells),
        freePercent: roundDiagnostic(mapCells ? Math.max(0, mapCells - occupiedCells) / mapCells * 100 : 0),
      },
      buildings: buildingSummary,
      economy: {
        crystals: roundDiagnostic(stats.crystals), crystalRate: roundDiagnostic(stats.crystalRate),
        workers: stats.workers, workerCap: stats.workerCap,
        guardCap: stats.guardCap,
        barracksBatchTotal: roundDiagnostic(buildingSummary.find((item) => item.type === "Barracks")?.allBuilt.effects.barracksBatch || 0),
      },
      army: {
        cityGuards: getTotalGuardsFromStats(stats),
        marchingGuards: getTotalGuardsInMarches(marchesRef.current),
        totalOwnedGuards: getTotalOwnedGuards(stats, marchesRef.current),
        marches: marchesRef.current.length,
        guardsByLevel: { ...(stats.guardsByLevel || {}) },
      },
      generations: report.objects.map((object) => ({
        type: object.type,
        rows: object.generations.filter((row) => row.theoryCells > 0 || row.actualCells > 0).map((row) => ({
          generation: row.generation, cellScale: row.cellScale,
          theoryCells: row.theoryCells, actualCells: row.actualCells,
          theoryTransparency: row.theoryTransparency, actualTransparency: row.actualTransparency,
        })),
      })),
    };
  }

  function saveDiagnosticSnapshot(forcedLevel = cityStatsRef.current.level) {
    const snapshot = buildDiagnosticSnapshot(forcedLevel);
    const next = diagnosticHistoryRef.current.filter((item) => item.level !== snapshot.level);
    next.push(snapshot);
    next.sort((left, right) => left.level - right.level);
    diagnosticHistoryRef.current = next;
    setDiagnosticHistoryVersion((version) => version + 1);
    return snapshot;
  }

  async function copyDiagnosticData(mode) {
    const current = saveDiagnosticSnapshot();
    const payload = mode === "history"
      ? { format: "MacroSwarmDevLabHistoryV1", levels: diagnosticHistoryRef.current }
      : { format: "MacroSwarmDevLabSnapshotV1", ...current };
    const text = JSON.stringify(payload, null, 2);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const textarea = document.createElement("textarea");
        textarea.value = text; textarea.style.position = "fixed"; textarea.style.opacity = "0";
        document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove();
      }
      setDiagnosticCopyStatus(mode === "history" ? `COPIED ${diagnosticHistoryRef.current.length} LEVELS` : `COPIED LV ${current.level}`);
    } catch (error) {
      setDiagnosticCopyStatus("COPY FAILED");
    }
    setTimeout(() => setDiagnosticCopyStatus(""), 1800);
  }

  function openCityGridReport() {
    saveDiagnosticSnapshot();
    setCityGridReportOpen(true);
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

    for (const type of []) {
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
    if (target === previousLevel) return;
    stats.level = target;
    stats.xp = 0;
    stats.nextLevelXp = getNextLevelXp(target);
    stats.guardCap = getCoreArmyCapacity(target);
    coreBarracksRef.current.trainTimer = 0;
    if (target > previousLevel) {
      if (isArmyGenerationEntryLevel(target)) startArmyLevelColorTransition(previousLevel, target);
      startArmyGenerationTurn(target);
      startArmyGenerationEntryTransition(target, previousLevel);
    }
    if (playerRef.current) playerRef.current.level = target;
    cameraRef.current.zoom = clamp(cameraRef.current.zoom, MIN_ZOOM, MAX_ZOOM);
    setHud((current) => ({ ...current, level: target, status: `CORE LEVEL ${target}` }));
    setCityStats({ ...stats });
  }

  function addDeveloperResources() {
    if (!devLabRef.current) return;
    const stats = cityStatsRef.current;
    stats.crystals += 10000;
    stats.workers = 0; stats.workerCap = 0;
    stats.guardsByLevel[stats.level] = (stats.guardsByLevel[stats.level] || 0) + 100;
    stats.guardCap = Math.max(stats.guardCap, getTotalGuardsFromStats(stats));
    setCityStats({ ...stats });
  }

  function exitDeveloperLab() {
    devLabRef.current = false;
    setDevLab(false);
    if (typeof onClose === "function") onClose();
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

    if (typeof onClose === "function") onClose();
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

    updateCoreDurability(player, dt);

    updateTeleportEffect(dt);
    updateMonsterRespawns();
    updateMarches(dt);
    updateBotMarches(dt);
    updateBotTeleports(dt);
    updateBotCoreRespawns();
    updateBots(dt);
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

  function getHighestOutdatedGuardLevel(guardsByLevel, currentLevel) {
    return Object.keys(guardsByLevel || {})
      .map(Number)
      .filter((level) => level < currentLevel && Math.floor(guardsByLevel[level] || 0) > 0)
      .sort((left, right) => right - left)[0] ?? null;
  }

  function updateCoreProduction(dt) {
    const stats = cityStatsRef.current;
    const productionNow = Date.now() / 1000;
    productionSpawnsRef.current = (productionSpawnsRef.current || []).filter(
      (spawn) => productionNow - (spawn.createdAt || 0) <= (spawn.duration || ARMY_PRODUCTION_SPAWN_SECONDS) + 0.25
    );
    const hasActiveProductionSpawn = (productionSpawnsRef.current || []).some((spawn) => {
      const startedAt = spawn.createdAt || 0;
      return productionNow >= startedAt && productionNow - startedAt < (spawn.duration || ARMY_PRODUCTION_SPAWN_SECONDS);
    });
    if (!Number.isFinite(stats.crystals)) stats.crystals = 0;
    stats.crystalRate = 0;

    const coreBarracks = coreBarracksRef.current;
    if (!Number.isFinite(coreBarracks.productionQueue)) coreBarracks.productionQueue = 0;
    const coreBarracksLevel = Math.max(1, Math.round(stats.level || 1));
    coreBarracks.level = coreBarracksLevel;
    const barracksEconomy = getBuildingEconomy("Barracks", coreBarracksLevel);
    const outdatedLevel = getHighestOutdatedGuardLevel(stats.guardsByLevel, coreBarracksLevel);

    if (outdatedLevel !== null) {
      const available = Math.floor(stats.guardsByLevel[outdatedLevel] || 0);
      if (available > 0) {
        armyLevelAxisDiveState = { fromLevel: outdatedLevel, toLevel: coreBarracksLevel, startedAt: 0 };
        startArmyGenerationEntryTransition(coreBarracksLevel, outdatedLevel);
        delete stats.guardsByLevel[outdatedLevel];
        stats.guardsByLevel[coreBarracksLevel] =
          (stats.guardsByLevel[coreBarracksLevel] || 0) + available;
        coreBarracks.trainTimer = 0;
        coreBarracks.productionQueue = 0;
      }
    } else {
      const visualCapacity = getCoreArmyVisualCapacity(coreBarracksLevel);
      const freeCapacity = Math.max(0, visualCapacity - getTotalOwnedGuardElements(stats, marchesRef.current));
      coreBarracks.productionQueue = Math.min(Math.max(0, Math.floor(coreBarracks.productionQueue || 0)), freeCapacity);

      const startOneProducedGuard = () => {
        if (hasActiveProductionSpawn) return false;
        if ((coreBarracks.productionQueue || 0) <= 0) return false;
        if (getTotalOwnedGuardElements(stats, marchesRef.current) >= visualCapacity) return false;
        coreBarracks.productionQueue -= 1;
        stats.guardsByLevel[coreBarracksLevel] =
          (stats.guardsByLevel[coreBarracksLevel] || 0) + 1;
        productionSpawnsRef.current.push({
          id: productionSpawnIdRef.current++,
          level: coreBarracksLevel,
          createdAt: Date.now() / 1000,
          duration: ARMY_PRODUCTION_SPAWN_SECONDS,
        });
        return true;
      };

      if (!startOneProducedGuard()) {
        if (getTotalOwnedGuardElements(stats, marchesRef.current) >= visualCapacity) {
          coreBarracks.trainTimer = 0;
        } else if (!hasActiveProductionSpawn && (coreBarracks.productionQueue || 0) <= 0) {
          coreBarracks.trainTimer = (coreBarracks.trainTimer || 0) + dt;
          if (coreBarracks.trainTimer >= 1) {
            coreBarracks.trainTimer -= 1;
            const exactBatch = barracksEconomy.barracksBatch + (coreBarracks.trainCarry || 0);
            const requestedBatch = Math.max(1, Math.floor(exactBatch));
            coreBarracks.trainCarry = exactBatch - requestedBatch;
            const capacity = Math.max(
              0,
              visualCapacity - getTotalOwnedGuardElements(stats, marchesRef.current)
            );
            coreBarracks.productionQueue = Math.min(requestedBatch, capacity);
            startOneProducedGuard();
          }
        }
      }
    }

    cityStatsUiTimerRef.current += dt;
    if (cityStatsUiTimerRef.current >= 0.2) {
      cityStatsUiTimerRef.current = 0;
      setCityStats({ ...stats });
    }
  }

  function getCoreArmyVisualCapacity(level) {
    // T3(8): visual orbit growth is capped and predictable.
    // Level 1 starts with 100 visible representatives; each next level adds 10.
    const safeLevel = Math.max(1, Math.round(level || 1));
    return 100 + (safeLevel - 1) * 10;
  }

  function getCoreArmyCapacity(level) {
    // Real first-level-equivalent capacity is derived from visible representatives.
    // A level-N representative counts as N first-level soldiers.
    const safeLevel = Math.max(1, Math.round(level || 1));
    return getCoreArmyVisualCapacity(safeLevel) * getGuardUnitWeight(safeLevel);
  }

  function recalculateCityEconomy() {
    const stats = cityStatsRef.current;
    if (!Number.isFinite(stats.crystals)) stats.crystals = 0;
    stats.crystalRate = 0;
    stats.workers = 0;
    stats.workerCap = 0;
    stats.guardCap = getCoreArmyCapacity(stats.level);
    setCityStats({ ...stats });
  }

  function applyLevelUpEffects(previousLevel = Math.max(1, (cityStatsRef.current.level || 1) - 1)) {
    const stats = cityStatsRef.current;
    stats.nextLevelXp = getNextLevelXp(stats.level);
    stats.guardCap = getCoreArmyCapacity(stats.level);
    coreBarracksRef.current.trainTimer = 0;
    if (isArmyGenerationEntryLevel(stats.level)) startArmyLevelColorTransition(previousLevel, stats.level);
    startArmyGenerationTurn(stats.level);
    startArmyGenerationEntryTransition(stats.level, previousLevel);
    if (stats.level >= 10) stats.maxAttackSplit = Math.min(10, Math.floor(stats.level / 10) + 1);
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
        const previousLevel = stats.level;
        stats.level += 1;
        applyLevelUpEffects(previousLevel);
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
  function getArmyCombatPower(guardsByLevel) {
    return Object.entries(guardsByLevel || {}).reduce((sum, [level, count]) => {
      const numericLevel = Math.max(1, Number(level) || 1);
      return sum + Math.max(0, Math.floor(count || 0)) * numericLevel * getGuardUnitWeight(numericLevel);
    }, 0);
  }
  function consumeArmyPower(guardsByLevel, incomingPower) {
    const remaining = { ...(guardsByLevel || {}) };
    let power = Math.max(0, Number(incomingPower) || 0);
    const levels = Object.keys(remaining).map(Number).sort((a, b) => a - b);
    for (const level of levels) {
      if (power <= 0) break;
      const count = Math.max(0, Math.floor(remaining[level] || 0));
      const perElement = level * getGuardUnitWeight(level);
      const lost = Math.min(count, Math.ceil(power / Math.max(1, perElement)));
      remaining[level] = count - lost;
      power = Math.max(0, power - lost * perElement);
      if (remaining[level] <= 0) delete remaining[level];
    }
    return remaining;
  }
  function calculateCoreBattle(attackerGuardsByLevel, defenderGuardsByLevel, defenderDurability) {
    const attackerPower = getArmyCombatPower(attackerGuardsByLevel);
    const defenderPower = getArmyCombatPower(defenderGuardsByLevel);
    const attackerReturnGuardsByLevel = consumeArmyPower(attackerGuardsByLevel, defenderPower);
    const defenderRemainingGuardsByLevel = consumeArmyPower(defenderGuardsByLevel, attackerPower);
    const survivingAttackPower = getArmyCombatPower(attackerReturnGuardsByLevel);
    const durabilityDamage = survivingAttackPower;
    const defenderDurabilityAfter = Math.max(0, Number(defenderDurability || 0) - durabilityDamage);
    return { attackerReturnGuardsByLevel, defenderRemainingGuardsByLevel, survivingAttackPower, durabilityDamage, defenderDurabilityAfter, coreBroken: defenderDurabilityAfter <= 0 };
  }
  function updateCoreDurability(core, dt) {
    if (!core || core.alive === false || core.durability <= 0) return;
    core.maxDurability = Math.max(CORE_BASE_DURABILITY, Number(core.maxDurability || CORE_BASE_DURABILITY));
    core.durability = Math.min(core.maxDurability, Number(core.durability || 0) + core.maxDurability / CORE_DURABILITY_REGEN_SECONDS * dt);
  }

  function calculateDamageAndReturn(guardsByLevel, monster) {
    const nextReturn = {};
    let remainingHp = monster.hp;

    const levels = Object.keys(guardsByLevel)
      .map((level) => Number(level))
      .sort((a, b) => b - a);

    for (const level of levels) {
      const elementCount = Math.floor(guardsByLevel[level] || 0);
      if (elementCount <= 0) continue;

      const unitWeight = getGuardUnitWeight(level);
      const realCount = elementCount * unitWeight;
      const fullDamage = level >= monster.armor;
      const damagePerUnit = fullDamage ? level : 0.25;

      const neededRealUnits = Math.ceil(remainingHp / damagePerUnit);
      const usedRealUnits = Math.min(realCount, neededRealUnits);
      const usedElements = Math.min(elementCount, Math.ceil(usedRealUnits / unitWeight));
      const damage = usedRealUnits * damagePerUnit;

      remainingHp = Math.max(0, remainingHp - damage);

      const returned = elementCount - usedElements;

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

      if (march.type === "attackCore") {
        const target = getBotById(march.targetCoreId);
        const targetStillThere = target && target.alive && Math.hypot(target.x - march.toX, target.y - march.toY) <= GRID_STEP;
        const result = targetStillThere
          ? calculateCoreBattle(march.guardsByLevel, target.guardsByLevel || {}, target.durability)
          : { attackerReturnGuardsByLevel: march.guardsByLevel, durabilityDamage: 0, coreBroken: false };

        if (targetStillThere) {
          target.guardsByLevel = result.defenderRemainingGuardsByLevel;
          target.durability = result.defenderDurabilityAfter;
          if (result.coreBroken) {
            target.alive = false;
            target.state = "respawning";
            target.guardsByLevel = {};
            target.activeMarchId = null;
            target.targetMonsterId = null;
            target.teleportEffectId = null;
            target.respawnAt = Date.now() / 1000 + BOT_CORE_RESPAWN_SECONDS;
            target.deathX = target.x;
            target.deathY = target.y;
            botMarchesRef.current = (botMarchesRef.current || []).filter((item) => item.botId !== target.id);
            botTeleportEffectsRef.current = (botTeleportEffectsRef.current || []).filter((item) => item.botId !== target.id);
            updateSelectedCore(null);
          } else if (selectedCoreRef.current?.id === target.id) {
            updateSelectedCore(target);
          }
          setHud((current) => ({
            ...current,
            status: result.coreBroken ? `CORE BROKEN · RESPAWN ${BOT_CORE_RESPAWN_SECONDS}s` : `CORE DAMAGE ${Math.round(result.durabilityDamage)}`,
          }));
        }

        const returnCount = getTotalGuardsFromStats({ guardsByLevel: result.attackerReturnGuardsByLevel || {} });
        if (returnCount > 0) {
          const returnId = `return-core-${Date.now()}-${Math.random()}`;
          const returnDuration = getMarchDuration(march.toX, march.toY, player.x, player.y, "return");
          nextMarches.push({
            id: returnId, type: "return", count: returnCount,
            guardsByLevel: result.attackerReturnGuardsByLevel,
            fromX: march.toX, fromY: march.toY, toX: player.x, toY: player.y,
            progress: 0, durationSeconds: returnDuration,
            targetCoreId: march.targetCoreId, targetColor: "#ef4444",
          });
          publishExpedition({
            marchId: returnId, phase: "return", count: returnCount,
            remainingSeconds: Math.ceil(returnDuration), targetCoreId: march.targetCoreId, targetColor: "#ef4444",
          });
        } else if (expeditionRef.current?.marchId === march.id) {
          publishExpedition(null);
        }
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

          queueMonsterRespawn(monster);
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
    for (const effect of botTeleportEffectsRef.current || []) drawTeleportEffectRings(ctx, effect);
    drawMarches(ctx, marchesRef.current);
    drawMarches(ctx, botMarchesRef.current);
    try {
      drawOrbitGuards(ctx, player, cityStatsRef.current.guardsByLevel, productionSpawnsRef.current);
      for (const bot of botsRef.current) {
        drawOrbitGuards(ctx, bot, bot.guardsByLevel || { 1: 100 }, []);
      }
    } catch (error) {
      console.error("Orbit guards draw failed", error);
    }
    for (const bot of botsRef.current) {
      if (bot.alive) drawPlayer(ctx, bot);
    }
    drawPlayer(ctx, player);
    for (const bot of botsRef.current) {
      if (!bot.alive) continue;
      const isSelected = selectedCoreRef.current?.id === bot.id;
      const status = isSelected
        ? getCoreArmyPresence({
            core: bot,
            guardCap: bot.guardCap,
            marches: botMarchesRef.current,
            ownerId: bot.id,
          })
        : null;
      drawCoreNameplate(ctx, bot, bot.guardsByLevel || {}, isSelected, status);
    }
    drawCoreNameplate(ctx, player, cityStatsRef.current.guardsByLevel || {}, false, null);

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
    const canvas = canvasRef.current;
    const viewport = canvas ? getCityViewportMetrics(canvas) : { centerX: width / 2, centerY: height / 2 };
    ctx.translate(viewport.centerX, viewport.centerY);
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
    const center = snapPointToLandingGrid(point);
    return {
      x: center.x - GRID_STEP,
      y: center.y - GRID_STEP,
      centerX: center.x,
      centerY: center.y,
    };
  }

  function pointInsideLandingBlock(worldPoint, landingPoint) {
    if (!landingPoint) return false;
    const block = getLandingBlock(landingPoint);
    return worldPoint.x >= block.x && worldPoint.x <= block.x + CORE_FOOTPRINT_SIZE && worldPoint.y >= block.y && worldPoint.y <= block.y + CORE_FOOTPRINT_SIZE;
  }

  function snapToLandingGrid(point) {
    return snapPointToLandingGrid(point, playerRef.current?.r || 30);
  }

  function selectLandingPoint(clientX, clientY) {
    if (cooldownRef.current > 0) return;
    if (teleportEffectRef.current?.active) return;

    const rawPoint = screenToWorld(clientX, clientY);
    const snappedPoint =
      tutorialFlowRef.current.phase === "selectLanding" && tutorialLandingTargetRef.current
        ? tutorialLandingTargetRef.current
        : snapToLandingGrid(rawPoint);
    const preview = buildLandingPreview(snappedPoint, "player-core");

    teleportModeRef.current = false;
    updateLandingPreview(preview);
    if (tutorialFlowRef.current.phase === "selectLanding") {
      updateTutorialFlowPhase("confirmLanding");
    }
  }

  function beginTeleportToLanding() {
    const player = playerRef.current;
    const currentLanding = landingPreviewRef.current;

    if (!player || !currentLanding) return;
    const validatedLanding = buildLandingPreview(currentLanding, "player-core");
    if (!validatedLanding.valid) {
      updateLandingPreview(validatedLanding);
      setHud((current) => ({ ...current, status: "LANDING BLOCKED" }));
      return;
    }
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
        x: validatedLanding.x,
        y: validatedLanding.y,
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

    // A launched legion restarts the production cycle of the internal Core Barracks.
    coreBarracksRef.current.trainTimer = 0;
    coreBarracksRef.current.productionQueue = 0;
    productionSpawnsRef.current = [];

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

  function beginAttackSelectedCore() {
    const target = selectedCoreRef.current;
    const player = playerRef.current;
    const stats = cityStatsRef.current;
    if (!target || !target.alive || !player) return;
    const sendCount = getTotalGuardsFromStats(stats);
    if (sendCount <= 0) return;
    const sentGuardsByLevel = { ...stats.guardsByLevel };
    stats.guardsByLevel = {};
    coreBarracksRef.current.trainTimer = 0;
    coreBarracksRef.current.productionQueue = 0;
    productionSpawnsRef.current = [];
    const marchId = `attack-core-${Date.now()}-${Math.random()}`;
    const durationSeconds = getMarchDuration(player.x, player.y, target.x, target.y, "attack");
    marchesRef.current.push({ id: marchId, type: "attackCore", count: sendCount, guardsByLevel: sentGuardsByLevel,
      fromX: player.x, fromY: player.y, toX: target.x, toY: target.y, progress: 0, durationSeconds,
      targetCoreId: target.id, targetColor: "#ef4444" });
    publishExpedition({ marchId, phase: "attackCore", count: sendCount, remainingSeconds: Math.ceil(durationSeconds), targetCoreId: target.id, targetColor: "#ef4444" });
    updateSelectedCore(null);
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

      const coreTarget = findCoreAt(worldPoint);
      if (coreTarget) {
        updateSelectedCore(coreTarget);
        setEnterCoreVisible(false);
        return;
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
        updateSelectedCore(null);
        setEnterCoreVisible(false);
      }
    }
  }

  function findCoreAt(worldPoint) {
    let best = null;
    let bestDistance = Infinity;
    for (const bot of botsRef.current || []) {
      if (!bot.alive) continue;
      const distance = Math.hypot(worldPoint.x - bot.x, worldPoint.y - bot.y);
      const touchRadius = bot.r + 42 / Math.max(0.1, cameraRef.current.zoom);
      if (distance <= touchRadius && distance < bestDistance) { best = bot; bestDistance = distance; }
    }
    return best;
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
        const minimumZoom = devLabRef.current ? getCityFitMinZoom(canvasRef.current, 140) : CITY_MIN_ZOOM;
        camera.zoom = clamp(camera.zoom * ratio, minimumZoom, CITY_MAX_ZOOM);

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

        clampCityCameraToWorld(camera.zoom <= minimumZoom + 0.000001);
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
    const viewport = getCityViewportMetrics(canvas);
    const worldX = (screenX - viewport.centerX) / camera.zoom + camera.x;
    const worldY = (screenY - viewport.centerY) / camera.zoom + camera.y;

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
    const minimumZoom = devLabRef.current
      ? getCityFitMinZoom(canvasRef.current, 140)
      : CITY_MIN_ZOOM;
    camera.zoom = clamp(camera.zoom * ratio, minimumZoom, CITY_MAX_ZOOM);
    clampCityCameraToWorld(camera.zoom <= minimumZoom + 0.000001);
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

  function clampCityCameraToWorld(forceCenter = false) {
    const canvas = canvasRef.current;
    const camera = cityCameraRef.current;

    if (!canvas) {
      camera.x = CITY_WIDTH / 2;
      camera.y = CITY_HEIGHT / 2;
      return;
    }

    const viewport = getCityViewportMetrics(canvas);
    const minimumZoom = devLabRef.current
      ? getCityFitMinZoom(canvas, 140)
      : CITY_MIN_ZOOM;
    const atMaximumDistance = camera.zoom <= minimumZoom + 0.000001;

    // At the farthest zoom the city is always locked to its own geometric
    // center and rendered at the exact center of the usable HUD viewport.
    // This prevents an inverted clamp range from pinning the map upward.
    if (forceCenter || atMaximumDistance) {
      camera.x = CITY_WIDTH / 2;
      camera.y = CITY_HEIGHT / 2;
      return;
    }

    const halfVisibleWidth = viewport.width / (2 * camera.zoom);
    const halfVisibleHeight = viewport.height / (2 * camera.zoom);
    const minX = -CITY_OUTSIDE_PADDING + halfVisibleWidth;
    const maxX = CITY_WIDTH + CITY_OUTSIDE_PADDING - halfVisibleWidth;
    const minY = -CITY_OUTSIDE_PADDING + halfVisibleHeight;
    const maxY = CITY_HEIGHT + CITY_OUTSIDE_PADDING - halfVisibleHeight;

    camera.x = minX <= maxX ? clamp(camera.x, minX, maxX) : CITY_WIDTH / 2;
    camera.y = minY <= maxY ? clamp(camera.y, minY, maxY) : CITY_HEIGHT / 2;
  }

  function beginDeveloperLabPanelDrag(event) {
    const rect = event.currentTarget.parentElement.getBoundingClientRect();
    devLabPanelDragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveDeveloperLabPanelDrag(event) {
    const drag = devLabPanelDragRef.current;
    const canvas = canvasRef.current;
    if (!canvas || drag.pointerId !== event.pointerId) return;
    const panelWidth = 148, panelHeight = 204, edge = 6;
    setDevLabPanelPosition({
      left: clamp(event.clientX - drag.offsetX, edge, canvas.clientWidth - panelWidth - edge),
      top: clamp(event.clientY - drag.offsetY, edge, canvas.clientHeight - panelHeight - edge),
    });
  }

  function endDeveloperLabPanelDrag(event) {
    if (devLabPanelDragRef.current.pointerId !== event.pointerId) return;
    devLabPanelDragRef.current.pointerId = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function getDeveloperLabPanelStyle() {
    const canvas = canvasRef.current;
    if (devLabPanelPosition) return { ...styles.devLabPanel, left: devLabPanelPosition.left, top: devLabPanelPosition.top, right: "auto" };
    if (!canvas || screen !== "city") return styles.devLabPanel;

    const panelWidth = 148;
    const panelHeight = 204;
    const edge = 10;
    const viewport = getCityViewportMetrics(canvas);
    const safeTop = viewport.top;
    const safeBottom = viewport.bottom;
    const camera = cityCameraRef.current;
    const mapWidth = CITY_WIDTH * camera.zoom;
    const mapHeight = CITY_HEIGHT * camera.zoom;
    const viewportCenterY = viewport.centerY;
    const mapLeft = canvas.clientWidth / 2 - mapWidth / 2;
    const mapRight = canvas.clientWidth / 2 + mapWidth / 2;
    const mapTop = viewportCenterY - mapHeight / 2;
    const mapBottom = viewportCenterY + mapHeight / 2;

    const candidates = [
      { score: Math.max(0, canvas.clientWidth - mapRight) * Math.max(0, canvas.clientHeight - safeTop - safeBottom), left: mapRight + edge, top: Math.max(safeTop, mapTop) },
      { score: Math.max(0, mapLeft) * Math.max(0, canvas.clientHeight - safeTop - safeBottom), left: mapLeft - panelWidth - edge, top: Math.max(safeTop, mapTop) },
      { score: Math.max(0, mapTop - safeTop) * canvas.clientWidth, left: canvas.clientWidth - panelWidth - edge, top: mapTop - panelHeight - edge },
      { score: Math.max(0, canvas.clientHeight - safeBottom - mapBottom) * canvas.clientWidth, left: canvas.clientWidth - panelWidth - edge, top: mapBottom + edge },
    ].filter((candidate) =>
      candidate.left >= edge && candidate.left + panelWidth <= canvas.clientWidth - edge &&
      candidate.top >= safeTop && candidate.top + panelHeight <= canvas.clientHeight - safeBottom
    ).sort((left, right) => right.score - left.score);

    const best = candidates[0];
    if (best) return { ...styles.devLabPanel, left: best.left, right: "auto", top: best.top };
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
          .city-grid-report-unused { display: none; }
          [aria-label="City grid diagnostics"] > div:first-child > div { display:flex; flex-direction:column; gap:3px; }
          [aria-label="City grid diagnostics"] > div:first-child > div small { color:#c4b5fd; font-size:8px; font-weight:950; letter-spacing:.1em; }
          [aria-label="City grid diagnostics"] > div:first-child > div strong { font-size:14px; }
          [aria-label="City grid diagnostics"] > div:first-child > button { width:34px; height:34px; border-radius:11px; border:1px solid rgba(255,255,255,.14); background:rgba(30,41,59,.82); color:#fff; font-size:20px; cursor:pointer; }
          [aria-label="City grid diagnostics"] > div:nth-child(2) > div { min-width:0; padding:9px; border-radius:13px; border:1px solid rgba(148,163,184,.18); background:rgba(15,23,42,.72); display:flex; flex-direction:column; gap:2px; }
          [aria-label="City grid diagnostics"] > div:nth-child(2) small { color:rgba(203,213,225,.58); font-size:7px; font-weight:950; }
          [aria-label="City grid diagnostics"] > div:nth-child(2) strong { font-size:16px; }
          [aria-label="City grid diagnostics"] > div:nth-child(2) span { color:rgba(226,232,240,.72); font-size:8px; }
          [aria-label="City grid diagnostics"] table th, [aria-label="City grid diagnostics"] table td { padding:8px; border-bottom:1px solid rgba(148,163,184,.12); }
          [aria-label="City grid diagnostics"] table th { color:#94a3b8; font-size:8px; }
          [aria-label="City grid diagnostics"] table th:first-child, [aria-label="City grid diagnostics"] table td:first-child { text-align:left; }
          [aria-label="City grid diagnostics"] table td:first-child small { display:block; margin-top:2px; color:#64748b; font-size:8px; }
          [aria-label="City grid diagnostics"] > div:nth-of-type(5) > div > div:first-child { display:flex; flex-direction:column; gap:2px; }
          [aria-label="City grid diagnostics"] > div:nth-of-type(5) > div > div:not(:first-child) { display:flex; flex-direction:column; gap:2px; text-align:right; }
          [aria-label="City grid diagnostics"] > div:nth-of-type(5) small { color:#64748b; font-size:7px; }
          @media (max-width: 520px) { [aria-label="City grid diagnostics"] > div:nth-of-type(5) > div { grid-template-columns:minmax(125px,1.4fr) repeat(3,minmax(54px,.7fr)) !important; gap:4px !important; padding:7px 6px !important; } }

          [aria-label="City grid diagnostics"] article > div:first-child > div { display:flex; flex-direction:column; gap:2px; }
          [aria-label="City grid diagnostics"] article > div:first-child > div:last-child { text-align:right; }
          [aria-label="City grid diagnostics"] article > div:first-child small { color:#64748b; font-size:7px; font-weight:950; letter-spacing:.06em; }
          [aria-label="City grid diagnostics"] article > div:first-child strong { color:#dffcff; font-size:13px; }
          [aria-label="City grid diagnostics"] article > div:first-child span { color:#64748b; font-size:8px; }
          [aria-label="City grid diagnostics"] table th, [aria-label="City grid diagnostics"] table td { white-space:nowrap; }
          [aria-label="City grid diagnostics"] table th:first-child, [aria-label="City grid diagnostics"] table td:first-child { text-align:left; }
          @media (max-width:520px) { [aria-label="City grid diagnostics"] article > div:first-child { grid-template-columns:1fr !important; } [aria-label="City grid diagnostics"] article > div:first-child > div:last-child { text-align:left !important; } }

          [aria-label="City grid diagnostics"] button { cursor:pointer; }
          [aria-label="City grid diagnostics"] > div:nth-of-type(3) button { min-height:34px; border-radius:10px; border:1px solid rgba(103,232,249,.42); background:rgba(8,47,73,.72); color:#a5f3fc; font-size:9px; font-weight:950; }
          [aria-label="City grid diagnostics"] > div:nth-of-type(3) small { grid-column:1/-1; color:#94a3b8; font-size:8px; text-align:center; }
          [aria-label="City grid diagnostics"] > div:nth-of-type(4) > div { padding:8px; border-radius:11px; background:rgba(15,23,42,.76); border:1px solid rgba(148,163,184,.14); display:flex; flex-direction:column; gap:2px; }
          [aria-label="City grid diagnostics"] > div:nth-of-type(4) small { color:#64748b; font-size:7px; font-weight:950; }
          [aria-label="City grid diagnostics"] > div:nth-of-type(4) span { color:#94a3b8; font-size:8px; }
          @media(max-width:520px){ [aria-label="City grid diagnostics"] > div:nth-of-type(4){grid-template-columns:repeat(2,minmax(0,1fr)) !important;} }

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
      {devLab && screen === "arena" && (
        <div style={getDeveloperLabPanelStyle()}>
          <div style={styles.devLabHeader} onPointerDown={beginDeveloperLabPanelDrag} onPointerMove={moveDeveloperLabPanelDrag} onPointerUp={endDeveloperLabPanelDrag} onPointerCancel={endDeveloperLabPanelDrag} onDoubleClick={() => setDevLabPanelPosition(null)} title="Drag panel · double tap to auto-place"><span>⠿ DEV LAB</span><b>LV {cityStats.level}</b></div>
          <div style={styles.devLabControls}>
            <button onClick={() => setDeveloperLevel(cityStats.level - 1)} disabled={cityStats.level <= 1}>−</button>
            <button onClick={() => setDeveloperLevel(cityStats.level + 1)} disabled={cityStats.level >= MAX_BUILDING_LEVEL}>＋</button>
            <button onClick={addDeveloperResources}>∞</button>
            <button onClick={exitDeveloperLab}>×</button>
          </div>
          <div style={styles.devLabBotLine}>
            <button style={styles.devLabBotButton} onClick={removeBotCoreForDevLab} disabled={botCount <= 0}>−</button>
            <span>BOTS</span>
            <strong>{botCount}</strong>
            <button style={styles.devLabBotButton} onClick={spawnBotCoreForDevLab}>＋</button>
          </div>
          <div style={styles.devLabBotLine}>
            <button style={styles.devLabBotButton} onClick={() => setBotDifficultyLevel(botDifficulty - 1)} disabled={botDifficulty <= BOT_DIFFICULTY_MIN_LEVEL}>−</button>
            <span>BOT DIFFICULTY</span>
            <strong>{botDifficulty}</strong>
            <button style={styles.devLabBotButton} onClick={() => setBotDifficultyLevel(botDifficulty + 1)} disabled={botDifficulty >= BOT_DIFFICULTY_MAX_LEVEL}>＋</button>
          </div>
          <div style={styles.devLabCityLine}><small>CORE B{cityStats.level} · CAP {formatCompactNumber(cityStats.guardCap)}</small></div>
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
                    {formatCompactXp(cityStats.xp)}/{formatCompactXp(getNextLevelXp(cityStats.level))}
                  </small>
                </div>

                <div style={styles.topResourceChip} title="Army · internal Core Barracks">
                  <span>⚔</span>
                  <strong>
                    {formatCompactNumber(totalGuards)}/{formatCompactNumber(armyCap)}
                  </strong>
                  <small>CORE B{cityStats.level}</small>
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
                      <strong>{formatCompactNumber(homeGuards)}/{formatCompactNumber(armyCap)}</strong>
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
                  <button disabled={!landingPreview.valid} style={{...styles.landButton,...(!landingPreview.valid?{opacity:0.42,filter:"grayscale(1)",cursor:"not-allowed"}:{})}} onClick={beginTeleportToLanding}>
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
                <button style={styles.iconControlButton} onClick={centerCamera} title="Center"><span style={styles.controlIcon}>◎</span></button>
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
  const blockX = landingPreview.x - GRID_STEP;
  const blockY = landingPreview.y - GRID_STEP;
  const t = Date.now() / 260;
  const pulse = 1 + Math.sin(t) * 0.04;
  const cells = landingPreview.cells || [];
  const valid = landingPreview.valid !== false;
  ctx.save();
  for (let row = 0; row < CORE_FOOTPRINT_CELLS; row += 1) {
    for (let column = 0; column < CORE_FOOTPRINT_CELLS; column += 1) {
      const cell = cells.find((item) => item.row === row && item.column === column);
      const occupied = Boolean(cell?.occupied);
      ctx.fillStyle = occupied ? "rgba(239,68,68,0.34)" : "rgba(34,211,238,0.18)";
      ctx.fillRect(blockX + column * GRID_STEP, blockY + row * GRID_STEP, GRID_STEP, GRID_STEP);
      ctx.strokeStyle = occupied ? "rgba(248,113,113,0.98)" : "rgba(34,211,238,0.82)";
      ctx.lineWidth = 3;
      ctx.strokeRect(blockX + column * GRID_STEP, blockY + row * GRID_STEP, GRID_STEP, GRID_STEP);
    }
  }
  ctx.strokeStyle = valid ? "rgba(34,211,238,0.95)" : "rgba(239,68,68,0.98)";
  ctx.lineWidth = 5;
  ctx.strokeRect(blockX, blockY, CORE_FOOTPRINT_SIZE, CORE_FOOTPRINT_SIZE);
  ctx.strokeStyle = "rgba(251,191,36,0.62)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(blockX + GRID_STEP, blockY);
  ctx.lineTo(blockX + GRID_STEP, blockY + CORE_FOOTPRINT_SIZE);
  ctx.moveTo(blockX, blockY + GRID_STEP);
  ctx.lineTo(blockX + CORE_FOOTPRINT_SIZE, blockY + GRID_STEP);
  ctx.stroke();
  ctx.globalAlpha = valid ? 0.95 : 0.72;
  ctx.beginPath();
  ctx.fillStyle = valid ? "rgba(34,211,238,0.16)" : "rgba(239,68,68,0.18)";
  ctx.arc(landingPreview.x, landingPreview.y, 58 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = valid ? "rgba(34,211,238,0.9)" : "rgba(248,113,113,0.95)";
  ctx.lineWidth = 4;
  ctx.arc(landingPreview.x, landingPreview.y, 50 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(251,191,36,0.82)";
  ctx.lineWidth = 3;
  ctx.arc(landingPreview.x, landingPreview.y, 31, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = valid ? "rgba(103,232,249,0.32)" : "rgba(239,68,68,0.28)";
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

function getArmyRepresentativeWeight(level) {
  return getGuardUnitWeight(level);
}

const ARMY_GENERATION_PALETTES = [
  [191,246,255],[45,212,191],[250,204,21],[251,146,60],[248,113,113],
  [244,114,182],[168,85,247],[59,130,246],[34,211,238],[245,158,11],
  [219,234,254],[163,230,53],[251,191,36],[236,72,153],[196,181,253],
  [56,189,248],[253,230,138],[225,29,72],[203,213,225],[255,255,255],
];

const ARMY_COLOR_MORPH_BY_STEP = [0, 0.2, 0.4, 0.62, 0.82];
const ARMY_MOTION_MORPH_BY_STEP = [0, 0.025, 0.07, 0.13, 0.22];
const ARMY_GENERATION_TURN_TOTAL_SECONDS = 10;
const ARMY_GENERATION_TURN_LAYER_DELAY_SECONDS = 1.2;
const ARMY_GENERATION_ENTRY_BLEND_TOTAL_SECONDS = 6.8;
const ARMY_GENERATION_ENTRY_LAYER_DELAY_SECONDS = 0.72;
const ARMY_LEVEL_COLOR_BLEND_TOTAL_SECONDS = 8;
const ARMY_LEVEL_COLOR_LAYER_DELAY_SECONDS = 0.45;
const ARMY_LEVEL_COLOR_COHORT_DELAY_SECONDS = 1.8;
// Keep production flight and level-up axis dive deliberately slow, close to generation-entry pacing.
const ARMY_PRODUCTION_SPAWN_SECONDS = 2.56;
const ARMY_LEVEL_AXIS_DIVE_SECONDS = ARMY_GENERATION_ENTRY_BLEND_TOTAL_SECONDS;
const ARMY_LEVEL_AXIS_DIVE_LAYER_DELAY_SECONDS = ARMY_GENERATION_ENTRY_LAYER_DELAY_SECONDS;

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function smoothArmyMorph(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function mixNumber(a, b, t) {
  return a + (b - a) * t;
}

function mixRgb(left, right, t) {
  return [
    Math.round(mixNumber(left[0], right[0], t)),
    Math.round(mixNumber(left[1], right[1], t)),
    Math.round(mixNumber(left[2], right[2], t)),
  ];
}

function rgbString(rgb) {
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

function rgbaString(rgb, alpha) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

function getLevelGenerationState(level) {
  const safeLevel = Math.max(1, Math.round(level || 1));
  const generation = Math.floor(Math.max(0, safeLevel - 1) / 5);
  const cycleStep = ((safeLevel - 1) % 5) + 1;
  const hasNextGeneration = generation < ARMY_GENERATION_PALETTES.length - 1;
  return {
    level: safeLevel,
    generation,
    cycleStep,
    colorMorphBase: hasNextGeneration ? ARMY_COLOR_MORPH_BY_STEP[cycleStep - 1] : 0,
    motionMorphBase: hasNextGeneration ? ARMY_MOTION_MORPH_BY_STEP[cycleStep - 1] : 0,
    morphToNext: hasNextGeneration ? ARMY_COLOR_MORPH_BY_STEP[cycleStep - 1] : 0,
  };
}

function isArmyGenerationTurnLevel(level) {
  const state = getLevelGenerationState(level);
  return state.cycleStep === 5 && state.generation < ARMY_GENERATION_PALETTES.length - 1;
}

function startArmyGenerationTurn(level) {
  const safeLevel = Math.max(1, Math.round(level || 1));
  if (!isArmyGenerationTurnLevel(safeLevel)) return;
  armyGenerationTurnState = {
    level: safeLevel,
    startedAt: Date.now() / 1000,
  };
}

function isArmyGenerationEntryLevel(level) {
  const state = getLevelGenerationState(level);
  return state.cycleStep === 1 && state.generation > 0;
}

function startArmyGenerationEntryTransition(level, fromLevel = Math.max(1, Math.round((level || 1) - 1))) {
  const safeLevel = Math.max(1, Math.round(level || 1));
  const safeFromLevel = Math.max(1, Math.round(fromLevel || safeLevel - 1));
  if (safeLevel <= safeFromLevel) return;
  armyGenerationEntryState = {
    fromLevel: safeFromLevel,
    level: safeLevel,
    startedAt: Date.now() / 1000,
  };
}

function getPreviousGenerationEntryUnit(unit) {
  const entry = armyGenerationEntryState || {};
  const previousLevel = Math.max(1, Math.round(entry.fromLevel || (unit?.level || 1) - 1));
  const previousState = getLevelGenerationState(previousLevel);
  return {
    ...unit,
    level: previousLevel,
    generation: previousState.generation,
    cycleStep: previousState.cycleStep,
    colorMorphBase: previousState.colorMorphBase,
    motionMorphBase: previousState.motionMorphBase,
    morphToNext: previousState.morphToNext,
  };
}

function getArmyGenerationEntryBlend({ unit, layer, time }) {
  const entry = armyGenerationEntryState || {};
  const levelMatches = Math.round(entry.level || 0) === Math.round(unit?.level || 0);
  const fromLevel = Math.max(1, Math.round(entry.fromLevel || (unit?.level || 1) - 1));
  const canBlend = levelMatches && fromLevel < Math.round(unit?.level || 0);
  if (!canBlend || !Number.isFinite(entry.startedAt) || entry.startedAt <= 0) {
    return { active: false, blend: 1, rawBlend: 1 };
  }
  const layerStart = entry.startedAt + Math.max(0, layer || 0) * ARMY_GENERATION_ENTRY_LAYER_DELAY_SECONDS;
  if (time <= layerStart) return { active: true, blend: 0, rawBlend: 0 };
  const elapsed = Math.max(0, time - layerStart);
  const rawBlend = clamp01(elapsed / ARMY_GENERATION_ENTRY_BLEND_TOTAL_SECONDS);
  return {
    active: rawBlend < 1,
    blend: smoothArmyMorph(rawBlend),
    rawBlend,
  };
}

function getArmyMorphSeed(level, layer, slotIndex) {
  const raw = Math.sin((level * 92821 + layer * 68917 + slotIndex * 19349) * 0.0001) * 43758.5453;
  return raw - Math.floor(raw);
}

function startArmyLevelColorTransition(fromLevel, toLevel) {
  const from = Math.max(1, Math.round(fromLevel || 1));
  const to = Math.max(1, Math.round(toLevel || 1));
  if (from === to) return;
  armyLevelColorTransitionState = {
    fromLevel: from,
    toLevel: to,
    startedAt: Date.now() / 1000,
  };
}


function startArmyLevelAxisDiveTransition(fromLevel, toLevel) {
  const from = Math.max(1, Math.round(fromLevel || 1));
  const to = Math.max(1, Math.round(toLevel || 1));
  if (from === to) return;
  armyLevelAxisDiveState = {
    fromLevel: from,
    toLevel: to,
    startedAt: Date.now() / 1000,
  };
}

function getArmyLevelAxisDive({ unit, layer, time }) {
  const state = armyLevelAxisDiveState || {};
  if (Math.round(state.toLevel || 0) !== Math.round(unit?.level || 0) || !Number.isFinite(state.startedAt) || state.startedAt <= 0) {
    return { active: false, progress: 1, fromLevel: unit?.level || 1, toLevel: unit?.level || 1 };
  }
  const start = state.startedAt + Math.max(0, layer || 0) * ARMY_LEVEL_AXIS_DIVE_LAYER_DELAY_SECONDS;
  if (time <= start) {
    return { active: true, progress: 0, fromLevel: state.fromLevel, toLevel: state.toLevel };
  }
  const raw = clamp01((time - start) / ARMY_LEVEL_AXIS_DIVE_SECONDS);
  return {
    active: raw < 1,
    progress: smoothArmyMorph(raw),
    rawProgress: raw,
    fromLevel: state.fromLevel,
    toLevel: state.toLevel,
  };
}

function getArmyColorMorphForState(state, transition = null) {
  const generation = Math.max(0, Math.min(ARMY_GENERATION_PALETTES.length - 1, Math.round(state.generation || 0)));
  const nextGeneration = Math.min(ARMY_GENERATION_PALETTES.length - 1, generation + 1);
  if (nextGeneration === generation) return 0;
  const base = state.colorMorphBase ?? state.morphToNext ?? 0;
  const layerBias = Number.isFinite(transition?.colorLayerBias)
    ? transition.colorLayerBias
    : ((transition?.layerDepth ?? 0.5) - 0.5) * 0.26;
  const cohortBias = Number.isFinite(transition?.colorCohortBias)
    ? transition.colorCohortBias
    : ((transition?.seed ?? 0.5) - 0.5) * 0.1;
  return clamp01(base + layerBias + cohortBias);
}

function sampleArmyPaletteState(state, transition = null) {
  const generation = Math.max(0, Math.min(ARMY_GENERATION_PALETTES.length - 1, Math.round(state.generation || 0)));
  const nextGeneration = Math.min(ARMY_GENERATION_PALETTES.length - 1, generation + 1);
  const rawMorph = getArmyColorMorphForState(state, transition);
  const morph = nextGeneration === generation ? 0 : smoothArmyMorph(rawMorph);
  const rgb = mixRgb(ARMY_GENERATION_PALETTES[generation], ARMY_GENERATION_PALETTES[nextGeneration], morph);
  return {
    rgb,
    morph,
    generationBlend: mixNumber(generation, nextGeneration, morph),
  };
}

function getArmyLevelColorTransition({ unit, layer, layerCount, slotIndex, time, transition = null }) {
  const state = armyLevelColorTransitionState || {};
  const levelMatches = Math.round(state.toLevel || 0) === Math.round(unit?.level || 0);
  if (!levelMatches || !Number.isFinite(state.startedAt) || state.startedAt <= 0) {
    return { active: false, blend: 1, fromLevel: unit?.level || 1, toLevel: unit?.level || 1 };
  }
  const layerDepth = transition?.layerDepth ?? 0.5;
  const seed = transition?.seed ?? getArmyMorphSeed(unit?.level || 1, layer || 0, slotIndex || 0);
  const safeLayerCount = Math.max(1, Math.round(layerCount || 1));
  const waveDelay = Math.max(0, layer || 0) * ARMY_LEVEL_COLOR_LAYER_DELAY_SECONDS;
  const cohortDelay = seed * ARMY_LEVEL_COLOR_COHORT_DELAY_SECONDS;
  const edgeDelay = layerDepth * 0.35;
  const start = state.startedAt + waveDelay + cohortDelay + edgeDelay;
  if (time <= start) {
    return { active: true, blend: 0, fromLevel: state.fromLevel, toLevel: state.toLevel };
  }
  const elapsed = Math.max(0, time - start);
  const rawBlend = clamp01(elapsed / ARMY_LEVEL_COLOR_BLEND_TOTAL_SECONDS);
  return {
    active: rawBlend < 1,
    blend: smoothArmyMorph(rawBlend),
    rawBlend,
    fromLevel: state.fromLevel,
    toLevel: state.toLevel,
    layerCount: safeLayerCount,
  };
}

function getArmyLayerTransition({ unit, layer, layerCount, slotIndex, time }) {
  const safeLayerCount = Math.max(1, Math.round(layerCount || 1));
  const layerDepth = safeLayerCount <= 1 ? 0.5 : clamp01(layer / Math.max(1, safeLayerCount - 1));
  const seed = getArmyMorphSeed(unit.level, layer, slotIndex);
  const colorBase = unit.colorMorphBase ?? unit.morphToNext ?? 0;
  const motionBase = unit.motionMorphBase ?? 0;
  const colorLayerBias = (layerDepth - 0.5) * 0.26;
  const colorCohortBias = (seed - 0.5) * 0.1;
  const colorMorph = clamp01(colorBase + colorLayerBias + colorCohortBias);
  const layerMotionFactor = 0.08 + 0.92 * layerDepth * layerDepth;
  const rareCohortBoost = seed > 0.9 ? 0.18 * layerDepth : 0;
  const motionMorph = clamp01(motionBase * (layerMotionFactor + rareCohortBoost));
  const transition = {
    layerDepth,
    seed,
    colorLayerBias,
    colorCohortBias,
    colorMorph,
    motionMorph: Math.min(0.32, motionMorph),
  };
  transition.levelColorTransition = getArmyLevelColorTransition({ unit, layer, layerCount: safeLayerCount, slotIndex, time, transition });
  return transition;
}

function getArmyGenerationPalette(source, transition = null) {
  const state = typeof source === "object" && source !== null
    ? source
    : getLevelGenerationState((Number(source) || 0) * 5 + 1);
  const target = sampleArmyPaletteState(state, transition);
  let rgb = target.rgb;
  let morph = target.morph;
  let generationBlend = target.generationBlend;
  const levelColor = transition?.levelColorTransition;
  if (levelColor?.active) {
    const previousState = getLevelGenerationState(levelColor.fromLevel);
    const previous = sampleArmyPaletteState(previousState, transition);
    const blend = clamp01(levelColor.blend);
    rgb = mixRgb(previous.rgb, target.rgb, blend);
    morph = mixNumber(previous.morph, target.morph, blend);
    generationBlend = mixNumber(previous.generationBlend, target.generationBlend, blend);
  }
  const [r, g, b] = rgb;
  const secondaryRgb = [Math.min(255, r + 24), Math.min(255, g + 24), Math.min(255, b + 24)];
  return {
    fill: rgbaString([r, g, b], 0.96),
    secondary: rgbaString(secondaryRgb, 0.86),
    tail: rgbaString([r, g, b], 0.2 + morph * 0.1),
    glow: rgbString([r, g, b]),
    core: generationBlend < 0.35 ? null : "rgba(255,255,255,0.94)",
    size: 3.4 + Math.min(1.8, generationBlend * 0.09),
    generationBlend,
    morphToNext: morph,
  };
}

function buildArmyRepresentatives(guardsByLevel) {
  const result = [];
  for (const [rawLevel, rawCount] of Object.entries(guardsByLevel || {})) {
    const level = Number(rawLevel);
    const visibleCount = Math.max(0, Math.floor(rawCount || 0));
    const weight = getArmyRepresentativeWeight(level);
    const state = getLevelGenerationState(level);
    for (let index = 0; index < visibleCount; index += 1) {
      result.push({ level, weight, representedCount: weight, fillRatio: 1,
        generation: state.generation, cycleStep: state.cycleStep,
        colorMorphBase: state.colorMorphBase, motionMorphBase: state.motionMorphBase,
        morphToNext: state.morphToNext });
    }
  }
  return result.sort((a,b) => a.level - b.level);
}


function createArmyUnitForLevel(level, baseUnit = {}) {
  const safeLevel = Math.max(1, Math.round(level || 1));
  const state = getLevelGenerationState(safeLevel);
  const weight = getArmyRepresentativeWeight(safeLevel);
  return {
    ...baseUnit,
    level: safeLevel,
    weight,
    representedCount: weight,
    fillRatio: baseUnit.fillRatio ?? 1,
    generation: state.generation,
    cycleStep: state.cycleStep,
    colorMorphBase: state.colorMorphBase,
    motionMorphBase: state.motionMorphBase,
    morphToNext: state.morphToNext,
  };
}

function getArmyGenerationDirection(generation, layer) {
  let direction = generation % 2 === 0 ? 1 : -1;
  if (generation === 8 || generation === 17) direction = layer % 2 === 0 ? 1 : -1;
  return direction;
}

function getArmyLayerTurnMotion({ unit, generation, layer, time }) {
  const currentDirection = getArmyGenerationDirection(generation, layer);
  const nextGeneration = Math.min(ARMY_GENERATION_PALETTES.length - 1, generation + 1);
  const nextDirection = getArmyGenerationDirection(nextGeneration, layer);
  const turn = armyGenerationTurnState || {};
  const levelMatches = Math.round(turn.level || 0) === Math.round(unit.level || 0);
  const canTurn = unit.cycleStep === 5 && nextGeneration !== generation && nextDirection !== currentDirection;
  if (!canTurn || !levelMatches || !Number.isFinite(turn.startedAt) || turn.startedAt <= 0) {
    return {
      signedDirection: currentDirection,
      tailDirection: currentDirection,
      directionTime: time * currentDirection,
      active: false,
    };
  }

  const layerStart = turn.startedAt + Math.max(0, layer || 0) * ARMY_GENERATION_TURN_LAYER_DELAY_SECONDS;
  if (time <= layerStart) {
    return {
      signedDirection: currentDirection,
      tailDirection: currentDirection,
      directionTime: time * currentDirection,
      active: true,
    };
  }

  const duration = ARMY_GENERATION_TURN_TOTAL_SECONDS;
  const elapsed = Math.max(0, time - layerStart);
  const clampedElapsed = Math.min(duration, elapsed);
  const signedDirection = elapsed < duration
    ? mixNumber(currentDirection, nextDirection, clampedElapsed / duration)
    : nextDirection;
  const turnIntegral =
    currentDirection * clampedElapsed +
    (nextDirection - currentDirection) * clampedElapsed * clampedElapsed / (2 * duration) +
    (elapsed > duration ? nextDirection * (elapsed - duration) : 0);
  return {
    signedDirection,
    tailDirection: Math.abs(signedDirection) > 0.08 ? Math.sign(signedDirection) : currentDirection,
    directionTime: layerStart * currentDirection + turnIntegral,
    active: true,
  };
}

function sampleArmyOrbitPosition({ player, unit, generation, slotIndex, itemsInLayer, layer, time, transition = null }) {
  const turnMotion = getArmyLayerTurnMotion({ unit, generation, layer, time, transition });
  const direction = turnMotion.signedDirection;
  const baseRadius = player.r + 34 + layer * 16 + generation * 2.5;
  const speed = Math.max(0.24, 1.22 - layer * 0.1 - generation * 0.018);
  let angle = turnMotion.directionTime * speed + slotIndex / Math.max(1, itemsInLayer) * Math.PI * 2 + layer * 0.8 + unit.level * 0.07;
  const phase = slotIndex * 0.71 + layer * 1.13;
  let radius = baseRadius;
  let xScale = 1, yScale = 1, selfRotation = angle;
  const g = generation;
  if (g === 1) radius += Math.sin(angle * 3 + time * 1.6) * 7;
  else if (g === 2) selfRotation = time * 2.4 + phase;
  else if (g === 3) { xScale = 1.18; yScale = 0.76; }
  else if (g === 4) radius *= 1 + Math.sin(time * 2 + phase) * 0.11;
  else if (g === 5) radius += (Math.sin(angle * 2 + time) + Math.sin(angle * 5 - time * 1.3)) * 4;
  else if (g === 6) radius += (slotIndex % 2 ? 1 : -1) * 8 + Math.sin(time + phase) * 3;
  else if (g === 7) angle += Math.sin(time * 1.3 + (slotIndex % 3) * 2.094) * 0.18;
  else if (g === 8) radius += Math.sin(angle * 4) * 6;
  else if (g === 9) radius += Math.cos(angle * 5) * 9;
  else if (g === 10) angle += Math.sin(angle * 4) * 0.12;
  else if (g === 11) radius += Math.sin(angle * 6 + time * 2) * 8;
  else if (g === 12) { xScale = 1.24; yScale = 0.72 + Math.sin(time + phase) * 0.09; }
  else if (g === 13) angle += Math.sin(Math.floor(((angle%(Math.PI*2))+Math.PI*2)/(Math.PI/2)) * 1.7 + time) * 0.16;
  else if (g === 14) { xScale = 1 + Math.sin(time * 0.45) * 0.2; yScale = 1 - Math.sin(time * 0.45) * 0.16; }
  else if (g === 15) selfRotation = time * 4.2 * direction + phase;
  else if (g === 16) { xScale = Math.cos(angle); yScale = Math.sin(angle * 2) * 0.65; }
  else if (g === 17) radius += Math.sin(angle * 4 + time * direction) * 10;
  else if (g === 18) radius += Math.cos(angle * 7) * 10;
  else if (g === 19) { radius += Math.sin(angle * 5 + time * 1.7) * 9; selfRotation = time * 4 * direction + phase; xScale = 1.08; yScale = 0.86; }
  const x = player.x + Math.cos(angle) * radius * xScale;
  const y = player.y + Math.sin(angle) * radius * yScale;
  const tailAngle = angle - 0.08 * turnMotion.tailDirection;
  const tailX = player.x + Math.cos(tailAngle) * radius * xScale;
  const tailY = player.y + Math.sin(tailAngle) * radius * yScale;
  return { x, y, tailX, tailY, angle, tailAngle, selfRotation, radius, xScale, yScale };
}

function getArmyOrbitPosition({ player, unit, slotIndex, itemsInLayer, layer, time, transition = null }) {
  const generation = Math.max(0, Math.min(ARMY_GENERATION_PALETTES.length - 1, unit.generation || 0));
  const nextGeneration = Math.min(ARMY_GENERATION_PALETTES.length - 1, generation + 1);
  const entryBlend = getArmyGenerationEntryBlend({ unit, layer, time });
  if (entryBlend.active) {
    const previousUnit = getPreviousGenerationEntryUnit(unit);
    const previousGeneration = Math.max(0, Math.min(ARMY_GENERATION_PALETTES.length - 1, previousUnit.generation || 0));
    const previous = sampleArmyOrbitPosition({
      player,
      unit: previousUnit,
      generation: previousGeneration,
      slotIndex,
      itemsInLayer,
      layer,
      time,
      transition: { layerDepth: transition?.layerDepth ?? 0.5, seed: transition?.seed ?? 0.5, colorMorph: previousUnit.colorMorphBase || 0, motionMorph: 0 },
    });
    const current = sampleArmyOrbitPosition({ player, unit, generation, slotIndex, itemsInLayer, layer, time, transition });
    const rawBlend = clamp01(entryBlend.rawBlend ?? entryBlend.blend);
    const inwardPart = 0.36;
    const previousAngle = Number.isFinite(previous.angle)
      ? previous.angle
      : Math.atan2(previous.y - player.y, previous.x - player.x);
    const currentAngle = Number.isFinite(current.angle)
      ? current.angle
      : Math.atan2(current.y - player.y, current.x - player.x);
    const coreIn = {
      x: player.x,
      y: player.y,
      tailX: player.x,
      tailY: player.y,
      angle: previousAngle,
      tailAngle: previousAngle,
      selfRotation: previous.selfRotation,
      radius: 0,
      xScale: previous.xScale,
      yScale: previous.yScale,
    };
    const coreOutRadius = player.r + 8;
    const coreOut = {
      x: player.x + Math.cos(currentAngle) * coreOutRadius,
      y: player.y + Math.sin(currentAngle) * coreOutRadius,
      tailX: player.x,
      tailY: player.y,
      angle: currentAngle,
      tailAngle: currentAngle,
      selfRotation: current.selfRotation,
      radius: coreOutRadius,
      xScale: current.xScale,
      yScale: current.yScale,
    };
    const outwardRaw = clamp01((rawBlend - inwardPart) / Math.max(0.001, 1 - inwardPart));
    const diveBlend = rawBlend < inwardPart
      ? smoothArmyMorph(rawBlend / inwardPart)
      : smoothArmyMorph(outwardRaw);
    const fromPos = rawBlend < inwardPart ? previous : coreOut;
    const toPos = rawBlend < inwardPart ? coreIn : current;
    const visualBlend = rawBlend < inwardPart ? 0 : diveBlend;
    return {
      x: mixNumber(fromPos.x, toPos.x, diveBlend),
      y: mixNumber(fromPos.y, toPos.y, diveBlend),
      tailX: mixNumber(fromPos.tailX, toPos.tailX, diveBlend),
      tailY: mixNumber(fromPos.tailY, toPos.tailY, diveBlend),
      angle: mixNumber(fromPos.angle, toPos.angle, diveBlend),
      tailAngle: mixNumber(fromPos.tailAngle, toPos.tailAngle, diveBlend),
      selfRotation: mixNumber(fromPos.selfRotation, toPos.selfRotation, diveBlend),
      radius: mixNumber(fromPos.radius, toPos.radius, diveBlend),
      xScale: mixNumber(fromPos.xScale, toPos.xScale, diveBlend),
      yScale: mixNumber(fromPos.yScale, toPos.yScale, diveBlend),
      entryActive: true,
      entryBlend: visualBlend,
      previousUnit,
    };
  }
  const morph = nextGeneration === generation ? 0 : smoothArmyMorph(transition?.motionMorph ?? unit.motionMorphBase ?? 0);
  const current = sampleArmyOrbitPosition({ player, unit, generation, slotIndex, itemsInLayer, layer, time, transition });
  if (unit.cycleStep === 5 && nextGeneration !== generation) return current;
  if (morph <= 0.0001) return current;
  const next = sampleArmyOrbitPosition({ player, unit, generation: nextGeneration, slotIndex, itemsInLayer, layer, time, transition });
  return {
    x: mixNumber(current.x, next.x, morph),
    y: mixNumber(current.y, next.y, morph),
    tailX: mixNumber(current.tailX, next.tailX, morph),
    tailY: mixNumber(current.tailY, next.tailY, morph),
    angle: mixNumber(current.angle, next.angle, morph),
    tailAngle: mixNumber(current.tailAngle, next.tailAngle, morph),
    selfRotation: mixNumber(current.selfRotation, next.selfRotation, morph),
    radius: mixNumber(current.radius, next.radius, morph),
    xScale: mixNumber(current.xScale, next.xScale, morph),
    yScale: mixNumber(current.yScale, next.yScale, morph),
  };
}

function drawMergedGuard(ctx, unit, x, y, rotation, visual) {
  const size = visual.size + Math.min(2.2, unit.generation * 0.12 + unit.cycleStep * 0.09);
  const alpha = Number.isFinite(visual.alpha) ? clamp01(visual.alpha) : 1;
  ctx.save(); ctx.translate(x,y); ctx.rotate(rotation); ctx.globalAlpha = (0.45 + unit.fillRatio * 0.55) * alpha;
  ctx.fillStyle = visual.fill; ctx.shadowColor = visual.glow; ctx.shadowBlur = 10 + Math.min(12, unit.generation);
  const dot=(dx,dy,r,secondary=false)=>{ctx.beginPath();ctx.fillStyle=secondary?visual.secondary:visual.fill;ctx.arc(dx,dy,r,0,Math.PI*2);ctx.fill();};
  const spread=size*0.82;
  if(unit.cycleStep===1) dot(0,0,size);
  else if(unit.cycleStep===2){dot(-spread*.7,0,size*.7);dot(spread*.7,0,size*.7,true);}
  else if(unit.cycleStep===3){dot(-spread,0,size*.52);dot(spread,0,size*.52,true);dot(0,-spread,size*.52,true);dot(0,spread,size*.52);dot(0,0,size*.44);}
  else if(unit.cycleStep===4){for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;dot(Math.cos(a)*spread,Math.sin(a)*spread,size*.48,i%2===1);}dot(0,0,size*.5,true);}
  else {for(let i=0;i<6;i++){const a=i*Math.PI/3;dot(Math.cos(a)*spread,Math.sin(a)*spread,size*.44,i%2===1);}dot(0,0,size*.58,true);}
  if(visual.core){ctx.shadowBlur=0;ctx.fillStyle=visual.core;ctx.beginPath();ctx.arc(0,0,Math.max(1.05,size*.25),0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawOrbitGuards(ctx, player, guardsByLevel, productionSpawns = []) {
  if (!player || !guardsByLevel) return;
  const units = buildArmyRepresentatives(guardsByLevel); if (!units.length) return;
  const now = Date.now()/1000, layerSize=42, layerCount=Math.max(1, Math.ceil(units.length/layerSize));
  const levelTotals = {};
  for (const unit of units) levelTotals[unit.level] = (levelTotals[unit.level] || 0) + 1;
  const activeByLevel = {};
  for (const spawn of productionSpawns || []) {
    const level = Math.round(spawn?.level || 0);
    const totalForLevel = levelTotals[level] || 0;
    if (!totalForLevel) continue;
    const spawnStart = spawn.createdAt || 0;
    if (now < spawnStart) continue;
    const progressRaw = clamp01((now - spawnStart) / Math.max(0.001, spawn.duration || ARMY_PRODUCTION_SPAWN_SECONDS));
    if (progressRaw >= 1) continue;
    const list = activeByLevel[level] || (activeByLevel[level] = []);
    if (list.length < totalForLevel) list.push({ ...spawn, progress: smoothArmyMorph(progressRaw) });
  }
  const activeSpawns = Object.values(activeByLevel).flat();
  const oldestActiveSpawn = activeSpawns.reduce((oldest, spawn) => Math.min(oldest, spawn.createdAt || now), now);
  const activeProductionRaw = activeSpawns.length
    ? clamp01((now - oldestActiveSpawn) / Math.max(0.001, ARMY_PRODUCTION_SPAWN_SECONDS))
    : 1;
  const productionBlend = activeSpawns.length
    ? smoothArmyMorph(clamp01((activeProductionRaw - 0.72) / 0.28))
    : 1;
  const oldUnitCount = Math.max(0, units.length - activeSpawns.length);
  const oldLayerCount = Math.max(1, Math.ceil(Math.max(1, oldUnitCount) / layerSize));
  const levelSeen = {};
  let spawnedBefore = 0;
  ctx.save();
  for(let i=0;i<units.length;i++){
    let unit=units[i]; const layer=Math.floor(i/layerSize);
    levelSeen[unit.level] = (levelSeen[unit.level] || 0) + 1;
    const activeForLevel = activeByLevel[unit.level] || [];
    const totalForLevel = levelTotals[unit.level] || 0;
    const spawnOrdinal = levelSeen[unit.level] - (totalForLevel - activeForLevel.length) - 1;
    const spawnInfo = spawnOrdinal >= 0 ? activeForLevel[spawnOrdinal] : null;
    const indexInLayer=i%layerSize, itemsInLayer=Math.min(layerSize,units.length-layer*layerSize);
    const transition=getArmyLayerTransition({unit,layer,layerCount,slotIndex:indexInLayer,time:now});
    const cleanTransition={...transition,levelColorTransition:{active:false,blend:1,fromLevel:unit.level,toLevel:unit.level}};
    let visual=getArmyGenerationPalette(unit,transition);
    const targetPos=getArmyOrbitPosition({player,unit,slotIndex:indexInLayer,itemsInLayer,layer,time:now,transition:cleanTransition});
    let pos = targetPos;
    const axisDive = { active: false };
    if (axisDive.active && !spawnInfo) {
      const previousUnit = createArmyUnitForLevel(axisDive.fromLevel, unit);
      const previousTransitionRaw = getArmyLayerTransition({unit:previousUnit,layer,layerCount,slotIndex:indexInLayer,time:now});
      const previousTransition={...previousTransitionRaw,levelColorTransition:{active:false,blend:1,fromLevel:previousUnit.level,toLevel:previousUnit.level}};
      const previousPos = getArmyOrbitPosition({player,unit:previousUnit,slotIndex:indexInLayer,itemsInLayer,layer,time:now,transition:previousTransition});
      const diveProgress = clamp01(axisDive.progress || 0);
      if (diveProgress < 0.5) {
        const inward = smoothArmyMorph(diveProgress * 2);
        visual = getArmyGenerationPalette(previousUnit, previousTransition);
        pos = {
          ...previousPos,
          x: mixNumber(previousPos.x, player.x, inward),
          y: mixNumber(previousPos.y, player.y, inward),
          tailX: mixNumber(Number.isFinite(previousPos.tailX) ? previousPos.tailX : previousPos.x, player.x, inward),
          tailY: mixNumber(Number.isFinite(previousPos.tailY) ? previousPos.tailY : previousPos.y, player.y, inward),
        };
        unit = previousUnit;
      } else {
        const outward = smoothArmyMorph((diveProgress - 0.5) * 2);
        visual = getArmyGenerationPalette(unit, cleanTransition);
        pos = {
          ...targetPos,
          x: mixNumber(player.x, targetPos.x, outward),
          y: mixNumber(player.y, targetPos.y, outward),
          tailX: mixNumber(player.x, Number.isFinite(targetPos.tailX) ? targetPos.tailX : targetPos.x, outward),
          tailY: mixNumber(player.y, Number.isFinite(targetPos.tailY) ? targetPos.tailY : targetPos.y, outward),
        };
      }
    }
    if (spawnInfo) {
      const flight = clamp01((now - (spawnInfo.createdAt || now)) / Math.max(0.001, spawnInfo.duration || ARMY_PRODUCTION_SPAWN_SECONDS));
      const easedFlight = smoothArmyMorph(flight);
      pos = {
        ...targetPos,
        x: mixNumber(player.x, targetPos.x, easedFlight),
        y: mixNumber(player.y, targetPos.y, easedFlight),
        tailX: mixNumber(player.x, Number.isFinite(targetPos.tailX) ? targetPos.tailX : targetPos.x, easedFlight),
        tailY: mixNumber(player.y, Number.isFinite(targetPos.tailY) ? targetPos.tailY : targetPos.y, easedFlight),
      };
      spawnedBefore += 1;
    } else if (activeSpawns.length && oldUnitCount > 0) {
      const oldFlatIndex = Math.max(0, i - spawnedBefore);
      const oldLayer = Math.floor(oldFlatIndex / layerSize);
      const oldIndexInLayer = oldFlatIndex % layerSize;
      const oldItemsInLayer = Math.min(layerSize, Math.max(1, oldUnitCount - oldLayer * layerSize));
      const oldTransition = getArmyLayerTransition({unit,layer:oldLayer,layerCount:oldLayerCount,slotIndex:oldIndexInLayer,time:now});
      const oldPos = getArmyOrbitPosition({player,unit,slotIndex:oldIndexInLayer,itemsInLayer:oldItemsInLayer,layer:oldLayer,time:now,transition:oldTransition});
      pos = {
        ...targetPos,
        x: mixNumber(oldPos.x, targetPos.x, productionBlend),
        y: mixNumber(oldPos.y, targetPos.y, productionBlend),
        tailX: mixNumber(Number.isFinite(oldPos.tailX) ? oldPos.tailX : oldPos.x, Number.isFinite(targetPos.tailX) ? targetPos.tailX : targetPos.x, productionBlend),
        tailY: mixNumber(Number.isFinite(oldPos.tailY) ? oldPos.tailY : oldPos.y, Number.isFinite(targetPos.tailY) ? targetPos.tailY : targetPos.y, productionBlend),
        angle: mixNumber(oldPos.angle, targetPos.angle, productionBlend),
        tailAngle: mixNumber(oldPos.tailAngle, targetPos.tailAngle, productionBlend),
        selfRotation: mixNumber(oldPos.selfRotation, targetPos.selfRotation, productionBlend),
        radius: mixNumber(oldPos.radius, targetPos.radius, productionBlend),
        xScale: mixNumber(oldPos.xScale, targetPos.xScale, productionBlend),
        yScale: mixNumber(oldPos.yScale, targetPos.yScale, productionBlend),
      };
    }
    const tailX=Number.isFinite(pos.tailX)?pos.tailX:player.x+Math.cos(pos.tailAngle)*pos.radius*pos.xScale, tailY=Number.isFinite(pos.tailY)?pos.tailY:player.y+Math.sin(pos.tailAngle)*pos.radius*pos.yScale;
    ctx.beginPath();ctx.strokeStyle=visual.tail;ctx.globalAlpha=.45+unit.fillRatio*.45;ctx.lineWidth=1.35+Math.min(1.6,visual.generationBlend*.08);ctx.moveTo(tailX,tailY);ctx.lineTo(pos.x,pos.y);ctx.stroke();ctx.globalAlpha=1;
    if (pos.entryActive && pos.previousUnit && pos.entryBlend < 0.999) {
      const previousVisual = {
        ...getArmyGenerationPalette(pos.previousUnit, {
          layerDepth: transition.layerDepth,
          seed: transition.seed,
          colorMorph: pos.previousUnit.colorMorphBase ?? pos.previousUnit.morphToNext ?? 0,
          motionMorph: 0,
        }),
        alpha: Math.max(0, 1 - pos.entryBlend),
      };
      drawMergedGuard(ctx,pos.previousUnit,pos.x,pos.y,pos.selfRotation,previousVisual);
    }
    const currentVisual = pos.entryActive ? { ...visual, alpha: Math.max(0.08, pos.entryBlend) } : visual;
    drawMergedGuard(ctx,unit,pos.x,pos.y,pos.selfRotation,currentVisual);
  }
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
    const visualElementCount = getTotalGuardElementsFromMap(march.guardsByLevel || {});
    const visibleCount = Math.min(Math.max(1, visualElementCount || count), 110);
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
    ctx.fillText(formatCompactNumber(count), centerX + nx * 4, centerY + ny * 4 - 25);
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
function getCoreArmyVisualExtent(core, guardsByLevel, time = Date.now() / 1000) {
  const coreRadius = Math.max(1, Number(core?.r) || 30);
  const units = buildArmyRepresentatives(guardsByLevel || {});
  if (!units.length) {
    return { topExtent: coreRadius, outerRadius: coreRadius, visibleElements: 0, layerCount: 0 };
  }
  const layerSize = 42;
  const layerCount = Math.max(1, Math.ceil(units.length / layerSize));
  let topEdge = core.y - coreRadius;
  let outerRadius = coreRadius;
  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    const layer = Math.floor(index / layerSize);
    const slotIndex = index % layerSize;
    const itemsInLayer = Math.min(layerSize, units.length - layer * layerSize);
    const transition = getArmyLayerTransition({ unit, layer, layerCount, slotIndex, time });
    const position = getArmyOrbitPosition({
      player: core, unit, slotIndex, itemsInLayer, layer, time, transition,
    });
    const visualPadding = CORE_NAMEPLATE_VISUAL_PADDING + Math.min(8, Math.max(0, Number(unit?.cycleStep || 1) - 1));
    topEdge = Math.min(topEdge, position.y - visualPadding);
    outerRadius = Math.max(outerRadius, Math.hypot(position.x - core.x, position.y - core.y) + visualPadding);
  }
  return {
    topExtent: Math.max(coreRadius, core.y - topEdge),
    outerRadius,
    visibleElements: units.length,
    layerCount,
  };
}

function drawCoreStatusBarBackground(ctx, left, top, width, height) {
  ctx.fillStyle = "rgba(2,6,23,0.86)";
  ctx.fillRect(left, top, width, height);
  ctx.strokeStyle = "rgba(148,163,184,0.55)";
  ctx.lineWidth = 1;
  ctx.strokeRect(left, top, width, height);
}

function drawCoreAwayHatch(ctx, left, top, width, height) {
  if (width <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, width, height);
  ctx.clip();
  ctx.fillStyle = "rgba(56,189,248,0.34)";
  ctx.fillRect(left, top, width, height);
  ctx.strokeStyle = "rgba(186,230,253,0.92)";
  ctx.lineWidth = 1;
  for (let x = left - height; x < left + width + height; x += 5) {
    ctx.beginPath();
    ctx.moveTo(x, top + height);
    ctx.lineTo(x + height, top);
    ctx.stroke();
  }
  ctx.restore();
}

function getCoreDurabilityColor(ratio) {
  if (ratio <= 0.25) return "#ef4444";
  if (ratio <= 0.55) return "#f59e0b";
  return "#22c55e";
}

function drawSelectedCoreBars(ctx, core, labelY, status) {
  if (!status) return;
  const width = CORE_STATUS_BAR_WIDTH;
  const height = CORE_STATUS_BAR_HEIGHT;
  const left = core.x - width / 2;
  const armyTop = labelY + 2;
  const durabilityTop = armyTop + height + CORE_STATUS_BAR_GAP;
  drawCoreStatusBarBackground(ctx, left, armyTop, width, height);
  const homeWidth = width * clamp01(status.homeRatio);
  const awayWidth = Math.min(width - homeWidth, width * clamp01(status.awayRatio));
  if (homeWidth > 0) {
    ctx.fillStyle = "rgba(103,232,249,0.96)";
    ctx.fillRect(left, armyTop, homeWidth, height);
  }
  drawCoreAwayHatch(ctx, left + homeWidth, armyTop, awayWidth, height);
  drawCoreStatusBarBackground(ctx, left, durabilityTop, width, height);
  const durabilityRatio = clamp01(status.durability / status.maxDurability);
  ctx.fillStyle = getCoreDurabilityColor(durabilityRatio);
  ctx.fillRect(left, durabilityTop, width * durabilityRatio, height);
}

function drawCoreNameplate(ctx, core, guardsByLevel = {}, selected = false, status = null) {
  if (!core?.name) return;
  const extent = getCoreArmyVisualExtent(core, guardsByLevel);
  const labelY = core.y - extent.topExtent - CORE_NAMEPLATE_GAP;
  ctx.save();
  ctx.font = "800 18px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(2,6,23,0.88)";
  const label = `${core.name} · LV ${Math.round(core.level || 1)}`;
  ctx.strokeText(label, core.x, labelY);
  ctx.fillStyle = selected ? "#fca5a5" : "#e0f2fe";
  ctx.fillText(label, core.x, labelY);
  if (selected) {
    drawSelectedCoreBars(ctx, core, labelY, status);
    ctx.beginPath(); ctx.strokeStyle = "rgba(248,113,113,0.95)"; ctx.lineWidth = 4;
    ctx.arc(core.x, core.y, (core.r || 30) + 11, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
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

  const coreState = getLevelGenerationState(cityLevel);
  const coreVisual = getArmyGenerationPalette(coreState);
  const coreMorph = coreVisual.morphToNext || 0;
  if (coreMorph > 0.02 || cityLevel >= 2) {
    const pulse = 1 + Math.sin(Date.now() / 420) * 0.025;
    ctx.beginPath();
    ctx.strokeStyle = coreVisual.tail;
    ctx.lineWidth = 2 + coreMorph * 3;
    ctx.arc(player.x, player.y, (player.r + 8 + coreMorph * 10) * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (coreMorph > 0.42) {
    ctx.beginPath();
    ctx.strokeStyle = coreVisual.fill.replace("0.96", "0.36");
    ctx.lineWidth = 2;
    ctx.arc(player.x, player.y, player.r + 18 + coreMorph * 7, 0, Math.PI * 2);
    ctx.stroke();
  }

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
  const safeLevel = Math.max(1, Math.round(level || 1));
  const newestGeneration = getCityGeneration(safeLevel);

  // All placement maths continues to use the original 1x1 cell. Rendering only
  // changes emphasis. A generation starts fully visible and its internal lines
  // fade by 5% per level over twenty levels.
  for (let gridGeneration = 0; gridGeneration <= newestGeneration; gridGeneration += 1) {
    const startLevel = 1 + gridGeneration * 5;
    const age = Math.max(0, safeLevel - startLevel);
    const visibility = clamp(1 - age * 0.05, 0, 1);
    if (visibility <= 0) continue;

    const step = CITY_GRID_STEP * Math.pow(2, gridGeneration);
    const isNewest = gridGeneration === newestGeneration;
    const alpha = (isNewest ? 0.22 : 0.13) * visibility;
    ctx.lineWidth = isNewest ? 2.2 : 1;

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
    ctx.beginPath();
    ctx.strokeStyle = building.type === "Citadel" ? "rgba(167,139,250,0.48)" : "rgba(148,163,184,0.18)";
    ctx.lineWidth = building.type === "Citadel" ? 5 : 2;
    roundedRect(ctx, building.x + 2, building.y + 2, width - 4, height - 4, 20);
    ctx.stroke();
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

function BuildingPortrait({ type, level = 1, width = 72, height = 58, compact = false }) {
  const portraitRef = useRef(null);

  useEffect(() => {
    const canvas = portraitRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const definition = BUILDINGS[type] || { w: 1, h: 1 };
    let footprint = type === "Citadel"
      ? { w: 4 * Math.pow(2, getCityGeneration(level)), h: 4 * Math.pow(2, getCityGeneration(level)) }
      : { w: definition.w, h: definition.h };
    if (type !== "Citadel") {
      for (let current = 2; current <= level; current += 1) {
        const cycleStep = ((current - 2) % 5 + 5) % 5;
        if (cycleStep === 0) footprint.w *= 2;
        if (cycleStep === 1) footprint.h *= 2;
      }
    }

    // Render at the exact native city footprint first, then scale the finished
    // pixels into the passport frame. This keeps all proportions identical to
    // the building on the city canvas instead of recalculating it at icon size.
    const nativeWidth = footprint.w * CITY_GRID_STEP;
    const nativeHeight = footprint.h * CITY_GRID_STEP;
    const nativePadding = Math.max(28, Math.round(Math.min(nativeWidth, nativeHeight) * 0.12));
    const source = document.createElement("canvas");
    source.width = Math.ceil(nativeWidth + nativePadding * 2);
    source.height = Math.ceil(nativeHeight + nativePadding * 2);
    const sourceCtx = source.getContext("2d");
    if (!sourceCtx) return;

    const building = {
      id: "portrait",
      type,
      level,
      x: nativePadding,
      y: nativePadding,
      w: footprint.w,
      h: footprint.h,
      trainTimer: 0,
    };
    const cx = nativePadding + nativeWidth / 2;
    const cy = nativePadding + nativeHeight / 2;
    sourceCtx.save();
    sourceCtx.fillStyle = "rgba(0,0,0,0.28)";
    roundedRect(sourceCtx, building.x + 8, building.y + 10, nativeWidth, nativeHeight, 22);
    sourceCtx.fill();
    if (type === "CrystalPoint") drawCrystalPointBuilding(sourceCtx, building, nativeWidth, nativeHeight, cx, cy);
    else if (type === "House") drawHouseBuilding(sourceCtx, building, nativeWidth, nativeHeight);
    else if (type === "Barracks") drawBarracksBuilding(sourceCtx, building, nativeWidth, nativeHeight);
    else drawCitadelBuilding(sourceCtx, building, nativeWidth, nativeHeight, cx, cy);
    if (type !== "Citadel" && level > 1) {
      drawAutoFitEvolution(sourceCtx, building, nativeWidth, nativeHeight, cx, cy);
    }
    sourceCtx.restore();

    const inset = compact ? 2 : 3;
    const availableWidth = width - inset * 2;
    const availableHeight = height - inset * 2;
    const scale = Math.min(availableWidth / source.width, availableHeight / source.height);
    const targetWidth = source.width * scale;
    const targetHeight = source.height * scale;
    const targetX = (width - targetWidth) / 2;
    const targetY = (height - targetHeight) / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, targetX, targetY, targetWidth, targetHeight);
  }, [type, level, width, height, compact]);

  return <canvas ref={portraitRef} aria-label={`${type} level ${level}`} style={styles.buildingPortraitCanvas} />;
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
  devLabBotLine: { display:"grid",gridTemplateColumns:"24px 1fr 28px 24px",alignItems:"center",gap:4,margin:"5px 0",padding:"5px",borderRadius:10,border:"1px solid rgba(103,232,249,.22)",background:"rgba(8,47,73,.36)",color:"#a5f3fc",fontSize:8,fontWeight:950,letterSpacing:".06em" },
  devLabBotButton: { height:22,borderRadius:7,border:"1px solid rgba(103,232,249,.38)",background:"rgba(15,23,42,.82)",color:"#e0f2fe",fontWeight:950,cursor:"pointer" },
  devLabCityLine: { display:"flex",alignItems:"center",justifyContent:"space-between",gap:6 },
  devLabGridReportButton: { minWidth:54,height:22,padding:"0 7px",borderRadius:7,border:"1px solid rgba(103,232,249,.48)",background:"rgba(8,47,73,.72)",color:"#a5f3fc",fontSize:8,fontWeight:950,letterSpacing:".05em",cursor:"pointer" },
  cityGridReportBackdrop: { position:"fixed",inset:0,zIndex:240,display:"grid",placeItems:"center",padding:12,boxSizing:"border-box",background:"rgba(0,4,12,.78)",backdropFilter:"blur(9px)" },
  cityGridReportModal: { width:"min(720px,100%)",maxHeight:"min(820px,calc(100vh - 24px))",overflowY:"auto",padding:14,boxSizing:"border-box",borderRadius:22,background:"linear-gradient(180deg,rgba(16,24,45,.99),rgba(3,10,24,.99))",border:"1px solid rgba(192,132,252,.72)",boxShadow:"0 28px 80px rgba(0,0,0,.72),0 0 34px rgba(168,85,247,.18)",color:"#e5f4ff" },
  cityGridReportHeader: { display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:12 },
  cityGridReportSummary: { display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:7,marginBottom:14 },
  cityGridReportSectionTitle: { margin:"12px 0 6px",color:"#c4b5fd",fontSize:9,fontWeight:950,letterSpacing:".1em" },
  cityGridReportTableWrap: { overflowX:"auto",borderRadius:13,border:"1px solid rgba(148,163,184,.18)" },
  cityGridReportTable: { width:"100%",minWidth:490,borderCollapse:"collapse",fontSize:10,textAlign:"right" },
  cityGridReportOk: { borderColor:"rgba(34,197,94,.54)",color:"#86efac" },
  cityGridReportBad: { borderColor:"rgba(239,68,68,.64)",color:"#fca5a5" },
  cityGridReportOkText: { color:"#86efac",fontWeight:950 },
  cityGridReportBadText: { color:"#fca5a5",fontWeight:950 },
  cityGridLayerList: { display:"grid",gap:6 },
  cityGridLayerRow: { display:"grid",gridTemplateColumns:"minmax(150px,1.6fr) repeat(3,minmax(64px,.7fr))",gap:7,alignItems:"center",padding:"8px 9px",borderRadius:12,background:"rgba(15,23,42,.74)",border:"1px solid rgba(148,163,184,.14)",fontSize:9 },
  cityGridLayerNewest: { border:"1px solid rgba(103,232,249,.58)",boxShadow:"inset 0 0 18px rgba(34,211,238,.07)" },
  cityGridReportStatus: { display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:13,border:"1px solid",marginBottom:8 },
  cityGridReportStatusOk: { color:"#86efac",borderColor:"rgba(34,197,94,.48)",background:"rgba(20,83,45,.18)" },
  cityGridReportStatusBad: { color:"#fca5a5",borderColor:"rgba(239,68,68,.58)",background:"rgba(127,29,29,.18)" },
  cityGridObjectList: { display:"grid",gap:12,marginTop:12 },
  cityGridObjectCard: { padding:10,borderRadius:16,border:"1px solid rgba(148,163,184,.18)",background:"rgba(7,15,31,.72)" },
  cityGridObjectHeader: { display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"end",marginBottom:8 },
  cityGridGenerationTable: { width:"100%",minWidth:650,borderCollapse:"collapse",fontSize:9,textAlign:"right" },
  cityGridGenerationActive: { background:"rgba(34,211,238,.065)" },
  cityGridCopyBar: { display:"grid",gridTemplateColumns:"1fr 1.25fr",gap:7,alignItems:"center",margin:"10px 0" },
  cityGridBalanceGrid: { display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:6,marginBottom:9 },
  cityGridBalanceTable: { width:"100%",minWidth:780,borderCollapse:"collapse",fontSize:9,textAlign:"right" },
  cityGridReportNote: { margin:"10px 2px 0",color:"rgba(203,213,225,.68)",fontSize:9,lineHeight:1.45 },
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

  panelBuildingPortrait: { width: 62, height: 58, overflow: "visible", padding: 0, background: "radial-gradient(circle,rgba(255,255,255,.08),rgba(15,23,42,.18))" },
  buildingPortraitCanvas: { display: "block", pointerEvents: "none", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.34))" },

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
