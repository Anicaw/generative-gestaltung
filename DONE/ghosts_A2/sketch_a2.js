var inc = 0.1;
var scl = 20;
var cols, rows

var zoff = 0;

var fr;

var particles = []
var particlesLayers = []

var flowfield = []
var flowfieldGhost = []

let firstArray = false
let reset = false

let zCounter = 0

let ghost = []
// Anzahl der Geister
let amountGhosts = 10

let trees = []
let treePos = []
// Anzahl der Bäume
let numTrees = 20

//images
let bgForest
let ghostImg
let pineTree
let bgGhost
let bgFriendly
// sounds
let soundForest
let soundBgGhosts
let soundCatchGhost
let soundBirds

function preload() {
    bgForest = loadImage('./images/Frame1.png');
    ghostImg = loadImage('./images/real_ghost.png')
    pineTree = loadImage('./images/pine_tree.png')
    bgGhost = loadImage('./images/bgGhost.png')
    bgFriendly = loadImage('./images/friendly_bg.png')
    soundForest = loadSound("./sounds/spooky-wind.mp3")
    soundBgGhosts = loadSound("./sounds/ghost-bg.mp3")
    soundCatchGhost = loadSound("./sounds/balloon-pop.mp3")
    soundBirds = loadSound("./sounds/birds.mp3")
}


function setup() {
    createCanvas(windowWidth, windowHeight)

    // fügt Bäume mit zufälliger Position in Array trees[]
    for (var i = 0; i < numTrees; i++) {
        trees[i] = new Tree(random(0, windowWidth), random(50, 300), zCounter)
        zCounter++
    }

    cols = floor(width / scl);
    rows = floor(height / scl);
    // fr = createP('')

    flowfield = new Array(cols * rows)
    flowfieldGhost = new Array(cols * rows)

    // fügt Geister in Array ghost[]
    for (var i = 0; i < amountGhosts; i++) {
        ghost[i] = new Ghost(zCounter)
        zCounter++
    }

    // 
    fillObjectArrays()
    shuffleArray(allObjects)
    createParticlesArray()
}

// fügt alle Objekte (Bäume, Geister) in ein gemeinsames Array
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

// mischt Array von Objekten, um später die Reihenfolge der Objekte zu bestimmen ("z-index")
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// malt den Nebel
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
    for (var i = 0; i < 10; i++) {
        array[i] = new Particle();
    }
}

// um zu bestimmen, wie sich der Nebel verhält
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

// um zu bestimmen, wie sich die Geister verhalten
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

// wenn geklickt wird, startet das Spiel
// wenn Maus auf Geist gedrückt wird, wird er aus Array ghost[] entfernt
// wenn Array ghost[] leer ist, ist Spiel zu ende
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

// Spooky Töne werden gestoppt und freundlicher Ton wird gestartet
function endGame() {
    soundForest.stop()
    soundBgGhosts.stop()
    soundBirds.loop()
}

// Spooky Sounds werden abgespielt
function startGame() {
    started = true
    soundForest.loop();
    soundBgGhosts.loop()
}

function startScreen() {
    drawBgImage(bgGhost)
    fill('white')
    textFont("Eater")
    textSize(30)
    text('Klicke, um zu starten', windowWidth / 2 - 50, 90);
}

// Endbild wird nach Spiel eingefaded
var fadeBg = 0
function endScreen() {
    if (fadeBg < 255) {
        tint(255, fadeBg)
        drawBgImage(bgFriendly)
        fadeBg += 0.5
    }
    fill('black')
    textSize(30)
    textFont("Shadows Into Light Two")
    const endText = "Du hast alle Geister im Wald erwischt! Klicke, um erneut auf Geisterjagd zu gehen"
    text(endText, windowWidth / 2 - 150, 70, 400, 200);
}

// Spiel ist zu Ende, wenn ghost[] leer ist
function isEndGame() {
    return ghost.length === 0
}

// Enthält alle Elemente, die während des Spiels sichtbar sind
function gameScreen() {
    drawBgImage(bgForest)
    createFog()
    createGhosts()
    drawObjects(flowfieldGhost)
    blendMode(BLEND);
}

// damit Bilder nicht verzerrt dargestellt werden
// START Code von ChatGPT
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
// ENDE Code von ChatGPT

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