"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MODULES = [
  { id: "device", title: "DEVICE", subtitle: "Emulator Hangar", x: 15.2, y: 56.5, color: "#5ee7ff", icon: "▣", shape: "hangar" },
  { id: "scanner", title: "SCANNER", subtitle: "Etalon Laboratory", x: 23.0, y: 34.5, color: "#53f5df", icon: "◉", shape: "dish" },
  { id: "collab", title: "COLLAB", subtitle: "Link Hub", x: 31.5, y: 67.5, color: "#b99cff", icon: "◈", shape: "relay" },
  { id: "market", title: "MARKET", subtitle: "Trade Dock", x: 79.5, y: 61.5, color: "#ff8bc8", icon: "◍", shape: "dock" },
  { id: "premium", title: "PREMIUM", subtitle: "Status Reactor", x: 67.7, y: 38.5, color: "#6df0ad", icon: "◇", shape: "reactor" },
  { id: "center", title: "CORE", subtitle: "Account Citadel", x: 50.0, y: 31.0, color: "#8cecff", icon: "◎", shape: "citadel" },
  { id: "wallet", title: "WALLET", subtitle: "UGT Vault", x: 43.5, y: 69.5, color: "#ffe693", icon: "⇄", shape: "vault" },
  { id: "squad", title: "SQUAD", subtitle: "Relay Array", x: 76.0, y: 34.0, color: "#ca9cff", icon: "⬡", shape: "relay" },
  { id: "earn", title: "EARN", subtitle: "Mission Beacon", x: 87.0, y: 50.0, color: "#ffe45c", icon: "✦", shape: "beacon" },
  { id: "game", title: "ARENA", subtitle: "PvP Rift", x: 77.5, y: 73.8, color: "#ff6f91", icon: "⚔", shape: "gate" },
];

const PREMIUM_TIERS = [
  ["Free", "Базовый доступ", "1% scanner"],
  ["Basic", "€9.99 / month", "Comparator trial"],
  ["Advanced", "€24.99 / month", "More tools and slots"],
  ["Pro", "€39.99 / month", "Extended scanner"],
  ["Pro Plus", "€79.99 / month", "Maximum profile tier"],
];

