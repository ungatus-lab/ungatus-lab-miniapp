export const MODULES = [
  { id: "device", title: "DEVICE", subtitle: "Emulator Hangar", color: "#5ee7ff", colorHex: 0x5ee7ff, icon: "▣", type: "hangar" },
  { id: "scanner", title: "AUTOMATION", subtitle: "Scanner · Recorder · Scenarios", color: "#53f5df", colorHex: 0x53f5df, icon: "◉", type: "dish" },
  { id: "collab", title: "COMMUNITY", subtitle: "Squad · Collab · Friends", color: "#b99cff", colorHex: 0xb99cff, icon: "◈", type: "twins" },
  { id: "market", title: "PROJECTS", subtitle: "Library · Catalog · Rentals", color: "#ff8bc8", colorHex: 0xff8bc8, icon: "◍", type: "hangar" },
  { id: "premium", title: "PREMIUM", subtitle: "Status Reactor", color: "#6df0ad", colorHex: 0x6df0ad, icon: "◇", type: "reactor" },
  { id: "center", title: "CORE", subtitle: "Account Citadel", color: "#8cecff", colorHex: 0x8cecff, icon: "◎", type: "citadel" },
  { id: "wallet", title: "WALLET & MARKET", subtitle: "UGT · Premium · Allocation", color: "#ffe693", colorHex: 0xffe693, icon: "⇄", type: "vault" },
  { id: "squad", title: "SQUAD", subtitle: "Relay Array", color: "#ca9cff", colorHex: 0xca9cff, icon: "⬡", type: "beacon" },
  { id: "earn", title: "EARN", subtitle: "Mission Beacon", color: "#ffe45c", colorHex: 0xffe45c, icon: "✦", type: "beacon" },
  { id: "game", title: "ARENA", subtitle: "PvP Rift", color: "#ff6f91", colorHex: 0xff6f91, icon: "⚔", type: "gate" },
];

export const MODULE_BY_ID = Object.fromEntries(
  MODULES.map((module) => [module.id, module])
);

export const PREMIUM_TIERS = [
  ["Free", "Базовый доступ", "1% scanner"],
  ["Basic", "€9.99 / month", "Comparator trial"],
  ["Advanced", "€24.99 / month", "More tools and slots"],
  ["Pro", "€39.99 / month", "Extended scanner"],
  ["Pro Plus", "€79.99 / month", "Maximum profile tier"],
];

