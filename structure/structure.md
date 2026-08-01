ungatus-lab-miniapp содержит такие внутри папки и документы : 

1) папка 1 : app
расположение:
ungatus-lab-miniapp/app/

содержит:

1.1) app/api/index/route.js
таким образом расположение целиком: 
ungatus-lab-miniapp/app/api/index/route.js 

Содержимое документа: 

export function GET() {
  return new Response("ok123");
}


-

1.2) app/center-room/page.js
таким образом расположение целиком: 
ungatus-lab-miniapp/app/center-room/page.js

Содержимое документа: 

"use client";

import { useRouter } from "next/navigation";

export default function CenterRoom() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        color: "white",
        padding: 30,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>
        Center Room
      </h1>

      {/* Описание */}
      <p style={{ fontSize: 16, lineHeight: "24px", marginBottom: 30 }}>
        Добро пожаловать в PixelGrid Mini App.<br />
        Здесь будет ваш дашборд, аллокации и инфо‑доска.<br />
        Center Room — главная комната Mini App.
      </p>

      {/* Заглушка будущего дашборда */}
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 20,
          marginBottom: 40,
          backgroundColor: "#141414",
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Дашборд (будет позже):</h3>

        <ul style={{ marginLeft: 20, lineHeight: "26px" }}>
          <li>UGT баланс</li>
          <li>Аллокации</li>
          <li>Статус пользователя</li>
          <li>Последние действия</li>
          <li>Мини‑карточки</li>
        </ul>
      </div>

      {/* Навигация */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button style={navButton} onClick={() => router.push("/main")}>
          Main Screen
        </button>

        <button style={navButton} onClick={() => router.push("/device-room")}>
          Device Room
        </button>

        <button style={navButton} onClick={() => router.push("/collab-room")}>
          Collab Room
        </button>

        <button style={navButton} onClick={() => router.push("/market-room")}>
          Market Room
        </button>

        <button style={navButton} onClick={() => router.push("/profile-room")}>
          Profile Room
        </button>
      </div>
    </div>
  );
}

const navButton = {
  padding: "12px 20px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  fontSize: 15,
};


-

1.3) app/collab-room/page.js
таким образом расположение целиком: 
ungatus-lab-miniapp/app/collab-room/page.js

Содержимое документа: 

"use client";

import { useRouter } from "next/navigation";

export default function CollabRoom() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        color: "white",
        padding: 30,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>
        Collab Room
      </h1>

      {/* Описание */}
      <p style={{ fontSize: 16, lineHeight: "24px", marginBottom: 30 }}>
        Комната коллабов PixelGrid.<br />
        В нативке здесь находятся проекты, совместная работа, обмен задачами и автоматизация между пользователями.<br />
        В Mini App эта комната работает как презентация.
      </p>

      {/* Блок возможностей */}
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 20,
          marginBottom: 40,
          backgroundColor: "#141414",
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Что будет доступно в нативке:</h3>

        <ul style={{ marginLeft: 20, lineHeight: "26px" }}>
          <li>Совместные проекты</li>
          <li>Обмен задачами</li>
          <li>Коллаб автоматизации</li>
          <li>Подключение к чужим устройствам</li>
          <li>Общий workspace</li>
        </ul>
      </div>

      {/* Навигация */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button style={navButton} onClick={() => router.push("/main")}>
          Main Screen
        </button>

        <button style={navButton} onClick={() => router.push("/device-room")}>
          Device Room
        </button>

        <button style={navButton} onClick={() => router.push("/center-room")}>
          Center Room
        </button>

        <button style={navButton} onClick={() => router.push("/market-room")}>
          Market Room
        </button>

        <button style={navButton} onClick={() => router.push("/profile-room")}>
          Profile Room
        </button>
      </div>
    </div>
  );
}

const navButton = {
  padding: "12px 20px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  fontSize: 15,
};


-

1.4) app/device-room/page.js
таким образом расположение целиком:
ungatus-lab-miniapp/app/device-room/page.js

Содержимое документа: 

"use client";

import { useRouter } from "next/navigation";

export default function DeviceRoom() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        color: "white",
        padding: 30,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>
        Device Room
      </h1>

      {/* Описание */}
      <p style={{ fontSize: 16, lineHeight: "24px", marginBottom: 30 }}>
        Комната устройств PixelGrid.<br />
        В нативке здесь находятся Remote Scanner, Multi‑Device, Emulator и другие инструменты.<br />
        В Mini App эта комната работает как презентация.
      </p>

      {/* Блок возможностей */}
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 20,
          marginBottom: 40,
          backgroundColor: "#141414",
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Что будет доступно в нативке:</h3>

        <ul style={{ marginLeft: 20, lineHeight: "26px" }}>
          <li>Remote Scanner</li>
          <li>Multi‑Device Control</li>
          <li>Device Emulator</li>
          <li>Системные сканеры</li>
          <li>Подключение к ПК и Android</li>
        </ul>
      </div>

      {/* Навигация */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button style={navButton} onClick={() => router.push("/main")}>
          Main Screen
        </button>

        <button style={navButton} onClick={() => router.push("/collab-room")}>
          Collab Room
        </button>

        <button style={navButton} onClick={() => router.push("/center-room")}>
          Center Room
        </button>

        <button style={navButton} onClick={() => router.push("/market-room")}>
          Market Room
        </button>

        <button style={navButton} onClick={() => router.push("/profile-room")}>
          Profile Room
        </button>
      </div>
    </div>
  );
}

