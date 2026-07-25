"use client";

import { useEffect, useMemo, useState } from "react";
import AppDrawer from "../components/shell/AppDrawer";
import {
  createTranslator,
  normalizeLanguage,
  saveLanguage,
} from "../lib/i18n/language";

const miniRooms = [
  { id: "game", labelKey: "nav_game", icon: "⚙" },
  { id: "squad", labelKey: "nav_squad", icon: "⬡" },
  { id: "native", label: "Native", icon: "◎", nativeAction: true },
  { id: "earn", labelKey: "nav_earn", icon: "✦" },
  { id: "allocation", labelKey: "nav_allocation", icon: "◇" },
];

const mainRooms = [
  { id: "device", labelKey: "nav_device", icon: "▣" },
  { id: "collab", labelKey: "nav_collab", icon: "◈" },
  { id: "center", labelKey: "nav_center", icon: "◎" },
  { id: "market", labelKey: "nav_market", icon: "◍" },
  { id: "wallet", labelKey: "nav_wallet", icon: "⇄" },
];

const validRoomIds = [
  "game",
  "squad",
  "earn",
  "allocation",
  "wallet",
  "device",
  "collab",
  "center",
  "market",
];

const allocationPacks = [
  {
    name: "Starter",
    entry: "25 000 UGT",
    bonus: "50 000 locked UGT",
    note: "Entry allocation",
  },
  {
    name: "Builder",
    entry: "100 000 UGT",
    bonus: "200 000 locked UGT",
    note: "Early builder tier",
  },
  {
    name: "Pro",
    entry: "400 000 UGT",
    bonus: "800 000 locked UGT",
    note: "Advanced operator tier",
  },
  {
    name: "Founder",
    entry: "1 600 000 UGT",
    bonus: "3 200 000 locked UGT",
    note: "Maximum pre-launch tier",
  },
];

export default function Home() {
  const [started, setStarted] = useState(false);
  const [activeRoom, setActiveRoom] = useState("center");
  const [telegramUser, setTelegramUser] = useState(null);
  const [bootReady, setBootReady] = useState(false);
  const [language, setLanguage] = useState("ru");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nativeNoticeOpen, setNativeNoticeOpen] = useState(false);

  const t = useMemo(() => createTranslator(language), [language]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedStarted = window.localStorage.getItem("pgm_started") === "1";
    const savedRoom = window.localStorage.getItem("pgm_active_room");
    const savedLanguage = window.localStorage.getItem("pgm_language");

    if (savedStarted) {
      setStarted(true);
    }

    if (validRoomIds.includes(savedRoom)) {
      setActiveRoom(savedRoom);
    } else {
      setActiveRoom("center");
    }

    const tg = window.Telegram?.WebApp;
    let tgUser = null;

    if (tg) {
      tg.ready();
      tg.expand();
      tgUser = tg.initDataUnsafe?.user || null;
      setTelegramUser(tgUser);
    }

    const initialLanguage = savedLanguage
      ? normalizeLanguage(savedLanguage)
      : normalizeLanguage(tgUser?.language_code);

    setLanguage(initialLanguage);

    if (!savedLanguage) {
      saveLanguage(initialLanguage);
    }

    setBootReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!started) return;

    window.localStorage.setItem("pgm_started", "1");
    window.localStorage.setItem("pgm_active_room", activeRoom);
  }, [started, activeRoom]);

  function handleStart() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pgm_started", "1");
      window.localStorage.setItem("pgm_active_room", "center");
    }

    setStarted(true);
    setActiveRoom("center");
  }

  function handleRoomChange(roomId) {
    if (!validRoomIds.includes(roomId)) return;

    setActiveRoom(roomId);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("pgm_active_room", roomId);
    }
  }

  function handleLanguageChange(nextLanguage) {
    const normalizedLanguage = normalizeLanguage(nextLanguage);
    saveLanguage(normalizedLanguage);
    setLanguage(normalizedLanguage);
  }

  function openNativeBuilderPreview() {
    setNativeNoticeOpen(true);
  }

  function resetMiniAppEntrance() {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem("pgm_started");
    window.localStorage.removeItem("pgm_active_room");
    window.location.reload();
  }

  function resetTestData() {
    if (typeof window === "undefined") return;

    const testKeys = [
      "pgm_game_state",
      "pgm_game_score",
      "pgm_operator_xp",
      "pgm_demo_wallet",
      "pgm_demo_allocation",
      "pgm_demo_ledger",
      "pgm_demo_squad",
      "pgm_demo_earn",
      "pgm_demo_missions",
      "pgm_demo_ads",
      "pgm_demo_referrals",
      "pgm_demo_market",
      "pgm_demo_wallet_balance",
      "pgm_demo_locked_ugt",
      "pgm_demo_available_ugt",
    ];

    testKeys.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    window.location.reload();
  }

  if (!bootReady) {
    return (
      <main style={styles.welcomeRoot}>
        <section style={styles.welcomeCard}>
          <h1 style={styles.welcomeTitle}>PixelGridMacro</h1>
          <p style={styles.welcomeSubtitle}>Loading Mini App...</p>
        </section>
      </main>
    );
  }

  if (!started) {
    return (
      <WelcomeScreen
        onStart={handleStart}
        telegramUser={telegramUser}
        t={t}
      />
    );
  }

  return (
    <div style={styles.appRoot}>
      <div style={styles.shell}>
        <button
          style={styles.profileMenuButton}
          onClick={() => setDrawerOpen(true)}
          title="Open account menu"
        >
          👤
        </button>

        <RoomRenderer
          activeRoom={activeRoom}
          telegramUser={telegramUser}
          t={t}
        />

        <DualBottomNav
          activeRoom={activeRoom}
          setActiveRoom={handleRoomChange}
          t={t}
          onNativeLaunch={openNativeBuilderPreview}
        />

        <AppDrawer
          open={drawerOpen}
          telegramUser={telegramUser}
          language={language}
          t={t}
          onSelectLanguage={handleLanguageChange}
          onClose={() => setDrawerOpen(false)}
          onResetEntrance={resetMiniAppEntrance}
          onResetTestData={resetTestData}
        />

        <NativeSoonSheet
          open={nativeNoticeOpen}
          onClose={() => setNativeNoticeOpen(false)}
        />
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart, telegramUser, t }) {
  const name = telegramUser?.first_name || telegramUser?.username;

  return (
    <main style={styles.welcomeRoot}>
      <section style={styles.welcomeCard}>
        <h1 style={styles.welcomeTitle}>PixelGridMacro</h1>

        <p style={styles.welcomeSubtitle}>
          Telegram gateway к нативной платформе multi-device automation,
          remote scanner, macro recorder и UGT utility-экосистеме.
        </p>

        <div style={styles.emblem}>
          <div style={styles.emblemRing} />
          <div style={styles.emblemRingSecond} />
          <div style={styles.emblemCore}>PGM</div>
        </div>

        {name && <div style={styles.telegramBadge}>Telegram: {name}</div>}

        <button style={styles.getStartedButton} onClick={onStart}>
          GET
          <br />
          STARTED
        </button>

        <p style={styles.smallNote}>
          Полные инструменты работают в native app. Mini App — это вход,
          кабинет раннего участника, экономика, обучение и пресейловая витрина.
        </p>
      </section>
    </main>
  );
}

