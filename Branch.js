
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
        this.maxAge = int(random(180, 800)) - this.depth * 20
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

        // -----------------------------
        // 1. Ast-Wachstum (nur wenn alive)
        // -----------------------------
        if (this.alive) {
    
            // wie schnell Äste wachsen
            let lifeRatio = this.age / this.maxAge
            let step = map(lifeRatio, 0, 1, 1, 0.05)
    
            let n = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01)
    
            let bend = createVector(
                map(n, 0, 1, -0.1, 0.1),
                0
            )
    
            this.dir.add(bend).normalize()
    
            // damit Äste eher nach oben wachsen
            let biasStrength = 0.01
            this.dir.lerp(createVector(0, -1), biasStrength)
            this.dir.normalize()
    
            // Neue Position
            let newPos = p5.Vector.add(this.pos, p5.Vector.mult(this.dir, step))
            this.pos = newPos
    
            let w = this.thickness * (1 - 0.002 * this.age * random(0.9, 1.1))
            w = max(w, this.thickness * 0.7)
    
            this.points.push({
                pos: this.pos.copy(),
                w: w
            })
    
            // Zufällig ein Blatt anlegen (nur bei jüngeren Zweigen)
            if (this.depth >= 1 && this.depth <= 3) {
                if (random() < 0.002) {
                    this.addLeaf()
                }
            }
    
            // Blatt-Wachstum (Größe)
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
            }
    
            this.trySplit()
        }
    
        // ---------------------------------
        // 2. Blatt-Physik (IMMER ausführen)
        // ---------------------------------
        for (let leaf of this.leaves) {
    
            // Wenn Herbst begonnen hat → Blatt loslassen
            if (allFinished && !leaf.falling) {
                let t = frameCount - finishFrame
    
                if (t > leaf.fallDelay) {
                    leaf.falling = true
    
                    // kleine Startbewegung
                    leaf.vel = createVector(
                        random(-0.3, 0.3),
                        random(0.5, 1.5)
                    )
                }
            }
    
            // Wenn Blatt fällt → Physik anwenden
            if (leaf.falling) {
    
                // Schwerkraft
                leaf.vel.y += 0.05
    
                // leichter Wind
                leaf.vel.x += random(-0.02, 0.02)
    
                // Position updaten
                leaf.pos.add(leaf.vel)
            }
        }
    
        // ---------------------------------
        // 3. Gefallene Blätter entfernen
        // ---------------------------------
        this.leaves = this.leaves.filter(leaf => leaf.pos.y < height + 100)
    }
    

    trySplit() {
        if (this.depth >= 4) return
        if (this.hasSplit) return
        if (this.age - this.lastSplitAge < 60) return

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
    
        // Farb-Logik (wie vorher)
        let ageRatio = constrain(this.age / this.maxAge, 0, 1)
    
        let youngColor = this.baseColor
        let oldColor = color(50, 0, 100)
        let currentColor = lerpColor(youngColor, oldColor, ageRatio)
    
        if (allFinished) {
            let t = constrain((frameCount - finishFrame) / 200, 0, 1)
            currentColor = lerpColor(currentColor, finalColor, t)
        }
    
        stroke(currentColor)
        noFill()
    
        // WICHTIG: alle Segmente neu zeichnen
        for (let i = 0; i < this.points.length - 1; i++) {
            let a = this.points[i]
            let b = this.points[i + 1]
    
            strokeWeight(a.w)
            line(a.pos.x, a.pos.y, b.pos.x, b.pos.y)
        }
    
        for (let leaf of this.leaves) {
            // nur zeichnen, wenn noch im Bild
            if (leaf.pos.y < height + 50) {
                drawLeaf2D(leaf)
            }
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
            dir: this.dir.copy(),
            autumnColor: color(
                random(120, 180),
                random(60, 120),
                0
            ),
            falling: false,
            vel: createVector(0, 0),
            fallDelay: int(random(0, 120)) 
        })
    }

}
