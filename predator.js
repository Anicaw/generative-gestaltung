class Predator extends Boid {
    constructor(pos) {
        super()
        this.position = pos ? pos.copy() : createVector(random(width), random(height))
        this.maxSpeed = 4
        this.maxForce = 0.6
        this.isPredator = true

        this.size = 20
        this.maxSize = 100
        this.growAmount = 6

        this.hasBurst = false

        this.frame = 0
        this.frameDelay = 6
        this.frameCounter = 0
        this.orientation = 0
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

    edges() {
        let margin = 50;
        let maxForce = 0.4;
    
        // LINKER RAND
        if (this.position.x < margin) {
            let f = map(this.position.x, 0, margin, maxForce, 0);
            this.acceleration.x += f;
        }
    
        // RECHTER RAND
        if (this.position.x > width - margin) {
            let f = map(this.position.x, width, width - margin, maxForce, 0);
            this.acceleration.x -= f;
        }
    
        // OBERER RAND
        if (this.position.y < margin) {
            let f = map(this.position.y, 0, margin, maxForce, 0);
            this.acceleration.y += f;
        }
    
        // UNTERER RAND
        if (this.position.y > height - margin) {
            let f = map(this.position.y, height, height - margin, maxForce, 0);
            this.acceleration.y -= f;
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
        if(d < this.size * 0.5){
            waterSound.play(0, 1, 1, 0, 0.9)
            eating.play(0, 1, 1, 0, 0.7)
            particleBursts.push(new ParticleBurst(prey.position.copy()))
            this.size += this.growAmount
            let index = flock.indexOf(prey)
            if(index > -1){
                flock.splice(index, 1)
            }
        }
    }

    burst(){
        if (this.hasBurst) return
        this.hasBurst = true
        
        let pink = color(255, 105, 180)
        particleBursts.push(new ParticleBurst(this.position.copy(), true, pink))
    
        burstPredator.stop()
        burstPredator.play(0, random(0.9, 1.1), 1, 0, 0.9)
    }
    

    update(){
        this.edges()
        this.position.add(this.velocity)
        this.velocity.add(this.acceleration)
        this.velocity.limit(this.maxSpeed)
        this.acceleration.mult(0)
        if(this.size >= this.maxSize){
            this.burst()
        }
    }

    show(){
        this.animateSprite()
        this.smoothRotate()
    
        let frameWidth = predatorSprite.width / totalFrames
        let frameHeight = predatorSprite.height
    
        // größer als normale Fische
        let displayWidth = map(this.size, 20, this.maxSize, 20, 80)
        let displayHeight = displayWidth * (frameHeight / frameWidth)
    
        push()
        translate(this.position.x, this.position.y)
        rotate(this.orientation)
    
        // Schatten
        noStroke()
        fill(0, 50)
        ellipse(5, 5, displayWidth * 0.9, displayHeight * 0.4)
    
        imageMode(CENTER)
    
        let sx = this.frame * frameWidth
    
        image(
            predatorSprite,
            0, 0,
            displayWidth, displayHeight,
            sx, 0,
            frameWidth, frameHeight
        )
    
        pop()
    }
    
}