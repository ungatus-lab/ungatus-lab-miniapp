"use client";

import { useEffect, useRef, useState } from "react";
import {
  CAMERA_POSES,
  SCENE_CONFIG,
  STATION_MODEL_URL,
} from "./stationConfig";
import {
  createStationBuildings,
  pulseStationBuilding,
} from "./stationBuildings";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolatePose(start, end, t) {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
    z: lerp(start.z, end.z, t),
  };
}

export default function StationThreeView({ onSelectModule }) {
  const hostRef = useRef(null);
  const rigRef = useRef(null);
  const [coords, setCoords] = useState({
    ...CAMERA_POSES.start.camera,
    tx: CAMERA_POSES.start.target.x,
    ty: CAMERA_POSES.start.target.y,
    tz: CAMERA_POSES.start.target.z,
  });
  const [panoramaFrame, setPanoramaFrame] = useState(1);

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
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(
        SCENE_CONFIG.cameraFov,
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

      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(8, 18, 16);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x65baff, 2);
      rimLight.position.set(-14, 7, -10);
      scene.add(rimLight);

      const loader = new GLTFLoader();
      loader.load(
        STATION_MODEL_URL,
        (gltf) => {
          if (disposed) return;

          const station = gltf.scene;
          station.rotation.x = -Math.PI / 2;
          scene.add(station);
          station.updateMatrixWorld(true);

          const bounds = new THREE.Box3().setFromObject(station);
          const center = bounds.getCenter(new THREE.Vector3());
          const sphere = bounds.getBoundingSphere(new THREE.Sphere());
          const radius = sphere.radius;

          const buildings = createStationBuildings({
            THREE,
            station,
            bounds,
            center,
          });
          scene.add(buildings.root);

          const rig = {
            progress: 0,
            goal: 0,
            cameraPct: { ...CAMERA_POSES.start.camera },
            targetPct: { ...CAMERA_POSES.start.target },

            setProgress(value, immediate = false) {
              rig.goal = clamp(value, 0, 1);
              if (immediate) rig.progress = rig.goal;
            },

            update() {
              rig.progress +=
                (rig.goal - rig.progress) * SCENE_CONFIG.swipeSmoothing;

              rig.cameraPct = interpolatePose(
                CAMERA_POSES.start.camera,
                CAMERA_POSES.end.camera,
                rig.progress
              );
              rig.targetPct = interpolatePose(
                CAMERA_POSES.start.target,
                CAMERA_POSES.end.target,
                rig.progress
              );
              rig.apply(false);
            },

            apply(syncUi = true) {
              const cp = rig.cameraPct;
              const tp = rig.targetPct;

              camera.position.copy(
                center.clone().add(
                  new THREE.Vector3(
                    (radius * cp.x) / 100,
                    (radius * cp.y) / 100,
                    (radius * cp.z) / 100
                  )
                )
              );

              const target = center.clone().add(
                new THREE.Vector3(
                  (radius * tp.x) / 100,
                  (radius * tp.y) / 100,
                  (radius * tp.z) / 100
                )
              );

              camera.lookAt(target);
              camera.near = Math.max(0.05, radius * 0.01);
              camera.far = radius * 12;
              camera.updateProjectionMatrix();

              if (syncUi) {
                setCoords({
                  ...cp,
                  tx: tp.x,
                  ty: tp.y,
                  tz: tp.z,
                });
              }
            },
          };

          rigRef.current = rig;
          rig.apply();

          const raycaster = new THREE.Raycaster();
          const pointer = new THREE.Vector2();
          const swipe = {
            down: false,
            startX: 0,
            startY: 0,
            moved: 0,
            startProgress: 0,
          };

          const onPointerDown = (event) => {
            swipe.down = true;
            swipe.startX = event.clientX;
            swipe.startY = event.clientY;
            swipe.moved = 0;
            swipe.startProgress = rig.goal;
            renderer.domElement.setPointerCapture?.(event.pointerId);
          };

          const onPointerMove = (event) => {
            if (!swipe.down) return;

            const dx = event.clientX - swipe.startX;
            const dy = event.clientY - swipe.startY;
            swipe.moved = Math.max(swipe.moved, Math.hypot(dx, dy));

            const width = Math.max(1, host.clientWidth);
            rig.setProgress(
              swipe.startProgress +
                dx / (width * SCENE_CONFIG.swipeDistanceFactor)
            );
          };

          const onPointerUp = (event) => {
            if (!swipe.down) return;
            swipe.down = false;

            if (swipe.moved < SCENE_CONFIG.tapThresholdPx) {
              const rect = renderer.domElement.getBoundingClientRect();
              pointer.set(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
              );

              raycaster.setFromCamera(pointer, camera);
              const hit = raycaster
                .intersectObjects(buildings.clickableBuildings, true)
                .find((result) => result.object.userData.moduleId);

              if (hit) {
                const moduleId = hit.object.userData.moduleId;
                pulseStationBuilding(buildings.moduleGroups, moduleId);
                window.setTimeout(() => onSelectModule?.(moduleId), 120);
              }
            }

            const snap = rig.goal < 0.25 ? 0 : rig.goal < 0.75 ? 0.5 : 1;
            rig.setProgress(snap);
            setPanoramaFrame(snap === 0 ? 1 : snap === 0.5 ? 2 : 3);

            const cp = interpolatePose(
              CAMERA_POSES.start.camera,
              CAMERA_POSES.end.camera,
              snap
            );
            const tp = interpolatePose(
              CAMERA_POSES.start.target,
              CAMERA_POSES.end.target,
              snap
            );
            setCoords({ ...cp, tx: tp.x, ty: tp.y, tz: tp.z });
          };

          renderer.domElement.addEventListener("pointerdown", onPointerDown);
          renderer.domElement.addEventListener("pointermove", onPointerMove);
          renderer.domElement.addEventListener("pointerup", onPointerUp);
          renderer.domElement.addEventListener("pointercancel", onPointerUp);

          cleanups.push(() => {
            renderer.domElement.removeEventListener(
              "pointerdown",
              onPointerDown
            );
            renderer.domElement.removeEventListener(
              "pointermove",
              onPointerMove
            );
            renderer.domElement.removeEventListener("pointerup", onPointerUp);
            renderer.domElement.removeEventListener(
              "pointercancel",
              onPointerUp
            );
          });
        },
        undefined,
        (error) => {
          console.error("Station GLB load failed", error);
        }
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
        rigRef.current?.update?.();
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
      };
      render();

      cleanups.push(() => {
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          if (object.material) {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
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
  }, [onSelectModule]);

  return (
    <>
      <div
        ref={hostRef}
        style={styles.stationModel}
        aria-label="Интерактивная 3D-сцена орбитальной станции"
      />

      <div style={styles.panoramaPanel}>
        <b>ПАНОРАМА {panoramaFrame} / 3</b>
        <span>СВАЙП ВПРАВО ИЛИ ВЛЕВО</span>
        <small>
          CAM {Math.round(coords.x)} / {Math.round(coords.y)} /{" "}
          {Math.round(coords.z)} · LOOK {Math.round(coords.tx)} /{" "}
          {Math.round(coords.ty)} / {Math.round(coords.tz)}
        </small>
        <div style={styles.frameDots}>
          <i className={panoramaFrame === 1 ? "active" : ""} />
          <i className={panoramaFrame === 2 ? "active" : ""} />
          <i className={panoramaFrame === 3 ? "active" : ""} />
        </div>
      </div>
    </>
  );
}

const styles = {
  stationModel: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at 48% 42%,#07152b 0,#020713 42%,#010207 76%)",
    touchAction: "none",
  },
  panoramaPanel: {
    position: "absolute",
    zIndex: 85,
    left: "50%",
    bottom: "calc(max(18px, env(safe-area-inset-bottom)) + 54px)",
    transform: "translateX(-50%)",
    minWidth: 250,
    padding: "9px 12px",
    borderRadius: 14,
    display: "grid",
    gap: 3,
    textAlign: "center",
    background: "rgba(1,7,17,.82)",
    border: "1px solid rgba(94,231,255,.25)",
    backdropFilter: "blur(10px)",
    pointerEvents: "none",
    fontSize: 9,
    color: "#bcecff",
  },
  frameDots: {
    display: "flex",
    justifyContent: "center",
    gap: 7,
    marginTop: 3,
  },
};
