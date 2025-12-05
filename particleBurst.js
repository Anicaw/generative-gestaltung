class ParticleBurst {
    constructor(pos){
        this.particles = []
        for (let i = 0; i < 25; i++){
            this.particles.push(new Particle(pos))
        }
    }

    update(){
        for(let p of this.particles){
            p.update()
        }
        this.particles = this.particles.filter(p => !p.isDead())
    }

    show( ){
        for (let p of this.particles){
            p.show()
        }
    }

    isDone(){
        return this.particles.length === 0
    }
}