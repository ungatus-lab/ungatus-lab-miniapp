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
import AccountStationPrototype from "../components/station/AccountStationPrototype";
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
  const [stationOpen, setStationOpen] = useState(false);

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

  function openStationPrototype() {
    setStationOpen(true);
  }

  function closeStationPrototype() {
    setStationOpen(false);
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
          onLaunchStation={openStationPrototype}
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

        <AccountStationPrototype
          open={stationOpen}
          onClose={closeStationPrototype}
          onOpenProfile={() => setDrawerOpen(true)}
          onLaunchGame={openGame}
          telegramUser={telegramUser}
          t={t}
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

function RoomRenderer({
  activeRoom,
  telegramUser,
  t,
  onLaunchGame,
  onLaunchStation,
}) {
  if (activeRoom === "game") {
    return (
      <GameRoom
        t={t}
        onLaunchGame={onLaunchGame}
        onLaunchStation={onLaunchStation}
      />
    );
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

function GameRoom({ t, onLaunchGame, onLaunchStation }) {
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

        <button style={styles.secondaryAction} onClick={onLaunchStation}>
          Launch Account Station Prototype
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

Файл отдельно со своим содержимым потому что огромный...


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
    zIndex: 260,
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
      "radial-gradient(circle at 0% 0%, rgba(88,215,255,0.18), transparent 34%), linear-gradient(180deg,rgba(5,17,32,.995),rgba(2,7,17,.995))",
    borderRight: "1px solid rgba(88,215,255,.2)",
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
    background: "linear-gradient(135deg,#153a59,#2c94c7,#58d7ff)",
    boxShadow:
      "0 0 24px rgba(88,215,255,.34), 0 0 58px rgba(44,148,199,.18)",
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
    background: "rgba(88,215,255,.11)",
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
    background: "rgba(88,215,255,.13)",
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


-


2) папка 2.3 : components/station/
расположение:
ungatus-lab-miniapp/components/station/

Содержит:

2.3.1) components/station/AccountStationPrototype.jsx
таким образом расположение целиком:
ungatus-lab-miniapp/components/station/AccountStationPrototype.jsx

Содержимое документа: 

"use client";

import { useEffect, useMemo, useState } from "react";
import StationThreeView from "./StationThreeView";
import StationHomeHUD from "./StationHomeHUD";
import {
  MODULES,
  MODULE_DETAILS,
  PREMIUM_TIERS,
} from "./stationConfig";
import {
  completeMission,
  loadStationProgress,
  subscribeStationProgress,
} from "./stationProgress";

const COMPLEX_TO_MODULE = {
  nativeLab: "scanner",
  projectVault: "market",
  communityRelay: "collab",
  economyDock: "wallet",
};

export default function AccountStationPrototype({
  open = true,
  onClose,
  onOpenProfile,
  onLaunchGame,
  onLaunchTraining,
  telegramUser,
}) {
  const [activeId, setActiveId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [cameraReturnSignal, setCameraReturnSignal] = useState(0);
  const [cameraState, setCameraState] = useState("home");

  useEffect(() => {
    if (!open) return undefined;
    setProgress(loadStationProgress());
    completeMission("openedStation");
    return subscribeStationProgress(setProgress);
  }, [open]);

  const active = useMemo(
    () => MODULES.find((module) => module.id === activeId) || null,
    [activeId]
  );

  if (!open) return null;

  function openComplex(complexId) {
    const moduleId = COMPLEX_TO_MODULE[complexId];
    if (!moduleId) return;

    if (complexId === "nativeLab") completeMission("viewedNativeLab");
    if (complexId === "projectVault") completeMission("viewedProjectVault");

    setActiveId(moduleId);
  }

  function closeModulePanel() {
    setActiveId(null);
    setCameraReturnSignal((value) => value + 1);
  }

  function launchTraining() {
    completeMission("viewedNativeLab");
    if (typeof onLaunchTraining === "function") {
      onLaunchTraining();
      return;
    }
    setActiveId("scanner");
  }

  function launchArena() {
    completeMission("playedArena");
    if (typeof onLaunchGame === "function") onLaunchGame();
  }

  return (
    <main style={styles.root}>
      <style>{css}</style>

      <section style={styles.viewport}>
        <StationThreeView
          onSelectModule={setActiveId}
          onCameraStateChange={setCameraState}
          returnHomeSignal={cameraReturnSignal}
        />
      </section>

      <StationHomeHUD
        telegramUser={telegramUser}
        onOpenProfile={onOpenProfile}
        onOpenModule={openComplex}
        onLaunchTraining={launchTraining}
        onLaunchArena={launchArena}
        compact={Boolean(active) || cameraState === "moving" || cameraState === "returning"}
      />

      {typeof onClose === "function" && !active && (
        <button
          type="button"
          style={styles.exitButton}
          onClick={onClose}
          aria-label="Закрыть станцию"
        >
          ×
        </button>
      )}

      {active && (
        <ModulePanel
          module={active}
          generation={progress?.station?.generation || 1}
          onClose={closeModulePanel}
          onLaunchGame={launchArena}
        />
      )}
    </main>
  );
}

function ModulePanel({ module, generation, onClose, onLaunchGame }) {
  const data = MODULE_DETAILS[module.id];
  if (!data) return null;

  return (
    <div
      style={styles.panelShade}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section style={{ ...styles.panel, borderColor: `${module.color}55` }}>
        <div style={styles.sheetHandle} />

        <header style={styles.panelHeader}>
          <button
            type="button"
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть раздел"
          >
            ×
          </button>

          <span style={{ ...styles.panelIcon, color: module.color }}>
            {module.icon}
          </span>

          <div style={styles.panelIdentity}>
            <small>{module.subtitle}</small>
            <b>{module.title}</b>
          </div>

          <em>G{generation}</em>
        </header>

        <div style={styles.hero}>
          <small>STATION SYSTEM</small>
          <h2>{data.heading}</h2>
          <p>{data.text}</p>
        </div>

        <div style={styles.metricGrid}>
          {data.metrics.map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <b>{value}</b>
            </div>
          ))}
        </div>

        {module.id === "premium" ? (
          <div style={styles.packGrid}>
            {PREMIUM_TIERS.map(([tier, price, feature]) => (
              <div key={tier} style={styles.pack}>
                <b>{tier}</b>
                <span>{price}</span>
                <small>{feature}</small>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.detailRows}>
            {data.rows.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        )}

        {module.id === "game" && (
          <button type="button" style={styles.launchButton} onClick={onLaunchGame}>
            ENTER PVP RIFT
          </button>
        )}
      </section>
    </div>
  );
}

const css = `
button { touch-action: manipulation; }
@keyframes stationSheetOpen {
  from { opacity:0; transform:translateY(34px) scale(.985); }
  to { opacity:1; transform:none; }
}
`;

const styles = {
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 180,
    overflow: "hidden",
    background: "#010207",
    color: "#f2fbff",
    fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif",
  },
  viewport: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    touchAction: "none",
    userSelect: "none",
    background: "#010207",
  },
  exitButton: {
    position: "absolute",
    zIndex: 96,
    top: "calc(max(10px, env(safe-area-inset-top)) + 9px)",
    right: 88,
    width: 38,
    height: 38,
    padding: 0,
    borderRadius: 13,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(3,9,22,.74)",
    backdropFilter: "blur(15px)",
    color: "rgba(255,255,255,.8)",
    fontSize: 22,
    cursor: "pointer",
  },
  panelShade: {
    position: "absolute",
    inset: 0,
    zIndex: 120,
    display: "flex",
    alignItems: "flex-end",
    padding: "12px 10px max(12px, env(safe-area-inset-bottom))",
    boxSizing: "border-box",
    background:
      "linear-gradient(180deg,transparent 5%,rgba(0,2,8,.22) 34%,rgba(0,2,8,.94) 76%)",
    backdropFilter: "blur(2px)",
  },
  panel: {
    width: "100%",
    maxHeight: "72vh",
    overflowY: "auto",
    padding: "8px 12px 14px",
    boxSizing: "border-box",
    borderRadius: "26px 26px 17px 17px",
    background:
      "radial-gradient(circle at 100% 0,rgba(34,211,238,.11),transparent 34%),linear-gradient(180deg,rgba(7,22,42,.98),rgba(2,7,17,.995))",
    border: "1px solid",
    boxShadow: "0 -30px 100px rgba(0,0,0,.82)",
    animation: "stationSheetOpen .34s ease-out",
  },
  sheetHandle: {
    width: 42,
    height: 4,
    margin: "0 auto 9px",
    borderRadius: 99,
    background: "rgba(255,255,255,.18)",
  },
  panelHeader: {
    display: "grid",
    gridTemplateColumns: "38px 40px 1fr auto",
    gap: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    padding: 0,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.05)",
    color: "white",
    fontSize: 20,
  },
  panelIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.05)",
    fontSize: 20,
  },
  panelIdentity: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  hero: {
    padding: 14,
    borderRadius: 17,
    background: "rgba(255,255,255,.035)",
    border: "1px solid rgba(255,255,255,.075)",
    marginBottom: 9,
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 6,
  },
  detailRows: {
    marginTop: 9,
    padding: "4px 12px",
    borderRadius: 15,
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.07)",
  },
  packGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: 7,
    marginTop: 9,
  },
  pack: {
    padding: 11,
    borderRadius: 14,
    background: "rgba(52,211,153,.06)",
    border: "1px solid rgba(52,211,153,.17)",
    display: "flex",
    flexDirection: "column",
  },
  launchButton: {
    width: "100%",
    minHeight: 50,
    marginTop: 10,
    border: 0,
    borderRadius: 15,
    background: "linear-gradient(135deg,#e11d48,#7c3aed,#0891b2)",
    color: "white",
    fontWeight: 950,
    letterSpacing: ".08em",
    boxShadow: "0 0 34px rgba(225,29,72,.25)",
  },
};



