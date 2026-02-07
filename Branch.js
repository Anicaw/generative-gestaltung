
class Branch {
  constructor(pos, dir, thickness, depth, baseColor) {
    this.pos = pos.copy()
    this.dir = dir.copy().normalize()
    this.thickness = thickness
    this.depth = depth
    this.points = [{ pos: this.pos.copy(), w: this.thickness }]
    this.age = 0
    this.alive = true
    this.maxAge = int(random(180, 600)) - this.depth * 20
    this.hasSplit = false
    this.lastSplitAge = 0
    this.leaves = []

    this.baseColor = baseColor ? baseColor : treeColors.young
    this.disintegrateStartFrame = null
    this.disintegrating = false
    this.disintegrateIndex = null
    this.crackingStart = false

    this.restAngle = this.dir.heading()
    this.swingAngle = 0
    this.swingVel = 0
    this.swingStrength = map(this.thickness, 5, 40, 0.08, 0.02)

    this.restDir = this.dir.copy()   // Zielrichtung (Ruhelage)
    this.windOffset = createVector(0, 0)
    this.windVel = createVector(0, 0)

    this.windStrength = map(this.depth, 0, 5, 0.8, 0.15) // obere Äste stärker
    this.returnStrength = map(this.thickness, 5, 40, 0.002, 0.015)
    this.damping = 0.92            // Dämpfung

    this.growDir = this.dir.copy() // reine Wachstumsrichtung (ohne Wind)
  }

  grow() {
    // Stockendes Wachstum
    if (this.alive && random() < 0.55) return

    // Wachstum
    if (this.alive) {
      let lifeRatio = this.age / this.maxAge
      let speedFactor = 2
      let step = map(lifeRatio, 0, 1, 1.5, 0.05) * speedFactor // damit spätere Äste langsamer wachsen
      this.pos.add(p5.Vector.mult(this.growDir, step))
      let n = noise(this.pos.x * 0.01, this.pos.y * 0.01)
      let bend = createVector(map(n, 0, 1, -0.1, 0.1), 0)
      this.growDir.add(bend).normalize()
      this.growDir.lerp(createVector(0, -1), 0.005) // nach oben

      // Ruhelage langsam anpassen (nur wenn wachsend)
      if (this.alive) {
        if (this.age % 20 === 0) {
          this.restDir.lerp(this.growDir, 0.01)
        }
      }

      // damit Äste dünner werden
      let w = max(this.thickness * (1 - 0.002 * this.age * random(0.9, 1.1)), this.thickness * 0.7)

      this.points.push({ pos: this.pos.copy(), w: w })

      // Blätter erzeugen (aber nur geringe Wahrscheinlichkeit)
      if (this.depth >= 1 && this.depth <= 4 && random() < 0.005) {
        this.addLeaf()
      }
      // Blatt Wachstum
      for (let leaf of this.leaves) {
        if (leaf.growing) {
          leaf.length += 0.1
          if (leaf.length > leaf.maxLength) leaf.growing = false // stoppt bei max. Größe
        }
      }

      this.age++
      // wenn maxAge erreicht, stoppt Wachstum
      if (this.age > this.maxAge) {
        this.alive = false
        this.deathFrame = frameCount
      }      

      this.trySplit()
    }

    // Blattlogik
    for (let leaf of this.leaves) {
      if (allFinished && !leaf.falling) {
        // damit nicht alle Blätter gleichzeitig fallen
        let t = frameCount - finishFrame
        if (t > leaf.fallDelay) {
          leaf.falling = true
          leaf.vel = createVector(random(-0.3, 0.3), random(0.5, 1.5))
        }
      }

      // ---------------------------------------------------------------------------
      if (leaf.falling) {
        // Initialisiere worldPos, falls noch nicht vorhanden
        if (!leaf.worldPos) {
          let idx = constrain(leaf.anchorIndex, 0, this.points.length - 1)
          let p = this.points[idx] ? this.points[idx].pos.copy() : createVector(0, 0)
          leaf.worldPos = p;
        }
        // Bewegung anwenden
        leaf.worldPos.add(leaf.vel)
      }
      // ---------------------------------------------------------------------------
    }

    this.leaves = this.leaves.filter(leaf => {
      let y
      if (leaf.falling) {
        y = leaf.worldPos ? leaf.worldPos.y : 0
      } else {
        let idx = constrain(leaf.anchorIndex, 0, this.points.length - 1);
        y = this.points[idx] ? this.points[idx].pos.y : 0
      }
      return y < height + 100;
    })

    // Zerfall starten
    if (this.disintegrateStartFrame !== null && frameCount >= this.disintegrateStartFrame) {
      this.disintegrating = true
    }
    if (this.disintegrating) {
      
    if (!this.crackingStarted) {
      if (!cracking.isPlaying()) {
        cracking.setLoop(true)
        cracking.setVolume(0.6)
        cracking.play()
      }
      this.crackingStarted = true
    }
      this.disintegrate();
    }

    // Punkte, die außerhalb des Canvas liegen, entfernen
    this.points = this.points.filter(p =>
      p.pos.x >= -50 && p.pos.x <= width + 50 &&
      p.pos.y >= -50 && p.pos.y <= height + 50
    )

    this.applyCarWind(car)
    this.updateWind()
  }

