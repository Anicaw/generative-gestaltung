class Car {
    constructor() {
      this.x = random(width)
      this.baseY = random(50, 150)     // oberer Bildschirmbereich
      this.y = this.baseY
      this.speed = random(1, 5)
      this.size = random(10, 20)
      this.phase = random(TWO_PI)
      this.windStrength = 0.15
      this.windRadius = 200
    }
  
    update() {
      this.x += this.speed
      this.phase += 0.03
  
      // sanftes Schweben
      this.y = this.baseY + sin(this.phase) * 10
  
      // wenn rechts raus → links neu starten
      if (this.x > width + this.size) {
        this.x = -this.size
        this.baseY = random(50, 150)
      }
    }
  
    display() {
      noStroke()
      fill(0, 255, 255, 180)   // Neon-Cyan, passt zu deinem Stil
      circle(this.x, this.y, this.size)
    }
  }
  