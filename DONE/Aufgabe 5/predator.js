class Predator extends Boid {
    constructor(pos) {
        super()
        this.position = pos ? pos.copy() : createVector(random(width), random(height))
        this.maxSpeed = 7
        this.isPredator = true

        this.size = 40
        this.maxSize = 160
        this.growAmount = 6

        this.hasBurst = false
    }

    // um zum nächsten Fisch zu schwimmen
    flock(boids) {
        // nächster Fisch
        let target = this.findClosestPrey(boids)
        // wenn Fisch in der Nähe, verfolg diesen
        if (target) {
            // Vektor Richtung Beutefisch
            let desired = p5.Vector.sub(target.position, this.position)
            desired.setMag(this.maxSpeed)
            // um in Richtung der kleinen Fische zu lenken
            let steer = p5.Vector.sub(desired, this.velocity)
            this.acceleration.add(steer)
        }
    }

    edges() {
        let margin = 50
        let turnStrenght = 1.8
        // links
        if (this.position.x < margin) {
            this.acceleration.x += turnStrenght
        }
        // rechts
        if (this.position.x > width - margin) {
            this.acceleration.x -= turnStrenght
        }
        // oben
        if (this.position.y < margin) {
            this.acceleration.y += turnStrenght
        }
        // unten
        if (this.position.y > height - margin) {
            this.acceleration.y -= turnStrenght
        }
    }
    
    // um den nächsten Fisch vom Raubfisch zu finden
    findClosestPrey(boids) {
        let minD = Infinity
        let closest = null
        for (let b of boids) {
            // um Entfernung von Fisch zu berechnen, wenn dieser kein Raubfisch ist 
            if (!b.isPredator) {
                let d = p5.Vector.dist(this.position, b.position)
                // wenn der Abstand kleiner ist als minD, setze minD auf diesen Wert
                if (d < minD) {
                    minD = d
                    closest = b
                }
            }
        }
        // gibt nächsten Fisch zurück
        return closest
    }

    // handelt, wenn ein Fisch nah ist und gefressen wird
    eat(flock){
        let prey = this.findClosestPrey(flock)
        let d = p5.Vector.dist(this.position, prey.position)
        if(d < this.size * 0.8){
            // Sound, "Explosion", Wachsen
            waterSound.play(0, 1, 1, 0, 0.9)
            eating.play(0, 1, 1, 0, 0.7)
            particleBursts.push(new ParticleBurst(prey.position.copy()))
            this.size += this.growAmount
            // gefressenen Fisch aus Array entfernen
            let index = flock.indexOf(prey)
            if(index > -1){
                flock.splice(index, 1)
            }
        }
    }

    // Raubfisch platzt, wenn er maximale Größe erreicht hat 
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
    
        // größe
        let displayHeight = this.size * (frameHeight / frameWidth)
    
        push()
        translate(this.position.x, this.position.y)
        rotate(this.orientation)
    
        // Schatten
        noStroke()
        fill(0, 40)
        ellipse(0, 0, this.size * 0.8, displayHeight * 0.7)
    
        imageMode(CENTER)
    
        let sx = this.frame * frameWidth
    
        image(
            predatorSprite,
            0, 0,
            this.size, displayHeight,
            sx, 0, 
            frameWidth, frameHeight
        )
    
        pop()
    }
    
}