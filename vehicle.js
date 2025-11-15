function Vehicle(x, y) {
    // Partikel fliegen von allen Seiten rein
    let startSide = floor(random(4));
    switch (startSide){
        case 0: this.pos = createVector(random(width), 0)
        break
        case 1: this.pos = createVector(random(width), height)
        break
        case 2: this.pos = createVector(0, random(height))
        break
        case 3: this.pos = createVector(width, random(height))
        break
    }
    this.target = createVector(x, y)
    this.vel = createVector()
    this.acc = createVector()
    // this.r = 8
    this.maxspeed = 3
    this.maxforce = 1.8
    // this.alpha = 10
}

Vehicle.prototype.behaviors = function () {
    var arrive = this.arrive(this.target)
    var mouse = createVector(mouseX, mouseY)
    var flee = this.flee(mouse)
    
    arrive.mult(1)
    flee.mult(5)
    this.applyForce(arrive)
    this.applyForce(flee)

    // Partikel werden von Geist angezogen
    for(let g of ghosts){
        var attract = this.attract(g.pos)
        this.applyForce(attract)
    } 
}

Vehicle.prototype.applyForce = function (f) {
    this.acc.add(f)
}

Vehicle.prototype.update = function () {
    // um Partikel "schweben" zu lassen --> nicht fest auf einer Position
    let n = noise(this.pos.x * 0.005, this.pos.y * 0.005, frameCount * 0.002)
    let angle = map(n, 0, 1, -3, 5)
    let wind = p5.Vector.fromAngle(angle).mult(0.8)
    this.applyForce(wind)

    this.vel.add(this.acc)
    this.pos.add(this.vel)
    this.acc.mult(0)

    // Partikel werden sichtbarer, je näher sie an ihrer Zielposition (dem Wort) sind
    let d = p5.Vector.dist(this.pos, this.target)
    this.alpha = map(d, 0, 500, 255, 5, true)

}

Vehicle.prototype.show = function (layer) {
    // leichter Farbverlauf von Links nach Rechts
    let hue = map(this.pos.x, 0, width, 180, 240)

    // inneres Partikel
    layer.stroke(hue, 200, 255, this.alpha)
    layer.strokeWeight(5)
    layer.point(this.pos.x, this.pos.y)

    // äußeres Partikel
    layer.stroke(180, 220, 255, this.alpha * 0.1)
    layer.strokeWeight(13)
    layer.point(this.pos.x, this.pos.y)
}

// Funktion, damit Partikel nicht aprupt an Ziel ankommen
Vehicle.prototype.arrive = function (target) {
    var desired = p5.Vector.sub(target, this.pos)
    d = desired.mag()
    var speed = this.maxspeed
    if (d < 100) {
        speed = map(d, 0, 100, 0, this.maxspeed)
    }
    desired.setMag(speed)
    var steer = p5.Vector.sub(desired, this.vel)
    steer.limit(this.maxforce)
    return steer
}


// Funktion, damit Partikel von Geist angezogen wird
Vehicle.prototype.attract = function (target) {
    var desired = p5.Vector.sub(target, this.pos)
    var d = desired.mag()

    d = constrain(d, 10, 200)

    var strength = map(d, 1, 200, 1, 0)
    desired.setMag(strength)

    return desired
}

Vehicle.prototype.flee = function (target) {
    var desired = p5.Vector.sub(target, this.pos)
    var d = desired.mag()
    if (d < 50) {
        desired.setMag(this.maxspeed)
        desired.mult(-1)
        var steer = p5.Vector.sub(desired, this.vel)
        steer.limit(this.maxforce)
        return steer
    } else {
        return createVector(0, 0)
    }
}