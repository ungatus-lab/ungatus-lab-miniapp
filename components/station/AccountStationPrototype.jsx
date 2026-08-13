"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MODULES = [
  { id:"device", name:"DEVICE", sub:"Emulator Hangar", angle:-76, ring:1.18, y:-.08, color:[56,189,248], glyph:"▣" },
  { id:"native", name:"NATIVE", sub:"Research Lab", angle:-60, ring:.88, y:.18, color:[34,211,238], glyph:"◉" },
  { id:"collab", name:"COLLAB", sub:"Link Hub", angle:-43, ring:1.16, y:-.22, color:[167,139,250], glyph:"◈" },
  { id:"market", name:"MARKET", sub:"Trade Dock", angle:-27, ring:.91, y:.21, color:[244,114,182], glyph:"◍" },
  { id:"allocation", name:"ALLOCATION", sub:"Crystal Reactor", angle:-11, ring:1.15, y:-.19, color:[52,211,153], glyph:"◇" },
  { id:"center", name:"CORE", sub:"Account Citadel", angle:5, ring:.78, y:.03, color:[103,232,249], glyph:"◎", hero:true },
  { id:"wallet", name:"WALLET", sub:"UGT Vault", angle:22, ring:1.04, y:.2, color:[253,230,138], glyph:"⇄" },
  { id:"squad", name:"SQUAD", sub:"Relay Array", angle:40, ring:.9, y:-.2, color:[192,132,252], glyph:"⬡" },
  { id:"earn", name:"EARN", sub:"Mission Beacon", angle:58, ring:1.18, y:.17, color:[250,204,21], glyph:"✦" },
  { id:"game", name:"ARENA", sub:"PvP Rift", angle:77, ring:.82, y:-.02, color:[251,113,133], glyph:"⚔", hero:true },
];

const PACKS=[
 ["Starter","25 000 UGT","50 000 locked UGT"],
 ["Builder","100 000 UGT","200 000 locked UGT"],
 ["Pro","400 000 UGT","800 000 locked UGT"],
 ["Founder","1 600 000 UGT","3 200 000 locked UGT"],
];
const DETAIL_ROWS={
 center:[["Station generation","G1"],["Unlocked modules","10 / 10"],["Premium status","Inactive"]],
 device:[["Remote Scanner","Native"],["Macro Recorder","Native"],["Device Emulator","Preview"],["Raw frames","Native only"]],
 native:[["Scenario Constructor","Soon"],["Pixel Comparator","Premium"],["Density above 1%","Premium"],["Project Mindmap","Native"]],
 collab:[["Shared workspaces","Soon"],["Access control","Soon"],["Scenario co-edit","Soon"]],
 market:[["Project Scripts","Soon"],["Emulator Mirrors","Soon"],["Premium Pixel Tools","Soon"]],
 wallet:[["TON / Tonkeeper","Not connected"],["Solana / Phantom","Not connected"],["Swap preview","25 USDC → 24 250 UGT"]],
 squad:[["Referral code","PGM-SCENE"],["Clan channel","Offline"],["Shared arena queue","Soon"]],
 earn:[["Open Mini App","DONE"],["Watch rewarded ad","SOON"],["Start PvP arena","0 / 1"],["Pending ad UGT","0"]],
 game:[["Starter legion","Core Guard"],["Sensor profile","1% pixels"],["Arena evolution","Enabled"]],
};