const DETAILS = {
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

export default function AccountStationPrototype({ open = true, onClose, onLaunchGame, telegramUser }) {
  const viewportRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [generation, setGeneration] = useState(1);
  const [panX, setPanX] = useState(0);
  const [metrics, setMetrics] = useState({ viewportWidth: 1, worldWidth: 1 });
  const drag = useRef({ down: false, startX: 0, startPan: 0, moved: 0 });
  const active = useMemo(() => MODULES.find((module) => module.id === activeId), [activeId]);
  const accountName = telegramUser?.first_name || telegramUser?.username || "SceneAgent";

  useEffect(() => {
    if (!open || !viewportRef.current) return;
    const node = viewportRef.current;
    const update = () => {
      const viewportWidth = node.clientWidth || 1;
      const viewportHeight = node.clientHeight || 1;
      const worldWidth = viewportHeight * 1.5;
      setMetrics({ viewportWidth, worldWidth });
      setPanX((value) => clamp(value, 0, Math.max(0, worldWidth - viewportWidth)));
    };
    update();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(update);
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  if (!open) return null;

  const maxPan = Math.max(0, metrics.worldWidth - metrics.viewportWidth);
  const progress = maxPan ? panX / maxPan : 0;

  function beginCamera(event) {
    if (active) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { down: true, startX: event.clientX, startPan: panX, moved: 0 };
  }

  function moveCamera(event) {
    if (!drag.current.down || active) return;
    const delta = event.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
    setPanX(clamp(drag.current.startPan - delta, 0, maxPan));
  }

  function endCamera() {
    drag.current.down = false;
  }

  function openModule(module) {
    if (drag.current.moved > 8) return;
    const target = clamp((module.x / 100) * metrics.worldWidth - metrics.viewportWidth / 2, 0, maxPan);
    setPanX(target);
    window.setTimeout(() => setActiveId(module.id), 180);
  }

  return (
    <main style={styles.root}>
      <style>{css}</style>

      <section
        ref={viewportRef}
        style={styles.viewport}
      >
        <div
          style={{
            ...styles.world,
            width: "100%",
            transform: "none",
          }}
        >
          <StationThreeView onSelectModule={setActiveId} />

          {/* Modules will return as 3D buildings in the next stage. */}
        </div>
      </section>

      <header style={styles.header}>
        <button style={styles.backButton} onClick={onClose}>‹</button>
        <div style={styles.identity}>
          <small>PIXELGRID // ORBITAL ACCOUNT</small>
          <strong>{accountName}</strong>
        </div>
        <button style={styles.generation} onClick={() => setGeneration((value) => value === 10 ? 1 : value + 1)}>
          <small>GENERATION</small><b>G{generation}</b>
        </button>
      </header>

      <div style={styles.stats}>
        <Stat label="UGT" value="0" />
        <Stat label="STATUS" value="FREE" />
        <Stat label="EMULATORS" value="1 / 1" />
      </div>

      {!active && (
        <div style={styles.cameraHint}>КОСМОГОРОД · СВАЙП ИЛИ НАЖМИТЕ ЗДАНИЕ</div>
      )}

      {active && (
        <ModulePanel
          module={active}
          generation={generation}
          onClose={() => setActiveId(null)}
          onLaunchGame={onLaunchGame}
        />
      )}
    </main>
  );
}


function StationThreeView({ onSelectModule }) {
  const hostRef = useRef(null);
  const rigRef = useRef(null);
  const [coords, setCoords] = useState({ x: 192, y: 66, z: 70, tx: 60, ty: 0, tz: 0 });
  const [panoramaFrame, setPanoramaFrame] = useState(1);




  useEffect(() => {
    let disposed = false;
    let renderer;
    let frameId;
    let resizeObserver;
    const cleanups = [];

    (async () => {
      const THREE = await import(/* webpackIgnore: true */ "https://esm.sh/three@0.167.1");
      const { GLTFLoader } = await import(/* webpackIgnore: true */ "https://esm.sh/three@0.167.1/examples/jsm/loaders/GLTFLoader.js");
      if (disposed || !hostRef.current) return;

      const host = hostRef.current;
      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 500);
      camera.up.set(0, 1, 0);
      camera.position.set(0, 8, 30);
      camera.lookAt(0, 1, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x010207, 0.18);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "none";
      host.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xbfe8ff, 0x07101f, 2.1));
      const key = new THREE.DirectionalLight(0xffffff, 3.2);
      key.position.set(8, 18, 16);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x65baff, 2.0);
      rim.position.set(-14, 7, -10);
      scene.add(rim);

      const loader = new GLTFLoader();
      loader.load("/orbital_station_edge_view.glb", (gltf) => {
        if (disposed) return;
        const station = gltf.scene;
        station.rotation.x = -Math.PI / 2;
        scene.add(station);
        station.updateMatrixWorld(true);

        const bounds = new THREE.Box3().setFromObject(station);
        const center = bounds.getCenter(new THREE.Vector3());
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        const radius = sphere.radius;
        const clickableBuildings = [];
        const moduleRoot = new THREE.Group();
        scene.add(moduleRoot);
        const specs = [
          ["device",205,.72,0x5ee7ff,"hangar"],["scanner",150,.70,0x53f5df,"dish"],
          ["collab",235,.60,0xb99cff,"twins"],["wallet",275,.69,0xffe693,"vault"],
          ["game",315,.74,0xff6f91,"gate"],["market",342,.70,0xff8bc8,"hangar"],
          ["earn",18,.72,0xffe45c,"beacon"],["squad",48,.67,0xca9cff,"beacon"],
          ["premium",78,.61,0x6df0ad,"reactor"],["center",110,.52,0x8cecff,"citadel"]
        ];
        const baseR = radius*.055;
        const dark = (color) => new THREE.MeshStandardMaterial({color:0x17283a,metalness:.8,roughness:.28,emissive:color,emissiveIntensity:.2});
        const glow = (color) => new THREE.MeshBasicMaterial({color,transparent:true,opacity:.92,depthWrite:false});
        const addMesh = (group,geometry,mat,y=0) => { const m=new THREE.Mesh(geometry,mat); m.position.y=y; group.add(m); return m; };
        function building(id,color,type) {
          const g=new THREE.Group(); g.name=`Module_${id}`;
          const body=dark(color), light=glow(color), bh=radius*.018;
          addMesh(g,new THREE.CylinderGeometry(baseR,baseR*1.12,bh,24),body,bh/2);
          const ring=addMesh(g,new THREE.TorusGeometry(baseR*.88,baseR*.08,8,28),light,bh*1.1); ring.rotation.x=Math.PI/2;
          if(type==="hangar") { addMesh(g,new THREE.BoxGeometry(baseR*1.35,baseR*.7,baseR),body,bh+baseR*.35); }
          else if(type==="dish") { addMesh(g,new THREE.CylinderGeometry(baseR*.2,baseR*.34,baseR*.8,16),body,bh+baseR*.4); const d=addMesh(g,new THREE.SphereGeometry(baseR*.58,18,9,0,Math.PI*2,0,Math.PI/2),body,bh+baseR*.9); d.scale.y=.32; }
          else if(type==="twins") { [-.35,.35].forEach(x=>{const t=addMesh(g,new THREE.CylinderGeometry(baseR*.22,baseR*.3,baseR*1.2,14),body,bh+baseR*.6);t.position.x=x*baseR;}); addMesh(g,new THREE.BoxGeometry(baseR,baseR*.12,baseR*.12),light,bh+baseR*.75); }
          else if(type==="gate") { [-.42,.42].forEach(x=>{const t=addMesh(g,new THREE.BoxGeometry(baseR*.22,baseR*1.3,baseR*.3),body,bh+baseR*.65);t.position.x=x*baseR;}); addMesh(g,new THREE.BoxGeometry(baseR*1.05,baseR*.2,baseR*.3),light,bh+baseR*1.22); }
          else if(type==="reactor") { addMesh(g,new THREE.CylinderGeometry(baseR*.45,baseR*.62,baseR*.72,20),body,bh+baseR*.36); addMesh(g,new THREE.IcosahedronGeometry(baseR*.36,1),light,bh+baseR*.82); }
          else if(type==="vault") { addMesh(g,new THREE.BoxGeometry(baseR*1.05,baseR*.8,baseR*.95),body,bh+baseR*.4); }
          else if(type==="citadel") { addMesh(g,new THREE.CylinderGeometry(baseR*.3,baseR*.5,baseR*1.35,18),body,bh+baseR*.68); addMesh(g,new THREE.ConeGeometry(baseR*.22,baseR*.7,14),light,bh+baseR*1.7); }
          else { addMesh(g,new THREE.CylinderGeometry(baseR*.14,baseR*.32,baseR*1.05,14),body,bh+baseR*.52); addMesh(g,new THREE.OctahedronGeometry(baseR*.28),light,bh+baseR*1.18); }
          const hit=addMesh(g,new THREE.CylinderGeometry(baseR*1.3,baseR*1.3,baseR*1.9,14),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),baseR*.95);
          g.traverse(o=>o.userData.moduleId=id); clickableBuildings.push(g); return g;
        }
        const platformY=bounds.min.y+radius*.10;
        specs.forEach(([id,deg,ring,color,type])=>{const a=THREE.MathUtils.degToRad(deg),g=building(id,color,type);g.position.set(center.x+Math.cos(a)*radius*ring,platformY,center.z+Math.sin(a)*radius*ring);g.rotation.y=-a+Math.PI/2;moduleRoot.add(g);});


        // Three perpendicular calibration planes. The model stays fixed at all times.
        const gridSize = radius * 6;
        const divisions = 24;
        const floorGrid = new THREE.GridHelper(gridSize, divisions, 0x43d9ff, 0x24506a);
        floorGrid.position.set(center.x, bounds.min.y - radius * 0.05, center.z);
        floorGrid.material.transparent = true;
        floorGrid.material.opacity = 0;
        floorGrid.visible = false;
        scene.add(floorGrid);

        const backGrid = new THREE.GridHelper(gridSize, divisions, 0x9f7aea, 0x3c315b);
        backGrid.rotation.x = Math.PI / 2;
        backGrid.position.set(center.x, center.y, center.z - radius * 1.25);
        backGrid.material.transparent = true;
        backGrid.material.opacity = 0;
        backGrid.visible = false;
        scene.add(backGrid);

        const sideGrid = new THREE.GridHelper(gridSize, divisions, 0x60f5c5, 0x28594d);
        sideGrid.rotation.z = Math.PI / 2;
        sideGrid.position.set(center.x - radius * 1.25, center.y, center.z);
        sideGrid.material.transparent = true;
        sideGrid.material.opacity = 0;
        sideGrid.visible = false;
        scene.add(sideGrid);

        const cameraMarker = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 0.055, 18, 12),
          new THREE.MeshBasicMaterial({ color: 0xffe45c })
        );
        cameraMarker.visible = false;
        scene.add(cameraMarker);

        const targetMarker = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 0.035, 18, 12),
          new THREE.MeshBasicMaterial({ color: 0x5ee7ff })
        );
        targetMarker.visible = false;
        scene.add(targetMarker);

        const POSE_A = { camera: { x: 192, y: 66, z: 70 }, target: { x: 60, y: 0, z: 0 } };
        const POSE_B = { camera: { x: 217, y: 66, z: 175 }, target: { x: -82, y: -8, z: 0 } };
        const lerp = (a, b, t) => a + (b - a) * t;
        const rig = {
          cameraPct: { ...POSE_A.camera },
          targetPct: { ...POSE_A.target },
          progress: 0,
          goal: 0,
          setProgress(value, immediate = false) {
            rig.goal = clamp(value, 0, 1);
            if (immediate) rig.progress = rig.goal;
          },
          update() {
            rig.progress += (rig.goal - rig.progress) * 0.16;
            const t = rig.progress;
            rig.cameraPct = {
              x: lerp(POSE_A.camera.x, POSE_B.camera.x, t),
              y: lerp(POSE_A.camera.y, POSE_B.camera.y, t),
              z: lerp(POSE_A.camera.z, POSE_B.camera.z, t)
            };
            rig.targetPct = {
              x: lerp(POSE_A.target.x, POSE_B.target.x, t),
              y: lerp(POSE_A.target.y, POSE_B.target.y, t),
              z: lerp(POSE_A.target.z, POSE_B.target.z, t)
            };
            rig.apply(false);
          },
          apply(syncUi = true) {
            const cp = rig.cameraPct;
            const tp = rig.targetPct;
            const observer = center.clone().add(new THREE.Vector3(
              radius * cp.x / 100,
              radius * cp.y / 100,
              radius * cp.z / 100
            ));
            const target = center.clone().add(new THREE.Vector3(
              radius * tp.x / 100,
              radius * tp.y / 100,
              radius * tp.z / 100
            ));
            camera.position.copy(observer);
            camera.lookAt(target);
            camera.near = Math.max(0.05, radius * 0.01);
            camera.far = radius * 12;
            camera.updateProjectionMatrix();
            cameraMarker.position.copy(observer);
            targetMarker.position.copy(target);
            if (syncUi) setCoords({ ...cp, tx: tp.x, ty: tp.y, tz: tp.z });
          }
        };
        rigRef.current = rig;
        rig.apply();

        const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
        const swipe = { down: false, startX: 0, startY:0, moved:0, startProgress: 0 };
        const onDown = (event) => {
          swipe.down = true;
          swipe.startX = event.clientX;
          swipe.startY = event.clientY;
          swipe.moved = 0;
          swipe.startProgress = rig.goal;
          renderer.domElement.setPointerCapture?.(event.pointerId);
        };
        const onMove = (event) => {
          if (!swipe.down) return;
          const width = Math.max(1, host.clientWidth);
          const dx=event.clientX-swipe.startX, dy=event.clientY-swipe.startY;
          swipe.moved=Math.max(swipe.moved,Math.hypot(dx,dy));
          const delta = dx / (width * 0.72);
          rig.setProgress(swipe.startProgress + delta);
        };
        const onUp = (event) => {
          if (!swipe.down) return;
          swipe.down = false;
          if(swipe.moved<9){
            const rect=renderer.domElement.getBoundingClientRect();
            pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
            raycaster.setFromCamera(pointer,camera);
            const hit=raycaster.intersectObjects(clickableBuildings,true).find(h=>h.object.userData.moduleId);
            if(hit){ const id=hit.object.userData.moduleId; window.setTimeout(()=>onSelectModule?.(id),120); }
          }
          const snap = rig.goal < 0.25 ? 0 : rig.goal < 0.75 ? 0.5 : 1;
          rig.setProgress(snap);
          setPanoramaFrame(snap === 0 ? 1 : snap === 0.5 ? 2 : 3);
          const cp = {
            x: lerp(POSE_A.camera.x, POSE_B.camera.x, snap),
            y: lerp(POSE_A.camera.y, POSE_B.camera.y, snap),
            z: lerp(POSE_A.camera.z, POSE_B.camera.z, snap)
          };
          const tp = {
            x: lerp(POSE_A.target.x, POSE_B.target.x, snap),
            y: lerp(POSE_A.target.y, POSE_B.target.y, snap),
            z: lerp(POSE_A.target.z, POSE_B.target.z, snap)
          };
          setCoords({ ...cp, tx: tp.x, ty: tp.y, tz: tp.z });
        };
        renderer.domElement.addEventListener("pointerdown", onDown);
        renderer.domElement.addEventListener("pointermove", onMove);
        renderer.domElement.addEventListener("pointerup", onUp);
        renderer.domElement.addEventListener("pointercancel", onUp);
        cleanups.push(() => {
          renderer.domElement.removeEventListener("pointerdown", onDown);
          renderer.domElement.removeEventListener("pointermove", onMove);
          renderer.domElement.removeEventListener("pointerup", onUp);
          renderer.domElement.removeEventListener("pointercancel", onUp);
        });
      });

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
        rigRef.current?.update?.();
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
      };
      render();

      cleanups.push(() => {
        scene.traverse((item) => {
          item.geometry?.dispose?.();
          if (item.material) {
            const materials = Array.isArray(item.material) ? item.material : [item.material];
            materials.forEach((material) => material.dispose?.());
          }
        });
      });
    })();

    return () => {
      disposed = true;
      rigRef.current = null;
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      renderer?.dispose();
      if (hostRef.current) hostRef.current.replaceChildren();
    };
  }, []);

  return (
    <>
      <div ref={hostRef} style={styles.stationModel} aria-label="Калибровочная 3D-сцена станции" />
      <div style={styles.panoramaPanel}>
        <b>ПАНОРАМА {panoramaFrame} / 3</b>
        <span>СВАЙП ВПРАВО ИЛИ ВЛЕВО</span>
        <small>CAM {Math.round(coords.x)} / {Math.round(coords.y)} / {Math.round(coords.z)} · LOOK {Math.round(coords.tx)} / {Math.round(coords.ty)} / {Math.round(coords.tz)}</small>
        <div style={styles.frameDots}><i className={panoramaFrame === 1 ? "active" : ""}/><i className={panoramaFrame === 2 ? "active" : ""}/><i className={panoramaFrame === 3 ? "active" : ""}/></div>
      </div>
    </>
  );
}

