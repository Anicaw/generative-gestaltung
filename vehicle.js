function Vehicle(x, y) {
    this.pos = createVector(random(width), random(height))
    this.target = createVector(x, y)
    this.vel = createVector()
    this.acc = createVector()
    this.r = 8
    this.maxspeed = 10
    this.maxforce = 1
    this.alpha = 255
}

Vehicle.prototype.behaviors = function (tempTarget) {
    var target = tempTarget || this.target
    var arrive = this.arrive(target)
    var mouse = createVector(mouseX, mouseY)
    var flee = this.flee(mouse)

    arrive.mult(1)
    flee.mult(5)
    this.applyForce(arrive)

    this.applyForce(flee)
}

Vehicle.prototype.applyForce = function (f) {
    this.acc.add(f)
}

Vehicle.prototype.update = function () {
    let n = noise(this.pos.x * 0.005, this.pos.y * 0.005, frameCount * 0.002)
    let angle = map(n, 0, 1, -3, 5)
    let wind = p5.Vector.fromAngle(angle).mult(0.8)
    this. applyForce(wind)

    this.pos.add(this.vel)
    this.vel.add(this.acc)
    this.acc.mult(0)

    let d = p5.Vector.dist(this.pos, this.target)
    this.alpha = map(d, 0, 200, 255, 0, true) //true
    
    let breathing = sin(frameCount * 0.01) * 0.5 + 0.5
    this.alpha *= breathing
}

Vehicle.prototype.show = function () {
    stroke(180, 220, 255, 180)
    strokeWeight(4)
    point(this.pos.x, this.pos.y)

    stroke(180, 220, 255, this.alpha * 0.2)
    strokeWeight(10)
    point(this.pos.x, this.pos.y)
}

Vehicle.prototype.arrive = function (target) {
    var desired = p5.Vector.sub(target, this.pos)
    d = desired.mag()
    var speed = this.maxspeed
    if (d < 100) {
        var speed = map(d, 0, 100, 0, this.maxspeed)
    }
    desired.setMag(speed)
    var steer = p5.Vector.sub(desired, this.vel)
    steer.limit(this.maxforce)
    return steer
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