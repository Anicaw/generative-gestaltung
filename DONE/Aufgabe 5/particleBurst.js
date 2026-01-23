class ParticleBurst {
    constructor(pos, large = false, col = color(137, 207, 240)){
        this.particles = []
        let sizeFactor = large ? 2 : 1
        for (let i = 0; i < 50; i++){
            this.particles.push(new Particle(pos, sizeFactor, col))
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