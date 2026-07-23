"use client";

import { useEffect, useMemo, useState } from "react";

const rooms = [
  { id: "device", label: "Device", icon: "▣" },
  { id: "collab", label: "Collab", icon: "◈" },
  { id: "center", label: "Center", icon: "◎" },
  { id: "market", label: "Market", icon: "◍" },
  { id: "profile", label: "Profile", icon: "◌" },
];

const validRoomIds = ["device", "collab", "center", "market", "profile"];

export default function Home() {
  const [started, setStarted] = useState(false);
  const [activeRoom, setActiveRoom] = useState("center");
  const [telegramUser, setTelegramUser] = useState(null);
  const [bootReady, setBootReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedStarted = window.localStorage.getItem("pgm_started") === "1";
    const savedRoom = window.localStorage.getItem("pgm_active_room");

    if (savedStarted) {
      setStarted(true);
    }

    if (validRoomIds.includes(savedRoom)) {
      setActiveRoom(savedRoom);
    } else {
      setActiveRoom("center");
    }

    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      setTelegramUser(tg.initDataUnsafe?.user || null);
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
    setActiveRoom(roomId);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("pgm_active_room", roomId);
    }
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
    return <WelcomeScreen onStart={handleStart} telegramUser={telegramUser} />;
  }

  return (
    <div style={styles.appRoot}>
      <div style={styles.shell}>
        <RoomRenderer activeRoom={activeRoom} telegramUser={telegramUser} />

        {activeRoom === "center" && (
          <button
            style={styles.floatingButton}
            onClick={() => handleRoomChange("market")}
            title="Open Market Room"
          >
            ◎
          </button>
        )}

        <BottomNav activeRoom={activeRoom} setActiveRoom={handleRoomChange} />
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart, telegramUser }) {
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
          кабинет раннего участника и пресейловая витрина.
        </p>
      </section>
    </main>
  );
}

function RoomRenderer({ activeRoom, telegramUser }) {
  if (activeRoom === "device") return <DeviceRoom />;
  if (activeRoom === "collab") return <CollabRoom />;
  if (activeRoom === "market") return <MarketRoom />;
  if (activeRoom === "profile") return <ProfileRoom telegramUser={telegramUser} />;

  return <CenterRoom telegramUser={telegramUser} />;
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

function CenterRoom({ telegramUser }) {
  const name = telegramUser?.first_name || telegramUser?.username || "SceneAgent";

  return (
    <>
      <RoomHeader
        title="Center Room"
        subtitle={`Добро пожаловать, ${name}. Это главный зал Mini App.`}
        pill="Mini Gateway"
      />

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>PixelGridMacro Vision</h2>
        <p style={styles.cardText}>
          Нативное приложение — это инструмент зеркал, пиксельного сканера,
          записи жестов и multi-device orchestration. Mini App показывает
          архитектуру, профиль, маркет и путь к полной нативной платформе.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Что будет раскрыто через native app</h3>

        <div style={styles.featureGrid}>
          <Feature title="Remote Mirrors" text="PC, Android и LDPlayer-зеркала." />
          <Feature title="Pixel Scanner" text="Эталонные цветовые массивы по сценам." />
          <Feature title="Macro Engine" text="Запись жестов и воспроизведение сценариев." />
          <Feature title="Project Mindmap" text="Блочный конструктор сценариев." />
        </div>
      </section>

      <button style={styles.primaryAction}>Download Native App — soon</button>
    </>
  );
}

function DeviceRoom() {
  return (
    <>
      <RoomHeader
        title="Device Room"
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

function CollabRoom() {
  return (
    <>
      <RoomHeader
        title="Collab Room"
        subtitle="Зал будущих команд, рефералов и совместных проектов."
        pill="Community"
      />

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Invite builders</h3>
        <p style={styles.cardText}>
          В Mini App эта комната может стать местом приглашений, раннего доступа,
          реферальных веток и командных комнат.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Native collaboration</h3>
        <p style={styles.cardText}>
          В native app позже будут общие проекты, зеркала, права управления,
          совместное редактирование сценариев и рабочие комнаты.
        </p>
      </section>

      <button style={styles.primaryAction}>Share Mini App — soon</button>
    </>
  );
}

function MarketRoom() {
  const allocationPacks = [
    {
      name: "Starter",
      entry: "25 000 UGT",
      bonus: "50 000 locked UGT",
    },
    {
      name: "Builder",
      entry: "100 000 UGT",
      bonus: "200 000 locked UGT",
    },
    {
      name: "Pro",
      entry: "400 000 UGT",
      bonus: "800 000 locked UGT",
    },
    {
      name: "Founder",
      entry: "1 600 000 UGT",
      bonus: "3 200 000 locked UGT",
    },
  ];

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
        title="Market Room"
        subtitle="Маркетплейс проектов, зеркал, UGT-пакетов и ранних аллокаций."
        pill="UGT Market"
      />

      <section style={styles.marketHero}>
        <div>
          <h2 style={styles.cardTitle}>PixelGrid Marketplace</h2>
          <p style={styles.cardText}>
            Здесь позже будут продаваться и сдаваться в аренду проекты,
            сценарии автоматизации, emulator-зеркала и цифровые возможности
            экосистемы. Аллокации — отдельный ранний раздел внутри рынка.
          </p>
        </div>
      </section>

      <div style={styles.marketStatsGrid}>
        <section style={styles.marketMiniCard}>
          <strong style={styles.marketMiniValue}>0 UGT</strong>
          <span>Available balance</span>
        </section>

        <section style={styles.marketMiniCard}>
          <strong style={styles.marketMiniValue}>0 UGT</strong>
          <span>Locked allocation pool</span>
        </section>

        <section style={styles.marketMiniCard}>
          <strong style={styles.marketMiniValue}>Pre-launch</strong>
          <span>Round status</span>
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

              <button style={styles.miniButton}>Coming soon</button>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.allocationDashboard}>
        <div style={styles.marketplaceTopRow}>
          <div>
            <h3 style={styles.cardTitle}>Allocation Dashboard</h3>
            <p style={styles.cardText}>
              Общий пул раннего участия. Сюда могут попадать купленные пакеты,
              доливы и locked UGT за рекламу.
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
          <span style={styles.chip}>Buy pack</span>
          <span style={styles.chip}>Add to pool</span>
          <span style={styles.chip}>Watch ads</span>
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

              <button style={styles.miniButton}>Select package</button>
            </section>
          ))}
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Watch Ads → locked UGT</h3>
        <p style={styles.cardText}>
          Идея: за просмотр рекламы пользователь получает 1–2 locked UGT
          в свой allocation pool. Это не выводимый баланс, а внутренняя
          ранняя награда экосистемы.
        </p>
      </section>

      <p style={styles.smallNote}>
        UGT — внутренняя utility-валюта приложения для цифровых функций,
        аренды, покупок и доступа внутри PixelGridMacro.
      </p>
    </>
  );
}

