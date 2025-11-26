function GlitterParticle(x, y, hu){
    this.pos = createVector(x, y)
    this.hu = hu
    this.lifespan = 60
    this.size = 1.5
    this.vel = p5.Vector.random2D().mult(random(0.5, 2))
    this.acc = createVector(0, 0.05)
}

GlitterParticle.prototype.update = function(){
    this.vel.add(this.acc)
    this.pos.add(this.vel)
    this.lifespan -= 2
}

GlitterParticle.prototype.show = function(){
    colorMode(HSB)
    strokeWeight(this.size)
    let alpha = this.lifespan * random(0.8, 1.2); 
    stroke(this.hu, 255, 255, alpha)
    point(this.pos.x, this.pos.y)
}

GlitterParticle.prototype.done = function(){
    return this.lifespan <= 0
}