-

2.3.2) components/station/StationHomeHUD.jsx
таким образом расположение целиком:
ungatus-lab-miniapp/components/station/StationHomeHUD.jsx

Содержимое документа: 

"use client";

import { useEffect, useState } from "react";
import {
  loadStationProgress,
  subscribeStationProgress,
  xpRequiredForLevel,
} from "./stationProgress";

export default function StationHomeHUD({
  telegramUser,
  onOpenProfile,
  onLaunchTraining,
  onLaunchArena,
  compact = false,
}) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProgress(loadStationProgress());
    return subscribeStationProgress(setProgress);
  }, []);

  if (!progress) return null;

  const name = telegramUser?.first_name || telegramUser?.username || "SceneAgent";
  const required = xpRequiredForLevel(progress.operator.level);
  const percent = Math.min(100, (progress.operator.xp / Math.max(1, required)) * 100);

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <button type="button" style={styles.profile} onClick={onOpenProfile}>
        <span style={styles.avatar}>PG</span>
        <span style={styles.identity}>
          <b>{name}</b>
          <small>ОПЕРАТОР · УРОВЕНЬ {progress.operator.level}</small>
          <span style={styles.xpTrack}>
            <i style={{ ...styles.xpFill, width: `${percent}%` }} />
          </span>
        </span>
        <span style={styles.generation}>G{progress.station.generation}</span>
      </button>

      {!compact && (
        <div style={styles.hint}>
          <span style={styles.hintDot} />
          <span>Нажмите светящийся комплекс станции</span>
        </div>
      )}

      {!compact && (
        <div style={styles.bottomRow}>
          <button type="button" style={styles.mission} onClick={onLaunchTraining}>
            <small>ПЕРВАЯ МИССИЯ</small>
            <b>Обучение автоматизации</b>
            <span>+XP</span>
          </button>

          <button type="button" style={styles.arena} onClick={onLaunchArena}>
            <small>АРЕНА</small>
            <b>В БОЙ</b>
          </button>
        </div>
      )}
    </div>
  );
}

const css = `
@keyframes hudPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes arenaPulse { 0%,100%{box-shadow:0 0 18px rgba(244,63,94,.22)} 50%{box-shadow:0 0 36px rgba(139,92,246,.38)} }
`;

const glass = {
  background: "linear-gradient(145deg,rgba(3,10,24,.82),rgba(7,5,20,.64))",
  border: "1px solid rgba(150,220,255,.16)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const styles = {
  root: { position:"absolute", inset:0, zIndex:90, pointerEvents:"none", color:"#f4fbff", fontFamily:"Inter,system-ui,sans-serif" },
  profile: { position:"absolute", top:"max(10px,env(safe-area-inset-top))", left:10, right:10, minHeight:58, padding:"8px 10px", borderRadius:19, display:"grid", gridTemplateColumns:"40px 1fr 44px", alignItems:"center", gap:10, color:"white", textAlign:"left", pointerEvents:"auto", cursor:"pointer", ...glass },
  avatar: { width:40, height:40, borderRadius:13, display:"grid", placeItems:"center", background:"linear-gradient(135deg,#0891b2,#7c3aed,#ec4899)", fontSize:11, fontWeight:950, boxShadow:"0 0 22px rgba(34,211,238,.22)" },
  identity: { minWidth:0, display:"grid", gap:2 },
  xpTrack: { height:3, marginTop:3, borderRadius:99, overflow:"hidden", background:"rgba(255,255,255,.09)" },
  xpFill: { display:"block", height:"100%", borderRadius:99, background:"linear-gradient(90deg,#22d3ee,#8b5cf6,#ec4899)" },
  generation: { width:40, height:40, borderRadius:13, display:"grid", placeItems:"center", background:"rgba(34,211,238,.08)", border:"1px solid rgba(103,232,249,.22)", fontWeight:900 },
  hint: { position:"absolute", top:"calc(max(10px,env(safe-area-inset-top)) + 72px)", left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center", gap:7, padding:"7px 10px", borderRadius:999, whiteSpace:"nowrap", fontSize:10, color:"rgba(225,242,255,.72)", pointerEvents:"none", ...glass },
  hintDot: { width:6, height:6, borderRadius:"50%", background:"#67e8f9", boxShadow:"0 0 12px #22d3ee", animation:"hudPulse 1.6s infinite" },
  bottomRow: { position:"absolute", left:10, right:10, bottom:"max(12px,env(safe-area-inset-bottom))", display:"grid", gridTemplateColumns:"1fr 112px", gap:8, pointerEvents:"auto" },
  mission: { minHeight:48, padding:"8px 11px", borderRadius:16, color:"white", textAlign:"left", display:"grid", gridTemplateColumns:"1fr auto", border:"1px solid rgba(103,232,249,.18)", background:"linear-gradient(135deg,rgba(6,78,99,.8),rgba(49,46,129,.7))", cursor:"pointer" },
  arena: { minHeight:48, padding:"8px 12px", borderRadius:16, border:"1px solid rgba(251,113,133,.28)", color:"white", display:"grid", alignContent:"center", textAlign:"left", background:"linear-gradient(135deg,#be123c,#7c3aed 58%,#0369a1)", cursor:"pointer", animation:"arenaPulse 2.2s infinite" },
};


-

2.3.3) components/station/StationThreeView.jsx
таким образом расположение целиком:
ungatus-lab-miniapp/components/station/StationThreeView.jsx

Содержимое документа: 

"use client";

import { useEffect, useRef } from "react";
import {
  HOME_VIEW,
  MODULE_FOCUS,
  SCENE_CONFIG,
  SPACE_OBJECTS,
  STATION_MODEL_URL,
} from "./stationConfig";
import {
  createStationBuildings,
  pulseStationBuilding,
} from "./stationBuildings";

