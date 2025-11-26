function Particle(x, y, hu, firework, target = null){
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
    this.pulseOffset = random(1000)

    if(firework){
        this.vel = createVector(0, random(-21, -12));
    } else {
        this.vel = createVector(0,0);
    }

    this.acc = createVector(0,0);

    this.applyForce = function(force){
        this.acc.add(force);
    }

    this.update = function(){
        // Bewegung auf Target
        if (this.target && !this.arrived) {
            let tNow = frameCount - this.spawnFrame
            if(tNow < this.arrivalDelay){
                let wobble = p5.Vector.random2D().mult(0.5)
                this.vel.add(wobble.mult(5))
                this.vel.mult(0.85)
            } else {
                let toTarget = p5.Vector.sub(this.target, this.pos);
                let dist = toTarget.mag()

                let pull = toTarget.copy().mult(this.ease)
                this.vel.add(pull)
                this.vel.mult(0.85)

                if(dist < 1.5){
                    this.arrived = true
                    this.pos = this.target.copy()
                    this.vel.mult(0)
                    this.holdTimer = 0
                }
            }
        } 

        if(this.arrived){
            this.holdTimer++
            if(this.holdTimer > this.holdDuration){
                this.target= null
                this.vel = p5.Vector.random2D().mult(random(0.5, 2))
            }
        }

        if (!this.firework && !this.target) {
            this.size *= 0.95;
            this.lifespan -= 1
        }

        if(!this.firework){
            this.vel.mult(0.9)
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    this.done = function(){
        return this.lifespan < 0;
    }

    this.show = function(){
        colorMode(HSB)

        let alpha = this.lifespan
        let size = this.size

        if(this.arrived){
            let pulse = map(sin((frameCount + this.pulseOffset) * 0.15), -1, 1, 0.7, 1.6)
            size *= pulse

            alpha = map(this.holdTimer, 0, this.holdDuration, 155, 140)
        } else {
            alpha = constrain(this.lifespan, 100, 255)
        }

        if(this.firework){
            strokeWeight(this.size + 5)
            stroke(this.hu, 255, 255, this.lifespan)
        } else {
            strokeWeight(this.size)
            stroke(this.hu, 255, 255, alpha);
        }
        point(this.pos.x, this.pos.y)
    }
}