const navButton = {
  padding: "12px 20px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  fontSize: 15,
};


-

1.5) app/main/page.js
таким образом расположение целиком:
ungatus-lab-miniapp/app/main/page.js

Содержимое документа: 

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MainRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pgm_started", "1");
      window.localStorage.setItem("pgm_active_room", "center");
    }

    router.replace("/");
  }, [router]);

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.22), transparent 32%), linear-gradient(180deg, #121212 0%, #0b0b0b 100%)",
        color: "white",
        display: "grid",
        placeItems: "center",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <section
        style={{
          width: "min(380px, calc(100% - 32px))",
          padding: 24,
          borderRadius: 24,
          background: "rgba(20,20,20,0.86)",
          border: "1px solid rgba(255,255,255,0.09)",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
        }}
      >
        <h1 style={{ margin: "0 0 10px", fontSize: 28 }}>
          PixelGridMacro
        </h1>

        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.64)",
            lineHeight: 1.5,
          }}
        >
          Opening Center Room...
        </p>
      </section>
    </main>
  );
}


-

1.6) app/market-room/page.js
таким образом расположение целиком:
ungatus-lab-miniapp/app/market-room/page.js

Содержимое документа: 

"use client";

import { useRouter } from "next/navigation";

export default function MarketRoom() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        color: "white",
        padding: 30,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>
        Market Room
      </h1>

      {/* Описание */}
      <p style={{ fontSize: 16, lineHeight: "24px", marginBottom: 30 }}>
        Комната маркетплейса PixelGrid.<br />
        В нативке здесь находятся пакеты мощностей, аренда инструментов,
        покупка автоматизации и внутренняя экономика UGT.<br />
        В Mini App эта комната работает как презентация.
      </p>

      {/* Блок возможностей */}
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 20,
          marginBottom: 40,
          backgroundColor: "#141414",
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Что будет доступно в нативке:</h3>

        <ul style={{ marginLeft: 20, lineHeight: "26px" }}>
          <li>Покупка мощностей</li>
          <li>Аренда инструментов</li>
          <li>Пакеты автоматизации</li>
          <li>UGT экономика</li>
          <li>Маркетплейс устройств</li>
        </ul>
      </div>

      {/* Навигация */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button style={navButton} onClick={() => router.push("/main")}>
          Main Screen
        </button>

        <button style={navButton} onClick={() => router.push("/device-room")}>
          Device Room
        </button>

        <button style={navButton} onClick={() => router.push("/collab-room")}>
          Collab Room
        </button>

        <button style={navButton} onClick={() => router.push("/center-room")}>
          Center Room
        </button>

        <button style={navButton} onClick={() => router.push("/profile-room")}>
          Profile Room
        </button>
      </div>
    </div>
  );
}

const navButton = {
  padding: "12px 20px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  fontSize: 15,
};


-

1.7) app/profile-room/page.js
таким образом расположение целиком:
ungatus-lab-miniapp/app/profile-room/page.js

Содержимое документа: 

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileRoom() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const telegramId = tg.initDataUnsafe.user.id;

    fetch(`/api/index?telegram_id=${telegramId}`)
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  if (!profile) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#0b0b0b",
          color: "white",
          padding: 30,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  const openNative = () => {
    const tg = window.Telegram.WebApp;
    const telegramId = tg.initDataUnsafe.user.id;
    window.location.href = `pixelgrid://open?telegram_id=${telegramId}`;
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        color: "white",
        padding: 30,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>
        Profile Room
      </h1>

      {/* Аватар */}
      <img
        src={profile.avatar_url || "/default_avatar.png"}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          marginBottom: 20,
          border: "2px solid #333",
        }}
      />

      {/* Ник */}
      <h2 style={{ marginBottom: 20 }}>{profile.nickname}</h2>

      {/* Статистика */}
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 20,
          backgroundColor: "#141414",
          marginBottom: 40,
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Статистика</h3>

        <p>Balance: {profile.balance} UGT</p>
        <p>Allocations: {profile.allocations.length}</p>
      </div>

      {/* Пакеты */}
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 20,
          backgroundColor: "#141414",
          marginBottom: 40,
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Пакеты</h3>

        {profile.packages.map(pkg => (
          <div
            key={pkg.id}
            style={{
              border: "1px solid #333",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              backgroundColor: "#1a1a1a",
            }}
          >
            <h4>{pkg.name}</h4>
            <p>{pkg.description}</p>
            <p>{pkg.price} UGT</p>
          </div>
        ))}
      </div>

      {/* Кнопка открытия нативки */}
      <button
        style={{
          padding: "12px 20px",
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: 8,
          color: "white",
          cursor: "pointer",
          fontSize: 15,
          marginBottom: 30,
        }}
        onClick={openNative}
      >
        Открыть комнаты (нативка)
      </button>

      {/* Навигация */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button style={navButton} onClick={() => router.push("/main")}>
          Main Screen
        </button>

        <button style={navButton} onClick={() => router.push("/device-room")}>
          Device Room
        </button>

        <button style={navButton} onClick={() => router.push("/collab-room")}>
          Collab Room
        </button>

        <button style={navButton} onClick={() => router.push("/center-room")}>
          Center Room
        </button>

        <button style={navButton} onClick={() => router.push("/market-room")}>
          Market Room
        </button>
      </div>
    </div>
  );
}