export default function AccountStationPrototype({open=true,onClose,onLaunchGame,telegramUser}) {
  const canvasRef=useRef(null), frameRef=useRef(0), dragRef=useRef({down:false,x:0,yaw:34,v:0,t:0,moved:0});
  const yawRef=useRef(34), targetYawRef=useRef(34), projectionRef=useRef({});
  const [yaw,setYaw]=useState(34), [activeId,setActiveId]=useState(null), [labels,setLabels]=useState(true), [level,setLevel]=useState(1);
  const active=useMemo(()=>MODULES.find(m=>m.id===activeId),[activeId]);
  const name=telegramUser?.first_name||telegramUser?.username||"SceneAgent";

  useEffect(()=>{ yawRef.current=yaw; },[yaw]);
  useEffect(()=>{ if(!open)return; const canvas=canvasRef.current,ctx=canvas?.getContext("2d"); if(!ctx)return;
    let alive=true,last=performance.now(); const stars=makeStars(190), dust=makeStars(70);
    function resize(){const d=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);}
    resize(); const ro=new ResizeObserver(resize);ro.observe(canvas);
    function loop(now){if(!alive)return; const dt=Math.min(.034,(now-last)/1000);last=now;
      const drag=dragRef.current;
      if(!drag.down){const difference=targetYawRef.current-yawRef.current; yawRef.current+=difference*Math.min(1,dt*8); if(Math.abs(drag.v)>.01){yawRef.current+=drag.v*dt;drag.v*=Math.pow(.045,dt);} yawRef.current=clamp(yawRef.current,-88,88); targetYawRef.current=yawRef.current;}
      drawScene(ctx,canvas.clientWidth,canvas.clientHeight,yawRef.current,now/1000,stars,dust,level,projectionRef.current);
      frameRef.current=requestAnimationFrame(loop);
    } loop(last); return()=>{alive=false;ro.disconnect();cancelAnimationFrame(frameRef.current);};
  },[open,level]);

  if(!open)return null;
  function down(e){if(active)return; e.currentTarget.setPointerCapture?.(e.pointerId);dragRef.current={down:true,x:e.clientX,yaw:yawRef.current,v:0,t:performance.now(),moved:0};}
  function move(e){const d=dragRef.current;if(!d.down||active)return;const dx=e.clientX-d.x; d.moved=Math.max(d.moved,Math.abs(dx)); const next=clamp(d.yaw-dx*.23,-88,88); const now=performance.now();d.v=(next-yawRef.current)/Math.max(.012,(now-d.t)/1000);d.t=now;yawRef.current=next;targetYawRef.current=next;setYaw(next);}
  function up(){const d=dragRef.current;if(!d.down)return;d.down=false;setYaw(yawRef.current);}
  function openModule(module){if(dragRef.current.moved>8)return;targetYawRef.current=module.angle;setYaw(module.angle);setTimeout(()=>setActiveId(module.id),220);}

  return <main style={S.root}>
    <style>{CSS}</style>
    <canvas ref={canvasRef} style={S.canvas}/>
    <div style={S.filmGrain}/><div style={S.cinemaMask}/>
    <header style={S.header}>
      <button style={S.iconButton} onClick={onClose}>‹</button>
      <div style={S.identity}><small>PIXELGRID // ORBITAL ACCOUNT</small><b>{name}</b></div>
      <button style={S.level} onClick={()=>setLevel(v=>v===5?1:v+1)}><small>GENERATION</small><b>G{level}</b></button>
    </header>
    <section style={S.viewport} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      {MODULES.map(module=>{
        const p=projectDOM(module,yaw); if(!p.visible)return null;
        return <button key={module.id} className="hotspot" onClick={()=>openModule(module)} style={{...S.hotspot,left:`${p.x}%`,top:`${p.y}%`,opacity:p.alpha,transform:`translate(-50%,-50%) scale(${p.scale})`,zIndex:p.z}}>
          <span style={{...S.reticle,borderColor:`rgba(${module.color.join(",")},.58)`,boxShadow:`0 0 22px rgba(${module.color.join(",")},.3)`}}><i>{module.glyph}</i></span>
          {labels&&<span style={S.tag}><b>{module.name}</b><small>{module.sub}</small></span>}
        </button>;
      })}
    </section>
    <div style={S.stats}><Data label="UGT" value="0"/><Data label="ALLOCATION" value="0"/><Data label="EMULATORS" value="1 / 1"/></div>
    <div style={S.tools}><button onClick={()=>setLabels(v=>!v)}>{labels?"HIDE ID":"SHOW ID"}</button></div>
    {!active&&<>
      <div style={S.title}><small>{yaw<-30?"NATIVE HEMISPHERE":yaw>35?"ARENA HEMISPHERE":"ACCOUNT NEXUS"}</small><b>ORBITAL HABITAT</b><span>Проведи пальцем. Камера вращается вокруг станции.</span></div>
      <div style={S.compass}><span>NATIVE</span><div><i style={{left:`${((yaw+88)/176)*100}%`}}/></div><span>ARENA</span></div>
    </>}
    {active&&<Panel module={active} name={name} level={level} close={()=>setActiveId(null)} launch={onLaunchGame}/>} 
  </main>;
}

