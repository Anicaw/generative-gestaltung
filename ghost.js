
function Ghost(z) {
    this.pos = createVector(random(width), random(height))
    this.vel = p5.Vector.random2D()
    // this.vel = createVector(0, 0)
    this.acc = createVector(0, 0)
    this.maxspeed = 50
    this.z = z

    this.ghostSize = 50

    this.update = function() {
        this.vel.add(this.acc)
        this.vel.limit(this.maxspeed)
        this.pos.add(this.vel)
        this.acc.mult(0)
    }

    this.applyForce = function(force){
        this.acc.add(force)
    }

    this.show = function() {
        push()
        noStroke()
        image(ghostImg, this.pos.x, this.pos.y, this.ghostSize, this.ghostSize)
        pop()
    }

    this.edges = function() {
        if(this.pos.x > width - this.ghostSize/2) {
            this.pos.x = width - this.ghostSize/2
            this.vel.x *= -1
        } else if(this.pos.x < this.ghostSize/2) {
            this.pos.x = this.ghostSize/2
            this.vel.x *= -1
        }
        if(this.pos.y > height - this.ghostSize/2) {
            this.pos.y = height - this.ghostSize/2
            this.vel.y *= -1
        } else if(this.pos.y < this.ghostSize/2){
            this.pos.y = this.ghostSize/2
            this.vel.y *= -1
        }
    }

    this.follow = function(vectors) {
        var x = floor(this.pos.x / scl)
        var y = floor(this.pos.y / scl)
        var index = x + y * cols
        var force = vectors[index]
        if (force) this.applyForce(force)
    }

    this.drawObj = function(flowfieldGhost) {
        this.follow(flowfieldGhost)
        this.update()
        this.show()
        this.edges()
    }

    // wenn auf Geist geklickt wurde, return true
    this.clicked = function(mouseX, mouseY){
        var d = dist(mouseX, mouseY, this.pos.x, this.pos.y)
        if(d < this.ghostSize){
            this.ghostSize = 0.1
            return true
        }
    }
} 