
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

    this.baseColor = baseColor ? baseColor : TECH_COLORS.young
    this.disintegrateStartFrame = null
    this.disintegrating = false
    this.disintegrateIndex = null

    this.restAngle = this.dir.heading()
    this.swingAngle = 0
    this.swingVel = 0
    this.swingStrength = map(this.thickness, 5, 40, 0.08, 0.02)

  }

  grow() {
    // Wachstum

    // Stockendes Wachstum
    if (this.alive && random() < 0.6) return;

    if (this.alive) {
      // // Wind vom Auto
      // let d = dist(this.pos.x, this.pos.y, car.x, car.y)

      // if (d < car.windRadius) {
      //   let strength = map(d, 0, car.windRadius, car.windStrength, 0)
      //   let windDir = p5.Vector.sub(this.pos, createVector(car.x, car.y)).normalize()

      //   // seitlicher Windstoß
      //   this.dir.add(windDir.mult(strength)).normalize()
      // }


      let lifeRatio = this.age / this.maxAge
      // let step = map(lifeRatio, 0, 1, 1.5, 0.05)
      let speedFactor = 2  // 2 = doppelte Geschwindigkeit
      let step = map(lifeRatio, 0, 1, 1.5, 0.05) * speedFactor
      this.pos.add(p5.Vector.mult(this.dir, step))
      let n = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01)
      let bend = createVector(map(n, 0, 1, -0.1, 0.1), 0)
      this.dir.add(bend).normalize()
      // this.dir.lerp(createVector(0, -1), 0.01).normalize()
      this.dir.lerp(createVector(0, -1), 0.005)


      this.pos.add(p5.Vector.mult(this.dir, step))

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
      if (this.age > this.maxAge) this.alive = false

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
        leaf.vel.y += 0.05
        leaf.vel.x += random(-0.02, 0.02)
        leaf.pos.add(leaf.vel)
      }
    }

    this.leaves = this.leaves.filter(leaf => leaf.pos.y < height + 100)

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

    // Zufällige leichte Abweichung von ±15 Grad
    let angleOffset1 = radians(random(-70, 70))
    let angleOffset2 = radians(random(-70, 70))
    // Kindrichtungen
    let dir1 = p5.Vector.fromAngle(baseDir.heading() + angleOffset1)
    let dir2 = p5.Vector.fromAngle(baseDir.heading() + angleOffset2)

    let lastPoint = this.points[this.points.length - 1]
    let newThickness = lastPoint.w * 0.9
    let ageRatio = this.age / this.maxAge
    let currentColor = lerpColor(TECH_COLORS.young, TECH_COLORS.mid, ageRatio)
    let splitPos = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, -5))
    this.newChildren = [
      new Branch(splitPos, dir1, newThickness, this.depth + 1, currentColor),
      new Branch(splitPos, dir2, newThickness, this.depth + 1, currentColor)
    ]
  }

  disintegrate() {

    // if (frameCount % 3 !== 0) return;

    let t = frameCount - this.disintegrateStartFrame;

    // kurze aktive Phase
    if (t % 30 < 5) {
      // zerfallen erlaubt
    } else {
      return; // Pause
    }


    let ageRatio = constrain(this.age / this.maxAge, 0, 1);

    let currentColor = ageRatio < 0.5
      ? lerpColor(TECH_COLORS.young, TECH_COLORS.mid, ageRatio * 2)
      : lerpColor(TECH_COLORS.mid, TECH_COLORS.old, (ageRatio - 0.5) * 2);

    if (allFinished) {
      let t = constrain((frameCount - finishFrame) / 200, 0, 1);
      currentColor = lerpColor(currentColor, TECH_COLORS.dead, t);
    }


    // Initialisierung
    if (this.disintegrateIndex === null) {
      this.disintegrateIndex = this.points.length - 1;
    }

    // Wenn keine Punkte mehr übrig → Ast als tot markieren
    if (this.points.length === 0) {
      this.alive = false;
      return;
    }

    let p = this.points[this.disintegrateIndex];

    // Partikel erzeugen
    if (random() < 0.1) {
      let count = int(random(1, 12));
      for (let i = 0; i < count; i++) {
        particles.push(
          new Particle(
            p.pos.x,
            p.pos.y,
            random(6, 180),
            currentColor
          )
        );

      }
    }

    // Punkt entfernen
    this.points.splice(this.disintegrateIndex, 1);

    // Index runterzählen, niemals < 0
    this.disintegrateIndex--;
    if (this.disintegrateIndex < 0) {
      this.disintegrateIndex = 0;
    }

    // Prüfen, ob Ast fertig zerfallen ist
    if (this.points.length === 0) {
      this.alive = false;
    }
  }


  display() {
    if (this.points.length < 2) return
    let ageRatio = constrain(this.age / this.maxAge, 0, 1)
    let currentColor = ageRatio < 0.5 ?
      lerpColor(TECH_COLORS.young, TECH_COLORS.mid, ageRatio * 2) :
      lerpColor(TECH_COLORS.mid, TECH_COLORS.old, (ageRatio - 0.5) * 2)

    if (allFinished) {
      let t = constrain((frameCount - finishFrame) / 200, 0, 1)
      currentColor = lerpColor(currentColor, TECH_COLORS.dead, t)
    }

    stroke(currentColor)
    noFill()
    for (let i = 0; i < this.points.length - 1; i++) {
      let a = this.points[i]
      let b = this.points[i + 1]
      for (let k = 0; k < 2; k++) {
        strokeWeight(a.w * (1 - k * 0.3))
        line(a.pos.x + random(-0.3, 0.3), a.pos.y, b.pos.x + random(-0.3, 0.3), b.pos.y)
      }
    }

    // Innenliegende Ströme verblassen am Lebensende
    let fade = 1;

    // Wenn Wachstum vorbei ist → langsam ausblenden
    if (!this.alive) {
      fade = constrain(1 - (frameCount - this.maxAge) / 200, 0, 1);
    }

    // Globales Ende (alle Äste tot)
    if (allFinished) {
      let t = constrain((frameCount - finishFrame) / 200, 0, 1);
      fade = 1 - t;
    }

    for (let p of this.points) {
      if (random() < 0.01 * fade) {
        fill(
          0,
          255,
          255,
          120 * fade
        );
        noStroke();
        circle(p.pos.x, p.pos.y, random(2, 5) * fade);
      }
    }


    for (let leaf of this.leaves) {
      if (leaf.pos.y < height + 50) drawLeaf2D(leaf)
    }
  }

  addLeaf() {
    let p = this.pos.copy()
    this.leaves.push({
      pos: p,
      angle: random(-PI / 3, PI / 3),
      tilt: random(-PI / 6, PI / 6),
      length: random(3, 10),
      maxLength: random(50, 150),
      growing: true,
      dir: this.dir.copy(),
      autumnColor: color(random(120, 180), random(60, 120), 0),
      falling: false,
      vel: createVector(0, 0),
      fallDelay: int(random(0, 120))
    })
  }
}