// ===============================
// STATES
// ===============================
const CITY = 0;
const IMPACT = 1;
const SILENCE = 2;
const NATURE = 3;

let state = CITY;
let stateStartTime = 0;

// ===============================
// GLOBALS
// ===============================
let cityLayers = [];
let impactTime;

let impactX, impactY;
let shockRadius = 0;

// ===============================
// SETUP
// ===============================
function setup() {
  createCanvas(windowWidth, windowHeight);
  generateCity();
  impactTime = millis() + random(1500, 30000); // 15–30 Sekunden
}

// ===============================
// STATE CHANGE
// ===============================
function changeState(newState) {
  state = newState;
  stateStartTime = millis();

  if (state === IMPACT) {
    impactX = width * random(0.3, 0.7);
    impactY = height * random(0.4, 0.7);
    shockRadius = 0;
  }
}

// ===============================
// CITY GENERATION
// ===============================
function generateCity() {
  cityLayers = [];
  cityLayers.push(createCityLayer(1.0, 0.05, color(40, 60, 120)));
  cityLayers.push(createCityLayer(0.8, 0.15, color(120, 80, 160)));
  cityLayers.push(createCityLayer(0.6, 0.3, color(180, 140, 80)));
}

function createCityLayer(scale, speed, baseColor) {
  let buildings = [];
  let x = 0;

  while (x < width * 3) {
    let w = random(120, 320) * scale;
    let h = random(300, 900) * scale;

    let neonColors = [
      color(255, 220, 120),
      color(100, 255, 220),
      color(255, 100, 200)
    ];

    buildings.push({
      x,
      w,
      h,
      steps: floor(random(2, 5)),
      hasAntenna: random() < 0.45,
      hasDome: random() < 0.35,
      windowColor: random(neonColors),
      windowStrips: floor(random(4, 9)),
      windowOffsets: Array.from({ length: 8 }, () => random(0.15, 0.9))
    });

    x += w + random(40, 80) * scale;
  }

  return {
    buildings,
    speed,
    baseColor,
    cameraX: 0
  };
}

// ===============================
// DRAW LOOP
// ===============================
function draw() {
  if (state === CITY) {
    drawCityScene();

    if (millis() > impactTime) {
      changeState(IMPACT);
    }
  }

  else if (state === IMPACT) {
    drawImpact();
  }

  else if (state === SILENCE) {
    drawSilence();
  }
}

// ===============================
// CITY SCENE
// ===============================
function drawCityScene() {
  background(0);
  drawSky();
  drawFog();
  drawCity();
  updateCity();
}

// ===============================
// IMPACT SCENE
// ===============================
function drawImpact() {
  let t = millis() - stateStartTime;

  // Weißer Blitz
  if (t < 200) {
    background(255);
    return;
  }

  background(240);

  drawShockwave();
  drawCity(true);

  if (t > 3000) {
    changeState(SILENCE);
  }
}

// ===============================
// SILENCE SCENE
// ===============================
function drawSilence() {
  background(220);
  drawFog(120);
}

// ===============================
// UPDATE
// ===============================
function updateCity() {
  for (let layer of cityLayers) {
    layer.cameraX += layer.speed;
  }
}

// ===============================
// SKY
// ===============================
function drawSky() {
  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let c = lerpColor(
      color(5, 10, 30),
      color(120, 40, 140),
      t
    );
    stroke(c);
    line(0, y, width, y);
  }
}

// ===============================
// FOG
// ===============================
function drawFog(alpha = 60) {
  noStroke();
  fill(200, alpha);
  rect(0, height - 60, width, 100);
}

// ===============================
// SHOCKWAVE
// ===============================
function drawShockwave() {
  shockRadius += 12;

  noFill();
  stroke(255, 180);
  strokeWeight(4);
  ellipse(impactX, impactY, shockRadius * 2);
}

// ===============================
// CITY DRAW
// ===============================
function drawCity(distort = false) {
  for (let layer of cityLayers) {
    push();
    translate(-layer.cameraX, 0);
    for (let b of layer.buildings) {
      drawBuilding(b, layer, distort);
    }
    pop();
  }
}

// ===============================
// BUILDING DRAW
// ===============================
function drawBuilding(b, layer, distort) {
  let groundY = height;

  let offset = 0;

  if (state === IMPACT && distort) {
    let d = dist(
      b.x + b.w / 2,
      groundY - b.h / 2,
      impactX + layer.cameraX,
      impactY
    );

    let force = max(0, shockRadius - d);
    offset = map(force, 0, 300, 0, 40);
  }

  push();
  translate(
    random(-offset, offset),
    random(-offset, offset)
  );

  // Hauptkörper
  noStroke();
  fill(layer.baseColor);
  rect(b.x, groundY - b.h, b.w, b.h);

  // Art-Deco-Stufen
  let stepH = b.h * 0.08;
  for (let i = 1; i <= b.steps; i++) {
    let stepW = b.w * (1 - i * 0.15);
    rect(
      b.x + (b.w - stepW) / 2,
      groundY - b.h - i * stepH,
      stepW,
      stepH
    );
  }

  // Fenster
  if (state !== IMPACT || random() > 0.3) {
    fill(b.windowColor);
    for (let i = 0; i < b.windowStrips; i++) {
      rect(
        b.x + b.w * 0.15,
        groundY - b.windowOffsets[i] * b.h,
        b.w * 0.7,
        b.h * 0.015
      );
    }
  }

  // Kuppel
  if (b.hasDome) {
    fill(180, 220, 255, 160);
    arc(
      b.x + b.w / 2,
      groundY - b.h,
      b.w * 0.6,
      b.w * 0.4,
      PI,
      TWO_PI
    );
  }

  // Antenne
  if (b.hasAntenna) {
    stroke(255);
    strokeWeight(2);
    line(
      b.x + b.w / 2,
      groundY - b.h - b.steps * stepH,
      b.x + b.w / 2,
      groundY - b.h - b.steps * stepH - 50
    );
    noStroke();
  }

  // Kontur
  noFill();
  stroke(255, 100);
  rect(b.x, groundY - b.h, b.w, b.h);
  noStroke();

  pop();
}

// ===============================
// RESIZE
// ===============================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateCity();
}