function RoomRenderer({ activeRoom, telegramUser, t }) {
  if (activeRoom === "game") return <GameRoom t={t} />;
  if (activeRoom === "squad")
    return <SquadRoom telegramUser={telegramUser} t={t} />;
  if (activeRoom === "earn") return <EarnRoom t={t} />;
  if (activeRoom === "allocation") return <AllocationRoom t={t} />;
  if (activeRoom === "wallet") return <WalletRoom t={t} />;
  if (activeRoom === "device") return <DeviceRoom t={t} />;
  if (activeRoom === "collab") return <CollabRoom t={t} />;
  if (activeRoom === "market") return <MarketRoom t={t} />;

  return <CenterRoom telegramUser={telegramUser} t={t} />;
}

function RoomHeader({ title, subtitle, pill }) {
  return (
    <header style={styles.roomHeader}>
      <div>
        <h1 style={styles.roomTitle}>{title}</h1>
        <p style={styles.roomSubtitle}>{subtitle}</p>
      </div>

      {pill && <div style={styles.pill}>{pill}</div>}
    </header>
  );
}

function CenterRoom({ telegramUser, t }) {
  const name = telegramUser?.first_name || telegramUser?.username || "SceneAgent";

  return (
    <>
      <RoomHeader
        title={t("room_center_title")}
        subtitle={`Добро пожаловать, ${name}. Это главный зал Mini App.`}
        pill="Mini Gateway"
      />

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>PixelGridMacro Vision</h2>
        <p style={styles.cardText}>
          Нативное приложение — это инструмент зеркал, пиксельного сканера,
          записи жестов и multi-device orchestration. Mini App показывает
          архитектуру, маркет, кошелёк, аллокации и путь к полной нативной
          платформе.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Launch Center</h3>

        <div style={styles.featureGrid}>
          <Feature title="Native Builder" text="Scenario constructor, macro recorder и player." />
          <Feature title="Remote Mirrors" text="PC, Android и LDPlayer-зеркала." />
          <Feature title="Pixel Scanner" text="Эталонные цветовые массивы по сценам." />
          <Feature title="Project Mindmap" text="Блочный конструктор сценариев." />
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Mini App Layer</h3>
        <p style={styles.cardText}>
          Верхний ряд открывает игровые, командные и экономические модули:
          Game, Squad, Earn и Allocation. Нижний ряд держит Device, Collab,
          Center, Market и Wallet.
        </p>
      </section>

      <button style={styles.primaryAction}>Download Native App — soon</button>
    </>
  );
}

