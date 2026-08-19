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
              .intersectObjects(buildings.clickableBuildings, true)
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
            const returning = cameraMotion.returning;
            cameraMotion = null;
            reportState(returning ? "home" : "focused");
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
