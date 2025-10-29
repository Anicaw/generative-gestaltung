var inc = 0.1;
var scl = 10;
var cols, rows

var zoff = 0;

var fr;

var particles = []

var flowfield = []

let fade = 0
let fadeDirection = "up"
let firstArray = false
let reset = false

let bgWald
let fgWald
function preload() {
    bgWald = loadImage('./images/wald.jpg');
    fgWald = loadImage('./images/wald.jpg');
}


function setup() {
    createCanvas(800, 600)
    cols = floor(width / scl);
    rows = floor(height / scl);
    fr = createP('')

    flowfield = new Array(cols * rows)

    fillParticlesArray()
    blendMode(BLEND);
    image(bgWald, 0, 0, width, height);
}

function updateLine(particle) {
    particle.follow(flowfield)
    particle.update();
    particle.edges()
    particle.show();
}

function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
        if (particles[i].incrementLifetime()) {
            updateLine(particles[i])
        } else {
            // console.log(particles)
            particles.splice(i, 1)
        }
    }
}

function fillParticlesArray() {
    for (var i = 0; i < 1000; i++) {
        particles[i] = new Particle();
    }
}

function resetImg() {
    if (fadeDirection == "down") {
        blendMode(BLEND);
        tint(255, 255 - fade)
        image(fgWald, 0, 0, width, height);
    } else {
        if (fade < 5 && firstArray
        ) {
            console.log("fill array")
            fillParticlesArray()
        }
    }


}

function updateFade() {
    if (fade%4==0){console.log(fade)}
    switch (fadeDirection) {
        case "up": {
            if (fade < 255) {
                fade += 3; // change this to fade+=2, 3, etc to increase speed
            } else {
                console.log("down")
                reset = true
                firstArray = true

                fadeDirection = "down"

            }
            break
        }
        case "down": {
            if (fade > 0) {
                fade -= 3; // change this to fade+=2, 3, etc to increase speed
            } else {
                console.log("up")
                fadeDirection = "up"
            }
            break
        }

    }
}

function draw() {
    var yoff = 0
    loadPixels()
    for (var y = 0; y < rows; y++) {
        var xoff = 0
        for (var x = 0; x < cols; x++) {
            var index = (x + y * cols)
            var angle = noise(xoff, yoff, zoff) * TWO_PI
            var v = p5.Vector.fromAngle(angle)
            v.setMag(0.08)
            flowfield[index] = v
            xoff += inc
            stroke(0, 50)


        }
        yoff += inc

        zoff += 0.0001
    }

    blendMode(SCREEN);
    updateFade()
    if (reset) {
        resetImg()
    }
    drawParticles()



    fr.html(floor(frameRate()))

}