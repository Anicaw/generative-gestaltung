let branches = []
let particles = []

let car

let allFinished = false
let finishFrame = 0
let finalColor
let TECH_COLORS = {}

var bgimg

function preload() {
  // bgimg = loadImage('./images/retro_background.jpg')
  bgimg = loadImage('./images/bg-retro.jpg')
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(60)
  TECH_COLORS = {
    young: color(0, 255, 220),   // Neon Cyan
    mid: color(180, 80, 255),    // Electric Purple
    old: color(255, 60, 180),    // Magenta
    dead: color(40, 20, 60),     // Dunkles Violett
    leaf: color(0, 255, 180),
    glow: color(0, 255, 255, 120)
  }
  image(bgimg, 0, 0, width, height)

  car = new Car()

  // Startpos und -richtung von Stamm
  let startPos = createVector(width / 2, height - 50)
  let startDir = createVector(0, -1)

  let root = new Branch(startPos, startDir, random(25, 50), 0)
  branches.push(root)
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

  let baseLeafColor = TECH_COLORS.leaf
  drawingContext.shadowColor = TECH_COLORS.glow

  let leafColor = baseLeafColor
  if (allFinished) {
    let delay = 60
    let t = constrain((frameCount - finishFrame - delay) / 200, 0, 1)
    leafColor = lerpColor(baseLeafColor, leaf.autumnColor, t)
  }

  fill(leafColor)
  drawingContext.shadowBlur = 5
  drawingContext.shadowColor = color(0, 255, 255, 100)

  strokeWeight(2)
  stroke(TECH_COLORS.leaf)
  line(0, 0, 0, -length)

  fill(TECH_COLORS.glow)
  circle(0, -length, 5)
  rotate(sin(frameCount * 0.02 + x * 0.01) * 0.1)

  pop()
}

function startDisintegration() {
  // Alle Äste gleichzeitig zerfallen lassen
  for (let branch of branches) {
    branch.disintegrateStartFrame = frameCount
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
    finalColor = TECH_COLORS.dead
    startDisintegration()
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
}
