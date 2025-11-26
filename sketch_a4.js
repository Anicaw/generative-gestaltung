var fireworks = []
var gravity
var font
var wordPoints = []
var words = []
var glitters = []

function preload(){
    font = loadFont("./assets/Shadows/ShadowsIntoLightTwo-Regular.ttf");
}

function setup(){
    createCanvas(windowWidth, windowHeight);
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

//     for (let i = glitters.length - 1; i >= 0; i--){
//         glitters[i].update()
//         glitters[i].show()
//         if (glitters[i].done()){
//             glitters.splice(i, 1)
//         }
//     }
}
