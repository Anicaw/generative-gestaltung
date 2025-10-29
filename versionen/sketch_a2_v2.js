var inc = 0.1;
var scl = 20;
var cols, rows

var zoff = 0;

var fr;

// var particles = []
var particlesLayers = []

var flowfield = []

let fade = 0
let framesToFade= 400
let fadeDirection = "up"
let firstArray = false
let reset = false

let roundRobinCounter = 0
let robinFrames = 1000

let ghost

let bgWald
let fgWald
let ghostImg
function preload() {
    bgWald = loadImage('./images/wald.jpg');
    fgWald = loadImage('./images/wald.jpg');
    ghostImg = loadImage('./images/balloon.png')
}


function setup() {
    createCanvas(800, 600)
    cols = floor(width / scl);
    rows = floor(height / scl);
    fr = createP('')

    flowfield = new Array(cols * rows)
    ghost = new Ghost()

    createParticlesArray()
    // blendMode(BLEND);
    image(bgWald, 0, 0, width, height);
}

var currentLayer = []

function executeRoundRobin() {
    if (roundRobinCounter == 0) {
        const randomLayer = particlesLayers[Math.floor(Math.random() * particlesLayers.length)]
        currentLayer = randomLayer
        roundRobinCounter = robinFrames
        console.log("current Layer", currentLayer)
    }
    // console.log("Counter ", roundRobinCounter)
    if (currentLayer.length == 0) {
        fillParticlesArray(currentLayer)
    }
    drawParticles(currentLayer)
    roundRobinCounter--
}



function updateLine(particle) {
    particle.follow(flowfield)
    particle.update();
    particle.edges()
    particle.show();
}

function drawParticles(particles) {
    for (var i = 0; i < particles.length; i++) {
        if (particles[i].incrementLifetime()) {
            updateLine(particles[i])
        } else {
            particles.splice(i, 1)
        }
    }
}

function createParticlesArray() {
    if (particlesLayers.length < 2) {
        const newArray = []
        fillParticlesArray(newArray)
        particlesLayers.push(newArray)
    }

}

function fillParticlesArray(array) {
    for (var i = 0; i < 1000; i++) {
        array[i] = new Particle();
    }
}

function resetImg() {
    if (fadeDirection == "down") {
        blendMode(BLEND);
        console.log("fade ",fade)
        tint(255, 255 - fade)
        image(fgWald, 0, 0, width, height);
        createParticlesArray()
        executeRoundRobin()
        // reset = false
    } 
    // else {
    //     if (fade < 1 && firstArray
    //     ) {
    //         console.log("fill array")
    //     }
    // }
    

}

function updateFade() {
    switch (fadeDirection) {
        case "up": {
            if (fade < framesToFade) {
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
                reset = false
            }
            break
        }

    }
}

function draw() {
    var yoff = 0
    // loadPixels()
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
        zoff += 0.001
    }

    blendMode(SCREEN);
    updateFade()
    if (reset) { resetImg() }

    // console.log(particlesLayers)


    blendMode(BLEND);
    executeRoundRobin()

    // blendMode(MULTIPLY)
    ghost.follow(flowfield)
    ghost.update()
    ghost.edges()
    ghost.show()

    fr.html(floor(frameRate()))


}