import { MODULE_ANCHORS, MODULE_BY_ID, SCENE_CONFIG } from "./stationConfig";

// The original procedural complexes were technically present but too small to read
// from the fixed home camera. 2.75 makes each complex fill most of its authored pad.
// Full platform cap: the base intentionally covers the authored white circular pad.
const COMPLEX_VISUAL_SCALE = 4.35;
// Upper architecture grows with the full cap while retaining a small edge margin.
const COMPLEX_FEATURE_SCALE = 0.96;

function bodyMaterial(THREE, color) {
  return new THREE.MeshStandardMaterial({
    color: 0x091827,
    metalness: 0.9,
    roughness: 0.3,
    emissive: color,
    emissiveIntensity: 0.11,
  });
}

function darkMaterial(THREE) {
  return new THREE.MeshStandardMaterial({
    color: 0x06111d,
    metalness: 0.92,
    roughness: 0.38,
  });
}

function glowMaterial(THREE, color, opacity = 0.76) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function invisibleMaterial(THREE) {
  return new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
}

function mesh(THREE, group, geometry, material, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = false;
  object.receiveShadow = false;
  group.add(object);
  return object;
}

function addBase(THREE, group, radius, color) {
  const body = bodyMaterial(THREE, color);
  const dark = darkMaterial(THREE);
  const glow = glowMaterial(THREE, color, 0.72);
  const capMaterial = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.72,
    roughness: 0.28,
    emissive: color,
    emissiveIntensity: 0.22,
  });

  // Lower skirt wraps the original socket edge.
  mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 1.13, radius * 1.17, radius * 0.2, 36),
    dark,
    [0, radius * 0.015, 0]
  );

  // Opaque lid is fully above the raycast surface, so the white GLB pad cannot
  // draw over it on the left or right side.
  mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 1.1, radius * 1.13, radius * 0.13, 36),
    capMaterial,
    [0, radius * 0.14, 0]
  );

  // Dark inset visually joins the upper architecture to the large cap.
  mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.78, radius * 0.91, radius * 0.13, 32),
    body,
    [0, radius * 0.24, 0]
  );

  const ring = mesh(
    THREE,
    group,
    new THREE.TorusGeometry(radius * 0.94, radius * 0.045, 9, 48),
    glow,
    [0, radius * 0.215, 0]
  );
  ring.rotation.x = Math.PI / 2;

  return { body, dark, glow, capMaterial };
}

function createAutomationStudio(THREE, group, radius, materials) {
  const { body, dark, glow } = materials;

  mesh(THREE, group,
    new THREE.CylinderGeometry(radius * 0.34, radius * 0.48, radius * 0.28, 24),
    body, [0, radius * 0.42, 0]);
  mesh(THREE, group,
    new THREE.CylinderGeometry(radius * 0.08, radius * 0.12, radius * 0.9, 16),
    dark, [0, radius * 0.92, 0]);

  const scannerRing = mesh(THREE, group,
    new THREE.TorusGeometry(radius * 0.46, radius * 0.055, 10, 48),
    glow, [0, radius * 0.92, 0]);
  scannerRing.rotation.x = Math.PI / 2.55;

  const dish = mesh(THREE, group,
    new THREE.SphereGeometry(radius * 0.46, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    body, [0, radius * 1.12, radius * 0.04]);
  dish.scale.set(1, 0.3, 1);
  dish.rotation.x = -0.34;

  mesh(THREE, group,
    new THREE.SphereGeometry(radius * 0.11, 18, 14),
    glow, [0, radius * 1.34, -radius * 0.05]);
}

function createProjectLibrary(THREE, group, radius, materials) {
  const { body, dark, glow } = materials;

  [-0.36, 0, 0.36].forEach((offset, index) => {
    const height = radius * [0.78, 1.22, 0.94][index];
    mesh(THREE, group,
      new THREE.BoxGeometry(radius * 0.3, height, radius * 0.52),
      index === 1 ? body : dark,
      [offset * radius, radius * 0.35 + height / 2, 0]);
    mesh(THREE, group,
      new THREE.BoxGeometry(radius * 0.2, radius * 0.07, radius * 0.56),
      glow,
      [offset * radius, radius * 0.48 + height * 0.72, -radius * 0.01]);
  });

  const portal = mesh(THREE, group,
    new THREE.TorusGeometry(radius * 0.44, radius * 0.055, 10, 4),
    glow, [0, radius * 1.02, -radius * 0.04]);
  portal.rotation.set(Math.PI / 2, 0, Math.PI / 4);

  mesh(THREE, group,
    new THREE.OctahedronGeometry(radius * 0.2, 0),
    glow, [0, radius * 1.05, 0]);
}

function createCommunityRelay(THREE, group, radius, materials) {
  const { body, dark, glow } = materials;

  [-0.38, 0.38].forEach((offset, index) => {
    mesh(THREE, group,
      new THREE.CylinderGeometry(radius * 0.13, radius * 0.2, radius * 1.15, 16),
      index === 0 ? body : dark,
      [offset * radius, radius * 0.86, 0]);
    mesh(THREE, group,
      new THREE.SphereGeometry(radius * 0.17, 18, 14),
      glow, [offset * radius, radius * 1.48, 0]);
  });

  mesh(THREE, group,
    new THREE.BoxGeometry(radius * 0.82, radius * 0.09, radius * 0.1),
    glow, [0, radius * 1.08, 0]);
  mesh(THREE, group,
    new THREE.CylinderGeometry(radius * 0.06, radius * 0.09, radius * 0.72, 12),
    body, [0, radius * 0.72, radius * 0.14]);
  mesh(THREE, group,
    new THREE.TorusGeometry(radius * 0.28, radius * 0.035, 8, 36),
    glow, [0, radius * 1.18, radius * 0.02]).rotation.x = Math.PI / 2;
}

function createWalletMarket(THREE, group, radius, materials) {
  const { body, dark, glow } = materials;

  mesh(THREE, group,
    new THREE.CylinderGeometry(radius * 0.48, radius * 0.62, radius * 0.5, 28),
    dark, [0, radius * 0.5, 0]);
  mesh(THREE, group,
    new THREE.CylinderGeometry(radius * 0.3, radius * 0.44, radius * 0.56, 24),
    body, [0, radius * 0.9, 0]);

  const tradeRing = mesh(THREE, group,
    new THREE.TorusGeometry(radius * 0.52, radius * 0.06, 10, 44),
    glow, [0, radius * 0.88, 0]);
  tradeRing.rotation.x = Math.PI / 2;

  mesh(THREE, group,
    new THREE.IcosahedronGeometry(radius * 0.27, 1),
    glow, [0, radius * 1.35, 0]);
}

function createFallbackBuilding(THREE, group, radius, materials) {
  mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.22, radius * 0.34, radius * 0.5, 18),
    materials.body,
    [0, radius * 0.34, 0]
  );
  mesh(
    THREE,
    group,
    new THREE.OctahedronGeometry(radius * 0.16),
    materials.glow,
    [0, radius * 0.68, 0]
  );
}

