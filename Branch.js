class Branch {
    constructor(pos, dir, thickness, depth) {
        this.pos = pos.copy()        // aktuelle Spitze
        this.dir = dir.copy().normalize()
        this.thickness = thickness // Stammdicke
        this.depth = depth         // Verzweigungstiefe (für später)

        this.points = []
        this.points.push({ pos: this.pos.copy(), w: this.thickness })

        this.age = 0
        this.alive = true
        this.hasSplit = false
    }

    grow() {
        if (!this.alive) return

        let step = 1

        // 3D-Noise für organische Krümmung
        let n1 = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01)
        let n2 = noise(this.pos.z * 0.01, this.pos.y * 0.01, frameCount * 0.01 + 100)

        let bend = createVector(
            map(n1, 0, 1, -0.1, 0.01),
            0,
            map(n2, 0, 1, -0.1, 0.1)
        )

        this.dir.add(bend).normalize()

        // Neue Position
        let newPos = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, step))

        // Punkt speichern
        this.pos = newPos
        let t = this.age / 300             // 0 ... 1 (Lebensfortschritt)
        // let w = lerp(this.thickness, this.thickness * 0.8, t) // von dick zu dünn
        let w = this.thickness * (1 - 0.002 * this.age)
        w = max(w, this.thickness * 0.7)


        this.points.push({
            pos: this.pos.copy(),
            w: w
        })

        this.age++

        this.trySplit()

        // Stop-Bedingung (fürs Erste)
        if (this.pos.y < -300) {
            this.alive = false
        }
    }

    trySplit() {
        if (this.depth >= 4) return
        if (this.hasSplit) return
        if (this.age < 40) return

        let n = noise(
            this.pos.x * 0.02,
            this.pos.y * 0.02,
            frameCount * 0.01 + this.depth * 10
        )

        if (n > 0.5) {
            this.split()
            this.hasSplit = true
        }
    }

    split() {
        // Zwei neue Richtungen erzeugen
        let baseDir = this.dir.copy()
        let spread = 100

        let offset1 = createVector(
            random(-spread, spread),
            random(-spread, spread),
            random(-spread, spread)
        )

        let offset2 = createVector(
            random(-spread, spread),
            random(-spread, spread),
            random(-spread, spread)
        )

        let dir1 = p5.Vector.add(baseDir, offset1).normalize()
        let dir2 = p5.Vector.add(baseDir, offset2).normalize()

        // Dicke nimmt ab
        // let newThickness = this.thickness * 0.7
        let lastPoint = this.points[this.points.length - 1]
        let currentThickness = lastPoint.w
        let newThickness = currentThickness * 0.6


        let b1 = new Branch(this.pos, dir1, newThickness, this.depth + 1)
        let b2 = new Branch(this.pos, dir2, newThickness, this.depth + 1)

        // branches.push(b1)
        // branches.push(b2)
        this.newChildren = [b1, b2]
    }

    display() {
        if (this.points.length < 2) return

        let i = this.points.length - 2
        let a = this.points[i]
        let b = this.points[i + 1]

        // let t = i / this.points.length
        // let w = lerp(this.thickness, 1, t)
        strokeWeight(a.w)

        line(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z)
    }

}
