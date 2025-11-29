function Particle(x, y, hu, firework, target = null) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.size = 3
    this.hu = hu;
    this.lifespan = 255;
    this.target = target;

    this.spawnFrame = frameCount || 0
    this.arrivalDelay = 0
    this.arrived = false
    this.holdTimer = 0
    this.holdDuration = 60
    this.ease = 0.012
    // this.pulseOffset = 1

    if (firework) {
        this.vel = createVector(0, random(-19, -12));
    } else {
        this.vel = createVector(0, 0);
    }

    this.acc = createVector(0, 0);

    this.applyForce = function (force) {
        this.acc.add(force);
    }

    this.update = function () {
        // Bewegung auf Target
        if (this.target && !this.arrived) {
            let tNow = frameCount - this.spawnFrame
            if (tNow < this.arrivalDelay) {
                let wobble = p5.Vector.random2D().mult(0.5)
                this.vel.add(wobble.mult(5))
                this.vel.mult(0.85)
            } else {
                let toTarget = p5.Vector.sub(this.target, this.pos);
                let dist = toTarget.mag()
                let pull = toTarget.copy().mult(this.ease)
                // damit sich Partikel auf ihrer Position bewegen
                let wobble = p5.Vector.random2D().mult(0.3)
                this.vel.add(p5.Vector.mult(wobble, 0.6))
                this.vel.add(pull)
                this.vel.mult(0.85)

                if (dist < 1.5) {
                    this.arrived = true
                    this.pos = this.target.copy()
                    this.vel.mult(0)
                    this.holdTimer = 0
                }
            }
        }

        if (this.arrived) {
            this.holdTimer++
            // this.size = 3 + sin(frameCount * 0.8 + this.pulseOffset) * 2
            if (this.holdTimer > this.holdDuration) {
                this.target = null
                this.vel = p5.Vector.random2D().mult(random(0.5, 2))
            }
        }

        if (!this.firework && !this.target) {
            this.size *= 0.95;
            this.lifespan -= 1
            this.vel.mult(0.9)
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    this.done = function () {
        return this.lifespan < 0;
    }

    this.show = function () {
        colorMode(HSB)
        if (this.firework) {
            strokeWeight(this.size + 5)
            stroke(this.hu, 255, 255, this.lifespan)
        } else {
            strokeWeight(this.size)
            stroke(this.hu, 255, 255, this.lifespan);
        }
        point(this.pos.x, this.pos.y)
    }
}
