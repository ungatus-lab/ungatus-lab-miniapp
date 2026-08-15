import { MODULE_ANCHORS, MODULE_BY_ID, SCENE_CONFIG } from "./stationConfig";

function createBodyMaterial(THREE, color) {
  return new THREE.MeshStandardMaterial({
    color: 0x0d1b2a,
    metalness: 0.86,
    roughness: 0.34,
    emissive: color,
    emissiveIntensity: 0.16,
  });
}

function createGlowMaterial(THREE, color) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.66,
    depthWrite: false,
  });
}

function addMesh(group, geometry, material, y = 0) {
  const mesh = new group.userData.THREE.Mesh(geometry, material);
  mesh.position.y = y;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  group.add(mesh);
  return mesh;
}

function markModule(group, moduleId) {
  group.traverse((object) => {
    object.userData.moduleId = moduleId;
  });
}

function createModuleBuilding(THREE, module, modelScale) {
  const group = new THREE.Group();
  group.name = `Module_${module.id}`;
  group.userData.THREE = THREE;
  group.userData.moduleId = module.id;

  const baseRadius = modelScale * SCENE_CONFIG.buildingScale;
  const baseHeight = baseRadius * 0.22;
  const body = createBodyMaterial(THREE, module.colorHex);
  const glow = createGlowMaterial(THREE, module.colorHex);

  // Основание намеренно опущено ниже локального нуля.
  // После установки ноль группы совпадает с поверхностью станции,
  // поэтому часть основания выглядит встроенной в корпус.
  addMesh(
    group,
    new THREE.CylinderGeometry(baseRadius, baseRadius * 1.08, baseHeight, 24),
    body,
    -baseHeight * 0.18
  );

  const ring = addMesh(
    group,
    new THREE.TorusGeometry(baseRadius * 0.82, baseRadius * 0.055, 8, 28),
    glow,
    baseHeight * 0.38
  );
  ring.rotation.x = Math.PI / 2;

  if (module.type === "hangar") {
    addMesh(
      group,
      new THREE.BoxGeometry(baseRadius * 1.22, baseRadius * 0.38, baseRadius * 0.82),
      body,
      baseRadius * 0.18
    );
  } else if (module.type === "dish") {
    addMesh(
      group,
      new THREE.CylinderGeometry(baseRadius * 0.15, baseRadius * 0.25, baseRadius * 0.42, 16),
      body,
      baseRadius * 0.21
    );
    const dish = addMesh(
      group,
      new THREE.SphereGeometry(baseRadius * 0.48, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2),
      body,
      baseRadius * 0.48
    );
    dish.scale.y = 0.25;
  } else if (module.type === "twins") {
    [-0.3, 0.3].forEach((offset) => {
      const tower = addMesh(
        group,
        new THREE.CylinderGeometry(baseRadius * 0.17, baseRadius * 0.23, baseRadius * 0.65, 14),
        body,
        baseRadius * 0.32
      );
      tower.position.x = offset * baseRadius;
    });
    addMesh(
      group,
      new THREE.BoxGeometry(baseRadius * 0.78, baseRadius * 0.08, baseRadius * 0.08),
      glow,
      baseRadius * 0.4
    );
  } else if (module.type === "gate") {
    [-0.36, 0.36].forEach((offset) => {
      const post = addMesh(
        group,
        new THREE.BoxGeometry(baseRadius * 0.16, baseRadius * 0.72, baseRadius * 0.22),
        body,
        baseRadius * 0.36
      );
      post.position.x = offset * baseRadius;
    });
    addMesh(
      group,
      new THREE.BoxGeometry(baseRadius * 0.9, baseRadius * 0.14, baseRadius * 0.22),
      glow,
      baseRadius * 0.68
    );
  } else if (module.type === "reactor") {
    addMesh(
      group,
      new THREE.CylinderGeometry(baseRadius * 0.38, baseRadius * 0.52, baseRadius * 0.42, 20),
      body,
      baseRadius * 0.2
    );
    addMesh(
      group,
      new THREE.IcosahedronGeometry(baseRadius * 0.27, 1),
      glow,
      baseRadius * 0.48
    );
  } else if (module.type === "vault") {
    addMesh(
      group,
      new THREE.BoxGeometry(baseRadius * 0.92, baseRadius * 0.44, baseRadius * 0.74),
      body,
      baseRadius * 0.21
    );
  } else if (module.type === "citadel") {
    addMesh(
      group,
      new THREE.CylinderGeometry(baseRadius * 0.24, baseRadius * 0.42, baseRadius * 0.72, 18),
      body,
      baseRadius * 0.35
    );
    addMesh(
      group,
      new THREE.ConeGeometry(baseRadius * 0.17, baseRadius * 0.4, 14),
      glow,
      baseRadius * 0.82
    );
  } else {
    addMesh(
      group,
      new THREE.CylinderGeometry(baseRadius * 0.11, baseRadius * 0.25, baseRadius * 0.58, 14),
      body,
      baseRadius * 0.28
    );
    addMesh(
      group,
      new THREE.OctahedronGeometry(baseRadius * 0.2),
      glow,
      baseRadius * 0.66
    );
  }

  const hitArea = addMesh(
    group,
    new THREE.CylinderGeometry(baseRadius * 1.18, baseRadius * 1.18, baseRadius * 1.15, 14),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    baseRadius * 0.38
  );
  hitArea.name = `HitArea_${module.id}`;

  markModule(group, module.id);
  delete group.userData.THREE;
  return group;
}