const navButton = {
  padding: "12px 20px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  fontSize: 15,
};


-

1.8) app/welcome/page.js
таким образом расположение целиком:
ungatus-lab-miniapp/app/welcome/page.js

Содержимое документа: 

"use client";

import { useEffect, useState } from "react";

export default function WelcomeScreen() {
  const [tg, setTg] = useState(null);

  useEffect(() => {
    // Телега есть → инициализируем WebApp
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      webapp.ready();
      webapp.expand();
      setTg(webapp);
    } else {
      // Нет Телеги (браузер) → просто живём без неё
      setTg(null);
    }
  }, []);

  const handleStart = async () => {
    const telegramId = tg?.initDataUnsafe?.user?.id ?? null;

    await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegram_id: telegramId })
    });

    // В телеге это нормально, в браузере тоже просто редирект
    window.location.href = "/main";
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <img src="/cat_welcome.png" style={{ width: 200, marginBottom: 20 }} />

      <h1>Welcome to PixelGrid</h1>

      <button
        style={{
          marginTop: 30,
          padding: "12px 24px",
          fontSize: 18,
          borderRadius: 12,
          background: "#4A90E2",
          color: "#fff",
          border: "none"
        }}
        onClick={handleStart}
      >
        GET STARTED
      </button>
    </div>
  );
}


-

1.9) app/layout.js
таким образом расположение целиком:
ungatus-lab-miniapp/app/layout.js

Содержимое документа: 

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}


-

1.10) app/page.js
таким образом расположение целиком:
ungatus-lab-miniapp/app/page.js

Содержимое документа: 

"use client";