export default function StationThreeView({
  onSelectModule,
  onCameraStateChange,
  returnHomeSignal = 0,
}) {
  const hostRef = useRef(null);
  const selectRef = useRef(onSelectModule);
  const stateRef = useRef(onCameraStateChange);
  const returnRef = useRef(returnHomeSignal);

  useEffect(() => { selectRef.current = onSelectModule; }, [onSelectModule]);
  useEffect(() => { stateRef.current = onCameraStateChange; }, [onCameraStateChange]);
  useEffect(() => { returnRef.current = returnHomeSignal; }, [returnHomeSignal]);

  useEffect(() => {
    let disposed = false;
    let renderer;
    let frameId;
    let resizeObserver;
    const cleanups = [];

    (async () => {
      const THREE = await import(
        /* webpackIgnore: true */ "https://esm.sh/three@0.167.1"
      );
      const { GLTFLoader } = await import(
        /* webpackIgnore: true */ "https://esm.sh/three@0.167.1/examples/jsm/loaders/GLTFLoader.js"
      );
      if (disposed || !hostRef.current) return;

      const host = hostRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        HOME_VIEW.fov,
        1,
        SCENE_CONFIG.cameraNear,
        SCENE_CONFIG.cameraFar
      );
      camera.up.set(0, 1, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x010207, 0.12);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      Object.assign(renderer.domElement.style, {
        width: "100%",
        height: "100%",
        display: "block",
        touchAction: "manipulation",
      });
      host.appendChild(renderer.domElement);

      function createStarLayer(count, spread, size, color, opacity) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i += 1) {
          const r = spread * (0.55 + Math.random() * 0.45);
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.cos(phi);
          positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        return new THREE.Points(
          geometry,
          new THREE.PointsMaterial({
            color, size, transparent: true, opacity,
            sizeAttenuation: true, depthWrite: false,
          })
        );
      }

      const farStars = createStarLayer(850, 175, 0.28, 0xb8d7ff, 0.7);
      const nearStars = createStarLayer(220, 105, 0.46, 0xffffff, 0.86);
      scene.add(farStars, nearStars);

      const sunRoot = new THREE.Group();
      const sunCore = new THREE.Mesh(
        new THREE.SphereGeometry(15, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0xffcf78 })
      );
      const sunHalo = new THREE.Mesh(
        new THREE.SphereGeometry(22, 40, 28),
        new THREE.MeshBasicMaterial({
          color: 0xff8a35, transparent: true, opacity: 0.065,
          depthWrite: false, side: THREE.BackSide,
        })
      );
      const sunCorona = new THREE.Mesh(
        new THREE.SphereGeometry(30, 36, 24),
        new THREE.MeshBasicMaterial({
          color: 0xff5d57, transparent: true, opacity: 0.018,
          depthWrite: false, side: THREE.BackSide,
        })
      );
      sunRoot.add(sunCore, sunHalo, sunCorona);
      scene.add(sunRoot);

      const sunLight = new THREE.DirectionalLight(0xffc47f, 1.0);
      scene.add(sunLight);
      scene.add(new THREE.HemisphereLight(0xb9ddff, 0x172332, 1.35));
      scene.add(new THREE.AmbientLight(0x6f8193, 0.24));
      const keyLight = new THREE.DirectionalLight(0xd5ebff, 1.35);
      keyLight.position.set(8, 18, 16);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x4aa8ff, 0.7);
      rimLight.position.set(-14, 7, -10);
      scene.add(rimLight);

      let stationCenter = null;
      let diskRadius = 1;
      let buildings = null;
      let homePosition = null;
      let homeQuaternion = null;
      let cameraMotion = null;
      let cameraState = "home";
      let focusedId = null;
      let handledReturn = returnRef.current;
      const parentWorldQuaternion = new THREE.Quaternion();
      const inverseParentQuaternion = new THREE.Quaternion();

      const reportState = (value) => {
        cameraState = value;
        stateRef.current?.(value);
      };
      const ease = (t) => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const shortestAngle = (value) => {
        let angle = value;
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
      };

      const beginMove = (endPosition, endQuaternion, id, returning = false) => {
        if (!stationCenter) return;
        const startOffset = camera.position.clone().sub(stationCenter);
        const endOffset = endPosition.clone().sub(stationCenter);
        const startAngle = Math.atan2(startOffset.z, startOffset.x);
        const endAngle = Math.atan2(endOffset.z, endOffset.x);
        cameraMotion = {
          startedAt: performance.now(),
          startQuaternion: camera.quaternion.clone(),
          endQuaternion: endQuaternion.clone(),
          endPosition: endPosition.clone(),
          startRadius: Math.hypot(startOffset.x, startOffset.z),
          endRadius: Math.hypot(endOffset.x, endOffset.z),
          startHeight: startOffset.y,
          endHeight: endOffset.y,
          startAngle,
          angleDelta: shortestAngle(endAngle - startAngle),
          id,
          returning,
        };
        reportState(returning ? "returning" : "moving");
      };

      const returnHome = () => {
        if (!homePosition || !homeQuaternion) return;
        beginMove(homePosition, homeQuaternion, null, true);
      };

      new GLTFLoader().load(
        STATION_MODEL_URL,
        (gltf) => {
          if (disposed) return;
          const station = gltf.scene;
          station.rotation.x = -Math.PI / 2;
          scene.add(station);
          station.updateMatrixWorld(true);

          const bounds = new THREE.Box3().setFromObject(station);
          stationCenter = bounds.getCenter(new THREE.Vector3());
          const sphere = bounds.getBoundingSphere(new THREE.Sphere());
          const radius = sphere.radius;

          station.traverse((object) => {
            if (!object.isMesh || !object.material) return;
            const originals = Array.isArray(object.material)
              ? object.material : [object.material];
            const tinted = originals.map((source) => {
              const material = source.clone();
              const sourceColor = material.color?.clone?.() || new THREE.Color(0x8b98a6);
              const luminance = sourceColor.r * 0.2126 + sourceColor.g * 0.7152 + sourceColor.b * 0.0722;
              const targetColor = luminance > 0.58
                ? new THREE.Color(0x506275) : new THREE.Color(0x172535);
              material.color = sourceColor.lerp(targetColor, 0.68);
              if ("metalness" in material) material.metalness = Math.max(material.metalness || 0, 0.58);
              if ("roughness" in material) material.roughness = 0.34;
              if ("emissive" in material) {
                material.emissive = new THREE.Color(luminance > 0.7 ? 0x071725 : 0x02070d);
                material.emissiveIntensity = luminance > 0.7 ? 0.1 : 0.025;
              }
              material.needsUpdate = true;
              return material;
            });
            object.material = Array.isArray(object.material) ? tinted : tinted[0];
          });

          const direction = new THREE.Vector3(
            HOME_VIEW.direction.x,
            HOME_VIEW.direction.y,
            HOME_VIEW.direction.z
          ).normalize();
          const target = stationCenter.clone().add(
            new THREE.Vector3(0, radius * HOME_VIEW.targetHeight, 0)
          );
          camera.position.copy(target).addScaledVector(direction, radius * HOME_VIEW.distance);
          camera.lookAt(target);
          camera.near = Math.max(0.05, radius * 0.01);
          camera.far = radius * 20;
          camera.updateProjectionMatrix();
          homePosition = camera.position.clone();
          homeQuaternion = camera.quaternion.clone();

          const forward = target.clone().sub(camera.position).normalize();
          const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
          const up = new THREE.Vector3().crossVectors(right, forward).normalize();
          sunRoot.position.copy(camera.position)
            .addScaledVector(forward, radius * SPACE_OBJECTS.sun.distance)
            .addScaledVector(right, radius * SPACE_OBJECTS.sun.sideOffset)
            .addScaledVector(up, radius * SPACE_OBJECTS.sun.heightOffset);
          sunRoot.scale.setScalar((radius * SPACE_OBJECTS.sun.radius) / 15);
          sunLight.position.copy(sunRoot.position);
          sunLight.target.position.copy(stationCenter);
          scene.add(sunLight.target);

          const sunSideFill = new THREE.DirectionalLight(0xffc892, 0.48);
          sunSideFill.position.copy(stationCenter)
            .addScaledVector(right, -radius * 3.0)
            .addScaledVector(up, radius * 1.8)
            .addScaledVector(forward, -radius * 0.8);
          sunSideFill.target.position.copy(stationCenter);
          scene.add(sunSideFill, sunSideFill.target);

          buildings = createStationBuildings({
            THREE, station, bounds, center: stationCenter,
          });
          diskRadius = buildings.diskRadius;
          scene.add(buildings.root);

          const focusModule = (moduleId) => {
            const group = buildings.moduleGroups.get(moduleId);
            if (!group || cameraMotion) return;
            group.updateWorldMatrix(true, false);
            const sectorCenter = group.getWorldPosition(new THREE.Vector3());
            const outward = sectorCenter.clone().sub(stationCenter);
            outward.y = 0;
            outward.normalize();

            // Camera sits outside the selected clock position and looks through it at Core.
            const endPosition = stationCenter.clone()
              .addScaledVector(outward, diskRadius * 1.42)
              .addScaledVector(camera.up, diskRadius * 0.46);
            const lookTarget = stationCenter.clone()
              .addScaledVector(camera.up, diskRadius * 0.12);
            const lookCamera = camera.clone();
            lookCamera.position.copy(endPosition);
            lookCamera.up.copy(camera.up);
            lookCamera.lookAt(lookTarget);
            beginMove(endPosition, lookCamera.quaternion, moduleId, false);
          };

          const raycaster = new THREE.Raycaster();
          const pointer = new THREE.Vector2();
          let pointerDown = null;
          const onPointerDown = (event) => {
            pointerDown = { x: event.clientX, y: event.clientY };
          };
          const onPointerUp = (event) => {
            if (!pointerDown) return;
            const moved = Math.hypot(
              event.clientX - pointerDown.x,
              event.clientY - pointerDown.y
            );
            pointerDown = null;
            if (moved > SCENE_CONFIG.tapThresholdPx || cameraMotion) return;
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.set(
              ((event.clientX - rect.left) / rect.width) * 2 - 1,
              -((event.clientY - rect.top) / rect.height) * 2 + 1
            );
            raycaster.setFromCamera(pointer, camera);
            const hit = raycaster
              .intersectObjects(buildings.hologramClickables || [], true)
              .find((result) => result.object.userData.moduleId);
            if (!hit) return;
            const moduleId = hit.object.userData.moduleId;
            pulseStationBuilding(buildings.moduleGroups, moduleId);
            if (cameraState === "focused" && focusedId === moduleId) {
              selectRef.current?.(moduleId);
              reportState("panel");
            } else {
              focusModule(moduleId);
            }
          };
          const onPointerCancel = () => { pointerDown = null; };
          renderer.domElement.addEventListener("pointerdown", onPointerDown);
          renderer.domElement.addEventListener("pointerup", onPointerUp);
          renderer.domElement.addEventListener("pointercancel", onPointerCancel);
          cleanups.push(() => {
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            renderer.domElement.removeEventListener("pointerup", onPointerUp);
            renderer.domElement.removeEventListener("pointercancel", onPointerCancel);
          });
        },
        undefined,
        (error) => console.error("Station GLB load failed", error)
      );

      const resize = () => {
        if (!host.isConnected) return;
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      const render = () => {
        const now = performance.now();
        farStars.rotation.y += 0.000015;
        nearStars.rotation.y += 0.00003;
        sunHalo.scale.setScalar(1 + Math.sin(now * 0.0014) * 0.025);

        if (buildings?.hologramBillboards) {
          buildings.hologramBillboards.forEach((billboard) => {
            billboard.parent.getWorldQuaternion(parentWorldQuaternion);
            inverseParentQuaternion.copy(parentWorldQuaternion).invert();
            billboard.quaternion.copy(inverseParentQuaternion).multiply(camera.quaternion);
            billboard.position.y =
              billboard.userData.baseY +
              Math.sin(now * 0.0017 + billboard.userData.phase) * diskRadius * 0.004;
          });
        }

        if (returnRef.current !== handledReturn) {
          handledReturn = returnRef.current;
          returnHome();
        }

        if (cameraMotion && stationCenter) {
          const raw = Math.min(1, (now - cameraMotion.startedAt) / MODULE_FOCUS.durationMs);
          const t = ease(raw);
          const angle = cameraMotion.startAngle + cameraMotion.angleDelta * t;
          const orbitRadius = THREE.MathUtils.lerp(cameraMotion.startRadius, cameraMotion.endRadius, t);
          const height = THREE.MathUtils.lerp(cameraMotion.startHeight, cameraMotion.endHeight, t)
            + Math.sin(Math.PI * t) * diskRadius * 0.12;
          camera.position.set(
            stationCenter.x + Math.cos(angle) * orbitRadius,
            stationCenter.y + height,
            stationCenter.z + Math.sin(angle) * orbitRadius
          );
          camera.quaternion.slerpQuaternions(
            cameraMotion.startQuaternion,
            cameraMotion.endQuaternion,
            t
          );
          if (raw >= 1) {
            camera.position.copy(cameraMotion.endPosition);
            camera.quaternion.copy(cameraMotion.endQuaternion);
            focusedId = cameraMotion.id;
            const completedId = cameraMotion.id;
            const returning = cameraMotion.returning;
            cameraMotion = null;

            if (returning) {
              focusedId = null;
              reportState("home");
            } else {
              // The first tap is now a complete action: fly to the selected
              // sector and open its existing React panel automatically.
              reportState("panel");
              selectRef.current?.(completedId);
            }
          }
        }

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
      };
      render();

      cleanups.push(() => {
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          const materials = object.material
            ? Array.isArray(object.material) ? object.material : [object.material]
            : [];
          materials.forEach((material) => material.dispose?.());
        });
      });
    })();

    return () => {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      renderer?.dispose();
      if (hostRef.current) hostRef.current.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      style={styles.stationModel}
      aria-label="Интерактивная 3D-сцена орбитальной станции"
    />
  );
}

