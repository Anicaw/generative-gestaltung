class Particle {
  constructor(x, y, life, col) {
    this.pos = createVector(x, y)
    // Partikel starten ohne Aufwärtsbewegung
    this.vel = p5.Vector.random2D().mult(random(0.5, 1)) // nur leichter horizontaler Zufall
    this.vel.y = random(0.5, 2) // immer nach unten
    this.lifespan = life
    this.size = random(8, 15)
    this.col = col
  }

  update() {
    // Schwerkraft nach unten
    this.vel.y += 0.05
    this.pos.add(this.vel)
    this.lifespan--
  }

  show() {
    noStroke()
    let c = color(
      red(this.col),
      green(this.col),
      blue(this.col),
      this.lifespan
    )
    fill(c)
    rectMode(CENTER)
    rect(this.pos.x, this.pos.y, this.size, this.size)

  }

  done() {
    // Entfernen, wenn Partikel außerhalb des Bildes oder zu alt
    return this.pos.y > height + 50 || this.lifespan <= 0
  }
}
