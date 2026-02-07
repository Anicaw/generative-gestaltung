let branches = []
let particles = []

let allFinished = false
let finishFrame = 0
let finalColor
let treeColors = {}

let bgimg
let carimg

// Nebel
let fogLayers = []
let fogGraphics

let car

function preload() {
  bgimg = loadImage('./images/bg-retro.jpg')
  carimg = loadImage('./images/car.png')
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(60)
  treeColors = {
    young: color(0, 255, 220),   // Neon Cyan
    mid: color(180, 80, 255),    // Electric Purple
    old: color(255, 60, 180),    // Magenta
    dead: color(40, 20, 60),     // Dunkles Violett
    leaf: color(0, 255, 180)
  }
  image(bgimg, 0, 0, width, height)

  car = new Car()

  // Startpos und -richtung von Stamm
  let startPos = createVector(width / 2, height - 50)
  let startDir = createVector(0, -1)

  let root = new Branch(startPos, startDir, random(25, 50), 0)
  branches.push(root)
  
  fogGraphics = createGraphics(width, height)
  fogGraphics.noStroke()

  // mehrere Ebenen des Nebels, damit es realistischer aussieht
  let layerConfigs = [
    { count: 25, minSize: 150, maxSize: 300, speed: 0.7 }, // background wisps
    { count: 20, minSize: 300, maxSize: 500, speed: 0.3 }, // mid fog
    { count: 15, minSize: 400, maxSize: 700, speed: 0.2 }, // foreground cloud
  ];

  for (let cfg of layerConfigs) {
    let layer = []
    for (let i = 0; i < cfg.count; i++) {
      layer.push(new FogPatch(cfg.minSize, cfg.maxSize, cfg.speed));
    }
    fogLayers.push(layer);
  }
}

function drawLeaf2D(leaf) {
  let x = leaf.pos.x
  let y = leaf.pos.y
  let dir = leaf.dir
  let angle = leaf.angle
  let length = leaf.length

  push()
  translate(x, y)

  let theta = atan2(dir.y, dir.x)
  rotate(theta + angle)

  fill(treeColors.leaf)
  strokeWeight(2)
  stroke(treeColors.leaf)
  line(0, 0, 0, -length)
  circle(0, -length, 5)
  pop()
}

function startDisintegration() {
  // Alle Äste gleichzeitig zerfallen lassen
  for (let branch of branches) {
    branch.disintegrateStartFrame = frameCount
  }
}

function drawFog() {
  fogGraphics.clear();
  for (let layer of fogLayers) {
    for (let f of layer) {
      f.update();
      f.draw(fogGraphics);
    }
  }
}

function draw() {
  image(bgimg, 0, 0, width, height)

  // Framerate anzeigen
  fill(255)             // Weißer Text
  noStroke()
  textSize(20)
  textAlign(LEFT, TOP)
  text("FPS: " + floor(frameRate()), 10, 10)



  car.update()
  car.display()


  // Prüfen, ob noch irgendein Ast lebt
  let anyAlive = false
  for (let b of branches) {
    if (b.alive) {
      anyAlive = true
      break
    }
  }

  // Umschalten, wenn alle Äste fertig sind
  if (!anyAlive && !allFinished) {
    allFinished = true
    finishFrame = frameCount
    finalColor = treeColors.dead
    startDisintegration()
  }

    // Neuen Baum pflanzen, wenn keine Bäume mehr existieren
    if (branches.length === 0) {
      let newX = width / 2 + random(-100, 100)
      let newPos = createVector(newX, height - 50)
      let newDir = createVector(0, -1)
      let newRoot = new Branch(newPos, newDir, random(20, 40), 0)
      branches.push(newRoot)
      allFinished = false // Reset, damit der neue Baum wächst
    }

  // Äste aktualisieren
  for (let i = branches.length - 1; i >= 0; i--) {
    let b = branches[i]
    b.grow()
    b.display()

    // Neue Kinder sammeln
    if (b.newChildren) {
      for (let c of b.newChildren) {
        branches.push(c)
      }
      b.newChildren = null
    }

    // Entfernen, wenn Ast komplett zerfallen
    if (!b.alive && b.points.length === 0) {
      branches.splice(i, 1)
    }
  }

  // Partikel aktualisieren
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i]
    p.update()
    p.show()
    if (p.done()) {
      particles.splice(i, 1)
    }
  }

  drawFog()
  image(fogGraphics, 0, 0)
}