import { useEffect, useMemo, useState } from "react";
import AppDrawer from "../components/shell/AppDrawer";
import PixelFlowSurvival from "../components/game/PixelFlowSurvival";
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
  const [gameOpen, setGameOpen] = useState(false);

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

  function openGame() {
    setGameOpen(true);
  }

  function closeGame() {
    setGameOpen(false);
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
          onLaunchGame={openGame}
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

        <PixelFlowSurvival open={gameOpen} onClose={closeGame} />
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

function RoomRenderer({ activeRoom, telegramUser, t, onLaunchGame }) {
  if (activeRoom === "game") {
    return <GameRoom t={t} onLaunchGame={onLaunchGame} />;
  }

  if (activeRoom === "squad") {
    return <SquadRoom telegramUser={telegramUser} t={t} />;
  }

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
          <Feature
            title="Native Builder"
            text="Scenario constructor, macro recorder и player."
          />
          <Feature
            title="Remote Mirrors"
            text="PC, Android и LDPlayer-зеркала."
          />
          <Feature
            title="Pixel Scanner"
            text="Эталонные цветовые массивы по сценам."
          />
          <Feature
            title="Project Mindmap"
            text="Блочный конструктор сценариев."
          />
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

function GameRoom({ t, onLaunchGame }) {
  return (
    <>
      <RoomHeader
        title={t("room_game_title")}
        subtitle="Виртуальный тренажёр сканера, эталонов, макросов и Auto Scenario."
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
        <h3 style={styles.cardTitle}>Scenario Survival: Pixel Flow</h3>
        <p style={styles.cardText}>
          Игра имитирует виртуальный эмулятор с камерой процесса. Игрок сначала
          вручную держит поток стабильным, затем сканирует эталоны, записывает
          исправления и включает Auto Scenario.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Training loop</h3>
        <p style={styles.cardText}>
          Сначала управляй процессом руками. Когда появится отклонение — сделай
          Scan, включи Record Fix и запиши корректирующее действие. После этого
          Auto сможет использовать этот fix в похожей ситуации.
        </p>

        <button style={styles.primaryAction} onClick={onLaunchGame}>
          Launch Scenario Survival
        </button>
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
      <section
        style={styles.nativeSheet}
        onClick={(event) => event.stopPropagation()}
      >
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



---

2) папка 2 : components
расположение:
ungatus-lab-miniapp/components

Содержит:

2.1) components/game/PixelFlowSurvival.jsx
таким образом расположение целиком:
ungatus-lab-miniapp/components/game/PixelFlowSurvival.jsx

Содержимое документа: 

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
  const selectedMonsterRef = useRef(null);
  const mapTutorialSeenRef = useRef(false);

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

  const totalGuards = getTotalGuardsFromStats(cityStats);
  const armyCap = cityStats.guardCap;
  const tutorialStep = getTutorialStep();
  const batchSummary = getBuildBatchSummary(buildBatchPreview);

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
    return cityRef.current.buildings.filter((building) => building.type === type).length;
  }

  function getTutorialStep() {
    const houseCount = getCityBuildingCount("House");
    const crystalCount = getCityBuildingCount("CrystalPoint");

    if (houseCount < TUTORIAL_HOUSE_TARGET) return "houses";
    if (crystalCount < TUTORIAL_CRYSTAL_TARGET) return "crystals";
    if (!mapTutorialSeenRef.current) return "map";

    return "done";
  }

  function shouldShowBuildTutorialArrow() {
    return (
      screen === "city" &&
      (tutorialStep === "houses" || tutorialStep === "crystals") &&
      !buildMenuOpen &&
      !buildMode &&
      !buildPreview
    );
  }

  function shouldShowCrystalMenuHint() {
    return screen === "city" && buildMenuOpen && tutorialStep === "crystals";
  }

  function shouldShowHouseMenuHint() {
    return screen === "city" && buildMenuOpen && tutorialStep === "houses";
  }

  function shouldShowMapTutorialArrow() {
    return (
      screen === "city" &&
      tutorialStep === "map" &&
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
          y: citadel.y - definition.h * CITY_GRID_STEP,
        },
        definition.w,
        definition.h
      );
    }

    return snapCityPointToGrid(
      {
        x: citadel.x + citadel.w * CITY_GRID_STEP,
        y: citadel.y,
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
    mapTutorialSeenRef.current = false;
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

    if (!Number.isFinite(stats.crystals)) {
      stats.crystals = 0;
    }

    stats.crystalRate = buildings
      .filter((building) => building.type === "CrystalPoint")
      .reduce((sum, building) => sum + (building.level || 1), 0);

    stats.crystals += stats.crystalRate * dt;

    for (const building of buildings) {
      if (building.type !== "Barracks") continue;

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
      .filter((building) => building.type === "CrystalPoint")
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
    const snappedPoint = snapToLandingGrid(rawPoint);

    teleportModeRef.current = false;
    updateLandingPreview(snappedPoint);
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
  }

  function cancelLandingPreview() {
    updateLandingPreview(null);
    teleportModeRef.current = false;
  }

  function enterCity() {
    updateLandingPreview(null);
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
      mapTutorialSeenRef.current = true;
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
      (type === "CrystalPoint" && tutorialStep === "crystals");

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

    if (type === "CrystalPoint" && getTutorialStep() === "crystals") {
      const rawDySteps = Math.round((target.y - anchorPreview.y) / Math.max(1, stepY));
      const directionY = rawDySteps < 0 ? -1 : 1;
      const count = Math.min(
        TUTORIAL_CRYSTAL_TARGET,
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
      });
    }

    stats.crystals = Math.max(0, stats.crystals - crystalCost);
    stats.workers = Math.max(0, stats.workers - workerCost);

    for (const building of newBuildings) {
      if (building.type === "House") {
        stats.workerCap += 5;
        stats.workers += 5;
        stats.guardCap += 25;
      }
    }

    cityRef.current = {
      ...cityRef.current,
      buildings: [...cityRef.current.buildings, ...newBuildings],
    };

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
      applyBuildings(buildBatchPreviewRef.current);
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
              <header style={styles.arenaHud}>
                <div style={styles.hudPill}>
                  <span>LV</span>
                  <strong>{hud.level}</strong>
                </div>

                <div style={styles.hudPill}>
                  <span>★</span>
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
                    ⌂
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
                    ⚔ 1/1
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
                    ...(hud.teleportMode ? styles.controlButtonActive : {}),
                  }}
                  onClick={activateTeleport}
                  title="Teleport"
                >
                  <span style={styles.controlIcon}>✦</span>
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

                <div style={styles.topResourceChip} title="Army">
                  <span>⚔</span>
                  <strong>
                    {totalGuards}/{armyCap}
                  </strong>
                </div>

                <div style={styles.topResourceChip} title="Level">
                  <span>★</span>
                  <strong>{cityStats.level}</strong>
                  <small>
                    {Math.floor(cityStats.xp)}/{getNextLevelXp(cityStats.level)}
                  </small>
                </div>
              </header>

              {shouldShowBuildTutorialArrow() && (
                <div style={styles.tutorialBuildArrow}>
                  <div style={styles.tutorialArrowIcon}>▼</div>
                </div>
              )}

              {buildMenuOpen && (
                <div style={styles.buildMenu}>
                  {(shouldShowCrystalMenuHint() || shouldShowHouseMenuHint()) && (
                    <div
                      style={{
                        ...styles.tutorialMenuArrow,
                        ...(shouldShowHouseMenuHint() ? styles.tutorialHouseMenuArrow : {}),
                      }}
                    >
                      <div style={styles.tutorialArrowIcon}>▼</div>
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
                      style={styles.buildCard}
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
                    ...styles.buildActions,
                    left: clamp(buildScreen.x + 28, 12, viewport.width - 140),
                    top: clamp(buildScreen.y + 36, 90, viewport.height - 166),
                  }}
                >
                  <button
                    style={{
                      ...styles.placeButton,
                      ...(batchSummary.valid > 0 ? {} : styles.placeButtonDisabled),
                    }}
                    onClick={placeBuilding}
                    onPointerDown={beginPlaceButtonPointer}
                    onPointerMove={movePlaceButtonPointer}
                    onPointerUp={endPlaceButtonPointer}
                    onPointerCancel={endPlaceButtonPointer}
                    disabled={batchSummary.valid <= 0}
                    title="Place"
                  >
                    ✓
                  </button>

                  <button style={styles.cancelButton} onClick={cancelBuildPreview}>
                    ×
                  </button>

                  <div style={styles.buildCostBadge}>
                    {batchSummary.workerCost > 0
                      ? `👥${batchSummary.workerCost}`
                      : `💎${batchSummary.crystalCost}`}
                    {batchSummary.valid > 1 ? ` x${batchSummary.valid}` : ""}
                  </div>

                  {tutorialStep !== "done" && buildBatchPreview.length <= 1 && (
                    <>
                      <div
                        style={{
                          ...styles.tutorialGhostPlace,
                          ...(tutorialStep === "crystals"
                            ? styles.tutorialGhostPlaceCrystal
                            : styles.tutorialGhostPlaceHouse),
                        }}
                      >
                        ✓
                      </div>

                      <div
                        style={{
                          ...styles.tutorialFinger,
                          ...(tutorialStep === "crystals"
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
                  <div style={styles.tutorialArrowIcon}>▼</div>
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

  tutorialBuildArrow: {
    position: "absolute",
    left: "32%",
    bottom: 70,
    zIndex: 8,
    width: 56,
    height: 56,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
    animation: "tutorialBounce 1.05s ease-in-out infinite",
  },

  tutorialMapArrow: {
    position: "absolute",
    left: "9%",
    bottom: 70,
    zIndex: 8,
    width: 56,
    height: 56,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
    animation: "tutorialBounce 1.05s ease-in-out infinite",
  },

  tutorialMenuArrow: {
    position: "absolute",
    left: "10%",
    top: -38,
    zIndex: 9,
    width: 56,
    height: 56,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
    animation: "tutorialBounce 1.05s ease-in-out infinite",
  },

  tutorialHouseMenuArrow: {
    left: "35%",
  },

  tutorialArrowIcon: {
    color: "#fbbf24",
    fontSize: 34,
    lineHeight: "34px",
    textShadow: "0 0 18px rgba(251,191,36,0.75)",
    fontWeight: 900,
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
    minWidth: 42,
    height: 30,
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #22c55e, #15803d)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
    touchAction: "none",
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

  controlButtonActive: {
    border: "1px solid rgba(251,191,36,0.55)",
    background: "rgba(251,191,36,0.22)",
    color: "#fde68a",
  },
};


-

2.2) components/shell/AppDrawer.jsx
таким образом расположение целиком:
ungatus-lab-miniapp/components/shell/AppDrawer.jsx

Содержимое документа: 

"use client";

import { useState } from "react";
import { getLanguageName, supportedLanguages } from "../../lib/i18n/language";

export default function AppDrawer({
  open,
  telegramUser,
  language,
  t,
  onSelectLanguage,
  onClose,
  onResetEntrance,
  onResetTestData,
}) {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);

  if (!open) return null;

  const profileName =
    telegramUser?.username || telegramUser?.first_name || "SceneAgent";

  const telegramId = telegramUser?.id || "browser-preview";

  function safeResetEntrance() {
    if (typeof onResetEntrance === "function") {
      onResetEntrance();
    }
  }

  function safeResetTestData() {
    if (typeof onResetTestData === "function") {
      onResetTestData();
    }
  }

  function handleLanguageSelect(languageCode) {
    if (typeof onSelectLanguage === "function") {
      onSelectLanguage(languageCode);
    }

    setLanguageOpen(false);
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <aside style={styles.drawer} onClick={(event) => event.stopPropagation()}>
        <div style={styles.drawerTop}>
          <div style={styles.brandRow}>
            <div style={styles.brandMark}>PGM</div>

            <div>
              <h2 style={styles.brandTitle}>PixelGridMacro</h2>
              <p style={styles.brandSubtitle}>Mini App account</p>
            </div>
          </div>

          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <section style={styles.profileCard}>
          <div style={styles.avatarCircle}>👤</div>

          <div style={styles.profileInfo}>
            <h3 style={styles.profileName}>{profileName}</h3>
            <p style={styles.profileMeta}>Telegram ID: {telegramId}</p>
          </div>
        </section>

        <section style={styles.quickStats}>
          <div style={styles.statCard}>
            <strong>0</strong>
            <span>Available UGT</span>
          </div>

          <div style={styles.statCard}>
            <strong>0</strong>
            <span>Locked UGT</span>
          </div>

          <div style={styles.statCard}>
            <strong>0</strong>
            <span>Referrals</span>
          </div>
        </section>

        <section style={styles.menuSection}>
          <button
            style={styles.settingsHeader}
            onClick={() => setSettingsOpen((value) => !value)}
          >
            <span>⚙ {t("settings_title")}</span>
            <strong>{settingsOpen ? "−" : "+"}</strong>
          </button>

          {settingsOpen && (
            <div style={styles.settingsBody}>
              <button
                style={styles.settingsItem}
                onClick={() => setLanguageOpen((value) => !value)}
              >
                <span>{t("language_title")}</span>

                <span style={styles.settingsItemRight}>
                  <span style={styles.languageBadge}>
                    {String(language).toUpperCase()}
                  </span>
                  <span style={styles.chevron}>{languageOpen ? "⌃" : "⌄"}</span>
                </span>
              </button>

              {languageOpen && (
                <div style={styles.languageList}>
                  {supportedLanguages.map((languageCode) => {
                    const active = languageCode === language;

                    return (
                      <button
                        key={languageCode}
                        style={{
                          ...styles.languageOption,
                          ...(active ? styles.languageOptionActive : {}),
                        }}
                        onClick={() => handleLanguageSelect(languageCode)}
                      >
                        <span style={styles.languageCode}>
                          {languageCode.toUpperCase()}
                        </span>

                        <span style={styles.languageName}>
                          {getLanguageName(languageCode)}
                        </span>

                        {active && <span style={styles.activeMark}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={styles.disabledItem}>
                <span>Payment methods</span>
                <small>later</small>
              </div>

              <div style={styles.disabledItem}>
                <span>Theme / Background</span>
                <small>later</small>
              </div>

              <div style={styles.divider} />

              <button style={styles.dangerSoftButton} onClick={safeResetTestData}>
                Reset test data
              </button>

              <button style={styles.dangerButton} onClick={safeResetEntrance}>
                {t("profile_reset_entrance")}
              </button>
            </div>
          )}
        </section>

        <section style={styles.menuSection}>
          <h4 style={styles.sectionTitle}>Support</h4>

          <div style={styles.disabledItem}>
            <span>Support / Channel</span>
            <small>soon</small>
          </div>
        </section>

        <p style={styles.footerNote}>
          Profile and settings live here. Product rooms stay in the navigation.
        </p>
      </aside>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    background: "rgba(0,0,0,0.54)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "flex-start",
  },

  drawer: {
    width: "min(340px, calc(100% - 34px))",
    height: "100vh",
    overflowY: "auto",
    padding: "18px 14px 22px",
    boxSizing: "border-box",
    background:
      "radial-gradient(circle at 0% 0%, rgba(139,92,246,0.24), transparent 34%), rgba(18,18,18,0.98)",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "24px 0 80px rgba(0,0,0,0.62)",
    color: "#ffffff",
  },

  drawerTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  brandMark: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #7c3aed, #ec4899, #22d3ee)",
    boxShadow:
      "0 0 20px rgba(236,72,153,0.45), 0 0 48px rgba(34,211,238,0.18)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.08em",
  },

  brandTitle: {
    margin: 0,
    fontSize: 18,
    letterSpacing: "-0.03em",
  },

  brandSubtitle: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontSize: 24,
    lineHeight: 1,
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 22,
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.09)",
    marginBottom: 12,
  },

  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #1f2937, #111827)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 24,
    flexShrink: 0,
  },

  profileInfo: {
    minWidth: 0,
  },

  profileName: {
    margin: 0,
    fontSize: 16,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  profileMeta: {
    margin: "5px 0 0",
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    wordBreak: "break-word",
  },

  quickStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 12,
  },

  statCard: {
    minHeight: 62,
    padding: 10,
    borderRadius: 16,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
  },

  menuSection: {
    borderRadius: 22,
    padding: 12,
    background: "rgba(20,20,20,0.88)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 12,
  },

  sectionTitle: {
    margin: "0 0 10px",
    color: "rgba(255,255,255,0.44)",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  settingsHeader: {
    width: "100%",
    padding: "12px 12px",
    border: 0,
    borderRadius: 16,
    background: "rgba(139,92,246,0.16)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
  },

  settingsBody: {
    paddingTop: 12,
  },

  settingsItem: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 15,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.045)",
    color: "rgba(255,255,255,0.82)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 8,
  },

  settingsItemRight: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },

  languageBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 42,
    padding: "7px 9px",
    borderRadius: 999,
    background: "rgba(34,211,238,0.14)",
    color: "#a5f3fc",
    border: "1px solid rgba(165,243,252,0.16)",
    fontSize: 12,
    fontWeight: 900,
  },

  chevron: {
    color: "rgba(255,255,255,0.46)",
    fontSize: 15,
    fontWeight: 900,
  },

  languageList: {
    display: "grid",
    gap: 7,
    padding: "0 0 10px",
  },

  languageOption: {
    width: "100%",
    padding: "10px 11px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.035)",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "42px 1fr 20px",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
    fontSize: 13,
    fontWeight: 800,
  },

  languageOptionActive: {
    background: "rgba(76,175,80,0.16)",
    color: "#ffffff",
    border: "1px solid rgba(76,175,80,0.36)",
  },

  languageCode: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 34,
    padding: "5px 6px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    fontSize: 11,
  },

  languageName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  activeMark: {
    color: "#86efac",
    fontSize: 14,
    fontWeight: 900,
    textAlign: "right",
  },

  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    margin: "12px 0",
  },

  dangerSoftButton: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.045)",
    color: "rgba(255,255,255,0.72)",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 8,
  },

  dangerButton: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(248,113,113,0.22)",
    background: "rgba(248,113,113,0.09)",
    color: "#fecaca",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 800,
  },

  disabledItem: {
    padding: "11px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 8,
  },

  footerNote: {
    margin: "14px 4px 0",
    color: "rgba(255,255,255,0.34)",
    fontSize: 11,
    lineHeight: 1.45,
  },
};


