// let mover

// function setup() {
//     createCanvas(400, 400)
//     mover = new Mover(200, 200)
// }

// function draw() {
//     background(0)

//     if(mouseIsPressed){
//         let wind = createVector(0.1, 0)
//         mover.applyForce(wind)
//     }

//     let gravity = createVector(0, 0.2)
//     mover.applyForce(gravity)

//     mover.update()
//     mover.edges()
//     mover.show()
// }

var font
var vehicles = []

function preload(){
    font= loadFont("./assets/Bellota/Bellota-Regular.ttf")
}

function setup() {
    createCanvas(800, 300)
    background(50)

    var points = font.textToPoints('HALLO', 30, 200, 170)

    for(var i = 0; i < points.length; i++){
        var pt = points[i]
        var vehicle = new Vehicle(pt.x, pt.y)
        vehicles.push(vehicle)
    }
}

function draw(){
    background(51)
    for(var i = 0; i < vehicles.length; i++){
        var v = vehicles[i]
        v.behaviors()
        v.update()
        v.show()
    }
}