function DeviceRoom({ t }) {
  return (
    <>
      <RoomHeader
        title={t("room_device_title")}
        subtitle="Презентация LDPlayer, PC и Android зеркал."
        pill="Native only"
      />

      <div style={styles.tabs}>
        <button style={styles.tab}>LDPlayer</button>
        <button style={styles.tabActive}>PC</button>
        <button style={styles.tab}>Android</button>
      </div>

      <section style={styles.mirrorTile}>
        <div style={styles.mirrorGlow} />
        <div style={styles.mirrorBadge}>Native App Required</div>
        <div style={styles.mirrorLabel}>PC Mirror Preview</div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Remote scanner живёт в нативке</h3>
        <p style={styles.cardText}>
          Mini App не тянет raw frames и remote desktop. Здесь только витрина:
          реальное зеркало, захват жестов и эталонные пиксельные массивы
          работают в нативном приложении.
        </p>
      </section>

      <section style={styles.cardCompact}>
        Scanner · Gestures · Macro · Remote Desktop · Multi-device
      </section>
    </>
  );
}

function CollabRoom({ t }) {
  return (
    <>
      <RoomHeader
        title={t("room_collab_title")}
        subtitle="Будущая комната совместных проектов и управления доступом."
        pill="Native collab"
      />

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Shared workspaces</h3>
        <p style={styles.cardText}>
          В native app здесь будут общие проекты, зеркала, права управления,
          совместное редактирование сценариев и рабочие комнаты.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Командная работа без смешения с рефералкой</h3>
        <p style={styles.cardText}>
          Реферальная и squad-логика вынесена в верхнюю комнату Squad. Collab Room
          остаётся местом будущей настоящей совместной работы.
        </p>
      </section>

      <button style={styles.primaryAction}>Create Collab Room — soon</button>
    </>
  );
}

function MarketRoom({ t }) {
  const marketItems = [
    {
      title: "Project Scripts",
      subtitle: "Продажа и аренда готовых macro-проектов и сценариев.",
      tag: "Projects",
    },
    {
      title: "Emulator Mirrors",
      subtitle: "Аренда LDPlayer / emulator слотов и зеркал за UGT.",
      tag: "Rentals",
    },
    {
      title: "Premium Pixel Tools",
      subtitle: "Будущие premium-функции сканера, эталонов и плотности пикселей.",
      tag: "Premium",
    },
  ];

  return (
    <>
      <RoomHeader
        title={t("room_market_title")}
        subtitle="Маркетплейс проектов, зеркал, сценариев и premium-инструментов."
        pill="Marketplace"
      />

      <section style={styles.marketHero}>
        <div>
          <h2 style={styles.cardTitle}>PixelGrid Marketplace</h2>
          <p style={styles.cardText}>
            Здесь позже будут продаваться и сдаваться в аренду проекты,
            сценарии автоматизации, emulator-зеркала и цифровые возможности
            экосистемы. Аллокации вынесены в отдельную комнату Allocation.
          </p>
        </div>
      </section>

      <div style={styles.marketStatsGrid}>
        <section style={styles.marketMiniCard}>
          <strong style={styles.marketMiniValue}>0</strong>
          <span>Listed projects</span>
        </section>

        <section style={styles.marketMiniCard}>
          <strong style={styles.marketMiniValue}>0</strong>
          <span>Mirror rentals</span>
        </section>

        <section style={styles.marketMiniCard}>
          <strong style={styles.marketMiniValue}>{t("common_soon")}</strong>
          <span>Market status</span>
        </section>
      </div>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Marketplace Preview</h3>

        <div style={styles.marketplaceGrid}>
          {marketItems.map((item) => (
            <div key={item.title} style={styles.marketplaceItem}>
              <div style={styles.marketplaceTopRow}>
                <strong>{item.title}</strong>
                <span style={styles.chip}>{item.tag}</span>
              </div>

              <p style={styles.cardText}>{item.subtitle}</p>

              <button style={styles.miniButton}>{t("common_soon")}</button>
            </div>
          ))}
        </div>
      </section>

      <p style={styles.smallNote}>
        Market Room — это будущая экономика сценариев, зеркал, premium-функций
        и цифровых инструментов. Pre-launch пакеты находятся в Allocation Room.
      </p>
    </>
  );
}

