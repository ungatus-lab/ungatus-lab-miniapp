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
    emissiveIntensity: 0.13,
  });
}

function darkMaterial(THREE) {
  return new THREE.MeshStandardMaterial({
    color: 0x1b2b3b,
    metalness: 0.9,
    roughness: 0.34,
    emissive: 0x03090f,
    emissiveIntensity: 0.09,
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
    emissiveIntensity: 0.11,
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
    color: 0x172738,
    metalness: 0.84,
    roughness: 0.26,
    emissive: color,
    emissiveIntensity: intensity,
  });
}

function addLightStrip(THREE, group, color, width, depth, x, y, z, rotationY = 0) {
  const strip = mesh(
    THREE,
    group,
    new THREE.BoxGeometry(width, width * 0.08, depth),
    accentMaterial(THREE, color, 0.82),
    [x, y, z]
  );
  strip.rotation.y = rotationY;
  return strip;
}

function createRadialSectorGeometry(THREE, radius, options = {}) {
  const outerHalf = radius * (options.outerHalf ?? 0.78);
  const innerHalf = radius * (options.innerHalf ?? 0.48);
  const length = radius * (options.length ?? 1.62);
  const height = radius * (options.height ?? 0.18);
  const outerZ = radius * (options.outerZ ?? 0.43);
  const innerZ = outerZ - length;
  const shoulderZ = outerZ - length * 0.56;

  const shape = new THREE.Shape();
  shape.moveTo(-outerHalf * 0.82, outerZ);
  shape.quadraticCurveTo(-outerHalf, outerZ, -outerHalf, outerZ - radius * 0.16);
  shape.lineTo(-innerHalf, innerZ);
  shape.quadraticCurveTo(-innerHalf * 0.82, innerZ - radius * 0.08, 0, innerZ - radius * 0.08);
  shape.quadraticCurveTo(innerHalf * 0.82, innerZ - radius * 0.08, innerHalf, innerZ);
  shape.lineTo(outerHalf, outerZ - radius * 0.16);
  shape.quadraticCurveTo(outerHalf, outerZ, outerHalf * 0.82, outerZ);
  shape.lineTo(0, outerZ + radius * 0.08);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: radius * 0.035,
    bevelThickness: radius * 0.025,
    curveSegments: 8,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return { geometry, height, shoulderZ, innerZ, outerZ };
}

function addRadialHull(THREE, group, radius, materials, options = {}) {
  const { body, dark } = materials;
  const sector = createRadialSectorGeometry(THREE, radius, options);

  const lower = mesh(
    THREE,
    group,
    sector.geometry,
    dark,
    [0, radius * 0.205, 0]
  );
  lower.userData.part = "radial-sector-lower";

  const upperSector = createRadialSectorGeometry(THREE, radius, {
    ...options,
    outerHalf: (options.outerHalf ?? 0.78) * 0.86,
    innerHalf: (options.innerHalf ?? 0.48) * 0.84,
    length: (options.length ?? 1.62) * 0.88,
    height: (options.height ?? 0.18) * 0.56,
    outerZ: (options.outerZ ?? 0.43) - 0.08,
  });
  const upper = mesh(
    THREE,
    group,
    upperSector.geometry,
    body,
    [0, radius * 0.205 + sector.height, 0]
  );
  upper.userData.part = "radial-sector-upper";

  return {
    lower,
    upper,
    shoulderZ: sector.shoulderZ,
    innerZ: sector.innerZ,
    outerZ: sector.outerZ,
  };
}

function addGlyphBar(THREE, group, color, radius, width, depth, x, z, rotationY = 0) {
  const bar = mesh(
    THREE,
    group,
    new THREE.BoxGeometry(radius * width, radius * 0.045, radius * depth),
    glowMaterial(THREE, color, 0.92),
    [radius * x, radius * 0.69, radius * z]
  );
  bar.rotation.y = rotationY;
  bar.userData.glyphPart = true;
  return bar;
}

function addGlyphNode(THREE, group, color, radius, x, z, scale = 1) {
  const node = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.09 * scale, radius * 0.09 * scale, radius * 0.05, 18),
    glowMaterial(THREE, color, 0.95),
    [radius * x, radius * 0.705, radius * z]
  );
  node.userData.glyphPart = true;
  return node;
}

function addGlyphFrame(THREE, group, color, radius, x, z, scale = 1) {
  const w = 0.28 * scale;
  const h = 0.36 * scale;
  addGlyphBar(THREE, group, color, radius, w, 0.045, x, z - h / 2);
  addGlyphBar(THREE, group, color, radius, w, 0.045, x, z + h / 2);
  addGlyphBar(THREE, group, color, radius, 0.045, h, x - w / 2, z);
  addGlyphBar(THREE, group, color, radius, 0.045, h, x + w / 2, z);
}

function addFlowNodeGlyph(THREE, group, radius) {
  const color = 0x53f5df;
  addGlyphNode(THREE, group, color, radius, 0, -0.32, 1.12);
  addGlyphNode(THREE, group, color, radius, -0.3, 0.08, 0.72);
  addGlyphNode(THREE, group, color, radius, 0.3, 0.08, 0.72);
  addGlyphBar(THREE, group, color, radius, 0.08, 0.42, -0.15, -0.12, -0.62);
  addGlyphBar(THREE, group, color, radius, 0.08, 0.42, 0.15, -0.12, 0.62);
  addGlyphBar(THREE, group, color, radius, 0.08, 0.34, 0, -0.51);
}