const styles = {
  stationModel: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at 14% 34%,rgba(63,29,93,.28),transparent 27%), radial-gradient(circle at 78% 42%,rgba(8,62,96,.24),transparent 37%), linear-gradient(180deg,#020611 0%,#010207 74%)",
    touchAction: "manipulation",
  },
};


-

2.3.4) components/station/stationBuildings.js
таким образом расположение целиком:
ungatus-lab-miniapp/components/station/stationBuildings.js

Содержимое документа: 

import { MODULE_ANCHORS, MODULE_BY_ID, SCENE_CONFIG } from "./stationConfig";

// The original procedural complexes were technically present but too small to read
// from the fixed home camera. 2.75 makes each complex fill most of its authored pad.
// Full platform cap: the base intentionally covers the authored white circular pad.
const COMPLEX_VISUAL_SCALE = 4.35;
// Upper architecture grows with the full cap while retaining a small edge margin.
const COMPLEX_FEATURE_SCALE = 1.02;
const HOLOGRAM_UI_BLUE = 0x58d7ff;
const WALLET_UI_BLUE = HOLOGRAM_UI_BLUE;

function bodyMaterial(THREE) {
  return new THREE.MeshStandardMaterial({
    color: 0x40566b,
    metalness: 0.88,
    roughness: 0.3,
    emissive: 0x07121d,
    emissiveIntensity: 0.13,
  });
}

function darkMaterial(THREE) {
  return new THREE.MeshStandardMaterial({
    color: 0x1b2b3b,
    metalness: 0.9,
    roughness: 0.34,
    emissive: 0x03090f,
    emissiveIntensity: 0.09,
  });
}

function glowMaterial(THREE, color, opacity = 0.76) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function invisibleMaterial(THREE) {
  return new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
}

function mesh(THREE, group, geometry, material, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = false;
  object.receiveShadow = false;
  group.add(object);
  return object;
}

function addBase(THREE, group, radius, color) {
  const body = bodyMaterial(THREE);
  const dark = darkMaterial(THREE);
  const glow = glowMaterial(THREE, color, 0.72);
  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a3e52,
    metalness: 0.88,
    roughness: 0.3,
    emissive: 0x06111b,
    emissiveIntensity: 0.11,
  });

  // Lower skirt wraps the original socket edge.
  mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 1.13, radius * 1.17, radius * 0.2, 36),
    dark,
    [0, radius * 0.015, 0]
  );

  // Opaque lid is fully above the raycast surface, so the white GLB pad cannot
  // draw over it on the left or right side.
  mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 1.1, radius * 1.13, radius * 0.13, 36),
    capMaterial,
    [0, radius * 0.14, 0]
  );

  // Dark inset visually joins the upper architecture to the large cap.
  mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.78, radius * 0.91, radius * 0.13, 32),
    body,
    [0, radius * 0.24, 0]
  );

  const ring = mesh(
    THREE,
    group,
    new THREE.TorusGeometry(radius * 0.94, radius * 0.045, 9, 48),
    glow,
    [0, radius * 0.215, 0]
  );
  ring.rotation.x = Math.PI / 2;

  return { body, dark, glow, capMaterial };
}

function accentMaterial(THREE, color, intensity = 0.72) {
  return new THREE.MeshStandardMaterial({
    color: 0x172738,
    metalness: 0.84,
    roughness: 0.26,
    emissive: color,
    emissiveIntensity: intensity,
  });
}

function addLightStrip(THREE, group, color, width, depth, x, y, z, rotationY = 0) {
  const strip = mesh(
    THREE,
    group,
    new THREE.BoxGeometry(width, width * 0.08, depth),
    accentMaterial(THREE, color, 0.82),
    [x, y, z]
  );
  strip.rotation.y = rotationY;
  return strip;
}

