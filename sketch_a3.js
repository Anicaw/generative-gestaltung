var font
var vehicles = []

function preload(){
    font= loadFont("./assets/Bellota/Bellota-Regular.ttf")
}

function setup() {
    createCanvas(800, 300)
    background(50)

    var points = font.textToPoints('WHISPER', 30, 200, 170)

    for(var i = 0; i < points.length; i++){
        var pt = points[i]
        var vehicle = new Vehicle(pt.x, pt.y)
        vehicles.push(vehicle)
    }
}

function draw(){
    background(50, 50, 70, 30)
    for(var i = 0; i < vehicles.length; i++){
        var v = vehicles[i]
        let offset = p5.Vector.random2D().mult(0.5)
        v.behaviors(v.target.copy().add(offset))
        v.update()
        v.show()
    }
}