function addScenarioFramesGlyph(THREE, group, radius) {
  const color = 0xff8bc8;
  addGlyphFrame(THREE, group, color, radius, -0.28, -0.14, 0.82);
  addGlyphFrame(THREE, group, color, radius, 0, -0.28, 0.9);
  addGlyphFrame(THREE, group, color, radius, 0.28, -0.42, 0.82);
}

function addLinkedCoresGlyph(THREE, group, radius) {
  const color = 0xb99cff;
  addGlyphNode(THREE, group, color, radius, -0.28, -0.25, 1.05);
  addGlyphNode(THREE, group, color, radius, 0.28, -0.25, 1.05);
  addGlyphBar(THREE, group, color, radius, 0.46, 0.07, 0, -0.25);
  addGlyphBar(THREE, group, color, radius, 0.36, 0.055, 0, -0.5);
}

function addExchangeGateGlyph(THREE, group, radius) {
  const color = 0xffd76b;
  const diamond = addGlyphBar(THREE, group, color, radius, 0.25, 0.25, 0, -0.28, Math.PI / 4);
  diamond.scale.z = 0.5;
  addGlyphBar(THREE, group, color, radius, 0.38, 0.07, -0.2, -0.02);
  addGlyphBar(THREE, group, color, radius, 0.38, 0.07, 0.2, -0.54);
  addGlyphBar(THREE, group, color, radius, 0.14, 0.06, -0.39, -0.02, -0.62);
  addGlyphBar(THREE, group, color, radius, 0.14, 0.06, 0.39, -0.54, -0.62);
}

function createAutomationStudio(THREE, group, radius, materials) {
  addRadialHull(THREE, group, radius, materials, {
    width: 1.52,
    length: 1.72,
    height: 0.22,
    centerOffset: 0.34,
  });

  const lens = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.43, radius * 0.52, radius * 0.1, 32),
    bodyMaterial(THREE),
    [0, radius * 0.49, -radius * 0.22]
  );
  lens.scale.z = 0.82;

  addLightStrip(
    THREE, group, 0x53f5df,
    radius * 0.92, radius * 0.16,
    0, radius * 0.565, -radius * 0.25
  );
  addLightStrip(
    THREE, group, 0x8ffff0,
    radius * 0.6, radius * 0.11,
    0, radius * 0.585, -radius * 0.48
  );
}

function createProjectLibrary(THREE, group, radius, materials) {
  addRadialHull(THREE, group, radius, materials, {
    width: 1.58,
    length: 1.75,
    height: 0.22,
    centerOffset: 0.34,
  });

  [-0.43, 0, 0.43].forEach((offset, index) => {
    const cassette = mesh(
      THREE,
      group,
      new THREE.BoxGeometry(radius * 0.39, radius * 0.17, radius * 1.04),
      index === 1 ? bodyMaterial(THREE) : darkMaterial(THREE),
      [offset * radius, radius * 0.50, -radius * 0.34]
    );
    cassette.rotation.y = offset * -0.08;
    addLightStrip(
      THREE, group, 0xff8bc8,
      radius * 0.25, radius * 0.69,
      offset * radius, radius * 0.59, -radius * 0.34,
      offset * -0.08
    );
  });
}

function createCommunityRelay(THREE, group, radius, materials) {
  addRadialHull(THREE, group, radius, materials, {
    width: 1.6,
    length: 1.7,
    height: 0.21,
    centerOffset: 0.32,
  });

  [-0.39, 0.39].forEach((offset) => {
    const capsule = mesh(
      THREE,
      group,
      new THREE.CapsuleGeometry(radius * 0.22, radius * 0.62, 8, 18),
      bodyMaterial(THREE),
      [offset * radius, radius * 0.50, -radius * 0.31]
    );
    capsule.rotation.z = Math.PI / 2;
    capsule.rotation.y = Math.PI / 2;
  });

  addLightStrip(
    THREE, group, 0xb99cff,
    radius * 0.94, radius * 0.12,
    0, radius * 0.57, -radius * 0.33
  );
}

function createWalletMarket(THREE, group, radius, materials) {
  addRadialHull(THREE, group, radius, materials, {
    width: 1.54,
    length: 1.7,
    height: 0.24,
    centerOffset: 0.34,
  });

  const vault = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.49, radius * 0.62, radius * 0.16, 8),
    bodyMaterial(THREE),
    [0, radius * 0.50, -radius * 0.28]
  );
  vault.rotation.y = Math.PI / 8;

  const core = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 0.16, radius * 0.21, radius * 0.075, 20),
    accentMaterial(THREE, 0xffd76b, 0.9),
    [0, radius * 0.62, -radius * 0.28]
  );
  core.rotation.y = Math.PI / 8;

  addLightStrip(
    THREE, group, 0xffd76b,
    radius * 0.78, radius * 0.12,
    0, radius * 0.58, -radius * 0.57
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
  // Identity comes from the module silhouette, not another circular plate.
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