function GameRoom({ t }) {
  return (
    <>
      <RoomHeader
        title={t("room_game_title")}
        subtitle="Будущий игровой режим Scenario Survival / Factory Line."
        pill="Game"
      />

      <section style={styles.gameHero}>
        <div style={styles.gameScreen}>
          <div style={styles.factoryPipe} />
          <div style={styles.factoryDrop} />
          <div style={styles.factoryBelt}>
            <div style={styles.factoryFlow} />
          </div>
          <div style={styles.factoryWarning}>Scenario Survival</div>
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Scenario Survival — coming soon</h3>
        <p style={styles.cardText}>
          Игра будет обучать сценарному мышлению: сцены, эталоны, макросы,
          fallback-ветки, случайные сбои, ленты, патрубки, переливы и
          автоматизация процесса.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Game launcher placeholder</h3>
        <p style={styles.cardText}>
          Позже эта кнопка будет запускать отдельный игровой компонент/документ,
          который мы вынесем из большого app/page.js.
        </p>

        <button style={styles.primaryAction}>Launch Game — soon</button>
      </section>
    </>
  );
}

function SquadRoom({ telegramUser, t }) {
  const code = useMemo(() => {
    const raw = telegramUser?.id || telegramUser?.username || "SCENE";
    return `PGM-${String(raw).slice(-6).toUpperCase()}`;
  }, [telegramUser]);

  return (
    <>
      <RoomHeader
        title={t("room_squad_title")}
        subtitle="Реферальная команда, приглашения и будущие ветки участников."
        pill="Referral"
      />

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>My Squad</h3>

        <div style={styles.allocationRow}>
          <span>Referral code</span>
          <strong>{code}</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Invited users</span>
          <strong>0</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Squad activity</span>
          <strong>0</strong>
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Future Squad Mechanics</h3>
        <p style={styles.cardText}>
          Здесь будет invite link, реферальные ветки, squad rewards,
          активность команды, будущие проценты лидера и связь с Collab Room.
        </p>

        <div style={styles.chipRow}>
          <span style={styles.chip}>Invite</span>
          <span style={styles.chip}>Branches</span>
          <span style={styles.chip}>Leader rewards</span>
        </div>
      </section>

      <button style={styles.primaryAction}>Share Invite — soon</button>
    </>
  );
}

function EarnRoom({ t }) {
  return (
    <>
      <RoomHeader
        title={t("room_earn_title")}
        subtitle="Daily, rewarded ads, missions, promo UGT и Ad Vault."
        pill="Missions"
      />

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Today Missions</h3>

        <div style={styles.missionItem}>
          <span>Open Mini App</span>
          <strong>{t("common_done")}</strong>
        </div>

        <div style={styles.missionItem}>
          <span>Watch rewarded ad</span>
          <strong>{t("common_soon")}</strong>
        </div>

        <div style={styles.missionItem}>
          <span>Open Allocation Room</span>
          <strong>0 / 1</strong>
        </div>

        <div style={styles.missionItem}>
          <span>Start Scenario Survival</span>
          <strong>0 / 1</strong>
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Ad Vault</h3>

        <div style={styles.allocationRow}>
          <span>Pending ad UGT</span>
          <strong>0</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Confirmed promo UGT</span>
          <strong>0</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Available ads</span>
          <strong>{t("common_dynamic")}</strong>
        </div>

        <p style={styles.smallNote}>
          Реальные начисления будут происходить только после подтверждения
          просмотра рекламной сетью.
        </p>
      </section>

      <button style={styles.primaryAction}>Watch Ad — soon</button>
    </>
  );
}

