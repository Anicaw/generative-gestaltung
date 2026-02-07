class FogPatch {
    constructor(minSize = 120, maxSize = 320, speed = 0.2) {
      this.minSize = minSize;
      this.maxSize = maxSize;
      this.speed = speed;
      this.reset();
      this.texture = this.makeTexture();
    }
  
    reset() {
      let yBias = 1 - pow(random(), 2.5);
      this.pos = createVector(random(width), yBias * height);
  
      this.size = random(this.minSize, this.maxSize);
      this.vel = p5.Vector.random2D().mult(this.speed);
  
      this.life = random(600, 1200);
      this.maxLife = this.life;
    }
  
    makeTexture() {
      let g = createGraphics(this.size, this.size);
      g.noStroke();
      let cx = this.size / 2;
      let cy = this.size / 2;
  
      for (let y = 0; y < this.size; y += 2) {
        for (let x = 0; x < this.size; x += 2) {
          let dx = x - cx;
          let dy = y - cy;
          let d = sqrt(dx * dx + dy * dy);
          let n = noise(x * 0.03, y * 0.03);
          let edge = map(d, 0, this.size * 0.5, 1, 0, true);
          let alpha = 90 * edge * n; // stronger alpha for apocalypse
          g.fill(120, 220, 255, alpha);
          g.rect(x, y, 2, 2);
        }
      }
  
      return g;
    }
  
    update() {
      this.pos.add(this.vel);
      if (this.pos.x > width + this.size) this.pos.x = -this.size;
      if (this.pos.x < -this.size) this.pos.x = width + this.size;
      if (this.pos.y > height + this.size) this.pos.y = -this.size;
      if (this.pos.y < -this.size) this.pos.y = height + this.size;
  
      this.life--;
      if (this.life <= 0) this.reset();
    }
  
    draw(g) {
      let fade = sin(map(this.life, 0, this.maxLife, 0, PI));
      g.tint(255, 255 * fade);
      g.image(
        this.texture,
        this.pos.x - this.size / 2,
        this.pos.y - this.size / 2,
      );
      g.noTint();
    }
  }