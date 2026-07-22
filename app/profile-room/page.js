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
