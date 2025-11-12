var font
var vehicles = []
var innerGraphic;

function preload() {
    font = loadFont("./assets/Bellota/Bellota-Regular.ttf")
}

function setup() {
    createCanvas(800, 300)
    colorMode(HSB, 360, 255, 255, 255);
    background(50)

    var points = font.textToPoints('WHISPER', 30, 200, 170)

    for (var i = 0; i < points.length; i++) {
        var pt = points[i]
        var vehicle = new Vehicle(pt.x, pt.y)
        vehicles.push(vehicle)
    }

    innerGraphic = createGraphics(width, height);
    innerGraphic.textFont(font);
    innerGraphic.textSize(170);
    innerGraphic.text('WHISPER', 30, 200);
    innerGraphic.loadPixels();

    for (let i = 0; i < 10000; i++) {
        let x = random(width);
        let y = random(height);
        let index = (int(x) + int(y) * width) * 4;
        if (innerGraphic.pixels[index + 3] > 128) {  // Pixel im Textbereich
            vehicles.push(new Vehicle(x, y));
        }
    }
}

function draw() {
    background(50, 50, 70, 30)

    blendMode(ADD)

    for (var i = 0; i < vehicles.length; i++) {
        var v = vehicles[i]
        let offset = p5.Vector.random2D().mult(0.5)
        v.behaviors(v.target.copy().add(offset))
        v.update()
        v.show()
    }

    blendMode(BLEND)
}