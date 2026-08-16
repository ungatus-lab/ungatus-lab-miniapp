"use client";

import { useEffect, useRef, useState } from "react";
import {
  CAMERA_POSES,
  OBSERVER_POSITION,
  OBSERVER_LATERAL_SHIFT,
  OBSERVER_SCREEN_DOWN_SHIFT,
  OBSERVER_TO_BEAM_FRACTION,
  OBSERVER_TO_FRAME_SEAM_STEP,
  INITIAL_LOOK_TARGET,
  HEAD_ROTATION,
  LOOK_TARGETS,
  SPACE_OBJECTS,
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
    ...OBSERVER_POSITION,
    tx: HEAD_ROTATION.startYawDeg,
    ty: 0,
    tz: 0,
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

      // Deep-space environment: layered stars, giant sun and a distant PvP rift.
      const spaceRoot = new THREE.Group();
      scene.add(spaceRoot);

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
        const material = new THREE.PointsMaterial({
          color,
          size,
          transparent: true,
          opacity,
          sizeAttenuation: true,
          depthWrite: false,
        });
        return new THREE.Points(geometry, material);
      }

      const farStars = createStarLayer(900, 175, 0.28, 0xb8d7ff, 0.72);
      const nearStars = createStarLayer(260, 105, 0.48, 0xffffff, 0.88);
      spaceRoot.add(farStars, nearStars);

      const sunRoot = new THREE.Group();
      sunRoot.position.set(-78, 48, -96);
      const sunCore = new THREE.Mesh(
        new THREE.SphereGeometry(15, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0xffe0a0 })
      );
      const sunHalo = new THREE.Mesh(
        new THREE.SphereGeometry(22, 40, 28),
        new THREE.MeshBasicMaterial({
          color: 0xff8a35,
          transparent: true,
          opacity: 0.11,
          depthWrite: false,
          side: THREE.BackSide,
        })
      );
      const sunCorona = new THREE.Mesh(
        new THREE.SphereGeometry(30, 36, 24),
        new THREE.MeshBasicMaterial({
          color: 0xff5d57,
          transparent: true,
          opacity: 0.035,
          depthWrite: false,
          side: THREE.BackSide,
        })
      );
      sunRoot.add(sunCore, sunHalo, sunCorona);
      spaceRoot.add(sunRoot);

      const riftRoot = new THREE.Group();
      riftRoot.position.set(68, 5, -115);
      riftRoot.rotation.x = Math.PI / 2.35;
      const riftOuter = new THREE.Mesh(
        new THREE.TorusGeometry(12, 1.15, 18, 72),
        new THREE.MeshBasicMaterial({
          color: 0xff416c,
          transparent: true,
          opacity: 0.62,
          depthWrite: false,
        })
      );
      const riftInner = new THREE.Mesh(
        new THREE.TorusGeometry(8.7, 0.34, 12, 64),
        new THREE.MeshBasicMaterial({
          color: 0x8f6bff,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
        })
      );
      riftRoot.add(riftOuter, riftInner);
      spaceRoot.add(riftRoot);

      const sunLight = new THREE.DirectionalLight(0xffb56b, 0.55);
      sunLight.position.copy(sunRoot.position);
      scene.add(sunLight);

      scene.add(new THREE.HemisphereLight(0xbfe8ff, 0x07101f, 1.45));

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

          // Fixed world-space observer, close to sector 9.
          const observerWorld = center.clone().add(new THREE.Vector3(
            radius * OBSERVER_POSITION.x / 100,
            radius * OBSERVER_POSITION.y / 100,
            radius * OBSERVER_POSITION.z / 100
          ));
          const initialTarget = center.clone().add(new THREE.Vector3(
            radius * INITIAL_LOOK_TARGET.x / 100,
            radius * INITIAL_LOOK_TARGET.y / 100,
            radius * INITIAL_LOOK_TARGET.z / 100
          ));

          // Parallel translation to screen-right. Target follows by the same amount,
          // preserving direction, distance, height and all panorama angles.
          const initialDirection = initialTarget.clone()
            .sub(observerWorld)
            .normalize();
          const screenRight = new THREE.Vector3()
            .crossVectors(initialDirection, camera.up)
            .normalize();
          const lateralShift = screenRight.multiplyScalar(
            radius * OBSERVER_LATERAL_SHIFT
          );
          const screenUp = new THREE.Vector3()
            .crossVectors(screenRight, initialDirection)
            .normalize();
          const screenDownShift = screenUp.multiplyScalar(
            -radius * OBSERVER_SCREEN_DOWN_SHIFT
          );
          const screenShift = lateralShift.add(screenDownShift);
          observerWorld.add(screenShift);
          initialTarget.add(screenShift);

          // Exact A -> B move from the observer toward the marked beam center.
          // The target stays fixed. No orbit, no sideways drift and no radius-based direction.
          observerWorld.lerp(initialTarget, OBSERVER_TO_BEAM_FRACTION);

          camera.position.copy(observerWorld);
          camera.lookAt(initialTarget);
          const baseQuaternion = camera.quaternion.clone();

          // Exact old middle frame becomes the new start: yaw 45 degrees.
          const startYawQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            THREE.MathUtils.degToRad(HEAD_ROTATION.startYawDeg)
          );
          const endYawQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            THREE.MathUtils.degToRad(HEAD_ROTATION.endYawDeg)
          );
          const startPitchQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            THREE.MathUtils.degToRad(HEAD_ROTATION.pitchLiftDeg * 0.5)
          );
          const endPitchQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            THREE.MathUtils.degToRad(HEAD_ROTATION.pitchLiftDeg)
          );
          const startQuaternion = baseQuaternion.clone()
            .premultiply(startYawQuaternion)
            .multiply(startPitchQuaternion);
          const endQuaternion = baseQuaternion.clone()
            .premultiply(endYawQuaternion)
            .multiply(endPitchQuaternion);

          // Destination is the angular seam between frame 1 left edge
          // and frame 2 right edge. Move only the observer by the same
          // absolute approach step used previously; keep gaze angles unchanged.
          const middleQuaternion = new THREE.Quaternion().slerpQuaternions(
            startQuaternion,
            endQuaternion,
            0.5
          );
          const halfVerticalFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
          const halfHorizontalFov = Math.atan(
            Math.tan(halfVerticalFov) * camera.aspect
          );
          const frame1LeftDirection = new THREE.Vector3(
            -Math.tan(halfHorizontalFov), 0, -1
          ).normalize().applyQuaternion(startQuaternion);
          const frame2RightDirection = new THREE.Vector3(
            Math.tan(halfHorizontalFov), 0, -1
          ).normalize().applyQuaternion(middleQuaternion);
          const seamDirection = frame1LeftDirection
            .add(frame2RightDirection)
            .normalize();
          const seamStepDistance =
            observerWorld.distanceTo(initialTarget) * OBSERVER_TO_FRAME_SEAM_STEP;
          observerWorld.addScaledVector(seamDirection, seamStepDistance);

          // Preserve the approved gaze; only the observer position changes.
          camera.position.copy(observerWorld);
          camera.quaternion.copy(startQuaternion);

          // Place the sun in the final left-looking horizon. Hide the temporary rift.
          const endDirection = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(endQuaternion)
            .normalize();
          const endRight = new THREE.Vector3()
            .crossVectors(endDirection, camera.up)
            .normalize();
          const endUp = new THREE.Vector3()
            .crossVectors(endRight, endDirection)
            .normalize();

          sunRoot.position.copy(observerWorld)
            .addScaledVector(endDirection, radius * SPACE_OBJECTS.sun.distance)
            .addScaledVector(endRight, radius * SPACE_OBJECTS.sun.sideOffset)
            .addScaledVector(endUp, radius * SPACE_OBJECTS.sun.heightOffset);
          sunRoot.scale.setScalar((radius * SPACE_OBJECTS.sun.radius) / 15);
          sunLight.position.copy(sunRoot.position);
          riftRoot.visible = false;

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
            setProgress(value, immediate = false) {
              rig.goal = clamp(value, 0, 1);
              if (immediate) rig.progress = rig.goal;
            },
            update() {
              rig.progress +=
                (rig.goal - rig.progress) * SCENE_CONFIG.swipeSmoothing;
              camera.position.copy(observerWorld);
              camera.quaternion.slerpQuaternions(
                startQuaternion,
                endQuaternion,
                rig.progress
              );
            },
          };
          rigRef.current = rig;
          rig.update();

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
                dx / (width * 0.58)
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

            setCoords({
              ...OBSERVER_POSITION,
              tx: Math.round(
                HEAD_ROTATION.startYawDeg +
                (HEAD_ROTATION.endYawDeg - HEAD_ROTATION.startYawDeg) * snap
              ),
              ty: Math.round(
                HEAD_ROTATION.pitchLiftDeg * (0.5 + 0.5 * snap)
              ),
              tz: 0,
            });
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
        const panorama = rigRef.current?.progress || 0;
        farStars.rotation.y = panorama * 0.035;
        nearStars.rotation.y = panorama * 0.08;
        riftOuter.rotation.z += 0.0018;
        riftInner.rotation.z -= 0.0026;
        const pulse = 1 + Math.sin(performance.now() * 0.0015) * 0.035;
        sunHalo.scale.setScalar(pulse);
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
          {Math.round(coords.z)} · YAW {Math.round(coords.tx)}° · PITCH {Math.round(coords.ty)}°
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
      "radial-gradient(circle at 18% 28%,rgba(79,32,97,.32),transparent 28%), radial-gradient(circle at 78% 48%,rgba(13,69,105,.24),transparent 36%), linear-gradient(180deg,#020611 0%,#010207 72%)",
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