---

3) папка 3 : lib
расположение:
ungatus-lab-miniapp/lib

Содержит:

3.1) lib/i18n/language.js
таким образом расположение целиком:
ungatus-lab-miniapp/lib/i18n/language.js

Содержимое документа: 

import { translations } from "./translations";

export const defaultLanguage = "ru";

export const supportedLanguages = ["ru", "en", "tr", "et"];

export function normalizeLanguage(language) {
  if (!language) return defaultLanguage;

  const shortLanguage = String(language).toLowerCase().slice(0, 2);

  if (supportedLanguages.includes(shortLanguage)) {
    return shortLanguage;
  }

  return defaultLanguage;
}

export function getSavedLanguage() {
  if (typeof window === "undefined") return defaultLanguage;

  const savedLanguage = window.localStorage.getItem("pgm_language");
  return normalizeLanguage(savedLanguage);
}

export function saveLanguage(language) {
  if (typeof window === "undefined") return;

  const normalizedLanguage = normalizeLanguage(language);
  window.localStorage.setItem("pgm_language", normalizedLanguage);
}

export function getLanguageName(language) {
  const normalizedLanguage = normalizeLanguage(language);
  return translations[normalizedLanguage]?.language_name || "Русский";
}

export function createTranslator(language) {
  const normalizedLanguage = normalizeLanguage(language);

  return function t(key) {
    return (
      translations[normalizedLanguage]?.[key] ||
      translations[defaultLanguage]?.[key] ||
      key
    );
  };
}


