function Firework() {
    this.hu = random(255)
    // damit Feuerwerke auf unterschiedlichen Höhen starten
    let startY = random(height * 0.8, height)
    this.startY = startY
    this.firework = new Particle(random(width), startY, this.hu, true);
    this.firework.parentStartY = startY;

    this.exploded = false
    this.particles = []

    this.startSound = fireworkSound.play();

    this.words = ["BOO", "SPOOKY", "HAUNTED"]
    this.fontSize = random(50, 200)
    this.wordAge = 0
    this.wordHoldDuration = 90

    this.done = function () {
        return this.exploded && this.particles.length === 0
    }

    this.update = function () {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update()
            // Feuerwerk hat höchste Position erreicht
            if (this.firework.vel.y >= 0) {
                this.exploded = true
                // stoppt den Start-Sound
                if (this.startSound) {
                    this.startSound.stop();
                }
                // spielt den Explosionssound ab
                this.explosionSound = fireworkExplode.play()

                let word = random(this.words)
                prepareWordPoints(word, this.firework.pos.x, this.firework.pos.y, this.fontSize);

                this.explode()
            }
        }

        // um Wort eine bestimmte Zeit anzuzeigen und Glitzerpartikel für dieses zu erzeugen
        if (this.exploded) {
            this.wordAge++
            if (this.wordAge <= this.wordHoldDuration) {
                for (let p of this.particles) {
                    if (!p.firework) {
                        // Funkelpartikel auf zufälliges Partikel vom Wort
                        if (random() < 0.03) {
                            glitters.push(new GlitterParticle(
                                p.pos.x + random(-2, 2),
                                p.pos.y + random(-2, 2),
                                this.hu
                            ));
                        }
                    }
                }
            }
        }

        if (this.wordAge > this.wordHoldDuration) {
            this.releaseParticles()
        }

        // Partikel updaten
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();
            if (this.particles[i].done()) {
                this.particles.splice(i, 1);
            }
        }
    }

    // Partikel werden von Ziel (Buchstabe) freigegeben und zerfallen
    this.releaseParticles = function () {
        for (let p of this.particles) {
            if (p.target) {
                p.target = null
                p.vel = createVector(random(-1, 1), random(1, 7))
            }
        }
    }


    this.explode = function () {
        if (wordPoints.length > 0) {
            // Partikel von Explosion wird Punkt von Wort zugewiesen
            for (let i = 0; i < wordPoints.length; i++) {
                let target = wordPoints[i]
                let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false, target);

                // damit Wort langsam "entsteht" und nicht plötzlich aufploppt
                p.arrivalDelay = floor(map(i, 0, wordPoints.length - 1, 0, 40))
                p.arrivalDelay += floor(random(-6, 6))

                // p.spawnFrame = frameCount
                p.vel = p5.Vector.random2D().mult(random(2, 4));
                this.particles.push(p)
            }
        } 
        // else {
        //     for (let i = 0; i < 100; i++) {
        //         let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
        //         this.particles.push(p)
        //     }
        // }
    }

    this.show = function () {
        if (!this.exploded) {
            this.firework.show()
        }
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].show()
        }
    }
}
