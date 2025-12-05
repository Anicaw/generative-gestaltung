var fr = 0;

var fireworks = []
var gravity
var font
var wordPoints = []
var sparkles = []

var fireworkSound
var fireworkExplode

var nightImg

function preload() {
    font = loadFont("./assets/Shadows/ShadowsIntoLightTwo-Regular.ttf");
    nightImg = loadImage('./images/night.png')
    fireworkSound = loadSound('./sounds/firework-start.mp3')
    fireworkExplode = loadSound('./sounds/explosion.mp3')
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB);
    gravity = createVector(0, 0.2)

    // Hintergrundcanvas erstellen
    bg = createGraphics(width, height);
    bg.colorMode(RGB);
    drawBgImageOnce(bg);
}

// Funktion für das "Feuerwerk-Wort"
function prepareWordPoints(word, explosionX, explosionY, fontSize) {
    let points = font.textToPoints(word, 0, 0, fontSize, {
        sampleFactor: 0.2,
        simplifyThreshold: 0
    });
    // damit Wort mittig von explodierenden Partikel ist
    let bounds = font.textBounds(word, 0, 0, fontSize);
    wordPoints = points.map(pt => {
        return createVector(
            pt.x - bounds.w / 2 + explosionX,
            pt.y - bounds.h / 5 + explosionY
        );
    });
}

function startScreen() {
    background(0)
    fill('white')
    textFont("Eater")
    textSize(30)
    text('Klicke, um das Feuerwerk starten zu lassen!', windowWidth / 3.5, 200);
}

let started = false
function mousePressed() {
    started = true
}


// damit Bilder nicht verzerrt dargestellt werden
// START Code von ChatGPT
function drawBgImageOnce(g) {
    let imgAspect = nightImg.width / nightImg.height;
    let canvasAspect = width / height;
    let drawWidth, drawHeight;

    if (canvasAspect > imgAspect) {
        drawWidth = width;
        drawHeight = width / imgAspect;
    } else {
        drawHeight = height;
        drawWidth = height * imgAspect;
    }

    let x = 0;
    let y = height - drawHeight;

    g.push();
    g.tint(90, 50);
    g.image(nightImg, x, y, drawWidth, drawHeight);
    g.noTint();
    g.pop();
}
// ENDE Code von ChatGPT

// Funktion, um Feuerwerke und Funken upzudaten und anzuzeigen
function handleParticle(particle) {
    for (let i = particle.length - 1; i >= 0; i--) {
        particle[i].update();
        particle[i].show();
        if (particle[i].done()) {
            particle.splice(i, 1);
        }
    }
}

function draw() {
    if (!started) {
        startScreen()
    } else {
        colorMode(RGB)
        image(bg, 0, 0)
        background(0, 20);

        // Fireworks erzeugen
        if (random(1) < 0.03) {
            fireworks.push(new Firework());
        }

        handleParticle(fireworks)
        handleParticle(sparkles)

        // FPS messen und anzeigen
        fr = floor(getFrameRate());
        fill(255);
        noStroke();
        textSize(20);
        text("FPS: " + fr, 20, 40);
    }
}