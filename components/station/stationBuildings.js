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

const GLYPH_Y = 0.735;

function addGlyphBar(THREE, group, color, radius, width, depth, x, z, rotationY = 0) {
  const bar = mesh(
    THREE,
    group,
    new THREE.BoxGeometry(radius * width, radius * 0.065, radius * depth),
    glowMaterial(THREE, color, 0.96),
    [radius * x, radius * GLYPH_Y, radius * z]
  );
  bar.rotation.y = rotationY;
  bar.userData.glyphPart = true;
  return bar;
}

function addGlyphNode(THREE, group, color, radius, x, z, scale = 1) {
  const node = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(
      radius * 0.115 * scale,
      radius * 0.115 * scale,
      radius * 0.07,
      20
    ),
    glowMaterial(THREE, color, 0.98),
    [radius * x, radius * (GLYPH_Y + 0.005), radius * z]
  );
  node.userData.glyphPart = true;
  return node;
}

function addGlyphFrame(THREE, group, color, radius, x, z, width, height) {
  addGlyphBar(THREE, group, color, radius, width, 0.065, x, z - height / 2);
  addGlyphBar(THREE, group, color, radius, width, 0.065, x, z + height / 2);
  addGlyphBar(THREE, group, color, radius, 0.065, height, x - width / 2, z);
  addGlyphBar(THREE, group, color, radius, 0.065, height, x + width / 2, z);
}

function addArrowGlyph(THREE, group, color, radius, z, direction = 1) {
  addGlyphBar(THREE, group, color, radius, 0.54, 0.075, 0, z);
  addGlyphBar(
    THREE,
    group,
    color,
    radius,
    0.22,
    0.075,
    direction * 0.25,
    z - 0.1,
    direction * 0.7
  );
  addGlyphBar(
    THREE,
    group,
    color,
    radius,
    0.22,
    0.075,
    direction * 0.25,
    z + 0.1,
    -direction * 0.7
  );
}

function addFlowNodeGlyph(THREE, group, radius) {
  const color = 0x53f5df;
  addGlyphNode(THREE, group, color, radius, 0, -0.48, 1.08);
  addGlyphNode(THREE, group, color, radius, -0.34, -0.05, 0.78);
  addGlyphNode(THREE, group, color, radius, 0.34, -0.05, 0.78);
  addGlyphBar(THREE, group, color, radius, 0.09, 0.49, -0.17, -0.27, -0.67);
  addGlyphBar(THREE, group, color, radius, 0.09, 0.49, 0.17, -0.27, 0.67);
}

function addScenarioFramesGlyph(THREE, group, radius) {
  const color = 0xff8bc8;
  addGlyphFrame(THREE, group, color, radius, 0, -0.28, 0.78, 0.62);
  addGlyphBar(THREE, group, color, radius, 0.065, 0.52, -0.24, -0.28);
  addGlyphBar(THREE, group, color, radius, 0.065, 0.52, 0, -0.28);
  addGlyphBar(THREE, group, color, radius, 0.065, 0.52, 0.24, -0.28);
}

function addLinkedCoresGlyph(THREE, group, radius) {
  const color = 0xb99cff;
  addGlyphNode(THREE, group, color, radius, -0.31, -0.27, 1.08);
  addGlyphNode(THREE, group, color, radius, 0.31, -0.27, 1.08);
  addGlyphBar(THREE, group, color, radius, 0.46, 0.09, 0, -0.27);
  addGlyphBar(THREE, group, color, radius, 0.56, 0.07, 0, -0.53);
}

