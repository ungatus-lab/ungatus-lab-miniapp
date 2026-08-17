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