function getDiskRadius(bounds) {
  const size = bounds.getSize(bounds.min.clone());
  return Math.min(size.x, size.z) * 0.5;
}

function findSurfaceHit(THREE, station, x, z, bounds, diskRadius) {
  const raycaster = new THREE.Raycaster();
  const origin = new THREE.Vector3(x, bounds.max.y + diskRadius, z);
  raycaster.set(origin, new THREE.Vector3(0, -1, 0));

  return raycaster
    .intersectObject(station, true)
    .find((hit) => hit.face && hit.object.visible !== false);
}

export function createStationBuildings({ THREE, station, bounds, center }) {
  const root = new THREE.Group();
  root.name = "StationModuleBuildings";

  const clickableBuildings = [];
  const moduleGroups = new Map();
  const diskRadius = getDiskRadius(bounds);

  MODULE_ANCHORS.forEach((anchor) => {
    const module = MODULE_BY_ID[anchor.id];
    if (!module) return;

    const angle = THREE.MathUtils.degToRad(anchor.angle);
    const x = center.x + Math.cos(angle) * diskRadius * anchor.ring;
    const z = center.z + Math.sin(angle) * diskRadius * anchor.ring;
    const hit = findSurfaceHit(THREE, station, x, z, bounds, diskRadius);

    // Не создаём объект без подтверждённой поверхности.
    if (!hit) return;

    const building = createModuleBuilding(THREE, module, diskRadius);
    building.position.set(x, hit.point.y, z);
    building.rotation.y = -angle + Math.PI / 2;
    building.userData.surfaceObjectName = hit.object.name || "unnamed-surface";

    root.add(building);
    clickableBuildings.push(building);
    moduleGroups.set(module.id, building);
  });

  return {
    root,
    clickableBuildings,
    moduleGroups,
    diskRadius,
  };
}

export function pulseStationBuilding(moduleGroups, moduleId) {
  const group = moduleGroups.get(moduleId);
  if (!group) return;

  group.traverse((object) => {
    if (object.material?.emissiveIntensity !== undefined) {
      object.userData.previousEmissiveIntensity = object.material.emissiveIntensity;
      object.material.emissiveIntensity = 1.25;
    }
  });

  window.setTimeout(() => {
    group.traverse((object) => {
      if (object.material?.emissiveIntensity !== undefined) {
        object.material.emissiveIntensity =
          object.userData.previousEmissiveIntensity ?? 0.16;
      }
    });
  }, 180);
}