-

3.2) lib/i18n/translations.js
таким образом расположение целиком:
ungatus-lab-miniapp/lib/i18n/translations.js

Содержимое документа: 

export const translations = {
  ru: {
    language_code: "ru",
    language_name: "Русский",

    settings_title: "Настройки",
    language_title: "Язык",
    language_subtitle: "Выберите язык интерфейса Mini App.",
    language_current: "Текущий язык",
    language_change: "Изменить язык",
    language_close: "Закрыть",

    nav_game: "Game",
    nav_squad: "Squad",
    nav_earn: "Earn",
    nav_allocation: "Allocation",
    nav_wallet: "Wallet",

    nav_device: "Device",
    nav_collab: "Collab",
    nav_center: "Center",
    nav_market: "Market",
    nav_profile: "Profile",

    room_game_title: "Game Room",
    room_squad_title: "Squad Room",
    room_earn_title: "Earn Room",
    room_allocation_title: "Allocation Room",
    room_wallet_title: "Wallet Room",
    room_device_title: "Device Room",
    room_collab_title: "Collab Room",
    room_center_title: "Center Room",
    room_market_title: "Market Room",
    room_profile_title: "Profile Room",

    common_soon: "Скоро",
    common_connect: "Подключить",
    common_done: "Готово",
    common_dynamic: "dynamic",
    common_loading: "Loading Mini App...",

    profile_account_summary: "Account Summary",
    profile_wallet_moved_title: "Wallet moved",
    profile_open_native: "Open Native App",
    profile_reset_entrance: "Reset Mini App Entrance",
  },

  en: {
    language_code: "en",
    language_name: "English",

    settings_title: "Settings",
    language_title: "Language",
    language_subtitle: "Choose the Mini App interface language.",
    language_current: "Current language",
    language_change: "Change language",
    language_close: "Close",

    nav_game: "Game",
    nav_squad: "Squad",
    nav_earn: "Earn",
    nav_allocation: "Allocation",
    nav_wallet: "Wallet",

    nav_device: "Device",
    nav_collab: "Collab",
    nav_center: "Center",
    nav_market: "Market",
    nav_profile: "Profile",

    room_game_title: "Game Room",
    room_squad_title: "Squad Room",
    room_earn_title: "Earn Room",
    room_allocation_title: "Allocation Room",
    room_wallet_title: "Wallet Room",
    room_device_title: "Device Room",
    room_collab_title: "Collab Room",
    room_center_title: "Center Room",
    room_market_title: "Market Room",
    room_profile_title: "Profile Room",

    common_soon: "Soon",
    common_connect: "Connect",
    common_done: "Done",
    common_dynamic: "dynamic",
    common_loading: "Loading Mini App...",

    profile_account_summary: "Account Summary",
    profile_wallet_moved_title: "Wallet moved",
    profile_open_native: "Open Native App",
    profile_reset_entrance: "Reset Mini App Entrance",
  },

  tr: {
    language_code: "tr",
    language_name: "Türkçe",

    settings_title: "Ayarlar",
    language_title: "Dil",
    language_subtitle: "Mini App arayüz dilini seçin.",
    language_current: "Geçerli dil",
    language_change: "Dili değiştir",
    language_close: "Kapat",

    nav_game: "Game",
    nav_squad: "Squad",
    nav_earn: "Earn",
    nav_allocation: "Allocation",
    nav_wallet: "Wallet",

    nav_device: "Device",
    nav_collab: "Collab",
    nav_center: "Center",
    nav_market: "Market",
    nav_profile: "Profile",

    room_game_title: "Game Room",
    room_squad_title: "Squad Room",
    room_earn_title: "Earn Room",
    room_allocation_title: "Allocation Room",
    room_wallet_title: "Wallet Room",
    room_device_title: "Device Room",
    room_collab_title: "Collab Room",
    room_center_title: "Center Room",
    room_market_title: "Market Room",
    room_profile_title: "Profile Room",

    common_soon: "Yakında",
    common_connect: "Bağlan",
    common_done: "Tamam",
    common_dynamic: "dynamic",
    common_loading: "Mini App yükleniyor...",

    profile_account_summary: "Hesap özeti",
    profile_wallet_moved_title: "Wallet ayrı bölüme taşındı",
    profile_open_native: "Native App aç",
    profile_reset_entrance: "Mini App girişini sıfırla",
  },

  et: {
    language_code: "et",
    language_name: "Eesti",

    settings_title: "Seaded",
    language_title: "Keel",
    language_subtitle: "Vali Mini App liidese keel.",
    language_current: "Praegune keel",
    language_change: "Muuda keelt",
    language_close: "Sulge",

    nav_game: "Game",
    nav_squad: "Squad",
    nav_earn: "Earn",
    nav_allocation: "Allocation",
    nav_wallet: "Wallet",

    nav_device: "Device",
    nav_collab: "Collab",
    nav_center: "Center",
    nav_market: "Market",
    nav_profile: "Profile",

    room_game_title: "Game Room",
    room_squad_title: "Squad Room",
    room_earn_title: "Earn Room",
    room_allocation_title: "Allocation Room",
    room_wallet_title: "Wallet Room",
    room_device_title: "Device Room",
    room_collab_title: "Collab Room",
    room_center_title: "Center Room",
    room_market_title: "Market Room",
    room_profile_title: "Profile Room",

    common_soon: "Varsti",
    common_connect: "Ühenda",
    common_done: "Valmis",
    common_dynamic: "dynamic",
    common_loading: "Mini App laadimine...",

    profile_account_summary: "Konto kokkuvõte",
    profile_wallet_moved_title: "Wallet on eraldi jaotises",
    profile_open_native: "Ava Native App",
    profile_reset_entrance: "Lähtesta Mini App sissepääs",
  },
};


