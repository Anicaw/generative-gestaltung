// var particles = []
var fireworks = []
var gravity
var letterPoints = []



function setup(){
    createCanvas(400, 400)
    colorMode(HSB)

    letterPoints = createTextPoints("BOO")
    
    gravity = createVector(0, 0.2) // Partikel geht wieder nach unten
    // stroke(255)
    strokeWeight(4)
    background(0)
}

function createTextPoints(word){
    let pg = createGraphics(400, 200)
    pg.pixelDensity(1)
    pg.textSize(120)
    pg.textFont("ShadowsIntoLightTwo-Regular")
    pg.background(0)
    pg.fill(255)
    pg.text(word, 20, 125)
    pg.loadPixels()

    let points = []
    for(let x = 0; x < pg.width; x += 4) {
        for(let y = 0; y < pg.height; y += 4){
            let index = (x + y * pg.width) * 4
            if(pg.pixels[index + 3] > 100){
                points.push(createVector(x, y))
            }
        }
    }
    return points
}

function draw() {
    colorMode(RGB)
    background(0, 25)
    if(random(1) < 0.03){
        fireworks.push(new Firework())
    }
    for(var i = fireworks.length-1; i >= 0; i--){
        fireworks[i].update()
        fireworks[i]. show()
        if(fireworks[i].done()){
            fireworks.splice(i, 1)
        }
    }
    

    // for (let i = 0; i < 5; i++){
    //     particles.push(new Particel(200, 20))
    // }

    // for(let particle of particles){
    //     let gravity = createVector(0, 0.2)
    //     particle.applyForce(gravity)
    //     particle.update()
    //     particle.edges()
    //     particle.show()
    // }

    // for (let i = particles.length-1; i >= 0; i--) {
    //     if (particles[i].finished()){
    //         particles.splice(i, 1)
    //     }
    // }
}