class Car {
    constructor() {
      this.x = random(width)
      // oben im Bildschirm
      this.baseY = random(50, 100)
      this.y = this.baseY
      this.speed = random(1, 5)
      this.size = random(200, 320)
      this.phase = random(TWO_PI)
      this.windStrength = 2.0
      this.windRadius = 300
      this.img = carimg
    }
  
    update() {
      this.x += this.speed
      this.phase += 0.03
  
      // sanftes Schweben
      this.y = this.baseY + sin(this.phase) * 35
  
      // wenn rechts raus -> links neu starten
      if (this.x > width + this.size) {
        this.x = -this.size
        this.baseY = random(50, 150)
      }
    }
  
    display() {
      noStroke()
      image(this.img, this.x, this.y, this.size, this.size)
    }
  }
  