function createModuleBuilding(THREE, module, diskRadius) {
  const group = new THREE.Group();
  group.name = `Module_${module.id}`;
  group.userData.moduleId = module.id;

  const radius =
    diskRadius * SCENE_CONFIG.buildingScale * COMPLEX_VISUAL_SCALE;
  group.userData.visualRadius = radius;
  const materials = addBase(THREE, group, radius, module.colorHex);
  const featureRadius = radius * COMPLEX_FEATURE_SCALE;

  if (module.id === "scanner") {
    createAutomationStudio(THREE, group, featureRadius, materials);
  } else if (module.id === "market") {
    createProjectLibrary(THREE, group, featureRadius, materials);
  } else if (module.id === "collab") {
    createCommunityRelay(THREE, group, featureRadius, materials);
  } else if (module.id === "wallet") {
    createWalletMarket(THREE, group, featureRadius, materials);
  } else {
    createFallbackBuilding(THREE, group, featureRadius, materials);
  }

  const hitArea = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 1.08, radius * 1.08, radius * 1.5, 18),
    invisibleMaterial(THREE),
    [0, radius * 0.42, 0]
  );
  hitArea.name = `HitArea_${module.id}`;

  group.traverse((object) => {
    object.userData.moduleId = module.id;
  });

  return group;
}

function getDiskRadius(THREE, bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  return Math.min(size.x, size.z) * 0.5;
}

function findSurfaceHit(THREE, station, x, z, bounds, diskRadius) {
  const raycaster = new THREE.Raycaster();
  raycaster.set(
    new THREE.Vector3(x, bounds.max.y + diskRadius, z),
    new THREE.Vector3(0, -1, 0)
  );
  return raycaster
    .intersectObject(station, true)
    .find((hit) => hit.face && hit.object.visible !== false);
}

export function createStationBuildings({ THREE, station, bounds, center }) {
  const root = new THREE.Group();
  root.name = "StationModuleBuildings";

  const clickableBuildings = [];
  const moduleGroups = new Map();
  const diskRadius = getDiskRadius(THREE, bounds);

  MODULE_ANCHORS.forEach((anchor) => {
    const module = MODULE_BY_ID[anchor.id];
    if (!module) return;

    const angle = THREE.MathUtils.degToRad(anchor.angle);
    const x = center.x + Math.cos(angle) * diskRadius * anchor.ring;
    const z = center.z + Math.sin(angle) * diskRadius * anchor.ring;
    const hit = findSurfaceHit(THREE, station, x, z, bounds, diskRadius);
    if (!hit) return;

    const building = createModuleBuilding(THREE, module, diskRadius);
    const embed =
      building.userData.visualRadius * 0.0;
    building.position.set(x, hit.point.y - embed, z);
    building.rotation.y = -angle + Math.PI / 2;
    building.userData.surfaceObjectName = hit.object.name || "unnamed-surface";

    root.add(building);
    clickableBuildings.push(building);
    moduleGroups.set(module.id, building);
  });

  return { root, clickableBuildings, moduleGroups, diskRadius };
}

export function pulseStationBuilding(moduleGroups, moduleId) {
  const group = moduleGroups.get(moduleId);
  if (!group) return;

  const initialScale = group.scale.clone();
  group.scale.multiplyScalar(1.06);

  group.traverse((object) => {
    if (object.material?.emissiveIntensity !== undefined) {
      object.userData.previousEmissiveIntensity = object.material.emissiveIntensity;
      object.material.emissiveIntensity = 1.1;
    }
  });

  window.setTimeout(() => {
    group.scale.copy(initialScale);
    group.traverse((object) => {
      if (object.material?.emissiveIntensity !== undefined) {
        object.material.emissiveIntensity =
          object.userData.previousEmissiveIntensity ?? 0.11;
      }
    });
  }, 180);
}
