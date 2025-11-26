function Particle(x, y, hu, firework, target = null){
    this.pos = createVector(x, y);
    this.firework = firework;
    this.size = 3
    this.hu = hu;
    this.lifespan = 255;
    this.target = target;

    if(firework){
        this.vel = createVector(0, random(-12, -8));
    } else {
        this.vel = createVector(0,0);
    }

    this.acc = createVector(0,0);

    this.applyForce = function(force){
        this.acc.add(force);
    }

    this.update = function(){
        // if(this.target){
        //     let dir = p5.Vector.sub(this.target, this.pos);
        //     dir.setMag(0.9)
        //     // dir.mult(0.1);
        //     this.vel.add(dir);
        // }

        if (this.target) {
            let toTarget = p5.Vector.sub(this.target, this.pos);
            // let d = toTarget.mag();
        
            // Federstärke (stärker = mehr bounce)
            let springK = 0.04;
        
            // Anziehungskraft proportional zur Distanz
            let force = toTarget.copy().mult(springK);
        
            this.vel.add(force);
        
            // Leichte Dämpfung: verhindert Endlos-Oszillation
            let damping = 0.9;
            this.vel.mult(damping);
        }

        if(!this.firework){
            this.lifespan -= 4;
            this.vel.mult(0.9);
            if(!this.target){

            }
        }

        if(this.growing){
            this.size = map(this.lifespan, 255, 0, this.size, this.size*0.9)
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    this.done = function(){
        return this.lifespan < 0;
    }

    this.show = function(){
        colorMode(HSB);
        if(this.firework){
            strokeWeight(this.size + 2)
            stroke(this.hu, 255, 255, this.lifespan)
        } else {
            strokeWeight(this.size)
            stroke(this.hu, 255, 255, this.lifespan);
        }
        point(this.pos.x, this.pos.y)
    }
}