function addWalletGlyph(THREE, group, radius) {
  const color = 0xffd76b;
  const y = radius * 0.742;
  const glow = glowMaterial(THREE, color, 0.98);

  // Wallet body: a wide rounded outline, rotated with the module so it faces
  // the home observer correctly on the near-left platform.
  const bodyShape = new THREE.Shape();
  const w = radius * 0.9;
  const h = radius * 0.64;
  const r = radius * 0.13;
  bodyShape.moveTo(-w / 2 + r, -h / 2);
  bodyShape.lineTo(w / 2 - r, -h / 2);
  bodyShape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  bodyShape.lineTo(w / 2, h / 2 - r);
  bodyShape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  bodyShape.lineTo(-w / 2 + r, h / 2);
  bodyShape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  bodyShape.lineTo(-w / 2, -h / 2 + r);
  bodyShape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  bodyShape.closePath();

  const hole = new THREE.Path();
  const inset = radius * 0.1;
  hole.moveTo(-w / 2 + r + inset, -h / 2 + inset);
  hole.lineTo(w / 2 - r - inset, -h / 2 + inset);
  hole.quadraticCurveTo(w / 2 - inset, -h / 2 + inset, w / 2 - inset, -h / 2 + r + inset);
  hole.lineTo(w / 2 - inset, h / 2 - r - inset);
  hole.quadraticCurveTo(w / 2 - inset, h / 2 - inset, w / 2 - r - inset, h / 2 - inset);
  hole.lineTo(-w / 2 + r + inset, h / 2 - inset);
  hole.quadraticCurveTo(-w / 2 + inset, h / 2 - inset, -w / 2 + inset, h / 2 - r - inset);
  hole.lineTo(-w / 2 + inset, -h / 2 + r + inset);
  hole.quadraticCurveTo(-w / 2 + inset, -h / 2 + inset, -w / 2 + r + inset, -h / 2 + inset);
  hole.closePath();
  bodyShape.holes.push(hole);

  const body = mesh(
    THREE,
    group,
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: radius * 0.055,
      bevelEnabled: false,
      curveSegments: 10,
    }),
    glow,
    [0, y, -radius * 0.3]
  );
  body.rotation.x = -Math.PI / 2;
  body.userData.glyphPart = true;

  // Top opening/card lip makes the silhouette read as a wallet rather than a card.
  addGlyphBar(THREE, group, color, radius, 0.64, 0.075, -0.07, -0.02, -0.13);

  // Clasp tab and coin/button on the observer-facing right side of the icon.
  addGlyphBar(THREE, group, color, radius, 0.34, 0.17, 0.3, -0.3);
  addGlyphNode(THREE, group, color, radius, 0.37, -0.3, 0.66);
}


function holoMaterial(THREE, color, opacity = 0.82) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

function holoFillMaterial(THREE, color, opacity = 0.18) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function holoColorMaterial(THREE, color, opacity = 0.78) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
}

function holoLine(THREE, group, material, radius, width, height, x, y, rotationZ = 0, z = 0.02) {
  const part = mesh(
    THREE,
    group,
    new THREE.BoxGeometry(radius * width, radius * height, radius * 0.035),
    material,
    [radius * x, radius * y, radius * z]
  );
  part.rotation.z = rotationZ;
  part.userData.hologramVisual = true;
  return part;
}

function holoDisc(THREE, group, material, radius, x, y, scale = 1, z = 0.025) {
  const disc = mesh(
    THREE,
    group,
    new THREE.CircleGeometry(radius * 0.1 * scale, 28),
    material,
    [radius * x, radius * y, radius * z]
  );
  disc.userData.hologramVisual = true;
  return disc;
}

function holoTriangle(THREE, group, material, radius, x, y, scale = 1, rotationZ = 0) {
  const shape = new THREE.Shape();
  const size = radius * 0.18 * scale;
  shape.moveTo(size * 0.72, 0);
  shape.lineTo(-size * 0.55, size * 0.62);
  shape.lineTo(-size * 0.55, -size * 0.62);
  shape.closePath();
  const tri = mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(shape),
    material,
    [radius * x, radius * y, radius * 0.03]
  );
  tri.rotation.z = rotationZ;
  tri.userData.hologramVisual = true;
  return tri;
}

function createTokenShape(THREE, radius, scale = 1) {
  const shape = new THREE.Shape();
  const w = radius * 0.95 * scale;
  const h = radius * 0.78 * scale;
  const cut = w * 0.18;
  shape.moveTo(-w / 2 + cut, h / 2);
  shape.lineTo(w / 2 - cut, h / 2);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2 - cut, -h / 2);
  shape.lineTo(-w / 2 + cut, -h / 2);
  shape.lineTo(-w / 2, 0);
  shape.closePath();
  return shape;
}