function Panel({module,name,level,close,launch}){
 const content={
 center:["ACCOUNT CITADEL",`Постоянный профиль ${name}, развитие станции и статус аккаунта.`],
 game:["MACRO SWARM ARENA","Вылет в PvP с выбранным Core, легионами и игровыми эмуляторами."],
 device:["EMULATOR HANGAR","LDPlayer, PC, Android, Remote Scanner и multi-device control."],
 native:["RESEARCH LAB","Эталоны, плотность пикселей, сравнитель и Scenario Constructor."],
 collab:["COLLABORATION HUB","Общие проекты, права доступа и совместное редактирование."],
 market:["MARKET DOCK","Сценарии, зеркала, проекты и premium-инструменты."],
 allocation:["ALLOCATION REACTOR","Аллокация, locked UGT и стартовая энергия PvP."],
 wallet:["UGT VAULT","Кошельки, backed UGT, promo UGT и обмен."],
 squad:["SQUAD ARRAY","Реферальная сеть, игровые группы и будущие кланы."],
 earn:["MISSION BEACON","Задания, rewarded ads и получение базовой аллокации."],
 }[module.id];
 return <div style={S.panelShade} onPointerDown={e=>{if(e.target===e.currentTarget)close();}}><section style={{...S.panel,borderColor:`rgba(${module.color.join(",")},.35)`}}>
  <header style={S.panelHead}><button style={S.iconButton} onClick={close}>‹</button><span style={{...S.panelGlyph,color:`rgb(${module.color.join(",")})`}}>{module.glyph}</span><div><small>{module.sub}</small><b>{module.name}</b></div><em>G{level}</em></header>
  <div style={S.hero}><small>ACTIVE MODULE</small><h2>{content[0]}</h2><p>{content[1]}</p></div>
  {module.id==="allocation" ? <>
    <Metrics id={module.id}/>
    <div style={S.packGrid}>{PACKS.map(p=><div key={p[0]} style={S.pack}><b>{p[0]}</b><span>{p[1]}</span><small>Bonus · {p[2]}</small></div>)}</div>
  </> : <><Metrics id={module.id}/><DetailRows id={module.id}/></>}
  {module.id==="game"&&<button style={S.launch} onClick={launch}>ENTER PVP RIFT</button>}
 </section></div>;
}
function DetailRows({id}){const rows=DETAIL_ROWS[id]||[];if(!rows.length)return null;return <section style={S.detail}>{rows.map(r=><div key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></div>)}</section>}
function Metrics({id}){const rows={center:[["PROFILE","LV 1"],["PVP GAMES","0"],["STATUS","FREE"],["RATING","—"]],device:[["LDPLAYER","0"],["PC","0"],["ANDROID","0"],["SLOTS","1"]],native:[["PIXELS","1%"],["ETALONS","0"],["PROJECTS","0"],["PREMIUM","OFF"]],collab:[["ROOMS","0"],["PROJECTS","0"],["MEMBERS","0"],["LINKS","0"]],market:[["PROJECTS","0"],["RENTALS","0"],["TOOLS","0"],["STATUS","SOON"]],wallet:[["BACKED","0"],["PROMO","0"],["LOCKED","0"],["AVAILABLE","0"]],squad:[["SQUAD","0"],["INVITED","0"],["ACTIVITY","0"],["REWARD","0"]],earn:[["MISSIONS","1/4"],["ADS","0"],["PROMO","0"],["STREAK","1"]],allocation:[["ACQUIRED","0 UGT"],["LOCKED","0 UGT"],["ADS","0 UGT"],["ROUND","R1"]],game:[["CORE","G1"],["LEGIONS","1"],["EMULATORS","1"],["SERVER","1–5"]]}[id]||[];return <div style={S.metrics}>{rows.map(r=><div key={r[0]}><small>{r[0]}</small><b>{r[1]}</b></div>)}</div>}
function Data({label,value}){return <div><small>{label}</small><b>{value}</b></div>}
function projectDOM(m,yaw){const d=(m.angle-yaw)*Math.PI/180,f=Math.cos(d),s=Math.sin(d);return{visible:f>.18,x:50+s*44,y:48+m.y*36+(1-f)*9,scale:.55+f*.68,alpha:clamp(f*1.6,.18,1),z:Math.round(f*100+m.y*10)}}
function makeStars(n){let seed=918273;return Array.from({length:n},()=>{seed=(seed*1664525+1013904223)>>>0;const a=seed/4294967296;seed=(seed*1664525+1013904223)>>>0;const b=seed/4294967296;seed=(seed*1664525+1013904223)>>>0;const c=seed/4294967296;return{x:a,y:b,z:.2+c*.8,r:.35+c*1.25}})}
function drawScene(ctx,w,h,yaw,t,stars,dust,level,out){ctx.clearRect(0,0,w,h);const g=ctx.createRadialGradient(w*.48,h*.42,0,w*.48,h*.42,Math.max(w,h));g.addColorStop(0,"#10304b");g.addColorStop(.28,"#090c2c");g.addColorStop(.62,"#030615");g.addColorStop(1,"#010208");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 drawNebula(ctx,w,h,yaw,t); drawStars(ctx,w,h,yaw,t,stars); drawPlanet(ctx,w,h,yaw); drawHabitat(ctx,w,h,yaw,t,level); drawParticles(ctx,w,h,yaw,t,dust);
}
function drawNebula(c,w,h,yaw,t){const shift=yaw/88*w*.18;for(const n of [[.18,.29,190,"52,211,153"],[.66,.23,220,"124,58,237"],[.88,.58,180,"244,63,94"]]){const x=w*n[0]-shift,y=h*n[1]+Math.sin(t*.08+n[0]*6)*12,r=Math.min(w,h)*n[2]/420,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${n[3]},.16)`);g.addColorStop(1,`rgba(${n[3]},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}}
function drawStars(c,w,h,yaw,t,arr){for(const s of arr){let x=((s.x*w*1.7-yaw*s.z*2.2)%(w*1.7)+w*1.7)%(w*1.7)-w*.35,y=s.y*h;c.globalAlpha=.25+s.z*.65;c.fillStyle=s.z>.75?"#b9f5ff":"#fff";c.beginPath();c.arc(x,y,s.r*(.7+s.z),0,7);c.fill()}c.globalAlpha=1}
function drawPlanet(c,w,h,yaw){const x=w*.14-yaw*w*.003,y=h*.18,r=Math.min(w,h)*.12,g=c.createRadialGradient(x-r*.35,y-r*.45,r*.04,x,y,r);g.addColorStop(0,"rgba(184,245,255,.65)");g.addColorStop(.22,"rgba(31,83,125,.5)");g.addColorStop(.72,"rgba(9,22,50,.22)");g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
function drawHabitat(c,w,h,yaw,t,level){const cx=w*.5,cy=h*.54,R=Math.min(w,h)*.62,yr=Math.min(w,h)*.24;c.save();c.translate(cx,cy);c.rotate(-yaw*.0007);for(let k=0;k<5;k++){c.beginPath();c.ellipse(0,k*3,R*(1-k*.055),yr*(1-k*.05),0,Math.PI,Math.PI*2);c.strokeStyle=`rgba(${70+k*22},${170+k*10},220,${.1+k*.025})`;c.lineWidth=1.2+k*.3;c.stroke()}c.beginPath();c.ellipse(0,0,R,yr,0,0,Math.PI*2);c.strokeStyle="rgba(103,232,249,.28)";c.lineWidth=2;c.stroke();for(let a=0;a<20;a++){const q=a/20*Math.PI*2;c.beginPath();c.moveTo(Math.cos(q)*R*.18,Math.sin(q)*yr*.18);c.lineTo(Math.cos(q)*R*.98,Math.sin(q)*yr*.98);c.strokeStyle="rgba(103,232,249,.055)";c.stroke()}c.restore();
 for(const m of MODULES){const p=projectDOM(m,yaw);if(!p.visible)continue;drawModule(c,w*p.x/100,h*p.y/100,28*p.scale*(m.hero?1.25:1),m,t,level,p.alpha)} }
function drawModule(c,x,y,r,m,t,level,a){const col=m.color.join(",");c.save();c.globalAlpha=a;c.shadowColor=`rgba(${col},.8)`;c.shadowBlur=22;c.fillStyle=`rgba(${col},.09)`;c.beginPath();c.ellipse(x,y+r*.78,r*1.15,r*.32,0,0,7);c.fill();c.shadowBlur=8;c.fillStyle="#071426";c.strokeStyle=`rgba(${col},.72)`;c.lineWidth=1.3;c.beginPath();c.moveTo(x-r*.72,y+r*.45);c.lineTo(x-r*.48,y-r*.12);c.quadraticCurveTo(x,y-r*.82,x+r*.48,y-r*.12);c.lineTo(x+r*.72,y+r*.45);c.quadraticCurveTo(x,y+r*.77,x-r*.72,y+r*.45);c.fill();c.stroke();const g=c.createRadialGradient(x-r*.2,y-r*.28,1,x,y,r*.85);g.addColorStop(0,`rgba(${col},.88)`);g.addColorStop(.45,`rgba(${col},.24)`);g.addColorStop(1,"rgba(2,7,18,.95)");c.fillStyle=g;c.beginPath();c.ellipse(x,y-r*.05,r*.55,r*.43,0,0,7);c.fill();c.stroke();for(let i=0;i<level;i++){c.strokeStyle=`rgba(${col},${.18+i*.05})`;c.beginPath();c.ellipse(x,y+r*(.58+i*.08),r*(.78+i*.12),r*(.18+i*.025),0,0,7);c.stroke()}if(m.id==="allocation"){c.fillStyle=`rgba(${col},.72)`;c.beginPath();c.moveTo(x,y-r*1.25);c.lineTo(x+r*.34,y-r*.28);c.lineTo(x,y+r*.16);c.lineTo(x-r*.34,y-r*.28);c.closePath();c.fill();c.stroke()}
if(m.id==="device"){for(let q=-1;q<=1;q++){c.strokeStyle=`rgba(${col},.58)`;c.strokeRect(x+q*r*.43-r*.18,y-r*.72,r*.36,r*.47)}}
if(m.id==="native"){c.strokeStyle=`rgba(${col},.7)`;for(let q=0;q<3;q++){c.beginPath();c.arc(x,y-r*.12,r*(.34+q*.18),Math.PI*1.08,Math.PI*1.92);c.stroke()}}
if(m.id==="market"){c.strokeStyle=`rgba(${col},.68)`;c.beginPath();c.moveTo(x-r*.86,y+r*.1);c.lineTo(x-r*.35,y-r*.65);c.lineTo(x+r*.35,y-r*.65);c.lineTo(x+r*.86,y+r*.1);c.stroke()}
if(m.id==="collab"||m.id==="squad"){for(let q=0;q<3;q++){const a=q*Math.PI*2/3;c.fillStyle=`rgba(${col},.55)`;c.beginPath();c.arc(x+Math.cos(a)*r*.62,y-r*.14+Math.sin(a)*r*.42,r*.13,0,7);c.fill()}}
if(m.id==="wallet"){c.strokeStyle=`rgba(${col},.72)`;c.lineWidth=2;c.beginPath();c.arc(x,y-r*.18,r*.6,Math.PI*.15,Math.PI*1.35);c.stroke();c.beginPath();c.arc(x,y-r*.18,r*.6,Math.PI*1.15,Math.PI*2.35);c.stroke()}
if(m.id==="earn"){c.fillStyle=`rgba(${col},.72)`;for(let q=0;q<4;q++){c.save();c.translate(x,y-r*.25);c.rotate(q*Math.PI/2);c.fillRect(-r*.07,-r*.78,r*.14,r*.42);c.restore()}}
if(m.kind==="gate"){c.lineWidth=4;c.strokeStyle=`rgba(${col},.85)`;c.beginPath();c.arc(x,y-r*.2,r*.92,0,7);c.stroke();c.lineWidth=1;c.save();c.translate(x,y-r*.2);c.rotate(t*.4);for(let i=0;i<6;i++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(r*.72,0);c.lineTo(r*.97,0);c.stroke()}c.restore()}
c.restore()}
function drawParticles(c,w,h,yaw,t,arr){for(const p of arr){const x=((p.x*w*1.4-yaw*p.z*3+t*4*p.z)%(w*1.4)+w*1.4)%(w*1.4)-w*.2,y=p.y*h;c.fillStyle=`rgba(103,232,249,${.04+p.z*.12})`;c.fillRect(x,y,p.r*2,p.r*.5)}}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

const CSS=`@keyframes breathe{50%{opacity:.65;transform:scale(1.06)}}@keyframes panelIn{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}@keyframes hudSweep{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(340%) skewX(-18deg)}}.hotspot{transition:left .08s linear,top .08s linear,opacity .12s,transform .12s;touch-action:none}.hotspot:active .reticle{transform:scale(.88)}.reticle{transition:.2s}.reticle:before{content:"";position:absolute;inset:5px;border-top:1px solid currentColor;border-bottom:1px solid currentColor;border-radius:50%;opacity:.32}.reticle:after{content:"";position:absolute;inset:-9px;border:1px dashed currentColor;border-radius:50%;opacity:.38;animation:breathe 2.2s ease-in-out infinite}.identity small,.level small,.stats small,.title small,.hero small,.metrics small,.pack small,.panelHead small{font-size:7px;letter-spacing:.1em;color:rgba(203,213,225,.58);font-weight:900}.identity b{font-size:14px}.level b{font-size:13px}.stats>div{min-width:59px;padding:6px 8px;border-radius:11px;background:rgba(3,12,28,.64);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px);display:flex;flex-direction:column}.stats b{font-size:12px}.tools button{height:30px;padding:0 10px;border-radius:10px;border:1px solid rgba(103,232,249,.16);background:rgba(3,12,28,.62);color:#dffcff;font-size:8px;font-weight:900}.tag b{font-size:9px}.tag small{font-size:7px;color:rgba(226,232,240,.63)}.reticle i{font-style:normal;font-size:20px;text-shadow:0 0 15px currentColor}.title b{font-size:16px;letter-spacing:.06em}.title span{font-size:9px;color:rgba(226,232,240,.58)}.compass>div{position:relative;height:3px;border-radius:99px;background:rgba(255,255,255,.12)}.compass>div:before{content:"";position:absolute;inset:0;border-radius:99px;background:linear-gradient(90deg,#22d3ee,#a78bfa,#fb7185);opacity:.58}.compass i{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:#e0f2fe;box-shadow:0 0 13px #67e8f9}.panelHead>div{display:flex;flex-direction:column}.panelHead em{font-style:normal;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.05);font-size:9px}.hero h2{margin:5px 0 6px;font-size:20px}.hero p{margin:0;color:rgba(226,232,240,.63);font-size:12px;line-height:1.5}.metrics>div{min-height:52px;padding:8px;border-radius:13px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;justify-content:center;gap:3px}.metrics b{font-size:11px}.pack b{font-size:11px}.pack span{font-size:10px;color:#d1fae5}.detail>div{min-height:35px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,.055);font-size:10px}.detail span{color:#94a3b8}.detail b{font-size:10px}`;
const S={root:{position:"fixed",inset:0,zIndex:180,overflow:"hidden",background:"#010208",color:"#effcff",fontFamily:"Inter,system-ui,sans-serif"},canvas:{position:"absolute",inset:0,width:"100%",height:"100%",touchAction:"none"},filmGrain:{position:"absolute",inset:-60,pointerEvents:"none",opacity:.055,backgroundImage:"url(data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E)"},cinemaMask:{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at 50% 48%,transparent 43%,rgba(0,1,7,.24) 76%,rgba(0,1,7,.72) 120%)"},header:{position:"absolute",zIndex:70,top:10,left:10,right:10,height:54,display:"grid",gridTemplateColumns:"42px 1fr auto",alignItems:"center",gap:10,padding:"0 10px",borderRadius:18,background:"linear-gradient(135deg,rgba(3,12,28,.68),rgba(11,8,33,.55))",border:"1px solid rgba(137,230,255,.16)",backdropFilter:"blur(22px)"},iconButton:{width:36,height:36,borderRadius:12,border:"1px solid rgba(255,255,255,.14)",background:"rgba(255,255,255,.055)",color:"white",fontSize:27,cursor:"pointer"},identity:{minWidth:0,display:"flex",flexDirection:"column"},level:{minWidth:64,height:38,borderRadius:12,border:"1px solid rgba(103,232,249,.2)",background:"rgba(9,38,55,.42)",color:"#dffcff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},viewport:{position:"absolute",inset:"64px 0 0",touchAction:"none",userSelect:"none"},hotspot:{position:"absolute",width:82,height:82,padding:0,border:0,background:"transparent",color:"white",cursor:"pointer",transformOrigin:"center"},reticle:{position:"absolute",left:"50%",top:"45%",width:45,height:45,transform:"translate(-50%,-50%)",border:"1px solid",borderRadius:"50%",display:"grid",placeItems:"center",background:"rgba(2,8,22,.42)",backdropFilter:"blur(5px)"},tag:{position:"absolute",left:"50%",top:"71%",transform:"translateX(-50%)",minWidth:96,padding:"6px 9px",borderRadius:10,background:"rgba(2,7,18,.72)",border:"1px solid rgba(255,255,255,.1)",backdropFilter:"blur(10px)",display:"flex",flexDirection:"column",pointerEvents:"none"},stats:{position:"absolute",zIndex:75,top:73,left:10,display:"flex",gap:5},tools:{position:"absolute",zIndex:75,top:73,right:10},title:{position:"absolute",zIndex:60,left:15,bottom:67,maxWidth:"68%",padding:"11px 13px",borderRadius:16,background:"linear-gradient(135deg,rgba(3,14,33,.72),rgba(17,9,43,.55))",border:"1px solid rgba(103,232,249,.16)",backdropFilter:"blur(18px)",display:"flex",flexDirection:"column"},compass:{position:"absolute",zIndex:60,left:20,right:20,bottom:28,display:"grid",gridTemplateColumns:"auto 1fr auto",gap:9,alignItems:"center",fontSize:7,color:"rgba(226,232,240,.5)"},panelShade:{position:"absolute",inset:0,zIndex:100,display:"flex",alignItems:"flex-end",padding:10,background:"linear-gradient(180deg,transparent 12%,rgba(0,2,10,.32) 45%,rgba(0,2,10,.96))"},panel:{width:"100%",maxHeight:"68vh",overflowY:"auto",padding:12,borderRadius:"24px 24px 16px 16px",background:"linear-gradient(180deg,rgba(8,24,45,.97),rgba(2,7,18,.99))",border:"1px solid",boxShadow:"0 -26px 80px rgba(0,0,0,.75)",animation:"panelIn .38s ease-out"},panelHead:{display:"grid",gridTemplateColumns:"38px 40px 1fr auto",gap:8,alignItems:"center",marginBottom:10},panelGlyph:{width:38,height:38,borderRadius:12,display:"grid",placeItems:"center",background:"rgba(255,255,255,.05)",fontSize:20},hero:{padding:14,borderRadius:17,background:"radial-gradient(circle at 100% 0,rgba(103,232,249,.15),transparent 38%),rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.075)",marginBottom:9},metrics:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6},packGrid:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:7},pack:{padding:11,borderRadius:14,background:"rgba(52,211,153,.06)",border:"1px solid rgba(52,211,153,.17)",display:"flex",flexDirection:"column"},detail:{marginTop:9,padding:"4px 12px",borderRadius:15,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"},launch:{width:"100%",height:50,marginTop:10,border:0,borderRadius:15,background:"linear-gradient(135deg,#e11d48,#7c3aed,#0891b2)",color:"white",fontWeight:950,letterSpacing:".08em",boxShadow:"0 0 34px rgba(225,29,72,.22)"}};
