"use client";

import { useEffect, useRef } from "react";
import {
  HOME_VIEW,
  SCENE_CONFIG,
  SPACE_OBJECTS,
  STATION_MODEL_URL,
} from "./stationConfig";
import {
  createStationBuildings,
  pulseStationBuilding,
} from "./stationBuildings";

export default function StationThreeView({ onSelectModule }) {
  const hostRef = useRef(null);

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
      renderer.toneMappingExposure = 1.02;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "manipulation";
      host.appendChild(renderer.domElement);

      const initialWidth = Math.max(1, host.clientWidth);
      const initialHeight = Math.max(1, host.clientHeight);
      camera.aspect = initialWidth / initialHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(initialWidth, initialHeight, false);

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
            color,
            size,
            transparent: true,
            opacity,
            sizeAttenuation: true,
            depthWrite: false,
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
          color: 0xff8a35,
          transparent: true,
          opacity: 0.065,
          depthWrite: false,
          side: THREE.BackSide,
        })
      );
      const sunCorona = new THREE.Mesh(
        new THREE.SphereGeometry(30, 36, 24),
        new THREE.MeshBasicMaterial({
          color: 0xff5d57,
          transparent: true,
          opacity: 0.018,
          depthWrite: false,
          side: THREE.BackSide,
        })
      );
      sunRoot.add(sunCore, sunHalo, sunCorona);
      scene.add(sunRoot);

      const sunLight = new THREE.DirectionalLight(0xffb56b, 1.35);
      scene.add(sunLight);
      scene.add(new THREE.HemisphereLight(0xaed8ff, 0x101824, 1.65));
      scene.add(new THREE.AmbientLight(0x60758d, 0.42));

      const keyLight = new THREE.DirectionalLight(0xc8e6ff, 0.0);
      keyLight.position.set(8, 18, 16);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x4aa8ff, 0.0);
      rimLight.position.set(-14, 7, -10);
      scene.add(rimLight);

      new GLTFLoader().load(
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

          // Conservative graphite skin: preserve the GLB materials and textures,
          // tint them instead of replacing the entire station with black materials.
          station.traverse((object) => {
            if (!object.isMesh || !object.material) return;
            const originals = Array.isArray(object.material)
              ? object.material
              : [object.material];
            const tinted = originals.map((source) => {
              const material = source.clone();
              const sourceColor = material.color?.clone?.() || new THREE.Color(0x8b98a6);
              const luminance =
                sourceColor.r * 0.2126 +
                sourceColor.g * 0.7152 +
                sourceColor.b * 0.0722;
              const target = luminance > 0.58
                ? new THREE.Color(0x63798f)
                : new THREE.Color(0x2b4055);
              material.color = sourceColor.lerp(target, 0.52);
              if ("metalness" in material) material.metalness = Math.max(material.metalness || 0, 0.58);
              if ("roughness" in material) material.roughness = 0.34;
              if ("emissive" in material) {
                material.emissive = new THREE.Color(luminance > 0.7 ? 0x071725 : 0x02070d);
                material.emissiveIntensity = luminance > 0.7 ? 0.13 : 0.055;
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
          const target = center.clone().add(
            new THREE.Vector3(0, radius * HOME_VIEW.targetHeight, 0)
          );
          camera.position.copy(target).addScaledVector(
            direction,
            radius * HOME_VIEW.distance
          );
          camera.lookAt(target);
          camera.near = Math.max(0.05, radius * 0.01);
          camera.far = radius * 20;
          camera.updateProjectionMatrix();

          const forward = target.clone().sub(camera.position).normalize();
          const right = new THREE.Vector3()
            .crossVectors(forward, camera.up)
            .normalize();
          const up = new THREE.Vector3()
            .crossVectors(right, forward)
            .normalize();

          sunRoot.position.copy(camera.position)
            .addScaledVector(forward, radius * SPACE_OBJECTS.sun.distance)
            .addScaledVector(right, radius * SPACE_OBJECTS.sun.sideOffset)
            .addScaledVector(up, radius * SPACE_OBJECTS.sun.heightOffset);
          sunRoot.scale.setScalar((radius * SPACE_OBJECTS.sun.radius) / 15);
          sunLight.position.copy(sunRoot.position);
          sunLight.target.position.copy(center);
          scene.add(sunLight.target);

          // Deterministic light rig: one warm sun-side fill and one soft
          // camera-facing fill. Directional lights avoid distance falloff.
          const leftFill = new THREE.DirectionalLight(0xffc58a, 1.05);
          leftFill.position.copy(center)
            .addScaledVector(right, -radius * 3.2)
            .addScaledVector(up, radius * 2.2)
            .addScaledVector(forward, -radius * 1.1);
          leftFill.target.position.copy(center);
          scene.add(leftFill, leftFill.target);

          const frontFill = new THREE.DirectionalLight(0x8fc8ff, 0.72);
          frontFill.position.copy(camera.position);
          frontFill.target.position.copy(center);
          scene.add(frontFill, frontFill.target);

          const coreFill = new THREE.PointLight(0x9fddff, 0.55, radius * 5.5, 1.2);
          coreFill.position.copy(center).addScaledVector(up, radius * 1.3);
          scene.add(coreFill);

          const buildings = createStationBuildings({
            THREE,
            station,
            bounds,
            center,
          });
          scene.add(buildings.root);

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
            if (moved > SCENE_CONFIG.tapThresholdPx) return;

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
            window.setTimeout(() => onSelectModule?.(moduleId), 120);
          };

          renderer.domElement.addEventListener("pointerdown", onPointerDown);
          renderer.domElement.addEventListener("pointerup", onPointerUp);
          renderer.domElement.addEventListener("pointercancel", () => {
            pointerDown = null;
          });

          cleanups.push(() => {
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            renderer.domElement.removeEventListener("pointerup", onPointerUp);
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
        farStars.rotation.y += 0.000015;
        nearStars.rotation.y += 0.00003;
        const pulse = 1 + Math.sin(performance.now() * 0.0014) * 0.025;
        sunHalo.scale.setScalar(pulse);
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
      };
      render();

      cleanups.push(() => {
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          const materials = object.material
            ? Array.isArray(object.material)
              ? object.material
              : [object.material]
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
  }, [onSelectModule]);

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
