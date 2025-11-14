var inc = 0.1;
var scl = 20;
var cols, rows
var zoff = 0;
var yoff = 0;

var font
var vehicles = []
var innerGraphic;

let ghosts = []
let ghostImg
// Anzahl der Geister
let amountGhosts = 3

let ghostLayer
let particleLayer

let soundWhisper

function preload() {
    font = loadFont("./assets/Bellota/Bellota-Regular.ttf")
    font = loadFont("./assets/Shadows/ShadowsIntoLightTwo-Regular.ttf")
    ghostImg = loadImage('./images/real_ghost.png')
    soundWhisper = loadSound('./sounds/whisper.mp3')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    soundWhisper.loop()
    ghostLayer = createGraphics(width, height)
    particleLayer = createGraphics(width, height)
    
    ghostLayer.colorMode(HSB, 360, 255, 255, 255)
    particleLayer.colorMode(HSB, 360, 255, 255, 255);
    background(50)

    cols = floor(width / scl);
    rows = floor(height / scl);
    flowfieldGhost = new Array(cols * rows)

    // fügt Geister in Array ghost[]
    for (var i = 0; i < amountGhosts; i++) {
        ghosts[i] = new Ghost(1)
    }

    // createGhosts()

    // var points = font.textToPoints('WHISPER', 30, 200, 170)

    // for (var i = 0; i < points.length; i++) {
    //     var pt = points[i]
    //     var vehicle = new Vehicle(pt.x, pt.y)
    //     vehicles.push(vehicle)
    // }

    innerGraphic = createGraphics(width, height);
    innerGraphic.textFont(font);
    innerGraphic.textSize(170);
    
    innerGraphic.text('WHISPER', 30, 200);
    innerGraphic.loadPixels();

    for (let i = 0; i < 40000; i++) {
        let x = random(width);
        let y = random(height);
        let index = (int(x) + int(y) * width) * 4;
        if (innerGraphic.pixels[index + 3] > 128) {  // Pixel im Textbereich
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
            v.setMag(0.1)
            flowfieldGhost[index] = v
            xoffGhost += inc
        }
        yoffGhost += inc
        zoff += 0.0001
    }
}

function drawGhosts(flowfieldGhost){
    for (var i = 0; i < allObjects.length; i++) {
        allObjects[i].drawObj(flowfieldGhost)
    }
}

function draw() {
    particleLayer.background(50, 20, 70, 25)
    ghostLayer.clear()
    // particleLayer.blendMode(ADD)

    for (var i = 0; i < vehicles.length; i++) {
        var v = vehicles[i]
        let offset = p5.Vector.random2D().mult(0.5)
        v.behaviors(v.target.copy().add(offset))
        v.update()
        v.show(particleLayer)
    }
    createGhosts()

    // ghostLayer.blendMode(ADD)
    
    for (let g of ghosts) {
        g.follow(flowfieldGhost);
        g.update();
        g.edges()
        g.show(ghostLayer);
    }


    image(particleLayer, 0, 0)
    image(ghostLayer, 0, 0)
}