function addHoloToken(THREE, group, color, radius) {
  const back = mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(createTokenShape(THREE, radius, 1.05)),
    holoFillMaterial(THREE, color, 0.16),
    [0, 0, 0]
  );
  back.userData.hologramVisual = true;

  const line = holoMaterial(THREE, color, 0.9);
  holoLine(THREE, group, line, radius, 0.58, 0.035, 0, 0.42);
  holoLine(THREE, group, line, radius, 0.58, 0.035, 0, -0.42);
  holoLine(THREE, group, line, radius, 0.035, 0.34, -0.48, 0.17, -0.45);
  holoLine(THREE, group, line, radius, 0.035, 0.34, -0.48, -0.17, 0.45);
  holoLine(THREE, group, line, radius, 0.035, 0.34, 0.48, 0.17, 0.45);
  holoLine(THREE, group, line, radius, 0.035, 0.34, 0.48, -0.17, -0.45);
}

function createRoundedRectShape(THREE, width, height, corner) {
  const shape = new THREE.Shape();
  const left = -width / 2;
  const right = width / 2;
  const top = height / 2;
  const bottom = -height / 2;
  shape.moveTo(left + corner, top);
  shape.lineTo(right - corner, top);
  shape.quadraticCurveTo(right, top, right, top - corner);
  shape.lineTo(right, bottom + corner);
  shape.quadraticCurveTo(right, bottom, right - corner, bottom);
  shape.lineTo(left + corner, bottom);
  shape.quadraticCurveTo(left, bottom, left, bottom + corner);
  shape.lineTo(left, top - corner);
  shape.quadraticCurveTo(left, top, left + corner, top);
  shape.closePath();
  return shape;
}

function createRoundedRectRingShape(THREE, width, height, corner, thickness) {
  const outer = createRoundedRectShape(THREE, width, height, corner);
  const innerWidth = width - thickness * 2;
  const innerHeight = height - thickness * 2;
  const innerCorner = Math.max(corner - thickness, thickness * 0.45);
  const inner = createRoundedRectShape(THREE, innerWidth, innerHeight, innerCorner);
  outer.holes.push(inner);
  return outer;
}

function addWalletTerminal(THREE, group, color, radius) {
  const uiBlue = 0x58d7ff;
  const uiBlueSoft = 0x2c94c7;
  const darkCore = 0x06121f;

  // Soft rear aura gives depth without washing the terminal out to white.
  const aura = mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.94, radius * 1.02, radius * 0.23)
    ),
    holoFillMaterial(THREE, uiBlueSoft, 0.12),
    [0, 0, -radius * 0.05]
  );
  aura.scale.setScalar(1.12);

  // Dark glass body.
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.82, radius * 0.92, radius * 0.2)
    ),
    holoFillMaterial(THREE, darkCore, 0.88),
    [0, 0, 0]
  );

  // One continuous, naturally rounded frame instead of separate white bars.
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectRingShape(
        THREE,
        radius * 0.86,
        radius * 0.96,
        radius * 0.21,
        radius * 0.045
      )
    ),
    holoColorMaterial(THREE, uiBlue, 0.8),
    [0, 0, radius * 0.018]
  );

  // Inner glass accent, slightly offset to create a modern layered terminal.
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectRingShape(
        THREE,
        radius * 0.72,
        radius * 0.8,
        radius * 0.16,
        radius * 0.018
      )
    ),
    holoColorMaterial(THREE, uiBlueSoft, 0.42),
    [0, 0, radius * 0.028]
  );

  // Clear wallet silhouette: rounded body, top fold, projecting clasp and dot.
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.58, radius * 0.4, radius * 0.09)
    ),
    holoColorMaterial(THREE, uiBlue, 0.94),
    [-radius * 0.035, -radius * 0.025, radius * 0.05]
  );

  const fold = new THREE.Shape();
  fold.moveTo(-radius * 0.24, radius * 0.07);
  fold.lineTo(radius * 0.1, radius * 0.17);
  fold.lineTo(radius * 0.23, radius * 0.07);
  fold.closePath();
  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(fold),
    holoFillMaterial(THREE, darkCore, 0.78),
    [0, radius * 0.055, radius * 0.065]
  );

  mesh(
    THREE,
    group,
    new THREE.ShapeGeometry(
      createRoundedRectShape(THREE, radius * 0.3, radius * 0.17, radius * 0.055)
    ),
    holoFillMaterial(THREE, darkCore, 0.94),
    [radius * 0.25, -radius * 0.025, radius * 0.075]
  );
  holoDisc(
    THREE,
    group,
    holoColorMaterial(THREE, uiBlue, 1),
    radius,
    0.29,
    -0.025,
    0.4,
    0.09
  );

  // Tiny lower status light; it reads as a digital terminal, not a framed sign.
  holoDisc(
    THREE,
    group,
    holoColorMaterial(THREE, uiBlueSoft, 0.72),
    radius,
    0,
    -0.37,
    0.28,
    0.045
  );

  group.userData.walletPrototype = true;
}

