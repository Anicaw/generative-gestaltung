class Boid {
    constructor() {
        this.position = createVector(random(width), random(height))
        this.velocity = p5.Vector.random2D()
        this.velocity.setMag(random(1.5, 4))
        this.acceleration = createVector()
        this.maxForce = 0.5
        this.maxSpeed = random(4, 6)
        this.orientation = 0

        this.fishSize = 50

        // für Animation des Sprites
        this.frame = 0
        this.frameDir = 1
        this.frameDelay = 50
        this.frameCounter = 0
    }

    // Flossenbewegung mit Sprite
    // je schneller der Fisch, desto schneller die Bewegung
    animateSprite() {
        let speed = this.velocity.mag();
        let minDelay = 2
        let maxDelay = 15
    
        this.frameDelay = map(speed, 0, this.maxSpeed, maxDelay, minDelay)
    
        this.frameCounter++
    
        if (this.frameCounter >= this.frameDelay) {
            this.frameCounter = 0
    
            this.frame += this.frameDir
    
            // Richtungswechsel an den Enden im Sprite
            if (this.frame >= totalFrames - 1) {
                this.frame = totalFrames - 1
                this.frameDir = -1
            } 
            else if (this.frame <= 0) {
                this.frame = 0
                this.frameDir = 1
            }
        }
    }

    // prüft, ob Fisch außerhalb des Canvas ist
    isOutOfBounds() {
        let frameWidth = fishSprite.width / totalFrames
        let frameHeight = fishSprite.height
        let displayHeight = this.fishSize * (frameHeight / frameWidth)
    
        // Hälfte von Fisch
        let halfW = this.fishSize / 2
        let halfH = displayHeight / 2
    
        return (
            this.position.x < -halfW ||
            this.position.x > width + halfW ||
            this.position.y < -halfH ||
            this.position.y > height + halfH
        )
    }
    

    align(boids) {
        let perceptionRadius = 100
        let steering = createVector()
        let total = 0
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y)
            if (other != this && d < perceptionRadius) {
                steering.add(other.velocity)
                total++
            }
        }
        if (total > 0) {
            steering.div(total)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    separation(boids) {
        let perceptionRadius = 80
        let steering = createVector()
        let total = 0
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y)
            if (other != this && d < perceptionRadius) {
                let diff = p5.Vector.sub(this.position, other.position)
                diff.div(d)
                steering.add(diff)
                total++
            }
        }
        if (total > 0) {
            steering.div(total)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    cohesion(boids) {
        let perceptionRadius = 100
        let steering = createVector()
        let total = 0
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y)
            if (other != this && d < perceptionRadius) {
                steering.add(other.position)
                total++
            }
        }
        if (total > 0) {
            steering.div(total)
            steering.sub(this.position)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    // Kombiniert Fisch-/Schwarmregeln und beinhaltet Fluchtverhalten vor Raubfisch(en)
    flock(boids) {
        let alignment = this.align(boids)
        let cohesion = this.cohesion(boids)
        let separation = this.separation(boids)

        this.acceleration.add(separation)
        this.acceleration.add(cohesion)
        this.acceleration.add(alignment)

        let flee = this.fleePredators(predators)
        this.acceleration.add(flee.mult(3))
    }

    // damit Fisch von Raubfisch wegschwimmt (Fluchtrichtung); gibt Richtung vor
    fleePredators(predators){
        let flee = createVector()
        let fleeRadius = 180
        for(let p of predators){
            // Entfernung zwischen Fisch und Raubfisch
            let d = p5.Vector.dist(this.position, p.position)
            // damit Fisch in andere Richtung von Raubfisch flieht
            if(d < fleeRadius){
                let away = p5.Vector.sub(this.position, p.position)
                flee.add(away)
            }
        }
        return flee
    }

    update() {
        this.position.add(this.velocity)
        this.velocity.add(this.acceleration)
        this.velocity.limit(this.maxSpeed)
        this.acceleration.mult(0)
    }

    // ChatGPT Start
    smoothRotate(){
        let targetAngle = this.velocity.heading() + HALF_PI
        let diff = targetAngle - this.orientation
        diff = atan2(sin(diff), cos(diff))
        this.orientation += diff * 0.08
    }
    // ChatGPT Ende

    show() {
        this.animateSprite();
        this.smoothRotate();
    
        // Größe eines Frames
        let frameWidth = fishSprite.width / totalFrames
        let frameHeight = fishSprite.height
    
        // Größe im Canvas
        let displayHeight = this.fishSize * (frameHeight / frameWidth)
    
        push()
        translate(this.position.x, this.position.y)
        rotate(this.orientation)
    
        // Schatten
        noStroke()
        fill(0, 40)
        ellipse(0, 0, this.fishSize * 0.8, displayHeight * 0.6)
    
        // Sprite von Mitte gezeichnet
        imageMode(CENTER)
    
        // startX /-Y im Spritebild -> für Einzelbilder
        let sx = this.frame * frameWidth
        let sy = 0
    
        image(
            fishSprite,
            0, 0,
            this.fishSize, displayHeight,
            sx, sy,
            frameWidth, frameHeight
        );
    
        pop();
    }
    
}