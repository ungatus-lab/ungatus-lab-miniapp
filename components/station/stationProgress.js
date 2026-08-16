const STORAGE_KEY = "pgm_station_progress_v1";
const PROGRESS_EVENT = "pgm:station-progress";

export const DEFAULT_STATION_PROGRESS = Object.freeze({
  version: 1,

  operator: {
    level: 1,
    xp: 0,
    title: "Early Operator",
    streak: 1,
  },

  station: {
    generation: 1,
    level: 1,
    xp: 0,
    style: "founder-dark",
    coreColor: "cyan",
    unlockedCosmetics: ["founder-dark"],
    equippedCosmetics: {
      hull: "founder-dark",
      core: "cyan",
      trail: "none",
      orbit: "basic",
    },
  },

  mastery: {
    scanner: 0,
    recorder: 0,
    scenarios: 0,
    branching: 0,
    emulator: 0,
    multiDevice: 0,
  },

  game: {
    tutorialStage: 0,
    matches: 0,
    wins: 0,
    rating: 0,
    bestScore: 0,
    lastPlayedAt: null,
  },

  economy: {
    gameUgt: 0,
    promoUgt: 0,
    lockedUgt: 0,
    availableUgt: 0,
  },

  social: {
    referrals: 0,
    friends: [],
    squadLevel: 1,
    squadXp: 0,
  },

  unlocks: {
    accountCore: true,
    arena: true,
    nativeLab: true,
    projectVault: true,
    communityRelay: true,
    economyDock: true,
    marketplaceTrading: false,
    walletConnection: false,
    allocationExchange: false,
  },

  missions: {
    openedStation: false,
    completedTraining: false,
    playedArena: false,
    viewedNativeLab: false,
    viewedProjectVault: false,
    invitedOperator: false,
  },

  meta: {
    createdAt: null,
    updatedAt: null,
  },
});

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDeep(base, incoming) {
  if (!isObject(base) || !isObject(incoming)) {
    return incoming === undefined ? clone(base) : clone(incoming);
  }

  const result = clone(base);

  Object.keys(incoming).forEach((key) => {
    const incomingValue = incoming[key];
    const baseValue = base[key];

    if (isObject(baseValue) && isObject(incomingValue)) {
      result[key] = mergeDeep(baseValue, incomingValue);
    } else if (incomingValue !== undefined) {
      result[key] = clone(incomingValue);
    }
  });

  return result;
}

function clampNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

export function xpRequiredForLevel(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  return 250 + (safeLevel - 1) * 150;
}

function applyLevelUps(level, xp) {
  let nextLevel = Math.max(1, Math.floor(Number(level) || 1));
  let nextXp = clampNumber(xp);
  let guard = 0;

  while (nextXp >= xpRequiredForLevel(nextLevel) && guard < 1000) {
    nextXp -= xpRequiredForLevel(nextLevel);
    nextLevel += 1;
    guard += 1;
  }

  return { level: nextLevel, xp: nextXp };
}

function normalizeProgress(progress) {
  const now = new Date().toISOString();
  const next = mergeDeep(DEFAULT_STATION_PROGRESS, progress || {});

  const operator = applyLevelUps(next.operator.level, next.operator.xp);
  next.operator.level = operator.level;
  next.operator.xp = operator.xp;
  next.operator.streak = Math.max(1, Math.floor(clampNumber(next.operator.streak, 1)));

  const station = applyLevelUps(next.station.level, next.station.xp);
  next.station.level = station.level;
  next.station.xp = station.xp;
  next.station.generation = Math.max(
    1,
    Math.floor(clampNumber(next.station.generation, 1, 100))
  );

  next.game.matches = Math.floor(clampNumber(next.game.matches));
  next.game.wins = Math.min(
    next.game.matches,
    Math.floor(clampNumber(next.game.wins))
  );
  next.game.rating = Math.floor(clampNumber(next.game.rating));
  next.game.bestScore = Math.floor(clampNumber(next.game.bestScore));

  Object.keys(next.mastery).forEach((key) => {
    next.mastery[key] = Math.floor(clampNumber(next.mastery[key], 0, 100));
  });

  Object.keys(next.economy).forEach((key) => {
    next.economy[key] = clampNumber(next.economy[key]);
  });

  next.social.referrals = Math.floor(clampNumber(next.social.referrals));
  next.social.squadLevel = Math.max(
    1,
    Math.floor(clampNumber(next.social.squadLevel, 1))
  );
  next.social.squadXp = clampNumber(next.social.squadXp);
  next.social.friends = Array.isArray(next.social.friends)
    ? [...new Set(next.social.friends.map(String))]
    : [];

  next.station.unlockedCosmetics = Array.isArray(next.station.unlockedCosmetics)
    ? [...new Set(next.station.unlockedCosmetics.map(String))]
    : ["founder-dark"];

  next.meta.createdAt = next.meta.createdAt || now;
  next.meta.updatedAt = now;

  return next;
}

