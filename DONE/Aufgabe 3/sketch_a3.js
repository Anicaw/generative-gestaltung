var inc = 0.1;
var scl = 20;
var cols, rows
var zoff = 0;

var font
var fontSize = 150
var vehicles = []
var innerGraphic;

let ghosts = []
let ghostImg
// Anzahl der Geister
let amountGhosts = 5

let ghostLayer
let particleLayer

let soundWhisper

function preload() {
    font = loadFont("./assets/Shadows/ShadowsIntoLightTwo-Regular.ttf")
    ghostImg = loadImage('./images/ghost_lila.png')
    soundWhisper = loadSound('./sounds/whisper.mp3')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    // soundWhisper.loop()
    ghostLayer = createGraphics(width, height)
    particleLayer = createGraphics(width, height)

    ghostLayer.colorMode(HSB, 360, 255, 255, 255)
    particleLayer.colorMode(HSB, 360, 255, 255, 255);

    cols = floor(width / scl);
    rows = floor(height / scl);
    flowfieldGhost = new Array(cols * rows)

    // fügt Geister in Array ghosts[]
    for (var i = 0; i < amountGhosts; i++) {
        ghosts[i] = new Ghost(1)
    }

    innerGraphic = createGraphics(width, height);
    innerGraphic.textFont(font);
    innerGraphic.textSize(fontSize);

    innerGraphic.text('WHISPER', 30, 150);
    innerGraphic.loadPixels();

    // um Particel innerhalb der Schrift zu haben und nicht nur außen,
    // prüft, ob innerhalb der Schrift schon ein Partikel ist, wenn nicht, füge dort eins hinzu
    for (let i = 0; i < 40000; i++) {
        let x = random(width);
        let y = random(height);
        let index = (int(x) + int(y) * width) * 4;
        if (innerGraphic.pixels[index + 3] > 100) {
            vehicles.push(new Vehicle(x, y));
        }
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
            v.setMag(0.3)
            flowfieldGhost[index] = v
            xoffGhost += inc
        }
        yoffGhost += inc
        zoff += 0.0001
    }
}


function startScreen() {
    background(0)
    fill('white')
    textFont("Eater")
    textSize(30)
    text('Klicke, um zu starten', windowWidth / 2 - 50, 90);
}

let started = false
function mousePressed(){
    started = true
    if(!soundWhisper.isPlaying()){
        soundWhisper.loop()
    }
}

function draw() {
    if(!started){
        startScreen()
    } else {
        particleLayer.background(50, 20, 70, 10)
        ghostLayer.clear()
    
        for (var i = 0; i < vehicles.length; i++) {
            var v = vehicles[i]
            let offset = p5.Vector.random2D().mult(0.5)
            v.behaviors(v.target.copy().add(offset))
            v.update()
            v.show(particleLayer)
        }
    
        for (let g of ghosts) {
            g.follow(flowfieldGhost);
            g.update();
            g.edges()
            g.show(ghostLayer);
        }
    
        image(particleLayer, 0, 0)
        // Geister durchsichtig
        tint(255, 50)
        image(ghostLayer, 0, 0)
        noTint()
    }
}