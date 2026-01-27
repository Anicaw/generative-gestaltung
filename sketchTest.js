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


let branches = []

let allFinished = false
let finishFrame = 0
let finalColor

var bgimg

function preload() {
  bgimg = loadImage('./images/retro_background.jpg')
}


function setup() {
  createCanvas(800, 800)
  // background(240)
  image(bgimg, 0, 0, width, height)

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

  // Ausgangsfarbe
  let baseLeafColor = color(
    map(y, 0, height, 100, 180),
    200,
    200
  )

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

  beginShape()
  vertex(0, 0)
  bezierVertex(10, -5, 20, -1, 0, -length)
  bezierVertex(-20, -1, -10, -1, 0, 0)
  endShape(CLOSE)

  pop()
}

function draw() {
  image(bgimg, 0, 0, width, height)

  let newBranches = []

  // Prüfen, ob noch irgendein Ast lebt
  let anyAlive = false
  for (let b of branches) {
    if (b.alive) {
      anyAlive = true
      break
    }
  }

  // Wenn zum ersten Mal alle fertig sind → Umschaltphase starten
  if (!anyAlive && !allFinished) {
    allFinished = true
    finishFrame = frameCount
    finalColor = color(120, 80, 40) // BRAUN
  }


  for (let b of branches) {
    b.grow()
    b.display()

    // neue Kinder sammeln
    if (b.newChildren) {
      for (let c of b.newChildren) {
        newBranches.push(c)
      }
      b.newChildren = null
    }
  }

  // nach der Schleife hinzufügen
  for (let nb of newBranches) {
    branches.push(nb)
  }

}

