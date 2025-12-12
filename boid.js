class Boid {
    constructor() {
        this.position = createVector(random(width), random(height))
        this.velocity = p5.Vector.random2D()
        this.velocity.setMag(random(1.5, 4))
        this.acceleration = createVector()
        this.maxForce = 1
        this.maxSpeed = random(2, 3)
        this.orientation = 0

        this.frame = 0;            // aktueller Frame
        this.frameDelay = 50;       // wie viele draw()-Frames zwischen Bildwechsel
        this.frameCounter = 0;
    }

    animateSprite() {
        let speed = this.velocity.mag()
        let minDelay = 4
        let maxDelay =15

        this.frameDelay = map(speed, 0, this.maxSpeed, maxDelay, minDelay)
        this.frameDelay = constrain(this.frameDelay, minDelay, maxDelay)

        this.frameCounter++;
    
        if (this.frameCounter >= this.frameDelay) {
            this.frameCounter = 0;
            this.frame = (this.frame + 1) % totalFrames;
        }
    }

    // edges() {
    //     if (this.position.x > width) {
    //         this.position.x = 0
    //     } else if (this.position.x < 0) {
    //         this.position.x = width
    //     }
    //     if (this.position.y > height) {
    //         this.position.y = 0
    //     } else if (this.position.y < 0) {
    //         this.position.y = height
    //     }
    // }

    edges(turnStrength) {
        let margin = 20
        // links
        if (this.position.x < margin) {
            this.acceleration.x += turnStrength;
        }
        // rechts
        if (this.position.x > width - margin) {
            this.acceleration.x -= turnStrength;
        }
        // oben
        if (this.position.y < margin) {
            this.acceleration.y += turnStrength;
        }
        // unten
        if (this.position.y > height - margin) {
            this.acceleration.y -= turnStrength;
        }
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

    fleePredators(predators){
        let flee = createVector()
        let fleeRadius = 120
        for(let p of predators){
            let d = p5.Vector.dist(this.position, p.position)
            if(d < fleeRadius){
                let away = p5.Vector.sub(this.position, p.position)
                away.normalize()
                away.div(d)
                flee.add(away)
            }
        }
        if(flee.mag() > 0){
            flee.setMag(this.maxSpeed)
            flee.sub(this.velocity)
            flee.limit(this.maxForce * 2)
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
        let targetAngle = this.velocity.heading() + HALF_PI;
        let diff = targetAngle - this.orientation;
        diff = atan2(sin(diff), cos(diff)); // kleinster Winkel
        this.orientation += diff * 0.08;     // weich über Frames
    }
    // ChatGPT Ende

    show() {
        this.animateSprite();
        this.smoothRotate();
    
        // Größe eines einzelnen Frames
        let frameWidth = fishSprite.width / totalFrames;
        let frameHeight = fishSprite.height;
    
        // gewünschte Größe am Canvas
        let displayWidth = 30;
        let displayHeight = displayWidth * (frameHeight / frameWidth);
    
        push();
        translate(this.position.x, this.position.y);
        rotate(this.orientation);
    
        // --- SCHATTEN ---
        noStroke();
        fill(0, 40);
        ellipse(3, 3, displayWidth * 0.9, displayHeight * 0.4);
    
        // --- SPRITE ---
        imageMode(CENTER);
    
        let sx = this.frame * frameWidth;
        let sy = 0;
    
        image(
            fishSprite,
            0, 0,
            displayWidth, displayHeight,
            sx, sy,
            frameWidth, frameHeight
        );
    
        pop();
    }
    
}