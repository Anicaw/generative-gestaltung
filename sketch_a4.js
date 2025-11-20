// var particles = []
// var fireworks = []
// var gravity
// var letterPoints = []


// function setup() {
//     createCanvas(400, 400)
//     colorMode(HSB)

//     letterPoints = createTextPoints("BOO")

//     gravity = createVector(0, 0.2) // Partikel geht wieder nach unten
//     stroke(255)
//     strokeWeight(4)
//     background(0)
// }

// function createTextPoints(word) {
//     let pg = createGraphics(400, 200)
//     pg.pixelDensity(1)
//     pg.textSize(120)
//     pg.textFont("ShadowsIntoLightTwo-Regular")
//     pg.background(0)
//     pg.fill(255)
//     pg.text(word, 20, 125)
//     pg.loadPixels()
//     let points = []

//     for (let x = 0; x < pg.width; x += 4) {
//         for (let y = 0; y < pg.height; y += 4) {
//             let index = (x + y * pg.width) * 4
//             if (pg.pixels[index + 3] > 100) {
//                 points.push(createVector(x, y))
//             }
//         }
//     } return points
// }

// function draw() {
//     colorMode(RGB)
//     background(0, 25)
//     if (random(1) < 0.03) {
//         fireworks.push(new Firework())
//     }
//     for (var i = fireworks.length - 1; i >= 0; i--) {
//         fireworks[i].update()
//         fireworks[i].show()
//         if (fireworks[i].done()) {
//             fireworks.splice(i, 1)
//         }
//     }
// }


var fireworks = [];
var gravity;
var font;
var wordPoints = [];
var words = [];

function preload(){
    font = loadFont("./assets/Shadows/ShadowsIntoLightTwo-Regular.ttf");
}

function setup(){
    createCanvas(400, 400);
    colorMode(HSB);
    gravity = createVector(0, 0.2);
    strokeWeight(4);
    background(0);
}

function prepareWordPoints(word, explosionX, explosionY, fontSize){
    let points = font.textToPoints(word, 0, 0, fontSize, {
        sampleFactor: 0.2,
        simplifyThreshold: 0
    });
    // damit Wort mittig von explodierenden Partikel ist
    wordPoints = points.map(pt => {
        let bounds = font.textBounds(word, 0, 0, fontSize);
        return createVector(
            pt.x - bounds.w/2 + explosionX,
            pt.y - bounds.h/2 + explosionY
        );
    });
}

function draw() {
    colorMode(RGB)
    background(0, 25);

    // Fireworks erzeugen
    if(random(1) < 0.03){
        fireworks.push(new Firework());
    }

    // Fireworks updaten und anzeigen
    for(let i = fireworks.length-1; i >= 0; i--){
        fireworks[i].update();
        fireworks[i].show();
        if(fireworks[i].done()){
            fireworks.splice(i, 1);
        }
    }
}
