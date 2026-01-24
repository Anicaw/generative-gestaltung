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

function setup() {
  createCanvas(800, 800)
  background(240)
  angleMode(DEGREES)

  // Start-Branch: ein Stamm
  let startPos = createVector(width / 2, height - 50)  // unten in der Mitte
  let startDir = createVector(0, -1)

  let root = new Branch(startPos, startDir, 12, 0)
  branches.push(root)
}

function drawLeaf2D(x, y, dir, angle, length) {
  push()
  translate(x, y)

  // Richtung des Astes als Winkel
  let theta = atan2(dir.y, dir.x)

  rotate(theta + angle)

  let hue = map(y, 0, height, 300, 360); // pink → lila
  fill(hue, 80, 100);
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = color(0, 255, 255, 100); // cyan glow


  // fill(50, 150, 50)
  noStroke()

  beginShape()
  vertex(0, 0)
  bezierVertex(10, -length / 2, 20, -length / 2, 0, -length)
  bezierVertex(-20, -length / 2, -10, -length / 2, 0, 0)
  endShape(CLOSE)

  pop()
}

function draw() {
  let newBranches = []

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