---

4) папка 4 : public
расположение:
ungatus-lab-miniapp/public

Содержит:

4.1) public/style.css
таким образом расположение целиком:
ungatus-lab-miniapp/public/style.css

Содержимое документа: 

body {
  background: #111;
  color: #fff;
  font-family: Arial;
  text-align: center;
  padding: 20px;
}

button {
  padding: 15px;
  margin: 10px;
  width: 80%;
  font-size: 18px;
  border-radius: 10px;
}

.hidden {
  display: none;
}


---

5) Документ 1 : 
.gitignore
расположение:
ungatus-lab-miniapp/.gitignore

Содержимое документа: 

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.*
!.env.example

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist
.output

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# vuepress v2.x temp directory
.temp

# Sveltekit cache directory
.svelte-kit/

# vitepress build output
**/.vitepress/dist

# vitepress cache directory
**/.vitepress/cache

# Docusaurus cache and generated files
.docusaurus

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# Firebase cache directory
.firebase/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# pnpm
.pnpm-store

# yarn v3
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Vite files
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
.vite/


---

6) Документ 2 :
LICENSE (я при создании репозитория на гитхабе выбирал MIt) 
расположение:
ungatus-lab-miniapp/LICENSE

Содержимое документа: 

MIT License

Copyright (c) 2026 ungatus-lab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


---

7) Документ 3 : 
README.md
расположение:
ungatus-lab-miniapp/README.md

Содержимое документа: 

mini app ungatus-lab


---

8) Документ 4 : 
next.config.js
расположение:
ungatus-lab-miniapp/next.config.js

Содержимое документа: 

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone'
};

module.exports = nextConfig;


---

9) Документ 5 : 
package.json
расположение: 
ungatus-lab-miniapp/package.json

Содержимое документа: 

{
  "name": "ungatus-lab-miniapp",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.0.7",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}


---

10) Данный документ был создан тоже как structure/structure
расположение:
ungatus-lab-miniapp/structure/structure

содержимое:

все что до этой строки включительно. С последним обновлением включительно. 