  trySplit() {
    if (this.depth >= 4 || this.hasSplit || this.age - this.lastSplitAge < 60) return

    if (random() > 0.1) {
      this.split()
      this.hasSplit = true
    }
  }

  split() {
    let baseDir = this.dir.copy()
    // Richtung der neuen Äste, bzw Verzweigungen
    let angleOffset = radians(random(-65, 65))
    let dir = p5.Vector.fromAngle(baseDir.heading() + angleOffset)
    // Dicke des Astes
    let lastPoint = this.points[this.points.length - 1]
    let newThickness = lastPoint.w * 0.9
    let ageRatio = this.age / this.maxAge
    let currentColor = lerpColor(treeColors.young, treeColors.mid, ageRatio)
    let splitPos = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, -3))
    this.newChildren = [
      new Branch(splitPos, dir, newThickness, this.depth + 1, currentColor),
      new Branch(splitPos, dir, newThickness, this.depth + 1, currentColor)
    ]
  }

  applyCarWind(car) {
    // wenn Ast eher Stamm ist und Distanz zu groß --> keine Auswirkung
    if (this.depth < 2) return
    let d = dist(this.pos.x, this.pos.y, car.x, car.y)
    if (d > car.windRadius) return

    let distanceFactor = map(d, 0, car.windRadius, 1, 0)
    let speedFactor = map(car.speed, 0, 5, 0.2, 1.2)
    let force = distanceFactor * speedFactor * car.windStrength
    force *= this.windStrength

    // Grundrichtung vom Auto
    let windDir = p5.Vector.sub(this.pos, createVector(car.x, car.y))
    windDir.normalize()

    // Turbulenz
    let n = noise(
      this.pos.x * 0.01,
      this.pos.y * 0.01,
      frameCount * 0.05
    )
    windDir.rotate(map(n, 0, 1, -0.3, 0.3))
    windDir.mult(force)

    this.windVel.add(windDir)
  }

  updateWind() {
    let diff = p5.Vector.sub(this.restDir, this.dir)
    diff.mult(this.returnStrength)

    this.windVel.add(diff)
    this.windVel.mult(this.damping)
    this.windVel.limit(0.5)

    this.dir.add(this.windVel).normalize()
  }


  disintegrate() {
    let t = frameCount - this.disintegrateStartFrame
    let speed = 6 // Zerfallgeschwindigkeit
    
    // damit nicht in jedem Frame Zerfall stattfindet 
    if (t % 30 >= 5) return

    let ageRatio = constrain(this.age / this.maxAge, 0, 1)

    // aktuelle Farbe des Astes
    let currentColor = ageRatio < 0.5
      ? lerpColor(treeColors.young, treeColors.mid, ageRatio * 2)
      : lerpColor(treeColors.mid, treeColors.old, (ageRatio - 0.5) * 2)

    if (allFinished) {
      let tt = constrain((frameCount - finishFrame) / 200, 0, 1)
      currentColor = lerpColor(currentColor, treeColors.dead, tt)
    }

    if (this.disintegrateIndex === null) {
      this.disintegrateIndex = this.points.length - 1
    }

    // entfernt "speed"(Anzahl) an Punkten
    for (let i = 0; i < speed; i++) {
      if (this.disintegrateIndex < 0 || this.points.length === 0) break

      let p = this.points[this.disintegrateIndex] // Punkt, der zerfällt

      let base = this.points[0].pos
      let distFromBase = p5.Vector.sub(p.pos, base).mag()

      let bendDir = p5.Vector.sub(this.dir, this.restDir)
      let bendAmount = bendDir.mag()

      // damit Partikel da sind, wo Ast aktuell ist (bei Wind)
      let normal = createVector(-this.restDir.y, this.restDir.x)
      let bendOffset = p5.Vector.mult(normal, distFromBase * bendAmount * 0.15)
      let worldPos = p5.Vector.add(p.pos, bendOffset)
      // damit nicht zu viele Partikel erstellt werden --> if
      if (random() < 0.25) {
        particles.push(
          new Particle(
            worldPos.x + random(-2, 2),
            worldPos.y + random(-2, 2),
            random(80, 160),
            currentColor
          )
        )
      }
      // Punkt entfernen
      this.points.splice(this.disintegrateIndex, 1)
      this.disintegrateIndex--
    }

    if (this.points.length === 0) {
      this.alive = false
    }
  }


  display() {
    if (this.points.length < 2) return

    let base = this.points[0].pos
    let bendDir = p5.Vector.sub(this.dir, this.restDir)
    let bendAmount = bendDir.mag()

    let normal = createVector(
      -this.restDir.y,
      this.restDir.x
    )

    // Farbe des Astes
    let ageRatio = constrain(this.age / this.maxAge, 0, 1)
    let currentColor = ageRatio < 0.5 ?
      lerpColor(treeColors.young, treeColors.mid, ageRatio * 2) :
      lerpColor(treeColors.mid, treeColors.old, (ageRatio - 0.5) * 2)

    // Äste sterben langsam
    if (allFinished) {
      let t = constrain((frameCount - finishFrame) / 200, 0, 1)
      currentColor = lerpColor(currentColor, treeColors.dead, t)
    }

    // Ast zeichnen
    stroke(currentColor)
    noFill()
    for (let i = 0; i < this.points.length - 1; i++) {
      let a = this.points[i]
      let b = this.points[i + 1]
      strokeWeight(this.thickness)
      // damit oben mehr gebogen wird
      let da = p5.Vector.sub(a.pos, base).mag()
      let db = p5.Vector.sub(b.pos, base).mag()
      // 
      let fa = da * bendAmount * 0.15
      let fb = db * bendAmount * 0.15
      // damit innere Ströme mit verschoben werden bei Wind
      let offsetA = p5.Vector.mult(normal, fa)
      let offsetB = p5.Vector.mult(normal, fb)

      line(
        a.pos.x + offsetA.x,
        a.pos.y + offsetA.y,
        b.pos.x + offsetB.x,
        b.pos.y + offsetB.y
      )
    }

    // Innenliegende Ströme verblassen am Lebensende
    let fade = 1

    if (!this.alive && this.deathFrame !== undefined) {
      fade = constrain(1 - (frameCount - this.deathFrame) / 200, 0, 1)
    }

    // Globales Ende (alle Äste tot)
    if (allFinished) {
      let t = constrain((frameCount - finishFrame) / 200, 0, 1)
      fade = 1 - t
    }

    // für innere "Leitungen"
    for (let p of this.points) {
      if (random() < 0.04 * fade) {
        let distFromBase = p5.Vector.sub(p.pos, base).mag()
        let glowOffset = p5.Vector.mult(
          normal,
          distFromBase * bendAmount * 0.15
        )
        let glowPos = p5.Vector.add(p.pos, glowOffset)
        fill(0, 255, 255, 120 * fade)
        noStroke()
        circle(glowPos.x, glowPos.y, random(2, 5) * fade)
      }
    }

    for (let leaf of this.leaves) {
      if (!leaf.falling) {
        this.drawAttachedLeaf(leaf)
      } else {
        drawLeaf2D({
          pos: leaf.worldPos,
          angle: leaf.angle,
          length: leaf.length,
          dir: this.dir
        })
      }
    }

  }

  addLeaf() {
    let anchorIndex = this.points.length - 1 // fester Punkt am Ast
    this.leaves.push({
      anchorIndex,
      // offset: random(-6, 6),
      angle: random(-PI / 3, PI / 3),
      length: 0,
      maxLength: random(50, 150),
      growing: true,
      falling: false,
      vel: createVector(0, 0),
      fallDelay: int(random(0, 80))
    })
  }

  drawAttachedLeaf(leaf) {
    let idx = constrain(leaf.anchorIndex, 0, this.points.length - 1)
    let p = this.points[idx].pos

    let base = this.points[0].pos
    let distFromBase = p5.Vector.sub(p, base).mag()

    let bendDir = p5.Vector.sub(this.dir, this.restDir)
    let bendAmount = bendDir.mag()

    let normal = createVector(
      -this.restDir.y,
      this.restDir.x
    )

    let bendOffset = p5.Vector.mult(
      normal,
      distFromBase * bendAmount * 0.15
    )

    let leafPos = p5.Vector.add(p, bendOffset)

    drawLeaf2D({
      pos: leafPos,
      dir: this.dir,
      angle: leaf.angle,
      length: leaf.length
    })
  }
}