function addWalletHolo(THREE, group, material, radius) {
  // Readable wallet: body, flap, side clasp dot.
  holoLine(THREE, group, material, radius, 0.68, 0.07, -0.04, -0.2);
  holoLine(THREE, group, material, radius, 0.68, 0.07, -0.04, 0.2);
  holoLine(THREE, group, material, radius, 0.07, 0.42, -0.38, 0);
  holoLine(THREE, group, material, radius, 0.07, 0.42, 0.28, 0);
  holoLine(THREE, group, material, radius, 0.42, 0.055, -0.02, 0.06, -0.22);
  holoLine(THREE, group, material, radius, 0.22, 0.16, 0.39, 0.0);
  holoDisc(THREE, group, material, radius, 0.43, 0, 0.52);
}

function addMarketHolo(THREE, group, material, radius) {
  // Storefront: awning, posts, counter.
  holoLine(THREE, group, material, radius, 0.8, 0.06, 0, 0.25);
  [-0.3, -0.1, 0.1, 0.3].forEach((x, index) => {
    holoLine(THREE, group, material, radius, 0.18, 0.16, x, 0.14, index % 2 ? 0.12 : -0.12);
  });
  holoLine(THREE, group, material, radius, 0.62, 0.06, 0, -0.28);
  holoLine(THREE, group, material, radius, 0.06, 0.48, -0.31, -0.04);
  holoLine(THREE, group, material, radius, 0.06, 0.48, 0.31, -0.04);
  holoLine(THREE, group, material, radius, 0.22, 0.08, 0, -0.04);
}

function addCollabHolo(THREE, group, material, radius) {
  // Collab room: three participants around a shared table/project core.
  holoDisc(THREE, group, material, radius, -0.28, 0.18, 0.9);
  holoDisc(THREE, group, material, radius, 0.28, 0.18, 0.9);
  holoDisc(THREE, group, material, radius, 0, -0.28, 0.9);
  holoLine(THREE, group, material, radius, 0.22, 0.08, -0.28, -0.02, -0.12);
  holoLine(THREE, group, material, radius, 0.22, 0.08, 0.28, -0.02, 0.12);
  holoLine(THREE, group, material, radius, 0.22, 0.08, 0, -0.44);
  holoDisc(THREE, group, material, radius, 0, -0.02, 0.62);
  holoLine(THREE, group, material, radius, 0.36, 0.045, -0.14, 0.08, 0.45);
  holoLine(THREE, group, material, radius, 0.36, 0.045, 0.14, 0.08, -0.45);
  holoLine(THREE, group, material, radius, 0.28, 0.045, 0, -0.15);
}

function addAutomationHolo(THREE, group, material, radius) {
  // Project catalog + automation: project window with scenario blocks and play node.
  holoLine(THREE, group, material, radius, 0.66, 0.055, 0, 0.3);
  holoLine(THREE, group, material, radius, 0.66, 0.055, 0, -0.32);
  holoLine(THREE, group, material, radius, 0.055, 0.62, -0.33, -0.01);
  holoLine(THREE, group, material, radius, 0.055, 0.62, 0.33, -0.01);
  [-0.17, 0.04, 0.25].forEach((x, index) => {
    holoLine(THREE, group, material, radius, 0.16, 0.12, x, 0.08 - index * 0.16);
  });
  holoLine(THREE, group, material, radius, 0.24, 0.04, -0.06, 0.02, -0.55);
  holoLine(THREE, group, material, radius, 0.24, 0.04, 0.14, -0.14, -0.55);
  holoTriangle(THREE, group, material, radius, -0.2, -0.22, 0.8);
}