export const MODULE_DETAILS = {
  center: {
    heading: "ACCOUNT CITADEL",
    text: "Постоянный профиль, уровень аккаунта и развитие всей орбитальной станции.",
    metrics: [["PROFILE", "LV 1"], ["PVP GAMES", "0"], ["STATUS", "FREE"], ["RATING", "—"]],
    rows: [["Station generation", "G1"], ["Unlocked systems", "10 / 10"], ["Profile experience", "0 XP"]],
  },
  device: {
    heading: "DEVICE & EMULATOR HANGAR",
    text: "Подключённые компьютеры, Android-устройства, эмуляторы и зеркала с данными от бэкенда.",
    metrics: [["PC", "0"], ["ANDROID", "0"], ["EMULATORS", "1"], ["ONLINE", "0"]],
    rows: [["Remote mirrors", "0"], ["Available slots", "1 / 1"], ["Backend sync", "Offline"]],
  },
  scanner: {
    heading: "SCANNER & ETALON LAB",
    text: "Эталоны сцен, ROI, плотность пикселей и премиальный формирователь уникальных эталонов.",
    metrics: [["PIXELS", "1%"], ["ETALONS", "0"], ["SCENES", "0"], ["COMPARATOR", "OFF"]],
    rows: [["Macro Recorder", "Native"], ["Unique etalons", "Premium"], ["Pixel density above 1%", "Premium"], ["Project Mindmap", "Native"]],
  },
  collab: {
    heading: "COLLABORATION HUB",
    text: "Общие проекты, права управления и совместное редактирование сценариев.",
    metrics: [["ROOMS", "0"], ["PROJECTS", "0"], ["MEMBERS", "0"], ["LINKS", "0"]],
    rows: [["Shared workspaces", "Soon"], ["Access control", "Soon"], ["Scenario co-edit", "Soon"]],
  },
  market: {
    heading: "PROJECT MARKET DOCK",
    text: "Внутренний рынок проектов автоматизации, сценариев, зеркал и цифровых инструментов.",
    metrics: [["PROJECTS", "0"], ["RENTALS", "0"], ["TOOLS", "0"], ["SALES", "0"]],
    rows: [["Project scripts", "Soon"], ["Emulator mirrors", "Soon"], ["Premium tools", "Soon"]],
  },
  premium: {
    heading: "PREMIUM STATUS REACTOR",
    text: "Статус аккаунта, срок инструментов, временные trial-возможности и будущий ежедневный бонус.",
    metrics: [["TIER", "FREE"], ["TOOLS", "BASE"], ["DROP", "INACTIVE"], ["TERM", "—"]],
    rows: [],
  },
  wallet: {
    heading: "UGT WALLET VAULT",
    text: "Подключённые кошельки, баланс UGT и будущий обмен внутри платформы.",
    metrics: [["UGT", "0"], ["PROMO", "0"], ["LOCKED", "0"], ["AVAILABLE", "0"]],
    rows: [["TON / Tonkeeper", "Not connected"], ["Solana / Phantom", "Not connected"], ["Swap", "Soon"]],
  },
  squad: {
    heading: "SQUAD RELAY ARRAY",
    text: "Реферальная сеть, игровые отряды и будущие кланы.",
    metrics: [["SQUAD", "0"], ["INVITED", "0"], ["ACTIVITY", "0"], ["REWARD", "0"]],
    rows: [["Referral code", "PGM-SCENE"], ["Clan channel", "Offline"], ["Shared arena queue", "Soon"]],
  },
  earn: {
    heading: "MISSION BEACON",
    text: "Задания, rewarded ads, активность аккаунта и временный доступ к отдельным Premium-функциям.",
    metrics: [["MISSIONS", "1 / 4"], ["ADS", "0"], ["PROMO", "0"], ["STREAK", "1"]],
    rows: [["Open Mini App", "DONE"], ["Watch rewarded ad", "SOON"], ["Start PvP arena", "0 / 1"], ["Comparator trial", "Inactive"]],
  },
  game: {
    heading: "MACRO SWARM ARENA",
    text: "Вылет в PvP с развитым Core, легионами, игровыми эмуляторами и серверной эволюцией.",
    metrics: [["CORE", "G1"], ["LEGIONS", "1"], ["EMULATORS", "1"], ["SERVER", "1–5"]],
    rows: [["Starter legion", "Core Guard"], ["Sensor profile", "1% pixels"], ["Arena evolution", "Enabled"]],
  },
};

export const STATION_MODEL_URL = "/orbital_station_edge_view.glb";

// One stable home composition. No mandatory panorama frames on the main screen.
export const HOME_VIEW = {
  direction: { x: 0.76, y: 0.34, z: 0.55 },
  distance: 3.92,
  targetHeight: 0.13,
  fov: 37,
};

export const SPACE_OBJECTS = {
  sun: {
    distance: 8.9,
    sideOffset: -0.92,
    heightOffset: 0.78,
    radius: 0.29,
  },
  rift: { visible: false },
};

export const MODULE_ANCHORS = [
  { id: "market", zone: "platform", platform: 1, angle: 338, ring: 0.661, focusFrame: 1 },
  { id: "scanner", zone: "platform", platform: 2, angle: 248, ring: 0.661, focusFrame: 1 },
  { id: "collab", zone: "platform", platform: 3, angle: 158, ring: 0.661, focusFrame: 2 },
  { id: "wallet", zone: "platform", platform: 4, angle: 68, ring: 0.661, focusFrame: 3 },
];

export const MODULE_FOCUS = {
  enabled: false,
  distanceScale: 1.35,
  heightScale: 0.38,
  durationMs: 520,
};

export const SCENE_CONFIG = {
  cameraFov: 34,
  cameraNear: 0.1,
  cameraFar: 500,
  swipeDistanceFactor: 0.72,
  swipeSmoothing: 0.16,
  tapThresholdPx: 9,
  buildingScale: 0.042,
  buildingEmbed: 0.22,
};
