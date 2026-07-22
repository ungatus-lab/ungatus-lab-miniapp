"use client";

import { useRouter } from "next/navigation";

export default function CollabRoom() {
  const router = useRouter();

  return (
    <div style={{
      padding: 20,
      textAlign: "center"
    }}>
      
      <h1 style={{ marginBottom: 20 }}>
        Collab Room
      </h1>

      <p style={{ marginBottom: 30 }}>
        Комната коллабов PixelGrid.<br/>
        В нативке здесь находятся проекты, совместная работа, обмен задачами и автоматизация между пользователями.<br/>
        В Mini App эта комната работает как презентация.
      </p>

      <div style={{
        border: "1px solid #444",
        padding: 20,
        borderRadius: 12,
        marginBottom: 30
      }}>
        <h3>Что будет доступно в нативке:</h3>
        <ul style={{ textAlign: "left", marginTop: 10 }}>
          <li>Совместные проекты</li>
          <li>Обмен задачами</li>
          <li>Коллаб автоматизации</li>
          <li>Подключение к чужим устройствам</li>
          <li>Общий workspace</li>
        </ul>
      </div>

      <button
        style={{ marginBottom: 20 }}
        onClick={() => router.push("/main")}
      >
        Вернуться в Main Screen
      </button>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 20
      }}>
        
        <button onClick={() => router.push("/device-room")}>
          Device Room
        </button>

        <button onClick={() => router.push("/center-room")}>
          Center Room
        </button>

        <button onClick={() => router.push("/market-room")}>
          Market Room
        </button>

        <button onClick={() => router.push("/profile-room")}>
          Profile Room
        </button>

      </div>
    </div>
  );
}
