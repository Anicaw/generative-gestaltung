function Particle(x, y, hu, firework, target = null) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.size = 3
    this.hu = hu;
    this.lifespan = 255;
    this.target = target;

    this.spawnFrame = frameCount || 0
    this.arrived = false
    this.ease = 0.012

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
            // damit sich das Wort langsam aufbaut
            let tNow = frameCount - this.spawnFrame
            if (tNow < this.arrivalDelay) {
                let wobble = p5.Vector.random2D().mult(0.5)
                this.vel.add(wobble.mult(5))
                this.vel.mult(0.85)
            } else {
                let toTarget = p5.Vector.sub(this.target, this.pos)
                let pull = toTarget.copy().mult(this.ease)
                // damit sich Partikel auf ihrer Position bewegen
                let wobble = p5.Vector.random2D().mult(0.3)
                this.vel.add(p5.Vector.mult(wobble, 0.6))
                this.vel.add(pull)
                this.vel.mult(0.85)
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
        // Feuerwerk steigt auf --> großer Partikel
        if (this.firework) {
            strokeWeight(this.size + 5)
            stroke(this.hu, 255, 255)
            // wenn es nicht das Feuerwerk ist, sind Partikel kleiner
        } else {
            strokeWeight(this.size)
            stroke(this.hu, 255, 255);
        }
        point(this.pos.x, this.pos.y)
    }
}