function ProfileRoom({ telegramUser }) {
  const profile = useMemo(() => {
    return {
      name: telegramUser?.username || telegramUser?.first_name || "SceneAgent",
      id: telegramUser?.id || "browser-preview",
      balance: 0,
      locked: 0,
      allocations: 0,
    };
  }, [telegramUser]);

  function openNative() {
    if (typeof window === "undefined") return;
    window.location.href = `pixelgrid://open?telegram_id=${profile.id}`;
  }

  function resetMiniApp() {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem("pgm_started");
    window.localStorage.removeItem("pgm_active_room");
    window.location.reload();
  }

  return (
    <>
      <RoomHeader
        title="Profile Room"
        subtitle="Telegram профиль, UGT баланс и будущая связка с native account."
        pill="Account"
      />

      <section style={styles.profileCard}>
        <div style={styles.avatarCircle}>👤</div>
        <h2 style={styles.profileName}>{profile.name}</h2>
        <p style={styles.cardText}>Telegram ID: {profile.id}</p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Баланс</h3>

        <div style={styles.allocationRow}>
          <span>Available UGT</span>
          <strong>{profile.balance}</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Locked allocation UGT</span>
          <strong>{profile.locked}</strong>
        </div>

        <div style={styles.allocationRow}>
          <span>Allocations</span>
          <strong>{profile.allocations}</strong>
        </div>
      </section>

      <button style={styles.primaryAction} onClick={openNative}>
        Open Native App
      </button>

      <button style={styles.secondaryAction} onClick={resetMiniApp}>
        Reset Mini App Entrance
      </button>
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

function BottomNav({ activeRoom, setActiveRoom }) {
  return (
    <nav style={styles.bottomNav}>
      {rooms.map((room) => {
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
            <span>{room.label}</span>
          </button>
        );
      })}
    </nav>
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
    padding: "18px 16px 108px",
    boxSizing: "border-box",
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
    margin: "22px 0 0",
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

  profileCard: {
    borderRadius: 22,
    padding: 22,
    background: "rgba(20,20,20,0.88)",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "0 16px 42px rgba(0,0,0,0.28)",
    marginBottom: 14,
    textAlign: "center",
  },

  avatarCircle: {
    width: 96,
    height: 96,
    margin: "0 auto 14px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #1f2937, #111827)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 38,
  },

  profileName: {
    margin: "0 0 8px",
  },

  floatingButton: {
    position: "fixed",
    left: "50%",
    bottom: 76,
    transform: "translateX(-50%)",
    width: 66,
    height: 66,
    borderRadius: "50%",
    border: 0,
    color: "white",
    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
    boxShadow: "0 0 30px rgba(236,72,153,0.55)",
    fontSize: 24,
    cursor: "pointer",
    zIndex: 20,
  },

  bottomNav: {
    position: "fixed",
    left: 12,
    right: 12,
    bottom: 12,
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 6,
    padding: 8,
    borderRadius: 24,
    background: "rgba(18,18,18,0.92)",
    border: "1px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(18px)",
    zIndex: 30,
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

  navItemActive: {
    background: "rgba(76,175,80,0.18)",
    color: "#ffffff",
    boxShadow: "inset 0 0 0 1px rgba(76,175,80,0.35)",
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
};
