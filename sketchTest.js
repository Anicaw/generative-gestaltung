// let v = []
// let rows = 30
// let cols = 90

// function setup() {
//   createCanvas(850, 850, WEBGL)
//   colorMode(HSB, 360, 100, 100)
//   angleMode(DEGREES)

//   stroke(71, 26, 92)
//   strokeWeight(6)

//   for (theta = 0; theta < rows; theta += 1) {
//     v.push([])
//     for (let phi = 0; phi < cols; phi += 1) {
//       let r = (70 * pow(abs(sin(phi * 360 / cols * 5 / 2)), 1) + 225) * theta / rows
//       let x = r * cos(phi * 360 / cols)
//       let y = r * sin(phi * 360 / cols)
//       let z = vShape(300, r / 100, 0.8, 0.15, 1.5) - 200 + bumpiness(1.5, r / 100, 12, phi * 360 / cols)
//       let pos = createVector(x, y, z)
//       v[theta].push(pos)
//     }
//   }
// }

// function draw() {
//   background(75, 79, 51)
//   rotateX(80)
//   orbitControl(4, 4)

//   for (let theta = 0; theta < v.length; theta++) {
//     for (let phi = 0; phi < v[theta].length; phi++) {
//       if (theta < v.length - 1 && phi < v[theta].length - 1) {
//         beginShape()
//         vertex(v[theta][phi].x, v[theta][phi].y, v[theta][phi].z)
//         vertex(v[theta + 1][phi].x, v[theta + 1][phi].y, v[theta + 1][phi].z)
//         vertex(v[theta + 1][phi + 1].x, v[theta + 1][phi + 1].y, v[theta + 1][phi + 1].z)
//         vertex(v[theta][phi + 1].x, v[theta][phi + 1].y, v[theta][phi + 1].z)
//         endShape(CLOSE)
//       }
//     }
//   }
//   // v = []
// }


// function vShape(A, r, a, b, c) {
//   return A * pow(Math.E, -b * pow(abs(r), c)) * pow(abs(r), a)
// }

// function bumpiness(A, r, f, angle) {
//   return 1 + A * pow(r, 2) * sin(f * angle)
// }

let obstacles = [];

let branches = []
let particles = []

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
  createCanvas(800, 800)
  TECH_COLORS = {
    young: color(0, 255, 220),   // Neon Cyan
    mid: color(180, 80, 255),    // Electric Purple
    old: color(255, 60, 180),    // Magenta
    dead: color(40, 20, 60),     // Dunkles Violett
    leaf: color(0, 255, 180),
    glow: color(0, 255, 255, 120)
  }
  image(bgimg, 0, 0, width, height)

  obstacles.push({ x: 250, y: 300, w: 100, h: 300 });

  obstacles.push({ x: 450, y: 400, w: 100, h: 300 });

  // Startpos und -richtung von Stamm
  let startPos = createVector(width / 2, height - 50)
  let startDir = createVector(0, -1)

  let root = new Branch(startPos, startDir, 15, 0)
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

  strokeWeight(1)
  stroke(TECH_COLORS.leaf)
  line(0, 0, 0, -length)

  fill(TECH_COLORS.glow)
  circle(0, -length, 4)
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

  for (let obs of obstacles) {
    fill(150, 100, 50, 150);
    noStroke();
    rect(obs.x, obs.y, obs.w, obs.h);
  }

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
