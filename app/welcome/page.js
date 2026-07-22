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