function AllocationRoom({ t }) {
  return (
    <>
      <RoomHeader
        title={t("room_allocation_title")}
        subtitle="Pre-launch allocation, x2 bonus, locked UGT и статус раунда."
        pill="Pre-launch"
      />

      <section style={styles.allocationDashboard}>
        <div style={styles.marketplaceTopRow}>
          <div>
            <h3 style={styles.cardTitle}>Allocation Dashboard</h3>
            <p style={styles.cardText}>
              Общий пул раннего участия. Сюда могут попадать купленные пакеты,
              доливы, Promo UGT и locked UGT за подтверждённые активности.
            </p>
          </div>

          <span style={styles.chip}>Locked</span>
        </div>

        <div style={styles.allocationRow}>
          <span>Total acquired allocation</span>
          <strong>0 UGT</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Ad rewards added</span>
          <strong>0 UGT</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Available to withdraw</span>
          <strong>0 UGT</strong>
        </div>

        <div style={styles.progressTrack}>
          <div style={styles.progressFill} />
        </div>

        <div style={styles.chipRow}>
          <span style={styles.chip}>Pre-launch x2</span>
          <span style={styles.chip}>Round 1</span>
          <span style={styles.chip}>Liquidity forming</span>
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Pre-launch Allocation Packs</h3>

        <div style={styles.packGrid}>
          {allocationPacks.map((pack) => (
            <section key={pack.name} style={styles.allocationCard}>
              <h3 style={styles.allocationTitle}>{pack.name}</h3>

              <div style={styles.allocationRow}>
                <span>Взнос</span>
                <strong>{pack.entry}</strong>
              </div>

              <div style={styles.allocationRow}>
                <span>Pre-launch bonus</span>
                <strong>{pack.bonus}</strong>
              </div>

              <p style={styles.smallNote}>{pack.note}</p>

              <button style={styles.miniButton}>Select package — soon</button>
            </section>
          ))}
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Release Schedule Preview</h3>
        <p style={styles.cardText}>
          Вывод и обмен аллокационных UGT будут зависеть от запуска раунда,
          статуса ликвидности и графика release. До запуска это pre-launch
          locked allocation.
        </p>
      </section>
    </>
  );
}

function WalletRoom({ t }) {
  return (
    <>
      <RoomHeader
        title={t("room_wallet_title")}
        subtitle="Connected wallets, UGT balances, swap preview и liquidity status."
        pill="Wallet"
      />

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Connected Wallets</h3>

        <div style={styles.walletCard}>
          <div>
            <strong>TON / Tonkeeper</strong>
            <p style={styles.cardText}>Not connected</p>
          </div>
          <button style={styles.miniButtonInline}>{t("common_connect")}</button>
        </div>

        <div style={styles.walletCard}>
          <div>
            <strong>Solana / Phantom</strong>
            <p style={styles.cardText}>Not connected</p>
          </div>
          <button style={styles.miniButtonInline}>{t("common_connect")}</button>
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>UGT Wallet Summary</h3>

        <div style={styles.allocationRow}>
          <span>Backed UGT</span>
          <strong>0</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Promo UGT</span>
          <strong>0</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Locked Allocation UGT</span>
          <strong>0</strong>
        </div>
      </section>

      <section style={styles.swapPreview}>
        <h3 style={styles.cardTitle}>Swap Preview</h3>

        <div style={styles.swapBox}>
          <span>You send</span>
          <strong>25 USDC</strong>
        </div>

        <div style={styles.swapArrow}>↓</div>

        <div style={styles.swapBox}>
          <span>You receive</span>
          <strong>24 250 UGT</strong>
        </div>

        <p style={styles.smallNote}>
          Demo rate: 1000 UGT = €1. PixelGrid service fee and gateway/network
          fees will be shown before confirmation.
        </p>

        <button style={styles.primaryAction}>Swap — soon</button>
      </section>
    </>
  );
}