function addModuleHologram(THREE, group, module, radius) {
  const hologramColor = module.id === "wallet" ? 0x58d7ff : module.colorHex;
  const projector = new THREE.Group();
  projector.name = `HologramProjector_${module.id}`;
  projector.position.set(
    0,
    radius * 0.72,
    module.id === "wallet" ? -radius * 0.42 : -radius * 0.3
  );
  group.add(projector);

  mesh(
    THREE,
    projector,
    new THREE.CylinderGeometry(radius * 0.13, radius * 0.2, radius * 0.08, 24),
    holoMaterial(THREE, hologramColor, 0.52),
    [0, 0, 0]
  );
  const halo = mesh(
    THREE,
    projector,
    new THREE.TorusGeometry(radius * 0.24, radius * 0.018, 8, 36),
    holoMaterial(THREE, hologramColor, 0.52),
    [0, radius * 0.055, 0]
  );
  halo.rotation.x = Math.PI / 2;
  mesh(
    THREE,
    projector,
    new THREE.CylinderGeometry(radius * 0.09, radius * 0.17, radius * 0.78, 22, 1, true),
    holoMaterial(THREE, hologramColor, 0.07),
    [0, radius * 0.44, 0]
  );

  const billboard = new THREE.Group();
  billboard.name = `HologramBillboard_${module.id}`;
  billboard.position.set(
    0,
    radius * (module.id === "wallet" ? 0.9 : 1.04),
    0
  );
  billboard.userData.baseY = billboard.position.y;
  billboard.userData.phase = module.id.length * 0.73;
  projector.add(billboard);

  const material = holoMaterial(THREE, module.colorHex, 0.88);
  if (module.id === "wallet") {
    addWalletTerminal(THREE, billboard, hologramColor, radius);
  } else {
    addHoloToken(THREE, billboard, module.colorHex, radius);
    if (module.id === "market") addMarketHolo(THREE, billboard, material, radius);
    if (module.id === "collab") addCollabHolo(THREE, billboard, material, radius);
    if (module.id === "scanner") addAutomationHolo(THREE, billboard, material, radius);
  }

  const hitArea = mesh(
    THREE,
    billboard,
    new THREE.PlaneGeometry(
      radius * (module.id === "wallet" ? 1.08 : 1.22),
      radius * (module.id === "wallet" ? 1.16 : 1.08)
    ),
    invisibleMaterial(THREE),
    [0, 0, radius * 0.08]
  );
  hitArea.name = `HologramButton_${module.id}`;
  hitArea.userData.moduleId = module.id;
  hitArea.userData.hologramButton = true;

  group.userData.hologramBillboard = billboard;
  group.userData.hologramClickArea = hitArea;
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

  addFlowNodeGlyph(THREE, group, radius);
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
  });
  addScenarioFramesGlyph(THREE, group, radius);
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

  addLinkedCoresGlyph(THREE, group, radius);
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

  addWalletGlyph(THREE, group, radius);
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
  group.userData.focusAnchorLocal = { x: 0, y: radius * 0.58, z: 0 };
  // Module geometry points inward along local -Z, therefore +Z is the outer edge.
  group.userData.outwardLocal = { x: 0, y: 0, z: 1 };
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

  group.traverse((object) => {
    if (object.userData.glyphPart && object.material) {
      object.material.transparent = true;
      object.material.opacity = Math.min(object.material.opacity ?? 1, 0.28);
      object.material.depthWrite = false;
    }
  });
  addModuleHologram(THREE, group, module, radius);

  const hitArea = mesh(
    THREE,
    group,
    new THREE.CylinderGeometry(radius * 1.08, radius * 1.08, radius * 1.5, 18),
    invisibleMaterial(THREE),
    [0, radius * 0.42, 0]
  );
  hitArea.name = `HitArea_${module.id}`;
  hitArea.userData.moduleId = module.id;
  group.userData.baseHitArea = hitArea;

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
  const hologramBillboards = [];
  const hologramClickables = [];
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
    if (building.userData.baseHitArea) {
      clickableBuildings.push(building.userData.baseHitArea);
    }
    moduleGroups.set(module.id, building);
    if (building.userData.hologramBillboard) {
      hologramBillboards.push(building.userData.hologramBillboard);
    }
    if (building.userData.hologramClickArea) {
      hologramClickables.push(building.userData.hologramClickArea);
    }
  });

  return {
    root,
    clickableBuildings,
    moduleGroups,
    hologramBillboards,
    hologramClickables,
    diskRadius,
  };
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
