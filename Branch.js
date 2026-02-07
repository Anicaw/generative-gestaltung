
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
    // Wachstum
    // Stockendes Wachstum
    if (this.alive && random() < 0.5) return;

    if (this.alive) {
      let lifeRatio = this.age / this.maxAge
      let speedFactor = 2  // 2 = doppelte Geschwindigkeit
      let step = map(lifeRatio, 0, 1, 1.5, 0.05) * speedFactor
      this.pos.add(p5.Vector.mult(this.growDir, step))
      let n = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01)
      let bend = createVector(map(n, 0, 1, -0.1, 0.1), 0)
      this.growDir.add(bend).normalize()
      this.growDir.lerp(createVector(0, -1), 0.005)

      // Ruhelage langsam anpassen (nur wenn wachsend)
      if (this.alive) {
        if (this.age % 20 === 0) {
          this.restDir.lerp(this.growDir, 0.01)
        }
      }

      let w = max(this.thickness * (1 - 0.002 * this.age * random(0.9, 1.1)), this.thickness * 0.7)
      this.points.push({ pos: this.pos.copy(), w: w })

      if (this.depth >= 1 && this.depth <= 3 && random() < 0.005) this.addLeaf()

      for (let leaf of this.leaves) {
        if (leaf.growing) {
          leaf.length += 0.1
          if (leaf.length > leaf.maxLength) leaf.growing = false
        }
      }

      this.age++
      // if (this.age > this.maxAge) this.alive = false
      if (this.age > this.maxAge) {
        this.alive = false
        this.deathFrame = frameCount
      }

      this.trySplit()
    }

    // Blatt-Physik
    for (let leaf of this.leaves) {
      if (allFinished && !leaf.falling) {
        let t = frameCount - finishFrame
        if (t > leaf.fallDelay) {
          leaf.falling = true
          leaf.vel = createVector(random(-0.3, 0.3), random(0.5, 1.5))
        }
      }

      if (leaf.falling) {
        // Initialisiere worldPos, falls noch nicht vorhanden
        if (!leaf.worldPos) {
          let idx = constrain(leaf.anchorIndex, 0, this.points.length - 1);
          let p = this.points[idx] ? this.points[idx].pos.copy() : createVector(0, 0);
          leaf.worldPos = p;
        }
        // Bewegung anwenden
        leaf.worldPos.add(leaf.vel);
      }
    }

    this.leaves = this.leaves.filter(leaf => {
      let y
      if (leaf.falling) {
        y = leaf.worldPos ? leaf.worldPos.y : 0 // falls worldPos noch nicht initialisiert
      } else {
        let idx = constrain(leaf.anchorIndex, 0, this.points.length - 1);
        y = this.points[idx] ? this.points[idx].pos.y : 0 // falls points noch nicht existiert
      }
      return y < height + 100;
    });

    // Zerfall starten
    if (this.disintegrateStartFrame !== null && frameCount >= this.disintegrateStartFrame) {
      this.disintegrating = true
    }

    if (this.disintegrating) {
      if (this.points.length > 0) this.disintegrate()
      else {
        this.alive = false
        this.disintegrating = false
      }
    }

    if (this.disintegrating) {
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
    let chance = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01)
    if (chance > 0.1 + random(-0.1, 0.1)) {
      this.split()
      this.hasSplit = true
    }
  }

  split() {
    let baseDir = this.dir.copy()

    // Zufällige leichte Abweichung
    let angleOffset1 = radians(random(-70, 70))
    let angleOffset2 = radians(random(-70, 70))
    // Kindrichtungen
    let dir1 = p5.Vector.fromAngle(baseDir.heading() + angleOffset1)
    let dir2 = p5.Vector.fromAngle(baseDir.heading() + angleOffset2)

    let lastPoint = this.points[this.points.length - 1]
    let newThickness = lastPoint.w * 0.9
    let ageRatio = this.age / this.maxAge
    let currentColor = lerpColor(treeColors.young, treeColors.mid, ageRatio)
    let splitPos = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, -5))
    this.newChildren = [
      new Branch(splitPos, dir1, newThickness, this.depth + 1, currentColor),
      new Branch(splitPos, dir2, newThickness, this.depth + 1, currentColor)
    ]
  }

  applyCarWind(car) {
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
    let t = frameCount - this.disintegrateStartFrame;
    let speed = 4; // 🔥 höher = schnellerer Zerfall

    // OPTIONAL: Bremse raus → schneller
    if (t % 30 >= 5) return

    let ageRatio = constrain(this.age / this.maxAge, 0, 1)

    let currentColor = ageRatio < 0.5
      ? lerpColor(treeColors.young, treeColors.mid, ageRatio * 2)
      : lerpColor(treeColors.mid, treeColors.old, (ageRatio - 0.5) * 2)

    if (allFinished) {
      let tt = constrain((frameCount - finishFrame) / 200, 0, 1)
      currentColor = lerpColor(currentColor, treeColors.dead, tt)
    }

    // Initialisierung
    if (this.disintegrateIndex === null) {
      this.disintegrateIndex = this.points.length - 1
    }

    for (let i = 0; i < speed; i++) {
      if (this.disintegrateIndex < 0 || this.points.length === 0) break

      let p = this.points[this.disintegrateIndex]

      // 🔁 BEND wie im display()
      let base = this.points[0].pos;
      let distFromBase = p5.Vector.sub(p.pos, base).mag()
      
      let bendDir = p5.Vector.sub(this.dir, this.restDir)
      let bendAmount = bendDir.mag();
      
      let normal = createVector(
        -this.restDir.y,
        this.restDir.x
      );
      
      let bendOffset = p5.Vector.mult(
        normal,
        distFromBase * bendAmount * 0.15
      );
      
      let worldPos = p5.Vector.add(p.pos, bendOffset)
      
      // Partikel an sichtbarer Astposition
      if (random() < 0.25) {
        particles.push(
          new Particle(
            worldPos.x + random(-2, 2),
            worldPos.y + random(-2, 2),
            random(80, 160),
            currentColor
          )
        );
      }
      


      // Punkt entfernen
      this.points.splice(this.disintegrateIndex, 1);
      this.disintegrateIndex--;
    }

    if (this.points.length === 0) {
      this.alive = false;
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

    let ageRatio = constrain(this.age / this.maxAge, 0, 1)
    let currentColor = ageRatio < 0.5 ?
      lerpColor(treeColors.young, treeColors.mid, ageRatio * 2) :
      lerpColor(treeColors.mid, treeColors.old, (ageRatio - 0.5) * 2)

    if (allFinished) {
      let t = constrain((frameCount - finishFrame) / 200, 0, 1)
      currentColor = lerpColor(currentColor, treeColors.dead, t)
    }

    stroke(currentColor)
    noFill()
    for (let i = 0; i < this.points.length - 1; i++) {
      let a = this.points[i]
      let b = this.points[i + 1]
      for (let k = 0; k < 2; k++) {
        strokeWeight(a.w * (1 - k * 0.3))
        // line(a.pos.x + random(-0.3, 0.3), a.pos.y, b.pos.x + random(-0.3, 0.3), b.pos.y)
        let da = p5.Vector.sub(a.pos, base).mag()
        let db = p5.Vector.sub(b.pos, base).mag()

        let fa = da * bendAmount * 0.15
        let fb = db * bendAmount * 0.15

        let offsetA = p5.Vector.mult(normal, fa)
        let offsetB = p5.Vector.mult(normal, fb)

        line(
          a.pos.x + offsetA.x,
          a.pos.y + offsetA.y,
          b.pos.x + offsetB.x,
          b.pos.y + offsetB.y
        )

      }
    }

    // Innenliegende Ströme verblassen am Lebensende
    let fade = 1;

    // Wenn Wachstum vorbei ist → langsam ausblenden
    if (!this.alive && this.deathFrame !== undefined) {
      fade = constrain(1 - (frameCount - this.deathFrame) / 200, 0, 1)
    }

    // Globales Ende (alle Äste tot)
    if (allFinished) {
      let t = constrain((frameCount - finishFrame) / 200, 0, 1);
      fade = 1 - t;
    }

// für den Glow
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
        circle(
          glowPos.x,
          glowPos.y,
          random(2, 5) * fade
        )
      }
    }
    

    // for (let leaf of this.leaves) {
    //   if (leaf.pos.y < height + 50) drawLeaf2D(leaf)
    // }
    for (let leaf of this.leaves) {
      if (!leaf.falling) {
        this.drawAttachedLeaf(leaf)
      } else {
        // drawLeaf2D(leaf)
        drawLeaf2D({
          pos: leaf.worldPos,
          angle: leaf.angle,
          length: leaf.length,
          autumnColor: leaf.autumnColor,
          dir: this.dir
        })
      }
    }

  }

  addLeaf() {
    // let p = this.pos.copy()
    // this.leaves.push({
    //   pos: p,
    //   angle: random(-PI / 3, PI / 3),
    //   tilt: random(-PI / 6, PI / 6),
    //   length: random(3, 10),
    //   maxLength: random(50, 150),
    //   growing: true,
    //   dir: this.dir.copy(),
    //   autumnColor: color(random(120, 180), random(60, 120), 0),
    //   falling: false,
    //   vel: createVector(0, 0),
    //   fallDelay: int(random(0, 120))
    // })
    let anchorIndex = this.points.length - 1

    this.leaves.push({
      anchorIndex,
      offset: random(-6, 6),
      angle: random(-PI / 3, PI / 3),
      length: random(3, 10),
      maxLength: random(50, 150),
      growing: true,
      autumnColor: color(random(120, 180), random(60, 120), 0),
      falling: false,
      vel: createVector(0, 0),
      fallDelay: int(random(0, 120))
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
      length: leaf.length,
      autumnColor: leaf.autumnColor
    })
  }

}