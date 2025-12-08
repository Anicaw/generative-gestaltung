class Predator extends Boid {
    constructor(pos) {
        super()
        this.position = pos ? pos.copy() : createVector(random(width), random(height))
        this.maxSpeed = 4.2
        this.maxForce = 0.6
        this.isPredator = true
    }

    flock(boids) {
        let target = this.findClosestPrey(boids)
        if (target) {
            let desired = p5.Vector.sub(target.position, this.position)
            desired.setMag(this.maxSpeed)
            let steer = p5.Vector.sub(desired, this.velocity)
            steer.limit(this.maxForce)
            this.acceleration.add(steer)
        }
    }

    findClosestPrey(boids) {
        let minD = Infinity
        let closest = 0
        for (let b of boids) {
            if (!b.isPredator) {
                let d = p5.Vector.dist(this.position, b.position)
                if (d < minD) {
                    minD = d
                    closest = b
                }
            }
        }
        return closest
    }

    eat(flock){
        let prey = this.findClosestPrey(flock)
        if(!prey){
            return
        }
        let d = p5.Vector.dist(this.position, prey.position)
        if(d < 15){
            particleBursts.push(new ParticleBurst(prey.position))
            let index = flock.indexOf(prey)
            if(index > -1){
                flock.splice(index, 1)
            }
        }
    }

    show(){
        push()
        translate(this.position.x, this.position.y)
        noStroke()
        fill(255, 0, 0)
        circle(0, 0, 25)
        pop()
    }
}