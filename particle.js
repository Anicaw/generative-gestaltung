class Particle {
    constructor(pos, sizeFactor = 1, col = color(137, 207, 240)){
        this.pos = pos.copy()
        let speed = random(1, 3)
        if(sizeFactor > 1){
            speed *= 2
        }
        this.vel = p5.Vector.random2D().mult(speed)
        this.alpha = 255
        this.size = random(1, 6) * sizeFactor
        this.col = col
    }

    update() {
        this.pos.add(this.vel)
        this.vel.mult(0.95)
        this.alpha -= 5
    }

    show(){
        noStroke()
        fill(red(this.col), green(this.col), blue(this.col), this.alpha)
        circle(this.pos.x, this.pos.y, this.size)
    }

    isDead(){
        return this.alpha <= 0
    }
}