function Feature({ title, text }) {
  return (
    <div style={styles.featureCard}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function DualBottomNav({ activeRoom, setActiveRoom, t, onNativeLaunch }) {
  return (
    <div style={styles.navStack}>
      <nav style={styles.topNav}>
        {miniRooms.map((room) => {
          if (room.nativeAction) {
            return (
              <button
                key={room.id}
                style={styles.nativeNavButton}
                onClick={onNativeLaunch}
                title="Native Builder"
              >
                <span style={styles.nativeNavIcon}>{room.icon}</span>
                <span style={styles.nativeNavLabel}>{room.label}</span>
              </button>
            );
          }

          const active = activeRoom === room.id;

          return (
            <button
              key={room.id}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActiveTop : {}),
              }}
              onClick={() => setActiveRoom(room.id)}
            >
              <span style={styles.navIcon}>{room.icon}</span>
              <span>{t(room.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <nav style={styles.bottomNav}>
        {mainRooms.map((room) => {
          const active = activeRoom === room.id;

          return (
            <button
              key={room.id}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {}),
              }}
              onClick={() => setActiveRoom(room.id)}
            >
              <span style={styles.navIcon}>{room.icon}</span>
              <span>{t(room.labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function NativeSoonSheet({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={styles.sheetOverlay} onClick={onClose}>
      <section style={styles.nativeSheet} onClick={(event) => event.stopPropagation()}>
        <div style={styles.sheetHandle} />

        <div style={styles.nativeSheetIcon}>◎</div>

        <h3 style={styles.nativeSheetTitle}>Native Builder — soon</h3>

        <p style={styles.nativeSheetText}>
          Настоящий Scenario Constructor, macro recorder, player и project
          mindmap будут открываться через native app. В Mini App эта кнопка
          останется главным мостом к нативному инструменту.
        </p>

        <button style={styles.primaryAction} onClick={onClose}>
          Got it
        </button>
      </section>
    </div>
  );
}

const styles = {
  appRoot: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.22), transparent 32%), linear-gradient(180deg, #121212 0%, #0b0b0b 100%)",
    color: "#ffffff",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  shell: {
    minHeight: "100vh",
    padding: "18px 16px 170px",
    boxSizing: "border-box",
  },

  profileMenuButton: {
    position: "fixed",
    top: 14,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.11)",
    background:
      "radial-gradient(circle at 30% 20%, rgba(34,211,238,0.24), transparent 32%), rgba(18,18,18,0.82)",
    color: "#ffffff",
    boxShadow: "0 12px 34px rgba(0,0,0,0.38)",
    backdropFilter: "blur(14px)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    fontSize: 18,
    zIndex: 45,
  },

  welcomeRoot: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    boxSizing: "border-box",
    background:
      "radial-gradient(circle at 50% 25%, rgba(139, 92, 246, 0.28), transparent 34%), linear-gradient(180deg, #121212 0%, #0b0b0b 100%)",
    color: "#ffffff",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  welcomeCard: {
    width: "min(430px, 100%)",
    padding: "30px 22px",
    borderRadius: 30,
    background: "rgba(20, 20, 20, 0.84)",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
    textAlign: "center",
    boxSizing: "border-box",
  },

  welcomeTitle: {
    margin: 0,
    fontSize: 34,
    letterSpacing: "-0.04em",
  },

  welcomeSubtitle: {
    margin: "10px 0 28px",
    color: "rgba(255,255,255,0.66)",
    lineHeight: 1.5,
    fontSize: 14,
  },

  emblem: {
    position: "relative",
    width: 160,
    height: 160,
    margin: "0 auto 26px",
    display: "grid",
    placeItems: "center",
  },

  emblemCore: {
    width: 94,
    height: 94,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899, #22d3ee)",
    boxShadow:
      "0 0 28px rgba(236,72,153,0.55), 0 0 70px rgba(34,211,238,0.25)",
    color: "#fff",
    fontWeight: 900,
    letterSpacing: "0.08em",
  },

  emblemRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.13)",
  },

  emblemRingSecond: {
    position: "absolute",
    inset: 20,
    borderRadius: "50%",
    border: "1px solid rgba(34,211,238,0.22)",
  },

  telegramBadge: {
    display: "inline-flex",
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    marginBottom: 18,
  },

  getStartedButton: {
    width: 136,
    height: 136,
    borderRadius: "50%",
    border: 0,
    color: "white",
    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
    boxShadow:
      "0 0 28px rgba(236,72,153,0.5), 0 0 72px rgba(124,58,237,0.35)",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
  },

  roomHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
    paddingRight: 44,
  },

  roomTitle: {
    margin: 0,
    fontSize: 28,
    letterSpacing: "-0.03em",
  },

  roomSubtitle: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.64)",
    lineHeight: 1.45,
    fontSize: 14,
  },

  pill: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(139,92,246,0.18)",
    color: "#d8b4fe",
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  card: {
    borderRadius: 22,
    padding: 18,
    background: "rgba(20,20,20,0.88)",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "0 16px 42px rgba(0,0,0,0.28)",
    marginBottom: 14,
  },

  cardCompact: {
    borderRadius: 999,
    padding: "12px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    textAlign: "center",
  },

  cardTitle: {
    margin: "0 0 10px",
  },

  cardText: {
    margin: 0,
    color: "rgba(255,255,255,0.64)",
    lineHeight: 1.5,
    fontSize: 14,
  },

  smallNote: {
    margin: "12px 0 0",
    color: "rgba(255,255,255,0.42)",
    fontSize: 12,
    lineHeight: 1.45,
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
  },

  featureCard: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 12,
    borderRadius: 16,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
  },

  primaryAction: {
    width: "100%",
    padding: "14px 18px",
    border: 0,
    borderRadius: 16,
    color: "white",
    background: "linear-gradient(135deg, #4caf50, #22d3ee)",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 15,
    marginBottom: 12,
  },

  secondaryAction: {
    width: "100%",
    padding: "13px 18px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    color: "rgba(255,255,255,0.72)",
    background: "rgba(255,255,255,0.05)",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    marginBottom: 12,
  },

  tabs: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 14,
  },

  tab: {
    padding: "12px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.09)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.64)",
    cursor: "pointer",
  },

  tabActive: {
    padding: "12px 8px",
    borderRadius: 999,
    border: "1px solid rgba(76,175,80,0.38)",
    background: "rgba(76,175,80,0.16)",
    color: "#ffffff",
    cursor: "pointer",
  },

  mirrorTile: {
    position: "relative",
    overflow: "hidden",
    aspectRatio: "16 / 9",
    borderRadius: 16,
    background:
      "linear-gradient(180deg, rgba(34,211,238,0.16), rgba(139,92,246,0.08)), linear-gradient(135deg, #25193a, #103b56, #141414)",
    border: "1px solid rgba(88,214,255,0.24)",
    marginBottom: 14,
  },

  mirrorGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 70% 20%, rgba(34,211,238,0.22), transparent 28%)",
  },

  mirrorBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.58)",
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
  },

  mirrorLabel: {
    position: "absolute",
    left: 10,
    bottom: 10,
    padding: "7px 10px",
    borderRadius: 10,
    background: "rgba(0,0,0,0.62)",
    fontWeight: 700,
  },

  packGrid: {
    display: "grid",
    gap: 12,
    marginBottom: 14,
  },

  allocationCard: {
    borderRadius: 20,
    padding: 16,
    background:
      "radial-gradient(circle at 0% 0%, rgba(236,72,153,0.18), transparent 34%), #141414",
    border: "1px solid rgba(255,255,255,0.09)",
  },

  allocationTitle: {
    margin: "0 0 10px",
    fontSize: 19,
  },

  allocationRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 0",
    color: "rgba(255,255,255,0.64)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 14,
  },

  floatingButton: {
    display: "none",
  },

  navStack: {
    position: "fixed",
    left: 12,
    right: 12,
    bottom: 12,
    display: "grid",
    gap: 7,
    zIndex: 30,
  },

  topNav: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 6,
    padding: 8,
    borderRadius: 24,
    background: "rgba(18,18,18,0.88)",
    border: "1px solid rgba(139,92,246,0.18)",
    backdropFilter: "blur(18px)",
  },

  bottomNav: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 6,
    padding: 8,
    borderRadius: 24,
    background: "rgba(18,18,18,0.92)",
    border: "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(18px)",
  },

  navItem: {
    border: 0,
    borderRadius: 17,
    padding: "9px 4px",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
  },

  nativeNavButton: {
    border: 0,
    borderRadius: 22,
    padding: "6px 4px 7px",
    background:
      "radial-gradient(circle at 30% 20%, rgba(34,211,238,0.26), transparent 34%), linear-gradient(135deg, rgba(124,58,237,0.82), rgba(236,72,153,0.78))",
    color: "#ffffff",
    boxShadow:
      "0 0 22px rgba(236,72,153,0.42), inset 0 0 0 1px rgba(255,255,255,0.14)",
    fontSize: 11,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    transform: "translateY(-9px)",
    minHeight: 58,
  },

  nativeNavIcon: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.26)",
    fontSize: 20,
    lineHeight: 1,
  },

  nativeNavLabel: {
    fontSize: 10,
    fontWeight: 800,
  },

  navItemActive: {
    background: "rgba(76,175,80,0.18)",
    color: "#ffffff",
    boxShadow: "inset 0 0 0 1px rgba(76,175,80,0.35)",
  },

  navItemActiveTop: {
    background: "rgba(139,92,246,0.2)",
    color: "#ffffff",
    boxShadow: "inset 0 0 0 1px rgba(216,180,254,0.22)",
  },

  navIcon: {
    fontSize: 16,
    lineHeight: 1,
  },

  marketHero: {
    borderRadius: 24,
    padding: 20,
    background:
      "radial-gradient(circle at 0% 0%, rgba(34,211,238,0.18), transparent 34%), radial-gradient(circle at 100% 0%, rgba(236,72,153,0.16), transparent 30%), rgba(20,20,20,0.9)",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "0 16px 42px rgba(0,0,0,0.28)",
    marginBottom: 14,
  },

  marketStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 14,
  },

  marketMiniCard: {
    minHeight: 76,
    borderRadius: 18,
    padding: 12,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 5,
    fontSize: 12,
    color: "rgba(255,255,255,0.56)",
  },

  marketMiniValue: {
    color: "#ffffff",
    fontSize: 15,
  },

  marketplaceGrid: {
    display: "grid",
    gap: 12,
  },

  marketplaceItem: {
    borderRadius: 18,
    padding: 14,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  marketplaceTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },

  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  chip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(139,92,246,0.18)",
    color: "#d8b4fe",
    border: "1px solid rgba(216,180,254,0.14)",
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  miniButton: {
    marginTop: 12,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.055)",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
  },

  miniButtonInline: {
    padding: "9px 12px",
    borderRadius: 13,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.055)",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  allocationDashboard: {
    borderRadius: 22,
    padding: 18,
    background:
      "radial-gradient(circle at 100% 0%, rgba(76,175,80,0.18), transparent 34%), rgba(20,20,20,0.9)",
    border: "1px solid rgba(76,175,80,0.18)",
    boxShadow: "0 16px 42px rgba(0,0,0,0.28)",
    marginBottom: 14,
  },

  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
    marginTop: 14,
  },

  progressFill: {
    width: "12%",
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(135deg, #4caf50, #22d3ee)",
  },

  gameHero: {
    borderRadius: 24,
    padding: 16,
    background:
      "radial-gradient(circle at 50% 0%, rgba(236,72,153,0.2), transparent 36%), rgba(20,20,20,0.9)",
    border: "1px solid rgba(255,255,255,0.09)",
    marginBottom: 14,
  },

  gameScreen: {
    position: "relative",
    height: 210,
    borderRadius: 20,
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(17,24,39,0.92), rgba(12,12,12,0.98))",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  factoryPipe: {
    position: "absolute",
    top: 28,
    left: "50%",
    width: 34,
    height: 78,
    transform: "translateX(-50%)",
    borderRadius: 16,
    background: "linear-gradient(180deg, #6b7280, #1f2937)",
    boxShadow: "0 0 18px rgba(255,255,255,0.08)",
  },

  factoryDrop: {
    position: "absolute",
    top: 94,
    left: "50%",
    width: 20,
    height: 48,
    transform: "translateX(-50%)",
    borderRadius: "50% 50% 45% 45%",
    background: "linear-gradient(180deg, #ffb347, #8b3a0e)",
    boxShadow: "0 0 26px rgba(255,179,71,0.35)",
  },

  factoryBelt: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 42,
    height: 42,
    borderRadius: 14,
    background:
      "repeating-linear-gradient(90deg, #1f2937 0px, #1f2937 18px, #111827 18px, #111827 36px)",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  factoryFlow: {
    position: "absolute",
    left: "36%",
    top: 9,
    width: "32%",
    height: 24,
    borderRadius: 999,
    background: "linear-gradient(90deg, #9a3412, #f97316, #7c2d12)",
    boxShadow: "0 0 18px rgba(249,115,22,0.3)",
  },

  factoryWarning: {
    position: "absolute",
    left: 14,
    top: 14,
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.48)",
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    fontWeight: 700,
  },

  missionItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "11px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
  },

  walletCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 10,
  },

  swapPreview: {
    borderRadius: 22,
    padding: 18,
    background:
      "radial-gradient(circle at 0% 0%, rgba(34,211,238,0.18), transparent 34%), rgba(20,20,20,0.9)",
    border: "1px solid rgba(34,211,238,0.16)",
    boxShadow: "0 16px 42px rgba(0,0,0,0.28)",
    marginBottom: 14,
  },

  swapBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.66)",
  },

  swapArrow: {
    textAlign: "center",
    padding: "8px 0",
    color: "rgba(255,255,255,0.5)",
  },

  sheetOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 90,
    background: "rgba(0,0,0,0.52)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 12,
    boxSizing: "border-box",
  },

  nativeSheet: {
    width: "100%",
    maxWidth: 520,
    borderRadius: "26px 26px 20px 20px",
    padding: "12px 16px 16px",
    background:
      "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.22), transparent 34%), rgba(18,18,18,0.98)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 -24px 80px rgba(0,0,0,0.62)",
    boxSizing: "border-box",
    textAlign: "center",
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    background: "rgba(255,255,255,0.2)",
    margin: "0 auto 14px",
  },

  nativeSheetIcon: {
    width: 70,
    height: 70,
    margin: "4px auto 14px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #7c3aed, #ec4899, #22d3ee)",
    boxShadow:
      "0 0 26px rgba(236,72,153,0.46), 0 0 70px rgba(34,211,238,0.18)",
    fontSize: 28,
    fontWeight: 900,
  },

  nativeSheetTitle: {
    margin: "0 0 8px",
    fontSize: 20,
  },

  nativeSheetText: {
    margin: "0 0 16px",
    color: "rgba(255,255,255,0.62)",
    lineHeight: 1.5,
    fontSize: 14,
  },
};