function createRadialSectorGeometry(THREE, radius, options = {}) {
  const outerHalf = radius * (options.outerHalf ?? 0.78);
  const innerHalf = radius * (options.innerHalf ?? 0.48);
  const length = radius * (options.length ?? 1.62);
  const height = radius * (options.height ?? 0.18);
  const outerZ = radius * (options.outerZ ?? 0.43);
  const innerZ = outerZ - length;
  const shoulderZ = outerZ - length * 0.56;

  const shape = new THREE.Shape();
  shape.moveTo(-outerHalf * 0.82, outerZ);
  shape.quadraticCurveTo(-outerHalf, outerZ, -outerHalf, outerZ - radius * 0.16);
  shape.lineTo(-innerHalf, innerZ);
  shape.quadraticCurveTo(-innerHalf * 0.82, innerZ - radius * 0.08, 0, innerZ - radius * 0.08);
  shape.quadraticCurveTo(innerHalf * 0.82, innerZ - radius * 0.08, innerHalf, innerZ);
  shape.lineTo(outerHalf, outerZ - radius * 0.16);
  shape.quadraticCurveTo(outerHalf, outerZ, outerHalf * 0.82, outerZ);
  shape.lineTo(0, outerZ + radius * 0.08);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: radius * 0.035,
    bevelThickness: radius * 0.025,
    curveSegments: 8,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return { geometry, height, shoulderZ, innerZ, outerZ };
}

function addRadialHull(THREE, group, radius, materials, options = {}) {
  const { body, dark } = materials;
  const sector = createRadialSectorGeometry(THREE, radius, options);

  const lower = mesh(
    THREE,
    group,
    sector.geometry,
    dark,
    [0, radius * 0.205, 0]
  );
  lower.userData.part = "radial-sector-lower";

  const upperSector = createRadialSectorGeometry(THREE, radius, {
    ...options,
    outerHalf: (options.outerHalf ?? 0.78) * 0.86,
    innerHalf: (options.innerHalf ?? 0.48) * 0.84,
    length: (options.length ?? 1.62) * 0.88,
    height: (options.height ?? 0.18) * 0.56,
    outerZ: (options.outerZ ?? 0.43) - 0.08,
  });
  const upper = mesh(
    THREE,
    group,
    upperSector.geometry,
    body,
    [0, radius * 0.205 + sector.height, 0]
  );
  upper.userData.part = "radial-sector-upper";

  return {
    lower,
    upper,
    shoulderZ: sector.shoulderZ,
    innerZ: sector.innerZ,
    outerZ: sector.outerZ,
  };
}

const GLYPH_Y = 0.735;

function addGlyphBar(THREE, group, color, radius, width, depth, x, z, rotationY = 0) {
  const bar = mesh(
    THREE,
    group,
    new THREE.BoxGeometry(radius * width, radius * 0.065, radius * depth),
    glowMaterial(THREE, color, 0.96),
    [radius * x, radius * GLYPH_Y, radius * z]
  );
  bar.rotation.y = rotationY;
  bar.userData.glyphPart = true;
  return bar;
}

function addGlyphNode(THREE, group, color, radius, x, z, scale = 1) {
  const node = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(
      radius * 0.115 * scale,
      radius * 0.115 * scale,
      radius * 0.07,
      20
    ),
    glowMaterial(THREE, color, 0.98),
    [radius * x, radius * (GLYPH_Y + 0.005), radius * z]
  );
  node.userData.glyphPart = true;
  return node;
}

function addGlyphFrame(THREE, group, color, radius, x, z, width, height) {
  addGlyphBar(THREE, group, color, radius, width, 0.065, x, z - height / 2);
  addGlyphBar(THREE, group, color, radius, width, 0.065, x, z + height / 2);
  addGlyphBar(THREE, group, color, radius, 0.065, height, x - width / 2, z);
  addGlyphBar(THREE, group, color, radius, 0.065, height, x + width / 2, z);
}

function addArrowGlyph(THREE, group, color, radius, z, direction = 1) {
  addGlyphBar(THREE, group, color, radius, 0.54, 0.075, 0, z);
  addGlyphBar(
    THREE,
    group,
    color,
    radius,
    0.22,
    0.075,
    direction * 0.25,
    z - 0.1,
    direction * 0.7
  );
  addGlyphBar(
    THREE,
    group,
    color,
    radius,
    0.22,
    0.075,
    direction * 0.25,
    z + 0.1,
    -direction * 0.7
  );
}

function addFlowNodeGlyph(THREE, group, radius) {
  const color = 0x53f5df;
  addGlyphNode(THREE, group, color, radius, 0, -0.48, 1.08);
  addGlyphNode(THREE, group, color, radius, -0.34, -0.05, 0.78);
  addGlyphNode(THREE, group, color, radius, 0.34, -0.05, 0.78);
  addGlyphBar(THREE, group, color, radius, 0.09, 0.49, -0.17, -0.27, -0.67);
  addGlyphBar(THREE, group, color, radius, 0.09, 0.49, 0.17, -0.27, 0.67);
}

function addScenarioFramesGlyph(THREE, group, radius) {
  const color = 0xff8bc8;
  addGlyphFrame(THREE, group, color, radius, 0, -0.28, 0.78, 0.62);
  addGlyphBar(THREE, group, color, radius, 0.065, 0.52, -0.24, -0.28);
  addGlyphBar(THREE, group, color, radius, 0.065, 0.52, 0, -0.28);
  addGlyphBar(THREE, group, color, radius, 0.065, 0.52, 0.24, -0.28);
}

function addLinkedCoresGlyph(THREE, group, radius) {
  const color = 0xb99cff;
  addGlyphNode(THREE, group, color, radius, -0.31, -0.27, 1.08);
  addGlyphNode(THREE, group, color, radius, 0.31, -0.27, 1.08);
  addGlyphBar(THREE, group, color, radius, 0.46, 0.09, 0, -0.27);
  addGlyphBar(THREE, group, color, radius, 0.56, 0.07, 0, -0.53);
}

function addWalletGlyph(THREE, group, radius) {
  const color = WALLET_UI_BLUE;
  const y = radius * 0.742;
  const glow = glowMaterial(THREE, color, 0.98);

  // Wallet body: a wide rounded outline, rotated with the module so it faces
  // the home observer correctly on the near-left platform.
  const bodyShape = new THREE.Shape();
  const w = radius * 0.9;
  const h = radius * 0.64;
  const r = radius * 0.13;
  bodyShape.moveTo(-w / 2 + r, -h / 2);
  bodyShape.lineTo(w / 2 - r, -h / 2);
  bodyShape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  bodyShape.lineTo(w / 2, h / 2 - r);
  bodyShape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  bodyShape.lineTo(-w / 2 + r, h / 2);
  bodyShape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  bodyShape.lineTo(-w / 2, -h / 2 + r);
  bodyShape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  bodyShape.closePath();

  const hole = new THREE.Path();
  const inset = radius * 0.1;
  hole.moveTo(-w / 2 + r + inset, -h / 2 + inset);
  hole.lineTo(w / 2 - r - inset, -h / 2 + inset);
  hole.quadraticCurveTo(w / 2 - inset, -h / 2 + inset, w / 2 - inset, -h / 2 + r + inset);
  hole.lineTo(w / 2 - inset, h / 2 - r - inset);
  hole.quadraticCurveTo(w / 2 - inset, h / 2 - inset, w / 2 - r - inset, h / 2 - inset);
  hole.lineTo(-w / 2 + r + inset, h / 2 - inset);
  hole.quadraticCurveTo(-w / 2 + inset, h / 2 - inset, -w / 2 + inset, h / 2 - r - inset);
  hole.lineTo(-w / 2 + inset, -h / 2 + r + inset);
  hole.quadraticCurveTo(-w / 2 + inset, -h / 2 + inset, -w / 2 + r + inset, -h / 2 + inset);
  hole.closePath();
  bodyShape.holes.push(hole);

  const body = mesh(
    THREE,
    group,
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: radius * 0.055,
      bevelEnabled: false,
      curveSegments: 10,
    }),
    glow,
    [0, y, -radius * 0.3]
  );
  body.rotation.x = -Math.PI / 2;
  body.userData.glyphPart = true;

  // Top opening/card lip makes the silhouette read as a wallet rather than a card.
  addGlyphBar(THREE, group, color, radius, 0.64, 0.075, -0.07, -0.02, -0.13);

  // Clasp tab and coin/button on the observer-facing right side of the icon.
  addGlyphBar(THREE, group, color, radius, 0.34, 0.17, 0.3, -0.3);
  addGlyphNode(THREE, group, color, radius, 0.37, -0.3, 0.66);
}


function holoMaterial(THREE, color, opacity = 0.82) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

