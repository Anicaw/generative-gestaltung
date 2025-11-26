function Firework(){
    this.hu = random(255)
    this.firework = new Particle(random(width), height, this.hu, true);
    this.exploded = false
    this.particles = []

    this.words = ["BOO", "SPOOKY"]
    this.fontSize = 120
    this.wordAge = 0

    this.done = function(){
        return this.exploded && this.particles.length === 0
    }

    this.update = function(){
        if(!this.exploded){
            this.firework.applyForce(gravity);
            this.firework.update()
            if(this.firework.vel.y >= 0){
                this.exploded = true

                let word = random(this.words)
                console.log("WORD:", word, typeof word);

                prepareWordPoints(word, this.firework.pos.x, this.firework.pos.y, this.fontSize);

                this.explode()
            }
        }

        if(this.exploded){
            this.wordAge++
        }

        if(this.exploded && this.wordAge === 60){
            this.releaseParticles()
        }

        for(let i = this.particles.length-1; i >= 0; i--){
            this.particles[i].applyForce(gravity);
            this.particles[i].update()
            if(this.particles[i].done()){
                this.particles.splice(i,1)
            }
        }
    }

    this.releaseParticles = function() {
        for(let p of this.particles){
            p.target = null
            p.vel = createVector(random(-1, 1), random(2, 5))
            p.lifespan = 255

            p.growing = true
            
            for(let i = 0; i < 3; i++){
                let g = new GlitterParticle(p.pos.x, p.pos.y, p.hu)
                glitters.push(g)
            }
        }
    }

    this.explode = function(){
        if(wordPoints.length > 0){
            for(let i = 0; i < wordPoints.length; i++){
                let target = wordPoints[i]
                let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false, target);
                p.vel = p5.Vector.random2D().mult(random(2, 4));
                this.particles.push(p)
            }
        } else {
            for(let i = 0; i < 100; i++){
                let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
                this.particles.push(p)
            }
        }
    }

    this.show = function(){
        if(!this.exploded){
            this.firework.show()
        }
        for(let i = 0; i < this.particles.length; i++){
            this.particles[i].show()
        }
    }
}