function emitProgress(progress) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PROGRESS_EVENT, { detail: clone(progress) })
  );
}

export function createDefaultStationProgress() {
  return normalizeProgress(DEFAULT_STATION_PROGRESS);
}

export function loadStationProgress() {
  if (typeof window === "undefined") {
    return createDefaultStationProgress();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultStationProgress();
    return normalizeProgress(JSON.parse(raw));
  } catch (error) {
    console.warn("Station progress could not be loaded", error);
    return createDefaultStationProgress();
  }
}

export function saveStationProgress(progress) {
  const normalized = normalizeProgress(progress);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    emitProgress(normalized);
  }

  return normalized;
}

export function updateStationProgress(updater) {
  const current = loadStationProgress();
  const updated =
    typeof updater === "function" ? updater(clone(current)) : mergeDeep(current, updater);
  return saveStationProgress(updated || current);
}

export function resetStationProgress() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return saveStationProgress(createDefaultStationProgress());
}

export function subscribeStationProgress(listener) {
  if (typeof window === "undefined" || typeof listener !== "function") {
    return () => {};
  }

  const handleProgress = (event) => listener(clone(event.detail));
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) listener(loadStationProgress());
  };

  window.addEventListener(PROGRESS_EVENT, handleProgress);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(PROGRESS_EVENT, handleProgress);
    window.removeEventListener("storage", handleStorage);
  };
}

export function addOperatorXp(amount, reason = "activity") {
  return updateStationProgress((progress) => {
    progress.operator.xp += clampNumber(amount);
    progress.meta.lastXpReason = String(reason);
    return progress;
  });
}

export function addStationXp(amount, reason = "activity") {
  return updateStationProgress((progress) => {
    progress.station.xp += clampNumber(amount);
    progress.meta.lastStationXpReason = String(reason);
    return progress;
  });
}

export function addMastery(type, amount) {
  return updateStationProgress((progress) => {
    if (!(type in progress.mastery)) return progress;
    progress.mastery[type] = clampNumber(
      progress.mastery[type] + clampNumber(amount),
      0,
      100
    );
    return progress;
  });
}

export function addGameUgt(amount, reason = "game") {
  return updateStationProgress((progress) => {
    progress.economy.gameUgt += clampNumber(amount);
    progress.meta.lastUgtReason = String(reason);
    return progress;
  });
}

export function completeMission(missionId) {
  return updateStationProgress((progress) => {
    if (missionId in progress.missions) {
      progress.missions[missionId] = true;
    }
    return progress;
  });
}

export function recordArenaResult({ won = false, score = 0, xp = 0, ugt = 0 } = {}) {
  return updateStationProgress((progress) => {
    progress.game.matches += 1;
    if (won) progress.game.wins += 1;
    progress.game.bestScore = Math.max(
      progress.game.bestScore,
      Math.floor(clampNumber(score))
    );
    progress.game.lastPlayedAt = new Date().toISOString();
    progress.game.tutorialStage = Math.max(progress.game.tutorialStage, 1);

    progress.operator.xp += clampNumber(xp);
    progress.station.xp += Math.round(clampNumber(xp) * 0.35);
    progress.economy.gameUgt += clampNumber(ugt);
    progress.missions.playedArena = true;

    return progress;
  });
}

export function unlockStationFeature(featureId) {
  return updateStationProgress((progress) => {
    if (featureId in progress.unlocks) {
      progress.unlocks[featureId] = true;
    }
    return progress;
  });
}

export function unlockCosmetic(cosmeticId) {
  return updateStationProgress((progress) => {
    const id = String(cosmeticId);
    if (!progress.station.unlockedCosmetics.includes(id)) {
      progress.station.unlockedCosmetics.push(id);
    }
    return progress;
  });
}

export function getProgressSummary(progress = loadStationProgress()) {
  return {
    operatorLevel: progress.operator.level,
    operatorXp: progress.operator.xp,
    operatorXpRequired: xpRequiredForLevel(progress.operator.level),
    stationLevel: progress.station.level,
    stationGeneration: progress.station.generation,
    gameUgt: progress.economy.gameUgt,
    lockedUgt: progress.economy.lockedUgt,
    matches: progress.game.matches,
    wins: progress.game.wins,
    referrals: progress.social.referrals,
  };
}

export { STORAGE_KEY as STATION_PROGRESS_STORAGE_KEY };
