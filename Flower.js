export class Flower {
    constructor(pos, size = 10, colorHue = 340) {
        this.pos = pos.copy()
        this.size = size
        this.colorHue = colorHue
    }

    display() {
        push()
        translate(this.pos.x, this.pos.y, this.pos.z)
        noStroke()
        colorMode(HSB, 360, 100, 100)
        fill(this.colorHue, 80, 90)
        sphere(this.size) // einfache runde Blüte
        pop()
    }
}