function ModulePanel({ module, generation, onClose, onLaunchGame }) {
  const data = DETAILS[module.id];

  return (
    <div style={styles.panelShade} onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <section style={{ ...styles.panel, borderColor: `${module.color}66` }}>
        <header style={styles.panelHeader}>
          <button style={styles.backButton} onClick={onClose}>‹</button>
          <span style={{ ...styles.panelIcon, color: module.color }}>{module.icon}</span>
          <div><small>{module.subtitle}</small><b>{module.title}</b></div>
          <em>G{generation}</em>
        </header>

        <div style={styles.hero}>
          <small>SELECTED STATION SYSTEM</small>
          <h2>{data.heading}</h2>
          <p>{data.text}</p>
        </div>

        <div style={styles.metricGrid}>
          {data.metrics.map(([label, value]) => (
            <div key={label}><small>{label}</small><b>{value}</b></div>
          ))}
        </div>

        {module.id === "premium" ? (
          <div style={styles.packGrid}>
            {PREMIUM_TIERS.map(([tier, price, feature]) => (
              <div key={tier} style={styles.pack}>
                <b>{tier}</b><span>{price}</span><small>{feature}</small>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.detailRows}>
            {data.rows.map(([label, value]) => (
              <div key={label}><span>{label}</span><b>{value}</b></div>
            ))}
          </div>
        )}

        {module.id === "game" && (
          <button style={styles.launchButton} onClick={onLaunchGame}>ENTER PVP RIFT</button>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return <div><small>{label}</small><b>{value}</b></div>;
}


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const css = `
button { touch-action:manipulation; }

.frameDots i{width:7px;height:7px;border-radius:50%;background:#294354}.frameDots i.active{background:#67e8f9;box-shadow:0 0 10px #67e8f9}
@keyframes sectorPulse { 50% { filter:brightness(1.25); } }
@keyframes panelOpen { from { opacity:0; transform:translateY(24px) scale(.98); } to { opacity:1; transform:none; } }
.station-sector { transition:filter .2s ease, transform .2s ease, border-color .2s ease; }
.station-sector:active { transform:translate(-50%,-50%) scale(.95); }
.station-sector .sector-name { opacity:0; transform:translate(-50%,8px); transition:.2s ease; }
.station-sector:hover .sector-name,.station-sector:focus .sector-name { opacity:1; transform:translate(-50%,0); }
.sector-building { position:absolute; inset:13%; border-radius:50%; display:grid; place-items:center; border:1px solid currentColor; background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.18),rgba(2,8,18,.54) 55%,rgba(1,4,12,.82)); box-shadow:0 0 18px currentColor; animation:sectorPulse 2.8s ease-in-out infinite; }
.sector-building:before,.sector-building:after { content:""; position:absolute; border:1px solid currentColor; border-radius:50%; opacity:.38; }
.sector-building:before { inset:-8px; border-style:dashed; }
.sector-building:after { inset:6px; border-left-color:transparent; border-right-color:transparent; }
.sector-building i { font-style:normal; font-size:18px; text-shadow:0 0 13px currentColor; }
.sector-name { position:absolute; left:50%; top:96%; min-width:108px; padding:7px 9px; border-radius:11px; background:rgba(2,7,17,.84); border:1px solid rgba(255,255,255,.12); backdrop-filter:blur(12px); display:flex; flex-direction:column; pointer-events:none; z-index:4; }
.sector-name b { font-size:10px; }.sector-name small { font-size:7px; color:rgba(226,232,240,.66); }
.sector-hangar { border-radius:25% 25% 40% 40% !important; }
.sector-gate .sector-building { border-width:3px; }
.sector-citadel .sector-building { transform:scale(1.18); }
.identity small,.generation small,.stats small,.panelHeader small,.hero small,.metricGrid small,.pack small{font-size:7px;letter-spacing:.1em;color:rgba(203,213,225,.62);font-weight:900}
.identity strong{font-size:14px}.generation b{font-size:13px}
.stats>div{min-width:59px;padding:6px 8px;border-radius:11px;background:rgba(2,10,23,.72);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(15px);display:flex;flex-direction:column}.stats b{font-size:12px}
.cameraRail>div{height:3px;position:relative;border-radius:99px;background:linear-gradient(90deg,rgba(34,211,238,.5),rgba(167,139,250,.6),rgba(251,113,133,.5))}.cameraRail i{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:#e0f2fe;box-shadow:0 0 14px #67e8f9}
.panelHeader>div{display:flex;flex-direction:column}.panelHeader em{font-style:normal;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.05);font-size:9px}.hero h2{margin:5px 0 6px;font-size:20px}.hero p{margin:0;color:rgba(226,232,240,.66);font-size:12px;line-height:1.5}.metricGrid>div{min-height:52px;padding:8px;border-radius:13px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;justify-content:center}.metricGrid b{font-size:11px}.detailRows>div{min-height:35px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,.055);font-size:10px}.detailRows span{color:#94a3b8}.pack b{font-size:11px}.pack span{font-size:10px;color:#d1fae5}
`;

const styles = {
  root:{ position:"fixed", inset:0, zIndex:180, overflow:"hidden", background:"#010207", color:"#f2fbff", fontFamily:"Inter,system-ui,-apple-system,'Segoe UI',sans-serif" },
  viewport:{ position:"absolute", inset:0, overflow:"hidden", touchAction:"none", userSelect:"none", background:"#010207" },
  world:{ position:"absolute", top:0, bottom:0, left:0, height:"100%", transformOrigin:"left center", transition:"transform .08s linear", willChange:"transform" },
  stationModel:{ position:"absolute", inset:0, width:"100%", height:"100%", background:"radial-gradient(circle at 48% 42%,#07152b 0,#020713 42%,#010207 76%)", touchAction:"none" },
  sector:{ position:"absolute", width:68, height:68, transform:"translate(-50%,-50%)", padding:0, border:"1px solid", borderRadius:"50%", background:"rgba(2,8,18,.08)", color:"white", cursor:"pointer" },
  header:{ position:"absolute", zIndex:70, top:"max(10px, env(safe-area-inset-top))", left:10, right:10, height:54, display:"grid", gridTemplateColumns:"42px 1fr auto", gap:10, alignItems:"center", padding:"0 10px", borderRadius:18, background:"linear-gradient(135deg,rgba(2,10,23,.78),rgba(11,8,30,.64))", border:"1px solid rgba(175,232,255,.16)", backdropFilter:"blur(22px)", boxShadow:"0 18px 55px rgba(0,0,0,.3)" },
  backButton:{ width:36, height:36, padding:0, borderRadius:12, border:"1px solid rgba(255,255,255,.14)", background:"rgba(255,255,255,.055)", color:"white", fontSize:27, cursor:"pointer" },
  identity:{ minWidth:0, display:"flex", flexDirection:"column" },
  generation:{ minWidth:66, height:39, borderRadius:12, border:"1px solid rgba(103,232,249,.2)", background:"rgba(4,31,46,.5)", color:"#e0fbff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer" },
  stats:{ position:"absolute", zIndex:75, top:"calc(max(10px, env(safe-area-inset-top)) + 64px)", left:10, display:"flex", gap:5 },
  cameraHint:{ position:"absolute", zIndex:60, left:"50%", bottom:"max(18px, env(safe-area-inset-bottom))", transform:"translateX(-50%)", padding:"7px 11px", borderRadius:10, background:"rgba(2,10,23,.62)", border:"1px solid rgba(103,232,249,.13)", color:"rgba(226,232,240,.58)", fontSize:7, letterSpacing:".1em", pointerEvents:"none" },
  panel:{ width:"100%", maxHeight:"68vh", overflowY:"auto", padding:12, borderRadius:"24px 24px 16px 16px", background:"linear-gradient(180deg,rgba(7,22,42,.97),rgba(2,7,17,.99))", border:"1px solid", boxShadow:"0 -28px 90px rgba(0,0,0,.8)", animation:"panelOpen .38s ease-out" },
  panelHeader:{ display:"grid", gridTemplateColumns:"38px 40px 1fr auto", gap:8, alignItems:"center", marginBottom:10 },
  panelIcon:{ width:38, height:38, borderRadius:12, display:"grid", placeItems:"center", background:"rgba(255,255,255,.05)", fontSize:20 },
  hero:{ padding:14, borderRadius:17, background:"radial-gradient(circle at 100% 0,rgba(103,232,249,.15),transparent 38%),rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.075)", marginBottom:9 },
  metricGrid:{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:6 },
  detailRows:{ marginTop:9, padding:"4px 12px", borderRadius:15, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)" },
  packGrid:{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:7, marginTop:9 },
  pack:{ padding:11, borderRadius:14, background:"rgba(52,211,153,.06)", border:"1px solid rgba(52,211,153,.17)", display:"flex", flexDirection:"column" },
  launchButton:{ width:"100%", height:50, marginTop:10, border:0, borderRadius:15, background:"linear-gradient(135deg,#e11d48,#7c3aed,#0891b2)", color:"white", fontWeight:950, letterSpacing:".08em", boxShadow:"0 0 34px rgba(225,29,72,.25)" },
};