function holoFillMaterial(THREE, color, opacity = 0.18) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function holoColorMaterial(THREE, color, opacity = 0.78) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
}

function holoLine(THREE, group, material, radius, width, height, x, y, rotationZ = 0, z = 0.02) {
  const part = mesh(
    THREE,
    group,
    new THREE.BoxGeometry(radius * width, radius * height, radius * 0.035),
    material,
    [radius * x, radius * y, radius * z]
  );
  part.rotation.z = rotationZ;
  part.userData.hologramVisual = true;
  return part;
}

function holoDisc(THREE, group, material, radius, x, y, scale = 1, z = 0.025) {
  const disc = mesh(
    THREE,
    group,
    new THREE.CircleGeometry(radius * 0.1 * scale, 28),
    material,
    [radius * x, radius * y, radius * z]
  );
  disc.userData.hologramVisual = true;
  return disc;
}

function holoTriangle(THREE, group, material, radius, x, y, scale = 1, rotationZ = 0) {
  const shape = new THREE.Shape();
  const size = radius * 0.18 * scale;
  shape.moveTo(size * 0.72, 0);
  shape.lineTo(-size * 0.55, size * 0.62);
  shape.lineTo(-size * 0.55, -size * 0.62);
  shape.closePath();
  const tri = mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(shape),
    material,
    [radius * x, radius * y, radius * 0.03]
  );
  tri.rotation.z = rotationZ;
  tri.userData.hologramVisual = true;
  return tri;
}

function createTokenShape(THREE, radius, scale = 1) {
  const shape = new THREE.Shape();
  const w = radius * 0.95 * scale;
  const h = radius * 0.78 * scale;
  const cut = w * 0.18;
  shape.moveTo(-w / 2 + cut, h / 2);
  shape.lineTo(w / 2 - cut, h / 2);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2 - cut, -h / 2);
  shape.lineTo(-w / 2 + cut, -h / 2);
  shape.lineTo(-w / 2, 0);
  shape.closePath();
  return shape;
}

function addHoloToken(THREE, group, color, radius) {
  const back = mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(createTokenShape(THREE, radius, 1.05)),
    holoFillMaterial(THREE, color, 0.16),
    [0, 0, 0]
  );
  back.userData.hologramVisual = true;

  const line = holoMaterial(THREE, color, 0.9);
  holoLine(THREE, group, line, radius, 0.58, 0.035, 0, 0.42);
  holoLine(THREE, group, line, radius, 0.58, 0.035, 0, -0.42);
  holoLine(THREE, group, line, radius, 0.035, 0.34, -0.48, 0.17, -0.45);
  holoLine(THREE, group, line, radius, 0.035, 0.34, -0.48, -0.17, 0.45);
  holoLine(THREE, group, line, radius, 0.035, 0.34, 0.48, 0.17, 0.45);
  holoLine(THREE, group, line, radius, 0.035, 0.34, 0.48, -0.17, -0.45);
}

function createRoundedRectShape(THREE, width, height, corner) {
  const shape = new THREE.Shape();
  const left = -width / 2;
  const right = width / 2;
  const top = height / 2;
  const bottom = -height / 2;
  shape.moveTo(left + corner, top);
  shape.lineTo(right - corner, top);
  shape.quadraticCurveTo(right, top, right, top - corner);
  shape.lineTo(right, bottom + corner);
  shape.quadraticCurveTo(right, bottom, right - corner, bottom);
  shape.lineTo(left + corner, bottom);
  shape.quadraticCurveTo(left, bottom, left, bottom + corner);
  shape.lineTo(left, top - corner);
  shape.quadraticCurveTo(left, top, left + corner, top);
  shape.closePath();
  return shape;
}

function createRoundedRectRingShape(THREE, width, height, corner, thickness) {
  const outer = createRoundedRectShape(THREE, width, height, corner);
  const innerWidth = width - thickness * 2;
  const innerHeight = height - thickness * 2;
  const innerCorner = Math.max(corner - thickness, thickness * 0.45);
  const inner = createRoundedRectShape(THREE, innerWidth, innerHeight, innerCorner);
  outer.holes.push(inner);
  return outer;
}

function addModernTerminalShell(THREE, group, radius) {
  const uiBlue = HOLOGRAM_UI_BLUE;
  const uiBlueSoft = 0x2c94c7;
  const darkCore = 0x06121f;

  const aura = mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.94, radius * 1.02, radius * 0.23)
    ),
    holoFillMaterial(THREE, uiBlueSoft, 0.12),
    [0, 0, -radius * 0.05]
  );
  aura.scale.setScalar(1.12);

  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.82, radius * 0.92, radius * 0.2)
    ),
    holoFillMaterial(THREE, darkCore, 0.88),
    [0, 0, 0]
  );

  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectRingShape(
        THREE,
        radius * 0.86,
        radius * 0.96,
        radius * 0.21,
        radius * 0.045
      )
    ),
    holoColorMaterial(THREE, uiBlue, 0.8),
    [0, 0, radius * 0.018]
  );

  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectRingShape(
        THREE,
        radius * 0.72,
        radius * 0.8,
        radius * 0.16,
        radius * 0.018
      )
    ),
    holoColorMaterial(THREE, uiBlueSoft, 0.42),
    [0, 0, radius * 0.028]
  );

  holoDisc(
    THREE,
    group,
    holoColorMaterial(THREE, uiBlueSoft, 0.72),
    radius,
    0,
    -0.37,
    0.28,
    0.045
  );
}

function createGearShape(THREE, outerRadius, innerRadius, teeth = 10) {
  const shape = new THREE.Shape();
  for (let i = 0; i < teeth * 2; i += 1) {
    const angle = (i / (teeth * 2)) * Math.PI * 2;
    const size = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * size;
    const y = Math.sin(angle) * size;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, outerRadius * 0.36, 0, Math.PI * 2, false);
  shape.holes.push(hole);
  return shape;
}

function addPersonSilhouette(THREE, group, material, radius, x, y, scale = 1) {
  holoDisc(THREE, group, material, radius, x, y + 0.115 * scale, 0.72 * scale, 0.07);
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(
        THREE,
        radius * 0.23 * scale,
        radius * 0.19 * scale,
        radius * 0.09 * scale
      )
    ),
    material,
    [radius * x, radius * (y - 0.06 * scale), radius * 0.06]
  );
}

function addMarketplaceTerminal(THREE, group, radius) {
  addModernTerminalShell(THREE, group, radius);
  const blue = holoColorMaterial(THREE, HOLOGRAM_UI_BLUE, 0.96);
  const dark = holoFillMaterial(THREE, 0x06121f, 0.96);

  // Marketplace: shopping bag containing a compact 2x2 catalog grid.
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.58, radius * 0.48, radius * 0.075)
    ),
    blue,
    [0, -radius * 0.055, radius * 0.055]
  );
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.48, radius * 0.38, radius * 0.05)
    ),
    dark,
    [0, -radius * 0.055, radius * 0.075]
  );

  // Two short handles clearly separate Marketplace from the Wallet symbol.
  holoLine(THREE, group, blue, radius, 0.055, 0.22, -0.15, 0.23, -0.35, 0.08);
  holoLine(THREE, group, blue, radius, 0.055, 0.22, 0.15, 0.23, 0.35, 0.08);
  holoLine(THREE, group, blue, radius, 0.28, 0.05, 0, 0.31, 0, 0.08);

  // Catalog tiles.
  [-0.12, 0.12].forEach((x) => {
    [-0.14, 0.08].forEach((y) => {
      mesh(
        THREE,
        group,
        new THREE.ShapeGeometry(
          createRoundedRectShape(THREE, radius * 0.16, radius * 0.14, radius * 0.025)
        ),
        blue,
        [radius * x, radius * y, radius * 0.09]
      );
    });
  });

  // Small offer/transaction marker.
  holoDisc(THREE, group, blue, radius, 0.31, -0.22, 0.38, 0.105);
}

function addCollaborationTerminal(THREE, group, radius) {
  addModernTerminalShell(THREE, group, radius);
  const blue = holoColorMaterial(THREE, HOLOGRAM_UI_BLUE, 0.96);
  // Conventional group icon with one central and two supporting participants.
  addPersonSilhouette(THREE, group, blue, radius, 0, 0.025, 1.18);
  addPersonSilhouette(THREE, group, blue, radius, -0.25, -0.04, 0.9);
  addPersonSilhouette(THREE, group, blue, radius, 0.25, -0.04, 0.9);
  holoLine(THREE, group, blue, radius, 0.64, 0.055, 0, -0.28, 0, 0.055);
}

