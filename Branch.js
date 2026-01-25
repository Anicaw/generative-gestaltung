
class Branch {
    constructor(pos, dir, thickness, depth, baseColor) {
        this.pos = pos.copy()        // aktuelle Spitze
        this.dir = dir.copy().normalize()
        this.thickness = thickness // Stammdicke
        this.depth = depth         // Verzweigungstiefe (für später)

        this.points = []
        this.points.push({ pos: this.pos.copy(), w: this.thickness })

        this.age = 0
        this.alive = true
        this.maxAge = int(random(80, 500)) - this.depth * 20
        this.hasSplit = false
        this.lastSplitAge = 0

        this.leaves = []

        if (baseColor) {
            this.baseColor = baseColor
        } else {
            this.baseColor = color(0, 255, 255)
        }
    }

    grow() {
        if (!this.alive) return

        let up = createVector(0, -1)

        let lifeRatio = this.age / this.maxAge
        let step = map(lifeRatio, 0, 1, 1.2, 0.1)

        let n = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01)

        let bend = createVector(
            map(n, 0, 1, -0.1, 0.1),
            0
        )

        this.dir.add(bend).normalize()

        // sanfter Bias nach oben
        let biasStrength = 0.05
        this.dir.lerp(createVector(0, -1), biasStrength)
        this.dir.normalize()


        // Neue Position
        let newPos = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, step))

        // Punkt speichern
        this.pos = newPos

        let w = this.thickness * (1 - 0.002 * this.age * random(0.9, 1.1))
        w = max(w, this.thickness * 0.7)

        this.points.push({
            pos: this.pos.copy(),
            w: w
        })

        // Zufällig ein Blatt anlegen (nur bei jüngeren Zweigen)
        if (this.depth >= 1 && this.depth <= 3) {
            if (random() < 0.002) {   // 1% Chance pro Schritt
                this.addLeaf()
            }
        }

        for (let leaf of this.leaves) {
            if (leaf.growing) {
                leaf.length += 0.1
                if (leaf.length > leaf.maxLength) {
                    leaf.length = leaf.maxLength
                    leaf.growing = false
                }
            }
        }

        this.age++

        if (this.age > this.maxAge) {
            this.alive = false
            return
        }

        this.trySplit()

        // Stop-Bedingung (fürs Erste)
        if (this.pos.y < -300) {
            this.alive = false
        }
    }

    trySplit() {
        if (this.depth >= 4) return
        if (this.hasSplit) return
        if (this.age - this.lastSplitAge < 40) return

        let n = noise(
            this.pos.x * 0.02,
            this.pos.y * 0.02,
            frameCount * 0.01 + this.depth * 10
        )

        if (n > 0.5 + random(-0.1, 0.1)) {
            this.split()
            this.hasSplit = true
        }
    }

    split() {
        // Zwei neue Richtungen erzeugen
        let baseDir = this.dir.copy()
        let spread = 50

        let offset1 = createVector(
            random(-spread, spread),
            random(-spread, spread),
            // random(-spread, spread)
        )

        let offset2 = createVector(
            random(-spread, spread),
            random(-spread, spread),
            // random(-spread, spread)
        )

        let dir1 = p5.Vector.add(baseDir, offset1).normalize()
        let dir2 = p5.Vector.add(baseDir, offset2).normalize()

        // Dicke nimmt ab
        // let newThickness = this.thickness * 0.7
        let lastPoint = this.points[this.points.length - 1]
        let currentThickness = lastPoint.w
        let newThickness = currentThickness * 0.8

        // Farbe am Abzweigungspunkt bestimmen (aus Alter)
        let ageRatio = this.age / this.maxAge
        let currentColor = lerpColor(
            color(0, 255, 255),
            color(50, 0, 100),
            ageRatio
        )


        let backOffset = p5.Vector.mult(this.dir, -5)
        let splitPos = p5.Vector.add(this.pos, backOffset)

        let b1 = new Branch(splitPos, dir1, newThickness, this.depth + 1, currentColor)
        let b2 = new Branch(splitPos, dir2, newThickness, this.depth + 1, currentColor)

        this.newChildren = [b1, b2]
    }

    display() {
        if (this.points.length < 2) return

        let i = this.points.length - 2
        let a = this.points[i]
        let b = this.points[i + 1]

        // Alter der Linie bestimmen (zwischen 0 und 1)
        let ageRatio = this.age / this.maxAge;

        // Farbe nach Alter: jung = cyan, alt = dunkelviolett
        let targetColor = color(50, 0, 100)
        stroke(lerpColor(this.baseColor, targetColor, ageRatio));
        // stroke(0, 100, 100, 180);
        strokeWeight(a.w)

        line(a.pos.x, a.pos.y, b.pos.x, b.pos.y)

        // Blätter zeichnen
        for (let leaf of this.leaves) {
            drawLeaf2D(
                leaf.pos.x,
                leaf.pos.y,
                leaf.dir,
                leaf.angle,
                leaf.length
            )
        }
    }

    addLeaf() {
        let p = this.pos.copy()

        // Blatt wächst senkrecht leicht vom Ast weg
        let angle = random(-PI / 3, PI / 3)
        let tilt = random(-PI / 6, PI / 6)

        this.leaves.push({
            pos: p,
            angle: angle,
            tilt: tilt,
            length: random(3, 10),   // Startlänge
            maxLength: random(20, 100),
            growing: true,
            dir: this.dir.copy()
        })
    }

}
