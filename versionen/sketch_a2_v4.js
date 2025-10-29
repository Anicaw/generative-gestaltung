var inc = 0.1;
var scl = 20;
var cols, rows

var zoff = 0;

var fr;

// var particles = []
var particlesLayers = []

var flowfield = []
var flowfieldGhost = []

let fade = 0
let framesToFade = 400
let fadeDirection = "up"
let firstArray = false
let reset = false

let roundRobinCounter = 0
let robinFrames = 1000

let zCounter = 0

let ghost = []
// Anzahl der Geister
let amountGhosts = 10


let trees = []
let treePos = []
let numTrees = 50

//images
let ghostImg
let pineTree
let bgForest
let pin
let bgGhost
// sounds
let soundBgGhosts
let soundCatchGhost
let soundForest
let soundBalloon
let soundBirds
function preload() {
    bgForest = loadImage('./images/Frame1.png');
    ghostImg = loadImage('./images/real_ghost.png')
    pineTree = loadImage('./images/pine_tree.png')
    bgGhost = loadImage('./images/bgGhost.png')
    soundForest = loadSound("./assets/spooky-wind.mp3")
    soundBgGhosts = loadSound("./assets/ghost-bg.mp3")
    soundCatchGhost = loadSound("./assets/balloon-pop.mp3")
    // soundCatchGhost = loadSound("./assets/ghost-sound.mp3")
    soundBirds = loadSound("./assets/birds.mp3")
}


function setup() {
    // createCanvas(800, 600)
    createCanvas(windowWidth, windowHeight)

    for (let i = 0; i < numTrees; i++) {
        let x = random(0, 800);
        let y = random(50, 300);
        treePos.push({ x: x, y: y });
    }

    for (var i = 0; i < numTrees; i++) {
        trees[i] = new Tree(random(0, windowWidth), random(50, 300), zCounter)
        zCounter++
    }

    cols = floor(width / scl);
    rows = floor(height / scl);
    // fr = createP('')

    flowfield = new Array(cols * rows)
    flowfieldGhost = new Array(cols * rows)

    for (var i = 0; i < amountGhosts; i++) {
        ghost[i] = new Ghost(zCounter)
        zCounter++
    }

    fillObjectArrays()
    shuffleArray(allObjects)
    console.log("All Objects: ", allObjects

    )
    createParticlesArray()
    // blendMode(BLEND);
    // image(bgWald, 0, 0, width, height);
}


let allObjects = []
function fillObjectArrays() {
    trees.forEach((obj) => {
        allObjects.push(obj)
    })
    ghost.forEach((obj) => {
        allObjects.push(obj)
    })
    allObjects.sort((a, b) => a.z - b.z);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// var currentLayer = []
// function executeRoundRobin() {
//     if (roundRobinCounter == 0) {
//         const randomLayer = particlesLayers[Math.floor(Math.random() * particlesLayers.length)]
//         currentLayer = randomLayer
//         roundRobinCounter = robinFrames
//         console.log("current Layer", currentLayer)
//     }
//     if (currentLayer.length == 0) {
//         fillParticlesArray(currentLayer)
//     }
//     drawParticles(currentLayer)
//     roundRobinCounter--
// }

// function updateLine(particle) {
//     particle.follow(flowfield)
//     particle.update();
//     particle.edges()
//     particle.show();
// }

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
    for (var i = 0; i < 10; i++) {
        array[i] = new Particle();
    }
}

// function resetImg() {
//     if (fadeDirection == "down") {
//         blendMode(BLEND);
//         tint(255, 255 - fade)
//         image(fgWald, 0, 0, width, height);
//         createParticlesArray()
//         executeRoundRobin()
//         // reset = false
//     }
// }

function updateFade() {
    switch (fadeDirection) {
        case "up": {
            if (fade < framesToFade) {
                fade += 3;
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
                fade -= 3;
            } else {
                console.log("up")
                fadeDirection = "up"
                reset = false
            }
            break
        }
    }
}

var yoff = 0
function createFog() {
    for (var y = 0; y < rows; y++) {
        var xoff = 0
        for (var x = 0; x < cols; x++) {
            var index = (x + y * cols)
            var angle = noise(xoff, yoff, zoff) * TWO_PI
            var v = p5.Vector.fromAngle(angle)
            v.setMag(0.08)
            flowfield[index] = v
            xoff += inc
        }
        yoff += inc
        zoff += 0.001
    }
}

var yoffGhost = 0
function createGhosts() {
    for (var y = 0; y < rows; y++) {
        var xoffGhost = 0
        for (var x = 0; x < cols; x++) {
            var index = (x + y * cols)
            var angle = noise(xoffGhost, yoffGhost, zoff) * TWO_PI * 4
            var v = p5.Vector.fromAngle(angle)
            v.setMag(0.1)
            flowfieldGhost[index] = v
            xoffGhost += inc
        }
        yoff += inc
        zoff += 0.001
    }
}

function drawObjects(flowfieldGhost) {
    for (var i = 0; i < allObjects.length; i++) {
        allObjects[i].drawObj(flowfieldGhost)
    }
}
let started = false
function mousePressed() {
    if (!started) {
        startGame()
    }
    if (isEndGame()) {
        window.location.reload()
    }
    for (var i = 0; i < ghost.length; i++) {
        if (ghost[i].clicked(mouseX, mouseY)) {
            soundCatchGhost.play()
            ghost.splice(i, 1)
            if (isEndGame()) {
                endGame()
            }
        }
    }
    console.log("Started: ", started)
}

function endGame() {
    soundForest.stop()
    soundBgGhosts.stop()
    soundBirds.loop()
}

function startGame() {
    started = true
    soundForest.loop();
    soundBgGhosts.loop()
}

function startScreen() {
    drawBgImage(bgGhost)
    fill('white')
    textSize(30)
    text('Klicke, um zu starten', windowWidth/2, windowHeight/2);
}

var fadeBg = 0
function endScreen() {
    if (fadeBg < 255) {
        tint(255, fadeBg)
        drawBgImage(bgGhost)
        fadeBg += 0.5
    }
    fill('white')
    textSize(20)
    const endText = "Du hast alle Geister im Wald erwischt! Klicke, um erneut auf Geisterjagd zu gehen"
    text(endText, windowWidth / 2 - 150, 500, 400, 200);
}

function isEndGame() {
    return ghost.length === 0
}

function gameScreen() {
    drawBgImage(bgForest)



    createFog()
    createGhosts()
    drawObjects(flowfieldGhost)

    blendMode(SCREEN);
    // updateFade()
    // if (reset) { resetImg() }

    blendMode(BLEND);
    // executeRoundRobin()
}


// Code von ChatGPT
function drawBgImage(img) {
    let imgAspect = img.width / img.height;
    let canvasAspect = width / height;
    let drawWidth, drawHeight;

    if (canvasAspect > imgAspect) {
        // Canvas breiter → an Breite anpassen (höher abschneiden)
        drawWidth = width;
        drawHeight = width / imgAspect;
    } else {
        // Canvas höher → an Höhe anpassen (seitlich abschneiden)
        drawHeight = height;
        drawWidth = height * imgAspect;
    }

    // Zentrieren
    let x = (width - drawWidth) / 2;
    let y = (height - drawHeight) / 2;

    image(img, x, y, drawWidth, drawHeight);
}

function draw() {
    if (!started) {
        startScreen()
    } else {
        if (isEndGame()) {
            endScreen()
        } else {
            gameScreen()
        }
    }
    // fr.html(floor(frameRate()))
}