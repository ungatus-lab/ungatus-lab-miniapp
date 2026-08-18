import { MODULE_ANCHORS, MODULE_BY_ID, SCENE_CONFIG } from "./stationConfig";

// The original procedural complexes were technically present but too small to read
// from the fixed home camera. 2.75 makes each complex fill most of its authored pad.
// Full platform cap: the base intentionally covers the authored white circular pad.
const COMPLEX_VISUAL_SCALE = 4.35;
// Upper architecture grows with the full cap while retaining a small edge margin.
const COMPLEX_FEATURE_SCALE = 1.02;

function bodyMaterial(THREE) {
  return new THREE.MeshStandardMaterial({
    color: 0x40566b,
    metalness: 0.88,
    roughness: 0.3,
    emissive: 0x07121d,
    emissiveIntensity: 0.08,
  });
}

function darkMaterial(THREE) {
  return new THREE.MeshStandardMaterial({
    color: 0x1b2b3b,
    metalness: 0.9,
    roughness: 0.34,
    emissive: 0x03090f,
    emissiveIntensity: 0.04,
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
  const body = bodyMaterial(THREE);
  const dark = darkMaterial(THREE);
  const glow = glowMaterial(THREE, color, 0.72);
  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a3e52,
    metalness: 0.88,
    roughness: 0.3,
    emissive: 0x06111b,
    emissiveIntensity: 0.06,
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

function accentMaterial(THREE, color, intensity = 0.72) {
  return new THREE.MeshStandardMaterial({
    color: 0x152434,
    metalness: 0.82,
    roughness: 0.27,
    emissive: color,
    emissiveIntensity: intensity,
  });
}

function addPanelArc(THREE, group, radius, color, startAngle, length, y) {
  const arc = mesh(
    THREE,
    group,
    new THREE.TorusGeometry(radius, radius * 0.028, 6, 56, length),
    glowMaterial(THREE, color, 0.84),
    [0, y, 0]
  );
  arc.rotation.set(Math.PI / 2, 0, startAngle);
  return arc;
}

function addArmorPanels(THREE, group, radius, material, count = 6) {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const panel = mesh(
      THREE,
      group,
      new THREE.BoxGeometry(radius * 0.34, radius * 0.055, radius * 0.2),
      material,
      [
        Math.cos(angle) * radius * 0.58,
        radius * 0.46,
        Math.sin(angle) * radius * 0.58,
      ]
    );
    panel.rotation.y = -angle;
  }
}

function createAutomationStudio(THREE, group, radius, materials) {
  const { body, dark } = materials;
  mesh(
    THREE, group,
    new THREE.CylinderGeometry(radius * 0.69, radius * 0.82, radius * 0.16, 32),
    dark, [0, radius * 0.31, 0]
  );
  mesh(
    THREE, group,
    new THREE.CylinderGeometry(radius * 0.47, radius * 0.65, radius * 0.12, 32),
    body, [0, radius * 0.43, 0]
  );
  addArmorPanels(THREE, group, radius, body, 6);
  addPanelArc(THREE, group, radius * 0.57, 0x53f5df, 0.15, Math.PI * 1.45, radius * 0.53);
  addPanelArc(THREE, group, radius * 0.39, 0x8ffff0, Math.PI, Math.PI * 0.72, radius * 0.55);
  mesh(
    THREE, group,
    new THREE.CylinderGeometry(radius * 0.13, radius * 0.18, radius * 0.07, 20),
    accentMaterial(THREE, 0x53f5df, 0.9), [0, radius * 0.56, 0]
  );
}

function createProjectLibrary(THREE, group, radius, materials) {
  const { body, dark } = materials;
  mesh(
    THREE, group,
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.85, radius * 0.16, 12),
    dark, [0, radius * 0.31, 0]
  );
  [-0.36, 0, 0.36].forEach((offset) => {
    const block = mesh(
      THREE, group,
      new THREE.BoxGeometry(radius * 0.28, radius * 0.13, radius * 0.64),
      body, [offset * radius, radius * 0.45, 0]
    );
    block.rotation.y = offset * -0.18;
    mesh(
      THREE, group,
      new THREE.BoxGeometry(radius * 0.21, radius * 0.022, radius * 0.5),
      accentMaterial(THREE, 0xff8bc8, 0.72),
      [offset * radius, radius * 0.525, 0]
    ).rotation.y = offset * -0.18;
  });
  addPanelArc(THREE, group, radius * 0.61, 0xff8bc8, 0.52, Math.PI * 0.82, radius * 0.5);
}

function createCommunityRelay(THREE, group, radius, materials) {
  const { body, dark } = materials;
  mesh(
    THREE, group,
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.85, radius * 0.16, 32),
    dark, [0, radius * 0.31, 0]
  );
  [-0.3, 0.3].forEach((offset) => {
    mesh(
      THREE, group,
      new THREE.CapsuleGeometry(radius * 0.19, radius * 0.18, 7, 18),
      body, [offset * radius, radius * 0.49, 0]
    ).rotation.z = Math.PI / 2;
  });
  mesh(
    THREE, group,
    new THREE.BoxGeometry(radius * 0.58, radius * 0.055, radius * 0.12),
    accentMaterial(THREE, 0xb99cff, 0.76), [0, radius * 0.49, 0]
  );
  addPanelArc(THREE, group, radius * 0.61, 0xb99cff, 0.3, Math.PI * 1.05, radius * 0.52);
}

function createWalletMarket(THREE, group, radius, materials) {
  const { body, dark } = materials;
  mesh(
    THREE, group,
    new THREE.CylinderGeometry(radius * 0.7, radius * 0.85, radius * 0.17, 32),
    dark, [0, radius * 0.32, 0]
  );
  mesh(
    THREE, group,
    new THREE.CylinderGeometry(radius * 0.43, radius * 0.61, radius * 0.12, 28),
    body, [0, radius * 0.45, 0]
  );
  addArmorPanels(THREE, group, radius, body, 8);
  addPanelArc(THREE, group, radius * 0.59, 0xffd76b, 0.0, Math.PI * 1.72, radius * 0.53);
  mesh(
    THREE, group,
    new THREE.CylinderGeometry(radius * 0.13, radius * 0.18, radius * 0.08, 20),
    accentMaterial(THREE, 0xffd76b, 0.86), [0, radius * 0.57, 0]
  );
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
  const identityPlate = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.78, radius * 0.055, 32),
    new THREE.MeshStandardMaterial({
      color: 0x4a6075,
      metalness: 0.84,
      roughness: 0.27,
      emissive: 0x07131f,
      emissiveIntensity: 0.08,
    }),
    [0, radius * 0.315, 0]
  );
  identityPlate.userData.moduleId = module.id;

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
  group.scale.multiplyScalar(1.025);

  group.traverse((object) => {
    if (object.material?.emissiveIntensity !== undefined) {
      object.userData.previousEmissiveIntensity = object.material.emissiveIntensity;
      object.material.emissiveIntensity = 0.72;
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