function addAutomationTerminal(THREE, group, radius) {
  addModernTerminalShell(THREE, group, radius);
  const blue = holoColorMaterial(THREE, HOLOGRAM_UI_BLUE, 0.96);
  const dark = holoFillMaterial(THREE, 0x06121f, 0.98);

  // Robot Macro Core: one robot face remains the dominant silhouette.
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.48, radius * 0.42, radius * 0.11)
    ),
    blue,
    [-radius * 0.06, radius * 0.015, radius * 0.055]
  );
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.39, radius * 0.32, radius * 0.075)
    ),
    dark,
    [-radius * 0.06, radius * 0.015, radius * 0.075]
  );

  // Antenna and eyes.
  holoLine(THREE, group, blue, radius, 0.04, 0.17, -0.06, 0.29, 0, 0.085);
  holoDisc(THREE, group, blue, radius, -0.06, 0.37, 0.3, 0.09);
  holoDisc(THREE, group, blue, radius, -0.18, 0.09, 0.31, 0.09);
  holoDisc(THREE, group, blue, radius, 0.06, 0.09, 0.31, 0.09);

  // Play is embedded in the robot face.
  holoTriangle(THREE, group, blue, radius, -0.045, -0.105, 0.55, 0);

  // Half-gear hugs the right side rather than becoming a separate icon.
  [-1.05, -0.7, -0.35, 0, 0.35, 0.7, 1.05].forEach((angle) => {
    const x = 0.19 + Math.cos(angle) * 0.24;
    const y = 0.015 + Math.sin(angle) * 0.24;
    holoLine(THREE, group, blue, radius, 0.115, 0.045, x, y, angle, 0.083);
  });

  // Short mind-map branch with two scene nodes.
  holoLine(THREE, group, blue, radius, 0.2, 0.035, 0.17, -0.19, -0.45, 0.085);
  holoLine(THREE, group, blue, radius, 0.14, 0.035, 0.29, -0.27, 0.7, 0.085);
  holoDisc(THREE, group, blue, radius, 0.37, -0.33, 0.28, 0.09);
}

function addWalletTerminal(THREE, group, color, radius) {
  const uiBlue = HOLOGRAM_UI_BLUE;
  const darkCore = 0x06121f;
  addModernTerminalShell(THREE, group, radius);

  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.58, radius * 0.4, radius * 0.09)
    ),
    holoColorMaterial(THREE, uiBlue, 0.94),
    [-radius * 0.035, -radius * 0.025, radius * 0.05]
  );

  const fold = new THREE.Shape();
  fold.moveTo(-radius * 0.24, radius * 0.07);
  fold.lineTo(radius * 0.1, radius * 0.17);
  fold.lineTo(radius * 0.23, radius * 0.07);
  fold.closePath();
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(fold),
    holoFillMaterial(THREE, darkCore, 0.78),
    [0, radius * 0.055, radius * 0.065]
  );

  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.3, radius * 0.17, radius * 0.055)
    ),
    holoFillMaterial(THREE, darkCore, 0.94),
    [radius * 0.25, -radius * 0.025, radius * 0.075]
  );
  holoDisc(
    THREE,
    group,
    holoColorMaterial(THREE, uiBlue, 1),
    radius,
    0.29,
    -0.025,
    0.4,
    0.09
  );
}

function addWalletHolo(THREE, group, material, radius) {
  // Readable wallet: body, flap, side clasp dot.
  holoLine(THREE, group, material, radius, 0.68, 0.07, -0.04, -0.2);
  holoLine(THREE, group, material, radius, 0.68, 0.07, -0.04, 0.2);
  holoLine(THREE, group, material, radius, 0.07, 0.42, -0.38, 0);
  holoLine(THREE, group, material, radius, 0.07, 0.42, 0.28, 0);
  holoLine(THREE, group, material, radius, 0.42, 0.055, -0.02, 0.06, -0.22);
  holoLine(THREE, group, material, radius, 0.22, 0.16, 0.39, 0.0);
  holoDisc(THREE, group, material, radius, 0.43, 0, 0.52);
}

function addMarketHolo(THREE, group, material, radius) {
  // Storefront: awning, posts, counter.
  holoLine(THREE, group, material, radius, 0.8, 0.06, 0, 0.25);
  [-0.3, -0.1, 0.1, 0.3].forEach((x, index) => {
    holoLine(THREE, group, material, radius, 0.18, 0.16, x, 0.14, index % 2 ? 0.12 : -0.12);
  });
  holoLine(THREE, group, material, radius, 0.62, 0.06, 0, -0.28);
  holoLine(THREE, group, material, radius, 0.06, 0.48, -0.31, -0.04);
  holoLine(THREE, group, material, radius, 0.06, 0.48, 0.31, -0.04);
  holoLine(THREE, group, material, radius, 0.22, 0.08, 0, -0.04);
}

function addCollabHolo(THREE, group, material, radius) {
  // Collab room: three participants around a shared table/project core.
  holoDisc(THREE, group, material, radius, -0.28, 0.18, 0.9);
  holoDisc(THREE, group, material, radius, 0.28, 0.18, 0.9);
  holoDisc(THREE, group, material, radius, 0, -0.28, 0.9);
  holoLine(THREE, group, material, radius, 0.22, 0.08, -0.28, -0.02, -0.12);
  holoLine(THREE, group, material, radius, 0.22, 0.08, 0.28, -0.02, 0.12);
  holoLine(THREE, group, material, radius, 0.22, 0.08, 0, -0.44);
  holoDisc(THREE, group, material, radius, 0, -0.02, 0.62);
  holoLine(THREE, group, material, radius, 0.36, 0.045, -0.14, 0.08, 0.45);
  holoLine(THREE, group, material, radius, 0.36, 0.045, 0.14, 0.08, -0.45);
  holoLine(THREE, group, material, radius, 0.28, 0.045, 0, -0.15);
}

function addAutomationHolo(THREE, group, material, radius) {
  // Project catalog + automation: project window with scenario blocks and play node.
  holoLine(THREE, group, material, radius, 0.66, 0.055, 0, 0.3);
  holoLine(THREE, group, material, radius, 0.66, 0.055, 0, -0.32);
  holoLine(THREE, group, material, radius, 0.055, 0.62, -0.33, -0.01);
  holoLine(THREE, group, material, radius, 0.055, 0.62, 0.33, -0.01);
  [-0.17, 0.04, 0.25].forEach((x, index) => {
    holoLine(THREE, group, material, radius, 0.16, 0.12, x, 0.08 - index * 0.16);
  });
  holoLine(THREE, group, material, radius, 0.24, 0.04, -0.06, 0.02, -0.55);
  holoLine(THREE, group, material, radius, 0.24, 0.04, 0.14, -0.14, -0.55);
  holoTriangle(THREE, group, material, radius, -0.2, -0.22, 0.8);
}

function addModuleHologram(THREE, group, module, radius) {
  const hologramColor = HOLOGRAM_UI_BLUE;
  const projector = new THREE.Group();
  projector.name = `HologramProjector_${module.id}`;
  projector.position.set(
    0,
    radius * 0.72,
    module.id === "market" ? -radius * 0.16 : radius * 0.02
  );
  group.add(projector);

  mesh(
    THREE,
    projector,
    new THREE.CylinderGeometry(radius * 0.13, radius * 0.2, radius * 0.08, 24),
    holoMaterial(THREE, hologramColor, 0.52),
    [0, 0, 0]
  );
  const halo = mesh(
    THREE,
    projector,
    new THREE.TorusGeometry(radius * 0.24, radius * 0.018, 8, 36),
    holoMaterial(THREE, hologramColor, 0.52),
    [0, radius * 0.055, 0]
  );
  halo.rotation.x = Math.PI / 2;
  mesh(
    THREE,
    projector,
    new THREE.CylinderGeometry(radius * 0.09, radius * 0.17, radius * 0.78, 22, 1, true),
    holoMaterial(THREE, hologramColor, 0.07),
    [0, radius * 0.44, 0]
  );

  const billboard = new THREE.Group();
  billboard.name = `HologramBillboard_${module.id}`;
  billboard.position.set(
    0,
    radius * 0.9,
    0
  );
  billboard.userData.baseY = billboard.position.y;
  billboard.userData.phase = module.id.length * 0.73;
  projector.add(billboard);

  if (module.id === "wallet") {
    addWalletTerminal(THREE, billboard, hologramColor, radius);
  } else if (module.id === "market") {
    addMarketplaceTerminal(THREE, billboard, radius);
  } else if (module.id === "collab") {
    addCollaborationTerminal(THREE, billboard, radius);
  } else if (module.id === "scanner") {
    addAutomationTerminal(THREE, billboard, radius);
  }

  const hitArea = mesh(
    THREE,
    billboard,
    new THREE.PlaneGeometry(
      radius * 1.08,
      radius * 1.16
    ),
    invisibleMaterial(THREE),
    [0, 0, radius * 0.08]
  );
  hitArea.name = `HologramButton_${module.id}`;
  hitArea.userData.moduleId = module.id;
  hitArea.userData.hologramButton = true;

  group.userData.hologramBillboard = billboard;
  group.userData.hologramClickArea = hitArea;
}

