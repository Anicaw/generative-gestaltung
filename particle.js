class Particle {
    constructor(pos){
        this.pos = pos.copy()
        // let angle = random(TWO_PI)
        // let speed = random(2, 8)
        // this.vel = p5.Vector.fromAngle(angle).mult(speed)
        this.vel = p5.Vector.random2D().mult(random(1, 3))
        this.alpha = 255
        this.size = random(1, 6)
    }

    update() {
        this.pos.add(this.vel)
        this.vel.mult(0.95)
        this.alpha -= 8
    }

    show(){
        noStroke()
        fill(255, 150, 0, this.alpha)
        circle(this.pos.x, this.pos.y, this.size)
    }

    isDead(){
        return this.alpha <= 0
    }
}