function addPlatformServiceCylinders(THREE, group, radius, platformMaterial) {
  [-0.39, 0.39].forEach((offset) => {
    const cylinder = mesh(
      THREE,
      group,
      new THREE.CapsuleGeometry(radius * 0.22, radius * 0.62, 8, 18),
      platformMaterial,
      [offset * radius, radius * 0.5, -radius * 0.31]
    );
    cylinder.rotation.z = Math.PI / 2;
    cylinder.rotation.y = Math.PI / 2;
    cylinder.userData.part = "platform-service-cylinder";
  });
}

function createStandardModulePlatform(THREE, group, radius, materials) {
  addRadialHull(THREE, group, radius, materials, {
    width: 1.6,
    length: 1.7,
    height: 0.21,
    centerOffset: 0.32,
  });
  addPlatformServiceCylinders(THREE, group, radius, materials.body);
}

function createAutomationStudio(THREE, group, radius, materials) {
  createStandardModulePlatform(THREE, group, radius, materials);
}

function createProjectLibrary(THREE, group, radius, materials) {
  createStandardModulePlatform(THREE, group, radius, materials);
}

function createCommunityRelay(THREE, group, radius, materials) {
  createStandardModulePlatform(THREE, group, radius, materials);
}

function createWalletMarket(THREE, group, radius, materials) {
  createStandardModulePlatform(THREE, group, radius, materials);
}

function createFallbackBuilding(THREE, group, radius, materials) {
  mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.22, radius * 0.34, radius * 0.5, 18),
    materials.body,
    [0, radius * 0.34, 0]
  );
  mesh(
    THREE,
    group,
    new THREE.OctahedronGeometry(radius * 0.16),
    materials.glow,
    [0, radius * 0.68, 0]
  );
}

function createModuleBuilding(THREE, module, diskRadius) {
  const group = new THREE.Group();
  group.name = `Module_${module.id}`;
  group.userData.moduleId = module.id;

  const radius =
    diskRadius * SCENE_CONFIG.buildingScale * COMPLEX_VISUAL_SCALE;
  group.userData.visualRadius = radius;
  group.userData.focusAnchorLocal = { x: 0, y: radius * 0.58, z: 0 };
  // Module geometry points inward along local -Z, therefore +Z is the outer edge.
  group.userData.outwardLocal = { x: 0, y: 0, z: 1 };
  const moduleAccentColor = HOLOGRAM_UI_BLUE;
  const materials = addBase(THREE, group, radius, moduleAccentColor);
  const featureRadius = radius * COMPLEX_FEATURE_SCALE;
  // Identity comes from the module silhouette, not another circular plate.
  if (module.id === "scanner") {
    createAutomationStudio(THREE, group, featureRadius, materials);
  } else if (module.id === "market") {
    createProjectLibrary(THREE, group, featureRadius, materials);
  } else if (module.id === "collab") {
    createCommunityRelay(THREE, group, featureRadius, materials);
  } else if (module.id === "wallet") {
    createWalletMarket(THREE, group, featureRadius, materials);
  } else {
    createFallbackBuilding(THREE, group, featureRadius, materials);
  }

  group.traverse((object) => {
    if (object.userData.glyphPart && object.material) {
      object.material.transparent = true;
      object.material.opacity = Math.min(object.material.opacity ?? 1, 0.28);
      object.material.depthWrite = false;
    }
  });
  addModuleHologram(THREE, group, module, radius);

  const hitArea = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 1.08, radius * 1.08, radius * 1.5, 18),
    invisibleMaterial(THREE),
    [0, radius * 0.42, 0]
  );
  hitArea.name = `HitArea_${module.id}`;
  hitArea.userData.moduleId = module.id;
  group.userData.baseHitArea = hitArea;

  group.traverse((object) => {
    object.userData.moduleId = module.id;
  });

  return group;
}

function getDiskRadius(THREE, bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  return Math.min(size.x, size.z) * 0.5;
}

function findSurfaceHit(THREE, station, x, z, bounds, diskRadius) {
  const raycaster = new THREE.Raycaster();
  raycaster.set(
    new THREE.Vector3(x, bounds.max.y + diskRadius, z),
    new THREE.Vector3(0, -1, 0)
  );
  return raycaster
    .intersectObject(station, true)
    .find((hit) => hit.face && hit.object.visible !== false);
}

export function createStationBuildings({ THREE, station, bounds, center }) {
  const root = new THREE.Group();
  root.name = "StationModuleBuildings";

  const clickableBuildings = [];
  const moduleGroups = new Map();
  const hologramBillboards = [];
  const hologramClickables = [];
  const diskRadius = getDiskRadius(THREE, bounds);

  MODULE_ANCHORS.forEach((anchor) => {
    const module = MODULE_BY_ID[anchor.id];
    if (!module) return;

    const angle = THREE.MathUtils.degToRad(anchor.angle);
    const x = center.x + Math.cos(angle) * diskRadius * anchor.ring;
    const z = center.z + Math.sin(angle) * diskRadius * anchor.ring;
    const hit = findSurfaceHit(THREE, station, x, z, bounds, diskRadius);
    if (!hit) return;

    const building = createModuleBuilding(THREE, module, diskRadius);
    const embed =
      building.userData.visualRadius * 0.0;
    building.position.set(x, hit.point.y - embed, z);
    building.rotation.y = -angle + Math.PI / 2;
    building.userData.surfaceObjectName = hit.object.name || "unnamed-surface";

    root.add(building);
    if (building.userData.baseHitArea) {
      clickableBuildings.push(building.userData.baseHitArea);
    }
    moduleGroups.set(module.id, building);
    if (building.userData.hologramBillboard) {
      hologramBillboards.push(building.userData.hologramBillboard);
    }
    if (building.userData.hologramClickArea) {
      hologramClickables.push(building.userData.hologramClickArea);
    }
  });

  return {
    root,
    clickableBuildings,
    moduleGroups,
    hologramBillboards,
    hologramClickables,
    diskRadius,
  };
}

export function pulseStationBuilding(moduleGroups, moduleId) {
  const group = moduleGroups.get(moduleId);
  if (!group) return;

  const initialScale = group.scale.clone();
  group.scale.multiplyScalar(1.025);

  group.traverse((object) => {
    if (object.material?.emissiveIntensity !== undefined) {
      object.userData.previousEmissiveIntensity = object.material.emissiveIntensity;
      object.material.emissiveIntensity = 0.72;
    }
  });

  window.setTimeout(() => {
    group.scale.copy(initialScale);
    group.traverse((object) => {
      if (object.material?.emissiveIntensity !== undefined) {
        object.material.emissiveIntensity =
          object.userData.previousEmissiveIntensity ?? 0.11;
      }
    });
  }, 180);
}


-

2.3.5) components/station/stationConfig.js
таким образом расположение целиком:
ungatus-lab-miniapp/components/station/stationConfig.js

Содержимое документа: 

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
  direction: { x: 0.86, y: 0.34, z: 0.36 },
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
  enabled: true,
  durationMs: 760,
  distanceByRadius: 0.92,
  heightByRadius: 0.36,
  targetInsetByRadius: 0.12,
  targetHeightByRadius: 0.08,
  arcLiftByRadius: 0.28,
  arcSideByRadius: 0.18,
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


-

2.3.6) components/components/station/stationProgress.js
таким образом расположение целиком:
ungatus-lab-miniapp/components/station/stationProgress.js

Содержимое документа: 

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


4.2) public/orbital_station_edge_view.glb
таким образом расположение целиком:
ungatus-lab-miniapp/public/orbital_station_edge_view.glb

Содержимое документа: 

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

